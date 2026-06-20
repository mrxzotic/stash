var SAVED_OVERLAY_DURATION_MS = 8000;

function showSavedOverlay(item, items, categories = DEFAULT_CATEGORIES) {
  const root = getOverlayRoot();
  const dismiss = () => dismissSavedOverlay(root);

  clearOverlayTimers(root);
  root.innerHTML = `
    <style>${overlayStyles()}</style>
    <section class="wl-panel" aria-live="polite" style="--wl-dismiss-duration: ${SAVED_OVERLAY_DURATION_MS}ms">
      <div class="wl-progress" aria-hidden="true"><span></span></div>
      <button class="wl-close" type="button" aria-label="Close" title="Close" data-close-overlay>
        ${lucideXIcon("wl-close-icon")}
      </button>
      <header class="wl-header">
        <p class="wl-kicker">Saved</p>
        <div class="wl-timer-row">
          <p class="wl-countdown" data-countdown aria-hidden="true">Closes in ${Math.ceil(SAVED_OVERLAY_DURATION_MS / 1000)}s</p>
          <button class="wl-timer-button" type="button" data-toggle-timer aria-label="Pause timer" aria-pressed="false" title="Pause timer">
            ${lucidePauseIcon("wl-timer-icon")}
          </button>
        </div>
      </header>
      <article class="wl-item">
        <div class="wl-image">${item.imageUrl ? `<img src="${escapeAttribute(item.imageUrl)}" alt="" referrerpolicy="no-referrer">` : lucideImageIcon("wl-image-placeholder")}</div>
        <dl class="wl-fields">${renderSavedOverlayFields(item)}</dl>
      </article>
      <div class="wl-actions">
        <button class="wl-edit-button" type="button" data-edit-saved-item>
          ${lucidePencilIcon("wl-button-icon")}
          <span>Edit</span>
        </button>
        <button class="wl-open-button" type="button" data-open-stash>
          ${lucideLinkIcon("wl-button-icon")}
          <span>Open Stash</span>
        </button>
        <button class="wl-cancel-button" type="button" data-cancel-addition>
          <span>Undo</span>
        </button>
      </div>
    </section>
  `;

  root.querySelector("[data-close-overlay]")?.addEventListener("click", dismiss);
  root.querySelector("[data-toggle-timer]")?.addEventListener("click", () => {
    toggleSavedOverlayTimer(root);
  });
  root.querySelector("[data-open-stash]")?.addEventListener("click", () => {
    dismissSavedOverlay(root);
    safelyRunPanelAction(() => openStashPanel());
  });
  root.querySelector("[data-edit-saved-item]")?.addEventListener("click", () => {
    safelyRunPanelAction(() => openSavedOverlayEditor(root, item));
  });
  root.querySelector("[data-cancel-addition]")?.addEventListener("click", () => {
    safelyRunPanelAction(() => cancelSavedOverlayAddition(root, item));
  });
  root.querySelector(".wl-fields")?.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-field-alternative]");
    if (!button) {
      return;
    }

    safelyRunPanelAction(() =>
      applySavedOverlayAlternative(item, categories, button.dataset.field, button.dataset.index)
    );
  });
  bindImageFallbacks(root);
  startSavedOverlayCountdown(root, SAVED_OVERLAY_DURATION_MS);
}

async function openSavedOverlayEditor(root, item) {
  const itemId = item.id || productId(item.url);
  dismissSavedOverlay(root);
  await openStashPanel();
  const savedItem = panelState.items
    .map(normalizePanelItem)
    .find((panelItem) => panelItem.id === itemId);

  if (!savedItem) {
    return;
  }

  panelState.editItemId = savedItem.id;
  panelState.highlightedItemId = savedItem.id;
  panelState.archivedOpen = false;
  panelState.brandCloudOpen = false;
  panelState.brandFilterKey = "";
  panelState.brandFilterLabel = "";
  panelState.searchOpen = false;
  panelState.searchQuery = "";
  panelState.categoryComposerOpen = false;
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  if (panelState.activeCategory !== "all" && panelState.activeCategory !== savedItem.category) {
    panelState.activeCategory = savedItem.category;
  }
  renderStashPanel();
}

function showErrorOverlay(error) {
  const root = getOverlayRoot();
  clearOverlayTimers(root);
  root.innerHTML = `
    <style>${overlayStyles()}</style>
    <div class="wl-error">
      <strong>Could not save this item</strong>
      <span>${escapeHtml(error.message || "Try a product page or product card.")}</span>
    </div>
  `;
  window.clearTimeout(root.__stashTimer);
  root.__stashTimer = window.setTimeout(() => {
    root.innerHTML = "";
  }, 2600);
}

function startSavedOverlayCountdown(root, durationMs) {
  const countdown = root.querySelector("[data-countdown]");
  let countdownText = "";
  const renderCountdown = () => {
    const state = root.__stashCountdown;
    if (!state || state.paused) {
      return;
    }

    state.remainingMs = Math.max(0, state.endsAt - Date.now());
    const remainingSeconds = Math.ceil(state.remainingMs / 1000);
    const nextText = `Closes in ${remainingSeconds}s`;
    if (countdown && nextText !== countdownText) {
      countdown.textContent = nextText;
      countdownText = nextText;
    }
  };

  root.__stashCountdown = {
    durationMs,
    endsAt: Date.now() + durationMs,
    paused: false,
    remainingMs: durationMs
  };
  renderCountdown();
  root.__stashTicker = window.setInterval(renderCountdown, 250);
  root.__stashTimer = window.setTimeout(() => dismissSavedOverlay(root), durationMs);
}

function toggleSavedOverlayTimer(root) {
  if (root.__stashCountdown?.paused) {
    resumeSavedOverlayTimer(root);
    return;
  }

  pauseSavedOverlayTimer(root);
}

function pauseSavedOverlayTimer(root) {
  const state = root.__stashCountdown;
  if (!state) {
    return;
  }

  state.remainingMs = Math.max(0, state.endsAt - Date.now());
  state.paused = true;
  clearOverlayTimers(root);
  root.__stashCountdown = state;
  root.querySelector(".wl-panel")?.classList.add("is-timer-paused");

  const countdown = root.querySelector("[data-countdown]");
  if (countdown) {
    countdown.textContent = "Paused";
  }

  const button = root.querySelector("[data-toggle-timer]");
  if (button) {
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", "Resume timer");
    button.setAttribute("title", "Resume timer");
    button.innerHTML = lucidePlayIcon("wl-timer-icon");
  }
}

function resumeSavedOverlayTimer(root) {
  const state = root.__stashCountdown;
  if (!state) {
    return;
  }

  const durationMs = Math.max(0, state.remainingMs || state.durationMs || SAVED_OVERLAY_DURATION_MS);
  root.querySelector(".wl-panel")?.classList.remove("is-timer-paused");
  const button = root.querySelector("[data-toggle-timer]");
  if (button) {
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Pause timer");
    button.setAttribute("title", "Pause timer");
    button.innerHTML = lucidePauseIcon("wl-timer-icon");
  }
  startSavedOverlayCountdown(root, durationMs);
}

async function cancelSavedOverlayAddition(root, item) {
  const stored = await getLocalStorageValue(STORAGE_KEY);
  const currentItems = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
  const itemId = item.id || productId(item.url);
  const itemUrl = normalizeUrl(item.url);
  const nextItems = currentItems.filter((savedItem) => {
    const savedUrl = normalizeUrl(savedItem.url);
    const savedId = savedItem.id || productId(savedUrl);
    return savedId !== itemId && savedUrl !== itemUrl;
  });

  await setLocalStorageValue(STORAGE_KEY, nextItems);
  if (Array.isArray(panelState.items)) {
    panelState.items = nextItems;
  }
  if (panelState.open) {
    renderStashPanel();
  }
  dismissSavedOverlay(root);
}

function dismissSavedOverlay(root) {
  clearOverlayTimers(root);
  root.innerHTML = "";
}

function clearOverlayTimers(root) {
  window.clearTimeout(root.__stashTimer);
  window.clearInterval(root.__stashTicker);
  root.__stashTimer = 0;
  root.__stashTicker = 0;
}

function getOverlayRoot() {
  let host = document.getElementById("stash-extension-root");
  if (!host) {
    host = document.createElement("div");
    host.id = "stash-extension-root";
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "2147483647";
    host.style.pointerEvents = "none";
    document.documentElement.appendChild(host);
  }

  if (!host.shadowRoot) {
    host.attachShadow({ mode: "open" });
  }

  return host.shadowRoot;
}

function getPanelRoot() {
  let host = document.getElementById("stash-panel-root");
  if (!host) {
    host = document.createElement("div");
    host.id = "stash-panel-root";
    host.style.position = "fixed";
    host.style.inset = "0";
    host.style.zIndex = "2147483646";
    host.style.pointerEvents = "none";
    document.documentElement.appendChild(host);
  }

  if (!host.shadowRoot) {
    host.attachShadow({ mode: "open" });
  }

  return host.shadowRoot;
}
