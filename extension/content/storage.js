async function setLocalStorageValue(key, value) {
  assertKnownStorageKeys(key);
  const sanitized = sanitizeStorageValue(storageValueForWrite(key, value));
  try {
    await setTuckioLocalStorageValue(key, sanitized);
    return sanitized;
  } catch (error) {
    if (shouldRetryStorageQuotaWrite(key, value, error)) {
      return retryQuotaStorageWrite(key, value, sanitized, error);
    }
    throw normalizeExtensionError(error);
  }
}

async function removeStorageKeys(keys) {
  const removable = keys.filter(Boolean);
  if (!removable.length || typeof chrome.storage.local.remove !== "function") {
    return;
  }

  try {
    await chrome.storage.local.remove(removable);
  } catch {
  }
}

function storageValueForWrite(key, value, options = {}) {
  if (key !== STORAGE_KEY || !Array.isArray(value) || !canCompactSavedItems()) {
    return value;
  }

  return value
    .map((item) => compactSavedItemForStorage(item, options))
    .filter(Boolean)
    .slice(0, 300);
}

function canCompactSavedItems() {
  return typeof normalizePanelItem === "function" &&
    typeof normalizeProductImageUrls === "function" &&
    typeof sourceNameFromUrl === "function" &&
    typeof cleanText === "function";
}

function compactSavedItemForStorage(item, options = {}) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const normalized = normalizePanelItem(item);
  const imageUrls = normalizeProductImageUrls(normalized.imageUrls, normalized.imageUrl, SAVED_IMAGE_URL_LIMIT);
  const price = normalized.price || {};
  const source = cleanText(item.source) || sourceNameFromUrl(normalized.url);
  const storedPrice = compactStorageObject({
    amount: price.amount,
    currency: price.currency,
    originalText: price.originalText,
    compareAtAmount: price.compareAtAmount,
    compareAtText: price.compareAtText,
    isSale: price.isSale
  });
  const coreItem = compactStorageObject({
    id: normalized.id,
    source,
    sourceDomain: normalized.sourceDomain,
    url: normalized.url,
    title: normalized.title,
    brand: normalized.brand,
    price: storedPrice,
    priceCheck: compactStoragePriceCheck(item.priceCheck),
    extraction: normalizeExtractionQuality(item.extraction),
    category: normalized.category,
    shortlistedAt: compactStorageDate(item.shortlistedAt),
    decision: compactStorageDecision(item.decision),
    createdAt: compactStorageDate(item.createdAt),
    updatedAt: compactStorageDate(item.updatedAt),
    archivedAt: compactStorageDate(item.archivedAt)
  });

  if (options.mode === "tiny") {
    return coreItem;
  }

  if (options.mode === "lean") {
    return compactStorageObject({
      ...coreItem,
      imageUrl: imageUrls[0] || ""
    });
  }

  return compactStorageObject({
    ...coreItem,
    faviconUrl: normalized.faviconUrl,
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    imageUrl: imageUrls[0] || "",
    imageUrls,
    category: normalized.category,
    shortlistedAt: compactStorageDate(item.shortlistedAt),
    decision: compactStorageDecision(item.decision),
    createdAt: compactStorageDate(item.createdAt),
    updatedAt: compactStorageDate(item.updatedAt),
    archivedAt: compactStorageDate(item.archivedAt)
  });
}

function compactStorageObject(object) {
  return Object.fromEntries(
    Object.entries(object)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

function compactStorageDate(value) {
  return cleanText(value).slice(0, 40) || undefined;
}

function compactStorageDecision(value) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const state = cleanText(value.state).toLowerCase();
  if (state !== "bought" && state !== "skipped") {
    return undefined;
  }

  return compactStorageObject({
    state,
    decidedAt: compactStorageDate(value.decidedAt)
  });
}

async function getLocalStorageValue(keys) {
  assertKnownStorageKeys(keys);
  const keyList = storageKeyList(keys);
  const storageKeys = [...new Set([
    ...keyList,
    ...keyList.map((key) => LEGACY_STORAGE_KEYS.get(key)).filter(Boolean)
  ])];
  try {
    const stored = await chrome.storage.local.get(storageKeys);
    await migrateLegacyStorageValues(stored, keyList);
    return stored;
  } catch (error) {
    throw normalizeExtensionError(error);
  }
}

function normalizeExtensionError(error) {
  if (/extension context invalidated/i.test(String(error?.message || error))) {
    removeStaleExtensionRoots();
    return new Error(t("Tuckio was reloaded. Refresh this page and try again."));
  }
  return error;
}

function assertKnownStorageKeys(keys) {
  const keyList = storageKeyList(keys);

  for (const key of keyList) {
    if (!ALLOWED_STORAGE_KEYS.has(key)) {
      throw new Error(t("Unexpected Tuckio storage key."));
    }
  }
}

function storageKeyList(keys) {
  return Array.isArray(keys)
    ? keys
    : typeof keys === "string"
      ? [keys]
      : keys && typeof keys === "object"
        ? Object.keys(keys)
        : [];
}

async function migrateLegacyStorageValues(stored, keyList) {
  const migrated = {};
  const migratedLegacyKeys = [];
  keyList.forEach((key) => {
    const legacyKey = LEGACY_STORAGE_KEYS.get(key);
    if (stored[key] === undefined && legacyKey && stored[legacyKey] !== undefined) {
      stored[key] = storageValueForWrite(key, stored[legacyKey]);
      migrated[key] = stored[key];
      migratedLegacyKeys.push(legacyKey);
    }
  });

  if (Object.keys(migrated).length) {
    await chrome.storage.local.set(sanitizeStorageValue(migrated));
    await removeStorageKeys(migratedLegacyKeys);
  }
}

function sanitizeStorageValue(value, seen = new WeakSet(), depth = 0) {
  if (value === undefined || typeof value === "function" || typeof value === "symbol") {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string") {
    return value.slice(0, STORAGE_MAX_STRING_LENGTH);
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (depth >= STORAGE_MAX_DEPTH || seen.has(value)) {
    return undefined;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value
      .slice(0, STORAGE_MAX_ARRAY_LENGTH)
      .map((entry) => sanitizeStorageValue(entry, seen, depth + 1))
      .filter((entry) => entry !== undefined);
  }

  return Object.fromEntries(
    Object.entries(value)
      .slice(0, STORAGE_MAX_OBJECT_KEYS)
      .map(([entryKey, entryValue]) => [
        sanitizeStorageObjectKey(entryKey),
        sanitizeStorageValue(entryValue, seen, depth + 1)
      ])
      .filter(([entryKey, entryValue]) => entryKey && entryValue !== undefined)
  );
}

function sanitizeStorageObjectKey(key) {
  const text = String(key || "").trim().slice(0, 80);
  return /^[A-Za-z0-9_.:-]+$/.test(text) ? text : "";
}

async function normalizeItem(product, category, categories) {
  const url = normalizeUrl(product.url || location.href);
  const price = repairKnownInstallmentPrice(normalizePrice({
    amount: product.priceAmount,
    currency: product.currency,
    text: product.priceText,
    compareAtAmount: product.compareAtPriceAmount,
    compareAtText: product.compareAtPriceText
  }), url);
  const title =
    cleanProductTitle(stripPriceFromText(product.title), product.brand, url) ||
    "Saved Product";
  const inferredCategory = hasCategory(categories, category)
    ? category
    : inferCategory(product, categories);
  const sourceDomain = product.sourceDomain || sourceDomainFromUrl(url);

  return {
    id: productId(url),
    source: product.source || sourceNameFromUrl(url),
    sourceDomain,
    faviconUrl: faviconUrlForSource(url, product.faviconUrl),
    url,
    title,
    brand: cleanBrandName(product.brand) || sourceNameFromUrl(url),
    price: {
      amount: price.amount,
      currency: price.currency,
      originalText: price.originalText,
      compareAtAmount: price.compareAtAmount,
      compareAtText: price.compareAtText,
      isSale: price.isSale
    },
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    imageUrl: toAbsoluteUrl(product.imageUrl),
    imageUrls: normalizeProductImageUrls(product.imageUrls, product.imageUrl, SAVED_IMAGE_URL_LIMIT),
    extraction: normalizeExtractionQuality(product.extraction),
    category: inferredCategory,
    createdAt: new Date().toISOString()
  };
}

function normalizeExtractionQuality(value) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return sanitizeStorageValue(value);
}

function inferCategory(product, categories = DEFAULT_CATEGORIES) {
  const signals = [
    product.title,
    product.rawCategory,
    [product.title, product.brand, product.rawCategory].filter(Boolean).join(" ")
  ];

  for (const signal of signals) {
    const intent = inferCategoryIntent(signal);
    const categoryId = categoryIdForIntent(categories, intent);
    if (categoryId) {
      return categoryId;
    }
  }

  return categoryIdForIntent(categories, "tops") || categories[0]?.id || "tops";
}

function inferCategoryIntent(value) {
  const text = cleanText(value).toLowerCase();
  if (!text) {
    return "";
  }

  const rules = [
    ["shoes", /\b(boot|boots|shoe|shoes|sneaker|sneakers|loafer|loafers|sandal|sandals|heel|heels|pump|pumps)\b/],
    ["bags", /\b(rimowa|bag|bags|tote|clutch|backpack|crossbody|shoulder bag|luggage|suitcase|suitcases|carry-?on|trolley|duffel|duffle|weekender|check-?in|check in)\b/],
    ["accessories", /\b(accessory|accessories|belt|belts|cap|caps|hat|hats|beanie|scarf|scarves|sunglasses|glasses|wallet|wallets|pouch|pouches|jewelry|jewellery|necklace|bracelet|ring|watch|watches|socks|tie|ties)\b/],
    ["outerwear", /\b(jacket|coat|windbreaker|parka|blazer|trench|bomber|overcoat|vest|gilet)\b/],
    ["bottoms", /\b(trouser|trousers|jeans|pants|shorts|skirt|leggings|cargo)\b/],
    ["tops", /\b(t-shirt|tee|shirt|top|sweater|hoodie|sweatshirt|sweat|knit|cardigan|polo|zip hoodie)\b/]
  ];

  return rules.find(([, pattern]) => pattern.test(text))?.[0] || "";
}

function categoryIdForIntent(categories, intent) {
  const aliases = {
    tops: ["tops", "top", "shirts", "shirt", "tees", "tee", "knitwear", "sweats"],
    bottoms: ["bottoms", "bottom", "pants", "trousers", "jeans", "shorts"],
    outerwear: ["outerwear", "jackets", "jacket", "coats", "coat"],
    shoes: ["shoes", "shoe", "footwear", "sneakers", "boots"],
    bags: ["bags", "bag"],
    accessories: ["accessories", "accessory", "access", "jewelry", "jewellery", "belts", "hats", "caps"]
  };
  const candidates = aliases[intent] || [];
  const fallbackIntent = intent === "outerwear" ? "tops" : "";
  const fallbackCandidates = fallbackIntent ? aliases[fallbackIntent] || [] : [];
  const accepted = new Set([intent, ...candidates, ...fallbackCandidates].filter(Boolean));

  return categories.find((category) => {
    const id = slugify(category.id);
    const label = slugify(category.label);
    return accepted.has(id) || accepted.has(label);
  })?.id;
}
