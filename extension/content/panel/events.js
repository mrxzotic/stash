function bindPanelEvents(root) {
  const shell = root.querySelector(".wp-shell");
  if (!shell) {
    return;
  }

  bindImageFallbacks(root);
  bindPanelSearchEvents(root);
  bindPanelOverflowEvents(root);
  bindPanelCurrencyEvents(root);
  bindPanelBrandCloudEvents(root);
  bindPanelEditEvents(root);
  bindPanelExportEvents(root);
  bindPanelArchiveEvents(root);
  bindPanelSortEvents(root);
  bindPanelHintEvents(root);
  bindPanelFounderPromoEvents(root);
  bindPanelSaveCurrentEvents(root);
  bindPanelImageSliderEvents(root);
  bindPanelPriceCheckerEvents(root);
  bindPanelDismissEvents(root);
  bindPanelFilterEvents(root);
  bindPanelCategoryEvents(root);
  root.querySelector(".wp-items")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-id]");
    if (!button) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    rememberPanelFocus(button);
    panelState.categoryComposerOpen = false;
    panelState.deleteCategoryId = "";
    panelState.deleteItemId = button.dataset.removeId;
    renderTuckioPanel();
  });
  root.querySelector("[data-confirm-delete-item]")?.addEventListener("click", (event) => {
    const id = event.currentTarget.dataset.confirmDeleteItem;
    panelState.deleteItemId = "";
    safelyRunPanelAction(() => removePanelItem(id));
  });
  root.querySelectorAll("[data-cancel-delete-category]").forEach((button) => {
    button.addEventListener("click", () => {
      panelState.deleteCategoryId = "";
      renderTuckioPanel();
    });
  });
  root.querySelectorAll("[data-cancel-delete-item]").forEach((button) => {
    button.addEventListener("click", () => {
      panelState.deleteItemId = "";
      renderTuckioPanel();
    });
  });
  if (!root.__tuckioPanelKeydownBound) {
    root.addEventListener("keydown", (event) => {
      if (trapPanelModalFocus(root, event)) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (panelState.sortMenuOpen) {
          closePanelSortMenu(root);
          return;
        }
        if (panelState.filterMenuOpen) {
          closePanelFilterMenu(root);
          return;
        }
        if (panelState.settingsOpen) {
          closePanelOverflowMenu(root);
          return;
        }
        if (handlePanelSearchEscape(root)) {
          return;
        }
        if (panelState.decisionItemId) {
          closePanelDecisionTray();
          syncPanelDecisionMode(root);
          return;
        }
        if (
          panelState.deleteCategoryId ||
          panelState.deleteItemId ||
          panelState.editItemId ||
          panelState.founderPromoOpen ||
          panelState.archivedOpen ||
          panelState.categoryComposerOpen
        ) {
          panelState.deleteCategoryId = "";
          panelState.deleteItemId = "";
          panelState.editItemId = "";
          panelState.decisionItemId = "";
          panelState.decisionDragItemId = "";
          panelState.founderPromoOpen = false;
          closePanelArchivedView();
          panelState.categoryComposerOpen = false;
          renderTuckioPanel();
          return;
        }
        closeTuckioPanel();
      }
    });
    root.__tuckioPanelKeydownBound = true;
  }

  if (!root.__tuckioPanelClickawayBound) {
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
        renderTuckioPanel();
        return;
      }

      if (panelState.searchOpen && !panelState.searchQuery) {
        panelState.searchOpen = false;
        renderPanelTopbarOnly(root, "search");
        return;
      }

      if (!target.closest?.("[data-currency-root]")) closePanelCurrencySelect(root);
      if (!target.closest?.("[data-panel-language-root]")) closePanelLanguageMenu(root);
      if (!target.closest?.("[data-panel-sort-root]")) closePanelSortMenu(root);
      if (
        panelState.decisionItemId &&
        !target.closest?.("[data-decision-menu-id]") &&
        !target.closest?.("[data-decision-drop-tray]") &&
        !target.closest?.("[data-decision-cancel]")
      ) {
        closePanelDecisionTray();
        syncPanelDecisionMode(root);
        return;
      }

      if (!target.closest?.("[data-filter-menu-trigger]") && !target.closest?.("[data-filter-menu]")) {
        closePanelFilterMenu(root);
      }

      if (!target.closest?.("[data-panel-overflow-root]")) {
        closePanelOverflowMenu(root);
      }

      if (target.closest?.(".wp-popover")) {
        return;
      }

      if (panelState.founderPromoOpen && !target.closest?.("[data-founder-promo-trigger]")) {
        panelState.founderPromoOpen = false;
        renderTuckioPanel();
      }
    });
    root.__tuckioPanelClickawayBound = true;
  }
}

function bindPanelOverflowEvents(root) {
  root.querySelector("[data-panel-overflow-trigger]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closePanelFilterMenu(root);
    closePanelSortMenu(root);
    closePanelCurrencySelect(root);
    togglePanelOverflowMenu(root);
  });
}

function togglePanelOverflowMenu(root) {
  if (panelState.settingsOpen) {
    closePanelLanguageMenu(root);
  }
  panelState.settingsOpen = !panelState.settingsOpen;
  syncPanelOverflowMenu(root);
}

function closePanelOverflowMenu(root = document.getElementById("tuckio-panel-root")?.shadowRoot) {
  if (!panelState.settingsOpen) {
    return;
  }

  closePanelLanguageMenu(root);
  panelState.settingsOpen = false;
  syncPanelOverflowMenu(root);
}

function syncPanelOverflowMenu(root) {
  const overflow = root?.querySelector?.("[data-panel-overflow-root]");
  const trigger = root?.querySelector?.("[data-panel-overflow-trigger]");
  const menu = root?.querySelector?.("[data-panel-overflow-menu]");
  if (!overflow || !trigger || !menu) {
    return;
  }

  overflow.classList.toggle("is-open", panelState.settingsOpen);
  trigger.classList.toggle("is-active", panelState.settingsOpen);
  trigger.setAttribute("aria-expanded", String(panelState.settingsOpen));
  menu.hidden = !panelState.settingsOpen;
  menu.setAttribute("style", panelOverflowMenuInlineStyle(panelState.settingsOpen));
}

function bindPanelCurrencyEvents(root) {
  root.querySelector("[data-currency-trigger]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closePanelOverflowMenu(root);
    closePanelSortMenu(root);
    closePanelFilterMenu(root);
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

async function removePanelItem(id) {
  const previousSummary = panelSummaryTextForItems(panelState.items);
  const nextItems = panelState.items.filter((item) => normalizePanelItem(item).id !== id);
  if (nextItems.length === panelState.items.length) return;

  const storedItems = await setLocalStorageValue(STORAGE_KEY, nextItems).catch((error) => {
    error.title = t("Could not delete this item");
    throw error;
  });
  panelState.items = Array.isArray(storedItems) ? storedItems : nextItems;
  panelState.deleteItemId = "";
  panelState.decisionItemId = "";
  syncPanelArchiveAvailability();
  renderTuckioPanel({ summaryAnimationFrom: previousSummary });
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

async function savePanelSettings(nextSettings, options = {}) {
  const previousCurrency = panelState.summaryCurrency;
  const settings = normalizePanelSettings({
    summaryCurrency: panelState.summaryCurrency,
    backgroundTheme: panelState.backgroundTheme,
    compactView: panelState.compactView,
    hoverHints: panelState.hoverHints,
    language: panelState.language,
    ...nextSettings
  });
  Object.assign(panelState, { summaryCurrency: settings.summaryCurrency, summaryRate: defaultSummaryRate(settings.summaryCurrency), backgroundTheme: settings.backgroundTheme, compactView: settings.compactView, hoverHints: settings.hoverHints, language: settings.language });
  if (options.rerender === false) {
    const shouldAnimateSummary =
      options.animateSummary || previousCurrency !== settings.summaryCurrency;
    const syncSettingsUi = () => {
      syncPanelSettingsControls();
      if (options.syncViewMode) {
        syncPanelViewMode();
      }
      if (options.syncSummary !== false) {
        renderPanelSummaryOnly({
          animate: shouldAnimateSummary
        });
        if (shouldAnimateSummary) {
          renderPanelPricesOnly({
            animate: true
          });
        }
        refreshPanelSummaryRate({
          animateSummary: shouldAnimateSummary
        });
      }
    };
    if (options.rebuildMotion) {
      syncPanelWithRebuildMotion(
        document.getElementById("tuckio-panel-root")?.shadowRoot,
        options.rebuildMotion,
        syncSettingsUi
      );
    } else {
      syncSettingsUi();
    }
    await setLocalStorageValue(SETTINGS_STORAGE_KEY, settings);
    return;
  }

  await setLocalStorageValue(SETTINGS_STORAGE_KEY, settings);
  renderTuckioPanel();
}
