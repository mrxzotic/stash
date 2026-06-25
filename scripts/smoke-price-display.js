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
const panelDialogStyles = read("extension/content/styles/panel-dialog.js");

const saleItem = {
  price: {
    amount: 50,
    currency: "EUR",
    originalText: "50 \u20ac",
    compareAtAmount: 72,
    compareAtText: "72 \u20ac",
    isSale: true,
    rubAmount: 4800
  },
  priceCheck: {
    checkedAt: new Date().toISOString(),
    state: "down",
    previous: { amount: 72, currency: "EUR", originalText: "72 \u20ac", rubAmount: 6912 },
    current: { amount: 50, currency: "EUR", originalText: "50 \u20ac", rubAmount: 4800 },
    deltaAmount: -22,
    deltaRubAmount: -2112
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
assert.match(panelHtml, /wp-price-line[\s\S]*wp-site-price is-sale[^>]*>\$54<[\s\S]*wp-compare-price[\s\S]*\$78/);
assert.match(panelHtml, /wp-native-price[^>]*>50 \u20ac \(72 \u20ac\)</);
assert.match(panelHtml, /wp-price-check-line is-down/);
assert.match(panelHtml, /wp-price-check-detail[^>]*>[\s\S]*\$24 since last check/);
assert.match(panelHtml, /wp-price-check-compact[^>]*>[\s\S]*\$24/);
assert.match(panelHtml, /<span class="wp-price-line">[\s\S]*?<\/span>\s*<span class="wp-native-price"/, "Native sale pair should render after the primary price line");

const overlayHtml = vm.runInContext("renderSitePriceHtml(saleItem, 'wl')", sandbox);
assert.match(overlayHtml, /wl-price-stack/);
assert.match(overlayHtml, /wl-price-line[\s\S]*wl-site-price is-sale[^>]*>\$54<[\s\S]*wl-native-price[\s\S]*>50 \u20ac<[\s\S]*72 \u20ac/);
assert.doesNotMatch(overlayHtml, /price-check-line/);

sandbox.sameItem = {
  price: saleItem.price,
  priceCheck: { ...saleItem.priceCheck, state: "same" }
};
assert.doesNotMatch(
  vm.runInContext("renderSitePriceHtml(sameItem, 'wp')", sandbox),
  /price-check-line/,
  "Same price checks should not render persistent text"
);

sandbox.missedItem = {
  price: saleItem.price,
  priceCheck: { checkedAt: new Date().toISOString(), state: "missed", current: saleItem.price }
};
assert.doesNotMatch(
  vm.runInContext("renderSitePriceHtml(missedItem, 'wp')", sandbox),
  /price-check-line/,
  "Missed price checks should stay quiet on cards"
);

sandbox.usdDeltaItem = {
  price: { amount: 80, currency: "USD", originalText: "$80", rubAmount: 7200 },
  priceCheck: {
    checkedAt: new Date().toISOString(),
    state: "down",
    previous: { amount: 100, currency: "USD", originalText: "$100", rubAmount: 9000 },
    current: { amount: 80, currency: "USD", originalText: "$80", rubAmount: 7200 },
    deltaAmount: -20,
    deltaRubAmount: -1800
  }
};
assert.match(
  vm.runInContext("renderSitePriceHtml(usdDeltaItem, 'wp')", sandbox),
  />\u2193 \$20 since last check/,
  "Same-currency deltas should not drift through RUB fallback conversion"
);

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
assert.match(read("extension/content/styles/panel-price-checker.js"), /\.wp-price-check-line[\s\S]*?wp-compact-price \.wp-price-check-detail/, "Price check microline should have compact-specific text");
assert.match(panelBaseStyles, /--wp-chrome-bg:[\s\S]*--wp-card-bg:[\s\S]*--wp-popover-bg:/, "Panel should define separate chrome, card, and popover material tokens");
assert.match(panelSearchStyles, /\.wp-inline-search[\s\S]*var\(--wp-chrome-iridescent\)[\s\S]*var\(--wp-chrome-bg\)/, "Search should use the chrome material");
assert.match(panelCurrencyStyles, /\.wp-currency-menu[\s\S]*background: var\(--wp-popover-bg\)/, "Currency menu should use strong popover material");
assert.match(panelDialogStyles, /\.wp-confirm-dialog[\s\S]*background: var\(--wp-popover-bg\)/, "Dialogs should use strong popover material");
assert.match(panelChromeStyles, /\.wp-count[\s\S]*?background: transparent/, "Count label should stay quiet inside the summary capsule");
assert.match(panelFilterStyles, /\.wp-filter[\s\S]*?background: rgba\(255, 255, 255, 0\.5\)/, "Filter pills should keep their previous visual treatment");
assert.match(panelSortStyles, /\.wp-sort-trigger[\s\S]*?var\(--wp-chrome-bg\)/, "Sort trigger should use the chrome material");

console.log("price display smoke passed");
