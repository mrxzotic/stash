function bindPanelDismissEvents(root) {
  root.querySelector("[data-panel-close]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeStashPanel();
  });

  const current = window.__stashPanelDismiss;
  if (current?.root === root) {
    return;
  }

  unbindPanelDismissEvents();
  const listener = (event) => handlePanelDocumentPointerDown(root, event);
  window.__stashPanelDismiss = { root, listener };
  document.addEventListener("pointerdown", listener, true);
}

function unbindPanelDismissEvents(root) {
  const current = window.__stashPanelDismiss;
  if (!current || (root && current.root !== root)) {
    return;
  }

  document.removeEventListener("pointerdown", current.listener, true);
  window.__stashPanelDismiss = null;
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

  closeStashPanel();
}
