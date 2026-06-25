var PANEL_PRICE_CHECK_STATUS_MS = 8000;
var panelPriceCheckRunning = false;
var panelPriceCheckSummaryState = "";
var panelPriceCheckSummaryTimer = 0;

function renderPanelPriceCheckButton() {
  if (!panelShouldShowPriceChecker()) {
    return "";
  }

  const label = t("Check prices");
  return `
    <button class="wp-price-checker${panelPriceCheckRunning ? " is-running" : ""}" type="button" aria-label="${escapeAttribute(label)}" aria-busy="${panelPriceCheckRunning}" data-panel-hint="${escapeAttribute(label)}" data-price-checker-trigger>
      ${phosphorRefreshIcon("wp-price-checker-icon")}
    </button>
  `;
}

function panelShouldShowPriceChecker() {
  return !panelState.archivedOpen && panelPriceCheckItems().length > 0;
}

function bindPanelPriceCheckerEvents(root) {
  root.querySelector("[data-price-checker-trigger]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.detail > 0) {
      event.currentTarget.blur();
    }
    safelyRunPanelAction(checkPanelPrices);
  });
}

async function checkPanelPrices() {
  if (panelPriceCheckRunning) {
    return;
  }

  const root = document.getElementById("tuckio-panel-root")?.shadowRoot;
  const items = panelPriceCheckItems();
  if (!root || !items.length) {
    return;
  }

  const checked = [];
  let nextItems = panelState.items;
  let shouldStore = false;
  let priceChanged = false;
  const checkedAt = new Date().toISOString();

  panelPriceCheckRunning = true;
  syncPanelPriceCheckerButton(root);

  try {
    for (const item of items) {
      const price = await fetchPanelItemPrice(item);
      const updatedItem = price
        ? await panelItemWithCheckedPrice(item, price, checkedAt)
        : panelItemWithMissedPriceCheck(item, checkedAt);
      const state = updatedItem.priceCheck?.state || "missed";

      nextItems = replacePanelPriceCheckItem(nextItems, updatedItem);
      panelState.items = nextItems;
      shouldStore = true;
      priceChanged = priceChanged || Boolean(price && panelItemPriceChanged(item, updatedItem));
      checked.push({ id: item.id, state });
    }

    if (shouldStore) {
      const storedItems = await setLocalStorageValue(STORAGE_KEY, nextItems);
      panelState.items = Array.isArray(storedItems) ? storedItems : nextItems;
      if (priceChanged) {
        renderPanelItemsOnly(root);
        renderPanelSummaryOnly({ animate: true });
        refreshPanelSummaryRate({ animateSummary: true });
      } else {
        renderPanelPricesOnly();
      }
    }

    showPanelPriceCheckSummaryStatus(root, checked);
    animatePanelPriceCheckCards(root, checked);
  } finally {
    panelPriceCheckRunning = false;
    syncPanelPriceCheckerButton(root);
  }
}

function panelPriceCheckItems() {
  const unique = new Map();
  panelActiveItems(panelState.items).forEach((item) => {
    const url = panelPriceCheckItemUrl(item.url);
    if (url && !unique.has(url)) {
      unique.set(url, item);
    }
  });
  return Array.from(unique.values());
}

async function fetchPanelItemPrice(item) {
  const itemUrl = panelPriceCheckItemUrl(item.url);
  const liveProduct = panelLivePageProductFor(itemUrl);
  if (liveProduct) {
    return normalizeCheckedPrice(liveProduct, itemUrl);
  }

  let url;
  try {
    url = new URL(itemUrl);
  } catch {
    return null;
  }

  if (!/^https?:$/i.test(url.protocol)) {
    return null;
  }

  try {
    // Explicit user-triggered HTML read only; DOMParser does not execute fetched merchant scripts.
    const response = await fetch(url.toString(), {
      credentials: "omit",
      cache: "no-store",
      headers: { Accept: "text/html,application/xhtml+xml" }
    });
    if (!response.ok || !panelPriceCheckCanParse(response)) {
      return null;
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const product = extractFromFetchedProductPage(doc, url.toString());
    return normalizeCheckedPrice(product, url.toString());
  } catch {
    return null;
  }
}

function panelLivePageProductFor(itemUrl) {
  if (!itemUrl || !sameProductPageUrl(itemUrl, location.href)) {
    return null;
  }

  try {
    const product = extractProduct({});
    const productUrl = product?.url || location.href;
    if (!sameProductPageUrl(productUrl, itemUrl)) {
      return null;
    }
    return (product?.priceText || Number.isFinite(numericPrice(product?.priceAmount)))
      ? product
      : null;
  } catch {
    return null;
  }
}

function panelPriceCheckItemUrl(value) {
  const raw = cleanText(value);
  if (!raw) {
    return "";
  }

  try {
    const url = new URL(raw, location.href);
    return /^https?:$/i.test(url.protocol) ? normalizeUrl(url.toString()) : "";
  } catch {
    return "";
  }
}

function panelPriceCheckCanParse(response) {
  const type = cleanText(response.headers?.get?.("content-type")).toLowerCase();
  return !type || type.includes("html") || type.includes("text/plain");
}

function normalizeCheckedPrice(product, productUrl) {
  const price = repairKnownInstallmentPrice(normalizePrice({
    amount: product?.priceAmount,
    currency: product?.currency,
    text: product?.priceText,
    compareAtAmount: product?.compareAtPriceAmount,
    compareAtText: product?.compareAtPriceText
  }), productUrl);

  return Number.isFinite(price.amount) && price.currency ? price : null;
}

function syncPanelPriceCheckerButton(root = document.getElementById("tuckio-panel-root")?.shadowRoot) {
  const button = root?.querySelector?.("[data-price-checker-trigger]");
  if (!button) {
    return;
  }

  button.classList.toggle("is-running", panelPriceCheckRunning);
  button.toggleAttribute("disabled", panelPriceCheckRunning);
  button.setAttribute("aria-busy", String(panelPriceCheckRunning));
}

function renderPanelPriceCheckSummaryStatus() {
  const safeState = panelPriceCheckSafeState(panelPriceCheckSummaryState);
  return `
    <span class="wp-price-check-summary${panelPriceCheckSummaryState ? ` is-${safeState}` : ""}" ${panelPriceCheckSummaryState ? "" : "hidden"} data-price-check-summary aria-hidden="true">
      ${panelPriceCheckSummaryState ? renderPanelPriceCheckGlyph(safeState, "wp-price-check-summary-icon") : ""}
    </span>
  `;
}

function showPanelPriceCheckSummaryStatus(root, checked) {
  const state = panelPriceCheckSummaryStateFor(checked);
  if (!state) {
    return;
  }

  window.clearTimeout(panelPriceCheckSummaryTimer);
  panelPriceCheckSummaryState = state;
  syncPanelPriceCheckSummaryStatus(root, true);
  panelPriceCheckSummaryTimer = window.setTimeout(() => {
    panelPriceCheckSummaryState = "";
    syncPanelPriceCheckSummaryStatus(root);
  }, PANEL_PRICE_CHECK_STATUS_MS + 100);
}

function syncPanelPriceCheckSummaryStatus(root = document.getElementById("tuckio-panel-root")?.shadowRoot, restart = false) {
  const element = root?.querySelector?.("[data-price-check-summary]");
  if (!element) {
    return;
  }

  if (restart) {
    element.className = "wp-price-check-summary";
    element.hidden = true;
    element.textContent = "";
    void element.offsetWidth;
  }

  if (!panelPriceCheckSummaryState) {
    element.className = "wp-price-check-summary";
    element.hidden = true;
    element.textContent = "";
    return;
  }

  const safeState = panelPriceCheckSafeState(panelPriceCheckSummaryState);
  element.className = `wp-price-check-summary is-${safeState}`;
  element.hidden = false;
  element.innerHTML = renderPanelPriceCheckGlyph(safeState, "wp-price-check-summary-icon");
}

function panelPriceCheckSummaryStateFor(checked) {
  const states = checked
    .map((entry) => panelPriceCheckSafeState(entry?.state))
    .filter(Boolean);
  if (!states.length) {
    return "";
  }
  if (states.includes("down") && states.includes("up")) {
    return "updated";
  }
  if (states.includes("down")) {
    return "down";
  }
  if (states.includes("up")) {
    return "up";
  }
  if (states.includes("updated")) {
    return "updated";
  }
  if (states.includes("same")) {
    return "same";
  }
  return "missed";
}

function animatePanelPriceCheckCards(root, checked) {
  checked.forEach((entry, index) => {
    const card = root.querySelector(`[data-panel-item-id="${CSS.escape(entry.id)}"]`);
    if (!card) {
      return;
    }
    window.setTimeout(() => restartPanelPriceCheckCardMotion(card, entry.state), index * 55);
  });
}

function restartPanelPriceCheckCardMotion(card, state) {
  window.clearTimeout(card.__tuckioPriceCheckTimer);
  card.querySelector?.(".wp-price-check-status")?.remove();
  card.classList.remove("is-price-check-up", "is-price-check-down", "is-price-check-updated");
  void card.offsetWidth;

  card.appendChild(elementFromHtml(renderPanelPriceCheckStatusIcon(state)));
  const safeState = panelPriceCheckSafeState(state);
  if (panelPriceCheckShouldPulsePrice(safeState)) {
    card.classList.add(`is-price-check-${safeState}`);
  }
  card.__tuckioPriceCheckTimer = window.setTimeout(() => {
    card.querySelector?.(".wp-price-check-status")?.remove();
    card.classList.remove("is-price-check-up", "is-price-check-down", "is-price-check-updated");
    card.__tuckioPriceCheckTimer = 0;
  }, PANEL_PRICE_CHECK_STATUS_MS + 100);
}

function renderPanelPriceCheckStatusIcon(state) {
  const safeState = panelPriceCheckSafeState(state);
  return `<span class="wp-price-check-status is-${safeState}" aria-hidden="true">${renderPanelPriceCheckGlyph(safeState, "wp-price-check-status-icon")}</span>`;
}

function panelPriceCheckShouldPulsePrice(state) {
  return /^(up|down|updated)$/.test(panelPriceCheckSafeState(state));
}

function renderPanelPriceCheckGlyph(state, className) {
  const safeState = panelPriceCheckSafeState(state);
  const icon = safeState === "down"
    ? phosphorArrowDownIcon(className)
    : safeState === "up"
      ? phosphorArrowUpIcon(className)
      : safeState === "same"
        ? phosphorCheckIcon(className)
        : phosphorRefreshIcon(className);
  return icon;
}

function panelPriceCheckSafeState(state) {
  return /^(same|up|down|updated|missed)$/.test(state) ? state : "same";
}
