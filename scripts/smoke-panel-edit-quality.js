const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "extension/content/panel/edit.js"), "utf8");

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

console.log("panel edit quality smoke passed");
