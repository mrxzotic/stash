function bindPanelExportEvents(root) {
  root.querySelector("[data-export-backup]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!panelState.items.length) {
      return;
    }

    safelyRunPanelAction(exportStashBackup);
  });
}

function exportStashBackup() {
  const backup = {
    schema: "stash.backup.v1",
    exportedAt: new Date().toISOString(),
    extensionVersion: chrome.runtime?.getManifest?.().version || "",
    items: Array.isArray(panelState.items) ? panelState.items : [],
    categories: normalizeCategories(panelState.categories),
    settings: normalizePanelSettings({
      summaryCurrency: panelState.summaryCurrency,
      backgroundTheme: panelState.backgroundTheme,
      compactView: panelState.compactView
    })
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `stash-backup-${backup.exportedAt.slice(0, 10)}.json`;
  link.rel = "noreferrer";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
