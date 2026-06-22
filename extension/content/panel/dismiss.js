function bindPanelDismissEvents(root) {
  root.querySelector("[data-panel-close]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeTuckioPanel();
  });

  const current = window.__tuckioPanelDismiss;
  if (current?.root === root) {
    return;
  }

  unbindPanelDismissEvents();
  const insideListener = () => cancelPendingPanelDismiss(root);
  const listener = (event) => handlePanelDocumentPointerDown(root, event);
  window.__tuckioPanelDismiss = { root, listener, insideListener, outsideTimer: 0 };
  root.addEventListener("pointerdown", insideListener, true);
  document.addEventListener("pointerdown", listener, true);
}

function unbindPanelDismissEvents(root) {
  const current = window.__tuckioPanelDismiss;
  if (!current || (root && current.root !== root)) {
    return;
  }

  document.removeEventListener("pointerdown", current.listener, true);
  current.root?.removeEventListener?.("pointerdown", current.insideListener, true);
  window.clearTimeout(current.outsideTimer);
  window.__tuckioPanelDismiss = null;
}

function cancelPendingPanelDismiss(root) {
  const current = window.__tuckioPanelDismiss;
  if (!current || current.root !== root || !current.outsideTimer) {
    return;
  }

  window.clearTimeout(current.outsideTimer);
  current.outsideTimer = 0;
}

function handlePanelDocumentPointerDown(root, event) {
  if (!panelState.open) {
    unbindPanelDismissEvents(root);
    return;
  }

  if (event.button !== undefined && event.button !== 0) {
    return;
  }

  const shell = root.querySelector(".wp-shell");
  const target = event.target;
  const path = event.composedPath?.() || [];
  if (
    !shell ||
    target === root.host ||
    path.includes(shell) ||
    path.includes(root.host)
  ) {
    return;
  }

  schedulePanelOutsideDismiss(root);
}

function schedulePanelOutsideDismiss(root) {
  const current = window.__tuckioPanelDismiss;
  if (!current || current.root !== root) {
    return;
  }

  window.clearTimeout(current.outsideTimer);
  current.outsideTimer = window.setTimeout(() => {
    if (window.__tuckioPanelDismiss !== current || !panelState.open) {
      return;
    }

    current.outsideTimer = 0;
    closeTuckioPanel();
  }, 0);
}
