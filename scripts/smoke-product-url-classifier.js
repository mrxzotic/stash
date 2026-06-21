const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const constantsSource = fs.readFileSync(path.join(root, "extension/content/constants.js"), "utf8");
const bootstrapSource = fs.readFileSync(path.join(root, "extension/content/bootstrap.js"), "utf8");
const backgroundSource = fs.readFileSync(path.join(root, "extension/background.js"), "utf8");
const contentVersion = constantsSource.match(/CONTENT_VERSION\s*=\s*"([^"]+)"/)?.[1];

assert.ok(contentVersion, "Content version should be declared");
assert.ok(backgroundSource.includes(`CONTENT_SCRIPT_VERSION = "${contentVersion}"`), "Background should require the current content script version");
assert.match(backgroundSource, /STASH_PING_V2/, "Background should ping versioned content scripts");
assert.match(backgroundSource, /STASH_SAVE_V2/, "Background should send versioned save messages");
assert.match(bootstrapSource, /STASH_SAVE_V2/, "Content script should handle versioned saves");
assert.match(bootstrapSource, /version:\s*CONTENT_VERSION/, "Content script ping should report the active content version");

const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: {
    querySelectorAll: () => [],
    title: "New in: handpicked daily from the world's best brands and boutiques"
  },
  location: new URL("https://www.farfetch.com/shopping/men/new-items-2/items.aspx")
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

const realExtractFromEmbeddedJson = sandbox.extractFromEmbeddedJson;
assert.equal(
  sandbox.isProductLikeUrl(
    "https://www.farfetch.com/shopping/men/dsquared2-dc-642-sneakers-item-30107002.aspx?storeid=123"
  ),
  true,
  "Farfetch product cards should be treated as product links"
);

assert.equal(
  sandbox.isProductLikeUrl("https://www.farfetch.com/shopping/men/new-items-2/items.aspx"),
  false,
  "Farfetch listing pages should not be treated as product links"
);

assert.equal(
  sandbox.isProductLikeUrl("https://shop.example/products/cloudmonster-2"),
  true,
  "Existing /products/ product URLs should remain supported"
);

const sneakerUrl =
  "https://www.farfetch.com/shopping/men/dsquared2-dc-642-sneakers-item-30107002.aspx?storeid=123";

sandbox.findJsonLdProduct = () => ({
  title: "Jersey T-Shirt With Logo",
  brand: "Acne Studios",
  url: "https://www.farfetch.com/shopping/men/acne-studios-jersey-t-shirt-with-logo-item-30100001.aspx",
  priceText: "365 EUR",
  priceAmount: 365,
  currency: "EUR",
  imageUrl: "https://cdn.example/acne-shirt.jpg"
});
sandbox.extractFromMicrodata = () => ({});
sandbox.extractFromEmbeddedJson = () => ({});
sandbox.extractFromCommonSelectors = () => ({});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromContext = () => ({
  fromContext: true,
  title: "DC-642 sneakers",
  brand: "DSQUARED2",
  url: sneakerUrl,
  priceText: "470 EUR",
  priceAmount: 470,
  currency: "EUR",
  imageUrl: "https://cdn.example/dsquared2-sneakers.jpg"
});

const extracted = sandbox.extractProduct({ linkUrl: sneakerUrl });
assert.equal(extracted.url, sneakerUrl, "Clicked Farfetch card URL should win on listing pages");
assert.equal(extracted.title, "DC-642 Sneakers");
assert.equal(extracted.brand, "DSQUARED2");
assert.equal(extracted.priceAmount, 470);
assert.equal(extracted.imageUrl, "https://cdn.example/dsquared2-sneakers.jpg");

const onProductUrl =
  "https://www.on.com/en-fi/products/cloudrunner-2-w-3we1013/womens/frost-white-shoes-3WE10130622";
const onPrice = sandbox.findBestPrice([
  "Last season Cloudrunner 2 Women - Road running, cushioned support, Helion superfoam €125.00 €160.00"
]);
assert.equal(onPrice.amount, 125, "On sale cards should keep the current price");
assert.equal(onPrice.compareAtAmount, 160, "On sale cards should keep the full price as compare-at");
assert.equal(
  sandbox.cleanProductTitle("Frost White Shoes", "On", onProductUrl),
  "Cloudrunner 2",
  "On product URLs should prefer the model slug over color-only image text"
);

const lowResOnImage =
  "https://upload.on-running.com/spree/products/4791/product/low-frost-white.png?width=320";
const highResOnImage =
  "https://upload.on-running.com/spree/products/4791/product/high-frost-white.png?width=1600";
const clickedImage = {
  srcset: `${lowResOnImage} 320w, ${highResOnImage} 1600w`,
  currentSrc: lowResOnImage,
  src: lowResOnImage,
  naturalWidth: 320,
  width: 320,
  getAttribute: () => "",
  closest: () => null,
  getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 180 })
};
sandbox.lastContextPoint = { x: 160, y: 90 };
assert.equal(
  sandbox.bestProductImageUrl(
    { srcUrl: lowResOnImage },
    clickedImage,
    { querySelectorAll: () => [clickedImage] }
  ),
  highResOnImage,
  "Image clicks should prefer higher-resolution srcset candidates over context srcUrl"
);

const cloudmonsterUrl =
  "https://www.on.com/en-fi/products/cloudmonster-2-m-3me1012/mens/white-frost-shoes-3ME10120664";
const cloudmonsterThumbnail =
  "https://upload.on-running.com/spree/products/5287/product/cef0fe2d4195560075ae527a9da433e9540c9714.png?1773367570";
const cloudmonsterGalleryImage =
  "https://images.ctfassets.net/hnk2vsx53n6l/5Djt5G367gJwPXINVW9duZ/a28cf7f734243e0fb1ed6897f7f1724d/cef0fe2d4195560075ae527a9da433e9540c9714.png?w=4000&h=4000&fm=webp&f=center&fit=fill&q=80";
sandbox.location = new URL(cloudmonsterUrl);
sandbox.document.title = "Men's Cloudmonster 2 | White | On Finland";
sandbox.findJsonLdProduct = () => ({
  title: "Men's Cloudmonster 2 White | Frost",
  brand: "On",
  url: cloudmonsterUrl,
  priceText: "130 €",
  priceAmount: 130,
  currency: "EUR",
  compareAtPriceText: "190 €",
  compareAtPriceAmount: 190,
  imageUrl: cloudmonsterThumbnail
});
sandbox.extractFromCommonSelectors = () => ({
  title: "Cloudmonster 2",
  brand: "On",
  url: cloudmonsterUrl,
  priceText: "130 €",
  priceAmount: 130,
  currency: "EUR",
  compareAtPriceText: "190 €",
  compareAtPriceAmount: 190,
  imageUrl: cloudmonsterGalleryImage
});
sandbox.extractFromMeta = () => ({});
sandbox.extractFromPagePrice = () => ({});
sandbox.extractFromContext = () => ({
  fromContext: true,
  url: cloudmonsterUrl,
  imageUrl: cloudmonsterThumbnail
});

const cloudmonsterProduct = sandbox.extractProduct({ srcUrl: cloudmonsterThumbnail });
assert.equal(
  cloudmonsterProduct.imageUrl,
  cloudmonsterGalleryImage,
  "On PDP saves should prefer CTF gallery images over 200px upload thumbnails"
);
assert.equal(cloudmonsterProduct.priceAmount, 130, "On PDP image ranking should preserve price");

const discountedUrl = "https://shop.example/products/logo-jacket";
sandbox.location = new URL(discountedUrl);
sandbox.document.title = "Logo Jacket | Shop Example";
sandbox.findJsonLdProduct = () => ({
  title: "Logo Jacket",
  brand: "Acme",
  url: discountedUrl,
  priceText: "$240",
  priceAmount: 240,
  currency: "USD"
});
sandbox.extractFromCommonSelectors = () => ({
  title: "Logo Jacket",
  brand: "Acme",
  url: discountedUrl,
  priceText: "$180 $240",
  priceAmount: 180,
  currency: "USD",
  compareAtPriceText: "$240",
  compareAtPriceAmount: 240
});
sandbox.extractFromPagePrice = () => ({
  priceText: "$240",
  priceAmount: 240,
  currency: "USD"
});
sandbox.extractFromContext = () => ({});

const discountedProduct = sandbox.extractProduct({});
assert.equal(discountedProduct.priceAmount, 180, "Sale-aware sources should beat full-price-only sources");
assert.equal(discountedProduct.compareAtPriceAmount, 240, "Sale-aware source compare-at should stay attached");

const aboutBlankUrl =
  "https://about---blank.com/en-eu/products/alpaca-crew-alpaca-mix-light-grey";
const aboutBlankPrice = sandbox.findBestPrice([
  "From 8 €/month with Klarna Learn more",
  "€254,95"
]);
assert.equal(aboutBlankPrice.amount, 254.95, "Installment copy should not win as price");
assert.equal(
  sandbox.parsePricesFromText("From 8 €/month with Klarna Learn more").length,
  0,
  "Installment text should not produce product price candidates"
);
assert.equal(
  sandbox.cleanProductTitle("alpaca crew light grey - XS", "about:blank", aboutBlankUrl),
  "Alpaca Crew Light Grey",
  "Variant size suffixes should not leak into product titles"
);
sandbox.location = new URL(aboutBlankUrl);
sandbox.window.getComputedStyle = () => ({
  display: "block",
  visibility: "visible",
  opacity: "1"
});
const aboutBlankMainPrice = fakePriceElement("€235,95", { inMain: true });
const aboutBlankRelatedPrice = fakePriceElement("€71,95", { inShopTheLook: true });
const aboutBlankPriceScope = {
  querySelectorAll: () => [aboutBlankRelatedPrice, aboutBlankMainPrice]
};
assert.equal(
  sandbox.visiblePriceCandidates(aboutBlankPriceScope).join("|"),
  "236 €",
  "Product page price scan should ignore related item prices"
);

runAsyncSmoke().then(() => {
  console.log("product URL classifier and extraction smoke passed");
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

async function runAsyncSmoke() {
  const pyeUrl = "https://pyeoptics.com/shop/catalogue/theo-m_8773/";
  const pyeImage =
    "https://image.pyeoptics.com/images/products/2026/06/09/1781017663/800x400/1angle1.jpg";
  const pyeDoc = {
    title: "Купить очки Theo M Cirrus | P.Y.E.",
    body: { textContent: "Очки для зрения Theo M 12 300 ₽ 13 000 ₽" },
    querySelectorAll: () => [],
    querySelector: (selector) => {
      if (selector.includes("description")) {
        return {
          content:
            "Закажите очки Theo M Cirrus в интернет-магазине оптики P.Y.E. Цена: 12300 рублей."
        };
      }
      if (selector.includes("og:title")) {
        return { content: "Очки Theo M Cirrus купить за 12300 руб. | P.Y.E." };
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

  const pyeExtracted = sandbox.extractFromFetchedProductPage(pyeDoc, pyeUrl);
  assert.equal(pyeExtracted.title, "Theo M Cirrus", "PYE PDP titles should keep color variants");
  assert.equal(pyeExtracted.brand, "PYE", "PYE saves should use the canonical brand");
  assert.equal(pyeExtracted.priceAmount, 12300, "PYE saves should use the current PDP price");
  assert.equal(
    pyeExtracted.compareAtPriceAmount,
    undefined,
    "PYE current price should not create a compare-at price"
  );
  assert.equal(pyeExtracted.imageUrl, pyeImage, "PYE saves should use the PDP image");

  sandbox.location = new URL("https://pyeoptics.com/opravy-ochki-dlya-zreniya/vse-ochki-opravy/");
  sandbox.document = {
    title: "Очки для зрения",
    body: { textContent: "" },
    querySelector: () => null,
    querySelectorAll: (selector) =>
      selector.includes("given-items")
        ? [{ getAttribute: (name) => name === "v-bind:given-items" ? JSON.stringify([{ url: "/shop/catalogue/theo-m_8773/", title: "Theo M", price: 12300, lenses_type: "Оптика", images: [{ extra_large: pyeImage }] }]).replace(/"/g, "&quot;") : "" }]
        : []
  };
  sandbox.findJsonLdProduct = () => ({});
  sandbox.extractFromMicrodata = () => ({});
  sandbox.extractFromEmbeddedJson = realExtractFromEmbeddedJson;
  sandbox.extractFromCommonSelectors = () => ({});
  sandbox.extractFromMeta = () => ({});
  sandbox.extractFromPagePrice = () => ({});
  sandbox.extractFromContext = () => ({
    fromContext: true,
    title: "Очки Для Зрения",
    brand: "pyeoptics.com",
    url: pyeUrl,
    priceText: "12 300 ₽",
    priceAmount: 12300,
    currency: "RUB",
    compareAtPriceText: "13 000 ₽",
    compareAtPriceAmount: 13000
  });
  const pyeClicked = sandbox.extractProduct({ linkUrl: pyeUrl });
  assert.equal(pyeClicked.title, "Theo M", "PYE listing click should use embedded title");
  assert.equal(pyeClicked.brand, "PYE", "PYE listing click should use embedded brand");
  assert.equal(pyeClicked.priceAmount, 12300, "PYE listing click should use embedded price");
  assert.equal(pyeClicked.compareAtPriceAmount, undefined, "PYE listing click should drop DOM compare-at");
  assert.equal(pyeClicked.imageUrl, pyeImage, "PYE listing click should use embedded image");

  sandbox.location = new URL("https://pyeoptics.com/opravy-ochki-dlya-zreniya/vse-ochki-opravy/");
  sandbox.document.title = "Очки для зрения";
  sandbox.fetch = async (url) => String(url).endsWith(".js")
    ? { ok: false, text: async () => "", json: async () => ({}) }
    : { ok: true, text: async () => "<html></html>", json: async () => ({}) };
  sandbox.DOMParser = class {
    parseFromString() {
      return pyeDoc;
    }
  };

  const pyeEnriched = await sandbox.enrichProduct({
    fromContext: true,
    title: "Очки Для Зрения",
    brand: "pyeoptics.com",
    url: pyeUrl,
    priceText: "12 300 ₽",
    priceAmount: 12300,
    currency: "RUB",
    compareAtPriceText: "13 000 ₽",
    compareAtPriceAmount: 13000
  });
  assert.equal(pyeEnriched.title, "Theo M Cirrus", "PYE PDP data should replace listing noise");
  assert.equal(pyeEnriched.brand, "PYE", "PYE PDP data should replace source-domain brands");
  assert.equal(pyeEnriched.priceAmount, 12300, "PYE enrichment should keep current price");
  assert.equal(
    pyeEnriched.compareAtPriceAmount,
    undefined,
    "PYE enrichment should drop listing compare-at prices"
  );
  assert.equal(pyeEnriched.imageUrl, pyeImage, "PYE enrichment should fill the missing image");

  const onHyperUrl =
    "https://www.on.com/en-fi/products/cloudmonster-3-hyper-ls-u-3ug1001/unisex/black-apollo-shoes-3UG10014670";
  const onUploadImage =
    "https://upload.on-running.com/spree/products/9445/product/d1a6e9b279bcc08a5a978c23e99228863c6b6f90.png?1781575500";
  const onCtfImage = "https://images.ctfassets.net/hnk2vsx53n6l/1tbMPAFietv1U5gDC2xu3b/eaf243482d51d0cbfa9c27b1e3035832/d1a6e9b279bcc08a5a978c23e99228863c6b6f90.png";
  sandbox.location = new URL("https://www.on.com/en-fi/shop/last-season");
  sandbox.document.title = "Last season";
  sandbox.fetch = async (url) => String(url).endsWith(".js")
    ? { ok: false, text: async () => "", json: async () => ({}) }
    : { ok: true, text: async () => "<html></html>", json: async () => ({}) };
  sandbox.DOMParser = class {
    parseFromString() {
      return {
        title: "LightSpray Cloudmonster 3 Hyper | On",
        body: { textContent: "" },
        querySelectorAll: () => [{
          textContent: JSON.stringify({
            "@type": "Product",
            name: "LightSpray Cloudmonster 3 Hyper",
            hasVariant: [{ "@type": "Product", name: "LightSpray Cloudmonster 3 Hyper Black | Apollo", image: onCtfImage, offers: { url: onHyperUrl, price: 280, priceCurrency: "EUR" } }]
          })
        }],
        querySelector: () => null
      };
    }
  };

  const enriched = await sandbox.enrichProduct({
    title: "LightSpray Cloudmonster 3 Hyper",
    brand: "On",
    url: onHyperUrl,
    priceText: "280 €",
    priceAmount: 280,
    currency: "EUR",
    imageUrl: onUploadImage
  });
  assert.equal(enriched.imageUrl, onCtfImage, "On upload thumbnails should upgrade from PDP JSON-LD");
  assert.equal(enriched.priceAmount, 280, "On image enrichment should preserve card price");
  assert.equal(enriched.title, "Lightspray Cloudmonster 3 Hyper", "On image enrichment should preserve card title");
}

function fakePriceElement(text, options = {}) {
  return {
    className: options.className || "",
    id: options.id || "",
    innerText: text,
    textContent: text,
    dataset: {},
    getAttribute: () => "",
    getBoundingClientRect: () => ({ width: 80, height: 20 }),
    matches: () => false,
    closest: (selector) => {
      if (selector.includes("#shop-the-look")) {
        return options.inShopTheLook ? {} : null;
      }
      if (selector === "main") {
        return options.inMain ? {} : null;
      }
      return null;
    }
  };
}
