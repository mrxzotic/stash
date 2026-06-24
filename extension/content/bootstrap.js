function initializeTuckioContent() {
  if (window.__tuckioContentVersion === CONTENT_VERSION) {
    return;
  }

  window.__tuckioContentVersion = CONTENT_VERSION;
  window.__tuckioContentLoaded = true;

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

    if (isTuckioPingMessage(message)) {
      sendResponse({ ok: true, version: CONTENT_VERSION });
      return false;
    }
  
    if (isTuckioToggleMessage(message)) {
      toggleTuckioPanel()
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }
  
    if (!isTuckioSaveMessage(message)) {
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
    let summaryCurrencyChanged = false;
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
      syncPanelArchiveAvailability();
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
      summaryCurrencyChanged = panelState.summaryCurrency !== settings.summaryCurrency;
      const languageChanged = panelState.language !== settings.language;
      panelState.summaryCurrency = settings.summaryCurrency;
      panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
      panelState.backgroundTheme = settings.backgroundTheme;
      panelState.compactView = settings.compactView;
      panelState.hoverHints = settings.hoverHints;
      panelState.language = settings.language;
      settingsChanged = true;
      requiresFullRender = requiresFullRender || languageChanged;
    }

    if (!requiresFullRender && !settingsChanged) {
      return;
    }
  
    if (settingsChanged && !requiresFullRender) {
      syncPanelSettingsControls();
      if (viewModeChanged) {
        syncPanelViewMode();
      }
      if (summaryCurrencyChanged) {
        renderPanelSummaryOnly();
        refreshPanelSummaryRate();
      }
      return;
    }
  
    renderTuckioPanel({ summaryAnimationFrom });
  });
}

initializeTuckioContent();

function hasContentVersionMismatch(message) {
  return Boolean(message?.contentVersion && message.contentVersion !== CONTENT_VERSION);
}

function isTuckioPingMessage(message) {
  return message?.type === "TUCKIO_PING" || message?.type === "TUCKIO_PING_V2";
}

function isTuckioToggleMessage(message) {
  return message?.type === "TUCKIO_TOGGLE_PANEL" || message?.type === "TUCKIO_TOGGLE_PANEL_V2";
}

function isTuckioSaveMessage(message) {
  return message?.type === "TUCKIO_SAVE" || message?.type === "TUCKIO_SAVE_V2";
}
