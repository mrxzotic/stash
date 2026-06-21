function bindPanelSearchEvents(root) {
  root.querySelector("[data-panel-search]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    panelState.searchOpen = true;
    panelState.settingsOpen = false;
    renderPanelTopbarOnly(root, "search");
    window.requestAnimationFrame(() => focusPanelElement(root.querySelector("[data-search]")));
  });

  root.querySelector("[data-search]")?.addEventListener("input", (event) => {
    panelState.searchQuery = event.target.value;
    syncSearchClearButton(root);
    renderPanelItemsOnly(root);
  });

  root.querySelector("[data-clear-search]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    clearOrClosePanelSearch(root);
  });
}

function handlePanelSearchEscape(root) {
  if (!panelState.searchOpen) return false;
  clearOrClosePanelSearch(root);
  return true;
}

function clearOrClosePanelSearch(root) {
  if (!panelState.searchQuery) {
    panelState.searchOpen = false;
    renderPanelTopbarOnly(root, "search");
    window.requestAnimationFrame(() => focusPanelElement(root.querySelector("[data-panel-search]")));
    return;
  }

  syncPanelWithRebuildMotion(root, "search", () => {
    panelState.searchQuery = "";
    const input = root.querySelector("[data-search]");
    if (input) input.value = "";
    syncSearchClearButton(root);
    renderPanelItemsOnly(root);
  });
  const input = root.querySelector("[data-search]");
  window.requestAnimationFrame(() => focusPanelElement(input));
}

function syncSearchClearButton(root) {
  const clearButton = root.querySelector("[data-clear-search]");
  if (!clearButton) return;
  const label = panelState.searchQuery ? "Clear search" : "Close search";
  clearButton.disabled = false;
  clearButton.classList.add("is-visible");
  clearButton.setAttribute("aria-label", label);
  clearButton.setAttribute("title", label);
}
