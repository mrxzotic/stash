function isProductLikeUrl(value) {
  try {
    const url = new URL(value, location.href);
    const isFarfetchProduct =
      /^(?:.+\.)?farfetch\.com$/i.test(url.hostname) && /-item-\d+\.aspx$/i.test(url.pathname);
    const isPyeProduct =
      typeof isPyeProductUrl === "function" && isPyeProductUrl(url.href);
    return (
      /\/(product|products|item|items|p)\//i.test(url.pathname) ||
      isFarfetchProduct ||
      isPyeProduct ||
      looksLikeSkuProductPath(url)
    );
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
