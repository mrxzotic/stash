const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "extension/manifest.json"), "utf8"));
const scripts = manifest.content_scripts[0].js.filter((file) => file !== "content/bootstrap.js");
const listingUrl = "https://www.tomfordfashion.co.uk/en-gb/sale-men/";
const bomberUrl =
  "https://www.tomfordfashion.co.uk/en-gb/silk-satin-bomber%C2%A0/OBB010-FMS072.html";
const bomberImage =
  "https://cdn.media.amplience.net/i/tom_ford/OBB010-FMS072_ZLBFG_APPENDGRID";

class FakeElement {
  constructor(tagName, options = {}) {
    this.tagName = tagName.toUpperCase();
    this.nodeType = 1;
    this.isConnected = true;
    this.href = options.href || "";
    this.className = options.className || "";
    this.alt = options.alt || "";
    this.src = options.src || "";
    this.currentSrc = options.currentSrc || this.src;
    this.srcset = options.srcset || "";
    this.naturalWidth = options.naturalWidth || 900;
    this.width = options.width || 450;
    this.rect = options.rect || { left: 0, top: 0, width: 300, height: 300 };
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
      if (node.matches(selector)) return node;
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
    return this[name] || "";
  }
}

const bomberImg = new FakeElement("img", {
  alt: "SILK SATIN BOMBER",
  src: bomberImage,
  srcset: [
    `${bomberImage}?w=385 385w`,
    `${bomberImage}?w=1154 1154w`,
    `${bomberImage}?w=2307 2307w`
  ].join(", "),
  rect: { left: 120, top: 460, width: 420, height: 520 }
});
const bomberLink = new FakeElement("a", {
  href: bomberUrl,
  text: "SILK SATIN BOMBER",
  children: [bomberImg]
});
const bomberCard = new FakeElement("div", {
  className: "product",
  text: "SILK SATIN BOMBER\n£2,550\n£4,250",
  rect: { left: 100, top: 430, width: 450, height: 720 },
  children: [bomberLink]
});
const shirtCard = new FakeElement("div", {
  className: "product",
  text: "MICRO GINGHAM TWILL SLIM FIT SHIRT\n£432\n£720",
  rect: { left: 600, top: 430, width: 450, height: 720 },
  children: [
    new FakeElement("a", {
      href: "https://www.tomfordfashion.co.uk/en-gb/micro-gingham-twill-slim-fit-shirt/HSBC01-CGP94.html"
    })
  ]
});
const grid = new FakeElement("div", {
  className: "product-grid",
  rect: { left: 80, top: 400, width: 960, height: 760 },
  children: [bomberCard, shirtCard]
});
const body = new FakeElement("body", {
  rect: { left: 0, top: 0, width: 1440, height: 900 },
  children: [grid]
});

const sandbox = {
  URL,
  console,
  Node: { ELEMENT_NODE: 1 },
  window: {
    innerWidth: 1440,
    innerHeight: 900,
    clearTimeout: () => {}
  },
  document: {
    body,
    documentElement: {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: (selector) => body.querySelectorAll(selector),
    elementsFromPoint: () => [bomberImg],
    title: "Men's SALE Designer Clothing, Shoes & Accessories | TOM FORD Fashion United Kingdom"
  },
  location: new URL(listingUrl),
  chrome: {
    runtime: {
      getURL: (assetPath) => `chrome-extension://stash/${assetPath}`
    },
    storage: {
      local: {},
      onChanged: { addListener: () => {} }
    }
  },
  __bomberImg: bomberImg
};

vm.createContext(sandbox);
scripts.forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, "extension", file), "utf8"), sandbox, {
    filename: file
  });
});

vm.runInContext(
  `
  lastContextTarget = __bomberImg;
  lastContextPoint = { x: 320, y: 720 };
  findJsonLdProduct = () => ({});
  extractFromMicrodata = () => ({});
  extractFromEmbeddedJson = () => ({});
  extractFromCommonSelectors = () => ({});
  extractFromMeta = () => ({});
  extractFromPagePrice = () => ({});
  `,
  sandbox
);

assert.equal(sandbox.sourceNameFromUrl(listingUrl), "Tom Ford");
assert.equal(sandbox.cleanBrandName("SILK SATIN BOMBER"), "");
assert.equal(sandbox.isProductLikeUrl(bomberUrl), true);
assert.equal(sandbox.hasMultipleProductPageUrls(grid), true);
assert.equal(sandbox.hasMultipleProductPageUrls(bomberCard), false);

const extracted = sandbox.extractProduct({ linkUrl: bomberUrl });
assert.equal(extracted.url, bomberUrl);
assert.equal(extracted.brand, "Tom Ford");
assert.equal(extracted.title, "Silk Satin Bomber");
assert.equal(extracted.priceAmount, 2550);
assert.equal(extracted.compareAtPriceAmount, 4250);
assert.match(extracted.imageUrl, /OBB010-FMS072_ZLBFG_APPENDGRID\?w=2307$/);

console.log("tom ford listing card smoke passed");
