const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "extension/manifest.json"), "utf8"));
const scripts = manifest.content_scripts[0].js.filter((file) => file !== "content/bootstrap.js");
const productUrl =
  "https://www.loewe.com/eur/en/women/bags/bucket-bags/medium-bilbao-bucket-in-smooth-calfskin/AWRAWPRX01-5984.html";

const sandbox = {
  URL,
  console,
  Node: { ELEMENT_NODE: 1 },
  window: {
    innerWidth: 1440,
    innerHeight: 900,
    clearTimeout: () => {}
  },
  document: {
    body: {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    title: "Bucket Bags | LOEWE"
  },
  location: new URL("https://www.loewe.com/eur/en/women/bags/bucket-bags"),
  chrome: {
    runtime: {
      getURL: (assetPath) => `chrome-extension://stash/${assetPath}`
    },
    storage: {
      local: {},
      onChanged: { addListener: () => {} }
    }
  }
};

vm.createContext(sandbox);

scripts.forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, "extension", file), "utf8"), sandbox, {
    filename: file
  });
});

assert.equal(typeof sandbox.extractProduct, "function");
assert.equal(typeof sandbox.isExtractableProductPageUrl, "function");
assert.equal(typeof sandbox.isKnownProductPageUrl, "function");
assert.equal(sandbox.isProductLikeUrl(productUrl), true);

vm.runInContext(
  `
  findJsonLdProduct = () => ({});
  extractFromMicrodata = () => ({});
  extractFromEmbeddedJson = () => ({});
  extractFromCommonSelectors = () => ({});
  extractFromMeta = () => ({});
  extractFromPagePrice = () => ({});
  extractFromContext = () => ({
    fromContext: true,
    title: "Bucket Bags",
    brand: "Slide 0",
    url: "${productUrl}",
    priceText: "2.700€",
    priceAmount: 2700,
    currency: "EUR",
    imageUrl: "https://www.loewe.com/example/medium-bilbao-blue.jpg"
  });
  isKnownProductPageUrl = undefined;
  `,
  sandbox
);

const extracted = sandbox.extractProduct({ linkUrl: productUrl });
assert.equal(extracted.url, productUrl);
assert.equal(extracted.brand, "Loewe");
assert.equal(extracted.title, "Medium Bilbao Bucket In Smooth Calfskin");

console.log("content script order smoke passed");
