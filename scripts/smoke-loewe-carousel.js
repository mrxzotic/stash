const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const categoryUrl = "https://www.loewe.com/eur/en/women/bags/bucket-bags/";
const productUrl =
  "https://www.loewe.com/eur/en/women/bags/bucket-bags/medium-bilbao-bucket-in-smooth-calfskin/AWRAWPRX01-5984.html";

const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    querySelectorAll: () => [],
    querySelector: () => null,
    title: "Bucket Bags | LOEWE"
  },
  location: new URL(categoryUrl)
};

vm.createContext(sandbox);

[
  "extension/content/constants.js",
  "extension/content/utils.js",
  "extension/content/media.js",
  "extension/content/text.js",
  "extension/content/storage-settings.js",
  "extension/content/pricing/dom.js",
  "extension/content/pricing/rates.js",
  "extension/content/pricing/noise.js",
  "extension/content/pricing/parse.js",
  "extension/content/extractors/embedded.js",
  "extension/content/extractors/main.js",
  "extension/content/extractors/context.js",
  "extension/content/extractors/jsonld.js",
  "extension/content/extractors/rendezvous.js",
  "extension/content/extractors/verify.js",
  "extension/content/extractors/quality.js",
  "extension/content/extractors/enrich.js"
].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
    filename: file
  });
});

assert.equal(sandbox.cleanBrandName("Slide 0"), "");
assert.equal(sandbox.cleanBrandName("+ Colour"), "");
assert.equal(sandbox.isNoiseLine("Slide 0"), true);
assert.equal(sandbox.isNoiseLine("+ Colour"), true);
assert.equal(sandbox.looksLikeProductName("Medium Bilbao bucket in smooth calfskin"), true);
assert.equal(sandbox.isProductLikeUrl(productUrl), true);
assert.equal(sandbox.productTitleFromUrl(productUrl), "medium bilbao bucket in smooth calfskin");
assert.equal(
  sandbox.cleanProductTitle("Bucket Bags", "Loewe", productUrl),
  "Medium Bilbao Bucket In Smooth Calfskin"
);

sandbox.findJsonLdProduct = () => ({});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromCommonSelectors = () => ({});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromContext = () => ({
  fromContext: true,
  title: "Bucket Bags",
  brand: "Slide 0",
  url: productUrl,
  priceText: "2.700€",
  priceAmount: 2700,
  currency: "EUR",
  imageUrl: "https://www.loewe.com/example/medium-bilbao-blue.jpg"
});

const extracted = sandbox.extractProduct({ linkUrl: productUrl });
assert.equal(extracted.url, productUrl);
assert.equal(extracted.brand, "Loewe");
assert.equal(extracted.title, "Medium Bilbao Bucket In Smooth Calfskin");
assert.equal(extracted.priceAmount, 2700);

const quality = sandbox.attachExtractionQuality(extracted);
assert.equal(quality.extraction.fields.brand.value, "Loewe");
assert.ok(quality.extraction.fields.brand.confidence >= 88);

console.log("loewe carousel smoke passed");
