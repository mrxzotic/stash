const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

function runFiles(sandbox, files) {
  sandbox.window ||= { innerWidth: 1440, innerHeight: 900, clearTimeout: () => {} };
  vm.createContext(sandbox);
  files.forEach((file) => {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
      filename: file
    });
  });
  return sandbox;
}

function storageApi(store) {
  return {
    local: {
      get: async (keys) => {
        const list = Array.isArray(keys) ? keys : typeof keys === "string" ? [keys] : Object.keys(keys || {});
        return Object.fromEntries(list.map((key) => [key, store[key]]));
      },
      set: async (value) => {
        Object.assign(store, value);
      }
    }
  };
}

async function smokeCurrencyRateDefaults() {
  const store = {
    "tuckio.rubRates.v1": {
      EUR: { value: 100, source: "cached", updatedAt: Date.now() }
    }
  };
  const sandbox = runFiles(
    {
      URL,
      Intl,
      console,
      location: new URL("https://shop.example/products/rate-test"),
      chrome: { storage: storageApi(store) },
      fetch: async () => {
        throw new Error("offline");
      }
    },
    [
      "extension/content/constants.js",
      "extension/content/utils.js",
      "extension/content/storage-echo.js",
      "extension/content/storage.js",
      "extension/content/pricing/rates.js"
    ]
  );

  const cached = await vm.runInContext(
    'getCurrencyRate("EUR")',
    sandbox
  );
  assert.equal(cached.value, 100);
  assert.equal(cached.source, "cached");

  const defaultRate = await vm.runInContext(
    'getCurrencyRate("USD")',
    sandbox
  );
  assert.equal(defaultRate.value, 89);
  assert.equal(defaultRate.source, "default");

  const unknown = await vm.runInContext(
    'getCurrencyRate("ZZZ")',
    sandbox
  );
  assert.equal(Number.isFinite(unknown.value), false);
}

async function smokeCategoryMigration() {
  const oldDefaults = [
    { id: "tops", label: "Tops" },
    { id: "bottoms", label: "Bottoms" },
    { id: "outerwear", label: "Outerwear" },
    { id: "shoes", label: "Shoes" },
    { id: "bags", label: "Bags" }
  ];
  const store = { "tuckio.categories.v1": oldDefaults };
  const sandbox = runFiles(
    {
      URL,
      console,
      location: new URL("https://shop.example/products/category-test"),
      chrome: { storage: storageApi(store) }
    },
    [
      "extension/content/constants.js",
      "extension/content/utils.js",
      "extension/content/storage-echo.js",
      "extension/content/storage.js",
      "extension/content/storage-settings.js"
    ]
  );

  const ids = await vm.runInContext(
    'getCategories().then((categories) => categories.map((category) => category.id).join(","))',
    sandbox
  );
  assert.match(ids, /accessories/);
  assert.equal(store["tuckio.categories.schema.v1"], 2);
}

async function smokeLegacyStorageKeyMigration() {
  const legacyItems = [{ id: "legacy-item", title: "Legacy", url: "https://example.com/legacy" }];
  const store = { "stash.items.v1": legacyItems };
  const sandbox = runFiles(
    {
      URL,
      console,
      location: new URL("https://shop.example/products/legacy-storage-test"),
      chrome: { storage: storageApi(store) }
    },
    [
      "extension/content/constants.js",
      "extension/content/utils.js",
      "extension/content/storage-echo.js",
      "extension/content/storage.js"
    ]
  );

  const stored = await vm.runInContext("getLocalStorageValue(STORAGE_KEY)", sandbox);
  assert.equal(stored["tuckio.items.v1"][0].id, "legacy-item");
  assert.equal(JSON.stringify(store["tuckio.items.v1"]), JSON.stringify(legacyItems));
}

function smokePanelThreeHundredItems() {
  const sandbox = runFiles(
    {
      URL,
      Intl,
      console,
      performance: { now: () => 0 },
      location: new URL("https://shop.example/products/panel-test"),
      document: {
        title: "Panel Test",
        querySelector: () => null,
        querySelectorAll: () => []
      },
      chrome: {
        runtime: { getURL: (assetPath) => `chrome-extension://tuckio/${assetPath}` }
      }
    },
    [
      "extension/content/constants.js",
      "extension/content/utils.js",
      "extension/content/text.js",
      "extension/content/source-icons.js",
      "extension/content/media.js",
      "extension/content/storage-settings.js",
      "extension/content/pricing/rates.js",
      "extension/content/pricing/noise.js",
      "extension/content/pricing/parse.js",
      "extension/content/panel/items.js",
      "extension/content/panel/archive.js",
      "extension/content/panel/sort.js",
      "extension/content/panel/empty.js",
      "extension/content/panel/reorder.js",
      "extension/content/panel/render.js"
    ]
  );

  sandbox.itemsJson = JSON.stringify(Array.from({ length: 300 }, (_, index) => ({
    id: `item-${index + 1}`,
    title: `Product ${String(index + 1).padStart(3, "0")}`,
    brand: index % 2 ? "Brand B" : "Brand A",
    url: `https://shop.example/products/product-${index + 1}`,
    category: index % 3 ? "tops" : "shoes",
    priceText: `$${index + 1}`,
    priceAmount: index + 1,
    currency: "USD",
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
    archivedAt: index === 299 ? "2026-06-21T00:00:00.000Z" : undefined
  })));

  vm.runInContext(`
    panelState.items = JSON.parse(itemsJson);
    panelState.categories = DEFAULT_CATEGORIES;
    panelState.searchQuery = "Product 299";
    renderPanelItem = (item) => "<article>" + escapeHtml(item.title) + "</article>";
    renderPanelCompactItem = renderPanelItem;
    renderPanelBrandCloud = () => "<div>brands</div>";
  `, sandbox);

  assert.equal(
    vm.runInContext("panelItemMatchesSearch(normalizePanelItem(panelState.items[298]))", sandbox),
    true
  );
  assert.equal(
    vm.runInContext("panelSortedItems(panelState.items).length", sandbox),
    300
  );
  assert.equal(
    vm.runInContext("panelArchivedCount(panelState.items)", sandbox),
    1
  );
  assert.match(
    vm.runInContext("renderPanelItemsHtml(panelSortedItems(panelState.items))", sandbox),
    /Product 300|Product 299/
  );
}

async function smokeEnrichmentFailureKeepsProduct() {
  const productUrl = "https://shop.example/item/fallback-product";
  const sandbox = runFiles(
    {
      URL,
      Intl,
      console,
      location: new URL("https://shop.example/listing"),
      document: {
        title: "Listing",
        body: { textContent: "" },
        querySelector: () => null,
        querySelectorAll: () => []
      },
      fetch: async () => {
        throw new Error("offline");
      }
    },
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
      "extension/content/extractors/quality.js",
      "extension/content/extractors/verify.js",
      "extension/content/extractors/enrich.js"
    ]
  );

  sandbox.product = {
    fromContext: true,
    title: "Fallback Product",
    brand: "Fallback Brand",
    url: productUrl,
    priceText: "$120",
    priceAmount: 120,
    currency: "USD"
  };

  const enriched = await vm.runInContext("enrichProduct(product)", sandbox);
  assert.equal(enriched.title, "Fallback Product");
  assert.equal(enriched.brand, "Fallback Brand");
  assert.equal(enriched.priceAmount, 120);
}

function smokeLazyImageAndMissingFallback() {
  const sandbox = runFiles(
    {
      URL,
      console,
      location: new URL("https://shop.example/products/cloudmonster-2"),
      window: { innerWidth: 1440, innerHeight: 900 },
      normalizeProductImageUrls: () => [],
      escapeAttribute: (value) => String(value || "").replace(/"/g, "&quot;"),
      tuckioMonochromeLogoUrl: () => "chrome-extension://tuckio/assets/tuckio-app-black.png"
    },
    [
      "extension/content/constants.js",
      "extension/content/utils.js",
      "extension/content/icons.js",
      "extension/content/text.js",
      "extension/content/media.js",
      "extension/content/extractors/context.js",
      "extension/content/panel/images.js"
    ]
  );

  const fallbackLogo = "https://cdn.example/static/fallback-image/logo.png";
  const low = "https://cdn.example/product-low.jpg";
  const high = "https://cdn.example/product-high.jpg";
  sandbox.lazyImage = {
    alt: "Cloudmonster product image",
    className: "product-image",
    currentSrc: "",
    src: fallbackLogo,
    srcset: "",
    width: 320,
    naturalWidth: 320,
    parentElement: { className: "" },
    closest: () => null,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 320, height: 180 }),
    getAttribute: (name) => ({
      "data-src": low,
      "data-srcset": `${low} 320w, ${high} 1600w`
    })[name] || ""
  };

  assert.equal(vm.runInContext(`isUsableProductImageUrl("${fallbackLogo}")`, sandbox), false);
  assert.equal(
    vm.runInContext("bestProductImageUrl({}, lazyImage, { querySelectorAll: () => [lazyImage] })", sandbox),
    high
  );

  const missing = vm.runInContext('renderPanelCardImageFrame({}, { slider: false, alt: "Missing" })', sandbox);
  assert.match(missing, /image-broken\.svg/);
  assert.match(missing, /Oops, image missing/);

  const overlaySource = fs.readFileSync(path.join(root, "extension/content/overlay-images.js"), "utf8");
  const renderSource = fs.readFileSync(path.join(root, "extension/content/panel/render.js"), "utf8");
  assert.match(overlaySource, /renderMissingProductImage\("wl"\)/);
  assert.match(renderSource, /renderMissingProductImage\(namespace\)/);
  assert.match(renderSource, /image\.complete && !image\.naturalWidth/);
}

function smokeBrandNoiseFilter() {
  const sandbox = runFiles(
    { URL, console, location: new URL("https://shop.example/products/noise-test") },
    [
      "extension/content/constants.js",
      "extension/content/utils.js",
      "extension/content/media.js",
      "extension/content/text.js",
      "extension/content/extractors/product-url.js",
      "extension/content/extractors/verify.js",
      "extension/content/extractors/main.js"
    ]
  );

  assert.equal(vm.runInContext('cleanBrandName("YOUR COOKIE SETTINGS")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("ACCEPT ALL COOKIES")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("Powered by Onetrust")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("Email*")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("FREE DELIVERY FROM")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("ДОБАВИТЬ В КОРЗИНУ")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("Man")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("АРТИКУЛ: 6103 336")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("All details")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("ЦВЕТ: СОСТАРЕННЫЙ СИНИЙ")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("СОСТАВ И УХОД")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("ДОСТАВКА И ВОЗВРАТ")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("ГИД ПО РАЗМЕРАМ")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("ОПЛАТА")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("Коллекции")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("Skip to main content")', sandbox), "");
  assert.equal(vm.runInContext('cleanBrandName("Allsaints")', sandbox), "AllSaints");
  assert.equal(vm.runInContext('cleanBrandName("Pyeoptics")', sandbox), "PYE");
  assert.equal(vm.runInContext('cleanBrandName("Acne Studios")', sandbox), "Acne Studios");
  assert.doesNotMatch(
    vm.runInContext('cleanProductTitle("Umique Артикул 5144377, Оливковый", "LUMIQUE", "https://example.com/product")', sandbox),
    /Артикул|5144377/
  );
  assert.equal(
    vm.runInContext('bestProductBrand([{ brand: "ОПЛАТА", title: "Прямые джинсы" }], "https://limestore.com/ru_ru/product/32596")', sandbox),
    "LIME"
  );
  assert.equal(
    vm.runInContext('bestProductBrand([{ brand: "Casablanca", title: "Logo-Buckle Leather Belt" }], "https://www.farfetch.com/fi/shopping/men/casablanca-logo-buckle-leather-belt-item-36693002.aspx")', sandbox),
    "Casablanca"
  );
}

(async () => {
  await smokeCurrencyRateDefaults();
  await smokeCategoryMigration();
  await smokeLegacyStorageKeyMigration();
  smokePanelThreeHundredItems();
  await smokeEnrichmentFailureKeepsProduct();
  smokeLazyImageAndMissingFallback();
  smokeBrandNoiseFilter();
  console.log("release edge cases smoke passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
