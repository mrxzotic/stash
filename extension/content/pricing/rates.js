async function getCurrencyRate(currency) {
  const code = cleanText(currency).toUpperCase();
  if (code === "RUB") {
    return { currency: code, value: 1, source: "base", updatedAt: Date.now() };
  }

  const now = Date.now();
  const stored = await getLocalStorageValue(RATE_STORAGE_KEY);
  const cache = stored[RATE_STORAGE_KEY] || {};
  const cached = cache[code];
  if (cached && now - cached.updatedAt < RATE_MAX_AGE_MS) {
    return { currency: code, value: cached.value, source: cached.source, updatedAt: cached.updatedAt };
  }

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(code)}`);
    const data = await response.json();
    const value = Number(data?.rates?.RUB);
    if (Number.isFinite(value) && value > 0) {
      await setLocalStorageValue(RATE_STORAGE_KEY, {
        ...cache,
        [code]: { value, source: "open.er-api.com", updatedAt: now }
      });
      return { currency: code, value, source: "open.er-api.com", updatedAt: now };
    }
  } catch {
  }

  return {
    currency: code,
    value: DEFAULT_CURRENCY_RATES[code],
    source: DEFAULT_CURRENCY_RATES[code] ? "default" : "",
    updatedAt: now
  };
}

function formatOriginalPrice(value, currency) {
  const amount = numericPrice(value);
  const code = cleanText(currency).toUpperCase();
  if (!Number.isFinite(amount) || !code) {
    return "";
  }

  const roundedAmount = Math.ceil(Math.max(0, amount));
  const locale = code === "RUB" || code === "UAH" ? "ru-RU" : "en-US";
  const formattedAmount = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(roundedAmount);
  const symbol = CURRENCY_SYMBOLS[code] || code;

  if (["USD", "GBP", "JPY", "CNY"].includes(code)) {
    return `${symbol}${formattedAmount}`;
  }

  return `${formattedAmount} ${symbol}`;
}

function panelPriceDisplayModel(item, targetCurrency = panelState.summaryCurrency) {
  const currency = item.price?.currency || item.currency;
  const nativeCurrency = cleanText(currency).toUpperCase();
  const target = isSummaryCurrency(targetCurrency)
    ? cleanText(targetCurrency).toUpperCase()
    : DEFAULT_SETTINGS.summaryCurrency;
  const isNativeTarget = Boolean(nativeCurrency && nativeCurrency === target);
  const currentAmount = numericPrice(item.price?.amount ?? item.priceAmount);
  const compareAtAmount = numericPrice(item.price?.compareAtAmount ?? item.compareAtPriceAmount);
  const currentText = formatOriginalPrice(
    currentAmount,
    currency
  ) || item.price?.originalText || item.priceText;
  const compareAtText = formatOriginalPrice(
    compareAtAmount,
    currency
  ) || item.price?.compareAtText || item.compareAtPriceText;
  const convertedAmount = convertPriceToDisplayAmount(currentAmount, nativeCurrency, target);
  const primaryText = isNativeTarget && currentText
    ? currentText
    : Number.isFinite(convertedAmount)
    ? formatSummaryCurrency(convertedAmount, target)
    : currentText;
  const convertedCompareAt = convertPriceToDisplayAmount(compareAtAmount, nativeCurrency, target);
  const primaryCompareAtText = isNativeTarget && compareAtText
    ? compareAtText
    : Number.isFinite(convertedCompareAt)
    ? formatSummaryCurrency(convertedCompareAt, target)
    : compareAtText;
  const isSale =
    item.price?.isSale &&
    primaryText &&
    primaryCompareAtText &&
    cleanText(primaryText) !== cleanText(primaryCompareAtText);

  return {
    currentText,
    compareAtText,
    isConverted: !isNativeTarget && Number.isFinite(convertedAmount),
    isSale,
    nativeCurrency,
    primaryCompareAtText,
    primaryText,
    targetCurrency: target
  };
}

function convertPriceToDisplayAmount(amount, sourceCurrency, targetCurrency) {
  const sourceAmount = numericPrice(amount);
  const source = cleanText(sourceCurrency).toUpperCase();
  const target = isSummaryCurrency(targetCurrency)
    ? cleanText(targetCurrency).toUpperCase()
    : DEFAULT_SETTINGS.summaryCurrency;
  if (!Number.isFinite(sourceAmount) || !isSummaryCurrency(source) || !isSummaryCurrency(target)) {
    return undefined;
  }
  if (source === target) {
    return sourceAmount;
  }

  const sourceRate = panelDisplayCurrencyRate(source);
  const targetRate = panelDisplayCurrencyRate(target);
  return Number.isFinite(sourceRate) && sourceRate > 0 && Number.isFinite(targetRate) && targetRate > 0
    ? (sourceAmount * sourceRate) / targetRate
    : undefined;
}

function panelDisplayCurrencyRate(currency) {
  const code = isSummaryCurrency(currency)
    ? cleanText(currency).toUpperCase()
    : DEFAULT_SETTINGS.summaryCurrency;
  if (code === "RUB") {
    return 1;
  }

  const cached = panelState.currencyRates?.[code];
  if (Number.isFinite(cached?.value)) {
    return cached.value;
  }

  return panelState.summaryRate?.currency === code && Number.isFinite(panelState.summaryRate.value)
    ? panelState.summaryRate.value
    : DEFAULT_CURRENCY_RATES[code];
}

function renderSitePriceHtml(item, namespace) {
  const display = panelPriceDisplayModel(item);
  const isOverlay = namespace === "wl";
  const baseClass = namespace === "wl" ? "wl-site-price" : "wp-site-price";
  const compareClass = namespace === "wl" ? "wl-compare-price" : "wp-compare-price";
  const stackClass = namespace === "wl" ? "wl-price-stack" : "wp-price-stack";
  const lineClass = namespace === "wl" ? "wl-price-line" : "wp-price-line";
  const nativeClass = namespace === "wl" ? "wl-native-price" : "wp-native-price";
  const nativeLine = renderNativePriceHtml(display, nativeClass, isOverlay);
  const checkLine = namespace === "wp" ? renderPanelPriceCheckLineHtml(item) : "";

  if (!display.primaryText) {
    return "";
  }

  if (display.isSale) {
    return `
      <span class="${stackClass}">
        <span class="${lineClass}">
          <span class="${baseClass} is-sale">${escapeHtml(display.primaryText)}</span>
          <span class="${compareClass}">(<s>${escapeHtml(display.primaryCompareAtText)}</s>)</span>
        </span>
        ${nativeLine}
        ${checkLine}
      </span>
    `;
  }

  return `
    <span class="${stackClass}">
      <span class="${lineClass}">
        <span class="${baseClass}">${escapeHtml(display.primaryText)}</span>
      </span>
      ${nativeLine}
      ${checkLine}
    </span>
  `;
}

function renderPanelPriceCheckLineHtml(item) {
  const model = panelPriceCheckDisplayModel(item);
  if (!model) {
    return "";
  }

  return `
    <span class="wp-price-check-line is-${escapeAttribute(model.state)}">
      <span class="wp-price-check-detail">${escapeHtml(model.detail)}</span>
      <span class="wp-price-check-compact">${escapeHtml(model.compact)}</span>
    </span>
  `;
}

function panelPriceCheckDisplayModel(item) {
  const state = cleanText(item?.priceCheck?.state).toLowerCase();
  if (!/^(up|down|updated)$/.test(state)) {
    return null;
  }

  const checkedLabel = panelPriceCheckCheckedLabel(item.priceCheck.checkedAt);
  if (state === "updated") {
    return {
      compact: t("updated"),
      detail: t("Price updated · {checked}", { checked: checkedLabel }),
      state
    };
  }

  const delta = panelPriceCheckDisplayDelta(item.priceCheck);
  if (!delta) {
    return null;
  }

  const arrow = state === "down" ? "↓" : "↑";
  return {
    compact: `${arrow} ${delta}`,
    detail: t("{arrow} {delta} since last check · {checked}", {
      arrow,
      delta,
      checked: checkedLabel
    }),
    state
  };
}

function panelPriceCheckDisplayDelta(priceCheck) {
  const target = isSummaryCurrency(panelState.summaryCurrency)
    ? panelState.summaryCurrency
    : DEFAULT_SETTINGS.summaryCurrency;
  const amountDelta = numericPrice(priceCheck?.deltaAmount);
  const currency = cleanText(priceCheck?.current?.currency || priceCheck?.previous?.currency).toUpperCase();
  if (Number.isFinite(amountDelta) && currency && currency === target) {
    return formatOriginalPrice(Math.abs(amountDelta), currency);
  }

  if (Number.isFinite(amountDelta) && currency) {
    const converted = convertPriceToDisplayAmount(Math.abs(amountDelta), currency, target);
    return Number.isFinite(converted) ? formatSummaryCurrency(Math.abs(converted), target) : "";
  }

  return "";
}

function panelPriceCheckCheckedLabel(value) {
  const time = Date.parse(value || "");
  if (!Number.isFinite(time)) {
    return t("checked");
  }

  const checked = new Date(time);
  if (checked.toDateString() === new Date().toDateString()) {
    return t("checked today");
  }

  return t("checked {date}", { date: panelPriceCheckDateLabel(checked) });
}

function panelPriceCheckDateLabel(date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short"
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function shouldRenderNativePrice(display) {
  return Boolean(
    display.currentText &&
    display.nativeCurrency &&
    display.nativeCurrency !== display.targetCurrency &&
    cleanText(display.currentText) !== cleanText(display.primaryText)
  );
}

function renderNativePriceHtml(display, nativeClass, isOverlay) {
  if (!shouldRenderNativePrice(display)) {
    return "";
  }

  if (
    isOverlay &&
    display.isSale &&
    display.compareAtText &&
    cleanText(display.currentText) !== cleanText(display.compareAtText)
  ) {
    return `
      <span class="${nativeClass}">
        <span>${escapeHtml(display.currentText)}</span>
        <span>(<s>${escapeHtml(display.compareAtText)}</s>)</span>
      </span>
    `;
  }

  return `<span class="${nativeClass}">${renderNativePriceText(display)}</span>`;
}

function renderNativePriceText(display) {
  if (
    display.isSale &&
    display.compareAtText &&
    cleanText(display.currentText) !== cleanText(display.compareAtText)
  ) {
    return `${escapeHtml(display.currentText)} (${escapeHtml(display.compareAtText)})`;
  }

  return escapeHtml(display.currentText);
}
