const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    querySelectorAll: () => [],
    title: "New in: handpicked daily from the world's best brands and boutiques"
  },
  location: new URL("https://www.farfetch.com/shopping/men/new-items-2/items.aspx")
};

vm.createContext(sandbox);

[
  "extension/content/constants.js",
  "extension/content/utils.js",
  "extension/content/media.js",
  "extension/content/text.js",
  "extension/content/storage-settings.js",
  "extension/content/pricing/rates.js",
  "extension/content/pricing/parse.js",
  "extension/content/extractors/main.js",
  "extension/content/extractors/context.js"
].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
    filename: file
  });
});

assert.equal(
  sandbox.isProductLikeUrl(
    "https://www.farfetch.com/shopping/men/dsquared2-dc-642-sneakers-item-30107002.aspx?storeid=123"
  ),
  true,
  "Farfetch product cards should be treated as product links"
);

assert.equal(
  sandbox.isProductLikeUrl("https://www.farfetch.com/shopping/men/new-items-2/items.aspx"),
  false,
  "Farfetch listing pages should not be treated as product links"
);

assert.equal(
  sandbox.isProductLikeUrl("https://shop.example/products/cloudmonster-2"),
  true,
  "Existing /products/ product URLs should remain supported"
);

const sneakerUrl =
  "https://www.farfetch.com/shopping/men/dsquared2-dc-642-sneakers-item-30107002.aspx?storeid=123";

sandbox.findJsonLdProduct = () => ({
  title: "Jersey T-Shirt With Logo",
  brand: "Acne Studios",
  url: "https://www.farfetch.com/shopping/men/acne-studios-jersey-t-shirt-with-logo-item-30100001.aspx",
  priceText: "365 EUR",
  priceAmount: 365,
  currency: "EUR",
  imageUrl: "https://cdn.example/acne-shirt.jpg"
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromCommonSelectors = () => ({});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromContext = () => ({
  fromContext: true,
  title: "DC-642 sneakers",
  brand: "DSQUARED2",
  url: sneakerUrl,
  priceText: "470 EUR",
  priceAmount: 470,
  currency: "EUR",
  imageUrl: "https://cdn.example/dsquared2-sneakers.jpg"
});

const extracted = sandbox.extractProduct({ linkUrl: sneakerUrl });
assert.equal(extracted.url, sneakerUrl, "Clicked Farfetch card URL should win on listing pages");
assert.equal(extracted.title, "DC-642 Sneakers");
assert.equal(extracted.brand, "DSQUARED2");
assert.equal(extracted.priceAmount, 470);
assert.equal(extracted.imageUrl, "https://cdn.example/dsquared2-sneakers.jpg");

console.log("product URL classifier and extraction smoke passed");
