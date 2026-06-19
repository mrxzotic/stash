function normalizePanelItem(item) {
  const url = normalizeUrl(item.url || location.href);
  const sourceDomain = item.sourceDomain || sourceDomainFromUrl(url);
  const price = normalizePanelPrice(item);
  const rawTitle = cleanText(item.title);
  const rawBrand = cleanText(item.brand);
  const shouldSwapBrandTitle = looksLikeProductName(rawBrand) && isBrandLikeLine(rawTitle);
  const title = shouldSwapBrandTitle ? rawBrand : rawTitle;
  const brand = shouldSwapBrandTitle ? rawTitle : rawBrand;
  const cleanBrand = cleanBrandName(brand) || sourceNameFromUrl(url);

  return {
    ...item,
    id: item.id || productId(url),
    url,
    title: cleanProductTitle(title, cleanBrand, url) || "Saved Product",
    brand: cleanBrand,
    category: item.category || panelState.categories[0]?.id || "tops",
    sourceDomain,
    faviconUrl: item.faviconUrl || faviconUrlFromUrl(url),
    price
  };
}

function normalizePanelPrice(item) {
  const storedPrice = item.price || {};
  const parsed = normalizePrice({
    amount: storedPrice.amount ?? item.priceAmount,
    currency: storedPrice.currency ?? item.currency,
    text: storedPrice.originalText ?? item.priceText,
    compareAtAmount: storedPrice.compareAtAmount ?? item.compareAtPriceAmount,
    compareAtText: storedPrice.compareAtText ?? item.compareAtPriceText
  });
  const rubAmount =
    storedPrice.rubAmount ??
    item.rubPriceAmount ??
    convertToRubSync(parsed.amount, parsed.currency);
  const rubText =
    storedPrice.rubText ||
    item.rubPriceText ||
    (Number.isFinite(rubAmount) ? formatRubPrice(rubAmount) : "");

  return {
    amount: parsed.amount,
    currency: parsed.currency,
    originalText: parsed.originalText,
    compareAtAmount: parsed.compareAtAmount,
    compareAtText: parsed.compareAtText,
    isSale: parsed.isSale,
    rubAmount,
    rubText
  };
}

function convertToRubSync(amount, currency) {
  const code = cleanText(currency).toUpperCase();
  const rate = DEFAULT_RUB_RATES[code];
  if (!Number.isFinite(amount) || !Number.isFinite(rate)) {
    return undefined;
  }

  return Math.round(amount * rate);
}

function renderPanelSummaryOnly() {
  const root = document.getElementById("stash-panel-root")?.shadowRoot;
  const total = root?.querySelector(".wp-total");
  const count = root?.querySelector(".wp-count");
  if (!total || !count) {
    return;
  }

  const displayItems = panelState.items.map(normalizePanelItem);
  count.textContent = `${panelState.items.length} ${panelState.items.length === 1 ? "item" : "items"}`;
  total.textContent = formatPanelSummaryTotal(displayItems, panelState.summaryCurrency);
}

function syncPanelSettingsControls() {
  const root = document.getElementById("stash-panel-root")?.shadowRoot;
  if (!root) {
    return;
  }

  const shell = root.querySelector(".wp-shell");
  if (shell) {
    backgroundThemeOptions().forEach((theme) => {
      shell.classList.toggle(`wp-theme-${theme.id}`, theme.id === panelState.backgroundTheme);
    });
  }

  syncPanelSelectControl(root, {
    selector: "[data-summary-currency]",
    datasetKey: "summaryCurrency",
    value: panelState.summaryCurrency,
    label: panelState.summaryCurrency,
    meta: currencySymbol(panelState.summaryCurrency)
  });

  const backgroundLabel =
    backgroundThemeOptions().find((theme) => theme.id === panelState.backgroundTheme)?.label ||
    panelState.backgroundTheme;
  syncPanelSelectControl(root, {
    selector: "[data-background-theme]",
    datasetKey: "backgroundTheme",
    value: panelState.backgroundTheme,
    label: backgroundLabel
  });
}

function syncPanelSelectControl(root, { selector, datasetKey, value, label, meta = "" }) {
  const buttons = Array.from(root.querySelectorAll(selector));
  const selectRoot = buttons[0]?.closest("[data-select-root]");
  if (!selectRoot) {
    return;
  }

  const trigger = selectRoot.querySelector("[data-select-trigger]");
  const valueNode = selectRoot.querySelector(".wp-select-value");
  const menu = selectRoot.querySelector(".wp-select-menu");

  if (valueNode) {
    valueNode.innerHTML = `
      <span>${escapeHtml(label)}</span>
      ${meta ? `<span class="wp-select-symbol">${escapeHtml(meta)}</span>` : ""}
    `;
  }

  buttons.forEach((button) => {
    const isSelected = cleanText(button.dataset[datasetKey]) === cleanText(value);
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-checked", String(isSelected));
    const checkSlot = button.querySelector(".wp-select-check-slot");
    if (checkSlot) {
      checkSlot.innerHTML = isSelected ? lucideCheckIcon("wp-select-check") : "";
    }
  });

  trigger?.setAttribute("aria-expanded", "false");
  menu?.setAttribute("hidden", "");
}

function refreshPanelSummaryRate() {
  const currency = cleanText(panelState.summaryCurrency).toUpperCase();
  const currentRate = panelState.summaryRate;
  if (!panelState.open || !currency || panelState.summaryRateLoading === currency) {
    return;
  }

  if (
    currentRate?.currency === currency &&
    Number.isFinite(currentRate.value) &&
    Date.now() - currentRate.updatedAt < RATE_MAX_AGE_MS
  ) {
    return;
  }

  panelState.summaryRateLoading = currency;
  getRubRate(currency)
    .then((rate) => {
      if (!panelState.open || panelState.summaryCurrency !== currency) {
        return;
      }

      const fallbackRate = DEFAULT_RUB_RATES[currency];
      panelState.summaryRate = {
        currency,
        value: Number.isFinite(rate.value) ? rate.value : fallbackRate,
        source: rate.source || "fallback",
        updatedAt: rate.updatedAt || Date.now()
      };
      renderPanelSummaryOnly();
    })
    .catch(() => {
      const fallbackRate = DEFAULT_RUB_RATES[currency];
      panelState.summaryRate = {
        currency,
        value: fallbackRate,
        source: "fallback",
        updatedAt: Date.now()
      };
      renderPanelSummaryOnly();
    })
    .finally(() => {
      if (panelState.summaryRateLoading === currency) {
        panelState.summaryRateLoading = "";
      }
    });
}

function fallbackSummaryRate(currency) {
  const code = isSummaryCurrency(currency)
    ? cleanText(currency).toUpperCase()
    : DEFAULT_SETTINGS.summaryCurrency;
  return {
    currency: code,
    value: DEFAULT_RUB_RATES[code],
    source: "fallback",
    updatedAt: 0
  };
}

function panelItemMatchesSearch(item) {
  const query = cleanText(panelState.searchQuery).toLowerCase();
  if (!query) {
    return true;
  }

  return [
    item.title,
    item.brand,
    item.category,
    categoryLabelFor(panelState.categories, item.category),
    item.sourceDomain,
    item.price.originalText,
    item.price.rubText
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function uniquePanelCategoryId(label) {
  const base = slugify(label) || "category";
  let id = base;
  let index = 2;

  while (
    hasCategory(panelState.categories, id) ||
    id === "all" ||
    id === "auto"
  ) {
    id = `${base}-${index}`;
    index += 1;
  }

  return id;
}
