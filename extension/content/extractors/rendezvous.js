function extractRendezVousProductFromFetchedPage(doc, productUrl) {
  if (!isRendezVousProductUrl(productUrl)) {
    return {};
  }

  const node = doc.querySelector("[data-productinfo], [data-modelname][data-modelcode]");
  const productInfo = cleanText(node?.getAttribute("data-productinfo"));
  const brand =
    node?.getAttribute("data-vendor") ||
    rendezVousProductInfoValue(productInfo, "brand");
  const rawTitle =
    node?.getAttribute("data-modelname") ||
    rendezVousProductInfoValue(productInfo, "name") ||
    fetchedMetaContent(doc, "og:title") ||
    doc.title;
  const rawPrice =
    node?.getAttribute("data-topay") ||
    rendezVousProductInfoValue(productInfo, "price") ||
    fetchedMetaContent(doc, "twitter:description");
  const image =
    node?.getAttribute("data-image") ||
    fetchedMetaContent(doc, "og:image") ||
    doc.querySelector('meta[itemprop="image"]')?.content;
  const price = normalizePrice({
    amount: numericPrice(rawPrice),
    currency: "RUB",
    text: looksLikePrice(rawPrice) ? rawPrice : undefined
  });

  return compactObject({
    title: rendezVousProductTitle(rawTitle, brand, productUrl),
    brand: cleanBrandName(brand),
    url: normalizeUrl(productUrl),
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    imageUrl: rendezVousImageUrl(image, productUrl),
    rawCategory: rendezVousProductInfoValue(productInfo, "category"),
    fromRendezVousProductPage: true
  });
}

function isRendezVousProductUrl(productUrl) {
  try {
    const url = new URL(productUrl, location.href);
    return /(^|\.)rendez-vous\.ru$/i.test(url.hostname) &&
      /\/catalog\/.+-\d+\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function rendezVousProductInfoValue(value, key) {
  const match = cleanText(value).match(new RegExp(`['"]${key}['"]\\s*:\\s*['"]([^'"]+)`, "i"));
  return match?.[1] || "";
}

function rendezVousProductTitle(value, brand, productUrl) {
  const title = cleanText(value)
    .replace(/\s+-\s+купить\b.*$/i, "")
    .replace(/\s+\|\s*\d+.*$/i, "")
    .replace(/\s*\(\d+\)\s*/g, " ")
    .replace(/\s+/g, " ");
  return cleanProductTitle(stripRendezVousBrand(title, brand), brand, productUrl);
}

function stripRendezVousBrand(value, brand) {
  const brandText = cleanText(brand);
  if (!brandText) {
    return value;
  }

  return cleanText(value.replace(new RegExp(`\\b${escapeRegExp(brandText)}\\b`, "i"), ""));
}

function rendezVousImageUrl(value, productUrl) {
  const text = cleanText(value);
  const nested = text.match(/^https?:\/\/www\.rendez-vous\.ru(https?:\/\/.+)$/i)?.[1];
  return toAbsoluteUrlFor(nested || text, productUrl);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
