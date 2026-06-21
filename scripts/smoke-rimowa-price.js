const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl =
  "https://www.rimowa.com/fi/en/luggage/colour/silver/check-in-m/92563004.html";
const cabinUrl =
  "https://www.rimowa.com/fi/en/luggage/colour/silver/cabin/92553004.html";
const productImage =
  "https://www.rimowa.com/dw/image/v2/BBZB_PRD/on/demandware.static/-/Sites-master-catalog/default/dw/example/92563004.png";

const sandbox = {
  URL,
  console,
  window: {
    innerWidth: 1440,
    innerHeight: 900,
    getComputedStyle: () => ({ display: "block", visibility: "visible", opacity: "1" })
  },
  document: {
    querySelector: () => null,
    querySelectorAll: () => [],
    title: "Original Check-in M aluminium Suitcase | silver | RIMOWA"
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

const visiblePrice = sandbox.normalizePrice({ text: "1.360,00 €", currency: "EUR" });
assert.equal(visiblePrice.amount, 1360, "RIMOWA localized visible price should parse as 1360");

sandbox.findJsonLdProduct = () => ({
  title: "Check-In M",
  brand: "RIMOWA",
  url: productUrl,
  priceText: "1,360 €",
  priceAmount: 1360,
  currency: "EUR",
  imageUrl: productImage
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "Check-In M",
  brand: "RIMOWA",
  url: productUrl,
  priceText: "1.360,00 €",
  priceAmount: 1360,
  currency: "EUR",
  imageUrl: productImage
});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({
  priceText: "1.360,00 €",
  priceAmount: 1360,
  currency: "EUR"
});
sandbox.extractFromEmbeddedJson = () => ({
  title: "Check-In M",
  brand: "RIMOWA",
  url: productUrl,
  priceText: "1,130 €",
  priceAmount: 1130,
  currency: "EUR",
  compareAtPriceText: "1,360 €",
  compareAtPriceAmount: 1360,
  isSale: true,
  imageUrl: productImage
});
sandbox.extractFromContext = () => ({});

const extracted = sandbox.extractProduct({});
assert.equal(extracted.url, productUrl);
assert.equal(extracted.title, "Check-In M");
assert.equal(extracted.brand, "RIMOWA");
assert.equal(extracted.priceAmount, 1360);
assert.equal(extracted.priceText, "1,360 €");
assert.equal(extracted.compareAtPriceAmount, undefined);
assert.equal(extracted.compareAtPriceText, undefined);
assert.equal(extracted.isSale, undefined);

sandbox.location = new URL(cabinUrl);
sandbox.document.title = "Original Cabin aluminium Suitcase | silver | RIMOWA";
sandbox.findJsonLdProduct = () => ({
  title: "Luggage",
  brand: "Cabin image number 0",
  url: cabinUrl,
  priceText: "1.180,00 €",
  priceAmount: 1180,
  currency: "EUR",
  imageUrl: productImage
});
sandbox.extractFromCommonSelectors = () => ({
  title: "Luggage",
  brand: "Cabin image number 0",
  url: cabinUrl,
  priceText: "1.180,00 €",
  priceAmount: 1180,
  currency: "EUR",
  imageUrl: productImage
});
sandbox.extractFromEmbeddedJson = () => ({
  title: "Cabin image number 0",
  brand: "Luggage",
  url: cabinUrl,
  priceText: "1,180 €",
  priceAmount: 1180,
  currency: "EUR",
  imageUrl: productImage
});
sandbox.extractFromPagePrice = () => ({
  priceText: "1.180,00 €",
  priceAmount: 1180,
  currency: "EUR"
});

const cabinExtracted = sandbox.extractProduct({});
assert.equal(cabinExtracted.url, cabinUrl);
assert.equal(cabinExtracted.title, "Cabin");
assert.equal(cabinExtracted.brand, "RIMOWA");
assert.equal(cabinExtracted.priceAmount, 1180);

console.log("rimowa price smoke passed");
