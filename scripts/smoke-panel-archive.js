const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const archiveSource = fs.readFileSync(
  path.join(root, "extension/content/panel/archive.js"),
  "utf8"
);

const sandbox = {
  STORAGE_KEY: "stash.items.v1",
  panelState: {
    items: [{ id: "item-1", title: "Cabin", url: "https://example.com/cabin" }],
    archivedOpen: false,
    brandCloudOpen: false,
    brandFilterKey: "",
    brandFilterLabel: "",
    searchOpen: false,
    searchQuery: "",
    activeCategory: "all",
    categoryComposerOpen: false,
    deleteCategoryId: "",
    deleteItemId: "",
    editItemId: ""
  },
  lastStored: null,
  renderCount: 0,
  normalizePanelItem: (item) => item,
  panelSummaryTextForItems: () => "$1",
  setLocalStorageValue: async (_key, value) => {
    sandbox.lastStored = value;
  },
  renderStashPanel: () => {
    sandbox.renderCount += 1;
  },
  safelyRunPanelAction: (action) => {
    sandbox.lastAction = Promise.resolve().then(action);
  }
};

vm.createContext(sandbox);
vm.runInContext(archiveSource, sandbox, { filename: "content/panel/archive.js" });

const summaryScopeItems = [
  { id: "active-item", title: "Active", url: "https://example.com/active" },
  { id: "archived-item", title: "Archived", url: "https://example.com/archived", archivedAt: "2026-06-21T00:00:00.000Z" }
];
sandbox.panelState.items = summaryScopeItems;
assert.deepEqual(
  vm.runInContext("panelSummaryItems(panelState.items).map((item) => item.id)", sandbox),
  ["active-item"],
  "Summary should use active items outside archive view"
);
sandbox.panelState.archivedOpen = true;
assert.deepEqual(
  vm.runInContext("panelSummaryItems(panelState.items).map((item) => item.id)", sandbox),
  ["archived-item"],
  "Summary should use archived items inside archive view"
);
sandbox.panelState.archivedOpen = false;
sandbox.panelState.items = [{ id: "item-1", title: "Cabin", url: "https://example.com/cabin" }];

const clickListeners = {};
const archiveButton = {
  dataset: { archiveId: "item-1" },
  closest: (selector) => (selector === "[data-archive-id]" ? archiveButton : null)
};
const restoreButton = {
  dataset: { restoreId: "item-1" },
  closest: (selector) => (selector === "[data-restore-id]" ? restoreButton : null)
};
const archiveClick = {
  target: archiveButton,
  preventDefault: () => {
    archiveClick.prevented = true;
  },
  stopPropagation: () => {
    archiveClick.stopped = true;
  }
};
const restoreClick = {
  target: restoreButton,
  preventDefault: () => {
    restoreClick.prevented = true;
  },
  stopPropagation: () => {
    restoreClick.stopped = true;
  }
};
const itemsRoot = {
  addEventListener: (eventName, listener) => {
    clickListeners[eventName] = listener;
  }
};
const rootNode = {
  querySelector: (selector) => (selector === ".wp-items" ? itemsRoot : null)
};
sandbox.rootNode = rootNode;

vm.runInContext("bindPanelArchiveEvents(rootNode)", sandbox);
clickListeners.click(archiveClick);

sandbox.lastAction
  .then(() => {
    assert.equal(archiveClick.prevented, true);
    assert.equal(archiveClick.stopped, true);
    assert.ok(sandbox.panelState.items[0].archivedAt, "Archive click should set archivedAt");
    assert.equal(sandbox.lastStored[0].id, "item-1");
    assert.equal(sandbox.renderCount, 1);

    clickListeners.click(restoreClick);
    return sandbox.lastAction;
  })
  .then(() => {
    assert.equal(restoreClick.prevented, true);
    assert.equal(restoreClick.stopped, true);
    assert.equal(sandbox.panelState.items[0].archivedAt, undefined);
    assert.equal(sandbox.renderCount, 2);
    console.log("panel archive smoke passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
