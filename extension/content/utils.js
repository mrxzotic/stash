function titleCaseTitle(value) {
  const text = cleanText(value);
  if (!text) {
    return "";
  }

  const lower = text
    .toLocaleLowerCase()
    .replace(/\p{L}[\p{L}\p{N}'’:-]*/gu, (word) =>
      word
        .split(/([:'’-])/)
        .map((part) =>
          /^[\p{L}\p{N}]/u.test(part)
            ? part.charAt(0).toLocaleUpperCase() + part.slice(1)
            : part
        )
        .join("")
    )
    .replace(/\bMm6\b/g, "MM6")
    .replace(/\bAcg\b/g, "ACG")
    .replace(/\bCdg\b/g, "CDG")
    .replace(/\bY-3\b/g, "Y-3")
    .replace(/\bDc-(\d+)/g, "DC-$1")
    .replace(/\bRub\b/g, "RUB")
    .replace(/\bUsd\b/g, "USD")
    .replace(/\bEur\b/g, "EUR")
    .replace(/\bGbp\b/g, "GBP");

  return lower;
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => {
      if (value === null || value === undefined) {
        return false;
      }
      return typeof value !== "string" || value.trim() !== "";
    })
  );
}

function normalizeUrl(value) {
  try {
    const url = new URL(value || location.href, location.href);
    url.hash = "";
    for (const key of Array.from(url.searchParams.keys())) {
      if (/^(utm_|fbclid|gclid|gbraid|wbraid)/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    return url.toString();
  } catch {
    return location.href;
  }
}

function sameProductPageUrl(left, right) {
  try {
    const leftUrl = new URL(left || location.href, location.href);
    const rightUrl = new URL(right || location.href, location.href);
    const leftHandle = productHandleFromUrl(leftUrl);
    const rightHandle = productHandleFromUrl(rightUrl);
    if (leftHandle && rightHandle) {
      return leftUrl.origin === rightUrl.origin && leftHandle === rightHandle;
    }

    return (
      leftUrl.origin === rightUrl.origin &&
      leftUrl.pathname.replace(/\/+$/, "") === rightUrl.pathname.replace(/\/+$/, "")
    );
  } catch {
    return normalizeUrl(left) === normalizeUrl(right);
  }
}

function productHandleFromUrl(url) {
  return decodeURIComponent(url.pathname.match(/\/products\/([^/?#]+)/i)?.[1] || "")
    .toLocaleLowerCase();
}

function toAbsoluteUrl(value) {
  if (!value) {
    return "";
  }
  try {
    return new URL(value, location.href).toString();
  } catch {
    return "";
  }
}

function toAbsoluteUrlFor(value, baseUrl) {
  if (!value) {
    return "";
  }

  try {
    return new URL(value, baseUrl || location.href).toString();
  } catch {
    return "";
  }
}

function looksLikePrice(value) {
  const text = String(value || "");
  return (
    /[$€£¥₽₴]\s?\d|\d[\d\s.,]*\s?[$€£¥₽₴]/i.test(text) ||
    new RegExp(`\\d[\\d\\s.,]*\\s?(?:${CURRENCY_CODE_PATTERN})\\b`, "i").test(text) ||
    new RegExp(`\\b(?:${CURRENCY_CODE_PATTERN})\\b\\s?\\d`, "i").test(text)
  );
}

function numericPrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const match = String(value || "").match(/[\d][\d\s.,]*/);
  if (!match) {
    return undefined;
  }

  return parseLocalizedNumber(match[0]);
}

function currencyFromText(value) {
  const text = String(value || "");
  if (text.includes("$") || /\bUSD\b/i.test(text)) return "USD";
  if (text.includes("€") || /\bEUR\b/i.test(text)) return "EUR";
  if (text.includes("£") || /\bGBP\b/i.test(text)) return "GBP";
  if (text.includes("¥") || /\bJPY\b/i.test(text)) return "JPY";
  if (text.includes("₽") || /\bRUB\b/i.test(text)) return "RUB";
  if (text.includes("₴") || /\bUAH\b/i.test(text)) return "UAH";
  const code = text.match(new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b`, "i"))?.[0];
  return code || "";
}

function currencyFromSymbol(symbol) {
  return {
    "$": "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "₽": "RUB",
    "₴": "UAH"
  }[symbol] || "";
}

function currencySymbol(currency) {
  const code = cleanText(currency).toUpperCase();
  return CURRENCY_SYMBOLS[code] || code;
}

function formatPrice(price, currency) {
  const amount = numericPrice(price);
  if (amount === undefined) {
    return cleanText(price);
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD"
    }).format(amount);
  } catch {
    return `${currency || ""} ${amount}`.trim();
  }
}

function formatCollectionTotal(items) {
  const priced = items.filter((item) =>
    Number.isFinite(item.price?.rubAmount ?? item.rubPriceAmount)
  );

  if (!priced.length) {
    return `${items.length} saved`;
  }

  const total = priced.reduce(
    (sum, item) => sum + (item.price?.rubAmount ?? item.rubPriceAmount),
    0
  );
  return formatRubPrice(total);
}

function formatPanelSummaryTotal(items, currency = DEFAULT_SETTINGS.summaryCurrency) {
  const totalRub = items.reduce((sum, item) => {
    const amount = item.price?.rubAmount ?? item.rubPriceAmount;
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);

  const selectedCurrency = isSummaryCurrency(currency)
    ? cleanText(currency).toUpperCase()
    : DEFAULT_SETTINGS.summaryCurrency;
  const rate =
    panelState.summaryRate?.currency === selectedCurrency &&
    Number.isFinite(panelState.summaryRate.value)
      ? panelState.summaryRate.value
      : DEFAULT_RUB_RATES[selectedCurrency];
  const converted = Number.isFinite(rate) && rate > 0 ? totalRub / rate : 0;
  return formatSummaryCurrency(converted, selectedCurrency);
}

function formatSummaryCurrency(value, currency) {
  if (!Number.isFinite(value)) {
    return formatSummaryCurrency(0, currency);
  }

  const code = cleanText(currency).toUpperCase();
  const amount = Math.ceil(Math.max(0, value));
  const locale = code === "RUB" ? "ru-RU" : "en-US";
  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(amount);
  const symbol = currencySymbol(code);

  if (LEADING_SYMBOL_CURRENCIES.has(code)) {
    return `${symbol}${formatted}`;
  }

  return `${formatted} ${symbol}`;
}

function productId(url) {
  let hash = 0;
  for (let index = 0; index < url.length; index += 1) {
    hash = (hash << 5) - hash + url.charCodeAt(index);
    hash |= 0;
  }
  return `stash-${Math.abs(hash)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}

function cssUrl(value) {
  return String(value || "").replace(/["'\\\n\r]/g, "");
}
