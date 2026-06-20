function needsProductPageDoubleCheck(product) {
  return Boolean(
    product?.fromContext &&
      product.url &&
      isProductLikeUrl(product.url) &&
      (lowConfidenceProductTitle(product) ||
        lowConfidenceProductBrand(product) ||
        lowConfidenceProductPrice(product) ||
        lowConfidenceProductImage(product))
  );
}

function reconcileProductWithFetchedProduct(product, fetchedProduct) {
  if (!fetchedProductMatchesSavedProduct(product, fetchedProduct)) {
    return ensureExtractionQuality(product);
  }

  const url = product.url || fetchedProduct.url || normalizeUrl(location.href);
  const brand = verifiedProductBrand(product, fetchedProduct, url);
  const title = verifiedProductTitle(product, fetchedProduct, brand, url);
  const price = bestPriceFromSources([product, fetchedProduct]);
  const imageUrl = verifiedProductImage(product, fetchedProduct, url);

  const reconciled = compactObject({
    ...product,
    source: sourceNameFromUrl(url),
    sourceDomain: sourceDomainFromUrl(url),
    faviconUrl: faviconUrlFromUrl(url),
    url,
    title,
    brand,
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    imageUrl,
    rawCategory: product.rawCategory || fetchedProduct.rawCategory
  });
  return attachExtractionQuality(reconciled, [
    { ...product, extractionSource: product.fromContext ? "card" : "page" },
    { ...fetchedProduct, extractionSource: fetchedProduct.fromSelectedVariant ? "shopify" : "linkedPage" }
  ]);
}

function fetchedProductMatchesSavedProduct(product, fetchedProduct) {
  if (!fetchedProduct?.title && !fetchedProduct?.priceText && !fetchedProduct?.imageUrl) {
    return false;
  }

  return Boolean(
    !product?.url ||
      !fetchedProduct.url ||
      sameProductPageUrl(product.url, fetchedProduct.url)
  );
}

function verifiedProductTitle(product, fetchedProduct, brand, productUrl) {
  const currentTitle = normalizedVerifiedTitle(product?.title, brand, productUrl);
  const fetchedTitle = normalizedVerifiedTitle(fetchedProduct?.title, brand, productUrl);

  if (!fetchedTitle) {
    return currentTitle || cleanProductTitle(product?.title, brand, productUrl);
  }

  if (!currentTitle) {
    return fetchedTitle;
  }

  if (fetchedTitleExtendsCurrentWithFacet(currentTitle, fetchedTitle)) {
    return currentTitle;
  }

  const currentScore = verifiedProductTitleScore(currentTitle, product, brand, productUrl);
  const fetchedScore = verifiedProductTitleScore(fetchedTitle, fetchedProduct, brand, productUrl);
  if (lowConfidenceProductTitle(product) && fetchedScore >= currentScore - 4) {
    return fetchedTitle;
  }

  return fetchedScore > currentScore + 10 ? fetchedTitle : currentTitle;
}

function normalizedVerifiedTitle(value, brand, productUrl) {
  const cleaned = cleanTitle(value, brand);
  const urlTitle = cleanTitle(productTitleFromUrl(productUrl), brand);
  const title = urlTitle && hasTrailingTitleFacet(cleaned, urlTitle) ? urlTitle : value;
  return cleanProductTitle(title, brand, productUrl);
}

function verifiedProductTitleScore(title, source, brand, productUrl) {
  const wordCount = cleanText(title).split(/\s+/).filter(Boolean).length;
  const urlTitle = cleanTitle(productTitleFromUrl(productUrl), brand);
  let score = 0;

  if (title) score += 20;
  if (looksLikeProductName(title)) score += 14;
  if (title.length >= 5 && title.length <= 64) score += 8;
  if (wordCount >= 2 && wordCount <= 8) score += 8;
  if (urlTitle && titleMatchesUrlTitle(title, urlTitle)) score += 18;
  if (looksLikeDescriptiveTitle(title)) score -= 28;
  if (/\s\|\s/.test(title)) score -= 14;
  if (sameProductPageUrl(source?.url || productUrl, productUrl)) score += 4;

  return score;
}

function fetchedTitleExtendsCurrentWithFacet(currentTitle, fetchedTitle) {
  const currentKey = normalizeComparableText(currentTitle);
  const fetchedKey = normalizeComparableText(fetchedTitle);
  return Boolean(
    currentKey &&
      fetchedKey &&
      fetchedKey.startsWith(`${currentKey} `) &&
      /\s\|\s/.test(fetchedTitle)
  );
}

function verifiedProductBrand(product, fetchedProduct, productUrl) {
  const current = cleanBrandName(product?.brand);
  const fetched = cleanBrandName(fetchedProduct?.brand);
  const sourceKey = compactComparableText(sourceNameFromUrl(productUrl));
  const currentIsSource = compactComparableText(current) === sourceKey;
  const fetchedIsSource = compactComparableText(fetched) === sourceKey;

  if (!current) {
    return fetched || sourceNameFromUrl(productUrl);
  }

  if (!fetched) {
    return current;
  }

  if ((lowConfidenceProductBrand(product) || currentIsSource) && !fetchedIsSource) {
    return fetched;
  }

  return current;
}

function verifiedProductImage(product, fetchedProduct, productUrl) {
  if (!fetchedProduct?.imageUrl) {
    return product?.imageUrl || "";
  }

  if (
    !product?.imageUrl ||
    lowConfidenceProductImage(product) ||
    product.fromContext ||
    needsOnProductImageUpgrade(product)
  ) {
    return fetchedProduct.imageUrl;
  }

  return bestProductImageFromSources([product, fetchedProduct], productUrl);
}

function lowConfidenceProductTitle(product) {
  const title = cleanTitle(product?.title, product?.brand);
  const urlTitle = cleanTitle(productTitleFromUrl(product?.url), product?.brand);

  return Boolean(
    !title ||
      isNoiseLine(title) ||
      looksLikeDescriptiveTitle(title) ||
      compactComparableText(title) === compactComparableText(sourceNameFromUrl(product?.url)) ||
      (urlTitle && looksLikeProductName(urlTitle) && !titleMatchesUrlTitle(title, urlTitle))
  );
}

function lowConfidenceProductBrand(product) {
  const brand = cleanBrandName(product?.brand);
  if (!brand) {
    return true;
  }

  return Boolean(
    isMarketplaceProductUrl(product?.url) &&
      compactComparableText(brand) === compactComparableText(sourceNameFromUrl(product?.url))
  );
}

function lowConfidenceProductPrice(product) {
  return !Number.isFinite(product?.priceAmount) || !cleanText(product?.currency);
}

function lowConfidenceProductImage(product) {
  return !product?.imageUrl || !isUsableProductImageUrl(product.imageUrl);
}

function isMarketplaceProductUrl(value) {
  try {
    const url = new URL(value || location.href, location.href);
    return /(^|\.)farfetch\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}
