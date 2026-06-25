function isProductLikeUrl(value) {
  try {
    const url = new URL(value, location.href);
    const isFarfetchProduct =
      /^(?:.+\.)?farfetch\.com$/i.test(url.hostname) && /-item-\d+\.aspx$/i.test(url.pathname);
    const isBrandshopProduct =
      /(^|\.)brandshop\.ru$/i.test(url.hostname) && /^\/goods\/\d+\/[^/]+\/?$/i.test(url.pathname);
    const isFablestoreProduct =
      /(^|\.)fablestore\.ru$/i.test(url.hostname) &&
        /^\/catalog\/[^/]+\/[^/]+\/[^/]+\/?$/i.test(url.pathname);
    const isNikeProduct = isNikeProductUrl(url.href);
    const isPyeProduct =
      typeof isPyeProductUrl === "function" && isPyeProductUrl(url.href);
    return (
      /\/(product|products|item|items|p)\//i.test(url.pathname) ||
      isFarfetchProduct ||
      isBrandshopProduct ||
      isFablestoreProduct ||
      isNikeProduct ||
      isPyeProduct ||
      looksLikeSkuProductPath(url)
    );
  } catch {
    return false;
  }
}

function isNikeProductUrl(value) {
  try {
    const url = new URL(value, location.href);
    return /(^|\.)nike\.com$/i.test(url.hostname) && /\/t\/[^/]+\/[^/]+\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function isP448ProductUrl(value) {
  try {
    const url = new URL(value, location.href);
    return /^(?:.+\.)?p448\.com$/i.test(url.hostname) && /\/products\//i.test(url.pathname);
  } catch {
    return false;
  }
}

function looksLikeSkuProductPath(url) {
  const segments = url.pathname.split("/").filter(Boolean);
  const skuSegment = segments.at(-1) || "";
  const titleSegment = segments.at(-2) || "";
  if (!/\.html?$/i.test(skuSegment) || !titleSegment) {
    return false;
  }

  const sku = skuSegment.replace(/\.html?$/i, "");
  const isAcneStudiosSkuPath =
    /(^|\.)acnestudios\.com$/i.test(url.hostname) &&
    /^[a-z]{2}-[a-z]{2}-[a-z0-9]+$/i.test(titleSegment);
  return (
    /^(?=[a-z0-9_-]*[a-z])(?=[a-z0-9_-]*\d)[a-z0-9]{4,24}(?:[-_][a-z0-9]{2,})*$/i.test(sku) &&
    (isAcneStudiosSkuPath || looksLikeProductName(cleanUrlTitleSegment(titleSegment)))
  );
}
