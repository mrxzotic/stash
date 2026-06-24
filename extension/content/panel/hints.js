var PANEL_HINT_DELAY_MS = 760;
var PANEL_HINT_FOCUS_DELAY_MS = 520;
var PANEL_HINT_HIDE_MS = 160;

function bindPanelHintEvents(root) {
  const filters = root.querySelector(".wp-filters");
  const shell = root.querySelector(".wp-shell");
  if (!filters || !shell) {
    return;
  }

  filters.addEventListener("pointerover", (event) => {
    if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") {
      return;
    }
    schedulePanelHint(root, panelHintTarget(event.target), PANEL_HINT_DELAY_MS);
  });

  filters.addEventListener("pointerout", (event) => {
    const control = panelHintTarget(event.target);
    if (control && event.relatedTarget && control.contains(event.relatedTarget)) {
      return;
    }
    hidePanelHint(root);
  });

  filters.addEventListener("focusin", (event) => {
    schedulePanelHint(root, panelHintTarget(event.target), PANEL_HINT_FOCUS_DELAY_MS);
  });

  filters.addEventListener("focusout", (event) => {
    const control = panelHintTarget(event.target);
    if (control && event.relatedTarget && control.contains(event.relatedTarget)) {
      return;
    }
    hidePanelHint(root);
  });

  filters.addEventListener("pointerdown", () => hidePanelHint(root), true);
  filters.addEventListener("scroll", () => hidePanelHint(root), { passive: true });
  shell.addEventListener("mouseleave", () => hidePanelHint(root));
}

function panelHintTarget(target) {
  const control = target?.closest?.("[data-panel-hint]");
  return control?.dataset?.panelHint ? control : null;
}

function schedulePanelHint(root, control, delay) {
  window.clearTimeout(root.__tuckioHintTimer);
  window.clearTimeout(root.__tuckioHintHideTimer);
  if (!panelHoverHintsEnabled()) {
    hidePanelHint(root);
    return;
  }
  if (!control || control.getAttribute("aria-expanded") === "true") {
    hidePanelHint(root);
    return;
  }

  root.__tuckioHintTarget = control;
  root.__tuckioHintTimer = window.setTimeout(() => showPanelHint(root, control), delay);
}

function showPanelHint(root, control) {
  if (!panelHoverHintsEnabled() || root.__tuckioHintTarget !== control || control?.getAttribute("aria-expanded") === "true") {
    return;
  }

  const layer = root.querySelector("[data-panel-hint-layer]");
  const shell = root.querySelector(".wp-shell");
  const text = control?.dataset?.panelHint || "";
  if (!layer || !shell || !text) {
    return;
  }

  const shellRect = shell.getBoundingClientRect();
  const controlRect = control.getBoundingClientRect();
  layer.textContent = text;
  layer.hidden = false;
  layer.classList.remove("is-visible");
  layer.style.setProperty("--wp-hint-x", "0px");
  layer.style.setProperty("--wp-hint-y", "0px");

  const hintRect = layer.getBoundingClientRect();
  const width = Math.ceil(hintRect.width);
  const height = Math.ceil(hintRect.height);
  const x = clampPanelHintPosition(
    controlRect.left - shellRect.left + controlRect.width / 2 - width / 2,
    12,
    Math.max(12, shellRect.width - width - 12)
  );
  const y = panelHintVerticalPosition(shellRect, controlRect, height);
  layer.style.setProperty("--wp-hint-x", `${Math.round(x)}px`);
  layer.style.setProperty("--wp-hint-y", `${Math.round(y)}px`);

  window.requestAnimationFrame(() => {
    if (root.__tuckioHintTarget === control) {
      layer.classList.add("is-visible");
    }
  });
}

function hidePanelHint(root) {
  window.clearTimeout(root.__tuckioHintTimer);
  root.__tuckioHintTarget = null;
  const layer = root.querySelector("[data-panel-hint-layer]");
  if (!layer) {
    return;
  }

  layer.classList.remove("is-visible");
  window.clearTimeout(root.__tuckioHintHideTimer);
  root.__tuckioHintHideTimer = window.setTimeout(() => {
    if (!layer.classList.contains("is-visible")) {
      layer.hidden = true;
    }
  }, PANEL_HINT_HIDE_MS);
}

function panelHintVerticalPosition(shellRect, controlRect, hintHeight) {
  const below = controlRect.bottom - shellRect.top + 8;
  if (below + hintHeight <= shellRect.height - 12) {
    return below;
  }
  return Math.max(12, controlRect.top - shellRect.top - hintHeight - 8);
}

function clampPanelHintPosition(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function panelHoverHintsEnabled() {
  return panelState.hoverHints !== false;
}
