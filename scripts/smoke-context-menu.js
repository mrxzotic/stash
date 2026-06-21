const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const backgroundSource = fs.readFileSync(
  path.join(root, "extension/background.js"),
  "utf8"
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "extension/manifest.json"), "utf8")
);

assert.equal(manifest.permissions.includes("contextMenus"), true);
assert.match(backgroundSource, /const MENU_ROOT_ID = "stash-save-root"/);
assert.match(backgroundSource, /title: "Save to Stashed"/);
assert.match(backgroundSource, /contexts: CONTEXTS/);
assert.match(backgroundSource, /documentUrlPatterns: PAGE_PATTERNS/);
assert.match(backgroundSource, /void ensureContextMenu\(\);/, "Context menu should be ensured when the service worker starts");
assert.match(backgroundSource, /chrome\.runtime\.onInstalled\.addListener\(\(\) => \{[\s\S]*?rebuildContextMenus/, "Install should rebuild context menus");
assert.match(backgroundSource, /chrome\.runtime\.onStartup\.addListener\(\(\) => \{[\s\S]*?rebuildContextMenus/, "Startup should rebuild context menus");
assert.match(backgroundSource, /duplicate id/i, "Duplicate menu creation should be harmless");
assert.match(backgroundSource, /Stashed could not create context menu/, "Unexpected menu creation failures should be logged");

console.log("context menu smoke passed");
