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

const onProductUrl =
  "https://www.on.com/en-fi/products/cloudrunner-2-w-3we1013/womens/frost-white-shoes-3WE10130622";
const onPrice = sandbox.findBestPrice([
  "Last season Cloudrunner 2 Women - Road running, cushioned support, Helion superfoam €125.00 €160.00"
]);
assert.equal(onPrice.amount, 125, "On sale cards should keep the current price");
assert.equal(onPrice.compareAtAmount, 160, "On sale cards should keep the full price as compare-at");
assert.equal(
  sandbox.cleanProductTitle("Frost White Shoes", "On", onProductUrl),
  "Cloudrunner 2",
  "On product URLs should prefer the model slug over color-only image text"
);

const lowResOnImage =
  "https://upload.on-running.com/spree/products/4791/product/low-frost-white.png?width=320";
const highResOnImage =
  "https://upload.on-running.com/spree/products/4791/product/high-frost-white.png?width=1600";
const clickedImage = {
  srcset: `${lowResOnImage} 320w, ${highResOnImage} 1600w`,
  currentSrc: lowResOnImage,
  src: lowResOnImage,
  naturalWidth: 320,
  width: 320,
  getAttribute: () => "",
  closest: () => null,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 180 })
};
sandbox.lastContextPoint = { x: 160, y: 90 };
assert.equal(
  sandbox.bestProductImageUrl(
    { srcUrl: lowResOnImage },
    clickedImage,
    { querySelectorAll: () => [clickedImage] }
  ),
  highResOnImage,
  "Image clicks should prefer higher-resolution srcset candidates over context srcUrl"
);

console.log("product URL classifier and extraction smoke passed");
