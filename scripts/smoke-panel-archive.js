const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const archiveSource = fs.readFileSync(
  path.join(root, "extension/content/panel/archive.js"),
  "utf8"
);
const decisionsSource = fs.readFileSync(
  path.join(root, "extension/content/panel/decisions.js"),
  "utf8"
);

const sandbox = {
  STORAGE_KEY: "tuckio.items.v1",
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
    editItemId: "",
    decisionItemId: "",
    decisionDragItemId: "",
    shortlistOpen: false
  },
  lastStored: null,
  renderCount: 0,
  normalizePanelItem: (item) => item,
  cleanText: (value) => String(value || "").trim(),
  panelSummaryTextForItems: () => "$1",
  rememberPanelFocus: () => {},
  t: (value) => value,
  setLocalStorageValue: async (_key, value) => {
    sandbox.lastStored = value;
  },
  renderTuckioPanel: () => {
    sandbox.renderCount += 1;
  },
  renderTuckioPanelWithMotion: (kind) => {
    sandbox.renderCount += 1;
    sandbox.lastMotionKind = kind;
  },
  syncPanelViewStateWithMotion: (options = {}) => {
    sandbox.viewSyncCount = (sandbox.viewSyncCount || 0) + 1;
    sandbox.lastMotionKind = "view";
    sandbox.lastViewSyncOptions = options;
  },
  safelyRunPanelAction: (action) => {
    sandbox.lastAction = Promise.resolve().then(action);
  }
};

vm.createContext(sandbox);
vm.runInContext(decisionsSource, sandbox, { filename: "content/panel/decisions.js" });
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
sandbox.panelState.activeCategory = "bags";
vm.runInContext("togglePanelArchivedView()", sandbox);
assert.equal(sandbox.panelState.archivedOpen, true, "Archive toggle should open archive view");
assert.equal(sandbox.panelState.activeCategory, "bags", "Archive toggle should preserve the child category filter");
sandbox.panelState.archivedOpen = false;
sandbox.panelState.activeCategory = "tops";
vm.runInContext("openPanelArchivedDecisionList()", sandbox);
assert.equal(sandbox.panelState.archivedOpen, true, "Decision archive helper should open archive view");
assert.equal(sandbox.panelState.activeCategory, "tops", "Decision archive helper should preserve the child category filter");
sandbox.panelState.archivedOpen = false;
sandbox.panelState.activeCategory = "all";

const clickListeners = {};
const dropListeners = {};
const decisionButton = {
  dataset: { decisionMenuId: "item-1" },
  closest: (selector) => (selector === "[data-decision-menu-id]" ? decisionButton : null)
};
const boughtButton = {
  dataset: { decisionDropAction: "bought" },
  closest: (selector) => (selector === "[data-decision-drop-action]" ? boughtButton : null)
};
const restoreButton = {
  dataset: { restoreId: "item-1" },
  closest: (selector) => (selector === "[data-restore-id]" ? restoreButton : null)
};
const decisionClick = {
  target: decisionButton,
  preventDefault: () => {
    decisionClick.prevented = true;
  },
  stopPropagation: () => {
    decisionClick.stopped = true;
  }
};
const boughtClick = {
  target: boughtButton,
  preventDefault: () => {
    boughtClick.prevented = true;
  },
  stopPropagation: () => {
    boughtClick.stopped = true;
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
const dropTray = {
  addEventListener: (eventName, listener) => {
    dropListeners[eventName] = listener;
  }
};
const rootNode = {
  querySelector: (selector) =>
    selector === ".wp-items"
      ? itemsRoot
      : selector === "[data-decision-drop-tray]"
        ? dropTray
        : null
};
sandbox.rootNode = rootNode;

vm.runInContext("bindPanelArchiveEvents(rootNode)", sandbox);

const shellClassList = new Set();
sandbox.dragRoot = {
  querySelector: (selector) => selector === ".wp-shell"
    ? {
        classList: {
          add: (name) => shellClassList.add(name),
          remove: (name) => shellClassList.delete(name)
        }
      }
    : null,
  querySelectorAll: () => []
};
sandbox.dragItem = {
  dataset: { decisionDraggableId: "item-1" },
  classList: { add: () => {}, remove: () => {} },
  closest: (selector) => selector === "[data-decision-draggable-id]" ? sandbox.dragItem : null
};
sandbox.dragEvent = {
  target: sandbox.dragItem,
  dataTransfer: {
    setData: (type, value) => {
      sandbox.dragData = { type, value };
    }
  }
};
vm.runInContext("startPanelDecisionDrag(dragRoot, dragEvent)", sandbox);
assert.equal(sandbox.panelState.decisionDragItemId, "item-1");
assert.deepEqual(sandbox.dragData, { type: "text/plain", value: "item-1" });
assert.equal(shellClassList.has("is-decision-dragging"), true);

async function run() {
  sandbox.renderCount = 0;
  sandbox.panelState.items = [{ id: "item-1", title: "Cabin", url: "https://example.com/cabin" }];
  await vm.runInContext("togglePanelShortlistItem('item-1')", sandbox);
  assert.ok(sandbox.panelState.items[0].shortlistedAt, "Shortlist should set shortlistedAt");
  assert.equal(sandbox.renderCount, 0, "Shortlist click should sync in place instead of jumping the list to the top");
  await vm.runInContext("togglePanelShortlistItem('item-1')", sandbox);
  assert.equal(sandbox.panelState.items[0].shortlistedAt, undefined, "Second shortlist click should clear shortlistedAt");
  sandbox.viewSyncCount = 0;
  sandbox.panelState.shortlistOpen = true;
  sandbox.panelState.items = [{ id: "item-1", title: "Cabin", url: "https://example.com/cabin", shortlistedAt: "2026-06-24T00:00:00.000Z" }];
  await vm.runInContext("togglePanelShortlistItem('item-1')", sandbox);
  assert.equal(sandbox.panelState.shortlistOpen, false, "Removing the last shortlist item should leave shortlist scope");
  assert.equal(sandbox.panelState.items[0].shortlistedAt, undefined, "Removing the last shortlist item should clear the star");
  assert.equal(sandbox.viewSyncCount, 1, "Removing the last shortlist item should resync the visible list and summary");
  sandbox.panelState.items = [{ id: "item-1", title: "Cabin", url: "https://example.com/cabin", userFacts: { priority: "shortlist", note: "warm" } }];
  await vm.runInContext("togglePanelShortlistItem('item-1')", sandbox);
  assert.equal(sandbox.panelState.items[0].userFacts.priority, undefined, "Shortlist toggle should clear legacy priority fact");
  assert.equal(sandbox.panelState.items[0].userFacts.note, "warm", "Shortlist toggle should preserve unrelated user facts");

  sandbox.renderCount = 0;
  sandbox.viewSyncCount = 0;
  sandbox.panelState.items = [{ id: "item-1", title: "Cabin", url: "https://example.com/cabin" }];
  clickListeners.click(decisionClick);
  assert.equal(decisionClick.prevented, true);
  assert.equal(decisionClick.stopped, true);
  assert.equal(sandbox.panelState.decisionItemId, "item-1", "Archive action should open global decision mode");
  dropListeners.click(boughtClick);
  await sandbox.lastAction;

  assert.ok(sandbox.panelState.items[0].archivedAt, "Archive click should set archivedAt");
  assert.equal(sandbox.panelState.items[0].decision.state, "bought");
  assert.equal(sandbox.panelState.archivedOpen, true, "Deciding should reveal the archive list where the decision is visible");
  assert.equal(sandbox.lastStored[0].id, "item-1");
  assert.equal(sandbox.lastMotionKind, "view", "Deciding should reveal archive with view motion");
  assert.equal(sandbox.renderCount, 0, "Opening decision mode and deciding should not replace the panel chrome");
  assert.equal(sandbox.viewSyncCount, 1, "Deciding should sync the archive view in place");

  clickListeners.click(restoreClick);
  await sandbox.lastAction;
  assert.equal(restoreClick.prevented, true);
  assert.equal(restoreClick.stopped, true);
  assert.equal(sandbox.panelState.items[0].archivedAt, undefined);
  assert.equal(sandbox.panelState.items[0].decision, undefined);
  assert.equal(sandbox.lastMotionKind, "view", "Restoring should return to active list with view motion");
  assert.equal(sandbox.renderCount, 0, "Restoring should not replace the panel chrome");
  assert.equal(sandbox.viewSyncCount, 2, "Restoring should sync the active view in place");
  console.log("panel archive smoke passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
