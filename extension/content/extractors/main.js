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
  const currentPageIsProduct = isProductLikeUrl(pageUrl) && hasPageProductDetails;
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
  const clickedDifferentProduct =
    !currentPageIsProduct &&
    hasClickedProduct &&
    contextUrl &&
    !sameProductPageUrl(contextUrl, pageUrl) &&
    isProductLikeUrl(contextUrl);
  const linkedDifferentProduct =
    !currentPageIsProduct &&
    contextLinkUrl &&
    !sameProductPageUrl(contextLinkUrl, pageUrl) &&
    isProductLikeUrl(contextLinkUrl);
  const isProductPageContext =
    currentPageIsProduct ||
    (!clickedDifferentProduct &&
      !linkedDifferentProduct &&
      (isProductLikeUrl(pageUrl) || hasPageProductDetails));
  const clickedProductSources = clickedDifferentProductSources(
    contextualProduct,
    embeddedProduct,
    contextUrl || contextLinkUrl
  );
  const sources = hasClickedProduct && !isProductPageContext
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
  const pageImageSources = [
    jsonLdProduct,
    metaProduct,
    commonSelectorProduct,
    microdataProduct,
    embeddedProduct
  ];
  const imageSources = isProductPageContext
    ? [...pageImageSources, contextualProduct]
    : sources;
  const url = isProductPageContext ? pageUrl : firstValue(urlSources, "url") || pageUrl;
  const rawBrand = firstValue(detailSources, "brand") || contextualProduct.brand;
  const rawTitle = firstProductTitle([...detailSources, contextualProduct], document.title, rawBrand);
  const price = normalizePrice({
    amount: firstValue(priceSources, "priceAmount"),
    currency: firstValue(priceSources, "currency"),
    text: firstValue(priceSources, "priceText"),
    compareAtAmount: firstValue(priceSources, "compareAtPriceAmount"),
    compareAtText: firstValue(priceSources, "compareAtPriceText")
  });

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
    imageUrl: bestProductImageFromSources(imageSources, url),
    rawCategory: firstValue(detailSources, "rawCategory") || contextualProduct.rawCategory,
    fromProductPage: isProductPageContext
  });
}

function firstProductTitle(sources, fallbackTitle, brand) {
  for (const source of sources) {
    if (cleanTitle(source?.title, brand)) {
      return source.title;
    }
  }

  return fallbackTitle;
}

function clickedDifferentProductSources(contextualProduct, embeddedProduct, targetUrl) {
  if (productSourceMatchesUrl(embeddedProduct, targetUrl)) {
    return [embeddedProduct];
  }
  return [contextualProduct];
}

function productSourceMatchesUrl(product, targetUrl) {
  return Boolean(product?.url && targetUrl && sameProductPageUrl(product.url, targetUrl));
}
