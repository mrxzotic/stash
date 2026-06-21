const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const productUrl =
  "https://en.krakatauwear.com/collections/mens-spring-summer-2026/products/raincoat-qm572?variant=60972861718858";
const offWhiteImage =
  "https://cdn.shopify.com/s/files/1/0419/8763/7403/files/Qm572_43_01_e040c55a-d041-4053-8773-9ee7f3ad3921.jpg?v=1780130484";
const selectedImage =
  "https://cdn.shopify.com/s/files/1/0419/8763/7403/files/Qm572_513_01_7c3fca25-b3f4-424a-9d0c-c4d7b60ffde5.jpg?v=1780130484";
const shopifyData = {
  title: "SAGITTARIUS A Raincoat Qm572",
  vendor: "KRAKATAU",
  price: 30000,
  price_min: 30000,
  type: "JACKETS",
  featured_image: offWhiteImage,
  images: [offWhiteImage],
  variants: [
    {
      id: 60972861718858,
      title: "Dark Urban Chic / XS",
      sku: "Qm572-513-XS",
      price: 30000,
      featured_image: { src: selectedImage }
    }
  ]
};
const sandbox = {
  URL,
  console,
  fetch: async (url) => {
    assert.equal(url, "https://en.krakatauwear.com/products/raincoat-qm572.js");
    return { ok: true, json: async () => shopifyData };
  },
  window: {
    innerWidth: 1440,
    innerHeight: 900,
    getComputedStyle: () => ({ display: "block", visibility: "visible", opacity: "1" })
  },
  document: {
    body: { textContent: "EUR €300" },
    querySelector: () => null,
    querySelectorAll: () => [],
    title: "SAGITTARIUS A Raincoat Qm572"
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

(async () => {
  const enriched = await sandbox.enrichProduct({
    title: "SAGITTARIUS A Raincoat Qm572",
    brand: "KRAKATAU",
    url: productUrl,
    priceText: "300 €",
    priceAmount: 300,
    currency: "EUR",
    imageUrl: offWhiteImage,
    imageUrls: [offWhiteImage],
    fromProductPage: true
  });

  assert.equal(enriched.url, productUrl);
  assert.equal(enriched.title, "Sagittarius A Raincoat Qm572-513");
  assert.equal(enriched.priceAmount, 300);
  assert.equal(enriched.currency, "EUR");
  assert.equal(enriched.imageUrl, selectedImage);
  console.log("krakatau selected variant smoke passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
