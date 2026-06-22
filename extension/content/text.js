function isNoiseLine(value) {
  const text = cleanText(value);
  return /^(new|new in|new season|exclusive|runway|available in|sale|regular price|sale price|unit price|sold out|add to cart|add to bag|add to basket|add to wish\s?list|wish\s?list|save|size|sizes|size guide|select size|item added|item added view cart|view cart|recommended|sponsored|popular products|copy|copied|email\*?|shipping|returns|details|all details|product details|composition|care|composition and care|skip to main content|man|men|mens|women|womens|unisex|collections?|download (?:the )?app(?:\s+for\s+\d{1,2}%\s+off)?|app-only.*|free delivery(?:\s+from\b.*)?|free shipping(?:\s+in\b.*)?|free(?:\s+online)?\s+returns?|free shipping and returns|find\s*(?:&|and)\s*reserve(?:\s+in\s+store)?|our signature packaging|signature packaging|powered by onetrust|accept all cookies|your cookie settings|cookie settings|cookie preferences|privacy preferences|manage cookies|slide\s+\d+|carousel\s+slide\s+\d+|image\s+\d+|цвет\s*[:#-].*|коллекци(?:я|и)|состав\s+и\s+уход|гид\s+по\s+размерам|таблица\s+размеров|размеры|доставка|возврат|доставка\s+и\s+возврат|оплата|добавить(?:\s+в)?\s+корзину|в\s+корзину|купить)$/i.test(
    text
  ) || /^(?:sku|article|арт(?:икул)?\.?)\s*[:#-]?\s*[\p{L}0-9][\p{L}0-9\s._-]*$/iu.test(
    text
  ) || /^\d+\s+available\s+colou?rs?$/i.test(
    text
  ) || /^(?:\+\s*)?(?:colou?r|\d+\s+colou?rs?)$/i.test(
    text
  ) || /^(favorite|share|copy link|copied link|telegram|vk|vkontakte|whatsapp|pinterest|поделиться|скопировать|скопировать ссылку|ссылка скопирована|вконтакте|избранное)$/i.test(
    text
  ) || /^image:/i.test(text) ||
    /\bimage\s+number\s+\d+\b/i.test(text);
}

function looksLikeMeasurementLine(value) {
  const text = cleanText(value);
  return (
    /^\d+(?:[.,]\d+)?\s*x\s*\d+(?:[.,]\d+)?(?:\s*x\s*\d+(?:[.,]\d+)?)?(?:\s*(?:cm|mm|in|inch|inches))?$/i.test(text) ||
    /^\d+(?:[.,]\d+)?\s*(?:cm|mm|in|inch|inches|kg|g)\b$/i.test(text) ||
    /^(?:(?:xxs|xs|s|m|l|xl|xxl|xxxl)(?:\s*(?:-|\/|to)\s*(?:xxs|xs|s|m|l|xl|xxl|xxxl))?|one size|os)$/i.test(text)
  );
}

function looksLikeProductName(value) {
  const text = cleanText(value);
  return /\b(?:sneakers?|shoes?|boots?|sandals?|loafers?|hoodies?|jackets?|bombers?|blousons?|windbreakers?|coats?|joggers?|trousers?|pants|chinos|jeans|shorts?|shirts?|t-shirts?|tees?|polos?|sweaters?|sweatshirts?|cardigans?|bags?|buckets?|totes?|backpacks?|luggage|suitcases?|cabins?|check[\s-]?in|glasses|sunglasses|frames?|watches?|caps?|hats?|beanies?|belts?|wallets?|scar(?:f|ves)|dresses?|skirts?|blazers?|zips?|pullovers?|crew(?:neck)?|alpaca|cloudmonster|cloudsolo|charms?|dice|necklaces?|джемпер|толстовка|брюки|шорты|рубашка|футболка|кроссовки|ботинки|куртка|сумка|очки|худи)\b/i.test(
    text
  ) || /(?:джемпер|толстовка|брюки|шорты|рубашка|футболка|кроссовки|ботинки|куртка|сумка|очки|худи)/i.test(text);
}

function looksLikeVariantDescriptor(value) {
  const words = normalizeComparableText(value).split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5 || looksLikeProductName(value)) {
    return false;
  }
  if (looksLikeModelColorwayDescriptorTitle(value)) {
    return false;
  }

  const colorWords = words.filter(isVariantColorWord);
  const distinctColorCount = new Set(colorWords).size;
  const descriptorCount = words.filter(isVariantDescriptorWord).length;

  return distinctColorCount >= 2 || (colorWords.length >= 1 && descriptorCount === words.length);
}

function looksLikeModelColorwayDescriptorTitle(value) {
  const text = cleanText(value);
  const words = normalizeComparableText(text).split(/\s+/).filter(Boolean);
  if (
    words.length < 2 ||
    words.length > 5 ||
    looksLikeProductName(text) ||
    looksLikeGenericCategoryTitle(text) ||
    isNoiseLine(text) ||
    looksLikePrice(text)
  ) {
    return false;
  }

  const [model, ...colorway] = words;
  return (
    model.length >= 2 &&
    !isVariantDescriptorWord(model) &&
    colorway.length > 0 &&
    colorway.every(isVariantDescriptorWord)
  );
}

function looksLikeModelColorwayTitle(value) {
  const text = cleanText(value);
  const words = normalizeComparableText(text).split(/\s+/).filter(Boolean);
  if (
    words.length < 2 ||
    words.length > 4 ||
    looksLikeProductName(text) ||
    looksLikeGenericCategoryTitle(text) ||
    isNoiseLine(text) ||
    looksLikePrice(text)
  ) {
    return false;
  }

  if (looksLikeModelColorwayDescriptorTitle(text)) {
    return true;
  }

  if (looksLikeVariantDescriptor(text)) {
    return false;
  }

  return words.every((word, index) =>
    word.length >= 2 || (index > 0 && index < words.length - 1 && /^[a-z]$/i.test(word))
  );
}

function isVariantColorWord(word) {
  return /^(black|white|grey|gray|blue|navy|nightfall|red|green|yellow|pink|purple|orange|brown|beige|tan|sand|camel|ivory|cream|ecru|silver|gold|golden|bronze|burgundy|bordeaux|wine|khaki|olive|taupe|charcoal|anthracite|natural|clear|multi)$/i.test(
    word
  );
}

function isVariantDescriptorWord(word) {
  return isVariantColorWord(word) || /^(light|dark|pale|deep|soft|warm|cool|off|melange|mélange|marled|washed|faded|heather|heathered|metallic)$/i.test(
    word
  );
}

function cleanBrandName(value) {
  const text = canonicalBrandName(cleanText(stripPriceFromText(value)));
  if (
    !text ||
    looksLikePrice(text) ||
    isNoiseLine(text) ||
    looksLikeMeasurementLine(text) ||
    looksLikeProductName(text) ||
    looksLikeVariantDescriptor(text) ||
    looksLikeModelColorwayDescriptorTitle(text)
  ) {
    return "";
  }

  return text;
}

function formatBrandName(value) {
  return (cleanBrandName(value) || cleanText(value) || "SOURCE").toLocaleUpperCase();
}

function canonicalBrandName(value) {
  const text = cleanText(value)
    .replace(/[®™]/g, "")
    .replace(/[._-]+/g, " ")
    .replace(/\b(?:us|usa|uk|eu|intl|international|official|store|shop|fashion)\b$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const key = text.toLocaleLowerCase();
  if (BRAND_ALIASES.has(key)) {
    return BRAND_ALIASES.get(key);
  }

  for (const [alias, canonical] of BRAND_ALIASES) {
    const normalizedAlias = alias.replace(/\s+/g, " ");
    if (key.startsWith(`${normalizedAlias} `)) {
      return canonical;
    }
  }

  return text;
}

function sourceDomainFromUrl(value) {
  try {
    return new URL(value || location.href, location.href).hostname.replace(/^www\./i, "");
  } catch {
    return location.hostname.replace(/^www\./i, "");
  }
}

function sourceNameFromUrl(value) {
  const domain = sourceDomainFromUrl(value);
  const label = domain.split(".")[0] || "Source";
  const brand = cleanBrandName(label);
  return brand && brand !== label ? brand : label.charAt(0).toUpperCase() + label.slice(1);
}

function cleanTitle(value, brand = "") {
  const brandText = cleanBrandName(brand);
  const titleText = stripTitleActionNoise(stripPriceFromText(value));
  if (isNoiseLine(titleText) || looksLikeMeasurementLine(titleText)) {
    return "";
  }

  const cleaned = stripLeadingBrandFromTitle(
    titleText
      .replace(/\s*\|\s*FARFETCH.*$/i, "")
      .replace(/\s*-\s*FARFETCH.*$/i, "")
      .replace(/\s*\|\s*LOEWE.*$/i, "")
      .replace(/\s*-\s*LOEWE.*$/i, "")
      .replace(/\s*\|\s*TOM FORD.*$/i, "")
      .replace(/\s*-\s*TOM FORD.*$/i, "")
      .replace(/\s*\|\s*AIM[ÉE] LEON DORE.*$/i, "")
      .replace(/\s*-\s*AIM[ÉE] LEON DORE.*$/i, "")
      .replace(/\bnew season\b/gi, "")
      .replace(/\b(?:available in|colour|color|size|sizes|view product|product details)\b/gi, "")
      .replace(/\s+(?:[-–—,|]\s*)?(?:sku|article|арт(?:икул)?\.?)\s*[:#-]?\s*[\p{L}0-9._-]+.*$/iu, "")
      .replace(/\s+\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{7,}\b$/g, "")
      .replace(/\s+(?:[-–—|])\s*(?:xxs|xs|s|m|l|xl|xxl|xxxl|o\/s|os|one size)$/i, "")
      .replace(/\s+(?:[-–—|])\s+(?:all|available|shop|select|size|men|women|unisex)\b.*$/i, "")
      .replace(/\s+\b(?:men|women|mens|womens|unisex)\b$/i, "")
      .replace(/\s+in\s+(black|white|blue|red|green|pink|grey|gray|brown|beige)$/i, " $1"),
    brandText
  );

  if (isNoiseLine(cleaned)) {
    return "";
  }

  return titleCaseTitle(cleaned);
}

function cleanProductTitle(value, brand = "", url = "") {
  const title = cleanTitle(value, brand);
  const urlTitle = cleanTitle(productTitleFromUrl(url), brand);

  if (!title) {
    return urlTitle;
  }

  if (shouldPreferUrlTitle(title, urlTitle)) {
    return urlTitle;
  }

  return title;
}

function shouldPreferUrlTitle(title, urlTitle) {
  if (!urlTitle || urlTitle.length < 5) {
    return false;
  }

  if (!title) {
    return true;
  }

  if (looksLikeDescriptiveTitle(title)) {
    return true;
  }

  if (looksLikeProductName(urlTitle) && !looksLikeProductName(title)) {
    return true;
  }

  if (looksLikeOnModelTitle(urlTitle) && !looksLikeOnModelTitle(title)) {
    return true;
  }

  const titleWords = title.split(/\s+/).filter(Boolean).length;
  const urlWords = urlTitle.split(/\s+/).filter(Boolean).length;
  if (looksLikeVariantDescriptor(title) && looksLikeProductName(urlTitle)) {
    return true;
  }

  if (urlWords >= titleWords + 2 && looksLikeGenericCategoryTitle(title)) {
    return true;
  }

  return title.length > 64 && urlTitle.length < title.length && urlWords >= 2 && urlWords <= titleWords;
}

function looksLikeGenericCategoryTitle(value) {
  const text = normalizeComparableText(value);
  if (!text || text.split(/\s+/).length > 4) {
    return false;
  }

  return /^(?:(?:bucket|shoulder|crossbody|tote|mini|small|medium|large|oversized|leather|designer|men|mens|women|womens)\s+)*(?:bags?|shoes?|sneakers?|boots?|sandals?|loafers?|jackets?|coats?|trousers?|pants|jeans|shorts?|shirts?|t-shirts?|tees?|polos?|sweaters?|sweatshirts?|cardigans?|dresses?|skirts?|blazers?|glasses|sunglasses|frames?|caps?|hats?|beanies?|belts?|wallets?|scarves?)$/i.test(text);
}

function looksLikeOnModelTitle(value) {
  return /\bcloud(?:runner|monster|surfer|vista|flyer|nova|swift|tilt|zone|boom|rock|ultra|flow|stratus|away)\b/i.test(
    cleanText(value)
  );
}

function looksLikeDescriptiveTitle(value) {
  const text = cleanText(value);
  if (!text) {
    return false;
  }

  return (
    /\b(?:all season|stretch cotton|cervotessile|crafted from|made from|composition|product details|select size|add to basket|add to cart)\b/i.test(text) ||
    /\bby\s+[A-Z][\p{L}\s.,'-]{6,}$/iu.test(text) ||
    text.split(/\s+/).filter(Boolean).length > 12
  );
}

function productTitleFromUrl(value) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value, location.href);
    const onTitle = onProductTitleFromUrl(url);
    if (onTitle) {
      return onTitle;
    }

    const candidates = url.pathname
      .split("/")
      .filter(Boolean)
      .reverse()
      .map(cleanUrlTitleSegment)
      .filter(isUsableUrlTitleSegment);

    return candidates[0] || "";
  } catch {
    return "";
  }
}

function onProductTitleFromUrl(url) {
  if (!/(?:^|\.)on\.com$/i.test(url.hostname)) {
    return "";
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const productIndex = segments.findIndex((segment) => segment.toLowerCase() === "products");
  const slug = productIndex >= 0 ? segments[productIndex + 1] : "";
  if (!slug) {
    return "";
  }

  return cleanUrlTitleSegment(slug.replace(/-(?:m|w|kids?)-[a-z0-9]+$/i, ""));
}

function cleanUrlTitleSegment(value) {
  return cleanText(decodeURIComponent(value || ""))
    .replace(/\.(?:html?|aspx|php)$/i, "")
    .replace(/\bitem[-_\s]*\d+.*$/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\bcheck\s+in\b/gi, "check-in")
    .replace(/\s+in\s+([a-z]+)$/i, " $1")
    .replace(/\b(?:men|women|mens|womens|unisex|kids)\b$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isUsableUrlTitleSegment(value) {
  const text = cleanText(value);
  if (!text || text.length < 4) {
    return false;
  }

  if (
    /^(?:en|us|usa|uk|gb|eu|ru|ru ru|products?|collections?|catalog|shopping|men|women|sale|new|item|p|dp)$/i.test(text)
  ) {
    return false;
  }

  if (/^[a-z]{0,4}[-_\s]?\d{3,}[a-z0-9\s-]*$/i.test(text)) {
    return false;
  }

  if (!looksLikeProductName(text) && /^[a-z0-9]+(?:\s+[a-z0-9]+){0,2}$/i.test(text) && /[a-z]/i.test(text) && /\d/.test(text)) {
    return false;
  }

  return text.split(/\s+/).length >= 2 || looksLikeProductName(text);
}

function stripTitleActionNoise(value) {
  const text = cleanText(value);
  if (!text) {
    return "";
  }

  const actionPattern =
    /\s+(?:(?:favorite|избранное)(?=\s+(?:share|copy|telegram|vk|vkontakte|whatsapp|pinterest|поделиться|скопировать|вконтакте))|share|copy link|copied link|telegram|vk|vkontakte|whatsapp|pinterest|поделиться|скопировать(?:\s+ссылку)?|ссылка\s+скопирована|вконтакте)\b.*$/i;
  const match = text.match(actionPattern);
  if (!match) {
    return text;
  }

  const beforeAction = cleanText(text.slice(0, match.index));
  return beforeAction.length >= 4 ? beforeAction : text;
}

function stripLeadingBrandFromTitle(value, brand) {
  const text = cleanText(value);
  const brandText = cleanText(brand);
  if (!text || !brandText) {
    return text;
  }

  const normalizedText = normalizeComparableText(text);
  const normalizedBrand = normalizeComparableText(brandText);
  if (!normalizedBrand || !normalizedText.startsWith(normalizedBrand)) {
    return text;
  }

  const rest = text.slice(brandText.length).replace(/^[-–—:|,\s]+/, "");
  return rest || text;
}

function normalizeComparableText(value) {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/gi, " ")
    .trim()
    .toLocaleLowerCase();
}
