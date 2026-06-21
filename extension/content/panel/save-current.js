function renderPanelSaveCurrentTrigger() {
  return `
    <button class="wp-brand-save" type="button" aria-label="Save current item" title="Save current item" data-panel-save-current>
      ${lucidePlusIcon("wp-brand-save-icon")}
    </button>
  `;
}

function bindPanelSaveCurrentEvents(root) {
  root.querySelector("[data-panel-save-current]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    void saveCurrentPanelItem(event.currentTarget);
  });
}

async function saveCurrentPanelItem(button) {
  if (button?.disabled) {
    return;
  }

  const previousContextTarget = lastContextTarget;
  const previousContextPoint = lastContextPoint;
  lastContextTarget = null;
  lastContextPoint = { x: -1, y: -1 };

  try {
    setPanelSaveCurrentButtonSaving(button, true);
    await saveCurrentProduct({
      category: "auto",
      context: { pageUrl: location.href }
    });
  } catch (error) {
    setPanelSaveCurrentButtonSaving(button, false);
    showErrorOverlay(error);
  } finally {
    lastContextTarget = previousContextTarget;
    lastContextPoint = previousContextPoint;
  }
}

function setPanelSaveCurrentButtonSaving(button, isSaving) {
  if (!button) {
    return;
  }

  button.disabled = isSaving;
  button.classList.toggle("is-saving", isSaving);
  button.setAttribute("aria-label", isSaving ? "Saving current item" : "Save current item");
  button.setAttribute("title", isSaving ? "Saving current item" : "Save current item");
}
