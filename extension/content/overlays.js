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
          <p class="wl-kicker">${escapeHtml(t("Saved"))}</p>
          <div class="wl-timer-line">
            <p class="wl-countdown" data-countdown aria-hidden="true">${escapeHtml(t("Auto-close in {seconds}s", { seconds: Math.ceil(SAVED_OVERLAY_DURATION_MS / 1000) }))}</p>
            <button class="wl-timer-button" type="button" data-toggle-timer aria-label="${escapeAttribute(t("Pause auto-close"))}" aria-pressed="false" title="${escapeAttribute(t("Pause auto-close"))}">
              ${phosphorPauseIcon("wl-timer-icon")}
            </button>
          </div>
        </div>
        <div class="wl-controls">
          <button class="wl-close" type="button" aria-label="${escapeAttribute(t("Close"))}" title="${escapeAttribute(t("Close"))}" data-close-overlay>
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
          <button class="wl-cancel-button" type="button" aria-label="${escapeAttribute(t("Undo save"))}" data-cancel-addition>
            <span>${escapeHtml(t("Undo"))}</span>
          </button>
        </div>
        <div class="wl-action-group is-right">
          <button class="wl-open-button" type="button" aria-label="${escapeAttribute(t("Open Tuckio panel"))}" data-open-tuckio>
            ${phosphorLinkIcon("wl-button-icon")}
            <span>${escapeHtml(t("Open Tuckio"))}</span>
          </button>
        </div>
      </div>
    </section>
  `;

  root.querySelector("[data-close-overlay]")?.addEventListener("click", dismiss);
  root.querySelector("[data-toggle-timer]")?.addEventListener("click", () => {
    toggleSavedOverlayTimer(root);
  });
  root.querySelector("[data-open-tuckio]")?.addEventListener("click", () => {
    dismissSavedOverlay(root);
    safelyRunPanelAction(() => openTuckioPanel());
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
  const title = error.title || t("Could not save this item");
  root.innerHTML = `
    <style>${overlayStyles()}</style>
    <div class="wl-error">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(error.message || t("Try a product page or product card."))}</span>
    </div>
  `;
  window.clearTimeout(root.__tuckioTimer);
  root.__tuckioTimer = window.setTimeout(() => {
    root.innerHTML = "";
  }, 2600);
}

function startSavedOverlayCountdown(root, durationMs) {
  root.__tuckioCountdown = {
    durationMs,
    endsAt: Date.now() + durationMs,
    paused: false,
    remainingMs: durationMs
  };
  scheduleSavedOverlayTimer(root);
  root.__tuckioTicker = window.setInterval(() => updateSavedOverlayTimer(root), 250);
}

function scheduleSavedOverlayTimer(root) {
  const state = root.__tuckioCountdown;
  if (!state) {
    return;
  }

  window.clearTimeout(root.__tuckioTimer);
  root.__tuckioTimer = window.setTimeout(() => dismissSavedOverlay(root), state.remainingMs);
  renderSavedOverlayTimer(root);
}

function updateSavedOverlayTimer(root) {
  const state = root.__tuckioCountdown;
  if (!state || state.paused) {
    return;
  }

  state.remainingMs = Math.max(0, state.endsAt - Date.now());
  renderSavedOverlayTimer(root);
}

function renderSavedOverlayTimer(root) {
  const state = root.__tuckioCountdown;
  if (!state) {
    return;
  }

  const remainingSeconds = Math.ceil(state.remainingMs / 1000);
  const countdown = root.querySelector("[data-countdown]");
  if (countdown) {
    countdown.textContent = state.paused
      ? t("Auto-close paused")
      : t("Auto-close in {seconds}s", { seconds: remainingSeconds });
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
  if (root.__tuckioCountdown?.paused) {
    resumeSavedOverlayTimer(root);
    return;
  }

  pauseSavedOverlayTimer(root);
}

function pauseSavedOverlayTimer(root) {
  const state = root.__tuckioCountdown;
  if (!state) {
    return;
  }

  state.remainingMs = Math.max(0, state.endsAt - Date.now());
  state.paused = true;
  clearOverlayTimers(root);
  root.__tuckioCountdown = state;
  root.querySelector(".wl-panel")?.classList.add("is-timer-paused");
  renderSavedOverlayTimer(root);

  const button = root.querySelector("[data-toggle-timer]");
  if (button) {
    button.setAttribute("aria-pressed", "true");
    button.setAttribute("aria-label", t("Resume auto-close"));
    button.setAttribute("title", t("Resume auto-close"));
    button.innerHTML = phosphorPlayIcon("wl-timer-icon");
  }
}

function resumeSavedOverlayTimer(root) {
  const state = root.__tuckioCountdown;
  if (!state) {
    return;
  }

  state.remainingMs = Math.max(0, state.remainingMs || state.durationMs || SAVED_OVERLAY_DURATION_MS);
  state.endsAt = Date.now() + state.remainingMs;
  state.paused = false;
  root.__tuckioCountdown = state;
  root.querySelector(".wl-panel")?.classList.remove("is-timer-paused");
  const button = root.querySelector("[data-toggle-timer]");
  if (button) {
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", t("Pause auto-close"));
    button.setAttribute("title", t("Pause auto-close"));
    button.innerHTML = phosphorPauseIcon("wl-timer-icon");
  }
  scheduleSavedOverlayTimer(root);
  root.__tuckioTicker = window.setInterval(() => updateSavedOverlayTimer(root), 250);
}

async function cancelSavedOverlayAddition(root, item) {
  const stored = await getLocalStorageValue(STORAGE_KEY);
  const currentItems = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
  const itemId = item.id || productId(item.url);
  const itemUrl = normalizeUrl(item.url);
  const itemKey = productIdentityKey(itemUrl) || itemUrl;
  const nextItems = currentItems.filter((savedItem) => {
    const savedUrl = normalizeUrl(savedItem.url);
    const savedId = savedItem.id || productId(savedUrl);
    const savedKey = productIdentityKey(savedUrl) || savedUrl;
    return savedId !== itemId && savedUrl !== itemUrl && savedKey !== itemKey;
  });

  await setLocalStorageValue(STORAGE_KEY, nextItems);
  if (Array.isArray(panelState.items)) {
    panelState.items = nextItems;
  }
  if (panelState.open) {
    renderTuckioPanel();
  }
  dismissSavedOverlay(root);
}

function dismissSavedOverlay(root) {
  clearOverlayTimers(root);
  unbindSavedOverlayImageEvents(root);
  root.innerHTML = "";
}

function clearOverlayTimers(root) {
  window.clearTimeout(root.__tuckioTimer);
  window.clearInterval(root.__tuckioTicker);
  root.__tuckioTimer = 0;
  root.__tuckioTicker = 0;
}

function getOverlayRoot() {
  let host = document.getElementById("tuckio-extension-root");
  if (!host) {
    host = document.createElement("div");
    host.id = "tuckio-extension-root";
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
  let host = document.getElementById("tuckio-panel-root");
  if (!host) {
    host = document.createElement("div");
    host.id = "tuckio-panel-root";
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
