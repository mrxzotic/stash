function showPanelFilterControls(root) {
  root.__tuckioFilterPointerInside = true;
  setPanelFilterControlsVisible(root, true);
}

function syncPanelFilterPointerBounds(root, event) {
  if (!hasPanelPointerPoint(event)) {
    return;
  }

  const filters = root.querySelector(".wp-filters");
  if (!filters) {
    return;
  }

  if (isPointNearPanelFilters(filters, event.clientX, event.clientY)) {
    root.__tuckioFilterPointerInside = true;
    if (!filters.classList?.contains?.("is-controls-visible")) {
      setPanelFilterControlsVisible(root, true);
    }
    return;
  }

  if (root.__tuckioFilterPointerInside || filters.classList?.contains?.("is-controls-visible")) {
    hidePanelFilterControls(root);
  }
}

function clearPanelFilterPointerFocus(filters) {
  const active = document.activeElement;
  if (active && filters?.contains?.(active)) {
    active.blur?.();
  }
}

function panelFilterControlsShouldStayVisible(root, filters) {
  return Boolean(root.__tuckioFilterPointerInside || hasPanelFilterKeyboardFocus(filters));
}

function hasPanelFilterKeyboardFocus(filters) {
  const active = document.activeElement;
  if (!active || !filters?.contains?.(active)) {
    return false;
  }

  return active.matches?.(":focus-visible") === true;
}

function setPanelFilterControlsVisible(root, visible) {
  window.clearTimeout(root.__tuckioFilterControlsHideTimer);
  const filters = root.querySelector(".wp-filters");
  if (!filters) {
    return;
  }

  const wasVisible = filters.classList.contains("is-controls-visible");
  if (wasVisible === visible) {
    if (!visible) {
      setPanelFilterRemoveShell(filters, null);
    }
    return;
  }

  filters.classList.toggle("is-controls-visible", visible);
  if (!visible) {
    setPanelFilterRemoveShell(filters, null);
  }
  syncPanelFilterControlsLayout(root);
}

function syncPanelFilterControlsLayout(root) {
  syncPanelItemsTopOffset(root, { defer: false });
  window.requestAnimationFrame(() => {
    syncPanelItemsTopOffset(root, { defer: false });
  });
}

function setPanelFilterRemoveShell(filters, activeShell) {
  filters?.querySelectorAll?.(".wp-filter-shell.is-remove-visible").forEach((shell) => {
    shell.classList.toggle("is-remove-visible", false);
  });
  if (!activeShell) {
    return;
  }

  activeShell.classList.add("is-remove-visible");
}

function schedulePanelFilterControlsHide(root, event) {
  window.clearTimeout(root.__tuckioFilterControlsHideTimer);
  if (!hasPanelPointerPoint(event)) {
    hidePanelFilterControls(root);
    return;
  }

  const point = { x: event.clientX, y: event.clientY };
  window.requestAnimationFrame(() => {
    const filters = root.querySelector(".wp-filters");
    if (isPointNearPanelFilters(filters, point.x, point.y)) {
      return;
    }

    root.__tuckioFilterPointerInside = false;
    hidePanelFilterControls(root);
  });
}

function hidePanelFilterControls(root) {
  window.clearTimeout(root.__tuckioFilterControlsHideTimer);
  root.__tuckioFilterPointerInside = false;
  const filters = root.querySelector(".wp-filters");
  if (hasPanelFilterKeyboardFocus(filters)) {
    setPanelFilterControlsVisible(root, true);
    return;
  }

  clearPanelFilterPointerFocus(filters);
  setPanelFilterControlsVisible(root, false);
}

function hasPanelPointerPoint(event) {
  return Number.isFinite(event?.clientX) && Number.isFinite(event?.clientY);
}

function isPointNearPanelFilters(filters, x, y) {
  const rect = filters?.getBoundingClientRect?.();
  if (!rect) {
    return false;
  }

  const padding = 8;
  return (
    x >= rect.left - padding &&
    x <= rect.right + padding &&
    y >= rect.top - padding &&
    y <= rect.bottom + padding
  );
}
