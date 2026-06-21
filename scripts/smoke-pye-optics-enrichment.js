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
    title: "Мужские оправы",
    body: { textContent: "" },
    querySelector: () => null,
    querySelectorAll: () => []
  },
  location: new URL("https://pyeoptics.com/opravy-ochki-dlya-zreniya/")
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

const pyeUrl = "https://pyeoptics.com/shop/catalogue/theo-m_8772/";
const pyeImage =
  "https://image.pyeoptics.com/images/products/2026/06/09/1781017670/800x400/1angle1.jpg";
const pyeDoc = {
  title: "Купить очки Theo M Ripe banana | P.Y.E.",
  body: { textContent: "Theo M Ripe banana 12 300 ₽ 13 000 ₽" },
  querySelectorAll: () => [],
  querySelector: (selector) => {
    if (selector.includes("description")) {
      return {
        content:
          "Закажите очки Theo M Ripe banana в интернет-магазине оптики P.Y.E. Цена: 12300 рублей."
      };
    }
    if (selector.includes("og:title")) {
      return { content: "Очки Theo M Ripe banana купить за 12300 руб. | P.Y.E." };
    }
    if (selector.includes("og:image")) {
      return { content: pyeImage };
    }
    if (selector.includes("og:url")) {
      return { content: pyeUrl };
    }
    return null;
  }
};

sandbox.fetch = async () => ({
  ok: true,
  text: async () => "<html></html>",
  json: async () => ({})
});
sandbox.DOMParser = class {
  parseFromString() {
    return pyeDoc;
  }
};

const pyeSource = sandbox.clickedDifferentProductSources(
  {
    fromContext: true,
    title: "Мужские Оправы",
    brand: "pyeoptics.com",
    priceText: "12 300 ₽",
    priceAmount: 12300,
    currency: "RUB",
    compareAtPriceText: "13 000 ₽",
    compareAtPriceAmount: 13000
  },
  {},
  pyeUrl
)[0];
assert.equal(pyeSource.title, "theo m");
assert.equal(pyeSource.brand, "PYE");
assert.equal(pyeSource.url, pyeUrl);

async function run() {
  const enriched = await sandbox.enrichProduct({
    fromContext: true,
    title: "Мужские Оправы",
    brand: "pyeoptics.com",
    url: pyeUrl,
    priceText: "12 300 ₽",
    priceAmount: 12300,
    currency: "RUB",
    compareAtPriceText: "13 000 ₽",
    compareAtPriceAmount: 13000
  });

  assert.equal(enriched.title, "Theo M Ripe Banana");
  assert.equal(enriched.brand, "PYE");
  assert.equal(enriched.priceAmount, 12300);
  assert.equal(enriched.compareAtPriceAmount, undefined);
  assert.equal(enriched.imageUrl, pyeImage);

  const pyeListingUrl = "https://pyeoptics.com/opravy-ochki-dlya-zreniya/muzhskie/";
const pyeListingImage =
  "https://image.pyeoptics.com/images/products/2026/06/09/1781017670/2000xAUTO/1angle1.jpg";
const pyeGivenItems = JSON.stringify([
  {
    url: "/shop/catalogue/theo-m_8772/",
    id: 8772,
    title: "Theo M",
    attributes: [{ code: "Цвет оправы", value: "Ripe banana" }],
    images: [{ extra_large: pyeListingImage }],
    price: 12300,
    discount: { type: "Absolute", value: 0 },
    lenses_type: "Оптика"
  }
]).replace(/"/g, "&quot;");
const pyeGivenItemsElement = {
  getAttribute: (attribute) => attribute === "v-bind:given-items" ? pyeGivenItems : ""
};
const pyeCardNode = {
  innerText: "Theo M\nRipe banana\n12 300 ₽",
  textContent: "Theo M Ripe banana 12 300 ₽",
  closest: () => pyeCardNode,
  matches: (selector) => selector === "img",
  querySelector: () => ({
    alt: "Theo M Ripe banana",
    title: "",
    currentSrc: pyeListingImage,
    src: pyeListingImage,
    getAttribute: (attribute) => attribute === "src" ? pyeListingImage : ""
  })
};

sandbox.location = new URL(pyeListingUrl);
sandbox.document.title = "Мужские оправы P.Y.E | P.Y.E";
sandbox.document.querySelectorAll = (selector) =>
  selector === "[v-bind\\:given-items]" ? [pyeGivenItemsElement] : [];
sandbox.document.querySelector = () => null;
sandbox.getContextTarget = () => pyeCardNode;
sandbox.extractFromContext = () => ({
  fromContext: true,
  title: "Мужские Оправы",
  brand: "Theo M",
  url: pyeListingUrl,
  priceText: "12 300 ₽ (13 000 ₽)",
  priceAmount: 12300,
  currency: "RUB",
  compareAtPriceText: "13 000 ₽",
  compareAtPriceAmount: 13000
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromCommonSelectors = () => ({
  title: "Мужские оправы",
  brand: "Theo M",
  url: pyeListingUrl,
  priceText: "12 300 ₽ (13 000 ₽)",
  priceAmount: 12300,
  currency: "RUB",
  compareAtPriceText: "13 000 ₽",
  compareAtPriceAmount: 13000
});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});

const pyeListingExtracted = sandbox.extractProduct({});
assert.equal(pyeListingExtracted.url, pyeUrl);
assert.equal(pyeListingExtracted.brand, "PYE");
assert.equal(pyeListingExtracted.title, "Theo M Ripe Banana");
assert.equal(pyeListingExtracted.priceAmount, 12300);
assert.equal(pyeListingExtracted.compareAtPriceAmount, undefined);
assert.equal(pyeListingExtracted.imageUrl, pyeListingImage);

  console.log("pye optics enrichment smoke passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
