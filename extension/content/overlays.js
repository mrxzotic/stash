function showSavedOverlay(item, items, categories = DEFAULT_CATEGORIES) {
  const root = getOverlayRoot();

  root.innerHTML = `
    <style>${overlayStyles()}</style>
    <section class="wl-panel" aria-live="polite">
      <p class="wl-kicker">Added:</p>
      <article class="wl-item">
        <div class="wl-image">${item.imageUrl ? `<img src="${escapeAttribute(item.imageUrl)}" alt="">` : lucideImageIcon("wl-image-placeholder")}</div>
        <h2>${escapeHtml(item.title)}</h2>
        ${renderSitePriceHtml(item, "wl")}
      </article>
      <button class="wl-open-button" type="button" data-open-stash>
        ${lucideLinkIcon("wl-button-icon")}
        <span>Open Stash</span>
      </button>
    </section>
  `;

  root.querySelector("[data-open-stash]")?.addEventListener("click", () => {
    window.clearTimeout(root.__stashTimer);
    root.innerHTML = "";
    safelyRunPanelAction(() => openStashPanel());
  });
  bindImageFallbacks(root);

  window.clearTimeout(root.__stashTimer);
  root.__stashTimer = window.setTimeout(() => {
    root.innerHTML = "";
  }, 8000);
}

function showErrorOverlay(error) {
  const root = getOverlayRoot();
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
