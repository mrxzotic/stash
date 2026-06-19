const STORAGE_KEY = "wishlisted.items.v1";
const CATEGORY_STORAGE_KEY = "wishlisted.categories.v1";
const DEFAULT_CATEGORIES = [
  { id: "tops", label: "Tops" },
  { id: "bottoms", label: "Bottoms" },
  { id: "outerwear", label: "Outerwear" },
  { id: "shoes", label: "Shoes" },
  { id: "bags", label: "Bags" }
];
const DEFAULT_RUB_RATES = {
  RUB: 1,
  USD: 89,
  EUR: 96,
  GBP: 113,
  JPY: 0.62,
  AUD: 59,
  CAD: 65,
  CHF: 102,
  CNY: 12.2,
  KRW: 0.065,
  AED: 24.2,
  SAR: 23.7,
  QAR: 24.5,
  KWD: 291,
  BHD: 236,
  OMR: 231,
  TRY: 2.75,
  KZT: 0.17,
  GEL: 32.8,
  AMD: 0.23,
  PLN: 24,
  SEK: 9.4,
  NOK: 8.8,
  DKK: 12.9,
  HKD: 11.4,
  SGD: 68
};
const CURRENCY_SYMBOLS = {
  RUB: "RUB",
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  CHF: "CHF",
  CNY: "CN¥",
  KRW: "KRW",
  AED: "AED",
  SAR: "SAR",
  QAR: "QAR",
  KWD: "KWD",
  BHD: "BHD",
  OMR: "OMR",
  TRY: "TRY",
  KZT: "KZT",
  GEL: "GEL",
  AMD: "AMD",
  PLN: "PLN",
  SEK: "SEK",
  NOK: "NOK",
  DKK: "DKK",
  HKD: "HKD",
  SGD: "S$"
};
const CURRENCY_CODE_PATTERN =
  "USD|EUR|GBP|JPY|AUD|CAD|CHF|CNY|KRW|RUB|AED|SAR|QAR|KWD|BHD|OMR|TRY|KZT|GEL|AMD|PLN|SEK|NOK|DKK|HKD|SGD";

let activeCategory = "all";
let searchQuery = "";
let items = [];
let categories = DEFAULT_CATEGORIES;

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([loadItems(), loadCategories()]);
  renderFilters();
  renderSettings();
  bindEvents();
  render();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") {
    return;
  }

  if (changes[STORAGE_KEY]) {
    items = Array.isArray(changes[STORAGE_KEY].newValue)
      ? changes[STORAGE_KEY].newValue
      : [];
  }

  if (changes[CATEGORY_STORAGE_KEY]) {
    categories = normalizeCategories(changes[CATEGORY_STORAGE_KEY].newValue);
    if (activeCategory !== "all" && !hasCategory(activeCategory)) {
      activeCategory = "all";
    }
    renderFilters();
    renderSettings();
  }

  render();
});

async function loadItems() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  items = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
}

async function loadCategories() {
  const stored = await chrome.storage.local.get(CATEGORY_STORAGE_KEY);
  categories = normalizeCategories(stored[CATEGORY_STORAGE_KEY]);
}

function bindEvents() {
  document.getElementById("filters").addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) {
      return;
    }

    activeCategory = button.dataset.category;
    renderFilters();
    render();
  });

  document.getElementById("search").addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    render();
  });

  document.getElementById("settings-toggle").addEventListener("click", () => {
    const panel = document.getElementById("settings-panel");
    const button = document.getElementById("settings-toggle");
    const isOpen = panel.hidden;
    panel.hidden = !isOpen;
    button.setAttribute("aria-expanded", String(isOpen));
  });

  document.getElementById("close-popup").addEventListener("click", () => {
    window.close();
  });

  document.getElementById("category-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = document.getElementById("category-input");
    const label = cleanCategoryLabel(input.value);
    if (!label) {
      return;
    }

    const nextCategories = normalizeCategories([
      ...categories,
      { id: uniqueCategoryId(label), label }
    ]);
    input.value = "";
    await saveCategories(nextCategories);
  });

  document.getElementById("category-list").addEventListener("change", async (event) => {
    const input = event.target.closest("[data-category-label]");
    if (!input) {
      return;
    }

    const id = input.dataset.categoryLabel;
    const nextCategories = categories.map((category) =>
      category.id === id
        ? { ...category, label: cleanCategoryLabel(input.value) || category.label }
        : category
    );
    await saveCategories(nextCategories);
  });

  document.getElementById("category-list").addEventListener("click", async (event) => {
    const button = event.target.closest("[data-remove-category]");
    if (!button) {
      return;
    }

    const nextCategories = categories.filter(
      (category) => category.id !== button.dataset.removeCategory
    );
    await saveCategories(nextCategories.length ? nextCategories : DEFAULT_CATEGORIES);
  });

  document.getElementById("reset-categories").addEventListener("click", async () => {
    await saveCategories(DEFAULT_CATEGORIES);
  });
}

function renderFilters() {
  const filters = document.getElementById("filters");
  const filterCategories = [{ id: "all", label: "All" }, ...categories];
  filters.innerHTML = filterCategories.map(
    ({ id, label }) => `
      <button class="filter${id === activeCategory ? " is-active" : ""}" data-category="${id}" type="button">
        ${label}
      </button>
    `
  ).join("");
}

function renderSettings() {
  const list = document.getElementById("category-list");
  list.innerHTML = categories.map(
    (category) => `
      <div class="category-row">
        <input data-category-label="${escapeAttribute(category.id)}" value="${escapeAttribute(category.label)}" maxlength="28" aria-label="Category name">
        <button type="button" class="icon-button remove-category" aria-label="Remove ${escapeAttribute(category.label)}" data-remove-category="${escapeAttribute(category.id)}"></button>
      </div>
    `
  ).join("");
}

function render() {
  const displayItems = items.map(normalizeDisplayItem);
  const visibleItems = displayItems
    .filter((item) => activeCategory === "all" || item.category === activeCategory)
    .filter(matchesSearch);

  document.getElementById("count").textContent = `${items.length} ${
    items.length === 1 ? "item" : "items"
  }`;
  document.getElementById("total").textContent = formatCollectionTotal(displayItems);

  const container = document.getElementById("items");
  if (!visibleItems.length) {
    container.innerHTML = `
      <div class="empty">
        <div>
          <strong>${searchQuery ? "No matches" : "No saved items"}</strong>
          <span>${searchQuery ? "Try another name, category, or source." : "Right click a product and save it here."}</span>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = visibleItems.map(renderItem).join("");
  container.querySelectorAll("[data-remove-id]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      await removeItem(button.dataset.removeId);
    });
  });
}

function renderItem(item) {
  const category = categoryLabel(item.category);
  const rubText = item.price.rubText || "";
  const originalText = item.price.originalText || "";

  return `
    <article class="item">
      <a class="media" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">
        ${
          item.imageUrl
            ? `<img src="${escapeAttribute(item.imageUrl)}" alt="">`
            : ""
        }
        <button class="remove" type="button" title="Remove" aria-label="Remove" data-remove-id="${escapeAttribute(item.id)}"></button>
      </a>
      <div class="item-copy">
        <div class="title-row">
          <a class="title" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
          <a class="source-icon" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer" title="${escapeAttribute(item.sourceDomain)}" style="--favicon-url: url('${escapeAttribute(cssUrl(item.faviconUrl))}')">
            <span class="source-fallback">${escapeHtml(item.sourceDomain.charAt(0).toUpperCase())}</span>
            <span class="source-favicon" aria-hidden="true"></span>
          </a>
        </div>
        <div class="price-line">
          ${rubText ? `<span class="rub-price">${escapeHtml(rubText)}</span>` : ""}
          ${originalText ? `<span class="original-price">${escapeHtml(originalText)}</span>` : ""}
        </div>
        <div class="category">${escapeHtml(category)}</div>
      </div>
    </article>
  `;
}

async function removeItem(id) {
  items = items.filter((item) => item.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: items });
  render();
}

function normalizeDisplayItem(item) {
  const url = normalizeUrl(item.url);
  const price = normalizeDisplayPrice(item);
  const sourceDomain = item.sourceDomain || sourceDomainFromUrl(url);

  return {
    ...item,
    id: item.id || productId(url),
    url,
    title: cleanTitle(item.title) || "Saved product",
    category: item.category || categories[0]?.id || "tops",
    sourceDomain,
    faviconUrl: item.faviconUrl || faviconUrlFromUrl(url),
    price
  };
}

function normalizeDisplayPrice(item) {
  const storedPrice = item.price || {};
  const parsed = normalizePrice({
    amount: storedPrice.amount ?? item.priceAmount,
    currency: storedPrice.currency ?? item.currency,
    text: storedPrice.originalText ?? item.priceText
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
    rubAmount,
    rubText
  };
}

function matchesSearch(item) {
  if (!searchQuery) {
    return true;
  }

  return [
    item.title,
    item.brand,
    item.category,
    categoryLabel(item.category),
    item.sourceDomain,
    item.price.originalText,
    item.price.rubText
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(searchQuery);
}

function categoryLabel(category) {
  return (
    categories.find((entry) => entry.id === category)?.label ||
    cleanCategoryLabel(category) ||
    "Saved"
  );
}

async function saveCategories(nextCategories) {
  categories = normalizeCategories(nextCategories);
  await chrome.storage.local.set({ [CATEGORY_STORAGE_KEY]: categories });
  renderFilters();
  renderSettings();
  render();
}

function normalizeCategories(value) {
  const source = Array.isArray(value) ? value : DEFAULT_CATEGORIES;
  const seen = new Set();

  return source
    .map((category) => ({
      id: slugify(category.id || category.label),
      label: cleanCategoryLabel(category.label || category.id)
    }))
    .filter((category) => category.id && category.label)
    .filter((category) => {
      if (seen.has(category.id) || category.id === "all" || category.id === "auto") {
        return false;
      }
      seen.add(category.id);
      return true;
    })
    .slice(0, 12);
}

function hasCategory(id) {
  return Boolean(id && categories.some((category) => category.id === id));
}

function uniqueCategoryId(label) {
  const base = slugify(label) || "category";
  let id = base;
  let index = 2;

  while (hasCategory(id) || id === "all" || id === "auto") {
    id = `${base}-${index}`;
    index += 1;
  }

  return id;
}

function cleanCategoryLabel(value) {
  return String(value || "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 28);
}

function slugify(value) {
  return cleanCategoryLabel(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function formatCollectionTotal(collection) {
  const priced = collection.filter((item) => Number.isFinite(item.price.rubAmount));

  if (!priced.length) {
    return `${collection.length} saved`;
  }

  const total = priced.reduce((sum, item) => sum + item.price.rubAmount, 0);
  return formatRubPrice(total);
}

function normalizePrice({ amount, currency, text } = {}) {
  const parsed = parsePriceFromText(text, currency);
  const priceAmount = numericPrice(amount) ?? parsed.amount;
  const priceCurrency = cleanText(currency || parsed.currency).toUpperCase();
  const originalText =
    parsed.originalText ||
    formatOriginalPrice(priceAmount, priceCurrency) ||
    cleanText(text);

  return {
    amount: priceAmount,
    currency: priceCurrency,
    originalText
  };
}

function parsePriceFromText(value, fallbackCurrency) {
  const text = cleanText(value);
  if (!text) {
    return {};
  }

  const symbolBefore = text.match(/([$€£¥₽])\s*([\d][\d\s.,]*)/);
  if (symbolBefore) {
    return parsedPrice(symbolBefore[2], currencyFromSymbol(symbolBefore[1]), symbolBefore[0]);
  }

  const symbolAfter = text.match(/([\d][\d\s.,]*)\s*([$€£¥₽])/);
  if (symbolAfter) {
    return parsedPrice(symbolAfter[1], currencyFromSymbol(symbolAfter[2]), symbolAfter[0]);
  }

  const codeBefore = text.match(
    new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b\\s*([\\d][\\d\\s.,]*)`, "i")
  );
  if (codeBefore) {
    return parsedPrice(codeBefore[2], codeBefore[1], codeBefore[0]);
  }

  const codeAfter = text.match(
    new RegExp(`([\\d][\\d\\s.,]*)\\s*\\b(${CURRENCY_CODE_PATTERN})\\b`, "i")
  );
  if (codeAfter) {
    return parsedPrice(codeAfter[1], codeAfter[2], codeAfter[0]);
  }

  if (fallbackCurrency && /^[\d\s.,]+$/.test(text)) {
    return parsedPrice(text, fallbackCurrency, formatOriginalPrice(text, fallbackCurrency));
  }

  return {};
}

function parsedPrice(rawAmount, currency, originalText) {
  const amount = parseLocalizedNumber(rawAmount);
  if (!Number.isFinite(amount)) {
    return {};
  }

  return {
    amount,
    currency: cleanText(currency).toUpperCase(),
    originalText: cleanText(originalText)
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

function currencyFromSymbol(symbol) {
  return {
    "$": "USD",
    "€": "EUR",
    "£": "GBP",
    "¥": "JPY",
    "₽": "RUB"
  }[symbol] || "";
}

function cleanTitle(value) {
  return cleanText(
    stripPriceFromText(value)
      .replace(/\s*\|\s*FARFETCH.*$/i, "")
      .replace(/\s*-\s*FARFETCH.*$/i, "")
      .replace(/\bnew season\b/gi, "")
  );
}

function stripPriceFromText(value) {
  return cleanText(value)
    .replace(/[$€£¥₽]\s*[\d][\d\s.,]*/g, "")
    .replace(/[\d][\d\s.,]*\s*[$€£¥₽]/g, "")
    .replace(new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b\\s*[\\d][\\d\\s.,]*`, "gi"), "")
    .replace(new RegExp(`[\\d][\\d\\s.,]*\\s*\\b(${CURRENCY_CODE_PATTERN})\\b`, "gi"), "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(value) {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function sourceDomainFromUrl(value) {
  try {
    return new URL(value).hostname.replace(/^www\./i, "");
  } catch {
    return "source";
  }
}

function faviconUrlFromUrl(value) {
  const domain = sourceDomainFromUrl(value);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
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

function parseLocalizedNumber(value) {
  let text = String(value || "").replace(/\s/g, "");
  if (!text) {
    return undefined;
  }

  if (text.includes(",") && text.includes(".")) {
    text = text.replace(/,/g, "");
  } else if (text.includes(",") && !text.includes(".")) {
    const commaIndex = text.lastIndexOf(",");
    const decimals = text.length - commaIndex - 1;
    text = decimals === 2 ? text.replace(",", ".") : text.replace(/,/g, "");
  }

  const amount = Number.parseFloat(text);
  return Number.isFinite(amount) ? amount : undefined;
}

function productId(url) {
  let hash = 0;
  for (let index = 0; index < url.length; index += 1) {
    hash = (hash << 5) - hash + url.charCodeAt(index);
    hash |= 0;
  }
  return `wishlisted-${Math.abs(hash)}`;
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
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
