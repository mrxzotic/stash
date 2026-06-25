function bindPanelExportEvents(root) {
  bindPanelExcelExportEvents(root);

  root.querySelector("[data-export-backup]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (panelHasExportableItems()) {
      safelyRunPanelAction(exportTuckioBackup);
    }
  });

  const importInput = root.querySelector("[data-import-backup-file]");
  root.querySelector("[data-import-backup]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    importInput?.click();
  });

  importInput?.addEventListener("change", (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) {
      return;
    }

    safelyRunPanelAction(() => importTuckioBackupFile(file));
  });

  bindPanelResetEvents(root);
}

function exportTuckioBackup() {
  const backup = {
    schema: BACKUP_SCHEMA,
    exportedAt: new Date().toISOString(),
    extensionVersion: chrome.runtime?.getManifest?.().version || "",
    items: Array.isArray(panelState.items) ? panelState.items : [],
    categories: normalizeCategories(panelState.categories),
    settings: normalizePanelSettings({
      summaryCurrency: panelState.summaryCurrency,
      backgroundTheme: panelState.backgroundTheme,
      compactView: panelState.compactView,
      hoverHints: panelState.hoverHints,
      language: panelState.language
    })
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `tuckio-backup-${backup.exportedAt.slice(0, 10)}.json`;
  link.rel = "noreferrer";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function importTuckioBackupFile(file) {
  if (file.size > 6 * 1024 * 1024) {
    throw importBackupError(t("Choose a Tuckio JSON backup under 6 MB."));
  }

  const importedAt = new Date().toISOString();
  const parsed = parseTuckioBackupJson(await file.text());
  const source = Array.isArray(parsed) ? { items: parsed } : parsed;
  const categories = mergeImportedCategories(source?.categories);
  const importedItems = normalizeImportedBackupItems(source?.items, categories, importedAt);
  const nextItems = mergeImportedItems(importedItems);
  const settings = normalizePanelSettings({
    summaryCurrency: panelState.summaryCurrency,
    backgroundTheme: panelState.backgroundTheme,
    compactView: panelState.compactView,
    hoverHints: panelState.hoverHints,
    language: panelState.language,
    ...(source?.settings || {})
  });
  const previousSummary = panelSummaryTextForItems(panelState.items);

  panelState.items = nextItems;
  panelState.categories = categories;
  panelState.summaryCurrency = settings.summaryCurrency;
  panelState.summaryRate = defaultSummaryRate(settings.summaryCurrency);
  panelState.backgroundTheme = settings.backgroundTheme;
  panelState.compactView = settings.compactView;
  panelState.hoverHints = settings.hoverHints;
  panelState.language = settings.language;
  panelState.founderPromoOpen = false;
  panelState.searchOpen = false;
  panelState.searchQuery = "";
  panelState.brandCloudOpen = false;
  panelState.brandFilterKey = "";
  panelState.brandFilterLabel = "";
  panelState.categoryComposerOpen = false;
  panelState.deleteCategoryId = "";
  panelState.deleteItemId = "";
  panelState.editItemId = "";
  closePanelArchivedView();
  if (panelState.activeCategory !== "all" && !hasCategory(categories, panelState.activeCategory)) {
    panelState.activeCategory = "all";
  }

  await Promise.all([
    setLocalStorageValue(STORAGE_KEY, nextItems),
    setLocalStorageValue(CATEGORY_STORAGE_KEY, categories),
    setLocalStorageValue(CATEGORY_SCHEMA_STORAGE_KEY, CATEGORY_SCHEMA_VERSION),
    setLocalStorageValue(SETTINGS_STORAGE_KEY, settings)
  ]);
  renderTuckioPanel({ summaryAnimationFrom: previousSummary });
}

function parseTuckioBackupJson(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || (typeof parsed !== "object" && !Array.isArray(parsed))) {
      throw new Error();
    }
    if (parsed.schema && parsed.schema !== BACKUP_SCHEMA && parsed.schema !== LEGACY_BACKUP_SCHEMA) {
      throw new Error();
    }
    return parsed;
  } catch {
    throw importBackupError(t("Choose a valid Tuckio JSON backup."));
  }
}

function mergeImportedCategories(value) {
  const imported = value === undefined
    ? normalizeCategories(panelState.categories)
    : normalizeCategories(value);
  const categories = normalizeCategories([
    ...(imported.length ? imported : DEFAULT_CATEGORIES),
    ...normalizeCategories(panelState.categories)
  ]);

  return categories.length ? categories : DEFAULT_CATEGORIES;
}

function normalizeImportedBackupItems(value, categories, importedAt) {
  if (!Array.isArray(value)) {
    throw importBackupError(t("Backup JSON must include an items array."));
  }

  const items = value
    .map((item) => normalizeImportedBackupItem(item, categories, importedAt))
    .filter(Boolean);
  if (value.length && !items.length) {
    throw importBackupError(t("Backup JSON did not include any valid saved items."));
  }

  return items;
}

function normalizeImportedBackupItem(item, categories, importedAt) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const url = importableHttpUrl(item.url);
  if (!url) {
    return null;
  }

  const imageUrls = normalizeImportedImageUrls(item.imageUrls, item.imageUrl);
  const normalized = normalizePanelItem({ ...item, url, imageUrl: imageUrls[0] || "", imageUrls });
  const category = hasCategory(categories, normalized.category)
    ? normalized.category
    : categories[0]?.id || DEFAULT_CATEGORIES[0].id;

  return compactObject({
    ...item,
    id: productId(normalized.url),
    source: cleanText(item.source) || sourceNameFromUrl(normalized.url),
    sourceDomain: normalized.sourceDomain,
    faviconUrl: normalized.faviconUrl,
    url: normalized.url,
    title: normalized.title,
    brand: normalized.brand,
    price: normalized.price,
    priceText: normalized.price.originalText,
    priceAmount: normalized.price.amount,
    currency: normalized.price.currency,
    compareAtPriceText: normalized.price.compareAtText,
    compareAtPriceAmount: normalized.price.compareAtAmount,
    isSale: normalized.price.isSale,
    extraction: normalizeExtractionQuality(item.extraction),
    imageUrl: normalized.imageUrls[0] || "",
    imageUrls: normalized.imageUrls,
    category,
    shortlistedAt: normalizedImportDate(item.shortlistedAt),
    decision: normalizeImportedDecision(item.decision),
    createdAt: normalizedImportDate(item.createdAt) || importedAt,
    updatedAt: normalizedImportDate(item.updatedAt),
    archivedAt: normalizedImportDate(item.archivedAt)
  });
}

function mergeImportedItems(importedItems) {
  const seen = new Set();
  return [
    ...importedItems,
    ...(Array.isArray(panelState.items) ? panelState.items.map(normalizePanelItem) : [])
  ]
    .filter((item) => {
      const key = productIdentityKey(item.url) || item.id;
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .slice(0, 300);
}

function normalizeImportedImageUrls(values, primary = "") {
  return normalizeProductImageUrls(
    [primary, ...flattenImageUrlValues(values)].map(importableHttpUrl).filter(Boolean),
    "",
    SAVED_IMAGE_URL_LIMIT
  );
}

function normalizeImportedDecision(value) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const state = cleanText(value.state).toLowerCase();
  if (state !== "bought" && state !== "skipped") {
    return undefined;
  }

  return compactObject({
    state,
    decidedAt: normalizedImportDate(value.decidedAt)
  });
}

function importableHttpUrl(value) {
  try {
    const url = new URL(cleanText(value));
    return /^https?:$/i.test(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizedImportDate(value) {
  const text = cleanText(value);
  const time = Date.parse(text);
  return Number.isFinite(time) ? new Date(time).toISOString() : "";
}

function importBackupError(message) {
  const error = new Error(message);
  error.title = t("Could not import JSON");
  return error;
}
