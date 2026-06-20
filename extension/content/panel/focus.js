function focusPanelSearch(root) {
  const search = root.querySelector("[data-search]");
  if (search && panelState.searchOpen) {
    window.requestAnimationFrame(() => {
      try {
        search.focus({ preventScroll: true });
        search.setSelectionRange(search.value.length, search.value.length);
      } catch {
        search.focus();
      }
    });
  }
}

function focusCategoryComposer(root) {
  const input = root.querySelector("[data-category-input]");
  if (input && panelState.categoryComposerOpen) {
    window.requestAnimationFrame(() => {
      try {
        input.focus({ preventScroll: true });
      } catch {
        input.focus();
      }
    });
  }
}
