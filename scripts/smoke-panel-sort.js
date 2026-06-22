const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sandbox = {
  PANEL_SORT_FIELD_RECENT: "recent",
  PANEL_SORT_FIELD_NAME: "name",
  PANEL_SORT_FIELD_PRICE: "price",
  PANEL_SORT_ASC: "asc",
  PANEL_SORT_DESC: "desc",
  panelState: {
    sortField: "recent",
    sortDirection: "desc",
    activeCategory: "all",
    searchQuery: "",
    brandCloudOpen: false,
    brandCloudSortList: false,
    brandFilterKey: "",
    filterMenuOpen: false
  },
  normalizeComparableText: (value) => String(value || "").toLowerCase().trim(),
  numericPrice: (value) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? amount : undefined;
  },
  normalizePanelPrice: (item) => item.price || { amount: item.priceAmount, rubAmount: item.rubPriceAmount },
  t: (key, replacements = {}) => String(key || "").replace(/\{([A-Za-z0-9_]+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(replacements, name) ? String(replacements[name]) : match
  )
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
const filtersSource = fs.readFileSync(
  path.join(root, "extension/content/panel/filters.js"),
  "utf8"
);
const compactViewSource = fs.readFileSync(
  path.join(root, "extension/content/panel/compact-view.js"),
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
const filterMenuStylesSource = fs.readFileSync(
  path.join(root, "extension/content/styles/panel-filter-menu.js"),
  "utf8"
);

assert.match(
  sortStylesSource,
  /\.wp-sort-trigger\s*\{[\s\S]*?min-width: 74px;[\s\S]*?var\(--wp-chrome-bg\)/,
  "Sort should be a stable separate chrome trigger"
);
assert.match(
  filtersSource,
  /renderBrandFilterChip\(\)[\s\S]*?renderAllFilter\(allCategory\)[\s\S]*?renderFilterMenuTrigger\(categoryOptions\)[\s\S]*?renderArchivedFilter\(archivedCount\)/,
  "Second chip row should render brand chip, All, Filter, then optional Archived"
);
assert.match(
  filtersSource,
  /phosphorTagIcon\("wp-brand-chip-icon"\)[\s\S]*?<span class="wp-brand-chip-count">\$\{brandCount\}<\/span>/,
  "Brand chip should use a tag icon and numeric count"
);
assert.match(
  filtersSource,
  /function panelFilterTriggerLabel\(categories\)[\s\S]*?return t\("Filter"\);[\s\S]*?return t\("Filter \(\{count\}\)", \{ count \}\);/,
  "Active filter trigger should show only the number of applied filters"
);
assert.doesNotMatch(
  filtersSource,
  /Filter ·|category\?\.label \|\| "Category"/,
  "Active filter trigger should not name the selected category"
);
assert.match(
  sortStylesSource,
  /\.wp-sort-menu\s*\{[\s\S]*?position: absolute;[\s\S]*?right: 0;[\s\S]*?width: 170px;/,
  "Sort choices should live in a right-aligned menu"
);
assert.match(
  sortStylesSource,
  /\.wp-sort-option\s*\{[\s\S]*?grid-template-columns: 18px minmax\(0, 1fr\);/,
  "Sort menu options should be compact menu rows"
);
assert.match(
  sortStylesSource,
  /@keyframes wpSortMenuIn/,
  "Sort menu should have a restrained presence animation"
);
assert.doesNotMatch(
  sortSource,
  /title="\$\{escapeAttribute\(state\.title\)\}"|setAttribute\("title"/,
  "Sort buttons should not use native title tooltips"
);
assert.doesNotMatch(
  sortStylesSource,
  /width\s+\d+ms|min-width\s+\d+ms/,
  "Sort controls should not animate layout width"
);
assert.doesNotMatch(
  sortStylesSource,
  /74, 124, 170|238, 247, 255|217, 232, 246|61, 108, 154|139, 174, 205|177, 215, 248/,
  "Sort controls should use neutral styling, not blue chrome"
);
assert.doesNotMatch(
  sortStylesSource,
  /\.wp-filters\.is-controls-visible \.wp-sort-controls/,
  "Sort should no longer be a hover-revealed filter-row control"
);
assert.match(
  filterStylesSource,
  /\.wp-filters\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto;/,
  "Filters should reserve a separate fixed sort region"
);
assert.match(
  filterMenuStylesSource,
  /\.wp-filter-rail\s*\{[\s\S]*?justify-self: start;[\s\S]*?width: 100%;[\s\S]*?gap: 8px;[\s\S]*?overflow: hidden;/,
  "Second-row chips should stay in a compact fixed left cluster"
);
assert.match(
  filterStylesSource,
  /\.wp-filters\s*\{[\s\S]*?gap: 8px;[\s\S]*?margin-bottom: 16px;/,
  "Filter row should stay aligned to the 8px spacing grid"
);
assert.match(
  filterMenuStylesSource,
  /\.wp-brand-chip,[\s\S]*?\.wp-filter-rail > \.wp-filter\s*\{[\s\S]*?border: 1px solid var\(--border\);[\s\S]*?border-radius: 999px;/,
  "Brand chip should use the same pill treatment as other row chips"
);
assert.match(
  filterMenuStylesSource,
  /\.wp-brand-chip\s*\{[\s\S]*?flex: 0 0 auto;[\s\S]*?min-width: 50px;[\s\S]*?padding: 0 10px;/,
  "Brand chip should keep a compact floor and resize for multi-digit counts"
);
assert.match(
  filterMenuStylesSource,
  /\.wp-filter-rail > \.wp-filter-archive\s*\{[\s\S]*?flex: 0 0 auto;[\s\S]*?min-width: 50px;[\s\S]*?padding: 0 10px;/,
  "Archive chip should keep a compact floor and resize for multi-digit counts"
);
assert.match(
  filterMenuStylesSource,
  /\.wp-brand-chip\.is-active\s*\{[\s\S]*?border-color: rgba\(8, 11, 16, 0\.14\);[\s\S]*?background: rgba\(255, 255, 255, 0\.76\);/,
  "Brand trigger active/open state should stay outlined instead of using selected-filter black"
);
assert.match(
  filterMenuStylesSource,
  /\.wp-filter-rail > \.wp-filter\.is-active\s*\{[\s\S]*?background: rgba\(8, 11, 16, 0\.86\);/,
  "Only active filter chips should use the black selected surface"
);
assert.match(
  filterMenuStylesSource,
  /\.wp-theme-graphite \.wp-brand-chip\.is-active\s*\{[\s\S]*?background: rgba\(255, 255, 255, 0\.08\);/,
  "Graphite brand trigger active/open state should stay a muted trigger surface"
);
assert.match(
  filterMenuStylesSource,
  /\.wp-theme-graphite \.wp-filter-rail > \.wp-filter\.is-active\s*\{[\s\S]*?color: #080b10;[\s\S]*?background: rgba\(244, 244, 240, 0\.9\);/,
  "Graphite active filter chips should use the light selected surface, not black-on-black"
);
assert.match(
  filtersSource,
  /phosphorArchiveIcon\("wp-archive-chip-icon"\)[\s\S]*?wp-archive-count/,
  "Archived chip should render as a Phosphor icon plus count"
);
assert.match(
  filterMenuStylesSource,
  /\.wp-brand-chip-count\s*\{[\s\S]*?min-width: 1ch;[\s\S]*?font-variant-numeric: tabular-nums;/,
  "Brand count should reserve one tabular digit and grow naturally"
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
  "Visible category remove affordance should use the original hover pill sizing"
);
assert.match(sortSource, /function panelShouldShowSortControls[\s\S]*?panelVisibleItems\(items\)\.length >= 2/, "Sort controls should only render for two or more currently visible items");
assert.match(sortSource, /currentControls\.remove\(\);[\s\S]*?insertAdjacentHTML\?\.\("beforeend", renderPanelSortControls\(\)\)/, "Sort controls should be removed or reinserted as live result counts change");
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
  { title: "Cabin", brand: "RIMOWA", createdAt: "2026-06-18T10:00:00.000Z", price: { rubAmount: 300 } },
  { title: "Alpha Bag", brand: "Loewe", createdAt: "2026-06-20T10:00:00.000Z", price: { rubAmount: 100 } },
  { title: "Zip Hoodie", brand: "LIME", createdAt: "2026-06-19T10:00:00.000Z", price: { rubAmount: 200 } }
];

sandbox.panelScopedItems = (candidateItems) => candidateItems;
sandbox.panelItemMatchesSearch = (item) => {
  const query = String(sandbox.panelState.searchQuery || "").toLowerCase().trim();
  return !query || `${item.title} ${item.brand}`.toLowerCase().includes(query);
};
sandbox.panelItemMatchesBrandFilter = (item) =>
  !sandbox.panelState.brandFilterKey || item.brand === sandbox.panelState.brandFilterKey;
sandbox.escapeHtml = (value) => value;
sandbox.escapeAttribute = (value) => value;
sandbox.phosphorChevronDownIcon = () => "";
sandbox.phosphorCheckIcon = () => "";
sandbox.phosphorArrowDownIcon = () => "";
sandbox.phosphorArrowUpIcon = () => "";

sandbox.panelState.items = [items[0]];
assert.equal(vm.runInContext("renderPanelSortControls().trim()", sandbox), "");
sandbox.panelState.items = items.slice(0, 2);
assert.match(
  vm.runInContext("renderPanelSortControls()", sandbox),
  /wp-sort-controls/,
  "Sort controls should render when the current list has at least two items"
);
sandbox.panelState.searchQuery = "alpha";
assert.equal(
  vm.runInContext("renderPanelSortControls().trim()", sandbox),
  "",
  "Sort controls should disappear when search narrows the current list below two items"
);
sandbox.panelState.searchQuery = "";
sandbox.panelState.activeCategory = "bags";
sandbox.panelState.items = [
  { ...items[0], category: "tops" },
  { ...items[1], category: "bags" },
  { ...items[2], category: "tops" }
];
assert.equal(
  vm.runInContext("renderPanelSortControls().trim()", sandbox),
  "",
  "Sort controls should disappear when the selected category has fewer than two items"
);
sandbox.panelState.activeCategory = "all";
sandbox.panelState.items = items;

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
assert.deepEqual(sortedTitles("price", "asc"), ["Alpha Bag", "Zip Hoodie", "Cabin"]);
assert.deepEqual(sortedTitles("price", "desc"), ["Cabin", "Zip Hoodie", "Alpha Bag"]);

let renderedItems = 0;
let reorderedItems = 0;
let syncedBrandCount = 0;
const filterListeners = {};
const shellListeners = {};
let renderedSortControl = "";
const sortRoot = {
  set outerHTML(value) {
    renderedSortControl = value;
  }
};
const sortTrigger = {
  closest: (selector) => (selector === "[data-panel-sort-trigger]" ? sortTrigger : null),
  matches: () => false
};
const sortOption = {
  dataset: { panelSortField: "name", panelSortDirection: "asc" },
  closest: (selector) => (selector === "[data-panel-sort-option]" ? sortOption : null)
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
  contains: (node) => node === sortTrigger || node === sortOption || node === categoryShell || node === sortRoot,
  querySelector: (selector) => (selector === "[data-panel-sort-root]" ? sortRoot : null),
  insertAdjacentHTML: (_position, html) => {
    renderedSortControl = html;
  },
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
    return null;
  },
  querySelectorAll: () => []
};

sandbox.renderPanelItemsOnly = () => { renderedItems += 1; };
sandbox.reorderPanelItemsOnly = () => { reorderedItems += 1; return true; };
sandbox.syncPanelBrandCountControl = () => {
  syncedBrandCount += 1;
};
sandbox.closePanelFilterMenu = () => {
  sandbox.panelState.filterMenuOpen = false;
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

assert.equal(vm.runInContext("panelCurrentSortOption().label", sandbox), "Date newest");

vm.runInContext("bindPanelSortEvents(root)", sandbox);

assert.equal(filterListeners.pointerover.options, undefined);
assert.equal(filterListeners.click.options, true);
filterListeners.pointerover.handler();
assert.equal(filterRow.classList.visible, true, "Pointerover should lock optional filter controls");
filterListeners.mouseleave.handler({ clientX: 160, clientY: 120 });
assert.equal(filterRow.classList.visible, false, "Leaving after pointerover should unlock controls");
filterListeners.mouseenter.handler();
assert.equal(filterRow.classList.visible, true, "Entering filters should lock controls visible");
shellListeners.pointermove.handler({ clientX: 160, clientY: 120 });
assert.equal(filterRow.classList.visible, false, "Moving inside the panel but outside filters should unlock controls");
filterListeners.mouseenter.handler();
sortTrigger.matches = (selector) => selector === ":focus-visible";
sandbox.document.activeElement = sortTrigger;
shellListeners.pointermove.handler({ clientX: 160, clientY: 120 });
assert.equal(filterRow.classList.visible, true, "Keyboard focus should keep filter controls visible");
sortTrigger.matches = () => false;
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
sandbox.document.activeElement = sortTrigger;
let triggerPrevented = false;
let triggerStopped = false;
let triggerStoppedImmediate = false;
const triggerClick = {
  target: sortTrigger,
  detail: 1,
  preventDefault: () => {
    triggerPrevented = true;
  },
  stopPropagation: () => {
    triggerStopped = true;
  },
  stopImmediatePropagation: () => {
    triggerStoppedImmediate = true;
  }
};
filterListeners.click.handler(triggerClick);
assert.equal(sandbox.panelState.sortMenuOpen, true);
assert.match(renderedSortControl, /wp-sort-menu/);
assert.match(renderedSortControl, />Sort</);
assert.equal(reorderedItems, 0);
assert.equal(triggerPrevented, true);
assert.equal(triggerStopped, true);
assert.equal(triggerStoppedImmediate, true);

let optionPrevented = false;
let optionStopped = false;
let optionStoppedImmediate = false;
const optionClick = {
  target: sortOption,
  preventDefault: () => {
    optionPrevented = true;
  },
  stopPropagation: () => {
    optionStopped = true;
  },
  stopImmediatePropagation: () => {
    optionStoppedImmediate = true;
  }
};
filterListeners.click.handler(optionClick);
assert.equal(sandbox.panelState.sortField, "name");
assert.equal(sandbox.panelState.sortDirection, "asc");
assert.equal(sandbox.panelState.sortMenuOpen, false);
assert.equal(sandbox.panelState.brandCloudOpen, true);
assert.equal(sandbox.panelState.brandCloudSortList, true);
assert.equal(vm.runInContext("panelCurrentSortOption().label", sandbox), "Name A-Z");
assert.equal(reorderedItems, 1);
assert.equal(renderedItems, 0);
assert.equal(syncedBrandCount, 1);
assert.equal(optionPrevented, true);
assert.equal(optionStopped, true);
assert.equal(optionStoppedImmediate, true);

console.log("panel sort smoke passed");
