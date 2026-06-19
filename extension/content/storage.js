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
  const sanitized = sanitizeStorageValue(value);
  try {
    await chrome.storage.local.set({ [key]: sanitized });
  } catch (error) {
    throw normalizeExtensionError(error);
  }
}

async function getLocalStorageValue(keys) {
  try {
    return await chrome.storage.local.get(keys);
  } catch (error) {
    throw normalizeExtensionError(error);
  }
}

function normalizeExtensionError(error) {
  if (/extension context invalidated/i.test(String(error?.message || error))) {
    removeStaleExtensionRoots();
    return new Error("Stash was reloaded. Refresh this page and try again.");
  }
  return error;
}

function sanitizeStorageValue(value) {
  if (value === undefined || typeof value === "function" || typeof value === "symbol") {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map(sanitizeStorageValue)
      .filter((entry) => entry !== undefined);
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([entryKey, entryValue]) => [entryKey, sanitizeStorageValue(entryValue)])
      .filter(([, entryValue]) => entryValue !== undefined)
  );
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
    faviconUrl: product.faviconUrl || faviconUrlFromUrl(url),
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
    category: inferredCategory,
    createdAt: new Date().toISOString()
  };
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
    ["bags", /\b(bag|bags|tote|clutch|backpack|crossbody|shoulder bag)\b/],
    ["accessories", /\b(accessory|accessories|belt|belts|cap|caps|hat|hats|beanie|scarf|scarves|sunglasses|glasses|wallet|wallets|pouch|pouches|jewelry|jewellery|necklace|bracelet|ring|watch|watches|socks|tie|ties)\b/],
    ["outerwear", /\b(jacket|coat|parka|blazer|trench|bomber|overcoat|vest|gilet)\b/],
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
