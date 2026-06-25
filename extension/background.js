const MENU_ROOT_ID = "tuckio-save-root";
const PAGE_PATTERNS = ["http://*/*", "https://*/*"];
const CONTEXTS = ["page", "image", "link", "selection"];
const COMMAND_SAVE_CURRENT = "save-to-tuckio";
const COMMAND_TOGGLE_PANEL = "toggle-tuckio";
const CONTENT_SCRIPT_VERSION = "2026-06-25-p448-price-check-v118";
const MESSAGE_PING = "TUCKIO_PING_V2";
const MESSAGE_SAVE = "TUCKIO_SAVE_V2";
const MESSAGE_TOGGLE_PANEL = "TUCKIO_TOGGLE_PANEL_V2";
const CONTENT_SCRIPT_FILES = [
  "content/constants.js",
  "content/lifecycle.js",
  "content/panel/decisions.js",
  "content/panel/archive.js",
  "content/panel/shortlist-sync.js",
  "content/panel/filter-controls.js",
  "content/panel/sort.js",
  "content/panel/promo.js",
  "content/panel/compact-view.js",
  "content/panel/focus.js",
  "content/panel/dismiss.js",
  "content/panel/images.js",
  "content/panel/save-current.js",
  "content/panel/empty.js",
  "content/panel/motion.js",
  "content/panel/filters.js",
  "content/panel/filter-rail.js",
  "content/panel/preferences.js",
  "content/panel/render.js",
  "content/panel/reorder.js",
  "content/panel/search.js",
  "content/panel/filter-events.js",
  "content/panel/categories.js",
  "content/panel/hints.js",
  "content/panel/events.js",
  "content/panel/items.js",
  "content/panel/rate-sync.js",
  "content/panel/prices.js",
  "content/panel/edit.js",
  "content/panel/price-check-results.js",
  "content/panel/price-checker.js",
  "content/panel/export.js",
  "content/panel/export-xlsx.js",
  "content/panel/reset.js",
  "content/icons.js",
  "content/source-icons.js",
  "content/extractors/product-url.js",
  "content/extractors/main.js",
  "content/extractors/jsonld.js",
  "content/extractors/dom.js",
  "content/extractors/pye.js",
  "content/extractors/embedded.js",
  "content/extractors/rendezvous.js",
  "content/extractors/verify.js",
  "content/extractors/quality.js",
  "content/extractors/enrich.js",
  "content/extractors/anchors.js",
  "content/extractors/context.js",
  "content/storage-price-check.js",
  "content/storage-echo.js",
  "content/storage.js",
  "content/storage-quota.js",
  "content/overlay-fields.js",
  "content/overlay-images.js",
  "content/overlay-motion.js",
  "content/overlays.js",
  "content/styles/panel-1.js",
  "content/styles/panel-2.js",
  "content/styles/panel-overflow.js",
  "content/styles/panel-3.js",
  "content/styles/panel-4.js",
  "content/styles/panel-search.js",
  "content/styles/panel-dialog.js",
  "content/styles/panel-content.js",
  "content/styles/panel-images.js",
  "content/styles/panel-compact.js",
  "content/styles/panel-5.js",
  "content/styles/panel-layout-tail.js",
  "content/styles/panel-currency.js",
  "content/styles/panel-filter-menu.js",
  "content/styles/panel-filter-menu-popover.js",
  "content/styles/panel-sort.js",
  "content/styles/panel-save-current.js",
  "content/styles/panel-promo.js",
  "content/styles/panel-about.js",
  "content/styles/panel-release.js",
  "content/styles/panel-decision-ui.js",
  "content/styles/panel-decision-motion.js",
  "content/styles/panel-edit.js",
  "content/styles/panel-rebuild-motion.js",
  "content/styles/panel-save-motion.js",
  "content/styles/panel-interaction-motion.js",
  "content/styles/panel-price-checker.js",
  "content/styles/panel-hints.js",
  "content/styles/panel.js",
  "content/styles/overlay-fields.js",
  "content/styles/overlay-images.js",
  "content/styles/overlay-motion.js",
  "content/styles/overlay.js",
  "content/pricing/dom.js",
  "content/storage-settings.js",
  "content/pricing/noise.js",
  "content/pricing/parse.js",
  "content/pricing/rates.js",
  "content/media.js",
  "content/text.js",
  "content/utils.js",
  "content/i18n.js",
  "content/bootstrap.js"
];

void ensureContextMenu();

chrome.runtime.onInstalled.addListener(() => {
  void rebuildContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  void rebuildContextMenus();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  void handleSaveClick(info, tab);
});

chrome.action.onClicked.addListener((tab) => {
  void handleActionClick(tab);
});

chrome.commands.onCommand.addListener((command, tab) => {
  void handleKeyboardCommand(command, tab);
});

async function rebuildContextMenus() {
  await contextMenusRemoveAll();
  await ensureContextMenu();
}

async function ensureContextMenu() {
  await contextMenusCreate({
    id: MENU_ROOT_ID,
    title: "Save to Tuckio",
    contexts: CONTEXTS,
    documentUrlPatterns: PAGE_PATTERNS
  });
}

function contextMenusRemoveAll() {
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      const error = chrome.runtime.lastError;
      if (error) {
        console.warn("Tuckio could not clear context menus", error);
      }
      resolve();
    });
  });
}

function contextMenusCreate(options) {
  return new Promise((resolve) => {
    chrome.contextMenus.create(options, () => {
      const error = chrome.runtime.lastError;
      if (error && /duplicate id/i.test(error.message || "")) {
        resolve();
        return;
      }

      if (error) {
        console.warn("Tuckio could not create context menu", error);
      }
      resolve();
    });
  });
}

async function handleActionClick(tab) {
  if (!hasSupportedTabId(tab) || !isSupportedUrl(tab.url)) {
    return;
  }

  if (!(await ensureContentScript(tab.id))) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: MESSAGE_TOGGLE_PANEL,
      contentVersion: CONTENT_SCRIPT_VERSION
    });
  } catch (error) {
    console.warn("Tuckio could not open on this page", error);
  }
}

async function handleSaveClick(info, tab) {
  if (!hasSupportedTabId(tab) || info.menuItemId !== MENU_ROOT_ID) {
    return;
  }

  await saveTabToTuckio(tab, {
    pageUrl: info.pageUrl,
    linkUrl: info.linkUrl,
    srcUrl: info.srcUrl,
    selectionText: info.selectionText
  });
}

async function handleKeyboardCommand(command, tab) {
  if (command !== COMMAND_SAVE_CURRENT && command !== COMMAND_TOGGLE_PANEL) {
    return;
  }

  const activeTab = hasSupportedTabId(tab) ? tab : await getActiveTab();
  if (!hasSupportedTabId(activeTab) || !isSupportedUrl(activeTab.url)) {
    return;
  }

  if (command === COMMAND_TOGGLE_PANEL) {
    await handleActionClick(activeTab);
    return;
  }

  await saveTabToTuckio(activeTab, {
    pageUrl: activeTab.url
  });
}

async function saveTabToTuckio(tab, context) {
  if (!(await ensureContentScript(tab.id))) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: MESSAGE_SAVE,
      contentVersion: CONTENT_SCRIPT_VERSION,
      category: "auto",
      context
    });
  } catch (error) {
    console.warn("Tuckio could not save this page", error);
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  return tab || null;
}

function isSupportedUrl(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

function hasSupportedTabId(tab) {
  return Number.isInteger(tab?.id) && tab.id >= 0;
}

async function ensureContentScript(tabId) {
  const response = await pingContentScript(tabId);
  if (response?.version === CONTENT_SCRIPT_VERSION) {
    return true;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: CONTENT_SCRIPT_FILES
    });
    return (await pingContentScript(tabId))?.version === CONTENT_SCRIPT_VERSION;
  } catch (error) {
    console.warn("Tuckio could not inject content script", error);
    return false;
  }
}

async function pingContentScript(tabId) {
  try {
    return await chrome.tabs.sendMessage(tabId, {
      type: MESSAGE_PING,
      contentVersion: CONTENT_SCRIPT_VERSION
    });
  } catch {
    return null;
  }
}
