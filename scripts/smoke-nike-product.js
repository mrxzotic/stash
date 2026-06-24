const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl = "https://www.nike.com/fi/t/kd19-purple-stuff-basketball-shoes-7MwO2HBu/IH1117-500";
const productImage = "https://static.nike.com/a/images/t_default/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/a29eaa38-46a8-4e54-8c48-25c689d5b412/KD19.png";

const sandbox = {
  URL,
  Intl,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    body: { textContent: "" },
    title: "KD19 'Purple Stuff' Basketball Shoes. Nike FI",
    querySelector: () => null,
    querySelectorAll: () => [],
    elementsFromPoint: () => []
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
  "extension/content/extractors/product-url.js",
  "extension/content/extractors/main.js",
  "extension/content/extractors/jsonld.js",
  "extension/content/extractors/dom.js",
  "extension/content/extractors/pye.js",
  "extension/content/extractors/embedded.js",
  "extension/content/extractors/rendezvous.js",
  "extension/content/extractors/verify.js",
  "extension/content/extractors/quality.js",
  "extension/content/extractors/enrich.js",
  "extension/content/extractors/context.js"
].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
    filename: file
  });
});

assert.equal(sandbox.isNikeProductUrl(productUrl), true);
assert.equal(sandbox.isProductLikeUrl(productUrl), true);

sandbox.findJsonLdProduct = () => ({
  title: "KD19 'Purple Stuff' Basketball Shoes - Field Purple/Stadium Green/University Gold - Size 6",
  brand: "Nike",
  url: productUrl,
  priceText: "160 €",
  priceAmount: 159.99,
  currency: "EUR",
  imageUrl: productImage,
  fromJsonLd: true
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromEmbeddedJson = () => ({
  title: "KD19 'Purple Stuff' Basketball Shoes",
  brand: "Nike",
  url: productUrl,
  priceText: "135 €",
  priceAmount: 135,
  currency: "EUR",
  compareAtPriceText: "160 €",
  compareAtPriceAmount: 159.99,
  isSale: true,
  imageUrl: productImage
});
sandbox.extractFromCommonSelectors = () => ({
  title: "KD19 'Purple Stuff'",
  url: productUrl,
  priceText: "135 €",
  priceAmount: 135,
  currency: "EUR",
  compareAtPriceText: "160 €",
  compareAtPriceAmount: 159.99,
  isSale: true
});
sandbox.extractFromPagePrice = () => ({
  priceText: "135 €",
  priceAmount: 135,
  currency: "EUR",
  compareAtPriceText: "160 €",
  compareAtPriceAmount: 159.99,
  isSale: true
});
sandbox.extractFromMeta = () => ({
  title: "KD19 'Purple Stuff' Basketball Shoes",
  brand: "Nike",
  url: productUrl,
  imageUrl: productImage
});
sandbox.extractFromContext = () => ({});

const extracted = sandbox.extractProduct({});
assert.equal(extracted.source, "Nike");
assert.equal(extracted.brand, "Nike");
assert.equal(extracted.title, "Kd19 'Purple Stuff' Basketball Shoes");
assert.equal(extracted.priceAmount, 159.99);
assert.equal(sandbox.cleanText(extracted.priceText), "160 €");
assert.equal(extracted.currency, "EUR");
assert.equal(extracted.compareAtPriceAmount, undefined);
assert.notEqual(extracted.isSale, true);
assert.equal(extracted.imageUrl, productImage);

console.log("nike product smoke passed");
