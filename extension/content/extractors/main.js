function extractProduct(context) {
  const jsonLdProduct = findJsonLdProduct();
  const microdataProduct = extractFromMicrodata();
  const embeddedProduct = extractFromEmbeddedJson(context);
  const commonSelectorProduct = extractFromCommonSelectors();
  const contextualProduct = extractFromContext(context);
  const metaProduct = extractFromMeta(context);
  const pagePriceProduct = extractFromPagePrice();
  const pageUrl = normalizeUrl(location.href);
  const hasClickedProduct =
    contextualProduct.fromContext &&
    (contextualProduct.url || contextualProduct.title || contextualProduct.imageUrl);
  const contextUrl = contextualProduct.url ? normalizeUrl(contextualProduct.url) : "";
  const basePageProductSources = [
    commonSelectorProduct,
    microdataProduct,
    jsonLdProduct,
    embeddedProduct,
    metaProduct,
    pagePriceProduct
  ];
  const hasPageProductDetails = basePageProductSources.some(
    (source) => source.title || source.priceAmount || source.priceText || source.imageUrl
  );
  const currentPageIsProduct = isExtractableProductPageUrl(pageUrl) && hasPageProductDetails;
  const pageProductSources = currentPageIsProduct
    ? [
        jsonLdProduct,
        metaProduct,
        microdataProduct,
        commonSelectorProduct,
        embeddedProduct,
        pagePriceProduct
      ]
    : basePageProductSources;
  const contextLinkUrl = context.linkUrl ? normalizeUrl(context.linkUrl) : "";
  const embeddedContextUrl = embeddedProduct.fromPyeCatalogCard && embeddedProduct.url
    ? normalizeUrl(embeddedProduct.url)
    : "";
  const clickedTargetUrl =
    firstKnownDifferentProductUrl([contextUrl, contextLinkUrl, embeddedContextUrl], pageUrl) ||
    contextUrl ||
    contextLinkUrl ||
    embeddedContextUrl;
  const clickedDifferentProduct =
    !currentPageIsProduct &&
    clickedTargetUrl &&
    !sameProductPageUrl(clickedTargetUrl, pageUrl) &&
    isExtractableProductPageUrl(clickedTargetUrl) &&
    (hasClickedProduct || embeddedProduct.fromPyeCatalogCard);
  const linkedDifferentProduct =
    !currentPageIsProduct &&
    contextLinkUrl &&
    !sameProductPageUrl(contextLinkUrl, pageUrl) &&
    isExtractableProductPageUrl(contextLinkUrl);
  const isProductPageContext =
    currentPageIsProduct ||
      (!clickedDifferentProduct &&
        !linkedDifferentProduct &&
        (isExtractableProductPageUrl(pageUrl) || hasPageProductDetails));
  const clickedProductSources = clickedDifferentProductSources(
    contextualProduct,
    embeddedProduct,
    clickedTargetUrl
  );
  const sources = clickedDifferentProduct && !isProductPageContext
    ? clickedProductSources
    : [
        jsonLdProduct,
        microdataProduct,
        embeddedProduct,
        commonSelectorProduct,
        metaProduct,
        pagePriceProduct
      ];
  const detailSources = isProductPageContext ? pageProductSources : sources;
  const urlSources = isProductPageContext ? [contextualProduct, ...pageProductSources] : sources;
  const priceSources = isProductPageContext
    ? [pagePriceProduct, commonSelectorProduct, microdataProduct, jsonLdProduct, embeddedProduct, metaProduct]
    : detailSources;
  const pageImageSources = hasVariantSelectionParam(pageUrl)
    ? [commonSelectorProduct, microdataProduct, jsonLdProduct, metaProduct, embeddedProduct]
    : [jsonLdProduct, metaProduct, commonSelectorProduct, microdataProduct, embeddedProduct];
  const imageSources = isProductPageContext
    ? [...pageImageSources, contextualProduct]
    : clickedProductImageSources(contextualProduct, sources);
  const url = isProductPageContext ? pageUrl : firstValue(urlSources, "url") || pageUrl;
  const rawBrand = isRimowaProductUrl(url)
    ? "RIMOWA"
    : isTheRowProductUrl(url)
      ? "The Row"
      : isOnProductUrl(url)
        ? "On"
        : /^(.+\.)?adidas\./i.test(sourceDomainFromUrl(url))
          ? "Adidas"
        : bestProductBrand([...detailSources, contextualProduct], url);
  const rawTitle = isRimowaProductUrl(url)
    ? rimowaProductTitleFromUrl(url)
    : firstProductTitle([...detailSources, contextualProduct], document.title, rawBrand, url);
  const price = bestProductPrice({
    commonSelectorProduct,
    pagePriceProduct,
    contextualProduct,
    priceSources,
    url
  });
  const imageUrls = bestProductImageUrlsFromSources(imageSources, url);

  return compactObject({
    source: sourceNameFromUrl(url),
    sourceDomain: sourceDomainFromUrl(url),
    faviconUrl: faviconUrlFromUrl(url),
    url,
    title: cleanProductTitle(rawTitle, rawBrand, url),
    brand: cleanBrandName(rawBrand) || sourceNameFromUrl(url),
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    imageUrl: imageUrls[0] || "",
    imageUrls,
    rawCategory: firstValue(detailSources, "rawCategory") || contextualProduct.rawCategory,
    fromProductPage: isProductPageContext
  });
}

function bestProductPrice({ commonSelectorProduct, pagePriceProduct, contextualProduct, priceSources, url }) {
  if (isRimowaProductUrl(url)) {
    const visiblePrice = bestPriceFromSources([pagePriceProduct, commonSelectorProduct]);
    if (Number.isFinite(visiblePrice.amount) && visiblePrice.currency) {
      return priceWithoutCompareAt(visiblePrice);
    }
  }

  if (hasVariantSelectionParam(url) || isAllSaintsProductUrl(url)) {
    const visiblePrice = bestPriceFromSources([pagePriceProduct, commonSelectorProduct]);
    if (Number.isFinite(visiblePrice.amount) && visiblePrice.currency) {
      return visiblePrice.isSale ? visiblePrice : priceWithoutCompareAt(visiblePrice);
    }
  }

  if (isMrPorterProductUrl(url)) {
    const contextualPrice = bestPriceFromSources([contextualProduct]);
    if (contextualPrice.isSale) {
      return contextualPrice;
    }
  }

  return bestPriceFromSources(priceSources);
}

function priceWithoutCompareAt(price) {
  return compactObject({
    amount: price.amount,
    currency: price.currency,
    originalText: price.originalText
  });
}

function firstProductTitle(sources, fallbackTitle, brand, productUrl) {
  return sources
    .map((source, index) => titleSourceCandidate(source, index, brand, productUrl, fallbackTitle))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)[0]?.title || fallbackTitle;
}

function titleSourceCandidate(source, index, brand, productUrl, fallbackTitle) {
  const cleaned = cleanTitle(source?.title, brand);
  if (!cleaned) {
    return null;
  }
  const urlTitle = cleanTitle(productTitleFromUrl(source?.url || productUrl), brand);

  return {
    title: titleSourceValue(source.title, cleaned, urlTitle),
    score: titleSourceScore(cleaned, urlTitle, index, fallbackTitle, source, productUrl)
  };
}

function titleSourceValue(rawTitle, cleanedTitle, urlTitle) {
  if (urlTitle && hasTrailingTitleFacet(cleanedTitle, urlTitle)) {
    return urlTitle;
  }

  return rawTitle;
}

function titleSourceScore(title, urlTitle, index, fallbackTitle, source, productUrl) {
  const wordCount = title.split(/\s+/).filter(Boolean).length;
  const titleText = cleanText(title).toLocaleLowerCase();
  const fallbackText = cleanText(fallbackTitle).toLocaleLowerCase();
  const sourceMatchesProduct = sameProductPageUrl(source?.url || productUrl, productUrl);
  let score = Math.max(0, 32 - index * 2);

  if (looksLikeProductName(title)) score += 18;
  if (looksLikeModelColorwayTitle(title)) score += 10;
  if (title.length >= 5 && title.length <= 64) score += 8;
  if (wordCount >= 2 && wordCount <= 8) score += 8;
  if (looksLikeDescriptiveTitle(title)) score -= 24;
  if (source?.fromPyeCatalogCard && sourceMatchesProduct) score += 34;
  if (!source?.fromContext && sourceMatchesProduct && titleText && fallbackText.includes(titleText)) score += 20;
  if (urlTitle && titleMatchesUrlTitle(title, urlTitle)) score += 14;
  if (urlTitle && hasTrailingTitleFacet(title, urlTitle)) score -= 10;

  return score;
}

function hasTrailingTitleFacet(title, urlTitle) {
  const titleKey = normalizeComparableText(title);
  const urlKey = normalizeComparableText(urlTitle);
  return Boolean(titleKey && urlKey && titleKey.startsWith(`${urlKey} `) && /\s\|\s/.test(title));
}

function titleMatchesUrlTitle(title, urlTitle) {
  const titleKey = normalizeComparableText(title);
  const urlKey = normalizeComparableText(urlTitle);
  return Boolean(
    titleKey &&
      urlKey &&
      (titleKey === urlKey || titleKey.includes(urlKey) || urlKey.includes(titleKey))
  );
}

function bestProductBrand(sources, productUrl) {
  const candidates = sources
    .map((source, index) => brandSourceCandidate(source, index, productUrl))
    .filter(Boolean);

  if (!candidates.length) {
    return "";
  }

  const sourceKey = compactComparableText(sourceNameFromUrl(productUrl));
  const hasNonSourceBrand = candidates.some((candidate) => candidate.key !== sourceKey);

  return candidates
    .map((candidate) => ({
      ...candidate,
      score: candidate.score - (hasNonSourceBrand && candidate.key === sourceKey ? 34 : 0)
    }))
    .sort((a, b) => b.score - a.score)[0].brand;
}

function brandSourceCandidate(source, index, productUrl) {
  const brand = cleanBrandName(source?.brand);
  if (!brand) {
    return null;
  }

  const key = compactComparableText(brand);
  const titleKey = normalizeComparableText(source?.title);
  if (key && titleKey && key === titleKey.replace(/\s+/g, "")) {
    return null;
  }

  let score = Math.max(0, 30 - index * 2);
  const wordCount = brand.split(/\s+/).filter(Boolean).length;

  if (brand.length <= 32) score += 8;
  if (wordCount <= 4) score += 6;
  if (titleKey && titleKey.startsWith(normalizeComparableText(brand))) score += 12;
  if (sameProductPageUrl(source?.url || productUrl, productUrl)) score += 6;

  return { brand, key, score };
}

function compactComparableText(value) {
  return normalizeComparableText(value).replace(/\s+/g, "");
}

function clickedDifferentProductSources(contextualProduct, embeddedProduct, targetUrl) {
  const pyeProduct = pyeProductSourceFromUrl(targetUrl);
  if (pyeProduct.url && !productSourceMatchesUrl(embeddedProduct, targetUrl)) {
    return [pyeProduct, contextualProduct];
  }

  if (productSourceMatchesUrl(embeddedProduct, targetUrl)) {
    if (isFarfetchProductUrl(targetUrl) && (contextualProduct.title || contextualProduct.brand)) {
      return [contextualProduct, embeddedProduct];
    }
    return [embeddedProduct];
  }
  return [contextualProduct];
}

function clickedProductImageSources(contextualProduct, sources) {
  if (!contextualProduct?.imageUrl) {
    return sources;
  }

  return [contextualProduct, ...sources.filter((source) => source !== contextualProduct)];
}

function productSourceMatchesUrl(product, targetUrl) {
  return Boolean(product?.url && targetUrl && sameProductPageUrl(product.url, targetUrl));
}

function firstKnownDifferentProductUrl(urls, pageUrl) {
  return urls.find((url) =>
    url &&
      !sameProductPageUrl(url, pageUrl) &&
      isExtractableProductPageUrl(url)
  ) || "";
}

function isExtractableProductPageUrl(value) {
  return Boolean(
    (typeof isKnownProductPageUrl === "function" && isKnownProductPageUrl(value)) ||
      (typeof isProductLikeUrl === "function" && isProductLikeUrl(value)) ||
      (typeof isPyeProductUrl === "function" && isPyeProductUrl(value))
  );
}

function hasVariantSelectionParam(value) {
  try {
    const params = new URL(value || location.href, location.href).searchParams;
    return ["variant", "color", "colour", "option"].some((key) => params.has(key));
  } catch {
    return false;
  }
}

function isKnownProductPageUrl(value) {
  return Boolean(
    isProductLikeUrl(value) ||
      (typeof isPyeProductUrl === "function" && isPyeProductUrl(value))
  );
}

function pyeProductSourceFromUrl(targetUrl) {
  if (
    !targetUrl ||
    typeof isPyeProductUrl !== "function" ||
    !isPyeProductUrl(targetUrl)
  ) {
    return {};
  }

  return compactObject({
    title: pyeProductTitleFromUrl(targetUrl),
    brand: "PYE",
    url: normalizeUrl(targetUrl)
  });
}

function isFarfetchProductUrl(value) {
  try {
    const url = new URL(value, location.href);
    return /^(?:.+\.)?farfetch\.com$/i.test(url.hostname) &&
      /-item-\d+\.aspx$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function isRimowaProductUrl(value) {
  try {
    const url = new URL(value, location.href);
    return /^(?:.+\.)?rimowa\.com$/i.test(url.hostname) &&
      /\.html$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function isTheRowProductUrl(value) {
  try {
    const url = new URL(value, location.href);
    return /^(?:.+\.)?therow\.com$/i.test(url.hostname) &&
      /\/products\/[^/]+\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function rimowaProductTitleFromUrl(value) {
  try {
    const url = new URL(value, location.href);
    const segments = url.pathname.split("/").filter(Boolean);
    const skuIndex = segments.findIndex((segment) => /\.html$/i.test(segment));
    const titleSegment = skuIndex > 0 ? segments[skuIndex - 1] : "";
    return cleanTitle(cleanUrlTitleSegment(titleSegment), "RIMOWA") || "RIMOWA";
  } catch {
    return "RIMOWA";
  }
}

function isMrPorterProductUrl(value) {
  try {
    const url = new URL(value, location.href);
    return /^(?:.+\.)?mrporter\.com$/i.test(url.hostname) &&
      /\/mens\/product\//i.test(url.pathname);
  } catch {
    return false;
  }
}
