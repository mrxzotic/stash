const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl = "https://www.therow.com/en-eu/products/vonn-cardigan-blue-melange";
const productImage = "https://www.therow.com/cdn/shop/files/example.jpg";

const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    querySelectorAll: () => [],
    querySelector: () => null,
    title: "Vonn Cardigan - Blue Melange | The Row"
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
  "extension/content/extractors/enrich.js"
].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
    filename: file
  });
});

sandbox.findJsonLdProduct = () => ({
  title: "Vonn Cardigan",
  url: productUrl,
  priceText: "1,485 €",
  priceAmount: 1485,
  currency: "EUR",
  compareAtPriceText: "2,970 €",
  compareAtPriceAmount: 2970,
  isSale: true,
  imageUrl: productImage
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "Vonn Cardigan",
  brand: "Blue Melange",
  url: productUrl,
  priceText: "1,485 €",
  priceAmount: 1485,
  currency: "EUR",
  compareAtPriceText: "2,970 €",
  compareAtPriceAmount: 2970,
  isSale: true,
  imageUrl: productImage
});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromContext = () => ({});

const extracted = sandbox.extractProduct({});
assert.equal(extracted.url, productUrl);
assert.equal(extracted.title, "Vonn Cardigan");
assert.equal(extracted.brand, "The Row");
assert.equal(extracted.priceAmount, 1485);
assert.equal(extracted.compareAtPriceAmount, 2970);
assert.equal(extracted.imageUrl, productImage);

console.log("the row brand smoke passed");
