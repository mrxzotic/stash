function bindPanelEvents(root) {
  const shell = root.querySelector(".wp-shell");
  if (!shell) {
    return;
  }

  bindImageFallbacks(root);
  bindPanelSearchEvents(root);
  bindPanelCurrencyEvents(root);

  root.querySelector("[data-panel-settings]")?.addEventListener("click", () => {
    panelState.settingsOpen = !panelState.settingsOpen;
    if (panelState.settingsOpen) {
      panelState.searchOpen = false;
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

    if (!event.target.closest("[data-select-root]")) {
      closeSettingsSelects(event.currentTarget);
    }
  });
  root.querySelector(".wp-filters")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) {
      return;
    }
    if (!panelState.searchQuery) {
      panelState.searchOpen = false;
    }
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
    safelyRunPanelAction(() => removePanelItem(button.dataset.removeId));
  });
  root.querySelector("[data-category-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = root.querySelector("[data-category-input]");
    const label = cleanCategoryLabel(input?.value);
    if (!label) {
      return;
    }
    input.value = "";
    safelyRunPanelAction(() =>
      savePanelCategories([
        ...panelState.categories,
        { id: uniquePanelCategoryId(label), label }
      ])
    );
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
  if (!root.__stashPanelKeydownBound) {
    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
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

async function removePanelItem(id) {
  panelState.items = panelState.items.filter((item) => normalizePanelItem(item).id !== id);
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
  renderStashPanel();
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
  if (
    panelState.activeCategory !== "all" &&
    !hasCategory(panelState.categories, panelState.activeCategory)
  ) {
    panelState.activeCategory = "all";
  }
  await setLocalStorageValue(CATEGORY_STORAGE_KEY, panelState.categories);
  renderStashPanel();
}

async function savePanelSettings(nextSettings, options = {}) {
  const previousCurrency = panelState.summaryCurrency;
  const settings = normalizePanelSettings({
    summaryCurrency: panelState.summaryCurrency,
    backgroundTheme: panelState.backgroundTheme,
    ...nextSettings
  });
  panelState.summaryCurrency = settings.summaryCurrency;
  panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
  panelState.backgroundTheme = settings.backgroundTheme;
  await setLocalStorageValue(SETTINGS_STORAGE_KEY, settings);
  if (options.rerender === false) {
    syncPanelSettingsControls();
    renderPanelSummaryOnly({
      animate: options.animateSummary || previousCurrency !== settings.summaryCurrency
    });
    refreshPanelSummaryRate({
      animateSummary: options.animateSummary || previousCurrency !== settings.summaryCurrency
    });
    return;
  }

  renderStashPanel();
}
