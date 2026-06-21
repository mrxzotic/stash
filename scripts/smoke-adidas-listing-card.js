const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { contentScriptFiles } = require("./content-script-files");

const root = path.resolve(__dirname, "..");
const scripts = contentScriptFiles(root).filter((file) => file !== "content/bootstrap.js");
const listingUrl = "https://www.adidas.fi/men-trainers";
const productUrl = "https://www.adidas.fi/superstar-vintage-shoes/JQ3255.html";
const productImage =
  "https://assets.adidas.com/images/w_1200,f_auto,q_auto/JQ3255_01_standard.jpg";

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

const wishlistButton = new FakeElement("button", {
  text: "Add to Wishlist",
  rect: { left: 1080, top: 380, width: 36, height: 36 }
});
const productPicture = new FakeElement("picture", {
  children: [
    new FakeElement("source", {
      srcset: [
        productImage.replace("w_1200", "w_600") + " 600w",
        productImage + " 1200w"
      ].join(", ")
    })
  ]
});
const productLink = new FakeElement("a", {
  href: productUrl,
  text: "Superstar Vintage Shoes",
  children: [productPicture]
});
const superstarCard = new FakeElement("article", {
  className: "product-card",
  text: "Add to Wishlist\n€ 160\nSuperstar Vintage Shoes\nOriginals\n3 colours",
  rect: { left: 930, top: 330, width: 300, height: 430 },
  children: [wishlistButton, productLink]
});
const saleCard = new FakeElement("article", {
  className: "product-card",
  text: "Add to Wishlist\n€ 80\n€ 250\nSamba OG Shoes\nOriginals",
  rect: { left: 1260, top: 330, width: 300, height: 430 },
  children: [
    new FakeElement("a", {
      href: "https://www.adidas.fi/samba-og-shoes/JI3200.html",
      children: [
        new FakeElement("picture", {
          children: [
            new FakeElement("source", {
              srcset: "https://assets.adidas.com/images/w_1200,f_auto,q_auto/JI3200_01_standard.jpg 1200w"
            })
          ]
        })
      ]
    })
  ]
});
const grid = new FakeElement("div", {
  className: "product-grid",
  rect: { left: 900, top: 300, width: 700, height: 500 },
  children: [superstarCard, saleCard]
});
const body = new FakeElement("body", {
  rect: { left: 0, top: 0, width: 1600, height: 900 },
  children: [grid]
});

const sandbox = {
  URL,
  console,
  Node: { ELEMENT_NODE: 1 },
  window: {
    innerWidth: 1600,
    innerHeight: 900,
    clearTimeout: () => {}
  },
  document: {
    body,
    documentElement: {},
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: (selector) => body.querySelectorAll(selector),
    elementsFromPoint: () => [wishlistButton],
    title: "Miesten tennarit · Men Sneakers"
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
  __wishlistButton: wishlistButton
};

vm.createContext(sandbox);
scripts.forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, "extension", file), "utf8"), sandbox, {
    filename: file
  });
});

vm.runInContext(
  `
  lastContextTarget = __wishlistButton;
  lastContextPoint = { x: 1098, y: 398 };
  findJsonLdProduct = () => ({});
  extractFromMicrodata = () => ({});
  extractFromEmbeddedJson = () => ({});
  extractFromCommonSelectors = () => ({});
  extractFromMeta = () => ({});
  extractFromPagePrice = () => ({});
  `,
  sandbox
);

assert.equal(sandbox.isNoiseLine("Add to Wishlist"), true);
assert.equal(sandbox.isProductLikeUrl(productUrl), true);
assert.equal(sandbox.hasMultipleProductPageUrls(grid), true);
assert.equal(sandbox.hasMultipleProductPageUrls(superstarCard), false);

const extracted = sandbox.extractProduct({ linkUrl: productUrl });
assert.equal(extracted.url, productUrl);
assert.equal(extracted.brand, "Adidas");
assert.equal(extracted.title, "Superstar Vintage Shoes");
assert.equal(extracted.priceAmount, 160);
assert.equal(extracted.compareAtPriceAmount, undefined);
assert.equal(extracted.imageUrl, productImage);

console.log("adidas listing card smoke passed");
