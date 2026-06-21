var PANEL_REBUILD_MOTION_MS = 620;

function panelRebuildMotionKind(kind) {
  return ["search", "view", "theme"].includes(kind) ? kind : "";
}

function panelRebuildMotionClass(kind) {
  const motionKind = panelRebuildMotionKind(kind);
  return motionKind ? ` is-rebuilding is-${motionKind}-rebuild` : "";
}

function renderStashPanelWithMotion(kind, options = {}) {
  panelState.rebuildMotion = panelRebuildMotionKind(kind);
  renderStashPanel(options);
}

function renderPanelTopbarOnly(root, kind = "search") {
  const topbar = root?.querySelector(".wp-topbar");
  if (!topbar) {
    renderStashPanelWithMotion(kind);
    return;
  }

  syncPanelWithRebuildMotion(root, kind, () => {
    topbar.className = `wp-topbar${panelState.searchOpen ? " is-searching" : ""}`;
    topbar.innerHTML = panelState.searchOpen
      ? renderPanelSearchHtml()
      : renderPanelSummaryHtml(panelSummaryItems(panelState.items));
    bindPanelTopbarEvents(root);
  });
}

function bindPanelTopbarEvents(root) {
  bindPanelSearchEvents(root);
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
  update();
  shell.classList.add("is-rebuilding", `is-${motionKind}-rebuild`);
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
    clearPanelRebuildMotion(root || document.getElementById("stash-panel-root")?.shadowRoot);
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

  shell.classList.remove("is-rebuilding", "is-search-rebuild", "is-view-rebuild", "is-theme-rebuild");
}

function capturePanelItemLayout(root) {
  const rects = new Map();
  root?.querySelectorAll?.("[data-panel-item-id]").forEach((element) => {
    const id = element.dataset.panelItemId;
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
    root?.querySelector(".wp-items")?.classList.contains("is-brand-cloud") ||
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
  ) {
    return;
  }

  window.requestAnimationFrame(() => {
    root.querySelectorAll("[data-panel-item-id]").forEach((element) => {
      animatePanelItemFromPreviousRect(element, previousRects.get(element.dataset.panelItemId));
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

  element.classList.remove("is-layout-settling");
  element.classList.add("is-layout-moving");
  element.style.setProperty("--wp-layout-dx", `${dx.toFixed(2)}px`);
  element.style.setProperty("--wp-layout-dy", `${dy.toFixed(2)}px`);
  element.style.setProperty("--wp-layout-scale", ".998");
  element.getBoundingClientRect();
  window.requestAnimationFrame(() => settlePanelMovedItem(element));
}

function settlePanelMovedItem(element) {
  element.classList.remove("is-layout-moving");
  element.classList.add("is-layout-settling");
  element.style.setProperty("--wp-layout-dx", "0px");
  element.style.setProperty("--wp-layout-dy", "0px");
  element.style.setProperty("--wp-layout-scale", "1");
  window.setTimeout(() => {
    element.classList.remove("is-layout-settling");
    element.style.removeProperty("--wp-layout-dx");
    element.style.removeProperty("--wp-layout-dy");
    element.style.removeProperty("--wp-layout-scale");
  }, 620);
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
