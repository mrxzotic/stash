const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(
  path.join(root, "extension/content/panel/price-checker.js"),
  "utf8"
);

const buttonClassList = {
  values: new Set(),
  toggle(name, active) {
    active ? this.values.add(name) : this.values.delete(name);
  }
};

const button = {
  attributes: {},
  classList: buttonClassList,
  setAttribute(name, value) {
    this.attributes[name] = value;
  },
  toggleAttribute(name, active) {
    this.attributes[name] = active ? "" : undefined;
  }
};

const shadowRoot = {
  querySelector(selector) {
    return selector === "[data-price-checker-trigger]" ? button : null;
  }
};

const sandbox = {
  CSS: { escape: (value) => String(value).replace(/"/g, '\\"') },
  Date,
  Promise,
  URL,
  STORAGE_KEY: "tuckio.items.v1",
  cleanText: (value) => String(value || "").trim(),
  convertPriceToRub: async (price) => ({
    amount: Math.round(price.amount * 90),
    rate: 90,
    source: "test",
    text: `${Math.round(price.amount * 90)} RUB`
  }),
  document: {
    getElementById: () => ({ shadowRoot })
  },
  escapeAttribute: (value) => String(value || ""),
  fetchPanelItemPrice: async () => null,
  location: new URL("https://shop.test/product-a"),
  normalizePanelItem: (item) => item,
  normalizeUrl: (value) => new URL(value).toString(),
  numericPrice: (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : undefined;
  },
  sameProductPageUrl: (left, right) => new URL(left).pathname === new URL(right).pathname,
  panelActiveItems: (items) => items.filter((item) => !item.archivedAt),
  panelState: {
    archivedOpen: false,
    items: [
      {
        id: "active",
        url: "https://shop.test/product-a",
        price: { amount: 100, currency: "USD", rubAmount: 9000 }
      },
      {
        id: "archived",
        url: "https://shop.test/product-b",
        price: { amount: 120, currency: "USD", rubAmount: 10800 },
        archivedAt: "2026-06-24T20:00:00.000Z"
      }
    ]
  },
  phosphorArrowDownIcon: () => '<span class="wp-price-check-status-icon is-arrow-down"></span>',
  phosphorArrowUpIcon: () => '<span class="wp-price-check-status-icon is-arrow-up"></span>',
  phosphorCheckIcon: () => '<span class="wp-price-check-status-icon is-check"></span>',
  phosphorRefreshIcon: () => '<span class="wp-price-checker-icon"></span>',
  refreshPanelSummaryRate: () => {
    sandbox.refreshedSummaryRate = true;
  },
  renderPanelItemsOnly: () => {
    sandbox.renderedItems = true;
  },
  renderPanelSummaryOnly: (options) => {
    sandbox.summaryOptions = options;
  },
  setLocalStorageValue: async (key, value) => {
    sandbox.stored = { key, value };
    return value;
  },
  t: (key) => key,
  window: {
    clearTimeout: () => {},
    setTimeout: (callback) => {
      callback();
      return 1;
    }
  }
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "content/panel/price-checker.js" });

sandbox.extractProduct = () => ({
  url: "https://shop.test/product-a",
  priceText: "1.811 €",
  priceAmount: 1811,
  currency: "EUR",
  compareAtPriceText: "2.010 €",
  compareAtPriceAmount: 2010,
  isSale: true
});

const buttonHtml = vm.runInContext("renderPanelPriceCheckButton()", sandbox);
assert.match(buttonHtml, /data-price-checker-trigger/);
assert.match(buttonHtml, /data-panel-hint="Check prices"/);
assert.doesNotMatch(buttonHtml, /\stitle=/);
assert.deepEqual(
  Array.from(vm.runInContext("panelPriceCheckItems().map((item) => item.id)", sandbox)),
  ["active"]
);
assert.equal(
  vm.runInContext("panelPriceCheckState(panelState.items[0], { ...panelState.items[0] })", sandbox),
  "same"
);
assert.equal(
  vm.runInContext("panelPriceCheckState(panelState.items[0], { ...panelState.items[0], price: { amount: 120, currency: 'USD', rubAmount: 10800 } })", sandbox),
  "up"
);
assert.match(
  vm.runInContext("renderPanelPriceCheckStatusIcon('down')", sandbox),
  /is-down[\s\S]*is-arrow-down/
);
assert.equal(
  vm.runInContext("panelPriceCheckSummaryStateFor([{ state: 'same' }, { state: 'missed' }])", sandbox),
  "same"
);
assert.equal(
  vm.runInContext("panelPriceCheckSummaryStateFor([{ state: 'up' }, { state: 'down' }])", sandbox),
  "updated"
);
assert.equal(
  vm.runInContext("panelLivePageProductFor('https://shop.test/product-a').compareAtPriceAmount", sandbox),
  2010
);

vm.runInContext(`
  fetchPanelItemPrice = async () => ({
    amount: 80,
    currency: "USD",
    originalText: "$80",
    compareAtAmount: 100,
    compareAtText: "$100",
    isSale: true
  });
  animatePanelPriceCheckCards = (root, checked) => {
    checkedResults = checked;
  };
`, sandbox);

vm.runInContext("checkPanelPrices()", sandbox)
  .then(() => {
    assert.equal(sandbox.stored.key, "tuckio.items.v1");
    assert.equal(sandbox.panelState.items[0].price.amount, 80);
    assert.equal(sandbox.panelState.items[0].rubPriceAmount, 7200);
    assert.equal(sandbox.panelState.items[1].price.amount, 120);
    assert.equal(sandbox.renderedItems, true);
    assert.deepEqual({ ...sandbox.summaryOptions }, { animate: true });
    assert.equal(sandbox.refreshedSummaryRate, true);
    assert.deepEqual(JSON.parse(JSON.stringify(sandbox.checkedResults)), [{ id: "active", state: "down" }]);
    assert.equal(button.attributes.disabled, undefined);
    assert.equal(button.attributes["aria-busy"], "false");
    console.log("panel price checker smoke passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
