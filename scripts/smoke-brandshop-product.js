const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl = "https://brandshop.ru/goods/514405/chrm0001/";
const productImage = "https://img.brandshop.ru/cache/products/c/chrm0001-5_552x552.jpg";

class FakeElement {
  constructor(tagName, attrs = {}, children = [], text = "") {
    this.tagName = tagName.toUpperCase();
    this.attrs = attrs;
    this.children = children;
    this.text = text;
    this.parentElement = null;
    children.forEach((child) => {
      child.parentElement = this;
    });
  }

  get textContent() {
    return this.text || this.children.map((child) => child.textContent).join(" ");
  }

  get href() {
    return this.attrs.href || "";
  }

  get content() {
    return this.attrs.content || "";
  }

  getAttribute(name) {
    return this.attrs[name] || "";
  }

  hasAttribute(name) {
    return Object.prototype.hasOwnProperty.call(this.attrs, name);
  }

  matches(selector) {
    return selector.split(",").some((part) => matchesSelector(this, part.trim()));
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    return descendants(this).filter((element) => element.matches(selector));
  }
}

function descendants(element) {
  return element.children.flatMap((child) => [child, ...descendants(child)]);
}

function matchesSelector(element, selector) {
  const itemprop = selector.match(/^\[itemprop="([^"]+)"\]$/)?.[1];
  if (itemprop) return element.attrs.itemprop === itemprop;
  if (selector === "h1" || selector === "h2" || selector === "h3") {
    return element.tagName.toLowerCase() === selector;
  }
  if (selector === "a[href]") return element.tagName === "A" && Boolean(element.attrs.href);
  if (selector === "img") return element.tagName === "IMG";
  if (/^\[itemscope\]\[itemtype\*="schema\.org\/Product"/i.test(selector)) {
    return Boolean(element.attrs.itemscope) && /schema\.org\/Product/i.test(element.attrs.itemtype || "");
  }
  if (/^\[itemtype\*="schema\.org\/Product"/i.test(selector)) {
    return /schema\.org\/Product/i.test(element.attrs.itemtype || "");
  }
  return false;
}

const brandName = new FakeElement("span", { itemprop: "name" }, [], "Chrome Hearts");
const brandLink = new FakeElement("a", { itemprop: "url", href: "/chrome-hearts/" }, [brandName]);
const brandScope = new FakeElement(
  "span",
  { itemprop: "brand", itemscope: "", itemtype: "https://schema.org/Brand" },
  [brandLink]
);
const productName = new FakeElement(
  "span",
  { itemprop: "name" },
  [],
  "Мужская толстовка Scroll Logo Thermal Zip-Up Hoodie"
);
const titleNode = new FakeElement("h1", {}, [brandScope, productName]);
const imageNode = new FakeElement("meta", { itemprop: "image", content: productImage });
const offer = new FakeElement(
  "div",
  { itemprop: "offers", itemscope: "", itemtype: "http://schema.org/Offer" },
  [
    new FakeElement("meta", { itemprop: "price", content: "189690" }),
    new FakeElement("meta", { itemprop: "priceCurrency", content: "RUB" }),
    new FakeElement("link", { itemprop: "url", href: "/goods/514405/chrm0001/" })
  ]
);
const product = new FakeElement(
  "div",
  { itemscope: "", itemtype: "http://schema.org/Product" },
  [titleNode, imageNode, offer]
);

const sandbox = {
  URL,
  Intl,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    body: { textContent: "" },
    title: "Мужская толстовка Chrome Hearts Scroll Logo Thermal Zip-Up Hoodie, CHRM0001",
    querySelector: (selector) =>
      product.matches(selector) ? product : null,
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
  "extension/content/panel/items.js",
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

assert.equal(sandbox.isProductLikeUrl(productUrl), true);
assert.equal(sandbox.isMarketplaceProductUrl(productUrl), true);

const microdata = sandbox.extractFromMicrodata();
assert.equal(microdata.brand, "Chrome Hearts");
assert.equal(microdata.title, "Мужская Толстовка Scroll Logo Thermal Zip-Up Hoodie");
assert.equal(microdata.url, productUrl);
assert.equal(microdata.priceAmount, 189690);
assert.equal(microdata.currency, "RUB");
assert.equal(microdata.imageUrl, productImage);

const installmentPollutedPrice = sandbox.findBestPrice([
  "189 690 ₽",
  "по 47 422 ₽ х4 платежами с партнерами BRANDSHOP"
]);
assert.equal(sandbox.isInstallmentPriceText("по 47 422 ₽ х4 платежами с партнерами BRANDSHOP"), true);
assert.equal(installmentPollutedPrice.amount, 189690);
assert.equal(installmentPollutedPrice.currency, "RUB");
assert.equal(installmentPollutedPrice.compareAtAmount, undefined);
assert.equal(installmentPollutedPrice.isSale, false);

sandbox.findJsonLdProduct = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "Chrome Hearts",
  url: productUrl,
  priceText: "189 690 ₽",
  priceAmount: 189690,
  currency: "RUB"
});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromMeta = () => ({
  title: "Мужская толстовка Chrome Hearts Scroll Logo Thermal Zip-Up Hoodie, CHRM0001",
  url: productUrl,
  imageUrl: productImage,
  priceText: "189690",
  priceAmount: 189690,
  currency: "RUB"
});
sandbox.extractFromPagePrice = () => ({
  priceText: installmentPollutedPrice.originalText,
  priceAmount: installmentPollutedPrice.amount,
  currency: installmentPollutedPrice.currency,
  compareAtPriceText: installmentPollutedPrice.compareAtText,
  compareAtPriceAmount: installmentPollutedPrice.compareAtAmount,
  isSale: installmentPollutedPrice.isSale
});
sandbox.extractFromContext = () => ({});

const extracted = sandbox.extractProduct({});
assert.equal(extracted.brand, "Chrome Hearts");
assert.equal(extracted.title, "Мужская Толстовка Scroll Logo Thermal Zip-Up Hoodie");
assert.equal(extracted.source, "Brandshop");
assert.equal(extracted.priceAmount, 189690);
assert.equal(extracted.currency, "RUB");
assert.equal(extracted.compareAtPriceAmount, undefined);
assert.equal(extracted.isSale, false);
assert.equal(extracted.imageUrl, productImage);

const repairedStoredPrice = sandbox.normalizePanelPrice({
  url: productUrl,
  price: {
    amount: 47422,
    currency: "RUB",
    originalText: "47 422 ₽",
    compareAtAmount: 189690,
    compareAtText: "189 690 ₽",
    isSale: true
  }
});
assert.equal(repairedStoredPrice.amount, 189690);
assert.equal(sandbox.cleanText(repairedStoredPrice.originalText), "189 690 ₽");
assert.equal(repairedStoredPrice.compareAtAmount, undefined);
assert.equal(repairedStoredPrice.isSale, false);
assert.equal(repairedStoredPrice.rubAmount, undefined);
assert.equal(repairedStoredPrice.rubText, undefined);

console.log("brandshop product smoke passed");
