const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl = "https://fablestore.ru/catalog/man/shirts/rubashka_bulletproof_blue/";
const productImage = "https://fablestore.ru/upload/iblock/cd9/t03jmt5bo525ns6c3th5p8p60x4yfmxi.jpg";

const sandbox = {
  URL,
  Intl,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    body: { textContent: "" },
    title: "Рубашка FABLE BULLETPROOF (Blue) - интернет-магазин FABLE",
    querySelector: () => null,
    querySelectorAll: () => []
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

assert.equal(sandbox.numericPrice("8&nbsp;330 &#8381;"), 8330);
assert.equal(sandbox.currencyFromText("8&nbsp;330 &#8381;"), "RUB");
assert.equal(sandbox.cleanBrandName("fablestore"), "F | ABLE");

sandbox.findJsonLdProduct = () => ({
  title: "Рубашка Bulletproof Blue",
  brand: "F | ABLE",
  url: productUrl,
  priceText: "8&nbsp;330 &#8381;",
  priceAmount: sandbox.numericPrice("8&nbsp;330 &#8381;"),
  currency: "RUB",
  imageUrl: productImage
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "РУБАШКА BULLETPROOF BLUE",
  url: productUrl,
  priceText: "8 330 ₽ 11 900 ₽",
  priceAmount: 8330,
  currency: "RUB",
  compareAtPriceText: "11 900 ₽",
  compareAtPriceAmount: 11900,
  isSale: true
});
sandbox.extractFromEmbeddedJson = () => ({
  title: "Рубашка Bulletproof Blue",
  brand: "F | ABLE",
  url: productUrl,
  priceText: "8 330 ₽",
  priceAmount: 8330,
  currency: "RUB",
  compareAtPriceText: "11 900 ₽",
  compareAtPriceAmount: 11900,
  isSale: true,
  imageUrl: productImage
});
sandbox.extractFromMeta = () => ({
  title: "Рубашка FABLE BULLETPROOF (Blue) - интернет-магазин FABLE",
  brand: "F | ABLE",
  url: productUrl,
  imageUrl: "https://fablestore.ru/img/logo2.svg"
});
sandbox.extractFromPagePrice = () => ({
  priceText: "8 330 ₽ 11 900 ₽",
  priceAmount: 8330,
  currency: "RUB",
  compareAtPriceText: "11 900 ₽",
  compareAtPriceAmount: 11900,
  isSale: true
});
sandbox.extractFromContext = () => ({});

const extracted = sandbox.extractProduct({});
assert.equal(extracted.brand, "F | ABLE");
assert.equal(extracted.title, "Рубашка Bulletproof Blue");
assert.equal(extracted.priceAmount, 8330);
assert.equal(sandbox.cleanText(extracted.priceText), "8 330 ₽");
assert.equal(extracted.compareAtPriceAmount, 11900);
assert.equal(sandbox.cleanText(extracted.compareAtPriceText), "11 900 ₽");
assert.equal(extracted.isSale, true);
assert.equal(extracted.imageUrl, productImage);

const saleItem = {
  price: {
    amount: 8330,
    currency: "RUB",
    originalText: "8 330 ₽",
    compareAtAmount: 11900,
    compareAtText: "11 900 ₽",
    isSale: true
  }
};
sandbox.panelState.summaryCurrency = "GBP";
sandbox.panelState.summaryRate = { currency: "GBP", value: 113 };
sandbox.saleItem = saleItem;
const html = vm.runInContext("renderSitePriceHtml(saleItem, 'wp')", sandbox);
assert.match(html, /wp-site-price is-sale/);
assert.match(html, /wp-compare-price/);
assert.match(html, /wp-native-price/);
assert.match(html, /<span class="wp-price-line">[\s\S]*?<\/span>\s*<span class="wp-native-price"/, "Native sale pair should render after the primary price line");

console.log("fablestore product smoke passed");
