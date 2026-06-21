var panelReturnFocusSelector = "";
var PANEL_FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type=\"hidden\"])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

function syncPanelFocusAfterRender(root) {
  focusPanelSearch(root);
  focusCategoryComposer(root);
  focusPanelModal(root);
  restorePanelFocus(root);
}

function focusPanelSearch(root) {
  const search = root.querySelector("[data-search]");
  if (search && panelState.searchOpen) {
    window.requestAnimationFrame(() => {
      focusPanelElement(search);
      search.setSelectionRange(search.value.length, search.value.length);
    });
  }
}

function focusCategoryComposer(root) {
  const input = root.querySelector("[data-category-input]");
  if (input && panelState.categoryComposerOpen) {
    window.requestAnimationFrame(() => {
      focusPanelElement(input);
    });
  }
}

function rememberPanelFocus(target) {
  panelReturnFocusSelector = panelFocusSelector(target) || "";
}

function restorePanelFocus(root) {
  if (!panelReturnFocusSelector || activePanelModal(root) || panelState.searchOpen || panelState.categoryComposerOpen) {
    return;
  }

  const selector = panelReturnFocusSelector;
  panelReturnFocusSelector = "";
  window.requestAnimationFrame(() => {
    focusPanelElement(root.querySelector(selector) || root.querySelector(PANEL_FOCUSABLE_SELECTOR));
  });
}

function focusPanelModal(root) {
  const modal = activePanelModal(root);
  if (!modal) {
    return;
  }

  window.requestAnimationFrame(() => {
    focusPanelElement(modal.querySelector("[data-autofocus]") || panelFocusableElements(modal)[0]);
  });
}

function trapPanelModalFocus(root, event) {
  const modal = activePanelModal(root);
  if (!modal || event.key !== "Tab") {
    return false;
  }

  const focusable = panelFocusableElements(modal);
  if (!focusable.length) {
    event.preventDefault();
    return true;
  }

  const active = root.activeElement || document.activeElement;
  const currentIndex = focusable.indexOf(active);
  const step = event.shiftKey ? -1 : 1;
  const nextIndex = currentIndex < 0
    ? 0
    : (currentIndex + step + focusable.length) % focusable.length;
  event.preventDefault();
  focusPanelElement(focusable[nextIndex]);
  return true;
}

function activePanelModal(root) {
  return root.querySelector("[aria-modal=\"true\"]");
}

function panelFocusableElements(container) {
  return Array.from(container.querySelectorAll(PANEL_FOCUSABLE_SELECTOR))
    .filter((element) =>
      !element.hidden &&
      !element.closest("[hidden]") &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.tabIndex !== -1
    );
}

function focusPanelElement(element) {
  if (!element?.focus) {
    return;
  }

  try {
    element.focus({ preventScroll: true });
  } catch {
    element.focus();
  }
}

function panelFocusSelector(element) {
  if (!element?.getAttribute) {
    return "";
  }

  const attrs = [
    "data-edit-id",
    "data-archive-id",
    "data-restore-id",
    "data-remove-id",
    "data-remove-category-prompt",
    "data-founder-promo-trigger",
    "data-panel-search",
    "data-panel-overflow-trigger",
    "data-panel-compact-toggle",
    "data-panel-theme-toggle",
    "data-archive-view-toggle",
    "data-brand-cloud-toggle",
    "data-filter-menu-trigger",
    "data-panel-filter-reset",
    "data-category"
  ];
  const attr = attrs.find((name) => element.hasAttribute(name));
  if (!attr) {
    return "";
  }

  const value = element.getAttribute(attr);
  return value ? `[${attr}="${panelCssEscape(value)}"]` : `[${attr}]`;
}

function panelCssEscape(value) {
  try {
    return CSS.escape(String(value));
  } catch {
    return String(value).replace(/["\\]/g, "\\$&");
  }
}

function panelItemAccessibleName(item) {
  const brand = cleanText(item?.brand || item?.source || sourceNameFromUrl(item?.url));
  const title = cleanText(item?.title);
  return cleanText(`${brand} ${title}`) || title || brand || "saved item";
}

function panelItemActionLabel(action, item) {
  return `${action} ${panelItemAccessibleName(item)}`;
}

function panelProductImageAlt(item) {
  return `${panelItemAccessibleName(item)} product image`;
}
