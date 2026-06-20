function renderPanelSortControls() {
  const disabled = panelScopedItems(panelState.items).length < 2;
  return `
    <span class="wp-sort-controls" aria-label="Sort saved items">
      ${renderPanelSortButton(PANEL_SORT_FIELD_NAME, disabled)}
      ${renderPanelSortButton(PANEL_SORT_FIELD_RECENT, disabled)}
    </span>
  `;
}

function renderPanelSortButton(field, disabled) {
  const state = panelSortButtonState(field);
  return `
    <button class="wp-sort-button" type="button" aria-label="${escapeAttribute(state.label)}" title="${escapeAttribute(state.title)}" data-panel-sort="${escapeAttribute(field)}" ${disabled ? "disabled" : ""}>
      <span class="wp-sort-label">${escapeHtml(state.shortLabel)}</span>
      ${state.icon}
    </button>
  `;
}

function panelSortButtonState(field) {
  const active = panelState.sortField === field;
  const next = panelNextSortState(field);
  if (field === PANEL_SORT_FIELD_NAME) {
    const ascending = next.sortDirection === PANEL_SORT_ASC;
    const label = ascending ? "Name A to Z" : "Name Z to A";
    return {
      active,
      shortLabel: ascending ? "A-Z" : "Z-A",
      label,
      title: ascending ? "Sort name A to Z" : "Sort name Z to A",
      icon: ascending
        ? lucideArrowDownIcon("wp-sort-arrow")
        : lucideArrowUpIcon("wp-sort-arrow")
    };
  }

  const newestFirst = next.sortDirection === PANEL_SORT_DESC;
  const label = newestFirst ? "Newest first" : "Oldest first";
  return {
    active,
    shortLabel: newestFirst ? "New" : "Old",
    label,
    title: newestFirst ? "Sort newest first" : "Sort oldest first",
    icon: newestFirst
      ? lucideArrowDownIcon("wp-sort-arrow")
      : lucideArrowUpIcon("wp-sort-arrow")
  };
}

function bindPanelSortEvents(root) {
  const filters = root.querySelector(".wp-filters");
  if (!filters) {
    return;
  }

  filters.addEventListener("mouseenter", () => syncPanelSortControlLayout(root));
  filters.addEventListener("mouseleave", () => syncPanelSortControlLayout(root));
  filters.addEventListener("focusin", () => syncPanelSortControlLayout(root));
  filters.addEventListener("focusout", () => syncPanelSortControlLayout(root));
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-panel-sort]");
    if (!button || !filters.contains(button)) {
      return;
    }

    if (button.disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    applyPanelSort(button.dataset.panelSort, root);
  }, true);
}

function applyPanelSort(field, root) {
  const next = panelNextSortState(field);
  panelState.sortField = next.sortField;
  panelState.sortDirection = next.sortDirection;
  panelState.brandCloudOpen = false;
  syncPanelSortControls(root);
  syncPanelBrandCountControl(root);
  root.querySelector(".wp-items")?.classList.remove("is-brand-cloud");
  renderPanelItemsOnly(root);
  syncPanelSortControlLayout(root);
}

function syncPanelSortControls(root) {
  const disabled = panelScopedItems(panelState.items).length < 2;
  root.querySelectorAll("[data-panel-sort]").forEach((button) => {
    const field = button.dataset.panelSort;
    const state = panelSortButtonState(field);
    button.disabled = disabled;
    button.classList.remove("is-active");
    button.setAttribute("aria-label", state.label);
    button.removeAttribute("aria-pressed");
    button.setAttribute("title", state.title);
    button.innerHTML = `
      <span class="wp-sort-label">${escapeHtml(state.shortLabel)}</span>
      ${state.icon}
    `;
  });
}

function syncPanelSortControlLayout(root) {
  window.requestAnimationFrame(() => {
    syncPanelItemsTopOffset(root);
    window.setTimeout(() => syncPanelItemsTopOffset(root), 220);
  });
}

function panelNextSortState(field) {
  const sortField = isPanelSortField(field) ? field : PANEL_SORT_FIELD_RECENT;
  const defaultDirection = sortField === PANEL_SORT_FIELD_NAME
    ? PANEL_SORT_ASC
    : PANEL_SORT_DESC;

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
    const comparison = panelSortName(left.item).localeCompare(panelSortName(right.item));
    if (comparison !== 0) {
      return sortDirection === PANEL_SORT_ASC ? comparison : -comparison;
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

function panelSortName(item) {
  return normalizeComparableText(`${item.title || ""} ${item.brand || ""} ${item.sourceDomain || ""}`);
}

function panelCreatedTime(item) {
  const time = Date.parse(item.createdAt || "");
  return Number.isFinite(time) ? time : 0;
}

function isPanelSortField(value) {
  return value === PANEL_SORT_FIELD_NAME || value === PANEL_SORT_FIELD_RECENT;
}

function isPanelSortDirection(value) {
  return value === PANEL_SORT_ASC || value === PANEL_SORT_DESC;
}
