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
    faviconUrl: faviconUrlForSource(url, item.faviconUrl),
    imageUrls: normalizeProductImageUrls(item.imageUrls, item.imageUrl, SAVED_IMAGE_URL_LIMIT),
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

function panelSummaryTextForItems(items) {
  return formatPanelSummaryTotal(
    panelTopbarValueItems(panelSummaryItems(items)),
    panelState.summaryCurrency
  );
}

function panelItemsTotalSignature(items) {
  return (Array.isArray(items) ? items : []).map((item) => {
    const normalized = normalizePanelItem(item);
    const price = normalized.price || {};
    return [
      normalized.id,
      isPanelItemArchived(normalized) ? "archived" : "active",
      price.rubAmount,
      price.amount,
      price.currency
    ].join(":");
  }).join("|");
}

function renderPanelSummaryOnly(options = {}) {
  const root = document.getElementById("tuckio-panel-root")?.shadowRoot;
  const total = root?.querySelector("[data-total-value]");
  const count = root?.querySelector(".wp-count");
  if (!total) return;

  const displayItems = panelSummaryItems(panelState.items);
  if (count) syncPanelBrandCountControl(root);
  setPanelTotalText(total, formatPanelSummaryTotal(panelTopbarValueItems(displayItems), panelState.summaryCurrency), options);
}

function syncPanelSettingsControls() {
  const root = document.getElementById("tuckio-panel-root")?.shadowRoot;
  if (!root) {
    return;
  }

  const shell = root.querySelector(".wp-shell");
  if (shell) {
    backgroundThemeOptions().forEach((theme) => {
      shell.classList.toggle(`wp-theme-${theme.id}`, theme.id === panelState.backgroundTheme);
    });
  }

  syncPanelCurrencyControl(root);
  syncPanelBackgroundChoices(root);
  syncPanelCompactViewControl(root);
  syncPanelTopbarPreferenceControls(root);
  syncPanelOverflowMenu(root);
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

function setPanelTotalText(total, value, options = {}) {
  const shouldAnimate = Boolean(options.animate);
  if (total.__tuckioTotalAnimation) {
    retargetPanelTotalAnimation(total, value);
    return;
  }

  const pill = total.closest(".wp-total");
  if (!shouldAnimate) {
    cancelPanelTotalAnimation(total);
    total.textContent = value;
    total.classList.remove("is-counting");
    pill?.classList.remove("is-recounting");
    return;
  }

  rollPanelTotalText(total, value, pill);
}

function rollPanelTotalText(total, value, pill) {
  const fromValue = summaryIntegerFromText(total.textContent);
  const toValue = summaryIntegerFromText(value);
  cancelPanelTotalAnimation(total);
  if (!Number.isFinite(fromValue) || !Number.isFinite(toValue)) {
    total.textContent = value;
    return;
  }

  total.classList.remove("is-counting");
  pill?.classList.remove("is-recounting");
  void total.offsetWidth;
  total.classList.add("is-counting");
  pill?.classList.add("is-recounting");

  total.__tuckioTotalAnimation = {
    duration: 1500,
    finalText: value,
    frame: 0,
    pill,
    startValue: fromValue,
    startedAt: performance.now(),
    targetValue: toValue
  };

  const tick = (timestamp) => {
    const state = total.__tuckioTotalAnimation;
    if (!state) {
      return;
    }

    const progress = Math.min(1, (timestamp - state.startedAt) / state.duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = state.startValue + (state.targetValue - state.startValue) * eased;
    total.textContent = formatSummaryCurrency(currentValue, panelState.summaryCurrency);

    if (progress < 1) {
      state.frame = window.requestAnimationFrame(tick);
      return;
    }

    total.textContent = state.finalText;
    total.__tuckioTotalAnimation = null;
    total.classList.remove("is-counting");
    state.pill?.classList.remove("is-recounting");
  };

  total.__tuckioTotalAnimation.frame = window.requestAnimationFrame(tick);
}

function retargetPanelTotalAnimation(total, value) {
  const state = total.__tuckioTotalAnimation;
  const nextValue = summaryIntegerFromText(value);
  if (!state || !Number.isFinite(nextValue)) {
    return;
  }

  const now = performance.now();
  const elapsed = now - state.startedAt;
  state.duration = Math.max(450, state.duration - elapsed);
  state.finalText = value;
  state.startValue = summaryIntegerFromText(total.textContent);
  state.startedAt = now;
  state.targetValue = nextValue;
}

function cancelPanelTotalAnimation(total) {
  if (total.__tuckioTotalAnimation?.frame) {
    window.cancelAnimationFrame(total.__tuckioTotalAnimation.frame);
  }
  total.__tuckioTotalAnimation = null;
}

function summaryIntegerFromText(value) {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function syncPanelCurrencyControl(root) {
  const trigger = root.querySelector("[data-currency-trigger]");
  const menu = root.querySelector("[data-currency-menu]");
  root.querySelectorAll("[data-summary-currency]").forEach((button) => {
    const isSelected = cleanText(button.dataset.summaryCurrency) === panelState.summaryCurrency;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-checked", String(isSelected));
    const checkSlot = button.querySelector(".wp-currency-check");
    if (checkSlot) {
      checkSlot.innerHTML = isSelected ? phosphorCheckIcon("wp-currency-check-icon") : "";
    }
  });

  trigger?.setAttribute("aria-expanded", "false");
  menu?.setAttribute("hidden", "");
  trigger?.closest("[data-currency-root]")?.classList.remove("is-open");
}

function syncPanelBackgroundChoices(root) {
  root.querySelectorAll("[data-background-theme]").forEach((button) => {
    const isSelected = cleanText(button.dataset.backgroundTheme) === panelState.backgroundTheme;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-checked", String(isSelected));
    const check = button.querySelector(".wp-background-check");
    if (check) {
      check.innerHTML = isSelected ? phosphorCheckIcon("wp-background-check-icon") : "";
    }
  });
}

function syncPanelCompactViewControl(root) {
  root.querySelectorAll("[data-compact-view]").forEach((input) => {
    input.checked = Boolean(panelState.compactView);
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
      checkSlot.innerHTML = isSelected ? phosphorCheckIcon("wp-select-check") : "";
    }
  });

  trigger?.setAttribute("aria-expanded", "false");
  menu?.setAttribute("hidden", "");
}

function refreshPanelSummaryRate(options = {}) {
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
      renderPanelSummaryOnly({
        animate: options.animateSummary,
        skipWhileAnimating: true
      });
      renderPanelPricesOnly({
        animate: options.animateSummary
      });
    })
    .catch(() => {
      const fallbackRate = DEFAULT_RUB_RATES[currency];
      panelState.summaryRate = {
        currency,
        value: fallbackRate,
        source: "fallback",
        updatedAt: Date.now()
      };
      renderPanelSummaryOnly({
        animate: options.animateSummary,
        skipWhileAnimating: true
      });
      renderPanelPricesOnly({
        animate: options.animateSummary
      });
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
