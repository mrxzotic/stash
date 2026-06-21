const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const listingUrl = "https://www.acnestudios.com/us/en/man/trousers/";
const productUrl = "https://www.acnestudios.com/us/en/rw-mn-trou000042/BK0776-228.html?g=man";
const fallbackImage = "https://cdn.acnestudios.com/static/fallback-image/AcneStudios.png";
const productImage =
  "https://www.acnestudios.com/dw/image/v2/AAXV_PRD/on/demandware.static/-/Sites-acne-product-catalog/default/dw00000000/images/BK/BK0776-/2000x/BK0776-228_A.jpg?sw=750&sh=1125";
const productHoverImage =
  "https://www.acnestudios.com/dw/image/v2/AAXV_PRD/on/demandware.static/-/Sites-acne-product-catalog/default/dw00000000/images/BK/BK0776-/2000x/BK0776-228_PLP_HOVER.jpg?sw=750&sh=1125";

class FakeElement {
  constructor(tagName, options = {}) {
    this.tagName = tagName.toUpperCase();
    this.nodeType = 1;
    this.isConnected = true;
    this.href = options.href || "";
    this.className = options.className || "";
    this.alt = options.alt || "";
    this.title = options.title || "";
    this.src = options.src || "";
    this.currentSrc = options.currentSrc || this.src;
    this.srcset = options.srcset || "";
    this.naturalWidth = options.naturalWidth || options.width || 750;
    this.width = options.width || 750;
    this.rect = options.rect || { left: 0, top: 0, width: 300, height: 450 };
    this.attributes = options.attributes || {};
    this.ownText = options.text || "";
    this.children = options.children || [];
    this.parentElement = null;
    this.children.forEach((child) => {
      child.parentElement = this;
    });
  }

  get innerText() {
    return [this.ownText, ...this.children.map((child) => child.innerText)].filter(Boolean).join("\n");
  }

  get textContent() {
    return this.innerText;
  }

  matches(selector) {
    return selector.split(",").some((part) => this.matchesOne(part.trim()));
  }

  matchesOne(selector) {
    if (selector === "a[href]") return this.tagName === "A" && Boolean(this.href);
    if (selector === "img") return this.tagName === "IMG";
    if (selector === "picture") return this.tagName === "PICTURE";
    if (selector === "source") return this.tagName === "SOURCE";
    if (selector === "article" || selector === "li" || selector === "a" || selector === "div") {
      return this.tagName.toLowerCase() === selector;
    }
    return false;
  }

  querySelectorAll(selector) {
    return this.descendants().filter((element) => element.matches(selector));
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  closest(selector) {
    let node = this;
    while (node) {
      if (node.matches(selector)) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  descendants() {
    return this.children.flatMap((child) => [child, ...child.descendants()]);
  }

  getBoundingClientRect() {
    return this.rect;
  }

  getAttribute(name) {
    return this.attributes[name] || "";
  }
}

const headerImage = new FakeElement("img", {
  alt: "Acne Studios",
  src: fallbackImage,
  rect: { left: 0, top: 0, width: 900, height: 250 }
});
const overlayLink = new FakeElement("a", {
  href: productUrl,
  className: "tile__link",
  attributes: { "data-product-tile-component": "productLink" },
  rect: { left: 700, top: 340, width: 300, height: 540 }
});
const mainImage = new FakeElement("img", {
  alt: "RW-MN-TROU000042, Light blue, Image 1",
  src: productImage,
  srcset: `${productImage.replace("sw=750&sh=1125", "sw=560&sh=840")} 560w, ${productImage} 750w`,
  attributes: { "data-product-tile-component": "mainImage" },
  rect: { left: 700, top: 360, width: 300, height: 450 }
});
const hoverImage = new FakeElement("img", {
  alt: "RW-MN-TROU000042, Light blue, Image 2",
  src: productHoverImage,
  className: "on--tile-active",
  attributes: { "data-product-tile-component": "hoverImage" },
  rect: { left: 700, top: 360, width: 300, height: 450 }
});
const imageLink = new FakeElement("a", {
  href: productUrl,
  className: "horizontal-slider__item",
  children: [mainImage, hoverImage]
});
const titleLink = new FakeElement("a", {
  href: productUrl,
  title: "Trompe-l’œil tape jeans",
  text: "Trompe-l’œil tape jeans"
});
const productTile = new FakeElement("div", {
  className: "tile tile--span-4 tile--has-link product-tile",
  text: "Trompe-l’œil tape jeans\nCurrent colour: Light blue\nPrice: $1,150.",
  attributes: { "data-product-id": "BK0776-228" },
  rect: { left: 680, top: 320, width: 340, height: 610 },
  children: [overlayLink, imageLink, titleLink]
});
const grid = new FakeElement("div", {
  className: "search-section__body product-grid",
  text: "Men's Trousers\n45 items",
  rect: { left: 80, top: 260, width: 1200, height: 900 },
  children: [headerImage, productTile]
});
const body = new FakeElement("body", {
  rect: { left: 0, top: 0, width: 1440, height: 900 },
  children: [grid]
});

const sandbox = {
  URL,
  console,
  Node: { ELEMENT_NODE: 1 },
  window: { innerWidth: 1440, innerHeight: 900, clearTimeout: () => {} },
  document: {
    body,
    documentElement: {},
    querySelector: () => null,
    querySelectorAll: (selector) => body.querySelectorAll(selector),
    elementsFromPoint: () => [overlayLink, mainImage],
    title: "Acne Studios - Men's Trousers"
  },
  location: new URL(listingUrl),
  __overlayLink: overlayLink
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
  "extension/content/extractors/enrich.js",
  "extension/content/extractors/anchors.js"
].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
    filename: file
  });
});

vm.runInContext(
  `
  lastContextTarget = __overlayLink;
  lastContextPoint = { x: 850, y: 560 };
  findJsonLdProduct = () => ({});
  extractFromMicrodata = () => ({});
  extractFromEmbeddedJson = () => ({});
  extractFromCommonSelectors = () => ({});
  extractFromMeta = () => ({
    title: "www.acnestudios.com",
    brand: "Acne Studios",
    url: location.href,
    imageUrl: "${fallbackImage}"
  });
  extractFromPagePrice = () => ({});
  `,
  sandbox
);

assert.equal(sandbox.isUsableProductImageUrl(fallbackImage), false);
assert.equal(sandbox.findLikelyBrand(["Trompe-l’œil tape jeans"], "", ""), "Acne Studios");

const extracted = sandbox.extractProduct({ linkUrl: productUrl });
assert.equal(extracted.url, productUrl);
assert.equal(extracted.brand, "Acne Studios");
assert.equal(extracted.title, "Trompe-L’Œil Tape Jeans");
assert.equal(extracted.priceAmount, 1150);
assert.equal(extracted.imageUrl, productImage);
assert.equal(extracted.imageUrls.includes(fallbackImage), false);

console.log("acne listing card smoke passed");
