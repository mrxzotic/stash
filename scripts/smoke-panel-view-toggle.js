const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const filterEventsSource = fs.readFileSync(
  path.join(root, "extension/content/panel/filter-events.js"),
  "utf8"
);

const sandbox = {
  panelState: {
    compactView: false,
    activeCategory: "tops",
    brandCloudOpen: true,
    brandCloudSortList: true,
    brandFilterKey: "Acme",
    brandFilterLabel: "Acme",
    shortlistOpen: true,
    archivedOpen: false,
    sortMenuOpen: true,
    filterMenuOpen: true,
    settingsOpen: true
  },
  closePanelCurrencySelect: () => {
    sandbox.closedCurrency = true;
  },
  closePanelLanguageMenu: () => {
    sandbox.closedLanguage = true;
  },
  closePanelFilterMenu: () => {
    sandbox.panelState.filterMenuOpen = false;
  },
  closePanelSortMenu: () => {
    sandbox.panelState.sortMenuOpen = false;
  },
  syncPanelOverflowMenu: () => {
    sandbox.syncedOverflow = true;
  },
  safelyRunPanelAction: (action) => {
    sandbox.lastAction = Promise.resolve().then(action);
  },
  savePanelSettings: async (nextSettings, options) => {
    sandbox.savedSettings = nextSettings;
    sandbox.savedOptions = options;
    sandbox.panelState.compactView = nextSettings.compactView;
  }
};

vm.createContext(sandbox);
vm.runInContext(filterEventsSource, sandbox, { filename: "content/panel/filter-events.js" });

const listeners = {};
const filterRow = {
  addEventListener: (eventName, listener) => {
    listeners[eventName] = listener;
  }
};
const rootNode = {
  querySelector: (selector) => (selector === ".wp-filters" ? filterRow : null)
};
const viewButton = {
  closest: (selector) => (selector === "[data-panel-view-toggle]" ? viewButton : null)
};

function viewToggleClick() {
  return {
    target: viewButton,
    preventDefault: () => {
      sandbox.prevented = true;
    },
    stopPropagation: () => {
      sandbox.stopped = true;
    },
    stopImmediatePropagation: () => {
      sandbox.stoppedImmediate = true;
    }
  };
}

function assertFiltersPreserved() {
  assert.equal(sandbox.panelState.activeCategory, "tops");
  assert.equal(sandbox.panelState.brandCloudOpen, true);
  assert.equal(sandbox.panelState.brandCloudSortList, true);
  assert.equal(sandbox.panelState.brandFilterKey, "Acme");
  assert.equal(sandbox.panelState.brandFilterLabel, "Acme");
  assert.equal(sandbox.panelState.shortlistOpen, true);
  assert.equal(sandbox.panelState.archivedOpen, false);
}

async function run() {
  sandbox.rootNode = rootNode;
  vm.runInContext("bindPanelFilterEvents(rootNode)", sandbox);
  listeners.click(viewToggleClick());
  await sandbox.lastAction;
  assert.equal(sandbox.prevented, true);
  assert.equal(sandbox.stopped, true);
  assert.equal(sandbox.stoppedImmediate, true);
  assert.equal(sandbox.panelState.compactView, true);
  assert.equal(sandbox.savedSettings.compactView, true);
  assert.equal(sandbox.savedOptions.rerender, false);
  assert.equal(sandbox.savedOptions.syncViewMode, true);
  assert.equal(sandbox.savedOptions.syncSummary, false);
  assert.equal(sandbox.panelState.sortMenuOpen, false);
  assert.equal(sandbox.panelState.filterMenuOpen, false);
  assert.equal(sandbox.panelState.settingsOpen, false);
  assert.equal(sandbox.closedCurrency, true);
  assert.equal(sandbox.closedLanguage, true);
  assert.equal(sandbox.syncedOverflow, true);
  assertFiltersPreserved();

  sandbox.prevented = false;
  sandbox.stopped = false;
  sandbox.stoppedImmediate = false;
  listeners.click(viewToggleClick());
  await sandbox.lastAction;
  assert.equal(sandbox.panelState.compactView, false);
  assert.equal(sandbox.savedSettings.compactView, false);
  assertFiltersPreserved();

  console.log("panel view toggle smoke passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
