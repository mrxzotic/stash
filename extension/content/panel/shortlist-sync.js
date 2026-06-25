function syncPanelShortlistToggle(id, active) {
  const root = typeof document === "undefined"
    ? null
    : document.getElementById("tuckio-panel-root")?.shadowRoot;
  if (!root) return;

  if (panelState.shortlistOpen) {
    syncPanelPreservingScroll(root);
    return;
  }

  const item = panelState.items.map(normalizePanelItem).find((candidate) => candidate.id === id);
  root.querySelectorAll("[data-shortlist-id]").forEach((button) => {
    if (button.dataset.shortlistId !== id) return;
    syncPanelShortlistButton(button, item, active);
  });
  syncPanelShortlistFilterChip(root);
}

function syncPanelShortlistViewAfterToggle() {
  const root = typeof document === "undefined"
    ? null
    : document.getElementById("tuckio-panel-root")?.shadowRoot;
  if (root) syncPanelPreservingScroll(root);
  else syncPanelViewStateWithMotion();
}

function syncPanelShortlistButton(button, item, active) {
  const label = active ? "Remove from shortlist" : "Add to shortlist";
  button.classList.toggle("is-active", active);
  button.classList.toggle("is-twinkling", false);
  button.setAttribute("aria-pressed", String(active));
  if (item) {
    const actionLabel = panelItemActionLabel(label, item);
    button.setAttribute("aria-label", actionLabel);
    button.setAttribute("title", actionLabel);
    syncPanelItemRenderSignature(button.closest("[data-panel-item-id]"), item);
  }

  button.classList.remove("is-twinkling");
}

function syncPanelShortlistFilterChip(root) {
  const rail = root.querySelector("[data-filter-rail]");
  if (!rail) return;

  const count = panelShortlistCount();
  const button = rail.querySelector("[data-shortlist-toggle]");
  if (!count) {
    button?.remove();
    syncPanelItemsTopOffset(root);
    return;
  }

  if (!button) {
    rail.insertAdjacentHTML("afterbegin", renderShortlistFilterChip());
    syncPanelItemsTopOffset(root);
    return;
  }

  button.outerHTML = renderShortlistFilterChip();
}

function syncPanelPreservingScroll(root) {
  const scrollTop = root.querySelector(".wp-items")?.scrollTop || 0;
  syncPanelViewStateWithMotion();
  const afterFrame = typeof window === "undefined"
    ? (callback) => callback()
    : window.requestAnimationFrame.bind(window);
  afterFrame(() => {
    const nextRoot = typeof document === "undefined" ? root : document.getElementById("tuckio-panel-root")?.shadowRoot;
    const items = nextRoot?.querySelector(".wp-items");
    if (items) items.scrollTop = scrollTop;
  });
}

function syncPanelItemRenderSignature(node, item) {
  if (!node || !item) return;
  node.dataset.panelRenderSignature = panelItemRenderSignature(item, node.classList.contains("wp-compact-item") ? "compact" : "cards");
}
