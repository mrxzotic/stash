const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "extension/content/panel/edit.js"), "utf8");
const itemsSource = fs.readFileSync(path.join(root, "extension/content/panel/items.js"), "utf8");

const sandbox = {
  Object,
  Number,
  console,
  cleanText: (value) => String(value || "").trim(),
  compactObject: (object) => Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== "")
  ),
  numericPrice: (value) => {
    const match = String(value || "").match(/\d+(?:[.,]\d+)?/);
    return match ? Number(match[0].replace(",", ".")) : undefined;
  },
  extractionDebugSnapshot: undefined
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "content/panel/edit.js" });

sandbox.riskyItem = {
  extraction: {
    fields: {
      brand: { needsReview: false },
      title: { needsReview: true },
      price: { needsReview: false },
      image: { needsReview: false }
    }
  }
};

assert.equal(vm.runInContext("editAutofocusField(riskyItem)", sandbox), "title");
assert.equal(vm.runInContext("editAutofocusField({ extraction: { fields: {} } })", sandbox), "brand");
assert.equal(vm.runInContext("renderEditAutofocus('price', 'price')", sandbox), " data-autofocus");

sandbox.titleFormData = {
  get: (name) => name === "title" ? "  Кроссовки Mizuno Wave Rider 10 Miz Snow  " : ""
};
sandbox.currentTitleItem = {
  title: "Old Name",
  url: "https://shop.example/products/wave-rider-10-extra-info"
};
assert.equal(
  vm.runInContext("editedTitle(titleFormData, currentTitleItem, 'Mizuno')", sandbox),
  "Кроссовки Mizuno Wave Rider 10 Miz Snow"
);
assert.doesNotMatch(
  source,
  /function editedTitle[\s\S]*?cleanProductTitle/,
  "Manual title edits should not be replaced by parser or URL title cleanup"
);

sandbox.edited = {
  brand: "P448",
  title: "John Nightfall",
  price: {
    amount: 249,
    currency: "EUR",
    originalText: "249 €"
  },
  imageUrl: "https://p448.com/example.jpg"
};
const extraction = vm.runInContext("manualPanelExtractionQuality(edited)", sandbox);
assert.equal(extraction.version, "manual-edit-v1");
assert.equal(extraction.needsReview, false);
assert.equal(extraction.fields.brand.source, "manual");
assert.equal(extraction.fields.title.confidence, 99);
assert.equal(extraction.fields.price.amount, 249);
assert.equal(extraction.debug.fields.price.reason, "selected:price:manual");

sandbox.missingImage = { ...sandbox.edited, imageUrl: "" };
const missingImageExtraction = vm.runInContext("manualPanelExtractionQuality(missingImage)", sandbox);
assert.equal(missingImageExtraction.needsReview, true);
assert.equal(missingImageExtraction.fields.image.needsReview, true);

Object.assign(sandbox, {
  DEFAULT_SETTINGS: { summaryCurrency: "USD" },
  SAVED_IMAGE_URL_LIMIT: 3,
  location: new URL("https://shop.example/products/hat"),
  panelState: {
    categories: [{ id: "tops", label: "Tops" }],
    summaryCurrency: "USD"
  },
  cleanBrandName: (value) => String(value || "").trim(),
  cleanProductTitle: (value) => String(value || "").includes("Кроссовки")
    ? "Url Extra Info"
    : String(value || "").trim(),
  escapeAttribute: (value) => String(value || "").replaceAll('"', "&quot;"),
  escapeHtml: (value) => String(value || ""),
  faviconUrlForSource: () => "",
  hasCategory: (categories, id) => categories.some((category) => category.id === id),
  isBrandLikeLine: () => false,
  isSummaryCurrency: (currency) => ["USD", "EUR", "RUB"].includes(currency),
  looksLikeProductName: () => false,
  normalizePrice: (price) => ({
    amount: price.amount,
    currency: price.currency || "USD",
    originalText: price.text || "",
    compareAtAmount: price.compareAtAmount,
    compareAtText: price.compareAtText,
    isSale: false
  }),
  normalizeProductImageUrls: () => [],
  normalizeUrl: (url) => String(url || ""),
  panelCategoryDisplayLabel: (category) => category.label,
  productId: (url) => `id:${url}`,
  repairKnownInstallmentPrice: (price) => price,
  sourceDomainFromUrl: () => "shop.example",
  sourceNameFromUrl: () => "Shop",
  summaryCurrencyOptions: () => ["USD", "EUR", "RUB"],
  t: (key) => key
});

const emptyCategoryOptions = vm.runInContext("renderEditCategoryOptions('')", sandbox);
assert.doesNotMatch(emptyCategoryOptions, /No category/);
assert.doesNotMatch(emptyCategoryOptions, /checked/);
assert.match(emptyCategoryOptions, /type="hidden" name="category" value=""/);
assert.doesNotMatch(emptyCategoryOptions, /aria-pressed="true"/);
const selectedCategoryOptions = vm.runInContext("renderEditCategoryOptions('tops')", sandbox);
assert.match(selectedCategoryOptions, /type="hidden" name="category" value="tops"/);
assert.match(selectedCategoryOptions, /data-edit-category="tops"/);
assert.match(selectedCategoryOptions, /aria-pressed="true"/);
assert.match(source, /function bindEditCategoryToggle\(root\)/);
assert.match(source, /valueInput\.value = valueInput\.value === category \? "" : category;/);
assert.doesNotMatch(source, /type="radio"|dataset\.wasChecked|input\.checked = false/);
assert.match(source, /const nextCategory = hasCategory\(panelState\.categories, category\) \? category : "";/);
assert.match(source, /category: nextCategory,/);
assert.doesNotMatch(source, /category: hasCategory\(panelState\.categories, category\) \? category : current\.category/);
assert.match(source, /const form = event\.currentTarget;\s*safelyRunPanelAction\(\(\) => savePanelEditedItem\(form\)\);/, "Submit handler should capture the form before the async action clears currentTarget");

vm.runInContext(itemsSource, sandbox, { filename: "content/panel/items.js" });
const manuallyNamedItem = vm.runInContext(`
  normalizePanelItem({
    id: "manual-title",
    url: "https://shop.example/products/wave-rider-10-extra-info",
    title: "Кроссовки Mizuno Wave Rider 10 Miz Snow",
    brand: "Mizuno",
    extraction: {
      version: "manual-edit-v1",
      fields: { title: { source: "manual" } }
    }
  })
`, sandbox);
assert.equal(manuallyNamedItem.title, "Кроссовки Mizuno Wave Rider 10 Miz Snow");
const uncategorizedItem = vm.runInContext(`
  normalizePanelItem({
    id: "hat",
    url: "https://shop.example/products/hat",
    title: "Hat",
    brand: "Brand",
    category: ""
  })
`, sandbox);
assert.equal(uncategorizedItem.category, "");
const missingCategoryItem = vm.runInContext(`
  normalizePanelItem({
    id: "scarf",
    url: "https://shop.example/products/scarf",
    title: "Scarf",
    brand: "Brand"
  })
`, sandbox);
assert.equal(missingCategoryItem.category, "");

console.log("panel edit quality smoke passed");
