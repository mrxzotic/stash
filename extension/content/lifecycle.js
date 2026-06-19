async function saveCurrentProduct(message) {
  const product = await enrichProduct(extractProduct(message.context || {}));
  const [categories, settings] = await Promise.all([getCategories(), getPanelSettings()]);
  panelState.summaryCurrency = settings.summaryCurrency;
  panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
  panelState.backgroundTheme = settings.backgroundTheme;
  const category =
    message.category && message.category !== "auto" && hasCategory(categories, message.category)
      ? message.category
      : inferCategory(product, categories);
  const item = await normalizeItem(product, category, categories);
  const items = await upsertItem(item);

  if (panelState.open) {
    showSavedItemInPanel(item, items, categories);
  } else {
    showSavedOverlay(item, items, categories);
  }
  return { ok: true, item };
}

async function toggleWishlistPanel() {
  if (panelState.open) {
    closeWishlistPanel();
    return { ok: true, open: false };
  }

  await openWishlistPanel();
  return { ok: true, open: true };
}

async function openWishlistPanel() {
  await loadPanelData();
  panelState.open = true;
  panelState.hasRenderedPanel = false;
  renderWishlistPanel();
}

function closeWishlistPanel() {
  const host = document.getElementById("wishlisted-panel-root");
  if (host) {
    host.remove();
  }
  panelState.open = false;
  panelState.settingsOpen = false;
  panelState.hasRenderedPanel = false;
  panelState.highlightedItemId = "";
  window.clearTimeout(panelState.highlightTimer);
}

function showSavedItemInPanel(item, items, categories) {
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

  renderWishlistPanel();
  window.clearTimeout(panelState.highlightTimer);
  panelState.highlightTimer = window.setTimeout(() => {
    if (!panelState.open || panelState.highlightedItemId !== item.id) {
      return;
    }
    panelState.highlightedItemId = "";
    renderWishlistPanel();
  }, 1400);
}

function clearSavedOverlay() {
  const host = document.getElementById("wishlisted-extension-root");
  if (host?.shadowRoot) {
    window.clearTimeout(host.shadowRoot.__wishlistedTimer);
    host.shadowRoot.innerHTML = "";
  }
}

function removeStaleExtensionRoots() {
  document.getElementById("wishlisted-panel-root")?.remove();
  document.getElementById("wishlisted-extension-root")?.remove();
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
}
