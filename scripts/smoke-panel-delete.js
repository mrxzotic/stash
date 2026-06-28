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
  closePanelArchivedView: () => {
    sandbox.panelState.archivedOpen = false;
  },
  panelShortlistCount: (items) => items.filter((item) => item.shortlistedAt || item.userFacts?.priority === "shortlist").length,
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
      { id: "favorite", title: "Favorite", url: "https://example.com/favorite", shortlistedAt: "2026-06-24T00:00:00.000Z" },
      { id: "active", title: "Active", url: "https://example.com/active" }
    ];
    Object.assign(sandbox.panelState, {
      shortlistOpen: true,
      activeCategory: "shoes",
      brandCloudOpen: true,
      brandCloudSortList: true,
      brandFilterKey: "brand",
      brandFilterLabel: "Brand",
      searchOpen: true,
      searchQuery: "favorite",
      filterMenuOpen: true,
      sortMenuOpen: true,
      categoryComposerOpen: true,
      archivedOpen: false
    });
    sandbox.renderCount = 0;
    return vm.runInContext("removePanelItem('favorite')", sandbox);
  })
  .then(() => {
    assert.deepEqual(sandbox.panelState.items.map((item) => item.id), ["active"]);
    assert.equal(sandbox.panelState.shortlistOpen, false, "Deleting the last favorite should return to the home scope");
    assert.equal(sandbox.panelState.activeCategory, "all", "Deleting the last favorite should clear category scope");
    assert.equal(sandbox.panelState.brandCloudOpen, false, "Deleting the last favorite should close brand cloud scope");
    assert.equal(sandbox.panelState.brandFilterKey, "", "Deleting the last favorite should clear brand filter scope");
    assert.equal(sandbox.panelState.searchOpen, false, "Deleting the last favorite should close search scope");
    assert.equal(sandbox.panelState.searchQuery, "", "Deleting the last favorite should clear search query");
    assert.equal(sandbox.panelState.filterMenuOpen, false, "Deleting the last favorite should close filter menu");
    assert.equal(sandbox.panelState.sortMenuOpen, false, "Deleting the last favorite should close sort menu");
    assert.equal(sandbox.panelState.categoryComposerOpen, false, "Deleting the last favorite should close category composer");
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
