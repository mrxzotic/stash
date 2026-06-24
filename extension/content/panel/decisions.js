var PANEL_DECISION_BOUGHT = "bought";
var PANEL_DECISION_SKIPPED = "skipped";
var PANEL_DECISION_DELETE = "delete";
var PANEL_DECISION_STATES = new Set([PANEL_DECISION_BOUGHT, PANEL_DECISION_SKIPPED]);

function renderPanelCardActions(item) {
  const isArchived = isPanelItemArchived(item);
  if (isArchived) {
    return `
      <button class="wp-restore" type="button" title="${escapeAttribute(panelItemActionLabel("Restore", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Restore", item))}" data-restore-id="${escapeAttribute(item.id)}">${phosphorUndoIcon("wp-card-action-icon")}</button>
      <button class="wp-remove" type="button" title="${escapeAttribute(panelItemActionLabel("Delete", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Delete", item))}" data-remove-id="${escapeAttribute(item.id)}">${phosphorXIcon("wp-card-action-icon")}</button>
    `;
  }

  return `
    ${renderPanelShortlistButton(item)}
    <button class="wp-edit" type="button" title="${escapeAttribute(panelItemActionLabel("Edit", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Edit", item))}" data-edit-id="${escapeAttribute(item.id)}">${phosphorPencilIcon("wp-card-action-icon")}</button>
    <button class="wp-archive" type="button" title="${escapeAttribute(panelItemActionLabel("Decide", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Decide", item))}" aria-expanded="${panelState.decisionItemId === item.id}" data-decision-menu-id="${escapeAttribute(item.id)}">${phosphorArchiveIcon("wp-card-action-icon")}</button>
  `;
}

function renderPanelCompactActions(item) {
  const isArchived = isPanelItemArchived(item);
  if (isArchived) {
    return `
      <button class="wp-restore" type="button" title="${escapeAttribute(panelItemActionLabel("Restore", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Restore", item))}" data-restore-id="${escapeAttribute(item.id)}">${phosphorUndoIcon("wp-card-action-icon")}</button>
      <button class="wp-remove" type="button" title="${escapeAttribute(panelItemActionLabel("Delete", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Delete", item))}" data-remove-id="${escapeAttribute(item.id)}">${phosphorXIcon("wp-card-action-icon")}</button>
    `;
  }

  return `
    ${renderPanelShortlistButton(item)}
    <button class="wp-edit" type="button" title="${escapeAttribute(panelItemActionLabel("Edit", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Edit", item))}" data-edit-id="${escapeAttribute(item.id)}">${phosphorPencilIcon("wp-card-action-icon")}</button>
    <button class="wp-archive" type="button" title="${escapeAttribute(panelItemActionLabel("Decide", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Decide", item))}" aria-expanded="${panelState.decisionItemId === item.id}" data-decision-menu-id="${escapeAttribute(item.id)}">${phosphorArchiveIcon("wp-card-action-icon")}</button>
  `;
}

function renderPanelShortlistButton(item) {
  const active = panelItemIsShortlisted(item);
  const label = active ? "Remove from shortlist" : "Add to shortlist";
  return `
    <button class="wp-shortlist${active ? " is-active" : ""}" type="button" title="${escapeAttribute(panelItemActionLabel(label, item))}" aria-label="${escapeAttribute(panelItemActionLabel(label, item))}" aria-pressed="${active}" data-shortlist-id="${escapeAttribute(item.id)}">${phosphorStarIcon("wp-card-action-icon")}</button>
  `;
}

function renderPanelDecisionScrim() {
  return `<div class="wp-decision-scrim" aria-hidden="true" data-decision-cancel></div>`;
}

function renderPanelDecisionDropTray() {
  return `
    <div class="wp-decision-drop-tray" role="group" aria-label="${escapeAttribute(t("Drop to decide"))}" data-decision-drop-tray>
      ${panelDecisionActions().map((action) => renderPanelDecisionPill("", action, { drop: true })).join("")}
    </div>
  `;
}

function renderPanelDecisionStatus(item) {
  if (!isPanelItemArchived(item)) {
    return "";
  }

  const state = panelItemDecisionState(item);
  const action = panelDecisionActions().find((candidate) => candidate.id === state);
  if (!action) {
    return "";
  }

  return `
    <span class="wp-decision-status ${escapeAttribute(action.className)}">
      ${renderPanelDecisionIcon(action)}
      <span>${escapeHtml(t(action.label))}</span>
    </span>
  `;
}

function renderPanelDecisionPill(itemId, action, options = {}) {
  const data = options.drop
    ? `data-decision-drop-action="${escapeAttribute(action.id)}"`
    : `data-panel-decision="${escapeAttribute(action.id)}" data-decision-id="${escapeAttribute(itemId)}"`;
  return `
    <button class="wp-decision-pill ${escapeAttribute(action.className)}" type="button" ${data}>
      ${renderPanelDecisionIcon(action)}
      <span>${escapeHtml(t(action.label))}</span>
    </button>
  `;
}

function renderPanelDecisionIcon(action) {
  if (action.id === PANEL_DECISION_BOUGHT) {
    return phosphorCheckIcon("wp-decision-pill-icon");
  }
  if (action.id === PANEL_DECISION_DELETE) {
    return phosphorTrashIcon("wp-decision-pill-icon");
  }
  return phosphorArchiveIcon("wp-decision-pill-icon");
}

function panelDecisionActions() {
  return [
    { id: PANEL_DECISION_BOUGHT, label: "Bought", className: "is-bought" },
    { id: PANEL_DECISION_SKIPPED, label: "Archive", className: "is-skipped" },
    { id: PANEL_DECISION_DELETE, label: "Delete", className: "is-delete" }
  ];
}

function closePanelDecisionTray() {
  panelState.decisionItemId = "";
  panelState.decisionDragItemId = "";
}

function togglePanelDecisionTray(id) {
  panelState.decisionItemId = panelState.decisionItemId === id ? "" : id;
  panelState.decisionDragItemId = "";
  syncPanelDecisionMode();
}

function syncPanelDecisionMode(root = typeof document === "undefined" ? null : document.getElementById("tuckio-panel-root")?.shadowRoot) {
  if (!root) return;
  const activeId = panelState.decisionItemId || "";
  const dragId = panelState.decisionDragItemId || "";
  const shell = root.querySelector(".wp-shell");
  shell?.classList.toggle("is-decision-mode", Boolean(activeId));
  shell?.classList.toggle("is-decision-dragging", Boolean(dragId));
  if (!dragId) {
    root.querySelectorAll(".is-decision-drag-source").forEach((item) => {
      item.classList.remove("is-decision-drag-source");
    });
  }
  root.querySelectorAll("[data-decision-menu-id]").forEach((button) => {
    button.setAttribute("aria-expanded", String(button.dataset.decisionMenuId === activeId));
  });
}

function panelDecisionTargetId() {
  return panelState.decisionDragItemId || panelState.decisionItemId || "";
}

function openPanelArchivedDecisionList() {
  panelState.archivedOpen = true;
  panelState.shortlistOpen = false;
  panelState.brandCloudOpen = false;
  panelState.brandCloudSortList = false;
  panelState.brandFilterKey = "";
  panelState.brandFilterLabel = "";
  panelState.searchOpen = false;
  panelState.searchQuery = "";
  panelState.activeCategory = "all";
  panelState.filterMenuOpen = false;
  panelState.sortMenuOpen = false;
  panelState.categoryComposerOpen = false;
}

function panelItemIsShortlisted(item) {
  return Boolean(cleanText(item?.shortlistedAt) || item?.userFacts?.priority === "shortlist");
}

function panelShortlistedItems(items = panelState.items) {
  return panelActiveItems(items).filter(panelItemIsShortlisted);
}

function panelShortlistCount(items = panelState.items) {
  return panelShortlistedItems(items).length;
}

function panelItemMatchesShortlistFilter(item) {
  return !panelState.shortlistOpen || panelItemIsShortlisted(item);
}

function panelDecisionState(value) {
  const state = cleanText(value).toLowerCase();
  return PANEL_DECISION_STATES.has(state) ? state : "";
}

function panelItemDecisionState(item) {
  return panelDecisionState(item?.decision?.state || item?.decisionState);
}
