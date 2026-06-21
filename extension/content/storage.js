async function upsertItem(item) {
  const stored = await getLocalStorageValue(STORAGE_KEY);
  const currentItems = Array.isArray(stored[STORAGE_KEY])
    ? stored[STORAGE_KEY]
    : [];
  const nextItems = [
    item,
    ...currentItems.filter((existing) => existing.url !== item.url)
  ].slice(0, 300);

  await setLocalStorageValue(STORAGE_KEY, nextItems);
  return nextItems;
}

async function setLocalStorageValue(key, value) {
  assertKnownStorageKeys(key);
  const sanitized = sanitizeStorageValue(value);
  try {
    await chrome.storage.local.set({ [key]: sanitized });
  } catch (error) {
    throw normalizeExtensionError(error);
  }
}

async function getLocalStorageValue(keys) {
  assertKnownStorageKeys(keys);
  try {
    return await chrome.storage.local.get(keys);
  } catch (error) {
    throw normalizeExtensionError(error);
  }
}

function normalizeExtensionError(error) {
  if (/extension context invalidated/i.test(String(error?.message || error))) {
    removeStaleExtensionRoots();
    return new Error("Stashed was reloaded. Refresh this page and try again.");
  }
  return error;
}

function assertKnownStorageKeys(keys) {
  const keyList = Array.isArray(keys)
    ? keys
    : typeof keys === "string"
      ? [keys]
      : keys && typeof keys === "object"
        ? Object.keys(keys)
        : [];

  for (const key of keyList) {
    if (!ALLOWED_STORAGE_KEYS.has(key)) {
      throw new Error("Unexpected Stashed storage key.");
    }
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
  const price = normalizePrice({
    amount: product.priceAmount,
    currency: product.currency,
    text: product.priceText,
    compareAtAmount: product.compareAtPriceAmount,
    compareAtText: product.compareAtPriceText
  });
  const rubPrice = await convertPriceToRub(price);
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
      isSale: price.isSale,
      rubAmount: rubPrice.amount,
      rubText: rubPrice.text,
      rate: rubPrice.rate,
      rateSource: rubPrice.source
    },
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    rubPriceText: rubPrice.text,
    rubPriceAmount: rubPrice.amount,
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
