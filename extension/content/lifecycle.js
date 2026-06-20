async function saveCurrentProduct(message) {
  const product = await enrichProduct(extractProduct(message.context || {}));
  const [categories, settings] = await Promise.all([getCategories(), getPanelSettings()]);
  panelState.summaryCurrency = settings.summaryCurrency;
  panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
  panelState.backgroundTheme = settings.backgroundTheme;
  panelState.compactView = settings.compactView;
  const category =
    message.category && message.category !== "auto" && hasCategory(categories, message.category)
      ? message.category
      : inferCategory(product, categories);
  const summaryAnimationFrom = panelState.open ? panelSummaryTextForItems(panelState.items) : "";
  const item = await normalizeItem(product, category, categories);
  const items = await upsertItem(item);

  if (panelState.open) {
    showSavedItemInPanel(item, items, categories, { summaryAnimationFrom });
  } else {
    showSavedOverlay(item, items, categories);
  }
  return { ok: true, item };
}

async function toggleStashPanel() {
  if (panelState.open) {
    closeStashPanel();
    return { ok: true, open: false };
  }

  await openStashPanel();
  return { ok: true, open: true };
}

async function openStashPanel() {
  await loadPanelData();
  panelState.open = true;
  panelState.hasRenderedPanel = false;
  renderStashPanel();
}

function closeStashPanel() {
  const host = document.getElementById("stash-panel-root");
  if (host) {
    host.remove();
  }
  panelState.open = false;
  panelState.settingsOpen = false;
  panelState.categoryComposerOpen = false;
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  panelState.brandCloudOpen = false;
  panelState.brandFilterKey = "";
  panelState.brandFilterLabel = "";
  panelState.hasRenderedPanel = false;
  panelState.highlightedItemId = "";
  window.clearTimeout(panelState.highlightTimer);
}

function showSavedItemInPanel(item, items, categories, options = {}) {
  clearSavedOverlay();
  panelState.items = items;
  panelState.categories = categories;
  panelState.highlightedItemId = item.id;

  if (panelState.activeCategory !== "all" && panelState.activeCategory !== item.category) {
    panelState.activeCategory = item.category;
  }

  if (panelState.searchQuery && !panelItemMatchesSearch(normalizePanelItem(item))) {
    panelState.searchQuery = "";
    panelState.searchOpen = false;
  }

  renderStashPanel({ summaryAnimationFrom: options.summaryAnimationFrom });
  window.clearTimeout(panelState.highlightTimer);
  panelState.highlightTimer = window.setTimeout(() => {
    if (!panelState.open || panelState.highlightedItemId !== item.id) {
      return;
    }
    panelState.highlightedItemId = "";
    renderStashPanel();
  }, 1400);
}

function clearSavedOverlay() {
  const host = document.getElementById("stash-extension-root");
  if (host?.shadowRoot) {
    if (typeof clearOverlayTimers === "function") {
      clearOverlayTimers(host.shadowRoot);
    } else {
      window.clearTimeout(host.shadowRoot.__stashTimer);
    }
    host.shadowRoot.innerHTML = "";
  }
}

function removeStaleExtensionRoots() {
  document.getElementById("stash-panel-root")?.remove();
  document.getElementById("stash-extension-root")?.remove();
}

async function loadPanelData() {
  const stored = await getLocalStorageValue([
    STORAGE_KEY,
    CATEGORY_STORAGE_KEY,
    SETTINGS_STORAGE_KEY
  ]);
  panelState.items = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
  panelState.categories = normalizeCategories(stored[CATEGORY_STORAGE_KEY]);
  const settings = normalizePanelSettings(stored[SETTINGS_STORAGE_KEY]);
  panelState.summaryCurrency = settings.summaryCurrency;
  panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
  panelState.backgroundTheme = settings.backgroundTheme;
  panelState.compactView = settings.compactView;
}
