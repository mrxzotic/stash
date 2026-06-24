function bindPanelCategoryEvents(root) {
  root.querySelector("[data-category-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = root.querySelector("[data-category-input]");
    const label = cleanCategoryLabel(input?.value);
    if (!label) return;

    input.value = "";
    panelState.categoryComposerOpen = false;
    closePanelArchivedView();
    const category = { id: uniquePanelCategoryId(label), label };
    panelState.activeCategory = category.id;
    safelyRunPanelAction(() => savePanelCategories([...panelState.categories, category]));
  });

  root.querySelector("[data-cancel-category]")?.addEventListener("click", (event) => {
    event.preventDefault();
    panelState.categoryComposerOpen = false;
    renderTuckioPanel();
  });

  root.querySelector(".wp-category-list")?.addEventListener("change", (event) => {
    const input = event.target.closest("[data-category-label]");
    if (!input) return;

    const id = input.dataset.categoryLabel;
    safelyRunPanelAction(() =>
      savePanelCategories(
        panelState.categories.map((category) =>
          category.id === id
            ? { ...category, label: cleanCategoryLabel(input.value) || category.label }
            : category
        )
      )
    );
  });

  root.querySelector(".wp-category-list")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-category]");
    if (!button) return;

    const nextCategories = panelState.categories.filter(
      (category) => category.id !== button.dataset.removeCategory
    );
    safelyRunPanelAction(() =>
      savePanelCategories(nextCategories.length ? nextCategories : DEFAULT_CATEGORIES)
    );
  });

  root.querySelector("[data-reset-categories]")?.addEventListener("click", () => {
    safelyRunPanelAction(() => savePanelCategories(DEFAULT_CATEGORIES));
  });

  root.querySelector("[data-confirm-delete-category]")?.addEventListener("click", (event) => {
    const id = event.currentTarget.dataset.confirmDeleteCategory;
    panelState.deleteCategoryId = "";
    safelyRunPanelAction(() => deletePanelCategory(id));
  });
}

async function savePanelCategories(nextCategories) {
  panelState.categories = normalizeCategories(nextCategories);
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  panelState.categoryComposerOpen = false;
  if (
    panelState.activeCategory !== "all" &&
    !hasCategory(panelState.categories, panelState.activeCategory)
  ) {
    panelState.activeCategory = "all";
  }
  await setLocalStorageValue(CATEGORY_STORAGE_KEY, panelState.categories);
  renderTuckioPanel();
}

async function deletePanelCategory(id) {
  const nextCategories = panelState.categories.filter((category) => category.id !== id);
  await savePanelCategories(nextCategories.length ? nextCategories : DEFAULT_CATEGORIES);
}
