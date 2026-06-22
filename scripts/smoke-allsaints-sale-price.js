const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl =
  "https://www.allsaints.com/eu/men/sale/petals-oversized-short-sleeve-graphic-t-shirt/M062PE-4068.html";
const productImage =
  "https://media.i.allsaints.com/allsaints-prod/image/upload/f_auto,q_auto/v1/products/images/large/M062PE/4068/M062PE-4068-7";
const blackProductUrl =
  "https://www.allsaints.com/eu/men/t-shirts/petals-oversized-short-sleeve-graphic-t-shirt/M062PE-162.html";
const blackProductImage =
  "https://media.i.allsaints.com/allsaints-prod/image/upload/f_auto,q_auto/v1/products/images/large/M062PE/162/M062PE-162-6";

const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    querySelectorAll: () => [],
    querySelector: () => null,
    title: "Petals Oversized Short Sleeve Graphic T-Shirt Chalk White | ALLSAINTS"
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

const normalized = sandbox.normalizePrice({
  amount: 50,
  currency: "EUR",
  compareAtAmount: 7200,
  compareAtText: "7,200 €"
});
assert.equal(normalized.amount, 50);
assert.equal(normalized.compareAtAmount, 72);
assert.equal(normalized.compareAtText, "72 €");

sandbox.findJsonLdProduct = () => ({
  title: "Petals Oversized Short Sleeve Graphic T-Shirt",
  brand: "ALLSAINTS",
  url: productUrl,
  priceText: "50 €",
  priceAmount: 50,
  currency: "EUR",
  compareAtPriceText: "7,200 €",
  compareAtPriceAmount: 7200,
  isSale: true,
  imageUrl: productImage
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "Petals Oversized Short Sleeve Graphic T-Shirt",
  brand: "ALLSAINTS",
  url: productUrl,
  priceText: "€72.00 €50.00",
  priceAmount: 50,
  currency: "EUR",
  compareAtPriceText: "72 €",
  compareAtPriceAmount: 72,
  isSale: true,
  imageUrl: productImage
});
sandbox.extractFromMeta = () => ({
  title: "Petals Oversized Short Sleeve Graphic T-Shirt Chalk White | ALLSAINTS",
  brand: "ALLSAINTS",
  url: productUrl,
  imageUrl: productImage
});
sandbox.extractFromPagePrice = () => ({
  priceText: "50 €",
  priceAmount: 50,
  currency: "EUR"
});
sandbox.extractFromContext = () => ({});

const extracted = sandbox.extractProduct({});
assert.equal(extracted.brand, "AllSaints");
assert.equal(extracted.title, "Petals Oversized Short Sleeve Graphic T-Shirt");
assert.equal(extracted.priceAmount, 50);
assert.equal(extracted.priceText, "50 €");
assert.equal(extracted.compareAtPriceAmount, 72);
assert.equal(extracted.compareAtPriceText, "72 €");
assert.equal(extracted.isSale, true);

sandbox.location = new URL(blackProductUrl);
sandbox.document.title = "Petals Oversized Short Sleeve Graphic T-Shirt Washed Black | ALLSAINTS";
assert.deepEqual(Array.from(sandbox.productImageContextTokens(blackProductUrl)), ["m062pe 162"]);
sandbox.findJsonLdProduct = () => ({
  title: "Petals Oversized Short Sleeve Graphic T-Shirt",
  brand: "ALLSAINTS",
  url: blackProductUrl,
  priceText: "72 €",
  priceAmount: 72,
  currency: "EUR",
  compareAtPriceText: "85 €",
  compareAtPriceAmount: 85,
  isSale: true,
  imageUrl: productImage,
  imageUrls: [productImage]
});
sandbox.extractFromCommonSelectors = () => ({
  title: "Petals Oversized Short Sleeve Graphic T-Shirt",
  brand: "ALLSAINTS",
  url: blackProductUrl,
  priceText: "72 €",
  priceAmount: 72,
  currency: "EUR",
  imageUrl: blackProductImage,
  imageUrls: [blackProductImage]
});
sandbox.extractFromMeta = () => ({
  title: "Petals Oversized Short Sleeve Graphic T-Shirt Washed Black | ALLSAINTS",
  brand: "ALLSAINTS",
  url: blackProductUrl,
  imageUrl: blackProductImage,
  imageUrls: [blackProductImage]
});
sandbox.extractFromPagePrice = () => ({
  priceText: "72 €",
  priceAmount: 72,
  currency: "EUR"
});

const blackExtracted = sandbox.extractProduct({});
assert.equal(blackExtracted.url, blackProductUrl);
assert.equal(blackExtracted.priceAmount, 72);
assert.equal(blackExtracted.compareAtPriceAmount, undefined);
assert.equal(blackExtracted.isSale, undefined);
assert.equal(blackExtracted.imageUrl, blackProductImage);
assert.equal(blackExtracted.imageUrls[0], blackProductImage);

console.log("allsaints sale and variant image smoke passed");
