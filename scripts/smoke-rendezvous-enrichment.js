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
    title: "Интернет-магазин обуви и одежды Rendez-Vous",
    body: { textContent: "" },
    querySelector: () => null,
    querySelectorAll: () => []
  },
  location: new URL("https://www.rendez-vous.ru/")
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

const productUrl =
  "https://www.rendez-vous.ru/catalog/bags/klatch/lumique_lum_bgs26_01_olivkovyy-5144377/";
const productImage =
  "https://static.rendez-vous.ru/files/catalog_models/resize_750x900/5/5144377_klatch_lumique_lum_bgs26_01_olivkovyy_tekstil_.jpg";
const malformedProductImage = `https://www.rendez-vous.ru${productImage}`;
const productDoc = {
  title: "Клатч LUMIQUE LUM BGS26-01 ОЛИВКОВЫЙ - купить в Москве | 5144377",
  body: { textContent: "" },
  querySelectorAll: () => [],
  querySelector: (selector) => {
    if (selector.includes("data-productinfo") || selector.includes("data-modelname")) {
      return {
        getAttribute: (name) => ({
          "data-productinfo": "{'name': 'LUMIQUE LUM BGS26-01', 'id': '5144377', 'price': '15000.0000', 'brand': 'LUMIQUE', 'category': 'Клатч/female'}",
          "data-modelname": "LUMIQUE LUM BGS26-01 оливковый",
          "data-modelcode": "5144377",
          "data-vendor": "LUMIQUE",
          "data-topay": "15000.0000",
          "data-image": malformedProductImage
        })[name] || ""
      };
    }
    return null;
  }
};

const extracted = sandbox.extractRendezVousProductFromFetchedPage(productDoc, productUrl);
assert.equal(extracted.title, "Lum Bgs26-01 Оливковый");
assert.equal(extracted.brand, "LUMIQUE");
assert.equal(extracted.priceAmount, 15000);
assert.equal(extracted.currency, "RUB");
assert.equal(extracted.imageUrl, productImage);

sandbox.fetch = async () => ({
  ok: true,
  text: async () => "<html></html>",
  json: async () => ({})
});
sandbox.DOMParser = class {
  parseFromString() {
    return productDoc;
  }
};

sandbox.enrichProduct({
  title: "Интернет-магазин обуви и одежды Rendez-Vous",
  brand: "Rendez-Vous",
  url: productUrl,
  priceText: "18 990 ₽",
  priceAmount: 18990,
  currency: "RUB",
  imageUrl: "https://www.rendez-vous.ru/images/logo.png"
}).then((enriched) => {
  assert.equal(enriched.title, "Lum Bgs26-01 Оливковый");
  assert.equal(enriched.brand, "LUMIQUE");
  assert.equal(enriched.priceAmount, 15000);
  assert.equal(enriched.imageUrl, productImage);
  console.log("rendezvous enrichment smoke passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
