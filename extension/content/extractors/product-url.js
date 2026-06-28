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

function bestP448ProductPrice(visibleSources, priceSources) {
  const visiblePrice = bestPriceFromSources(visibleSources);
  const structuredPrice = bestP448StructuredPrice(priceSources);
  if (isP448ShippingThresholdSale(visiblePrice)) {
    const fullPrice = p448FullPriceFromCompareAt(visiblePrice);
    if (
      Number.isFinite(structuredPrice.amount) &&
      Math.abs(structuredPrice.amount - fullPrice.amount) < 0.01
    ) {
      return priceWithoutCompareAt(structuredPrice);
    }
    return fullPrice;
  }
  if (isP448InstallmentFragmentPrice(visiblePrice, structuredPrice)) {
    return priceWithoutCompareAt(structuredPrice);
  }
  if (
    visiblePrice.isSale &&
    Number.isFinite(structuredPrice.amount) &&
    Math.abs(structuredPrice.amount - numericPrice(visiblePrice.compareAtAmount)) < 0.01
  ) {
    return priceWithoutCompareAt(structuredPrice);
  }
  if (Number.isFinite(visiblePrice.amount) && visiblePrice.currency) {
    return visiblePrice.isSale ? visiblePrice : priceWithoutCompareAt(visiblePrice);
  }
  return Number.isFinite(structuredPrice.amount) && structuredPrice.currency
    ? priceWithoutCompareAt(structuredPrice)
    : {};
}

function p448ProductWithFetchedPrice(product, jsonProduct, metaProduct, priceProduct) {
  const price = bestP448ProductPrice(
    [priceProduct, metaProduct],
    [jsonProduct, metaProduct, priceProduct]
  );
  if (!Number.isFinite(price.amount) || !price.currency) {
    return product;
  }

  return compactObject({
    ...product,
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale
  });
}

function bestP448StructuredPrice(priceSources) {
  const jsonLdPrice = bestPriceFromSources(priceSources.filter((source) => source?.fromJsonLd));
  return Number.isFinite(jsonLdPrice.amount) && jsonLdPrice.currency
    ? jsonLdPrice
    : bestPriceFromSources(priceSources);
}

function isP448ShippingThresholdSale(price) {
  const amount = numericPrice(price?.amount);
  const compareAtAmount = numericPrice(price?.compareAtAmount);
  const currency = cleanText(price?.currency).toUpperCase();
  return (
    price?.isSale === true &&
    currency === "EUR" &&
    Math.abs(amount - 165) < 0.01 &&
    Number.isFinite(compareAtAmount) &&
    compareAtAmount > amount
  );
}

function isP448InstallmentFragmentPrice(visiblePrice, structuredPrice) {
  const visibleAmount = numericPrice(visiblePrice?.amount);
  const structuredAmount = numericPrice(structuredPrice?.amount);
  const visibleCurrency = cleanText(visiblePrice?.currency).toUpperCase();
  const structuredCurrency = cleanText(structuredPrice?.currency).toUpperCase();
  const ratio = structuredAmount / visibleAmount;
  return Boolean(
    visibleCurrency &&
      visibleCurrency === structuredCurrency &&
      Number.isFinite(visibleAmount) &&
      Number.isFinite(structuredAmount) &&
      visibleAmount > 0 &&
      visibleAmount < structuredAmount &&
      visiblePrice?.isSale !== true &&
      !Number.isFinite(numericPrice(visiblePrice?.compareAtAmount)) &&
      ratio >= 2.7 &&
      ratio <= 3.3
  );
}

function p448FullPriceFromCompareAt(price) {
  const amount = numericPrice(price?.compareAtAmount);
  const currency = cleanText(price?.currency).toUpperCase();
  return compactObject({
    amount,
    currency,
    originalText:
      cleanText(price?.compareAtText) ||
      formatOriginalPrice(amount, currency) ||
      cleanText(price?.originalText)
  });
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
