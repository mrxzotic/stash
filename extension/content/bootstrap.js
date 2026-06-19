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
    if (message?.type === "STASH_PING") {
      sendResponse({ ok: true });
      return false;
    }
  
    if (message?.type === "STASH_TOGGLE_PANEL") {
      toggleStashPanel()
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }
  
    if (message?.type !== "STASH_SAVE") {
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
  
    if (changes[STORAGE_KEY]) {
      panelState.items = Array.isArray(changes[STORAGE_KEY].newValue)
        ? changes[STORAGE_KEY].newValue
        : [];
      requiresFullRender = true;
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
      panelState.summaryCurrency = settings.summaryCurrency;
      panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
      panelState.backgroundTheme = settings.backgroundTheme;
      settingsChanged = true;
    }
  
    if (settingsChanged && !requiresFullRender) {
      syncPanelSettingsControls();
      renderPanelSummaryOnly();
      refreshPanelSummaryRate();
      return;
    }
  
    renderStashPanel();
  });
}

initializeStashContent();
