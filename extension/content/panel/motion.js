var PANEL_REBUILD_MOTION_MS = 620;

function panelRebuildMotionKind(kind) {
  return kind === "view" ? kind : "";
}

function panelRebuildMotionClass(kind) {
  const motionKind = panelRebuildMotionKind(kind);
  return motionKind ? ` is-rebuilding is-${motionKind}-rebuild` : "";
}

function renderTuckioPanelWithMotion(kind, options = {}) {
  panelState.rebuildMotion = panelRebuildMotionKind(kind);
  renderTuckioPanel(options);
}

function startPanelViewModeSwitch(items) {
  if (!items || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) {
    return;
  }

  window.clearTimeout(items.__tuckioViewModeSwitchTimer);
  items.classList.remove("is-view-mode-switching");
  void items.offsetWidth;
  items.classList.add("is-view-mode-switching");
  items.__tuckioViewModeSwitchTimer = window.setTimeout(() => {
    items.classList.remove("is-view-mode-switching");
  }, 420);
}

function syncPanelViewStateWithMotion(options = {}) {
  const root = document.getElementById("tuckio-panel-root")?.shadowRoot;
  if (!root) {
    renderTuckioPanel(options);
    return;
  }

  clearPanelRebuildMotion(root);
  syncPanelViewState(root, options);
}

function syncPanelViewState(root, options = {}) {
  syncPanelFiltersState(root);
  syncPanelItemsState(root);
  syncPanelDecisionMode(root);
  if (options.syncSummary !== false) {
    renderPanelSummaryOnly({ animate: Boolean(options.animateSummary) });
  }
  syncPanelFilterRail(root);
  syncPanelItemsTopOffset(root);
}

function syncPanelFiltersState(root) {
  const filters = root?.querySelector?.(".wp-filters");
  if (!filters) return;
  const filterCategories = [{ id: "all", label: "All" }, ...panelState.categories];
  filters.className = `wp-filters${panelState.activeCategory !== "all" || panelState.categoryComposerOpen || panelState.archivedOpen ? " is-expanded" : ""}`;
  filters.innerHTML = renderCategoryFilters(filterCategories, panelArchivedCount(panelState.items));
}

function syncPanelItemsState(root) {
  const list = root?.querySelector?.(".wp-items");
  if (!list) return;
  list.classList.toggle("is-compact", panelState.compactView);
  list.classList.toggle("is-archive-view", panelState.archivedOpen);
  list.classList.toggle("is-brand-cloud", panelState.brandCloudOpen && !panelState.brandFilterKey && !panelState.archivedOpen);
  syncPanelItemsContent(root, list, panelSortedItems(panelVisibleItems(panelState.items)));
  bindImageFallbacks(root);
}

function renderPanelTopbarOnly(root, kind = "search") {
  const topbar = root?.querySelector(".wp-topbar");
  if (!topbar) {
    if (kind === "search") {
      renderTuckioPanel();
      return;
    }
    renderTuckioPanelWithMotion(kind);
    return;
  }

  const updateTopbar = () => {
    topbar.className = `wp-topbar${panelState.searchOpen ? " is-searching" : ""}`;
    topbar.innerHTML = panelState.searchOpen
      ? renderPanelSearchHtml()
      : renderPanelSummaryHtml(panelSummaryItems(panelState.items));
    bindPanelTopbarEvents(root);
  };

  if (kind === "search") {
    clearPanelRebuildMotion(root);
    updateTopbar();
    return;
  }

  syncPanelWithRebuildMotion(root, kind, updateTopbar);
}

function bindPanelTopbarEvents(root) {
  bindPanelSearchEvents(root);
  bindPanelOverflowEvents(root);
  bindPanelCurrencyEvents(root);
  bindPanelPreferenceEvents(root);
  bindPanelSaveCurrentEvents(root);
  bindPanelFounderPromoTrigger(root.querySelector("[data-founder-promo-trigger]"));
}

function syncPanelWithRebuildMotion(root, kind, update) {
  const motionKind = panelRebuildMotionKind(kind);
  const shell = root?.querySelector(".wp-shell");
  if (!motionKind || !shell) {
    update();
    return;
  }

  clearPanelRebuildMotion(root);
  shell.classList.add("is-rebuilding", `is-${motionKind}-rebuild`);
  update();
  schedulePanelRebuildMotionClear(root);
}

function finishPanelRebuildMotion(root) {
  if (!panelState.rebuildMotion) {
    return;
  }

  schedulePanelRebuildMotionClear(root);
  panelState.rebuildMotion = "";
}

function schedulePanelRebuildMotionClear(root) {
  window.clearTimeout(panelState.rebuildMotionTimer);
  panelState.rebuildMotionTimer = window.setTimeout(() => {
    clearPanelRebuildMotion(root || document.getElementById("tuckio-panel-root")?.shadowRoot);
  }, PANEL_REBUILD_MOTION_MS);
}

function clearPanelRebuildMotion(root) {
  window.clearTimeout(panelState.rebuildMotionTimer);
  panelState.rebuildMotionTimer = 0;
  panelState.rebuildMotion = "";
  const shell = root?.querySelector(".wp-shell");
  if (!shell) {
    return;
  }

  shell.classList.remove("is-rebuilding", "is-view-rebuild", "is-theme-rebuild");
}

function capturePanelItemLayout(root) {
  const rects = new Map();
  root?.querySelectorAll?.("[data-panel-motion-id]").forEach((element) => {
    const id = element.dataset.panelMotionId;
    const rect = element.getBoundingClientRect();
    if (id && rect.width && rect.height) {
      rects.set(id, {
        left: rect.left,
        top: rect.top
      });
    }
  });
  return rects;
}

function animatePanelItemLayout(root, previousRects) {
  if (
    !previousRects?.size ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  ) {
    return;
  }

  window.requestAnimationFrame(() => {
    root.querySelectorAll("[data-panel-motion-id]").forEach((element) => {
      animatePanelItemFromPreviousRect(element, previousRects.get(element.dataset.panelMotionId));
    });
  });
}

function animatePanelItemFromPreviousRect(element, previousRect) {
  if (!previousRect || element.classList.contains("is-new") || element.classList.contains("is-shifted-right")) {
    return;
  }

  const nextRect = element.getBoundingClientRect();
  const dx = previousRect.left - nextRect.left;
  const dy = previousRect.top - nextRect.top;
  if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
    return;
  }

  clearPanelMovedItemCleanup(element);
  element.classList.remove("is-layout-settling");
  element.classList.add("is-layout-moving");
  element.style.setProperty("--wp-layout-dx", `${dx.toFixed(2)}px`);
  element.style.setProperty("--wp-layout-dy", `${dy.toFixed(2)}px`);
  element.getBoundingClientRect();
  window.requestAnimationFrame(() => settlePanelMovedItem(element));
}

function settlePanelMovedItem(element) {
  clearPanelMovedItemCleanup(element);
  element.classList.remove("is-layout-moving");
  element.classList.add("is-layout-settling");
  element.style.setProperty("--wp-layout-dx", "0px");
  element.style.setProperty("--wp-layout-dy", "0px");
  const finish = (event) => {
    if (!event || (event.target === element && event.propertyName === "transform")) {
      finishPanelMovedItem(element);
    }
  };
  element.__tuckioLayoutMotionEnd = finish;
  element.addEventListener("transitionend", finish);
}

function finishPanelMovedItem(element) {
  if (!element.classList.contains("is-layout-settling")) {
    return;
  }

  const isHovered = panelElementHasPointerHover(element);
  if (element.__tuckioLayoutMotionEnd) {
    element.removeEventListener("transitionend", element.__tuckioLayoutMotionEnd);
    element.__tuckioLayoutMotionEnd = null;
  }

  element.classList.remove("is-layout-settling");
  element.classList.add("is-layout-positioned");
  element.style.setProperty("--wp-layout-dx", "0px");
  element.style.setProperty("--wp-layout-dy", "0px");
  if (isHovered) {
    mutePanelLayoutHoverUntilExit(element);
  }
}

function clearPanelMovedItemCleanup(element) {
  element.classList.remove("is-layout-resting");
  element.classList.remove("is-layout-positioned");
  if (element.__tuckioLayoutMotionEnd) {
    element.removeEventListener("transitionend", element.__tuckioLayoutMotionEnd);
    element.__tuckioLayoutMotionEnd = null;
  }
  clearPanelLayoutHoverMute(element);
}

function mutePanelLayoutHoverUntilExit(element) {
  clearPanelLayoutHoverMute(element);
  element.classList.add("is-layout-hover-muted");
  const finish = () => clearPanelLayoutHoverMute(element);
  element.__tuckioLayoutHoverMuteEnd = finish;
  element.addEventListener("pointerleave", finish, { once: true });
}

function clearPanelLayoutHoverMute(element) {
  element.classList.remove("is-layout-hover-muted");
  if (element.__tuckioLayoutHoverMuteEnd) {
    element.removeEventListener("pointerleave", element.__tuckioLayoutHoverMuteEnd);
    element.__tuckioLayoutHoverMuteEnd = null;
  }
}

function panelElementHasPointerHover(element) {
  try {
    return Boolean(element.matches?.(":hover"));
  } catch (_) {
    return false;
  }
}

function renderPanelNewItemSkeleton() {
  return `
    <span class="wp-new-card-skeleton" aria-hidden="true">
      <span class="wp-new-card-skeleton-media"></span>
      <span class="wp-new-card-skeleton-copy">
        <span class="wp-new-card-skeleton-line is-brand"></span>
        <span class="wp-new-card-skeleton-line is-title"></span>
        <span class="wp-new-card-skeleton-line is-price"></span>
      </span>
    </span>
  `;
}
