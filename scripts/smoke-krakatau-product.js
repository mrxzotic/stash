const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl =
  "https://ru.krakatauwear.com/products/waterproof-jacket-qm567?color=%D0%BF%D0%B5%D0%BF%D0%B5%D0%BB%D1%8C%D0%BD%D0%BE-%D0%B1%D0%B5%D0%BB%D1%8B%D0%B9";
const selectedImage =
  "https://cdn.shopify.com/s/files/1/0277/6252/4227/files/Qm567_43_01.jpg?v=1780316573";
const defaultImage =
  "https://cdn.shopify.com/s/files/1/0277/6252/4227/files/Qm567_1_30_8a286035-f089-413b-88ab-271deb82882d.jpg?v=1780316573";
const sandbox = {
  URL,
  console,
  window: {
    innerWidth: 1440,
    innerHeight: 900,
    getComputedStyle: () => ({ display: "block", visibility: "visible", opacity: "1" })
  },
  document: {
    body: { textContent: "" },
    querySelector: () => null,
    querySelectorAll: () => [],
    title: "Водостойкая куртка SAGITTARIUS A Qm567"
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
const shippingThreshold = sandbox.findBestPrice([
  "23 990 ₽",
  "бесплатная доставка при заказе от 10 000 ₽"
]);
assert.equal(shippingThreshold.amount, 23990);
assert.equal(shippingThreshold.compareAtAmount, undefined);
sandbox.findJsonLdProduct = () => ({
  title: "Водостойкая куртка SAGITTARIUS A Qm567",
  brand: "KRAKATAU",
  url: "https://ru.krakatauwear.com/products/waterproof-jacket-qm567",
  priceText: "23 990 ₽",
  priceAmount: 23990,
  currency: "RUB",
  imageUrl: defaultImage,
  imageUrls: [defaultImage]
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "Водостойкая куртка SAGITTARIUS A Qm567",
  brand: "KRAKATAU",
  url: productUrl,
  priceText: "23 990 ₽",
  priceAmount: 23990,
  currency: "RUB",
  imageUrl: selectedImage,
  imageUrls: [selectedImage]
});
sandbox.extractFromMeta = () => ({
  title: "Водостойкая куртка SAGITTARIUS A Qm567",
  brand: "KRAKATAU",
  url: "https://ru.krakatauwear.com/products/waterproof-jacket-qm567",
  imageUrl: defaultImage
});
sandbox.extractFromPagePrice = () => ({
  priceText: "23 990 ₽",
  priceAmount: 23990,
  currency: "RUB"
});
sandbox.extractFromEmbeddedJson = () => ({
  title: "Waterproof Jacket Qm567",
  brand: "KRAKATAU",
  url: "https://ru.krakatauwear.com/products/waterproof-jacket-qm567",
  priceText: "10 000 ₽",
  priceAmount: 10000,
  currency: "RUB",
  compareAtPriceText: "23 990 ₽",
  compareAtPriceAmount: 23990,
  isSale: true,
  imageUrl: defaultImage,
  imageUrls: [defaultImage]
});
sandbox.extractFromContext = () => ({});
const extracted = sandbox.extractProduct({});
assert.equal(extracted.url, productUrl);
assert.equal(extracted.title, "Водостойкая Куртка Sagittarius A Qm567");
assert.equal(extracted.brand, "KRAKATAU");
assert.equal(extracted.priceAmount, 23990);
assert.equal(extracted.compareAtPriceAmount, undefined);
assert.equal(extracted.isSale, undefined);
assert.equal(extracted.imageUrl, selectedImage);
console.log("krakatau product smoke passed");
