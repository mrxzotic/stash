const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const eventsSource = fs.readFileSync(
  path.join(root, "extension/content/panel/events.js"),
  "utf8"
);

const sandbox = {
  STORAGE_KEY: "tuckio.items.v1",
  panelState: {
    items: [
      { id: "active", title: "Active", url: "https://example.com/active" },
      { id: "archived", title: "Archived", url: "https://example.com/archived", archivedAt: "2026-06-23T00:00:00.000Z" }
    ],
    deleteItemId: "archived",
    archivedOpen: true
  },
  storedValue: null,
  renderCount: 0,
  normalizePanelItem: (item) => item,
  panelSummaryTextForItems: () => "$1",
  setLocalStorageValue: async (_key, value) => {
    sandbox.storedValue = value;
    return value;
  },
  syncPanelArchiveAvailability: () => {
    if (sandbox.panelState.archivedOpen && !sandbox.panelState.items.some((item) => item.archivedAt)) {
      sandbox.panelState.archivedOpen = false;
    }
  },
  renderTuckioPanel: () => {
    sandbox.renderCount += 1;
  },
  t: (value) => value
};

vm.createContext(sandbox);
vm.runInContext(eventsSource, sandbox, { filename: "content/panel/events.js" });

vm.runInContext("removePanelItem('archived')", sandbox)
  .then(() => {
    assert.deepEqual(sandbox.storedValue.map((item) => item.id), ["active"]);
    assert.deepEqual(sandbox.panelState.items.map((item) => item.id), ["active"]);
    assert.equal(sandbox.panelState.archivedOpen, false);
    assert.equal(sandbox.panelState.deleteItemId, "");
    assert.equal(sandbox.renderCount, 1);

    sandbox.panelState.items = [
      { id: "active", title: "Active", url: "https://example.com/active" },
      { id: "archived", title: "Archived", url: "https://example.com/archived", archivedAt: "2026-06-23T00:00:00.000Z" }
    ];
    sandbox.panelState.archivedOpen = true;
    sandbox.setLocalStorageValue = async () => {
      throw new Error("quota");
    };
    return vm.runInContext("removePanelItem('archived')", sandbox);
  })
  .then(() => {
    throw new Error("Expected delete storage failure");
  })
  .catch((error) => {
    if (error.message !== "quota") {
      throw error;
    }
    assert.equal(error.title, "Could not delete this item");
    assert.deepEqual(sandbox.panelState.items.map((item) => item.id), ["active", "archived"]);
    console.log("panel delete smoke passed");
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
