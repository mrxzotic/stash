const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { contentScriptFiles } = require("./content-script-files");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "extension/manifest.json"), "utf8"));
const backgroundSource = fs.readFileSync(path.join(root, "extension/background.js"), "utf8");
const bootstrapSource = fs.readFileSync(path.join(root, "extension/content/bootstrap.js"), "utf8");
const scripts = contentScriptFiles(root).filter((file) => file !== "content/bootstrap.js");
const productUrl =
  "https://www.loewe.com/eur/en/women/bags/bucket-bags/medium-bilbao-bucket-in-smooth-calfskin/AWRAWPRX01-5984.html";

assert.equal(manifest.host_permissions, undefined);
assert.equal(manifest.content_scripts, undefined);
assert.equal(manifest.permissions.includes("activeTab"), true);
assert.equal(scripts[0], "content/constants.js");
assert.match(bootstrapSource, /const previousVersion = window\.__tuckioContentVersion \|\| "";/, "Content bootstrap should detect version upgrades");
assert.match(bootstrapSource, /if \(!previousVersion\) \{[\s\S]*?removeStaleExtensionRoots\(\);[\s\S]*?\}/, "Content bootstrap should not remove open panel roots during version upgrades");
assert.match(bootstrapSource, /removeListener\?\.\(bindings\.messageHandler\)/, "Content bootstrap should remove prior runtime listeners on reinjection");

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
      getURL: (assetPath) => `chrome-extension://tuckio/${assetPath}`
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
assert.equal(
  backgroundSource.match(/CONTENT_SCRIPT_VERSION = "([^"]+)"/)?.[1],
  sandbox.CONTENT_VERSION
);

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
