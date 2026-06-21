const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const backgroundSource = fs.readFileSync(
  path.join(root, "extension/background.js"),
  "utf8"
);
const constantsSource = fs.readFileSync(
  path.join(root, "extension/content/constants.js"),
  "utf8"
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "extension/manifest.json"), "utf8")
);
const contentVersion = constantsSource.match(/CONTENT_VERSION\s*=\s*"([^"]+)"/)?.[1];

assert.equal(manifest.permissions.includes("contextMenus"), true);
assert.equal(manifest.commands["save-to-stashed"].suggested_key.default, "Alt+Shift+S");
assert.equal(manifest.commands["toggle-stashed"].suggested_key.default, "Alt+Shift+O");
assert.equal(manifest.commands["save-to-stashed"].description, "Save current page to Stashed");
assert.equal(manifest.commands["toggle-stashed"].description, "Open or close Stashed");
assert.ok(contentVersion, "Content version should be declared");
assert.ok(
  backgroundSource.includes(`CONTENT_SCRIPT_VERSION = "${contentVersion}"`),
  "Context menu saves should use the current content script version"
);
assert.match(backgroundSource, /function hasSupportedTabId/, "Tab id 0 should not be rejected as falsy");
assert.doesNotMatch(backgroundSource, /!tab\?\.id/, "Tab id checks should allow valid id 0");
assert.match(backgroundSource, /chrome\.commands\.onCommand\.addListener/, "Keyboard commands should be handled by the service worker");
assert.match(backgroundSource, /COMMAND_SAVE_CURRENT = "save-to-stashed"/, "Save shortcut command id should match manifest");
assert.match(backgroundSource, /COMMAND_TOGGLE_PANEL = "toggle-stashed"/, "Toggle shortcut command id should match manifest");
assert.match(backgroundSource, /function handleKeyboardCommand/, "Keyboard commands should route through a bounded handler");
assert.match(backgroundSource, /pageUrl: activeTab\.url/, "Save shortcut should save the active page");
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
