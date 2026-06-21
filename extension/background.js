const MENU_ROOT_ID = "stash-save-root";
const PAGE_PATTERNS = ["http://*/*", "https://*/*"];
const CONTEXTS = ["page", "image", "link", "selection"];
const CONTENT_SCRIPT_VERSION = "2026-06-21-archive-hitbox-v1";
const MESSAGE_PING = "STASH_PING_V2";
const MESSAGE_SAVE = "STASH_SAVE_V2";
const MESSAGE_TOGGLE_PANEL = "STASH_TOGGLE_PANEL_V2";
const CONTENT_SCRIPT_FILES = [
  "content/constants.js",
  "content/lifecycle.js",
  "content/panel/archive.js",
  "content/panel/filter-controls.js",
  "content/panel/sort.js",
  "content/panel/promo.js",
  "content/panel/compact-view.js",
  "content/panel/focus.js",
  "content/panel/dismiss.js",
  "content/panel/images.js",
  "content/panel/save-current.js",
  "content/panel/empty.js",
  "content/panel/render.js",
  "content/panel/search.js",
  "content/panel/events.js",
  "content/panel/items.js",
  "content/panel/edit.js",
  "content/panel/export.js",
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
  "content/storage.js",
  "content/overlay-fields.js",
  "content/overlays.js",
  "content/styles/panel-1.js",
  "content/styles/panel-2.js",
  "content/styles/panel-3.js",
  "content/styles/panel-4.js",
  "content/styles/panel-content.js",
  "content/styles/panel-images.js",
  "content/styles/panel-compact.js",
  "content/styles/panel-5.js",
  "content/styles/panel-currency.js",
  "content/styles/panel-sort.js",
  "content/styles/panel-save-current.js",
  "content/styles/panel-promo.js",
  "content/styles/panel-release.js",
  "content/styles/panel.js",
  "content/styles/overlay-fields.js",
  "content/styles/overlay.js",
  "content/pricing/dom.js",
  "content/storage-settings.js",
  "content/pricing/noise.js",
  "content/pricing/parse.js",
  "content/pricing/rates.js",
  "content/media.js",
  "content/text.js",
  "content/utils.js",
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

async function rebuildContextMenus() {
  await contextMenusRemoveAll();
  await ensureContextMenu();
}

async function ensureContextMenu() {
  await contextMenusCreate({
    id: MENU_ROOT_ID,
    title: "Save to Stashed",
    contexts: CONTEXTS,
    documentUrlPatterns: PAGE_PATTERNS
  });
}

function contextMenusRemoveAll() {
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      const error = chrome.runtime.lastError;
      if (error) {
        console.warn("Stashed could not clear context menus", error);
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
        console.warn("Stashed could not create context menu", error);
      }
      resolve();
    });
  });
}

async function handleActionClick(tab) {
  if (!tab?.id || !isSupportedUrl(tab.url)) {
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
    console.warn("Stashed could not open on this page", error);
  }
}

async function handleSaveClick(info, tab) {
  if (!tab?.id || info.menuItemId !== MENU_ROOT_ID) {
    return;
  }

  if (!(await ensureContentScript(tab.id))) {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: MESSAGE_SAVE,
      contentVersion: CONTENT_SCRIPT_VERSION,
      category: "auto",
      context: {
        pageUrl: info.pageUrl,
        linkUrl: info.linkUrl,
        srcUrl: info.srcUrl,
        selectionText: info.selectionText
      }
    });
  } catch (error) {
    console.warn("Stashed could not save this page", error);
  }
}

function isSupportedUrl(url) {
  return /^https?:\/\//i.test(String(url || ""));
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
    console.warn("Stashed could not inject content script", error);
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
