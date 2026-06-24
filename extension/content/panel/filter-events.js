function bindPanelFilterEvents(root) {
  root.querySelector(".wp-filters")?.addEventListener("click", (event) => {
    if (event.target.closest("[data-panel-sort-root]")) {
      return;
    }

    if (handlePanelViewToggle(event, root)) {
      return;
    }

    if (handlePanelFilterClear(event)) {
      return;
    }

    if (handlePanelFilterMenuTrigger(event, root)) {
      return;
    }

    if (handlePanelAddCategory(event)) {
      return;
    }

    if (handlePanelRemoveCategoryPrompt(event)) {
      return;
    }

    handlePanelCategorySelection(event);
  });
}

function handlePanelViewToggle(event, root) {
  const button = event.target.closest("[data-panel-view-toggle]");
  if (!button) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  const compactView = !panelState.compactView;
  closePanelCurrencySelect(root);
  closePanelLanguageMenu(root);
  closePanelFilterMenu(root);
  closePanelSortMenu(root);
  panelState.settingsOpen = false;
  syncPanelOverflowMenu(root);
  safelyRunPanelAction(() =>
    savePanelSettings(
      { compactView },
      { rerender: false, syncViewMode: true, syncSummary: false }
    )
  );
  return true;
}

function handlePanelFilterMenuTrigger(event, root) {
  const trigger = event.target.closest("[data-filter-menu-trigger]");
  if (!trigger) {
    return false;
  }

  event.preventDefault();
  closePanelSortMenu(root);
  panelState.filterMenuOpen = !panelState.filterMenuOpen;
  panelState.categoryComposerOpen = false;
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  panelState.decisionItemId = "";
  syncPanelFilterMenu(root);
  return true;
}

function handlePanelFilterClear(event) {
  const button = event.target.closest("[data-filter-clear]");
  if (!button || panelState.activeCategory === "all") {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  panelState.sortMenuOpen = false;
  panelState.filterMenuOpen = false;
  panelState.categoryComposerOpen = false;
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  panelState.activeCategory = "all";
  syncPanelViewStateWithMotion();
  return true;
}

function handlePanelAddCategory(event) {
  const button = event.target.closest("[data-add-category]");
  if (!button) {
    return false;
  }

  event.preventDefault();
  panelState.sortMenuOpen = false;
  panelState.filterMenuOpen = false;
  panelState.categoryComposerOpen = !panelState.categoryComposerOpen;
  panelState.settingsOpen = false;
  panelState.shortlistOpen = false;
  closePanelArchivedView();
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  renderTuckioPanel();
  return true;
}

function handlePanelRemoveCategoryPrompt(event) {
  const button = event.target.closest("[data-remove-category-prompt]");
  if (!button) {
    return false;
  }

  event.preventDefault();
  event.stopPropagation();
  rememberPanelFocus(button);
  panelState.sortMenuOpen = false;
  panelState.filterMenuOpen = false;
  panelState.categoryComposerOpen = false;
  panelState.shortlistOpen = false;
  closePanelArchivedView();
  panelState.deleteCategoryId = button.dataset.removeCategoryPrompt;
  panelState.deleteItemId = "";
  renderTuckioPanel();
  return true;
}

function handlePanelCategorySelection(event) {
  const button = event.target.closest("[data-category]");
  if (!button) {
    return;
  }

  if (!panelState.searchQuery) {
    panelState.searchOpen = false;
  }
  panelState.sortMenuOpen = false;
  panelState.filterMenuOpen = false;
  panelState.categoryComposerOpen = false;
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  panelState.activeCategory = button.dataset.category;
  syncPanelViewStateWithMotion();
}
