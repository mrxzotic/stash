const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const listingUrl = "https://www.mrporter.com/en-fi/mens/sale";
const productUrl =
  "https://www.mrporter.com/en-fi/mens/product/mr-p/clothing/short-sleeve-polo-shirts/organic-cotton-pique-polo-shirt/1647597359927196";
const productImage = "https://cache.mrporter.com/variants/images/example/in/w2000.jpg";
const adidasUrl =
  "https://www.mrporter.com/en-fi/mens/product/adidas-originals/shoes/low-top-sneakers/wales-bonner-leather-trimmed-mesh-sneakers/1647597359927197";
const adidasImage =
  "https://cache.mrporter.com/variants/images/1647597359927197/in/w2000.jpg";

const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    querySelectorAll: () => [],
    querySelector: () => null,
    title: "MR PORTER Sale"
  },
  location: new URL(listingUrl)
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

const cardPrice = sandbox.findBestPrice(["€160 60% off", "€64"]);
assert.equal(cardPrice.amount, 64);
assert.equal(cardPrice.compareAtAmount, 160);

sandbox.findJsonLdProduct = () => ({});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromCommonSelectors = () => ({});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromEmbeddedJson = () => ({
  title: "Organic Cotton-Piqué Polo Shirt",
  brand: "MR P.",
  url: productUrl,
  priceText: "€160",
  priceAmount: 160,
  currency: "EUR",
  imageUrl: productImage
});
sandbox.extractFromContext = () => ({
  fromContext: true,
  title: "Organic Cotton-Piqué Polo Shirt",
  brand: "MR P.",
  url: productUrl,
  priceText: cardPrice.originalText,
  priceAmount: cardPrice.amount,
  currency: cardPrice.currency,
  compareAtPriceText: cardPrice.compareAtText,
  compareAtPriceAmount: cardPrice.compareAtAmount,
  isSale: cardPrice.isSale,
  imageUrl: productImage
});

const extracted = sandbox.extractProduct({ linkUrl: productUrl });
assert.equal(extracted.url, productUrl);
assert.equal(extracted.title, "Organic Cotton-Piqué Polo Shirt");
assert.equal(extracted.brand, "MR P");
assert.equal(extracted.priceAmount, 64);
assert.equal(extracted.priceText, "64 €");
assert.equal(extracted.compareAtPriceAmount, 160);
assert.equal(extracted.compareAtPriceText, "160 €");
assert.equal(extracted.isSale, true);

const pictureSource = {
  getAttribute: (attribute) =>
    attribute === "data-srcset"
      ? `${adidasImage.replace("w2000", "w1000")} 1000w, ${adidasImage} 2000w`
      : ""
};
const picture = {
  querySelectorAll: (selector) => selector === "source" ? [pictureSource] : []
};
const placeholderImage = {
  srcset: "",
  currentSrc: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
  naturalWidth: 1,
  width: 1,
  getAttribute: () => "",
  closest: (selector) => selector === "picture" ? picture : null
};

assert.equal(
  sandbox.bestImageFromElement(placeholderImage),
  adidasImage,
  "MR PORTER picture source images should beat placeholder img src"
);

sandbox.location = new URL(adidasUrl);
sandbox.document.title = "ADIDAS ORIGINALS + Wales Bonner Leather-Trimmed Mesh Sneakers";
sandbox.findJsonLdProduct = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "+ Wales Bonner Leather-Trimmed Mesh Sneakers",
  brand: "ADIDAS ORIGINALS",
  url: adidasUrl,
  priceText: "150 €",
  priceAmount: 150,
  currency: "EUR",
  compareAtPriceText: "250 €",
  compareAtPriceAmount: 250,
  isSale: true,
  imageUrl: sandbox.bestImageFromElement(placeholderImage)
});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromContext = () => ({});

const adidasExtracted = sandbox.extractProduct({});
assert.equal(adidasExtracted.url, adidasUrl);
assert.equal(adidasExtracted.priceAmount, 150);
assert.equal(adidasExtracted.imageUrl, adidasImage);

console.log("mr porter sale price smoke passed");
