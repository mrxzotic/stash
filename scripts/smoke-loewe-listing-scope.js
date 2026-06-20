const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "extension/manifest.json"), "utf8"));
const scripts = manifest.content_scripts[0].js.filter((file) => file !== "content/bootstrap.js");
const categoryUrl = "https://www.loewe.com/eur/en/women/bags/bucket-bags";
const bilbaoUrl =
  "https://www.loewe.com/eur/en/women/bags/bucket-bags/medium-bilbao-bucket-in-smooth-calfskin/AWRAWPRX01-5984.html";
const pebbleUrl =
  "https://www.loewe.com/eur/en/women/bags/pebble/mini-pebble-bucket-bag-in-soft-grained-calfskin/AANBBMX02-1100.html";

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
    return this[name] || "";
  }
}

const bilbaoCard = new FakeElement("article", {
  className: "product-card",
  text: "Medium Bilbao bucket in smooth calfskin\n2.700€",
  rect: { left: 100, top: 300, width: 300, height: 520 },
  children: [
    new FakeElement("a", {
      href: bilbaoUrl,
      children: [
        new FakeElement("img", {
          alt: "Medium Bilbao bucket in smooth calfskin",
          src: "https://www.loewe.com/example/bilbao.jpg",
          rect: { left: 100, top: 360, width: 300, height: 360 }
        })
      ]
    })
  ]
});

const pebbleImage = new FakeElement("img", {
  alt: "",
  src: "https://www.loewe.com/example/mini-pebble.jpg",
  rect: { left: 700, top: 360, width: 300, height: 360 }
});
const pebbleCard = new FakeElement("article", {
  className: "product-card",
  text: "Mini Pebble Bucket bag in soft grained calfskin\n+ Colour\n1.900€",
  rect: { left: 700, top: 300, width: 300, height: 520 },
  children: [
    new FakeElement("a", {
      href: pebbleUrl,
      children: [pebbleImage]
    })
  ]
});
const grid = new FakeElement("div", {
  className: "product-grid",
  rect: { left: 80, top: 280, width: 960, height: 600 },
  children: [bilbaoCard, pebbleCard]
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
    elementsFromPoint: () => [pebbleImage],
    title: "Bucket Bags | LOEWE"
  },
  location: new URL(categoryUrl),
  chrome: {
    runtime: {
      getURL: (assetPath) => `chrome-extension://stash/${assetPath}`
    },
    storage: {
      local: {},
      onChanged: { addListener: () => {} }
    }
  },
  __pebbleImage: pebbleImage
};

vm.createContext(sandbox);

scripts.forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, "extension", file), "utf8"), sandbox, {
    filename: file
  });
});

vm.runInContext(
  `
  lastContextTarget = __pebbleImage;
  lastContextPoint = { x: 850, y: 540 };
  findJsonLdProduct = () => ({});
  extractFromMicrodata = () => ({});
  extractFromEmbeddedJson = () => ({});
  extractFromCommonSelectors = () => ({});
  extractFromMeta = () => ({});
  extractFromPagePrice = () => ({});
  `,
  sandbox
);

assert.equal(sandbox.hasMultipleProductPageUrls(grid), true);
assert.equal(sandbox.hasMultipleProductPageUrls(pebbleCard), false);
assert.equal(sandbox.cleanBrandName("+ Colour"), "");

const extracted = sandbox.extractProduct({ linkUrl: pebbleUrl });
assert.equal(extracted.url, pebbleUrl);
assert.equal(extracted.brand, "Loewe");
assert.equal(extracted.title, "Mini Pebble Bucket Bag In Soft Grained Calfskin");
assert.equal(extracted.priceAmount, 1900);
assert.equal(extracted.compareAtPriceAmount, undefined);
assert.equal(extracted.imageUrl, "https://www.loewe.com/example/mini-pebble.jpg");

console.log("loewe listing scope smoke passed");
