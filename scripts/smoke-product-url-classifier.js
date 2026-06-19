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
  "extension/content/pricing/dom.js",
  "extension/content/pricing/rates.js",
  "extension/content/pricing/parse.js",
  "extension/content/extractors/main.js",
  "extension/content/extractors/context.js",
  "extension/content/extractors/jsonld.js",
  "extension/content/extractors/enrich.js"
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

const cloudmonsterUrl =
  "https://www.on.com/en-fi/products/cloudmonster-2-m-3me1012/mens/white-frost-shoes-3ME10120664";
const cloudmonsterThumbnail =
  "https://upload.on-running.com/spree/products/5287/product/cef0fe2d4195560075ae527a9da433e9540c9714.png?1773367570";
const cloudmonsterGalleryImage =
  "https://images.ctfassets.net/hnk2vsx53n6l/5Djt5G367gJwPXINVW9duZ/a28cf7f734243e0fb1ed6897f7f1724d/cef0fe2d4195560075ae527a9da433e9540c9714.png?w=4000&h=4000&fm=webp&f=center&fit=fill&q=80";
sandbox.location = new URL(cloudmonsterUrl);
sandbox.document.title = "Men's Cloudmonster 2 | White | On Finland";
sandbox.findJsonLdProduct = () => ({
  title: "Men's Cloudmonster 2 White | Frost",
  brand: "On",
  url: cloudmonsterUrl,
  priceText: "130 €",
  priceAmount: 130,
  currency: "EUR",
  compareAtPriceText: "190 €",
  compareAtPriceAmount: 190,
  imageUrl: cloudmonsterThumbnail
});
sandbox.extractFromCommonSelectors = () => ({
  title: "Cloudmonster 2",
  brand: "On",
  url: cloudmonsterUrl,
  priceText: "130 €",
  priceAmount: 130,
  currency: "EUR",
  compareAtPriceText: "190 €",
  compareAtPriceAmount: 190,
  imageUrl: cloudmonsterGalleryImage
});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromContext = () => ({
  fromContext: true,
  url: cloudmonsterUrl,
  imageUrl: cloudmonsterThumbnail
});

const cloudmonsterProduct = sandbox.extractProduct({ srcUrl: cloudmonsterThumbnail });
assert.equal(
  cloudmonsterProduct.imageUrl,
  cloudmonsterGalleryImage,
  "On PDP saves should prefer CTF gallery images over 200px upload thumbnails"
);
assert.equal(cloudmonsterProduct.priceAmount, 130, "On PDP image ranking should preserve price");

const aboutBlankUrl =
  "https://about---blank.com/en-eu/products/alpaca-crew-alpaca-mix-light-grey";
const aboutBlankPrice = sandbox.findBestPrice([
  "From 8 €/month with Klarna Learn more",
  "€254,95"
]);
assert.equal(aboutBlankPrice.amount, 254.95, "Installment copy should not win as price");
assert.equal(
  sandbox.parsePricesFromText("From 8 €/month with Klarna Learn more").length,
  0,
  "Installment text should not produce product price candidates"
);
assert.equal(
  sandbox.cleanProductTitle("alpaca crew light grey - XS", "about:blank", aboutBlankUrl),
  "Alpaca Crew Light Grey",
  "Variant size suffixes should not leak into product titles"
);
sandbox.location = new URL(aboutBlankUrl);
sandbox.window.getComputedStyle = () => ({
  display: "block",
  visibility: "visible",
  opacity: "1"
});
const aboutBlankMainPrice = fakePriceElement("€235,95", { inMain: true });
const aboutBlankRelatedPrice = fakePriceElement("€71,95", { inShopTheLook: true });
const aboutBlankPriceScope = {
  querySelectorAll: () => [aboutBlankRelatedPrice, aboutBlankMainPrice]
};
assert.equal(
  sandbox.visiblePriceCandidates(aboutBlankPriceScope).join("|"),
  "236 €",
  "Product page price scan should ignore related item prices"
);

const pdpImage =
  "https://images.ctfassets.net/hnk2vsx53n6l/on-cloudrunner-2.png?w=1200&h=630&fit=pad";
sandbox.location = new URL("https://www.on.com/en-fi/shop/last-season");
sandbox.document.title = "Last season";
sandbox.fetch = async () => ({
  ok: true,
  text: async () => "<html></html>",
  json: async () => ({})
});
sandbox.DOMParser = class {
  parseFromString() {
    return {
      title: "Women's Cloudrunner 2 | On",
      body: { textContent: "" },
      querySelectorAll: () => [],
      querySelector: (selector) => {
        if (selector.includes("og:image")) {
          return { content: pdpImage };
        }
        return null;
      }
    };
  }
};

sandbox.enrichProduct({
  fromContext: true,
  title: "Cloudrunner 2",
  brand: "On",
  url: onProductUrl,
  priceText: "125 €",
  priceAmount: 125,
  currency: "EUR",
  imageUrl: lowResOnImage
}).then((enriched) => {
  assert.equal(enriched.imageUrl, pdpImage, "Context cards should enrich image from the PDP");
  assert.equal(enriched.priceAmount, 125, "PDP image enrichment should preserve card price");
  assert.equal(enriched.title, "Cloudrunner 2", "PDP image enrichment should preserve card title");
  console.log("product URL classifier and extraction smoke passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

function fakePriceElement(text, options = {}) {
  return {
    className: options.className || "",
    id: options.id || "",
    innerText: text,
    textContent: text,
    dataset: {},
    getAttribute: () => "",
    getBoundingClientRect: () => ({ width: 80, height: 20 }),
    matches: () => false,
    closest: (selector) => {
      if (selector.includes("#shop-the-look")) {
        return options.inShopTheLook ? {} : null;
      }
      if (selector === "main") {
        return options.inMain ? {} : null;
      }
      return null;
    }
  };
}
