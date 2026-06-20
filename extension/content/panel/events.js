function bindPanelEvents(root) {
  const shell = root.querySelector(".wp-shell");
  if (!shell) {
    return;
  }

  bindImageFallbacks(root);
  bindPanelSearchEvents(root);
  bindPanelCurrencyEvents(root);
  bindPanelBrandCloudEvents(root);

  root.querySelector("[data-panel-close]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeStashPanel();
  });

  root.querySelector("[data-panel-settings]")?.addEventListener("click", () => {
    panelState.settingsOpen = !panelState.settingsOpen;
    if (panelState.settingsOpen) {
      panelState.searchOpen = false;
      panelState.categoryComposerOpen = false;
      panelState.deleteCategoryId = "";
      panelState.deleteItemId = "";
    }
    renderStashPanel();
  });
  root.querySelector(".wp-settings")?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-select-trigger]");
    if (trigger) {
      event.preventDefault();
      toggleSettingsSelect(trigger);
      return;
    }

    const backgroundButton = event.target.closest("[data-background-theme]");
    if (backgroundButton) {
      event.preventDefault();
      const backgroundTheme = cleanText(backgroundButton.dataset.backgroundTheme).toLowerCase();
      if (isBackgroundTheme(backgroundTheme)) {
        safelyRunPanelAction(() =>
          savePanelSettings({ backgroundTheme }, { rerender: false })
        );
      }
      return;
    }

    const compactViewToggle = event.target.closest("[data-compact-view]");
    if (compactViewToggle) {
      safelyRunPanelAction(() =>
        savePanelSettings(
          { compactView: Boolean(compactViewToggle.checked) },
          { rerender: false, syncViewMode: true }
        )
      );
      return;
    }

    if (!event.target.closest("[data-select-root]")) {
      closeSettingsSelects(event.currentTarget);
    }
  });
  root.querySelector(".wp-filters")?.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-category]");
    if (addButton) {
      event.preventDefault();
      panelState.categoryComposerOpen = !panelState.categoryComposerOpen;
      panelState.settingsOpen = false;
      panelState.deleteCategoryId = "";
      panelState.deleteItemId = "";
      renderStashPanel();
      return;
    }

    const removeButton = event.target.closest("[data-remove-category-prompt]");
    if (removeButton) {
      event.preventDefault();
      event.stopPropagation();
      panelState.categoryComposerOpen = false;
      panelState.deleteCategoryId = removeButton.dataset.removeCategoryPrompt;
      panelState.deleteItemId = "";
      renderStashPanel();
      return;
    }

    const button = event.target.closest("[data-category]");
    if (!button) {
      return;
    }
    if (!panelState.searchQuery) {
      panelState.searchOpen = false;
    }
    panelState.categoryComposerOpen = false;
    panelState.deleteCategoryId = "";
    panelState.deleteItemId = "";
    panelState.activeCategory = button.dataset.category;
    renderStashPanel();
  });
  root.querySelector(".wp-items")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-id]");
    if (!button) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    panelState.categoryComposerOpen = false;
    panelState.deleteCategoryId = "";
    panelState.deleteItemId = button.dataset.removeId;
    renderStashPanel();
  });
  root.querySelector("[data-category-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = root.querySelector("[data-category-input]");
    const label = cleanCategoryLabel(input?.value);
    if (!label) {
      return;
    }
    input.value = "";
    panelState.categoryComposerOpen = false;
    const category = { id: uniquePanelCategoryId(label), label };
    panelState.activeCategory = category.id;
    safelyRunPanelAction(() =>
      savePanelCategories([
        ...panelState.categories,
        category
      ])
    );
  });
  root.querySelector("[data-cancel-category]")?.addEventListener("click", (event) => {
    event.preventDefault();
    panelState.categoryComposerOpen = false;
    renderStashPanel();
  });
  root.querySelector(".wp-category-list")?.addEventListener("change", (event) => {
    const input = event.target.closest("[data-category-label]");
    if (!input) {
      return;
    }
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
    if (!button) {
      return;
    }
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
  root.querySelector("[data-confirm-delete-item]")?.addEventListener("click", (event) => {
    const id = event.currentTarget.dataset.confirmDeleteItem;
    panelState.deleteItemId = "";
    safelyRunPanelAction(() => removePanelItem(id));
  });
  root.querySelectorAll("[data-cancel-delete-category]").forEach((button) => {
    button.addEventListener("click", () => {
      panelState.deleteCategoryId = "";
      renderStashPanel();
    });
  });
  root.querySelectorAll("[data-cancel-delete-item]").forEach((button) => {
    button.addEventListener("click", () => {
      panelState.deleteItemId = "";
      renderStashPanel();
    });
  });
  if (!root.__stashPanelKeydownBound) {
    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (panelState.deleteCategoryId || panelState.deleteItemId || panelState.categoryComposerOpen) {
          panelState.deleteCategoryId = "";
          panelState.deleteItemId = "";
          panelState.categoryComposerOpen = false;
          renderStashPanel();
          return;
        }
        closeStashPanel();
      }
    });
    root.__stashPanelKeydownBound = true;
  }

  if (!root.__stashPanelClickawayBound) {
    root.addEventListener("click", (event) => {
      const target = event.target;
      if (target.closest?.(".wp-inline-search") || target.closest?.("[data-panel-search]")) {
        return;
      }

      if (target.closest?.(".wp-category-composer") || target.closest?.("[data-add-category]")) {
        return;
      }

      if (panelState.categoryComposerOpen) {
        panelState.categoryComposerOpen = false;
        renderStashPanel();
        return;
      }

      if (panelState.searchOpen && !panelState.searchQuery) {
        panelState.searchOpen = false;
        renderStashPanel();
        return;
      }

      if (!target.closest?.("[data-currency-root]")) {
        closePanelCurrencySelect(root);
      }

      if (target.closest?.(".wp-popover") || target.closest?.("[data-panel-settings]")) {
        return;
      }

      if (panelState.settingsOpen) {
        panelState.settingsOpen = false;
        renderStashPanel();
      }
    });
    root.__stashPanelClickawayBound = true;
  }
}

function bindPanelCurrencyEvents(root) {
  root.querySelector("[data-currency-trigger]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    panelState.settingsOpen = false;
    root.querySelector(".wp-settings")?.setAttribute("hidden", "");
    togglePanelCurrencySelect(event.currentTarget);
  });

  root.querySelector("[data-currency-menu]")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-summary-currency]");
    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const currency = cleanText(button.dataset.summaryCurrency).toUpperCase();
    if (!isSummaryCurrency(currency)) {
      return;
    }

    closePanelCurrencySelect(root);
    if (currency === panelState.summaryCurrency) {
      return;
    }

    safelyRunPanelAction(() =>
      savePanelSettings({ summaryCurrency: currency }, { rerender: false, animateSummary: true })
    );
  });
}

function bindPanelSearchEvents(root) {
  root.querySelector("[data-panel-search]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    panelState.searchOpen = true;
    panelState.settingsOpen = false;
    renderStashPanel();
  });

  root.querySelector("[data-search]")?.addEventListener("input", (event) => {
    panelState.searchQuery = event.target.value;
    syncSearchClearButton(root);
    renderPanelItemsOnly(root);
  });

  root.querySelector("[data-clear-search]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    panelState.searchQuery = "";
    panelState.searchOpen = false;
    renderStashPanel();
  });
}

function syncSearchClearButton(root) {
  const clearButton = root.querySelector("[data-clear-search]");
  if (!clearButton) {
    return;
  }

  const hasQuery = Boolean(panelState.searchQuery);
  clearButton.disabled = !hasQuery;
  clearButton.classList.toggle("is-visible", hasQuery);
}

function togglePanelCurrencySelect(trigger) {
  const selectRoot = trigger.closest("[data-currency-root]");
  const menu = selectRoot?.querySelector("[data-currency-menu]");
  if (!selectRoot || !menu) {
    return;
  }

  const willOpen = menu.hidden;
  closePanelCurrencySelect(selectRoot.getRootNode());
  menu.hidden = !willOpen;
  selectRoot.classList.toggle("is-open", willOpen);
  trigger.setAttribute("aria-expanded", String(willOpen));
}

function closePanelCurrencySelect(scope) {
  scope.querySelectorAll?.("[data-currency-root]").forEach((selectRoot) => {
    selectRoot.classList.remove("is-open");
    selectRoot.querySelector("[data-currency-menu]")?.setAttribute("hidden", "");
    selectRoot.querySelector("[data-currency-trigger]")?.setAttribute("aria-expanded", "false");
  });
}

function toggleSettingsSelect(trigger) {
  const selectRoot = trigger.closest("[data-select-root]");
  const menu = selectRoot?.querySelector(".wp-select-menu");
  if (!selectRoot || !menu) {
    return;
  }

  const willOpen = menu.hidden;
  closeSettingsSelects(selectRoot.closest(".wp-settings") || document, selectRoot);
  menu.hidden = !willOpen;
  trigger.setAttribute("aria-expanded", String(willOpen));
}

function closeSettingsSelects(scope, exceptRoot) {
  scope.querySelectorAll?.("[data-select-root]").forEach((selectRoot) => {
    if (selectRoot === exceptRoot) {
      return;
    }
    selectRoot.querySelector(".wp-select-menu")?.setAttribute("hidden", "");
    selectRoot.querySelector("[data-select-trigger]")?.setAttribute("aria-expanded", "false");
  });
}

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

async function removePanelItem(id) {
  const previousSummary = panelSummaryTextForItems(panelState.items);
  const nextItems = panelState.items.filter((item) => normalizePanelItem(item).id !== id);
  if (nextItems.length === panelState.items.length) {
    return;
  }

  panelState.items = nextItems;
  panelState.deleteItemId = "";
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
  renderStashPanel({ summaryAnimationFrom: previousSummary });
}

function safelyRunPanelAction(action) {
  Promise.resolve()
    .then(action)
    .catch((error) => {
      try {
        showErrorOverlay(error);
      } catch {
        removeStaleExtensionRoots();
      }
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
  renderStashPanel();
}

async function deletePanelCategory(id) {
  const nextCategories = panelState.categories.filter((category) => category.id !== id);
  await savePanelCategories(nextCategories.length ? nextCategories : DEFAULT_CATEGORIES);
}

async function savePanelSettings(nextSettings, options = {}) {
  const previousCurrency = panelState.summaryCurrency;
  const settings = normalizePanelSettings({
    summaryCurrency: panelState.summaryCurrency,
    backgroundTheme: panelState.backgroundTheme,
    compactView: panelState.compactView,
    ...nextSettings
  });
  panelState.summaryCurrency = settings.summaryCurrency;
  panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
  panelState.backgroundTheme = settings.backgroundTheme;
  panelState.compactView = settings.compactView;
  if (options.rerender === false) {
    const shouldAnimateSummary =
      options.animateSummary || previousCurrency !== settings.summaryCurrency;
    syncPanelSettingsControls();
    if (options.syncViewMode) {
      syncPanelViewMode();
    }
    renderPanelSummaryOnly({
      animate: shouldAnimateSummary
    });
    refreshPanelSummaryRate({
      animateSummary: shouldAnimateSummary
    });
    await setLocalStorageValue(SETTINGS_STORAGE_KEY, settings);
    return;
  }

  await setLocalStorageValue(SETTINGS_STORAGE_KEY, settings);
  renderStashPanel();
}
