function syncPanelFilterRail(root) {
  const rail = root?.querySelector?.("[data-filter-rail]");
  syncPanelFilterMenuPosition(root);
  observePanelFilterCrowding(root, rail);
  syncPanelFilterRailLayout(root, rail);
}

function syncPanelFilterRailLayout(root, rail = root?.querySelector?.("[data-filter-rail]")) {
  const active = Array.from(rail?.children || []).find((child) =>
    child.classList?.contains("is-active")
  );
  if (!rail) {
    return;
  }
  if (!active) {
    syncPanelFilterCrowding(root, rail);
    return;
  }

  window.requestAnimationFrame(() => {
    scrollPanelFilterChipIntoView(rail, active);
    const isCrowded = applyPanelFilterCrowding(root, rail);
    if (!isCrowded) {
      return;
    }

    window.requestAnimationFrame(() => {
      scrollPanelFilterChipIntoView(rail, active);
      applyPanelFilterCrowding(root, rail);
    });
  });
}

function syncPanelFilterCrowding(root, rail = root?.querySelector?.("[data-filter-rail]")) {
  if (!root || !rail) {
    return;
  }

  window.requestAnimationFrame(() => {
    applyPanelFilterCrowding(root, rail);
  });
}

function applyPanelFilterCrowding(root, rail = root?.querySelector?.("[data-filter-rail]")) {
  const filters = root?.querySelector?.(".wp-filters");
  if (!filters || !rail) {
    return false;
  }

  if (filters.classList.contains("is-filter-crowded")) {
    const expandedWidth = Number(filters.__tuckioFilterExpandedWidth) || rail.scrollWidth;
    if (expandedWidth > rail.clientWidth + 1 || panelFilterRailHasClippedChild(rail)) {
      return true;
    }
  }

  filters.classList.remove("is-filter-crowded");
  filters.__tuckioFilterExpandedWidth = rail.scrollWidth;
  const isCrowded = panelFilterRailIsCrowded(rail);
  filters.classList.toggle("is-filter-crowded", isCrowded);
  return isCrowded;
}

function observePanelFilterCrowding(root, rail = root?.querySelector?.("[data-filter-rail]")) {
  const filters = root?.querySelector?.(".wp-filters");
  if (!root || !filters || !rail || typeof ResizeObserver !== "function") {
    return;
  }

  root.__tuckioFilterCrowdingObserver?.disconnect?.();
  const observer = new ResizeObserver(() => schedulePanelFilterRailLayout(root));
  root.__tuckioFilterCrowdingObserver = observer;
  observer.observe(filters);
  observer.observe(rail);
  filters.querySelectorAll("[data-panel-view-controls], [data-panel-sort-trigger], [data-filter-menu-trigger]")
    .forEach((item) => observer.observe(item));
}

function schedulePanelFilterRailLayout(root) {
  if (!root || root.__tuckioFilterRailLayoutScheduled) {
    return;
  }

  root.__tuckioFilterRailLayoutScheduled = true;
  window.requestAnimationFrame(() => {
    root.__tuckioFilterRailLayoutScheduled = false;
    syncPanelFilterMenuPosition(root);
    syncPanelFilterRailLayout(root);
  });
}

function scrollPanelFilterChipIntoView(rail, chip) {
  const railWidth = Number(rail?.clientWidth);
  const chipLeft = Number(chip?.offsetLeft);
  const chipWidth = Number(chip?.offsetWidth);
  if (!rail || !Number.isFinite(railWidth) || railWidth <= 0 ||
    !Number.isFinite(chipLeft) || !Number.isFinite(chipWidth)) {
    chip?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    return;
  }

  const padding = 2;
  const currentLeft = Number(rail.scrollLeft) || 0;
  const visibleLeft = currentLeft + padding;
  const visibleRight = currentLeft + railWidth - padding;
  const chipRight = chipLeft + chipWidth;
  if (chipLeft < visibleLeft) {
    rail.scrollLeft = Math.max(0, chipLeft - padding);
    return;
  }
  if (chipRight > visibleRight) {
    rail.scrollLeft = Math.max(0, chipRight - railWidth + padding);
  }
}

function panelFilterRailIsCrowded(rail) {
  const railRect = rail?.getBoundingClientRect?.();
  if (!railRect) {
    return false;
  }

  return rail.scrollWidth > rail.clientWidth + 1 || panelFilterRailHasClippedChild(rail, railRect);
}

function panelFilterRailHasClippedChild(rail, railRect = rail?.getBoundingClientRect?.()) {
  if (!railRect) {
    return false;
  }

  const leftEdge = railRect.left - 1;
  const rightEdge = railRect.right + 1;
  return Array.from(rail.children || []).some((child) => {
    const rect = child.getBoundingClientRect?.();
    return rect && rect.width > 0 && (rect.left < leftEdge || rect.right > rightEdge);
  });
}
