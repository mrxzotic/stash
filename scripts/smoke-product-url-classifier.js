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
assert.ok(
  backgroundSource.includes(`CONTENT_SCRIPT_VERSION = "${contentVersion}"`),
  "Background should require the current content script version"
);
assert.match(backgroundSource, /STASH_PING_V2/, "Background should ping versioned content scripts");
assert.match(backgroundSource, /STASH_SAVE_V2/, "Background should send versioned save messages");
assert.match(bootstrapSource, /STASH_SAVE_V2/, "Content script should handle versioned saves");
assert.match(
  bootstrapSource,
  /version:\s*CONTENT_VERSION/,
  "Content script ping should report the active content version"
);

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
  "extension/content/storage-settings.js",
  "extension/content/pricing/dom.js",
  "extension/content/pricing/rates.js",
  "extension/content/pricing/parse.js",
  "extension/content/extractors/main.js",
  "extension/content/extractors/context.js",
  "extension/content/extractors/jsonld.js",
  "extension/content/extractors/enrich.js"
].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
    filename: file
  });
});

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
  assert.equal(pyeExtracted.title, "Theo M", "PYE model names should come from PDP slugs");
  assert.equal(pyeExtracted.brand, "PYE", "PYE saves should use the canonical brand");
  assert.equal(pyeExtracted.priceAmount, 12300, "PYE saves should use the current PDP price");
  assert.equal(
    pyeExtracted.compareAtPriceAmount,
    undefined,
    "PYE current price should not create a compare-at price"
  );
  assert.equal(pyeExtracted.imageUrl, pyeImage, "PYE saves should use the PDP image");

  sandbox.location = new URL("https://pyeoptics.com/opravy-ochki-dlya-zreniya/vse-ochki-opravy/");
  sandbox.document.title = "Очки для зрения";
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
  assert.equal(pyeEnriched.title, "Theo M", "PYE PDP data should replace listing noise");
  assert.equal(pyeEnriched.brand, "PYE", "PYE PDP data should replace source-domain brands");
  assert.equal(pyeEnriched.priceAmount, 12300, "PYE enrichment should keep current price");
  assert.equal(
    pyeEnriched.compareAtPriceAmount,
    undefined,
    "PYE enrichment should drop listing compare-at prices"
  );
  assert.equal(pyeEnriched.imageUrl, pyeImage, "PYE enrichment should fill the missing image");

  const pdpImage =
    "https://images.ctfassets.net/hnk2vsx53n6l/on-cloudrunner-2.png?w=1200&h=630&fit=pad";
  sandbox.location = new URL("https://www.on.com/en-fi/shop/last-season");
  sandbox.document.title = "Last season";
  sandbox.fetch = async () => ({
    ok: true,
    text: async () => "<html></html>",
    json: async () => ({})
  });
  sandbox.DOMParser = class {
    parseFromString() {
      return {
        title: "Women's Cloudrunner 2 | On",
        body: { textContent: "" },
        querySelectorAll: () => [],
        querySelector: (selector) => {
          if (selector.includes("og:image")) {
            return { content: pdpImage };
          }
          return null;
        }
      };
    }
  };

  const enriched = await sandbox.enrichProduct({
    fromContext: true,
    title: "Cloudrunner 2",
    brand: "On",
    url: onProductUrl,
    priceText: "125 €",
    priceAmount: 125,
    currency: "EUR",
    imageUrl: lowResOnImage
  });
  assert.equal(enriched.imageUrl, pdpImage, "Context cards should enrich image from the PDP");
  assert.equal(enriched.priceAmount, 125, "PDP image enrichment should preserve card price");
  assert.equal(enriched.title, "Cloudrunner 2", "PDP image enrichment should preserve card title");
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
