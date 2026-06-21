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
const filterControlsSource = fs.readFileSync(
  path.join(root, "extension/content/panel/filter-controls.js"),
  "utf8"
);
const sortSource = fs.readFileSync(
  path.join(root, "extension/content/panel/sort.js"),
  "utf8"
);

vm.runInContext(
  `${filterControlsSource}\n${sortSource}`,
  sandbox,
  { filename: "content/panel/sort.js" }
);

const sortStylesSource = fs.readFileSync(
  path.join(root, "extension/content/styles/panel-sort.js"),
  "utf8"
);
const filterStylesSource = fs.readFileSync(
  path.join(root, "extension/content/styles/panel-4.js"),
  "utf8"
);

assert.match(
  sortStylesSource,
  /\.wp-sort-controls\s*\{[\s\S]*?width: 0;[\s\S]*?min-width: 0;[\s\S]*?opacity: 0;[\s\S]*?visibility: hidden;[\s\S]*?pointer-events: none;/,
  "Sort controls should not reserve layout space at rest"
);
assert.match(
  sortStylesSource,
  /\.wp-sort-controls\s*\{[\s\S]*?gap: 2px;[\s\S]*?padding: 1px;[\s\S]*?background: rgba\(8, 11, 16, 0\.032\);/,
  "Sort controls should read as a lightweight neutral segmented utility group"
);
assert.match(
  sortStylesSource,
  /\.wp-filters\.is-controls-visible \.wp-sort-controls,[\s\S]*?\.wp-filters:focus-within \.wp-sort-controls\s*\{[\s\S]*?width: 104px;[\s\S]*?min-width: 104px;[\s\S]*?opacity: 1;[\s\S]*?visibility: visible;[\s\S]*?pointer-events: auto;/,
  "Sort controls should reveal only while the filter row is hover-locked or focused"
);
assert.match(
  sortStylesSource,
  /\.wp-sort-button\s*\{[\s\S]*?width: 48px;[\s\S]*?height: calc\(var\(--wp-pill-height\) - 2px\);/,
  "Sort buttons should stay lighter than category pills"
);
assert.doesNotMatch(
  sortStylesSource,
  /width\s+160ms|min-width\s+160ms/,
  "Sort controls should get a stable first-click hit area immediately"
);
assert.doesNotMatch(
  sortStylesSource,
  /74, 124, 170|238, 247, 255|217, 232, 246|61, 108, 154|139, 174, 205|177, 215, 248/,
  "Sort controls should use neutral styling, not blue chrome"
);
assert.doesNotMatch(
  sortStylesSource,
  /\.wp-sort-button\.is-active/,
  "Sort buttons should stay immediate actions, not current-state toggles"
);
assert.doesNotMatch(
  filterStylesSource,
  /width\s+180ms|max-width\s+180ms/,
  "Filter action controls should not animate row hit areas on reveal"
);
assert.doesNotMatch(
  filterStylesSource,
  /\.wp-filter-shell:not\(\.is-all\) \.wp-filter\s*\{[\s\S]*?padding-right:/,
  "Editable category pills should not reserve remove space before hover"
);
assert.doesNotMatch(
  filterStylesSource,
  /\.wp-filters\.is-controls-visible \.wp-filter-shell:not\(\.is-all\) \.wp-filter-remove/,
  "Filter-row hover lock should not show every category remove button"
);
assert.doesNotMatch(
  filterStylesSource,
  /margin-right:\s*-\d+px/,
  "Category remove affordance should not overlap adjacent pills"
);
assert.doesNotMatch(
  filterStylesSource,
  /wp-filter-wrap-break/,
  "Category remove affordance should not insert layout breaks"
);
assert.match(
  filterStylesSource,
  /\.wp-filter-shell\.is-remove-visible \.wp-filter,[\s\S]*?\.wp-filter-shell:focus-within \.wp-filter\s*\{[\s\S]*?padding-right: 28px;/,
  "Visible category remove affordance should grow the pill by 16px"
);
assert.match(
  filterStylesSource,
  /\.wp-filter-shell\.is-remove-pinned\s*\{[\s\S]*?width: var\(--wp-filter-static-width\);/,
  "Row-end category remove affordance should be able to pin shell width"
);
assert.match(
  filterControlsSource,
  /panelFilterStaticRemoveWidth[\s\S]*?const hoverGrowth = 16;[\s\S]*?isPanelFilterLastInVisualRow/,
  "Row-end category remove affordance should guard against hover wrap"
);
assert.match(
  filterStylesSource,
  /\.wp-filter-remove\s*\{[\s\S]*?right: 8px;[\s\S]*?z-index: 2;/,
  "Category remove affordance should stay inside the pill boundary"
);
assert.match(
  filterStylesSource,
  /\.wp-filter-shell\.is-remove-visible \.wp-filter-remove,[\s\S]*?\.wp-filter-shell:focus-within \.wp-filter-remove\s*\{[\s\S]*?opacity: 0\.74;[\s\S]*?pointer-events: auto;/,
  "Only the active or focused category should reveal its remove button"
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
let blurredSortButton = false;
const filterListeners = {};
const shellListeners = {};
const sortButton = {
  disabled: false,
  dataset: { panelSort: "name" },
  closest: (selector) => (selector === "[data-panel-sort]" ? sortButton : null),
  classList: {
    remove: () => {},
    toggle: () => {}
  },
  setAttribute: (name, value) => {
    sortButton[name] = value;
  },
  removeAttribute: (name) => {
    delete sortButton[name];
  },
  blur: () => {
    blurredSortButton = true;
    sandbox.document.activeElement = null;
  },
  matches: () => false
};
const filterRow = {
  classList: {
    visible: false,
    toggle: (_className, value) => {
      filterRow.classList.visible = value;
    },
    contains: (className) => className === "is-controls-visible" && filterRow.classList.visible
  },
  addEventListener: (type, handler, options) => {
    filterListeners[type] = { handler, options };
  },
  contains: (node) => node === sortButton || node === categoryShell,
  querySelectorAll: (selector) =>
    selector === ".wp-filter-shell.is-remove-visible" ? [categoryShell, otherCategoryShell] : [],
  getBoundingClientRect: () => ({ left: 0, top: 0, right: 320, bottom: 72 })
};
const categoryShell = {
  classList: {
    active: false,
    add: () => {
      categoryShell.classList.active = true;
    },
    toggle: (_className, value) => {
      categoryShell.classList.active = value;
    }
  }
};
const otherCategoryShell = {
  classList: {
    active: true,
    toggle: (_className, value) => {
      otherCategoryShell.classList.active = value;
    }
  }
};
const categoryTarget = {
  closest: (selector) => (selector === ".wp-filter-shell:not(.is-all)" ? categoryShell : null)
};
const shell = {
  addEventListener: (type, handler, options) => {
    shellListeners[type] = { handler, options };
  }
};
const fakeRoot = {
  querySelector: (selector) => {
    if (selector === ".wp-shell") {
      return shell;
    }
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
  setTimeout: (callback) => {
    callback();
    return 1;
  },
  clearTimeout: () => {}
};
sandbox.document = { activeElement: null };
sandbox.panelState.items = items;
sandbox.panelState.sortField = "recent";
sandbox.panelState.sortDirection = "desc";
sandbox.panelState.brandCloudOpen = true;
sandbox.root = fakeRoot;

assert.equal(vm.runInContext('panelSortButtonState("name").shortLabel', sandbox), "A-Z");

vm.runInContext("bindPanelSortEvents(root)", sandbox);

assert.equal(filterListeners.pointerover.options, undefined);
assert.equal(filterListeners.pointerdown.options, true);
assert.equal(filterListeners.click.options, true);
filterListeners.pointerover.handler();
assert.equal(filterRow.classList.visible, true, "Pointerover should lock controls before pointerdown");
filterListeners.mouseleave.handler({ clientX: 160, clientY: 120 });
assert.equal(filterRow.classList.visible, false, "Leaving after pointerover should unlock controls");
filterListeners.mouseenter.handler();
assert.equal(filterRow.classList.visible, true, "Entering filters should lock controls visible");
shellListeners.pointermove.handler({ clientX: 160, clientY: 120 });
assert.equal(filterRow.classList.visible, false, "Moving inside the panel but outside filters should unlock controls");
filterListeners.mouseenter.handler();
sortButton.matches = (selector) => selector === ":focus-visible";
sandbox.document.activeElement = sortButton;
shellListeners.pointermove.handler({ clientX: 160, clientY: 120 });
assert.equal(filterRow.classList.visible, true, "Keyboard focus should keep filter controls visible");
sortButton.matches = () => false;
sandbox.document.activeElement = null;
filterListeners.mouseover.handler({ target: categoryTarget });
assert.equal(categoryShell.classList.active, true, "Hovering a category should expand only that pill");
assert.equal(otherCategoryShell.classList.active, false, "Hovering a category should collapse the previous category pill");
filterListeners.mouseleave.handler({ clientX: 160, clientY: 36 });
assert.equal(filterRow.classList.visible, true, "Reflow inside the filter row should not unlock controls");
filterListeners.mouseleave.handler({ clientX: 160, clientY: 120 });
assert.equal(filterRow.classList.visible, false, "Leaving the filter row should unlock controls quickly");
filterListeners.mouseenter.handler();
assert.equal(filterRow.classList.visible, true, "Re-entering filters should relock controls immediately");
shellListeners.mouseleave.handler();
assert.equal(filterRow.classList.visible, false, "Leaving the panel should unlock controls");

filterListeners.mouseenter.handler();
sandbox.document.activeElement = sortButton;
let pointerPrevented = false;
let pointerStopped = false;
let pointerStoppedImmediate = false;
const pointerEvent = {
  target: sortButton,
  button: 0,
  isPrimary: true,
  preventDefault: () => {
    pointerPrevented = true;
  },
  stopPropagation: () => {
    pointerStopped = true;
  },
  stopImmediatePropagation: () => {
    pointerStoppedImmediate = true;
  }
};
filterListeners.pointerdown.handler(pointerEvent);
assert.equal(sandbox.panelState.sortField, "name");
assert.equal(sandbox.panelState.sortDirection, "asc");
assert.equal(sandbox.panelState.brandCloudOpen, false);
assert.equal(vm.runInContext('panelSortButtonState("name").shortLabel', sandbox), "Z-A");
assert.equal(renderedItems, 1);
assert.equal(syncedBrandCount, 1);
assert.equal(filterRow.classList.visible, true, "Sort pointerdown should keep filter controls visible");
assert.equal(blurredSortButton, true, "Sort pointerdown should clear focus so de-hover can hide controls");
filterListeners.focusout.handler();
assert.equal(filterRow.classList.visible, true, "Focusout during sort pointerdown should not hide while hovered");
assert.equal(pointerPrevented, true);
assert.equal(pointerStopped, true);
assert.equal(pointerStoppedImmediate, true);

let clickPrevented = false;
let clickStopped = false;
let clickStoppedImmediate = false;
const clickEvent = {
  target: sortButton,
  detail: 1,
  preventDefault: () => {
    clickPrevented = true;
  },
  stopPropagation: () => {
    clickStopped = true;
  },
  stopImmediatePropagation: () => {
    clickStoppedImmediate = true;
  }
};
filterListeners.click.handler(clickEvent);
assert.equal(sandbox.panelState.sortField, "name");
assert.equal(sandbox.panelState.sortDirection, "asc");
assert.equal(renderedItems, 1);
assert.equal(syncedBrandCount, 1);
assert.equal(clickPrevented, true);
assert.equal(clickStopped, true);
assert.equal(clickStoppedImmediate, true);
filterListeners.mouseleave.handler({ clientX: 160, clientY: 120 });
assert.equal(filterRow.classList.visible, false, "Leaving filters after sort pointerdown should hide controls");

console.log("panel sort smoke passed");
