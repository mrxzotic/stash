const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl =
  "https://www.on.com/en-fi/products/cloudmonster-3-hyper-ls-u-3ug1001/unisex/black-apollo-shoes-3UG10014670";
const imageUrl =
  "https://images.ctfassets.net/hnk2vsx53n6l/1tbMPAFietv1U5gDC2xu3b/eaf243482d51d0cbfa9c27b1e3035832/d1a6e9b279bcc08a5a978c23e99228863c6b6f90.png";
const sandbox = {
  URL,
  console,
  window: {
    innerWidth: 1440,
    innerHeight: 900,
    getComputedStyle: () => ({ display: "block", visibility: "visible", opacity: "1" })
  },
  document: {
    body: { textContent: "LightSpray Cloudmonster 3 Hyper €280" },
    querySelector: () => null,
    querySelectorAll: () => [],
    title: "LightSpray Cloudmonster 3 Hyper | Black & White | On Finland"
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

sandbox.findJsonLdProduct = () => ({
  title: "LightSpray Cloudmonster 3 Hyper Black | Apollo",
  brand: "On",
  url: productUrl,
  priceText: "280 €",
  priceAmount: 280,
  currency: "EUR",
  imageUrl
});
sandbox.extractFromCommonSelectors = () => ({
  title: "LightSpray Cloudmonster 3 Hyper Black | Apollo",
  brand: "ShopShoesRoad Running",
  url: productUrl,
  priceText: "280 €",
  priceAmount: 280,
  currency: "EUR",
  imageUrl
});
sandbox.extractFromContext = () => ({});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromPagePrice = () => ({ priceText: "280 €", priceAmount: 280, currency: "EUR" });

const extracted = sandbox.extractProduct({});
assert.equal(extracted.brand, "On");
assert.equal(extracted.priceAmount, 280);
assert.equal(extracted.imageUrl, imageUrl);
console.log("on brand smoke passed");
