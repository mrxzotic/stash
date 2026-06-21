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
  const next = panelNextSortState(field);
  if (field === PANEL_SORT_FIELD_NAME) {
    const ascending = next.sortDirection === PANEL_SORT_ASC;
    const label = ascending ? "Name A to Z" : "Name Z to A";
    return {
      shortLabel: ascending ? "A-Z" : "Z-A",
      label: `Sort ${label.toLowerCase()}`,
      title: `Sort name ${ascending ? "A to Z" : "Z to A"}`,
      icon: ascending
        ? lucideArrowDownIcon("wp-sort-arrow")
        : lucideArrowUpIcon("wp-sort-arrow")
    };
  }

  const newestFirst = next.sortDirection === PANEL_SORT_DESC;
  const label = newestFirst ? "Newest first" : "Oldest first";
  return {
    shortLabel: newestFirst ? "New" : "Old",
    label: `Sort ${label.toLowerCase()}`,
    title: `Sort ${newestFirst ? "newest first" : "oldest first"}`,
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
  filters.addEventListener("pointerdown", (event) => {
    if (!isPrimaryPanelPointer(event)) {
      return;
    }

    const button = panelSortEventButton(event, filters);
    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    rememberPanelSortPointer(root, button.dataset.panelSort);
    applyPanelSort(button.dataset.panelSort, root);
    clearPanelFilterPointerFocus(filters);
    setPanelFilterControlsVisible(root, true);
  }, true);
  filters.addEventListener("click", (event) => {
    const button = panelSortEventButton(event, filters);
    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (didHandlePanelSortPointerClick(root, button.dataset.panelSort)) {
      return;
    }

    applyPanelSort(button.dataset.panelSort, root);
    setPanelFilterControlsVisible(root, true);
  }, true);
}

function panelSortEventButton(event, filters) {
  const button = event.target.closest?.("[data-panel-sort]");
  if (!button || !filters.contains(button) || button.disabled) {
    return null;
  }

  return button;
}

function isPrimaryPanelPointer(event) {
  return event.isPrimary !== false && (event.button === undefined || event.button === 0);
}

function rememberPanelSortPointer(root, field) {
  root.__stashSortPointerHandledAt = Date.now();
  root.__stashSortPointerHandledField = field;
}

function didHandlePanelSortPointerClick(root, field) {
  const handledAt = root.__stashSortPointerHandledAt || 0;
  const handled = root.__stashSortPointerHandledField === field && Date.now() - handledAt < 700;
  root.__stashSortPointerHandledAt = 0;
  root.__stashSortPointerHandledField = "";
  return handled;
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

function panelSortText(value) {
  return normalizeComparableText(value || "");
}

function panelCreatedTime(item) {
  const time = Date.parse(item.createdAt || "");
  return Number.isFinite(time) ? time : 0;
}

function panelDefaultSortDirection(field) {
  return field === PANEL_SORT_FIELD_NAME ? PANEL_SORT_ASC : PANEL_SORT_DESC;
}

function isPanelSortField(value) {
  return value === PANEL_SORT_FIELD_NAME || value === PANEL_SORT_FIELD_RECENT;
}

function isPanelSortDirection(value) {
  return value === PANEL_SORT_ASC || value === PANEL_SORT_DESC;
}
