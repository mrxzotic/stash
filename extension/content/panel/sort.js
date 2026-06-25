function renderPanelSortControls() {
  if (!panelShouldShowSortControls()) {
    return "";
  }

  const current = panelCurrentSortOption();
  const isOpen = panelState.sortMenuOpen;
  return `
    <div class="wp-sort-controls${isOpen ? " is-open" : ""}" data-panel-sort-root>
      <button class="wp-sort-trigger" type="button" aria-label="${escapeAttribute(t("Sort saved items: {label}", { label: current.label }))}" aria-haspopup="menu" aria-expanded="${isOpen}" data-panel-hint="${escapeAttribute(t("Sort: {label}", { label: current.label }))}" data-panel-sort-trigger>
        ${renderPanelSortTriggerIcon(current)}
        <span class="wp-sort-current">${escapeHtml(t("Sort"))}</span>
        ${phosphorChevronDownIcon("wp-sort-chevron")}
      </button>
      <div class="wp-sort-menu wp-popover" role="menu" ${isOpen ? "" : "hidden"} data-panel-sort-menu>
        ${panelSortOptions().map(renderPanelSortOption).join("")}
      </div>
    </div>
  `;
}

function renderPanelSortTriggerIcon(current) {
  return current.direction === PANEL_SORT_ASC
    ? phosphorArrowUpIcon("wp-sort-trigger-icon")
    : phosphorArrowDownIcon("wp-sort-trigger-icon");
}

function renderPanelSortOption(option) {
  const isSelected = panelSortOptionIsSelected(option);
  return `
    <button class="wp-sort-option${isSelected ? " is-selected" : ""}" type="button" role="menuitemradio" aria-checked="${isSelected}" data-panel-sort-option data-panel-sort-field="${escapeAttribute(option.field)}" data-panel-sort-direction="${escapeAttribute(option.direction)}">
      <span class="wp-sort-check">${isSelected ? phosphorCheckIcon("wp-sort-check-icon") : ""}</span>
      <span class="wp-sort-option-label">${escapeHtml(option.label)}</span>
    </button>
  `;
}

function panelSortOptions() {
  return [
    { field: PANEL_SORT_FIELD_NAME, direction: PANEL_SORT_ASC, label: t("Name A-Z"), shortLabel: t("Name") },
    { field: PANEL_SORT_FIELD_NAME, direction: PANEL_SORT_DESC, label: t("Name Z-A"), shortLabel: t("Name") },
    { field: PANEL_SORT_FIELD_PRICE, direction: PANEL_SORT_ASC, label: t("Price low-high"), shortLabel: t("Price") },
    { field: PANEL_SORT_FIELD_PRICE, direction: PANEL_SORT_DESC, label: t("Price high-low"), shortLabel: t("Price") },
    { field: PANEL_SORT_FIELD_PRICE_DROP, direction: PANEL_SORT_DESC, label: t("Price drops"), shortLabel: t("Price") },
    { field: PANEL_SORT_FIELD_RECENT, direction: PANEL_SORT_DESC, label: t("Date newest"), shortLabel: t("Date") },
    { field: PANEL_SORT_FIELD_RECENT, direction: PANEL_SORT_ASC, label: t("Date oldest"), shortLabel: t("Date") }
  ];
}

function panelCurrentSortOption() {
  return panelSortOptions().find(panelSortOptionIsSelected) || panelSortOptions()[0];
}

function panelSortOptionIsSelected(option) {
  return panelState.sortField === option.field && panelState.sortDirection === option.direction;
}

function panelVisibleItems(items = panelState.items) {
  return panelSearchableItems(items)
    .filter(panelItemMatchesSearch);
}

function panelSearchableItems(items = panelState.items) {
  return panelScopedItems(items)
    .filter(panelItemMatchesShortlistFilter)
    .filter(panelItemMatchesActiveCategory)
    .filter(panelItemMatchesBrandFilter);
}

function panelItemMatchesActiveCategory(item) {
  return panelState.activeCategory === "all" || item.category === panelState.activeCategory;
}

function panelShouldShowSortControls(items = panelState.items) {
  return panelVisibleItems(items).length >= 2;
}

function panelShouldShowSearchControl(items = panelState.items) {
  return panelState.searchOpen || Boolean(panelState.searchQuery) || panelSearchableItems(items).length >= 3;
}

function bindPanelSortEvents(root) {
  const filters = root.querySelector(".wp-filters");
  if (!filters) {
    return;
  }

  const shell = root.querySelector(".wp-shell");
  filters.addEventListener("pointerover", () => showPanelFilterControls(root));
  filters.addEventListener("mouseenter", () => showPanelFilterControls(root));
  filters.addEventListener("pointermove", (event) => syncPanelFilterPointerBounds(root, event));
  filters.addEventListener("mouseover", (event) => {
    const shell = event.target.closest?.(".wp-filter-shell:not(.is-all)");
    setPanelFilterRemoveShell(filters, shell && filters.contains(shell) ? shell : null);
  });
  filters.addEventListener("mouseleave", (event) => schedulePanelFilterControlsHide(root, event));
  shell?.addEventListener("pointermove", (event) => syncPanelFilterPointerBounds(root, event));
  shell?.addEventListener("mouseleave", () => {
    hidePanelFilterControls(root);
  });
  filters.addEventListener("focusin", (event) => {
    setPanelFilterControlsVisible(root, true);
    const shell = event.target.closest?.(".wp-filter-shell:not(.is-all)");
    setPanelFilterRemoveShell(filters, shell && filters.contains(shell) ? shell : null);
  });
  filters.addEventListener("focusout", () => {
    window.setTimeout(() => {
      setPanelFilterControlsVisible(root, panelFilterControlsShouldStayVisible(root, filters));
    }, 0);
  });
  filters.addEventListener("click", (event) => {
    const trigger = event.target.closest?.("[data-panel-sort-trigger]");
    if (trigger && filters.contains(trigger)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      closePanelFilterMenu(root);
      panelState.sortMenuOpen = !panelState.sortMenuOpen;
      syncPanelSortControls(root);
      return;
    }

    const option = event.target.closest?.("[data-panel-sort-option]");
    if (!option || !filters.contains(option)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    applyPanelSortOption(option.dataset.panelSortField, option.dataset.panelSortDirection, root);
  }, true);
}

function applyPanelSort(field, root) {
  if (!panelShouldShowSortControls()) {
    syncPanelSortControls(root);
    return;
  }

  const next = panelNextSortState(field);
  applyPanelSortOption(next.sortField, next.sortDirection, root);
}

function applyPanelSortOption(field, direction, root) {
  if (!panelShouldShowSortControls()) {
    syncPanelSortControls(root);
    return;
  }

  panelState.sortField = isPanelSortField(field) ? field : PANEL_SORT_FIELD_RECENT;
  panelState.sortDirection = isPanelSortDirection(direction)
    ? direction
    : panelDefaultSortDirection(panelState.sortField);
  panelState.sortMenuOpen = false;
  panelState.brandCloudSortList = panelState.brandCloudOpen && !panelState.brandFilterKey && !panelState.archivedOpen;
  reorderPanelItemsOnly(root);
  syncPanelSortControls(root);
  syncPanelBrandCountControl(root);
  syncPanelSortControlLayout(root);
}

function closePanelSortMenu(root = document.getElementById("tuckio-panel-root")?.shadowRoot) {
  if (!panelState.sortMenuOpen) {
    return;
  }

  panelState.sortMenuOpen = false;
  syncPanelSortControls(root);
}

function syncPanelSortControls(root) {
  if (!root) {
    return;
  }

  const filters = root.querySelector(".wp-filters");
  let viewControls = filters?.querySelector?.("[data-panel-view-controls]");
  const currentControls = filters?.querySelector?.("[data-panel-sort-root]");
  const shouldShowView = panelShouldShowViewControls();
  const shouldShow = panelShouldShowSortControls();
  if (!shouldShowView) {
    panelState.sortMenuOpen = false;
    if (viewControls) {
      viewControls.remove();
      syncPanelSortControlLayout(root);
    }
    return;
  }

  if (!viewControls) {
    filters?.insertAdjacentHTML?.("beforeend", renderPanelViewControls());
    syncPanelSortControlLayout(root);
    return;
  }

  if (!shouldShow) {
    panelState.sortMenuOpen = false;
    if (currentControls) {
      currentControls.remove();
      syncPanelSortControlLayout(root);
    }
    return;
  }

  if (!currentControls) {
    viewControls.insertAdjacentHTML?.("beforeend", renderPanelSortControls());
    syncPanelSortControlLayout(root);
    return;
  }

  currentControls.outerHTML = renderPanelSortControls();
}

function syncPanelSortControlLayout(root) {
  syncPanelFilterCrowding(root);
  syncPanelItemsTopOffset(root, { defer: false });
  window.requestAnimationFrame(() => {
    syncPanelFilterCrowding(root);
    syncPanelItemsTopOffset(root, { defer: false });
    window.setTimeout(() => syncPanelItemsTopOffset(root, { defer: false }), 160);
  });
}

function panelNextSortState(field) {
  const sortField = isPanelSortField(field) ? field : PANEL_SORT_FIELD_RECENT;
  const defaultDirection = panelDefaultSortDirection(sortField);

  if (panelState.sortField !== sortField) {
    return { sortField, sortDirection: defaultDirection };
  }

  return {
    sortField,
    sortDirection: panelState.sortDirection === PANEL_SORT_ASC
      ? PANEL_SORT_DESC
      : PANEL_SORT_ASC
  };
}

function panelSortedItems(items) {
  const sortField = isPanelSortField(panelState.sortField)
    ? panelState.sortField
    : PANEL_SORT_FIELD_RECENT;
  const sortDirection = isPanelSortDirection(panelState.sortDirection)
    ? panelState.sortDirection
    : PANEL_SORT_DESC;

  return items
    .map((item, index) => ({ item, index }))
    .sort((left, right) => panelCompareSortEntries(left, right, sortField, sortDirection))
    .map((entry) => entry.item);
}

function panelCompareSortEntries(left, right, sortField, sortDirection) {
  if (sortField === PANEL_SORT_FIELD_NAME) {
    const comparison = panelCompareNameEntries(left.item, right.item);
    if (comparison !== 0) {
      return sortDirection === PANEL_SORT_ASC ? comparison : -comparison;
    }
  }

  if (sortField === PANEL_SORT_FIELD_PRICE) {
    const comparison = panelComparePriceEntries(left.item, right.item);
    if (comparison !== 0) {
      return sortDirection === PANEL_SORT_ASC ? comparison : -comparison;
    }
  }

  if (sortField === PANEL_SORT_FIELD_PRICE_DROP) {
    const comparison = panelComparePriceDropEntries(left.item, right.item);
    if (comparison !== 0) {
      return sortDirection === PANEL_SORT_ASC ? -comparison : comparison;
    }
  }

  return panelCompareRecentEntries(left, right, sortDirection);
}

function panelCompareRecentEntries(left, right, sortDirection) {
  const leftTime = panelCreatedTime(left.item);
  const rightTime = panelCreatedTime(right.item);
  if (leftTime !== rightTime) {
    return sortDirection === PANEL_SORT_ASC
      ? leftTime - rightTime
      : rightTime - leftTime;
  }

  return sortDirection === PANEL_SORT_ASC
    ? right.index - left.index
    : left.index - right.index;
}

function panelCompareNameEntries(left, right) {
  return panelSortText(left.title).localeCompare(panelSortText(right.title)) ||
    panelSortText(left.brand).localeCompare(panelSortText(right.brand)) ||
    panelSortText(left.sourceDomain).localeCompare(panelSortText(right.sourceDomain));
}

function panelComparePriceEntries(left, right) {
  const leftPrice = panelSortPrice(left);
  const rightPrice = panelSortPrice(right);
  if (Number.isFinite(leftPrice) && Number.isFinite(rightPrice) && leftPrice !== rightPrice) {
    return leftPrice - rightPrice;
  }

  if (Number.isFinite(leftPrice) !== Number.isFinite(rightPrice)) {
    return Number.isFinite(leftPrice) ? -1 : 1;
  }

  return panelCompareNameEntries(left, right);
}

function panelComparePriceDropEntries(left, right) {
  const leftDrop = panelPriceDropSortValue(left);
  const rightDrop = panelPriceDropSortValue(right);
  if (leftDrop !== rightDrop) {
    return rightDrop - leftDrop;
  }

  const leftCheckedAt = panelPriceCheckSortTime(left);
  const rightCheckedAt = panelPriceCheckSortTime(right);
  if (leftCheckedAt !== rightCheckedAt) {
    return rightCheckedAt - leftCheckedAt;
  }

  return 0;
}

function panelSortPrice(item) {
  const normalized = item?.price ? item : normalizePanelItem(item || {});
  if (typeof panelPriceAmountInCurrency === "function") {
    return panelPriceAmountInCurrency(normalized, panelState.summaryCurrency);
  }

  const price = normalized.price || {};
  return numericPrice(price.amount);
}

function panelPriceDropSortValue(item) {
  const check = item?.priceCheck || {};
  if (check.state !== "down") {
    return 0;
  }

  const delta = numericPrice(check.deltaAmount);
  if (!Number.isFinite(delta) || delta >= 0) {
    return 0;
  }

  const currency = cleanText(check.current?.currency || check.previous?.currency || item?.price?.currency).toUpperCase();
  const converted = typeof convertPriceToDisplayAmount === "function"
    ? convertPriceToDisplayAmount(Math.abs(delta), currency, panelState.summaryCurrency)
    : undefined;
  return Number.isFinite(converted) ? converted : 0;
}

function panelPriceCheckSortTime(item) {
  const time = Date.parse(item?.priceCheck?.checkedAt || "");
  return Number.isFinite(time) ? time : 0;
}

function panelSortText(value) {
  return normalizeComparableText(value || "");
}

function panelCreatedTime(item) {
  const time = Date.parse(item.createdAt || "");
  return Number.isFinite(time) ? time : 0;
}

function panelDefaultSortDirection(field) {
  return field === PANEL_SORT_FIELD_NAME || field === PANEL_SORT_FIELD_PRICE
    ? PANEL_SORT_ASC
    : PANEL_SORT_DESC;
}

function isPanelSortField(value) {
  return value === PANEL_SORT_FIELD_NAME ||
    value === PANEL_SORT_FIELD_PRICE ||
    value === PANEL_SORT_FIELD_PRICE_DROP ||
    value === PANEL_SORT_FIELD_RECENT;
}

function isPanelSortDirection(value) {
  return value === PANEL_SORT_ASC || value === PANEL_SORT_DESC;
}
