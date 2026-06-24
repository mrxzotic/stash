function firstValue(sources, key) {
  for (const source of sources) {
    const value = source?.[key];
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === "string" && value.trim() === "") {
      continue;
    }
    return value;
  }
  return undefined;
}

async function getCategories() {
  const stored = await getLocalStorageValue([
    CATEGORY_STORAGE_KEY,
    CATEGORY_SCHEMA_STORAGE_KEY
  ]);
  const categories = normalizeCategories(stored[CATEGORY_STORAGE_KEY]);

  if (stored[CATEGORY_SCHEMA_STORAGE_KEY] === CATEGORY_SCHEMA_VERSION) {
    return categories;
  }

  const nextCategories = shouldAddAccessoriesCategory(categories)
    ? [...categories, { id: "accessories", label: "Accessories" }].slice(0, 12)
    : categories;

  if (nextCategories.length !== categories.length) {
    await setLocalStorageValue(CATEGORY_STORAGE_KEY, nextCategories);
  }
  await setLocalStorageValue(CATEGORY_SCHEMA_STORAGE_KEY, CATEGORY_SCHEMA_VERSION);

  return nextCategories;
}

async function getPanelSettings() {
  const stored = await getLocalStorageValue(SETTINGS_STORAGE_KEY);
  return normalizePanelSettings(stored[SETTINGS_STORAGE_KEY]);
}

function normalizeCategories(value) {
  const categories = Array.isArray(value) ? value : DEFAULT_CATEGORIES;
  const seen = new Set();

  return categories
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

function shouldAddAccessoriesCategory(categories) {
  const categoryIds = new Set(categories.map((category) => slugify(category.id || category.label)));
  const categoryLabels = new Set(categories.map((category) => slugify(category.label)));
  const hasAccessories =
    categoryIds.has("accessories") ||
    categoryIds.has("access") ||
    categoryLabels.has("accessories") ||
    categoryLabels.has("access");
  const hasOldDefaults = ["tops", "bottoms", "outerwear", "shoes", "bags"].every((id) =>
    categoryIds.has(id)
  );

  return !hasAccessories && hasOldDefaults;
}

function normalizePanelSettings(value) {
  const currency = cleanText(value?.summaryCurrency).toUpperCase();
  const backgroundTheme = cleanText(value?.backgroundTheme).toLowerCase();
  const language = cleanText(value?.language).toLowerCase();
  return {
    summaryCurrency: isSummaryCurrency(currency)
      ? currency
      : DEFAULT_SETTINGS.summaryCurrency,
    backgroundTheme: isBackgroundTheme(backgroundTheme)
      ? backgroundTheme
      : DEFAULT_SETTINGS.backgroundTheme,
    compactView: Boolean(value?.compactView),
    hoverHints: value?.hoverHints !== false,
    language: isPanelLanguage(language) ? language : DEFAULT_SETTINGS.language
  };
}

function summaryCurrencyOptions() {
  return Object.keys(DEFAULT_RUB_RATES);
}

function summaryCurrencyPickerOptions(currentCurrency = "") {
  const selectedCurrency = cleanText(currentCurrency).toUpperCase();
  const options = SUMMARY_CURRENCY_PICKER_OPTIONS.filter(isSummaryCurrency);
  if (selectedCurrency && isSummaryCurrency(selectedCurrency) && !options.includes(selectedCurrency)) {
    options.push(selectedCurrency);
  }

  return options;
}

function isSummaryCurrency(currency) {
  return summaryCurrencyOptions().includes(cleanText(currency).toUpperCase());
}

function backgroundThemeOptions() {
  return [
    { id: "warm", label: "Warm" },
    { id: "white", label: "White" },
    { id: "ice", label: "Ice" },
    { id: GRAPHITE_BACKGROUND_THEME, label: "Graphite" }
  ];
}

function isBackgroundTheme(theme) {
  const id = cleanText(theme).toLowerCase();
  return backgroundThemeOptions().some((option) => option.id === id);
}

function isPanelLanguage(language) {
  const id = cleanText(language).toLowerCase();
  return PANEL_LANGUAGE_OPTIONS.some((option) => option.id === id);
}

function hasCategory(categories, id) {
  return Boolean(id && categories.some((category) => category.id === id));
}

function categoryLabelFor(categories, id) {
  const category = categories.find((item) => item.id === id);
  return category ? panelCategoryDisplayLabel(category) : cleanCategoryLabel(id) || t("Saved");
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
