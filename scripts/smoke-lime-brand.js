const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl =
  "https://limestore.com/ru_ru/product/32596_6103_336-sostarennyi_sinii";
const productImage = "https://limestore.com/example/product.jpg";

const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    querySelectorAll: () => [],
    querySelector: () => null,
    title: "LIME"
  },
  location: new URL(productUrl)
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

assert.equal(sandbox.cleanBrandName("limestore"), "LIME");
assert.equal(sandbox.cleanBrandName("LIMESTORE"), "LIME");
assert.equal(sandbox.sourceNameFromUrl(productUrl), "LIME");
assert.equal(sandbox.formatBrandName("LIMESTORE"), "LIME");

sandbox.findJsonLdProduct = () => ({});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "Прямые джинсы со средней посадкой",
  url: productUrl,
  priceText: "3 999 ₽",
  priceAmount: 3999,
  currency: "RUB",
  compareAtPriceText: "6 999 ₽",
  compareAtPriceAmount: 6999,
  isSale: true,
  imageUrl: productImage
});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromContext = () => ({});

const extracted = sandbox.extractProduct({});
assert.equal(extracted.url, productUrl);
assert.equal(extracted.brand, "LIME");
assert.equal(extracted.title, "Прямые Джинсы Со Средней Посадкой");
assert.equal(extracted.priceAmount, 3999);
assert.equal(extracted.compareAtPriceAmount, 6999);

console.log("lime brand smoke passed");
