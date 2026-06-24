function bindPanelResetEvents(root) {
  root.querySelectorAll("[data-reset-confirm-root]").forEach((resetRoot) => {
    if (resetRoot.__tuckioResetBound) {
      return;
    }

    const start = resetRoot.querySelector("[data-reset-start]");
    const input = resetRoot.querySelector("[data-reset-confirm-input]");
    const confirm = resetRoot.querySelector("[data-reset-confirm]");
    const cancel = resetRoot.querySelector("[data-reset-cancel]");

    start?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (resetRoot.classList.contains("is-confirming")) {
        closeFounderResetConfirm(resetRoot);
        return;
      }
      openFounderResetConfirm(resetRoot);
    });

    input?.addEventListener("input", () => syncFounderResetConfirm(resetRoot));
    input?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !confirm?.disabled) {
        event.preventDefault();
        safelyRunPanelAction(() => confirmTuckioDataReset(resetRoot));
      }
    });
    confirm?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      safelyRunPanelAction(() => confirmTuckioDataReset(resetRoot));
    });
    cancel?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeFounderResetConfirm(resetRoot);
    });

    resetRoot.__tuckioResetBound = true;
  });
}

function openFounderResetConfirm(resetRoot) {
  const panel = resetRoot.querySelector("[data-reset-confirm-panel]");
  const input = resetRoot.querySelector("[data-reset-confirm-input]");
  const cancel = resetRoot.querySelector("[data-reset-cancel]");
  const start = resetRoot.querySelector("[data-reset-start]");

  resetRoot.classList.add("is-confirming");
  resetRoot.setAttribute("aria-expanded", "true");
  start?.setAttribute("aria-expanded", "true");
  panel?.setAttribute("aria-hidden", "false");
  if (input) input.disabled = false;
  if (cancel) cancel.disabled = false;
  syncFounderResetConfirm(resetRoot);
  window.requestAnimationFrame(() => focusPanelElement(input));
}

function closeFounderResetConfirm(resetRoot) {
  const panel = resetRoot.querySelector("[data-reset-confirm-panel]");
  const input = resetRoot.querySelector("[data-reset-confirm-input]");
  const confirm = resetRoot.querySelector("[data-reset-confirm]");
  const cancel = resetRoot.querySelector("[data-reset-cancel]");
  const start = resetRoot.querySelector("[data-reset-start]");

  resetRoot.classList.remove("is-confirming", "is-resetting");
  resetRoot.setAttribute("aria-expanded", "false");
  start?.setAttribute("aria-expanded", "false");
  panel?.setAttribute("aria-hidden", "true");
  if (input) {
    input.value = "";
    input.disabled = true;
  }
  if (confirm) confirm.disabled = true;
  if (cancel) cancel.disabled = true;
}

function syncFounderResetConfirm(resetRoot) {
  const input = resetRoot.querySelector("[data-reset-confirm-input]");
  const confirm = resetRoot.querySelector("[data-reset-confirm]");
  if (!confirm) {
    return;
  }

  confirm.disabled = input?.value.trim() !== TUCKIO_RESET_CONFIRM_WORD;
}

async function confirmTuckioDataReset(resetRoot) {
  const input = resetRoot.querySelector("[data-reset-confirm-input]");
  if (input?.value.trim() !== TUCKIO_RESET_CONFIRM_WORD) {
    syncFounderResetConfirm(resetRoot);
    return;
  }

  resetRoot.classList.add("is-resetting");
  await resetTuckioLocalData();
}

async function resetTuckioLocalData() {
  try {
    await chrome.storage.local.remove(Array.from(ALLOWED_STORAGE_KEYS));
  } catch (error) {
    error.title = t("Could not reset Tuckio");
    throw error;
  }
  resetPanelStateAfterDataReset();
  renderTuckioPanel();
}

function resetPanelStateAfterDataReset() {
  Object.assign(panelState, {
    searchOpen: false,
    settingsOpen: false,
    categoryComposerOpen: false,
    deleteCategoryId: "",
    deleteItemId: "",
    editItemId: "",
    decisionItemId: "",
    decisionDragItemId: "",
    shortlistOpen: false,
    archivedOpen: false,
    brandCloudOpen: false,
    brandCloudSortList: false,
    filterMenuOpen: false,
    sortMenuOpen: false,
    brandFilterKey: "",
    brandFilterLabel: "",
    activeCategory: "all",
    searchQuery: "",
    founderPromoOpen: false,
    items: [],
    categories: normalizeCategories(DEFAULT_CATEGORIES),
    summaryCurrency: DEFAULT_SETTINGS.summaryCurrency,
    summaryRate: fallbackSummaryRate(DEFAULT_SETTINGS.summaryCurrency),
    summaryRateLoading: "",
    backgroundTheme: DEFAULT_SETTINGS.backgroundTheme,
    compactView: DEFAULT_SETTINGS.compactView,
    hoverHints: DEFAULT_SETTINGS.hoverHints,
    language: DEFAULT_SETTINGS.language,
    highlightedItemId: "",
    displacedItemId: ""
  });
}
