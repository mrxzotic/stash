var SAVED_OVERLAY_DURATION_MS = 8000;

function showSavedOverlay(item, items, categories = DEFAULT_CATEGORIES) {
  const root = getOverlayRoot();
  const dismiss = () => dismissSavedOverlay(root);

  clearOverlayTimers(root);
  unbindSavedOverlayImageEvents(root);
  root.innerHTML = `
    <style>${overlayStyles()}</style>
    <section class="wl-panel is-motion-reveal" aria-live="polite" style="--wl-dismiss-duration: ${SAVED_OVERLAY_DURATION_MS}ms">
      ${renderSavedOverlaySkeleton()}
      <header class="wl-header">
        <div class="wl-title-block">
          <p class="wl-kicker">Saved</p>
          <div class="wl-timer-line">
            <p class="wl-countdown" data-countdown aria-hidden="true">Auto-close in ${Math.ceil(SAVED_OVERLAY_DURATION_MS / 1000)}s</p>
            <button class="wl-timer-button" type="button" data-toggle-timer aria-label="Pause auto-close" aria-pressed="false" title="Pause auto-close">
              ${phosphorPauseIcon("wl-timer-icon")}
            </button>
          </div>
        </div>
        <div class="wl-controls">
          <button class="wl-close" type="button" aria-label="Close" title="Close" data-close-overlay>
            ${phosphorXIcon("wl-close-icon")}
          </button>
        </div>
        <span class="wl-timer-track" aria-hidden="true"><span data-timer-progress></span></span>
      </header>
      <article class="wl-item">
        ${renderSavedOverlayImage(item)}
        <dl class="wl-fields">${renderSavedOverlayFields(item)}</dl>
      </article>
      <div class="wl-actions">
        <div class="wl-action-group is-left">
          <button class="wl-cancel-button" type="button" aria-label="Undo save" data-cancel-addition>
            <span>Undo</span>
          </button>
        </div>
        <div class="wl-action-group is-right">
          <button class="wl-open-button" type="button" aria-label="Open Stash panel" data-open-stash>
            ${phosphorLinkIcon("wl-button-icon")}
            <span>Open Stash</span>
          </button>
        </div>
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
  root.querySelector("[data-cancel-addition]")?.addEventListener("click", () => {
    safelyRunPanelAction(() => cancelSavedOverlayAddition(root, item));
  });
  bindSavedOverlayImageEvents(root, item);
  bindImageFallbacks(root);
  startSavedOverlayCountdown(root, SAVED_OVERLAY_DURATION_MS);
}

function showErrorOverlay(error) {
  const root = getOverlayRoot();
  clearOverlayTimers(root);
  const title = error.title || "Could not save this item";
  root.innerHTML = `
    <style>${overlayStyles()}</style>
    <div class="wl-error">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(error.message || "Try a product page or product card.")}</span>
    </div>
  `;
  window.clearTimeout(root.__stashTimer);
  root.__stashTimer = window.setTimeout(() => {
    root.innerHTML = "";
  }, 2600);
}

function startSavedOverlayCountdown(root, durationMs) {
  root.__stashCountdown = {
    durationMs,
    endsAt: Date.now() + durationMs,
    paused: false,
    remainingMs: durationMs
  };
  scheduleSavedOverlayTimer(root);
  root.__stashTicker = window.setInterval(() => updateSavedOverlayTimer(root), 250);
}

function scheduleSavedOverlayTimer(root) {
  const state = root.__stashCountdown;
  if (!state) {
    return;
  }

  window.clearTimeout(root.__stashTimer);
  root.__stashTimer = window.setTimeout(() => dismissSavedOverlay(root), state.remainingMs);
  renderSavedOverlayTimer(root);
}

function updateSavedOverlayTimer(root) {
  const state = root.__stashCountdown;
  if (!state || state.paused) {
    return;
  }

  state.remainingMs = Math.max(0, state.endsAt - Date.now());
  renderSavedOverlayTimer(root);
}

function renderSavedOverlayTimer(root) {
  const state = root.__stashCountdown;
  if (!state) {
    return;
  }

  const remainingSeconds = Math.ceil(state.remainingMs / 1000);
  const countdown = root.querySelector("[data-countdown]");
  if (countdown) {
    countdown.textContent = state.paused
      ? "Auto-close paused"
      : `Auto-close in ${remainingSeconds}s`;
  }

  const progress = root.querySelector("[data-timer-progress]");
  if (progress) {
    const ratio = state.durationMs > 0
      ? Math.max(0, Math.min(1, state.remainingMs / state.durationMs))
      : 0;
    progress.style.transform = `scaleX(${ratio})`;
  }
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
  renderSavedOverlayTimer(root);

  const button = root.querySelector("[data-toggle-timer]");
  if (button) {
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", "Resume auto-close");
    button.setAttribute("title", "Resume auto-close");
    button.innerHTML = phosphorPlayIcon("wl-timer-icon");
  }
}

function resumeSavedOverlayTimer(root) {
  const state = root.__stashCountdown;
  if (!state) {
    return;
  }

  state.remainingMs = Math.max(0, state.remainingMs || state.durationMs || SAVED_OVERLAY_DURATION_MS);
  state.endsAt = Date.now() + state.remainingMs;
  state.paused = false;
  root.__stashCountdown = state;
  root.querySelector(".wl-panel")?.classList.remove("is-timer-paused");
  const button = root.querySelector("[data-toggle-timer]");
  if (button) {
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", "Pause auto-close");
    button.setAttribute("title", "Pause auto-close");
    button.innerHTML = phosphorPauseIcon("wl-timer-icon");
  }
  scheduleSavedOverlayTimer(root);
  root.__stashTicker = window.setInterval(() => updateSavedOverlayTimer(root), 250);
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
  unbindSavedOverlayImageEvents(root);
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
    host.style.overflow = "hidden";
    host.style.isolation = "isolate";
    document.documentElement.appendChild(host);
  }

  host.style.overflow = "hidden";
  host.style.isolation = "isolate";

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
