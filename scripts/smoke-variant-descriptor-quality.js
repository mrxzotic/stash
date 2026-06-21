const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl = "https://www.premiata.it/products/marte-sneakers-grey-white";
const productImage = "https://www.premiata.it/example/marte.jpg";

const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    querySelectorAll: () => [],
    querySelector: () => null,
    title: "MARTE GREY WHITE"
  },
  location: new URL(productUrl)
};

vm.createContext(sandbox);

[
  "extension/content/constants.js",
  "extension/content/utils.js",
  "extension/content/media.js",
  "extension/content/text.js",
  "extension/content/source-icons.js",
  "extension/content/storage-settings.js",
  "extension/content/pricing/dom.js",
  "extension/content/pricing/rates.js",
  "extension/content/pricing/noise.js",
  "extension/content/pricing/parse.js",
  "extension/content/extractors/pye.js",
  "extension/content/extractors/embedded.js",
  "extension/content/extractors/product-url.js",
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

assert.equal(sandbox.looksLikeVariantDescriptor("MARTE GREY WHITE"), false);
assert.equal(sandbox.looksLikeModelColorwayTitle("MARTE GREY WHITE"), true);
assert.equal(sandbox.looksLikeVariantDescriptor("Blue Melange"), true);
assert.equal(sandbox.cleanBrandName("MARTE GREY WHITE"), "");
assert.equal(
  sandbox.cleanProductTitle("MARTE GREY WHITE", "MARTE GREY WHITE", productUrl),
  "Marte Sneakers Grey White"
);

sandbox.findJsonLdProduct = () => ({});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "MARTE GREY WHITE",
  brand: "MARTE GREY WHITE",
  url: productUrl,
  priceText: "€260",
  priceAmount: 260,
  currency: "EUR",
  imageUrl: productImage
});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromContext = () => ({});

const extracted = sandbox.extractProduct({});
assert.equal(extracted.brand, "Premiata");
assert.equal(extracted.title, "Marte Sneakers Grey White");
assert.equal(extracted.priceAmount, 260);

const suspicious = sandbox.attachExtractionQuality({
  title: "MARTE GREY WHITE",
  brand: "MARTE GREY WHITE",
  url: productUrl,
  priceText: "€260",
  priceAmount: 260,
  currency: "EUR",
  imageUrl: productImage
});
assert.equal(suspicious.extraction.fields.brand.needsReview, true);
assert.equal(suspicious.extraction.fields.title.value, "Marte Sneakers Grey White");
assert.equal(suspicious.extraction.fields.title.needsReview, false);

const noUrlSuspicious = sandbox.attachExtractionQuality({
  title: "MARTE GREY WHITE",
  brand: "MARTE GREY WHITE",
  url: "https://www.premiata.it",
  priceText: "€260",
  priceAmount: 260,
  currency: "EUR",
  imageUrl: productImage
});
assert.equal(noUrlSuspicious.extraction.fields.brand.needsReview, true);
assert.equal(noUrlSuspicious.extraction.fields.title.needsReview, true);

console.log("variant descriptor quality smoke passed");
