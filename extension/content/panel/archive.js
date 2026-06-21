function isPanelItemArchived(item) {
  return Boolean(item?.archivedAt);
}

function panelActiveItems(items = panelState.items) {
  return (Array.isArray(items) ? items : [])
    .map(normalizePanelItem)
    .filter((item) => !isPanelItemArchived(item));
}

function panelArchivedItems(items = panelState.items) {
  return (Array.isArray(items) ? items : [])
    .map(normalizePanelItem)
    .filter(isPanelItemArchived);
}

function panelScopedItems(items = panelState.items) {
  return panelState.archivedOpen
    ? panelArchivedItems(items)
    : panelActiveItems(items);
}

function panelSummaryItems(items = panelState.items) {
  return panelScopedItems(items);
}

function panelArchivedCount(items = panelState.items) {
  return panelArchivedItems(items).length;
}

function closePanelArchivedView() {
  panelState.archivedOpen = false;
}

function syncPanelArchiveAvailability() {
  if (panelState.archivedOpen && panelArchivedCount(panelState.items) === 0) {
    panelState.archivedOpen = false;
  }
}

function bindPanelArchiveEvents(root) {
  root.querySelector("[data-archive-view-toggle]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    togglePanelArchivedView();
  });

  root.querySelector(".wp-items")?.addEventListener("click", (event) => {
    const archiveButton = event.target.closest("[data-archive-id]");
    if (archiveButton) {
      event.preventDefault();
      event.stopPropagation();
      safelyRunPanelAction(() => archivePanelItem(archiveButton.dataset.archiveId));
      return;
    }

    const restoreButton = event.target.closest("[data-restore-id]");
    if (!restoreButton) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    safelyRunPanelAction(() => restorePanelItem(restoreButton.dataset.restoreId));
  });
}

function togglePanelArchivedView() {
  const willOpen = !panelState.archivedOpen;
  panelState.archivedOpen = willOpen;
  panelState.brandCloudOpen = false;
  panelState.brandCloudSortList = false;
  panelState.brandFilterKey = "";
  panelState.brandFilterLabel = "";
  panelState.searchOpen = false;
  panelState.searchQuery = "";
  panelState.activeCategory = "all";
  panelState.filterMenuOpen = false;
  panelState.sortMenuOpen = false;
  panelState.categoryComposerOpen = false;
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  panelState.editItemId = "";
  renderStashPanel();
}

async function archivePanelItem(id) {
  const previousSummary = panelSummaryTextForItems(panelState.items);
  const archivedAt = new Date().toISOString();
  let changed = false;
  const nextItems = panelState.items.map((item) => {
    const normalized = normalizePanelItem(item);
    if (normalized.id !== id || isPanelItemArchived(normalized)) {
      return item;
    }

    changed = true;
    return { ...item, id: normalized.id, archivedAt, updatedAt: archivedAt };
  });

  if (!changed) {
    return;
  }

  panelState.items = nextItems;
  closePanelArchivedView();
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
  renderStashPanel({ summaryAnimationFrom: previousSummary });
}

async function restorePanelItem(id) {
  const previousSummary = panelSummaryTextForItems(panelState.items);
  const restoredAt = new Date().toISOString();
  let changed = false;
  const nextItems = panelState.items.map((item) => {
    const normalized = normalizePanelItem(item);
    if (normalized.id !== id || !isPanelItemArchived(normalized)) {
      return item;
    }

    const { archivedAt, ...restoredItem } = item;
    changed = true;
    return { ...restoredItem, id: normalized.id, updatedAt: restoredAt };
  });

  if (!changed) {
    return;
  }

  panelState.items = nextItems;
  closePanelArchivedView();
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
  renderStashPanel({ summaryAnimationFrom: previousSummary });
}
