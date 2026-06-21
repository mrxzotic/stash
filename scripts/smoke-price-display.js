const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const sandbox = {
  Intl,
  Number,
  Set,
  console,
  window: { innerWidth: 420 },
  parseLocalizedNumber: (value) => Number(String(value || "").replace(/[^\d.,-]/g, "").replace(",", "."))
};

vm.createContext(sandbox);
vm.runInContext([
  read("extension/content/constants.js"),
  read("extension/content/utils.js"),
  read("extension/content/storage-settings.js"),
  read("extension/content/pricing/rates.js")
].join("\n"), sandbox);
const backgroundSource = read("extension/background.js");
const eventsSource = read("extension/content/panel/events.js");
const itemsSource = read("extension/content/panel/items.js");
const panelPricesSource = read("extension/content/panel/prices.js");
const panelBaseStyles = read("extension/content/styles/panel-1.js");
const panelChromeStyles = read("extension/content/styles/panel-2.js");
const panelFilterStyles = read("extension/content/styles/panel-4.js");
const panelSearchStyles = read("extension/content/styles/panel-search.js");
const panelCardStyles = read("extension/content/styles/panel-5.js");
const panelCurrencyStyles = read("extension/content/styles/panel-currency.js");
const panelSortStyles = read("extension/content/styles/panel-sort.js");
const panelContentStyles = read("extension/content/styles/panel-content.js");

const saleItem = {
  price: {
    amount: 50,
    currency: "EUR",
    originalText: "50 \u20ac",
    compareAtAmount: 72,
    compareAtText: "72 \u20ac",
    isSale: true,
    rubAmount: 4800
  }
};

sandbox.panelState.summaryCurrency = "USD";
sandbox.panelState.summaryRate = { currency: "USD", value: 89 };
sandbox.saleItem = saleItem;

const display = vm.runInContext("panelPriceDisplayModel(saleItem, 'USD')", sandbox);
assert.equal(display.primaryText, "$54");
assert.equal(display.primaryCompareAtText, "$78");
assert.equal(display.currentText, "50 \u20ac");
assert.equal(display.compareAtText, "72 \u20ac");
assert.equal(display.isConverted, true);
assert.equal(display.isSale, true);

const panelHtml = vm.runInContext("renderSitePriceHtml(saleItem, 'wp')", sandbox);
assert.match(panelHtml, /wp-price-stack/);
assert.match(panelHtml, /wp-price-line[\s\S]*wp-site-price is-sale[^>]*>\$54<[\s\S]*wp-compare-price[\s\S]*\$78[\s\S]*wp-native-price[^>]*>50 \u20ac \(72 \u20ac\)</);

const overlayHtml = vm.runInContext("renderSitePriceHtml(saleItem, 'wl')", sandbox);
assert.match(overlayHtml, /wl-price-stack/);
assert.match(overlayHtml, /wl-price-line[\s\S]*wl-site-price is-sale[^>]*>\$54<[\s\S]*wl-native-price[\s\S]*>50 \u20ac<[\s\S]*72 \u20ac/);

sandbox.panelState.summaryCurrency = "EUR";
sandbox.panelState.summaryRate = { currency: "EUR", value: 96 };
const nativeHomeDisplay = vm.runInContext("panelPriceDisplayModel(saleItem, 'EUR')", sandbox);
assert.equal(nativeHomeDisplay.primaryText, "50 \u20ac");
assert.equal(nativeHomeDisplay.primaryCompareAtText, "72 \u20ac");
assert.equal(nativeHomeDisplay.isConverted, false);
const nativeHomeHtml = vm.runInContext("renderSitePriceHtml(saleItem, 'wp')", sandbox);
assert.match(nativeHomeHtml, />50 \u20ac</);
assert.doesNotMatch(nativeHomeHtml, /wp-native-price/, "Native price should not duplicate the home-currency primary price");

assert.match(backgroundSource, /"content\/panel\/items\.js",\s*"content\/panel\/prices\.js",\s*"content\/panel\/edit\.js"/, "Panel price sync should load after item helpers and before edit flows");
assert.match(eventsSource, /if \(shouldAnimateSummary\) \{[\s\S]*?renderPanelPricesOnly\(\{[\s\S]*?animate: true/, "Currency changes should retarget visible card prices with animation");
assert.match(itemsSource, /renderPanelPricesOnly\(\{[\s\S]*?animate: options\.animateSummary/, "Rate refresh should retarget visible card prices");
assert.match(panelPricesSource, /function renderPanelPricesOnly[\s\S]*?restartPanelPriceCount/, "Panel price sync should animate changed price rows");
assert.match(panelCurrencyStyles, /\.wp-price-row\.is-price-recounting[\s\S]*?@keyframes wpCardPriceCount/, "Card prices should have a recount animation");
assert.match(panelCardStyles, /\.wp-price-line[\s\S]*?flex-wrap: nowrap/, "Card price parts should remain on one row");
assert.match(panelBaseStyles, /--wp-chrome-bg:[\s\S]*--wp-card-bg:[\s\S]*--wp-popover-bg:/, "Panel should define separate chrome, card, and popover material tokens");
assert.match(panelSearchStyles, /\.wp-inline-search[\s\S]*var\(--wp-chrome-iridescent\)[\s\S]*var\(--wp-chrome-bg\)/, "Search should use the chrome material");
assert.match(panelCurrencyStyles, /\.wp-currency-menu[\s\S]*background: var\(--wp-popover-bg\)/, "Currency menu should use strong popover material");
assert.match(panelContentStyles, /\.wp-confirm-dialog[\s\S]*background: var\(--wp-popover-bg\)/, "Dialogs should use strong popover material");
assert.match(panelChromeStyles, /\.wp-count[\s\S]*?background: transparent/, "Count label should stay quiet inside the summary capsule");
assert.match(panelFilterStyles, /\.wp-filter[\s\S]*?background: rgba\(255, 255, 255, 0\.5\)/, "Filter pills should keep their previous visual treatment");
assert.match(panelSortStyles, /\.wp-sort-trigger[\s\S]*?var\(--wp-chrome-bg\)/, "Sort trigger should use the chrome material");

console.log("price display smoke passed");
