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
    title: "All Coats&Jackets",
    body: { textContent: "" },
    querySelector: () => null,
    querySelectorAll: () => []
  },
  location: new URL("https://www.sorelleera.com/collections/coats-jackets")
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
  "extension/content/pricing/noise.js",
  "extension/content/pricing/parse.js",
  "extension/content/extractors/embedded.js",
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

const sorelleUrl = "https://www.sorelleera.com/products/sonnet-windbreaker-light-pink";
const sorelleImage = "https://cdn.shopify.com/s/files/1/0622/3452/5834/files/sonnet.jpg";
const sorelleLines = ["Sonnet Windbreaker Light Pink", "557 $", "418 $", "XS-S"];
const sorelleBrand = sandbox.findLikelyBrand(sorelleLines, "", "");
const sorelleTitle = sandbox.findLikelyTitle(sorelleLines, "", "", sorelleBrand);
const sorellePrice = sandbox.findBestPrice(sorelleLines);

assert.equal(sandbox.sourceNameFromUrl(sorelleUrl), "Sorelle Era");
assert.equal(sorelleBrand, "Sorelle Era");
assert.equal(sorelleTitle, "Sonnet Windbreaker Light Pink");
assert.equal(sandbox.cleanBrandName("Sonnet Windbreaker Light Pink"), "");
assert.equal(sandbox.cleanProductTitle("XS-S", sorelleBrand, sorelleUrl), "Sonnet Windbreaker Light Pink");
assert.equal(sorellePrice.amount, 418);
assert.equal(sorellePrice.compareAtAmount, 557);

sandbox.findJsonLdProduct = () => ({});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromCommonSelectors = () => ({});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromContext = () => ({
  fromContext: true,
  title: sandbox.cleanProductTitle(sorelleTitle, sorelleBrand, sorelleUrl),
  brand: sandbox.cleanBrandName(sorelleBrand),
  url: sorelleUrl,
  imageUrl: sorelleImage,
  priceText: sorellePrice.originalText,
  priceAmount: sorellePrice.amount,
  currency: sorellePrice.currency,
  compareAtPriceText: sorellePrice.compareAtText,
  compareAtPriceAmount: sorellePrice.compareAtAmount,
  isSale: sorellePrice.isSale
});

const extracted = sandbox.extractProduct({ linkUrl: sorelleUrl });
assert.equal(extracted.title, "Sonnet Windbreaker Light Pink");
assert.equal(extracted.brand, "Sorelle Era");
assert.equal(extracted.priceAmount, 418);
assert.equal(extracted.compareAtPriceAmount, 557);
assert.equal(extracted.imageUrl, sorelleImage);
assert.equal(
  sandbox.needsProductPageDoubleCheck({ ...extracted, fromContext: true }),
  false,
  "High-confidence branded-shop cards should not need linked-page double-check"
);

const fetched = sandbox.extractFromFetchedProductPage({
  title: "Sonnet Windbreaker Light Pink",
  body: {
    textContent: "Sale Sonnet Windbreaker Light Pink 557 $ 418 $ Color Light Pink Size XS-S"
  },
  querySelectorAll: () => [],
  querySelector: (selector) => {
    if (selector === "h1") {
      return { textContent: "Sonnet Windbreaker Light Pink" };
    }
    if (selector.includes("og:image")) {
      return { content: sorelleImage };
    }
    if (selector.includes("og:url")) {
      return { content: sorelleUrl };
    }
    return null;
  }
}, sorelleUrl);

assert.equal(fetched.title, "Sonnet Windbreaker Light Pink");
assert.equal(fetched.brand, "Sorelle Era");
assert.equal(fetched.priceAmount, 418);
assert.equal(fetched.compareAtPriceAmount, 557);
assert.equal(fetched.imageUrl, sorelleImage);

const installmentPrice = sandbox.findBestPrice([
  "From 8 €/month with Klarna Learn more",
  "€254,95"
]);
assert.equal(installmentPrice.amount, 254.95);
assert.equal(sandbox.parsePricesFromText("From 8 €/month with Klarna Learn more").length, 0);

console.log("sorelle enrichment smoke passed");
