async function enrichProduct(product) {
  if (hasCompletePageProduct(product)) {
    return ensureExtractionQuality(product);
  }

  const pageProduct = await fetchProductPageProduct(product);
  if (pageProduct.title || pageProduct.priceText || pageProduct.imageUrl) {
    if (pageProduct.fromPyeProductPage || pageProduct.fromRendezVousProductPage) {
      product = mergeProducts([pageProduct]);
    } else {
      product = reconcileProductWithFetchedProduct(product, pageProduct);
    }
  }

  const shopifyProduct = await fetchShopifyProduct(product.url);
  if (!shopifyProduct.title && !shopifyProduct.priceText && !shopifyProduct.imageUrl) {
    return ensureExtractionQuality(product);
  }

  if (shopifyProduct.fromSelectedVariant) {
    return attachExtractionQuality(
      mergeProducts([shopifyProduct, product]),
      [
        { ...shopifyProduct, extractionSource: "shopify" },
        { ...product, extractionSource: product.fromContext ? "card" : "page" }
      ]
    );
  }

  return product.fromContext
    ? reconcileProductWithFetchedProduct(product, shopifyProduct)
    : attachExtractionQuality(
        mergeProducts([shopifyProduct, product]),
        [
          { ...shopifyProduct, extractionSource: "shopify" },
          { ...product, extractionSource: "page" }
        ]
      );
}

function hasCompletePageProduct(product) {
  return Boolean(
    product?.fromProductPage &&
      !variantIdFromUrl(product.url) &&
      product.title &&
      product.imageUrl &&
      (product.priceText || Number.isFinite(product.priceAmount))
  );
}

async function fetchProductPageProduct(product) {
  if (!needsFetchedProductPage(product)) {
    return {};
  }

  let url;
  try {
    url = new URL(product.url, location.href);
  } catch {
    return {};
  }

  if (!/^https?:$/i.test(url.protocol) || url.origin !== location.origin) {
    return {};
  }

  try {
    const response = await fetch(url.toString(), {
      credentials: "same-origin",
      cache: "force-cache"
    });
    if (!response.ok) {
      return {};
    }

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    return extractFromFetchedProductPage(doc, url.toString());
  } catch {
    return {};
  }
}

function needsFetchedProductPage(product) {
  return Boolean(
    product?.url &&
      (!product.priceText ||
        !Number.isFinite(product.priceAmount) ||
        !product.imageUrl ||
        isRendezVousProductUrl(product.url) ||
        isPyeProductUrl(product.url) ||
        needsFetchedProductImage(product) ||
        needsProductPageDoubleCheck(product) ||
        looksLikeDescriptiveTitle(product.title) ||
        !product.title)
  );
}

function needsFetchedProductImage(product) {
  return Boolean(product?.url && product?.imageUrl && (product.fromContext || needsOnProductImageUpgrade(product)));
}

function extractFromFetchedProductPage(doc, productUrl) {
  const rendezVousProduct = extractRendezVousProductFromFetchedPage(doc, productUrl);
  if (rendezVousProduct.fromRendezVousProductPage) return rendezVousProduct;
  const pyeProduct = extractPyeProductFromFetchedPage(doc, productUrl);
  if (pyeProduct.fromPyeProductPage) return pyeProduct;
  const jsonProduct = findJsonLdProductInDocument(doc, productUrl);
  const metaProduct = extractMetaProductFromDocument(doc, productUrl);
  const priceProduct = extractPriceFromFetchedDocument(doc, productUrl);
  return mergeProducts([jsonProduct, metaProduct, priceProduct]);
}

function extractPyeProductFromFetchedPage(doc, productUrl) {
  if (!isPyeProductUrl(productUrl)) {
    return {};
  }

  const title = pyeProductTitleFromMeta(doc) || pyeProductTitleFromUrl(productUrl);
  const priceSource =
    `${fetchedMetaContent(doc, "description")} ${fetchedMetaContent(doc, "og:title")} ${doc.title || ""}`;
  const price = normalizePrice({ amount: pyePriceAmountFromText(priceSource), currency: "RUB" });
  const image = fetchedMetaContent(doc, "og:image") || fetchedMetaContent(doc, "twitter:image");

  return compactObject({
    title: cleanProductTitle(title, "PYE", productUrl),
    brand: "PYE",
    url: normalizeUrl(productUrl),
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    imageUrl: toAbsoluteUrlFor(image, productUrl),
    fromPyeProductPage: true
  });
}

function isPyeProductUrl(productUrl) {
  try {
    const url = new URL(productUrl, location.href);
    return /(^|\.)pyeoptics\.com$/i.test(url.hostname) &&
      /\/shop\/catalogue\/[^/]+\/?$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function pyeProductTitleFromUrl(productUrl) {
  try {
    const url = new URL(productUrl, location.href);
    const slug = url.pathname.split("/").filter(Boolean).pop() || "";
    return cleanText(decodeURIComponent(slug)).replace(/[_-]\d+$/i, "").replace(/[-_]+/g, " ");
  } catch {
    return "";
  }
}

function pyeProductTitleFromMeta(doc) {
  return cleanText(fetchedMetaContent(doc, "og:title") || doc.title)
    .replace(/\s*\|\s*P\.?Y\.?E\.?.*$/i, "")
    .replace(/\s+купить\s+за\s+[\d\s]+(?:руб(?:\.|лей|ля)?|₽).*$/i, "")
    .replace(/^купить\s+очки\s+/i, "")
    .replace(/^очки\s+/i, "");
}

function pyePriceAmountFromText(value) {
  const match = cleanText(value).match(/(?:цена|за)\s*:?\s*([\d\s]+)(?:руб(?:\.|лей|ля)?|₽)/i);
  return numericPrice(match?.[1]);
}

function fetchedMetaContent(doc, property) {
  return cleanText(doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`)?.content || "");
}

async function fetchShopifyProduct(productUrl) {
  if (!productUrl) {
    return {};
  }
  let url;
  try {
    url = new URL(productUrl, location.href);
  } catch {
    return {};
  }

  const match = url.pathname.match(/\/products\/([^/?#]+)/i);
  if (!match) {
    return {};
  }
  const productJsonUrl = `${url.origin}/products/${match[1]}.js`;

  try {
    const response = await fetch(productJsonUrl, {
      credentials: "omit",
      cache: "force-cache"
    });
    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    return shopifyProductToItem(data, productUrl);
  } catch {
    return {};
  }
}

function shopifyProductToItem(product, productUrl) {
  const selectedVariant = selectedShopifyVariant(product, productUrl);
  const currency =
    findVisibleCurrencyCode(document.body) ||
    currencyFromText(findVisiblePriceText(document.body));
  const amount = normalizeRawProductPrice(
    selectedVariant?.price ?? product.price ?? product.price_min
  );
  const compareAtAmount = normalizeRawProductPrice(
    selectedVariant?.compare_at_price ??
      product.compare_at_price ??
      product.compare_at_price_min ??
      product.variants?.find((variant) => variant?.compare_at_price)?.compare_at_price
  );
  const price = normalizePrice({
    amount,
    currency,
    text: amount && currency ? formatOriginalPrice(amount, currency) : undefined,
    compareAtAmount,
    compareAtText: compareAtAmount && currency
      ? formatOriginalPrice(compareAtAmount, currency)
      : undefined
  });
  const image =
    bestShopifyVariantImage(product, selectedVariant) ||
    bestShopifyImage(product.featured_image) ||
    bestShopifyImage(product.images) ||
    bestShopifyImage(product.featuredImage);

  return compactObject({
    title: cleanProductTitle(
      shopifyTitle(product, productUrl, selectedVariant),
      product.vendor,
      productUrl
    ),
    brand: cleanBrandName(product.vendor),
    url: normalizeUrl(productUrl),
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    imageUrl: toAbsoluteUrl(image),
    rawCategory: cleanText(
      [product.type, ...(Array.isArray(product.tags) ? product.tags : [])].join(" ")
    ),
    fromSelectedVariant: Boolean(selectedVariant)
  });
}

function selectedShopifyVariant(product, productUrl) {
  const variantId = variantIdFromUrl(productUrl);
  if (!variantId || !Array.isArray(product?.variants)) {
    return null;
  }

  return product.variants.find((variant) => String(variant?.id) === variantId) || null;
}

function variantIdFromUrl(productUrl) {
  try {
    return new URL(productUrl, location.href).searchParams.get("variant");
  } catch {
    return "";
  }
}

function shopifyTitle(product, productUrl, selectedVariant) {
  const title = cleanText(product?.title);
  if (selectedVariant) {
    return shopifyVariantSkuTitle(title, selectedVariant) || title || productTitleFromProductUrl(productUrl);
  }

  return title || productTitleFromProductUrl(productUrl);
}

function shopifyVariantSkuTitle(title, variant) {
  const parts = cleanText(variant?.sku).split("-").filter(Boolean);
  const modelParts = /^(?:xxs|xs|s|m|l|xl|2xl|3xl|4xl|os|o\/s)$/i.test(parts.at(-1))
    ? parts.slice(0, -1)
    : parts;
  const model = modelParts.join("-");
  const parent = modelParts[0];
  if (!title || !parent || model === parent) return "";
  const pattern = new RegExp(`(^|\\s)${parent.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=$|\\s)`, "i");
  return pattern.test(title) ? title.replace(pattern, `$1${model}`) : "";
}

function productTitleFromProductUrl(productUrl) {
  try {
    const url = new URL(productUrl, location.href);
    const match = url.pathname.match(/\/products\/([^/?#]+)/i);
    if (!match) {
      return "";
    }

    return decodeURIComponent(match[1])
      .replace(/[-_]+/g, " ")
      .replace(/\s+in\s+([a-z]+)$/i, " $1");
  } catch {
    return "";
  }
}

function bestShopifyVariantImage(product, variant) {
  if (!variant) {
    return "";
  }

  const directImage =
    bestShopifyImage(variant.featured_image) ||
    bestShopifyImage(variant.image) ||
    bestShopifyImage(variant.image_url);
  if (directImage) {
    return directImage;
  }

  const imageId = variant.image_id || variant.featured_image?.id;
  if (!imageId) {
    return "";
  }

  const images = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.featured_image,
    product.featuredImage
  ].filter(Boolean);
  const match = images.find((image) => String(image?.id) === String(imageId));
  return bestShopifyImage(match);
}

function bestShopifyImage(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.find(Boolean) || "";
  }

  return value.src || value.url || "";
}

function normalizeRawProductPrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value >= 1000 && Number.isInteger(value) ? value / 100 : value;
  }

  const amount = numericPrice(value);
  if (!Number.isFinite(amount)) {
    return undefined;
  }

  if (looksLikePrice(value)) {
    return amount;
  }

  return amount >= 1000 && !String(value).includes(".") ? amount / 100 : amount;
}

function mergeProducts(products) {
  const sources = products.filter(Boolean);
  const price = bestPriceFromSources(sources);
  const url = firstValue(sources, "url") || normalizeUrl(location.href);

  return compactObject({
    source: sourceNameFromUrl(url),
    sourceDomain: sourceDomainFromUrl(url),
    faviconUrl: faviconUrlFromUrl(url),
    url,
    title: cleanProductTitle(
      firstValue(sources, "title") || document.title,
      firstValue(sources, "brand"),
      url
    ),
    brand: cleanBrandName(firstValue(sources, "brand")) || sourceNameFromUrl(url),
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    imageUrl: bestProductImageFromSources(sources, url),
    imageUrls: bestProductImageUrlsFromSources(sources, url),
    rawCategory: firstValue(sources, "rawCategory")
  });
}
