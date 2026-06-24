const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const xlsxSource = read("extension/content/panel/export-xlsx.js");
const exportSource = read("extension/content/panel/export.js");
const renderSource = read("extension/content/panel/render.js");
const backgroundSource = read("extension/background.js");
const constantsSource = read("extension/content/constants.js");

assert.match(renderSource, /data-export-xlsx/, "Overflow menu should expose Excel export");
assert.match(renderSource, /Export to Excel/, "Overflow menu should label Excel export");
assert.match(renderSource, /panelHasExportableItems\(\)\s*\?[\s\S]*data-export-xlsx/, "Overflow menu should hide Excel export when there are no saved items");
assert.match(constantsSource, /function panelHasExportableItems/, "Panel should expose a shared exportability helper");
assert.match(exportSource, /if \(panelHasExportableItems\(\)\)\s*\{[\s\S]*safelyRunPanelAction\(exportTuckioBackup\)/, "JSON export should no-op when there are no saved items");
assert.match(exportSource, /bindPanelExcelExportEvents\(root\)/, "Panel export binding should include Excel export");
assert.match(
  backgroundSource,
  /"content\/panel\/export\.js",\s*"content\/panel\/export-xlsx\.js",\s*"content\/panel\/reset\.js"/,
  "Excel export module should load between backup export and reset"
);
assert.match(xlsxSource, /Wishlist/, "Workbook should include Wishlist sheet");
assert.match(xlsxSource, /Archive/, "Workbook should include Archive sheet");
assert.match(xlsxSource, /Product Link/, "Workbook should include Product Link title column");
assert.match(xlsxSource, /"Link"/, "Workbook should include Link URL column");
assert.match(xlsxSource, /relationships\/hyperlink/, "Workbook should create Excel hyperlinks");
assert.match(xlsxSource, /Price \(\$\{summaryCurrency\}\)/, "Workbook should include selected-currency price column");
assert.match(xlsxSource, /Price \(Original\)/, "Workbook should include original-currency price column");
assert.match(xlsxSource, /formatCode="#,##0"/, "Workbook should render whole-number prices");
assert.doesNotMatch(xlsxSource, /#,##0\.00/, "Workbook should not render .00 price decimals");
assert.match(xlsxSource, /if \(panelHasExportableItems\(\)\)\s*\{[\s\S]*safelyRunPanelAction\(exportTuckioExcel\)/, "Excel export click should no-op when there are no saved items");

const sandbox = {
  TextEncoder,
  Uint8Array,
  Uint32Array,
  DataView,
  DEFAULT_SETTINGS: { summaryCurrency: "USD" },
  cleanText: (value) => String(value || "").trim(),
  convertRubToDisplayAmount: (rubAmount, currency) => currency === "USD" ? rubAmount / 90 : undefined,
  formatOriginalPrice: (amount, currency) => `${Math.round(amount)} ${currency}`,
  isPanelItemArchived: (item) => Boolean(item.archivedAt),
  isSummaryCurrency: (currency) => ["USD", "EUR", "RUB"].includes(currency),
  normalizePanelItem: (item) => item,
  numericPrice: (value) => Number.isFinite(Number(value)) ? Number(value) : undefined
};

vm.createContext(sandbox);
vm.runInContext(xlsxSource, sandbox);
const bytes = vm.runInContext(`buildTuckioExcelWorkbook([
  { brand: "Acne Studios", title: "Logo T-Shirt", url: "https://shop.example/a", price: { amount: 100, currency: "EUR", rubAmount: 9000 } },
  { brand: "No Link", title: "Draft", price: { amount: 50, currency: "USD", rubAmount: 4500 } },
  { brand: "RIMOWA", title: "Cabin", url: "https://shop.example/b", archivedAt: "2026-06-24T00:00:00.000Z", price: { amount: 1200, currency: "USD", rubAmount: 108000 } }
], { summaryCurrency: "USD" })`, sandbox);
const workbookText = Buffer.from(bytes).toString("utf8");

assert.equal(bytes[0], 0x50, "XLSX should start with ZIP signature P");
assert.equal(bytes[1], 0x4b, "XLSX should start with ZIP signature K");
assert.match(workbookText, /Wishlist/, "XLSX bytes should contain Wishlist sheet");
assert.match(workbookText, /Archive/, "XLSX bytes should contain Archive sheet");
assert.match(workbookText, /<t>Product Link<\/t>/, "XLSX bytes should contain Product Link title header");
assert.match(workbookText, /<t>Link<\/t>/, "XLSX bytes should contain Link URL header");
assert.match(workbookText, /Logo T-Shirt/, "XLSX bytes should use product title as Product Link value");
assert.match(workbookText, /https:\/\/shop\.example\/a/, "XLSX bytes should include raw product URL");
assert.match(workbookText, /Target="https:\/\/shop\.example\/a"/, "Wishlist link should be in hyperlink relationship");
assert.match(workbookText, /Target="https:\/\/shop\.example\/b"/, "Archive link should be in hyperlink relationship");
assert.match(workbookText, /Price \(USD\)/, "Selected currency should appear in header");
assert.match(workbookText, /formatCode="#,##0"/, "XLSX bytes should contain whole-number price format");
assert.doesNotMatch(workbookText, /\[object Object\]/, "Missing links should stay blank");

const activeOnlyText = Buffer.from(vm.runInContext(`buildTuckioExcelWorkbook([
  { brand: "Acne Studios", title: "Logo T-Shirt", url: "https://shop.example/a", price: { amount: 100, currency: "EUR", rubAmount: 9000 } }
], { summaryCurrency: "USD" })`, sandbox)).toString("utf8");
assert.match(activeOnlyText, /Wishlist/, "Active-only exports should keep Wishlist sheet");
assert.doesNotMatch(activeOnlyText, /Archive/, "Active-only exports should omit empty Archive sheet");

const archiveOnlyText = Buffer.from(vm.runInContext(`buildTuckioExcelWorkbook([
  { brand: "RIMOWA", title: "Cabin", url: "https://shop.example/b", archivedAt: "2026-06-24T00:00:00.000Z", price: { amount: 1200, currency: "USD", rubAmount: 108000 } }
], { summaryCurrency: "USD" })`, sandbox)).toString("utf8");
assert.doesNotMatch(archiveOnlyText, /Wishlist/, "Archive-only exports should omit empty Wishlist sheet");
assert.match(archiveOnlyText, /Archive/, "Archive-only exports should keep Archive sheet");

assert.equal(
  vm.runInContext("buildTuckioExcelWorkbook([], { summaryCurrency: 'USD' })", sandbox),
  null,
  "Empty exports should not create a workbook"
);

console.log("panel xlsx smoke passed");
