async function convertPriceToRub(price) {
  if (!Number.isFinite(price.amount) || !price.currency) {
    return {};
  }

  if (price.currency === "RUB") {
    return {
      amount: Math.round(price.amount),
      text: formatRubPrice(price.amount),
      rate: 1,
      source: "original"
    };
  }

  const rate = await getRubRate(price.currency);
  if (!Number.isFinite(rate.value)) {
    return {};
  }

  const amount = Math.round(price.amount * rate.value);
  return {
    amount,
    text: formatRubPrice(amount),
    rate: rate.value,
    source: rate.source
  };
}

async function getRubRate(currency) {
  const code = cleanText(currency).toUpperCase();
  if (code === "RUB") {
    return { value: 1, source: "original", updatedAt: Date.now() };
  }

  const now = Date.now();
  const stored = await getLocalStorageValue(RATE_STORAGE_KEY);
  const cache = stored[RATE_STORAGE_KEY] || {};
  const cached = cache[code];
  if (cached && now - cached.updatedAt < RATE_MAX_AGE_MS) {
    return { value: cached.value, source: cached.source, updatedAt: cached.updatedAt };
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
      return { value, source: "open.er-api.com", updatedAt: now };
    }
  } catch {
    // Fall back below; saving should never fail because rate lookup failed.
  }

  return {
    value: DEFAULT_RUB_RATES[code],
    source: DEFAULT_RUB_RATES[code] ? "fallback" : "",
    updatedAt: now
  };
}

function formatRubPrice(value) {
  if (!Number.isFinite(value)) {
    return "";
  }

  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0
    }).format(value);
  } catch {
    return `${Math.round(value)} RUB`;
  }
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
  const rubAmount = numericPrice(item.price?.rubAmount ?? item.rubPriceAmount);
  const convertedAmount = convertRubToDisplayAmount(rubAmount, target);
  const primaryText = isNativeTarget && currentText
    ? currentText
    : Number.isFinite(convertedAmount)
    ? formatSummaryCurrency(convertedAmount, target)
    : currentText;
  const compareRubAmount = comparableCompareAtRubAmount({
    compareAtAmount,
    currentAmount,
    nativeCurrency,
    rubAmount
  });
  const convertedCompareAt = convertRubToDisplayAmount(compareRubAmount, target);
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

function convertRubToDisplayAmount(rubAmount, targetCurrency) {
  if (!Number.isFinite(rubAmount)) {
    return undefined;
  }

  const rate = panelDisplayCurrencyRubRate(targetCurrency);
  return Number.isFinite(rate) && rate > 0 ? rubAmount / rate : undefined;
}

function panelDisplayCurrencyRubRate(currency) {
  const code = isSummaryCurrency(currency)
    ? cleanText(currency).toUpperCase()
    : DEFAULT_SETTINGS.summaryCurrency;
  if (code === "RUB") {
    return 1;
  }

  return panelState.summaryRate?.currency === code && Number.isFinite(panelState.summaryRate.value)
    ? panelState.summaryRate.value
    : DEFAULT_RUB_RATES[code];
}

function comparableCompareAtRubAmount({ compareAtAmount, currentAmount, nativeCurrency, rubAmount }) {
  if (!Number.isFinite(compareAtAmount)) {
    return undefined;
  }

  if (Number.isFinite(rubAmount) && Number.isFinite(currentAmount) && currentAmount > 0) {
    return Math.round(rubAmount * (compareAtAmount / currentAmount));
  }

  if (nativeCurrency === "RUB") {
    return Math.round(compareAtAmount);
  }

  const rate = DEFAULT_RUB_RATES[nativeCurrency];
  return Number.isFinite(rate) && rate > 0 ? Math.round(compareAtAmount * rate) : undefined;
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
      </span>
    `;
  }

  return `
    <span class="${stackClass}">
      <span class="${lineClass}">
        <span class="${baseClass}">${escapeHtml(display.primaryText)}</span>
      </span>
      ${nativeLine}
    </span>
  `;
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
