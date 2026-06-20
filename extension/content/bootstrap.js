function initializeStashContent() {
  if (window.__stashContentVersion === CONTENT_VERSION) {
    return;
  }

  window.__stashContentVersion = CONTENT_VERSION;
  window.__stashContentLoaded = true;

  removeStaleExtensionRoots();
  
  document.addEventListener(
    "contextmenu",
    (event) => {
      lastContextTarget = event.target;
      lastContextPoint = { x: event.clientX, y: event.clientY };
    },
    true
  );
  
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (hasContentVersionMismatch(message)) {
      return false;
    }

    if (isStashPingMessage(message)) {
      sendResponse({ ok: true, version: CONTENT_VERSION });
      return false;
    }
  
    if (isStashToggleMessage(message)) {
      toggleStashPanel()
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }
  
    if (!isStashSaveMessage(message)) {
      return false;
    }
  
    saveCurrentProduct(message)
      .then((result) => sendResponse(result))
      .catch((error) => {
        showErrorOverlay(error);
        sendResponse({ ok: false, error: error.message });
      });
  
    return true;
  });
  
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !panelState.open) {
      return;
    }
  
    let requiresFullRender = false;
    let settingsChanged = false;
    let viewModeChanged = false;
    let summaryAnimationFrom = "";
  
    if (changes[STORAGE_KEY]) {
      const nextItems = Array.isArray(changes[STORAGE_KEY].newValue)
        ? changes[STORAGE_KEY].newValue
        : [];
      if (panelItemsTotalSignature(panelState.items) !== panelItemsTotalSignature(nextItems)) {
        summaryAnimationFrom = panelSummaryTextForItems(panelState.items);
        requiresFullRender = true;
      }
      panelState.items = nextItems;
    }
  
    if (changes[CATEGORY_STORAGE_KEY]) {
      panelState.categories = normalizeCategories(changes[CATEGORY_STORAGE_KEY].newValue);
      if (
        panelState.activeCategory !== "all" &&
        !hasCategory(panelState.categories, panelState.activeCategory)
      ) {
        panelState.activeCategory = "all";
      }
      requiresFullRender = true;
    }
  
    if (changes[SETTINGS_STORAGE_KEY]) {
      const settings = normalizePanelSettings(changes[SETTINGS_STORAGE_KEY].newValue);
      viewModeChanged = panelState.compactView !== settings.compactView;
      panelState.summaryCurrency = settings.summaryCurrency;
      panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
      panelState.backgroundTheme = settings.backgroundTheme;
      panelState.compactView = settings.compactView;
      settingsChanged = true;
    }

    if (!requiresFullRender && !settingsChanged) {
      return;
    }
  
    if (settingsChanged && !requiresFullRender) {
      syncPanelSettingsControls();
      if (viewModeChanged) {
        syncPanelViewMode();
      }
      renderPanelSummaryOnly();
      refreshPanelSummaryRate();
      return;
    }
  
    renderStashPanel({ summaryAnimationFrom });
  });
}

initializeStashContent();

function hasContentVersionMismatch(message) {
  return Boolean(message?.contentVersion && message.contentVersion !== CONTENT_VERSION);
}

function isStashPingMessage(message) {
  return message?.type === "STASH_PING" || message?.type === "STASH_PING_V2";
}

function isStashToggleMessage(message) {
  return message?.type === "STASH_TOGGLE_PANEL" || message?.type === "STASH_TOGGLE_PANEL_V2";
}

function isStashSaveMessage(message) {
  return message?.type === "STASH_SAVE" || message?.type === "STASH_SAVE_V2";
}
