const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl = "https://p448.com/products/f25john11-w-960";
const productImage = "https://p448.com/cdn/shop/files/F25JOHN11-W_SHILD-BLK-1.jpg";

const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    querySelectorAll: () => [],
    querySelector: () => null,
    title: "John Nightfall - Women's Low-Top White Leather Sneaker – P448®"
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

assert.equal(sandbox.cleanBrandName("P448®"), "P448");
assert.equal(sandbox.sourceNameFromUrl(productUrl), "P448");
assert.equal(sandbox.productTitleFromUrl(productUrl), "");
assert.equal(sandbox.looksLikeVariantDescriptor("John Nightfall"), false);
assert.equal(sandbox.looksLikeModelColorwayTitle("John Nightfall"), true);
assert.equal(sandbox.cleanProductTitle("John Nightfall", "P448®", productUrl), "John Nightfall");
assert.equal(sandbox.looksLikeVariantDescriptor("Green Beige"), true);
assert.equal(sandbox.looksLikeModelColorwayTitle("Green Beige"), false);
assert.equal(sandbox.looksLikeVariantDescriptor("Marte Green Beige"), false);
assert.equal(sandbox.looksLikeModelColorwayTitle("Marte Green Beige"), true);
assert.equal(sandbox.cleanBrandName("Marte Green Beige"), "");
assert.equal(sandbox.cleanProductTitle("Marte Green Beige", "P448®", productUrl), "Marte Green Beige");

const listingPrice = sandbox.findBestPrice("0 € (275 €)");
assert.equal(listingPrice.amount, 275);
assert.equal(listingPrice.compareAtAmount, undefined);
const tinyPollutedListingPrice = sandbox.findBestPrice("5 € (275 €)");
assert.equal(tinyPollutedListingPrice.amount, 275);
assert.equal(tinyPollutedListingPrice.compareAtAmount, undefined);
const standaloneSmallPrice = sandbox.findBestPrice("5 €");
assert.equal(standaloneSmallPrice.amount, 5);
assert.equal(standaloneSmallPrice.compareAtAmount, undefined);
const normalizedListingPrice = sandbox.normalizePrice({
  amount: 0,
  currency: "EUR",
  text: "0 € (275 €)"
});
assert.equal(normalizedListingPrice.amount, 275);
assert.equal(normalizedListingPrice.compareAtAmount, undefined);
const normalizedTinyPollutedPrice = sandbox.normalizePrice({
  amount: 5,
  currency: "EUR",
  compareAtAmount: 275,
  compareAtText: "275 €"
});
assert.equal(normalizedTinyPollutedPrice.amount, 275);
assert.equal(normalizedTinyPollutedPrice.compareAtAmount, undefined);
const p448ShippingThresholdPrice = sandbox.bestProductPrice({
  url: "https://p448.com/products/s26monza1-w-420",
  pagePriceProduct: {
    priceText: "165 € 275 €",
    priceAmount: 165,
    currency: "EUR",
    compareAtPriceText: "275 €",
    compareAtPriceAmount: 275,
    isSale: true
  },
  commonSelectorProduct: {
    priceText: "275 €",
    priceAmount: 275,
    currency: "EUR"
  },
  contextualProduct: {},
  priceSources: [
    { priceText: "275 €", priceAmount: 275, currency: "EUR", fromJsonLd: true },
    { priceText: "275 €", priceAmount: 275, currency: "EUR" }
  ]
});
assert.equal(p448ShippingThresholdPrice.amount, 275);
assert.equal(p448ShippingThresholdPrice.compareAtAmount, undefined);
assert.equal(p448ShippingThresholdPrice.isSale, undefined);
const p448VisibleOnlyShippingThresholdPrice = sandbox.bestProductPrice({
  url: "https://p448.com/products/s26monza1-w-420",
  pagePriceProduct: {
    priceText: "165 € 275 €",
    priceAmount: 165,
    currency: "EUR",
    compareAtPriceText: "275 €",
    compareAtPriceAmount: 275,
    isSale: true
  },
  commonSelectorProduct: {},
  contextualProduct: {},
  priceSources: []
});
assert.equal(p448VisibleOnlyShippingThresholdPrice.amount, 275);
assert.equal(p448VisibleOnlyShippingThresholdPrice.currency, "EUR");
assert.equal(p448VisibleOnlyShippingThresholdPrice.originalText, "275 €");
assert.equal(p448VisibleOnlyShippingThresholdPrice.compareAtAmount, undefined);
assert.equal(p448VisibleOnlyShippingThresholdPrice.isSale, undefined);
assert.equal(
  sandbox.parsePricesFromText("FREE SHIPPING ON EU ORDERS €165+").length,
  0
);
const shippingThresholdElement = {
  getAttribute: () => "",
  innerText: "FREE SHIPPING ON EU ORDERS €165+",
  textContent: "FREE SHIPPING ON EU ORDERS €165+"
};
assert.deepEqual(Array.from(sandbox.priceTextsFromElement(shippingThresholdElement)), []);
const visibleCardPriceElement = {
  getAttribute: () => "",
  innerText: "€249,00",
  textContent: "€249,00"
};
assert.deepEqual(Array.from(sandbox.priceTextsFromElement(visibleCardPriceElement)), ["249 €"]);
const baliShippingThresholdPrice = sandbox.findBestPrice([
  "FREE SHIPPING ON EU ORDERS €165+",
  "Bali Diego",
  "€249,00"
]);
assert.equal(baliShippingThresholdPrice.amount, 249);
assert.equal(baliShippingThresholdPrice.compareAtAmount, undefined);
const baliCollapsedChromePrice = sandbox.findBestPrice(
  "FREE SHIPPING ON EU ORDERS €165+ Marte Green Beige €275,00 Bali Diego €249,00"
);
assert.equal(baliCollapsedChromePrice.amount, 249);
assert.equal(baliCollapsedChromePrice.compareAtAmount, undefined);

const monzaProductUrl = "https://p448.com/products/s26monza1-w-420";
const monzaFetchedDoc = {
  title: "Monza Patina Sky - P448",
  body: {
    textContent: "SHOP SALE FREE SHIPPING ON EU ORDERS €165+ MONZA PATINA SKY €275,00 3 payments of €91.66 with Klarna Shipping & returns"
  },
  querySelectorAll(selector) {
    if (selector === 'script[type="application/ld+json"]') {
      return [{
        textContent: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Monza Patina Sky",
          brand: { "@type": "Brand", name: "P448" },
          url: monzaProductUrl,
          image: ["https://p448.com/cdn/shop/files/monza.jpg"],
          offers: {
            "@type": "Offer",
            url: monzaProductUrl,
            price: "275.00",
            priceCurrency: "EUR"
          }
        })
      }];
    }
    return [];
  },
  querySelector(selector) {
    const meta = {
      'meta[property="og:title"], meta[name="og:title"]': "Monza Patina Sky",
      'meta[property="og:url"], meta[name="og:url"]': monzaProductUrl,
      'meta[property="og:image"], meta[name="og:image"]': "https://p448.com/cdn/shop/files/monza.jpg",
      'meta[property="og:price:amount"], meta[name="og:price:amount"]': "275,00",
      'meta[property="og:price:currency"], meta[name="og:price:currency"]': "EUR",
      'meta[property="product:price:amount"], meta[name="product:price:amount"]': "275,00",
      'meta[property="product:price:currency"], meta[name="product:price:currency"]': "EUR"
    }[selector];
    return meta ? { content: meta } : null;
  }
};
const monzaFetchedProduct = sandbox.extractFromFetchedProductPage(monzaFetchedDoc, monzaProductUrl);
assert.equal(monzaFetchedProduct.priceAmount, 275);
assert.equal(monzaFetchedProduct.currency, "EUR");
assert.equal(monzaFetchedProduct.compareAtPriceAmount, undefined);
assert.equal(monzaFetchedProduct.isSale, undefined);

sandbox.findJsonLdProduct = () => ({
  title: "John Nightfall",
  url: `${productUrl}?variant=54079901401473`,
  priceText: "249 €",
  priceAmount: 249,
  currency: "EUR",
  imageUrl: productImage
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "John Nightfall",
  url: productUrl,
  priceText: "249 €",
  priceAmount: 249,
  currency: "EUR",
  imageUrl: productImage
});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromMeta = () => ({
  title: "John Nightfall - Women's Low-Top White Leather Sneaker",
  brand: "P448®",
  url: productUrl,
  imageUrl: productImage
});
sandbox.extractFromPagePrice = () => ({
  priceText: "249 €",
  priceAmount: 249,
  currency: "EUR"
});
sandbox.extractFromContext = () => ({
  fromContext: true,
  title: "JOHN NIGHTFALL",
  brand: "JOHN NIGHTFALL",
  url: productUrl,
  priceText: "249 €",
  priceAmount: 249,
  currency: "EUR",
  imageUrl: productImage
});

const extracted = sandbox.extractProduct({ linkUrl: productUrl });
assert.equal(extracted.url, productUrl);
assert.equal(extracted.brand, "P448");
assert.equal(extracted.title, "John Nightfall");
assert.equal(extracted.priceAmount, 249);
assert.equal(extracted.currency, "EUR");
assert.equal(extracted.imageUrl, productImage);

const quality = sandbox.attachExtractionQuality(extracted);
assert.equal(quality.extraction.fields.brand.value, "P448");
assert.equal(quality.extraction.fields.brand.needsReview, false);
assert.equal(quality.extraction.fields.title.value, "John Nightfall");
assert.equal(quality.extraction.fields.title.needsReview, false);

console.log("p448 product smoke passed");
