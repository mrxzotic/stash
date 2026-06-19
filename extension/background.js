const MENU_ROOT_ID = "stash-save-root";
const PAGE_PATTERNS = ["http://*/*", "https://*/*"];
const CONTEXTS = ["page", "image", "link", "selection"];
const CONTENT_SCRIPT_FILES = [
  "content/constants.js",
  "content/lifecycle.js",
  "content/panel/render.js",
  "content/panel/events.js",
  "content/panel/items.js",
  "content/icons.js",
  "content/extractors/main.js",
  "content/extractors/jsonld.js",
  "content/extractors/dom.js",
  "content/extractors/embedded.js",
  "content/extractors/enrich.js",
  "content/extractors/context.js",
  "content/storage.js",
  "content/overlays.js",
  "content/styles/panel-1.js",
  "content/styles/panel-2.js",
  "content/styles/panel-3.js",
  "content/styles/panel-4.js",
  "content/styles/panel-5.js",
  "content/styles/panel.js",
  "content/styles/overlay.js",
  "content/pricing/dom.js",
  "content/storage-settings.js",
  "content/pricing/parse.js",
  "content/pricing/rates.js",
  "content/media.js",
  "content/text.js",
  "content/utils.js",
  "content/bootstrap.js"
];

chrome.runtime.onInstalled.addListener(() => {
  void rebuildContextMenus();
  void cleanupOpenTabs();
});

chrome.runtime.onStartup.addListener(() => {
  void rebuildContextMenus();
  void cleanupOpenTabs();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  void handleSaveClick(info, tab);
});

chrome.action.onClicked.addListener((tab) => {
  void handleActionClick(tab);
});

async function rebuildContextMenus() {
  await contextMenusRemoveAll();
  await contextMenusCreate({
    id: MENU_ROOT_ID,
    title: "Save to Stash",
    contexts: CONTEXTS,
    documentUrlPatterns: PAGE_PATTERNS
  });
}

function contextMenusRemoveAll() {
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      void chrome.runtime.lastError;
      resolve();
    });
  });
}

function contextMenusCreate(options) {
  return new Promise((resolve) => {
    chrome.contextMenus.create(options, () => {
      const error = chrome.runtime.lastError;
      if (error && /duplicate id/i.test(error.message || "")) {
        chrome.contextMenus.remove(options.id, () => {
          void chrome.runtime.lastError;
          chrome.contextMenus.create(options, () => {
            void chrome.runtime.lastError;
            resolve();
          });
        });
        return;
      }

      void error;
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
      type: "STASH_TOGGLE_PANEL"
    });
  } catch (error) {
    console.warn("Stash could not open on this page", error);
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
      type: "STASH_SAVE",
      category: "auto",
      context: {
        pageUrl: info.pageUrl,
        linkUrl: info.linkUrl,
        srcUrl: info.srcUrl,
        selectionText: info.selectionText
      }
    });
  } catch (error) {
    console.warn("Stash could not save this page", error);
  }
}

function isSupportedUrl(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "STASH_PING" });
    return true;
  } catch {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: CONTENT_SCRIPT_FILES
      });
      return true;
    } catch (error) {
      console.warn("Stash could not inject content script", error);
      return false;
    }
  }
}

async function cleanupOpenTabs() {
  try {
    const tabs = await chrome.tabs.query({ url: PAGE_PATTERNS });
    await Promise.allSettled(
      tabs
        .filter((tab) => tab.id)
        .map((tab) =>
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: cleanupStashDom
          })
        )
    );
  } catch (error) {
    console.warn("Stash could not clean open tabs", error);
  }
}

function cleanupStashDom() {
  document.getElementById("stash-panel-root")?.remove();
  document.getElementById("stash-extension-root")?.remove();
  delete window.__stashContentVersion;
  delete window.__stashContentLoaded;
}
