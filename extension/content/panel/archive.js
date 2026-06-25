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
  root.querySelector(".wp-filters")?.addEventListener("click", (event) => {
    const shortlistToggle = event.target.closest("[data-shortlist-toggle]");
    if (shortlistToggle) {
      event.preventDefault();
      event.stopPropagation();
      togglePanelShortlistView();
      return;
    }

    handlePanelArchiveViewToggle(event);
  });

  const items = root.querySelector(".wp-items");
  items?.addEventListener("click", (event) => {
    if (handlePanelArchiveViewToggle(event)) {
      return;
    }

    const shortlistButton = event.target.closest("[data-shortlist-id]");
    if (shortlistButton) {
      event.preventDefault();
      event.stopPropagation();
      if (event.detail > 0) {
        shortlistButton.blur();
      }
      safelyRunPanelAction(() => togglePanelShortlistItem(shortlistButton.dataset.shortlistId));
      return;
    }

    const decisionButton = event.target.closest("[data-decision-menu-id]");
    if (decisionButton) {
      event.preventDefault();
      event.stopPropagation();
      rememberPanelFocus(decisionButton);
      togglePanelDecisionTray(decisionButton.dataset.decisionMenuId);
      if (event.detail > 0) {
        decisionButton.blur();
      }
      return;
    }

    const decisionAction = event.target.closest("[data-panel-decision]");
    if (decisionAction) {
      event.preventDefault();
      event.stopPropagation();
      safelyRunPanelAction(() =>
        applyPanelDecision(decisionAction.dataset.decisionId, decisionAction.dataset.panelDecision)
      );
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
  items?.addEventListener("dragstart", (event) => startPanelDecisionDrag(root, event));
  root.querySelector("[data-decision-drop-tray]")?.addEventListener("dragover", (event) => {
    if (!event.target.closest("[data-decision-drop-action]")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  });
  root.querySelector("[data-decision-drop-tray]")?.addEventListener("click", (event) => {
    const target = event.target.closest("[data-decision-drop-action]");
    if (!target) {
      closePanelDecisionTray();
      syncPanelDecisionMode(root);
      return;
    }
    const id = panelDecisionTargetId();
    if (!id) return;
    event.preventDefault();
    event.stopPropagation();
    safelyRunPanelAction(() => applyPanelDecision(id, target.dataset.decisionDropAction));
  });
  root.querySelector("[data-decision-drop-tray]")?.addEventListener("drop", (event) => {
    const target = event.target.closest("[data-decision-drop-action]");
    if (!target) return;
    event.preventDefault();
    safelyRunPanelAction(() => applyPanelDecision(panelDecisionTargetId(), target.dataset.decisionDropAction));
  });
  root.querySelector("[data-decision-cancel]")?.addEventListener("click", () => {
    closePanelDecisionTray();
    syncPanelDecisionMode(root);
  });
  items?.addEventListener("dragend", () => endPanelDecisionDrag(root));
}

function togglePanelShortlistView() {
  panelState.shortlistOpen = !panelState.shortlistOpen;
  panelState.sortMenuOpen = false;
  panelState.filterMenuOpen = false;
  panelState.categoryComposerOpen = false;
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  panelState.decisionItemId = "";
  panelState.brandCloudOpen = false;
  panelState.brandCloudSortList = false;
  closePanelArchivedView();
  syncPanelViewStateWithMotion();
}

function togglePanelArchivedView() {
  const willOpen = !panelState.archivedOpen;
  panelState.archivedOpen = willOpen;
  panelState.shortlistOpen = false;
  panelState.brandCloudOpen = false;
  panelState.brandCloudSortList = false;
  panelState.brandFilterKey = "";
  panelState.brandFilterLabel = "";
  panelState.searchOpen = false;
  panelState.searchQuery = "";
  panelState.filterMenuOpen = false;
  panelState.sortMenuOpen = false;
  panelState.categoryComposerOpen = false;
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  panelState.editItemId = "";
  closePanelDecisionTray();
  syncPanelViewStateWithMotion();
}

async function archivePanelItem(id) {
  return decidePanelItem(id, PANEL_DECISION_SKIPPED);
}

async function togglePanelShortlistItem(id) {
  const updatedAt = new Date().toISOString();
  const wasShortlistOpen = panelState.shortlistOpen;
  let changed = false;
  let active = false;
  const nextItems = panelState.items.map((item) => {
    const normalized = normalizePanelItem(item);
    if (normalized.id !== id) {
      return item;
    }

    changed = true;
    if (panelItemIsShortlisted(item)) {
      active = false;
      return { ...withoutPanelShortlistFacts(item), id: normalized.id, updatedAt };
    }

    active = true;
    return { ...item, id: normalized.id, shortlistedAt: updatedAt, updatedAt };
  });

  if (!changed) return;
  panelState.items = nextItems;
  if (!panelShortlistCount(nextItems)) panelState.shortlistOpen = false;
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
  if (wasShortlistOpen) {
    syncPanelShortlistViewAfterToggle();
    return;
  }
  syncPanelShortlistToggle(id, active);
}

function withoutPanelShortlistFacts(item) {
  const { shortlistedAt, userFacts, ...nextItem } = item;
  if (!userFacts || typeof userFacts !== "object" || userFacts.priority !== "shortlist") {
    return userFacts ? { ...nextItem, userFacts } : nextItem;
  }

  const nextFacts = { ...userFacts };
  delete nextFacts.priority;
  return Object.keys(nextFacts).length ? { ...nextItem, userFacts: nextFacts } : nextItem;
}

async function applyPanelDecision(id, action) {
  const state = panelDecisionState(action);
  closePanelDecisionTray();
  if (!id) return;

  if (action === PANEL_DECISION_DELETE) {
    panelState.deleteItemId = id;
    renderTuckioPanel();
    return;
  }

  if (state) {
    await decidePanelItem(id, state);
  }
}

async function decidePanelItem(id, state) {
  const decidedAt = new Date().toISOString();
  let changed = false;
  const nextItems = panelState.items.map((item) => {
    const normalized = normalizePanelItem(item);
    if (normalized.id !== id || isPanelItemArchived(normalized)) {
      return item;
    }

    changed = true;
    return {
      ...item,
      id: normalized.id,
      archivedAt: decidedAt,
      updatedAt: decidedAt,
      decision: { state, decidedAt }
    };
  });

  if (!changed) return;

  panelState.items = nextItems;
  closePanelDecisionTray();
  openPanelArchivedDecisionList();
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
  syncPanelViewStateWithMotion({ animateSummary: true });
}

async function restorePanelItem(id) {
  const restoredAt = new Date().toISOString();
  let changed = false;
  const nextItems = panelState.items.map((item) => {
    const normalized = normalizePanelItem(item);
    if (normalized.id !== id || !isPanelItemArchived(normalized)) {
      return item;
    }

    const { archivedAt, decision, decisionState, ...restoredItem } = item;
    changed = true;
    return { ...restoredItem, id: normalized.id, updatedAt: restoredAt };
  });

  if (!changed) return;

  panelState.items = nextItems;
  closePanelDecisionTray();
  closePanelArchivedView();
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
  syncPanelViewStateWithMotion({ animateSummary: true });
}

function startPanelDecisionDrag(root, event) {
  if (event.target.closest?.("button, input, select, textarea")) {
    event.preventDefault();
    return;
  }

  const item = event.target.closest?.("[data-decision-draggable-id]");
  const id = item?.dataset?.decisionDraggableId || "";
  if (!id) return;

  panelState.decisionItemId = "";
  panelState.decisionDragItemId = id;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", id);
  const rect = item.getBoundingClientRect?.();
  if (rect && event.dataTransfer.setDragImage) {
    event.dataTransfer.setDragImage(item, Math.max(0, event.clientX - rect.left), Math.max(0, event.clientY - rect.top));
  }
  item.classList.add("is-decision-drag-source");
  root.querySelector(".wp-shell")?.classList.add("is-decision-dragging");
}

function endPanelDecisionDrag(root) {
  panelState.decisionDragItemId = "";
  root.querySelector(".wp-shell")?.classList.remove("is-decision-dragging");
  root.querySelectorAll(".is-decision-drag-source").forEach((item) => {
    item.classList.remove("is-decision-drag-source");
  });
}

function handlePanelArchiveViewToggle(event) {
  const archiveToggle = event.target.closest("[data-archive-view-toggle]");
  if (!archiveToggle) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  togglePanelArchivedView();
  return true;
}
