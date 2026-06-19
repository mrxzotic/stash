function isNoiseLine(value) {
  const text = cleanText(value);
  return /^(new|new in|new season|available in|sale|regular price|sale price|unit price|sold out|add to cart|add to bag|add to basket|wish\s?list|save|size|sizes|size guide|select size|item added|item added view cart|view cart|recommended|sponsored|popular products|copy|copied|shipping|returns|free shipping(?:\s+in\b.*)?|free(?:\s+online)?\s+returns?|free shipping and returns|find\s*(?:&|and)\s*reserve(?:\s+in\s+store)?|our signature packaging|signature packaging)$/i.test(
    text
  ) || /^\d+\s+available\s+colou?rs?$/i.test(
    text
  ) || /^(favorite|share|copy link|copied link|telegram|vk|vkontakte|whatsapp|pinterest|поделиться|скопировать|скопировать ссылку|ссылка скопирована|вконтакте|избранное)$/i.test(
    text
  ) || /^image:/i.test(text);
}

function looksLikeMeasurementLine(value) {
  const text = cleanText(value);
  return (
    /^\d+(?:[.,]\d+)?\s*x\s*\d+(?:[.,]\d+)?(?:\s*x\s*\d+(?:[.,]\d+)?)?(?:\s*(?:cm|mm|in|inch|inches))?$/i.test(text) ||
    /\b\d+(?:[.,]\d+)?\s*(?:cm|mm|in|inch|inches|kg|g)\b/i.test(text) ||
    /^(?:xxs|xs|s|m|l|xl|xxl|xxxl|one size|os)$/i.test(text)
  );
}

function looksLikeProductName(value) {
  return /\b(?:sneakers?|shoes?|boots?|sandals?|loafers?|hoodies?|jackets?|coats?|trousers?|pants|chinos|jeans|shorts?|shirts?|t-shirts?|tees?|polos?|sweaters?|sweatshirts?|cardigans?|bags?|totes?|backpacks?|luggage|suitcases?|check[\s-]?in|glasses|sunglasses|frames?|caps?|hats?|beanies?|belts?|wallets?|dresses?|skirts?|blazers?|zips?|pullovers?|crew(?:neck)?|alpaca|cloudmonster|cloudsolo|charms?|dice|necklaces?|джемпер|толстовка|брюки|шорты|рубашка|футболка|кроссовки|ботинки|куртка|сумка|очки|худи)\b/i.test(
    cleanText(value)
  );
}

function cleanBrandName(value) {
  const text = canonicalBrandName(cleanText(stripPriceFromText(value)));
  if (
    !text ||
    looksLikePrice(text) ||
    isNoiseLine(text) ||
    looksLikeMeasurementLine(text) ||
    looksLikeProductName(text)
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
  return brand || label.charAt(0).toUpperCase() + label.slice(1);
}

function faviconUrlFromUrl(value) {
  let target;
  try {
    target = new URL(value || location.href, location.href);
  } catch {
    return "";
  }

  return faviconUrlFromDocument(target);
}

function faviconUrlFromDocument(target) {
  const links = sameSiteHost(location.hostname, target.hostname)
    ? Array.from(document.querySelectorAll("link[rel][href]")).filter(isFaviconLink)
    : [];

  return links
    .map((link) => ({
      url: toAbsoluteUrl(link.getAttribute("href")),
      score: faviconLinkScore(link)
    }))
    .filter((candidate) => candidate.url)
    .sort((a, b) => b.score - a.score)[0]?.url || fallbackFaviconUrl(target);
}

function isFaviconLink(link) {
  const rel = cleanText(link.getAttribute("rel")).toLowerCase();
  return rel.includes("icon");
}

function faviconLinkScore(link) {
  const rel = cleanText(link.getAttribute("rel")).toLowerCase();
  const type = cleanText(link.getAttribute("type")).toLowerCase();
  const href = cleanText(link.getAttribute("href")).toLowerCase();
  const size = faviconLinkSize(link);
  return (
    (rel.includes("apple-touch-icon") ? 80 : 0) +
    (rel.includes("icon") ? 60 : 0) +
    (rel.includes("shortcut") ? 20 : 0) +
    (type.includes("png") || /\.png(?:[?#]|$)/i.test(href) ? 18 : 0) +
    (type.includes("svg") || /\.svg(?:[?#]|$)/i.test(href) ? 8 : 0) +
    (type.includes("x-icon") || /\.ico(?:[?#]|$)/i.test(href) ? 6 : 0) +
    Math.min(size, 256)
  );
}

function faviconLinkSize(link) {
  return cleanText(link.getAttribute("sizes"))
    .split(/\s+/)
    .map((size) => Number.parseInt(size, 10) || 0)
    .sort((a, b) => b - a)[0] || 0;
}

function fallbackFaviconUrl(target) {
  const host = target.hostname.toLowerCase();
  if (host === "eu.aimeleondore.com") {
    return "https://eu.aimeleondore.com/cdn/shop/files/32x32_110654c9-b299-44a8-b950-40e12e132f45.png?v=1679431768";
  }

  if (sameSiteHost(host, "www.aimeleondore.com")) {
    return "https://www.aimeleondore.com/cdn/shop/files/favicon-32x32.png?v=1671713345";
  }

  return `${target.origin}/favicon.ico`;
}

function sameSiteHost(left, right) {
  const leftHost = rootHost(left);
  const rightHost = rootHost(right);
  return Boolean(leftHost && rightHost && leftHost === rightHost);
}

function rootHost(value) {
  const host = cleanText(value).toLowerCase().replace(/^www\./, "");
  const parts = host.split(".").filter(Boolean);
  return parts.length > 2 ? parts.slice(-2).join(".") : host;
}

function cleanTitle(value, brand = "") {
  const brandText = cleanBrandName(brand);
  const titleText = stripTitleActionNoise(stripPriceFromText(value));
  if (isNoiseLine(titleText)) {
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
      .replace(/\s+\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{7,}\b$/g, "")
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
  return title.length > 64 && urlTitle.length < title.length && urlWords >= 2 && urlWords <= titleWords;
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
