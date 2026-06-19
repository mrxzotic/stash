const MENU_ROOT_ID = "wishlisted-save-root";
const PAGE_PATTERNS = ["http://*/*", "https://*/*"];
const CONTEXTS = ["page", "image", "link", "selection"];

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
    title: "Save to Wishlisted",
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
      type: "WISHLISTED_TOGGLE_PANEL"
    });
  } catch (error) {
    console.warn("Wishlisted could not open on this page", error);
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
      type: "WISHLISTED_SAVE",
      category: "auto",
      context: {
        pageUrl: info.pageUrl,
        linkUrl: info.linkUrl,
        srcUrl: info.srcUrl,
        selectionText: info.selectionText
      }
    });
  } catch (error) {
    console.warn("Wishlisted could not save this page", error);
  }
}

function isSupportedUrl(url) {
  return /^https?:\/\//i.test(String(url || ""));
}

async function ensureContentScript(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "WISHLISTED_PING" });
    return true;
  } catch {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["content.js"]
      });
      return true;
    } catch (error) {
      console.warn("Wishlisted could not inject content script", error);
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
            func: cleanupWishlistedDom
          })
        )
    );
  } catch (error) {
    console.warn("Wishlisted could not clean open tabs", error);
  }
}

function cleanupWishlistedDom() {
  document.getElementById("wishlisted-panel-root")?.remove();
  document.getElementById("wishlisted-extension-root")?.remove();
  delete window.__wishlistedContentVersion;
  delete window.__wishlistedContentLoaded;
}
