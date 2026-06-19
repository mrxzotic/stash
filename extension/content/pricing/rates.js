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

  const formattedAmount = Number.isInteger(amount)
    ? String(amount)
    : String(amount.toFixed(2)).replace(/\.?0+$/, "");
  const symbol = CURRENCY_SYMBOLS[code] || code;

  if (["USD", "GBP", "JPY", "CNY"].includes(code)) {
    return `${symbol}${formattedAmount}`;
  }

  return `${formattedAmount} ${symbol}`;
}

function renderSitePriceHtml(item, namespace) {
  const currentText = item.price?.originalText || item.priceText;
  const compareAtText = item.price?.compareAtText || item.compareAtPriceText;
  const isSale =
    item.price?.isSale &&
    currentText &&
    compareAtText &&
    cleanText(currentText) !== cleanText(compareAtText);
  const baseClass = namespace === "wl" ? "wl-site-price" : "wp-site-price";
  const compareClass = namespace === "wl" ? "wl-compare-price" : "wp-compare-price";

  if (!currentText) {
    return "";
  }

  if (isSale) {
    return `
      <span class="${baseClass} is-sale">${escapeHtml(currentText)}</span>
      <span class="${compareClass}">(<s>${escapeHtml(compareAtText)}</s>)</span>
    `;
  }

  return `<span class="${baseClass}">${escapeHtml(currentText)}</span>`;
}
