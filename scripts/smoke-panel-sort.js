const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sandbox = {
  PANEL_SORT_FIELD_RECENT: "recent",
  PANEL_SORT_FIELD_NAME: "name",
  PANEL_SORT_ASC: "asc",
  PANEL_SORT_DESC: "desc",
  panelState: {
    sortField: "recent",
    sortDirection: "desc"
  },
  normalizeComparableText: (value) => String(value || "").toLowerCase().trim()
};

vm.createContext(sandbox);
vm.runInContext(
  fs.readFileSync(path.join(root, "extension/content/panel/sort.js"), "utf8"),
  sandbox,
  { filename: "content/panel/sort.js" }
);

const sortStylesSource = fs.readFileSync(
  path.join(root, "extension/content/styles/panel-sort.js"),
  "utf8"
);

assert.match(
  sortStylesSource,
  /\.wp-sort-controls\s*\{[\s\S]*?width: 0;[\s\S]*?opacity: 0;[\s\S]*?pointer-events: none;/,
  "Sort controls should be hidden at rest"
);
assert.match(
  sortStylesSource,
  /\.wp-filters:hover \.wp-sort-controls,[\s\S]*?\.wp-filters:focus-within \.wp-sort-controls\s*\{[\s\S]*?width: 114px;[\s\S]*?opacity: 1;[\s\S]*?pointer-events: auto;/,
  "Sort controls should reveal on filter hover or focus"
);

const items = [
  { title: "Cabin", brand: "RIMOWA", createdAt: "2026-06-18T10:00:00.000Z" },
  { title: "Alpha Bag", brand: "Loewe", createdAt: "2026-06-20T10:00:00.000Z" },
  { title: "Zip Hoodie", brand: "LIME", createdAt: "2026-06-19T10:00:00.000Z" }
];

function sortedTitles(sortField, sortDirection) {
  sandbox.panelState.sortField = sortField;
  sandbox.panelState.sortDirection = sortDirection;
  sandbox.items = items;
  return vm.runInContext("panelSortedItems(items).map((item) => item.title)", sandbox);
}

assert.deepEqual(sortedTitles("recent", "desc"), ["Alpha Bag", "Zip Hoodie", "Cabin"]);
assert.deepEqual(sortedTitles("recent", "asc"), ["Cabin", "Zip Hoodie", "Alpha Bag"]);
assert.deepEqual(sortedTitles("name", "asc"), ["Alpha Bag", "Cabin", "Zip Hoodie"]);
assert.deepEqual(sortedTitles("name", "desc"), ["Zip Hoodie", "Cabin", "Alpha Bag"]);

let renderedItems = 0;
let syncedBrandCount = 0;
const filterListeners = {};
const sortButton = {
  disabled: false,
  dataset: { panelSort: "name" },
  closest: (selector) => (selector === "[data-panel-sort]" ? sortButton : null),
  classList: { remove: () => {} },
  setAttribute: (name, value) => {
    sortButton[name] = value;
  },
  removeAttribute: (name) => {
    delete sortButton[name];
  }
};
const filterRow = {
  addEventListener: (type, handler, options) => {
    filterListeners[type] = { handler, options };
  },
  contains: (node) => node === sortButton
};
const fakeRoot = {
  querySelector: (selector) => {
    if (selector === ".wp-filters") {
      return filterRow;
    }
    if (selector === ".wp-items") {
      return { classList: { remove: () => {} } };
    }
    return null;
  },
  querySelectorAll: (selector) => (selector === "[data-panel-sort]" ? [sortButton] : [])
};

sandbox.panelScopedItems = (candidateItems) => candidateItems;
sandbox.escapeHtml = (value) => value;
sandbox.lucideArrowDownIcon = () => "";
sandbox.lucideArrowUpIcon = () => "";
sandbox.renderPanelItemsOnly = () => {
  renderedItems += 1;
};
sandbox.syncPanelBrandCountControl = () => {
  syncedBrandCount += 1;
};
sandbox.syncPanelItemsTopOffset = () => {};
sandbox.window = {
  requestAnimationFrame: (callback) => callback(),
  setTimeout: (callback) => callback()
};
sandbox.panelState.items = items;
sandbox.panelState.sortField = "recent";
sandbox.panelState.sortDirection = "desc";
sandbox.panelState.brandCloudOpen = true;
sandbox.root = fakeRoot;

assert.equal(vm.runInContext('panelSortButtonState("name").shortLabel', sandbox), "A-Z");

vm.runInContext("bindPanelSortEvents(root)", sandbox);

assert.equal(filterListeners.click.options, true);

let prevented = false;
let stopped = false;
let stoppedImmediate = false;
const clickEvent = {
  target: sortButton,
  preventDefault: () => {
    prevented = true;
  },
  stopPropagation: () => {
    stopped = true;
  },
  stopImmediatePropagation: () => {
    stoppedImmediate = true;
  }
};
filterListeners.click.handler(clickEvent);
assert.equal(sandbox.panelState.sortField, "name");
assert.equal(sandbox.panelState.sortDirection, "asc");
assert.equal(sandbox.panelState.brandCloudOpen, false);
assert.equal(vm.runInContext('panelSortButtonState("name").shortLabel', sandbox), "Z-A");
assert.equal(renderedItems, 1);
assert.equal(syncedBrandCount, 1);
assert.equal(prevented, true);
assert.equal(stopped, true);
assert.equal(stoppedImmediate, true);

console.log("panel sort smoke passed");
