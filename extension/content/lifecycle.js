async function saveCurrentProduct(message) {
  const product = await enrichProduct(extractProduct(message.context || {}));
  const [categories, settings] = await Promise.all([getCategories(), getPanelSettings()]);
  panelState.summaryCurrency = settings.summaryCurrency;
  panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
  panelState.backgroundTheme = settings.backgroundTheme;
  panelState.compactView = settings.compactView;
  panelState.language = settings.language;
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

async function toggleTuckioPanel() {
  if (panelState.open) {
    closeTuckioPanel();
    return { ok: true, open: false };
  }

  await openTuckioPanel();
  return { ok: true, open: true };
}

async function openTuckioPanel() {
  await loadPanelData();
  panelState.open = true;
  panelState.hasRenderedPanel = false;
  renderTuckioPanel();
}

function closeTuckioPanel() {
  const host = document.getElementById("tuckio-panel-root");
  if (typeof unbindPanelDismissEvents === "function") {
    unbindPanelDismissEvents(host?.shadowRoot);
  }
  if (host) {
    host.remove();
  }
  panelState.open = false;
  panelState.settingsOpen = false;
  panelState.categoryComposerOpen = false;
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  panelState.editItemId = "";
  panelState.founderPromoOpen = false;
  panelState.archivedOpen = false;
  panelState.brandCloudOpen = false;
  panelState.brandFilterKey = "";
  panelState.brandFilterLabel = "";
  panelState.hasRenderedPanel = false;
  panelState.highlightedItemId = "";
  panelState.displacedItemId = "";
  window.clearTimeout(panelState.highlightTimer);
}

function showSavedItemInPanel(item, items, categories, options = {}) {
  clearSavedOverlay();
  const previousActiveCategory = panelState.activeCategory;
  const previousSearchQuery = panelState.searchQuery;
  panelState.items = items;
  panelState.categories = categories;
  panelState.highlightedItemId = item.id;
  panelState.archivedOpen = false;

  if (panelState.activeCategory !== "all" && panelState.activeCategory !== item.category) {
    panelState.activeCategory = item.category;
  }

  if (panelState.searchQuery && !panelItemMatchesSearch(normalizePanelItem(item))) {
    panelState.searchQuery = "";
    panelState.searchOpen = false;
  }

  const listContextChanged =
    previousActiveCategory !== panelState.activeCategory ||
    previousSearchQuery !== panelState.searchQuery;
  panelState.displacedItemId = listContextChanged ? "" : panelSavedItemDisplacedId(item);
  renderTuckioPanel({ summaryAnimationFrom: options.summaryAnimationFrom });
  window.clearTimeout(panelState.highlightTimer);
  panelState.highlightTimer = window.setTimeout(() => {
    if (!panelState.open || panelState.highlightedItemId !== item.id) {
      return;
    }
    panelState.highlightedItemId = "";
    panelState.displacedItemId = "";
    renderTuckioPanel();
  }, 1400);
}

function panelSavedItemDisplacedId(item) {
  if (panelState.compactView || panelState.archivedOpen || (panelState.brandCloudOpen && !panelState.brandFilterKey)) {
    return "";
  }

  const savedId = normalizePanelItem(item).id;
  const visibleItems = panelSortedItems(
    panelScopedItems(panelState.items)
      .filter(
        (savedItem) =>
          panelState.activeCategory === "all" ||
          savedItem.category === panelState.activeCategory
      )
      .filter(panelItemMatchesSearch)
      .filter(panelItemMatchesBrandFilter)
  ).map(normalizePanelItem);

  if (visibleItems[0]?.id !== savedId) {
    return "";
  }

  return visibleItems[1]?.id || "";
}

function clearSavedOverlay() {
  const host = document.getElementById("tuckio-extension-root");
  if (host?.shadowRoot) {
    if (typeof clearOverlayTimers === "function") {
      clearOverlayTimers(host.shadowRoot);
    } else {
      window.clearTimeout(host.shadowRoot.__tuckioTimer);
    }
    host.shadowRoot.innerHTML = "";
  }
}

function removeStaleExtensionRoots() {
  document.getElementById("tuckio-panel-root")?.remove();
  document.getElementById("tuckio-extension-root")?.remove();
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
  panelState.language = settings.language;
}
