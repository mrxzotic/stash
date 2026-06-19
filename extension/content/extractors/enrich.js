async function enrichProduct(product) {
  if (hasCompletePageProduct(product)) {
    return product;
  }

  const pageProduct = await fetchProductPageProduct(product);
  if (pageProduct.title || pageProduct.priceText || pageProduct.imageUrl) {
    product = shouldPreferFetchedProduct(product, pageProduct)
      ? mergeProducts([pageProduct, product])
      : mergeProducts([product, pageProduct]);
  }

  const shopifyProduct = await fetchShopifyProduct(product.url);
  if (!shopifyProduct.title && !shopifyProduct.priceText && !shopifyProduct.imageUrl) {
    return product;
  }

  if (shopifyProduct.fromSelectedVariant) {
    return mergeProducts([shopifyProduct, product]);
  }

  return product.fromContext
    ? mergeProducts([product, shopifyProduct])
    : mergeProducts([shopifyProduct, product]);
}

function hasCompletePageProduct(product) {
  return Boolean(
    product?.fromProductPage &&
      product.title &&
      product.imageUrl &&
      (product.priceText || Number.isFinite(product.priceAmount))
  );
}

function shouldPreferFetchedProduct(product, pageProduct) {
  return Boolean(
    (!product?.priceText && !Number.isFinite(product?.priceAmount) && pageProduct?.priceText) ||
      looksLikeDescriptiveTitle(product?.title) ||
      !product?.title
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
        looksLikeDescriptiveTitle(product.title) ||
        !product.title)
  );
}

function extractFromFetchedProductPage(doc, productUrl) {
  const jsonProduct = findJsonLdProductInDocument(doc, productUrl);
  const metaProduct = extractMetaProductFromDocument(doc, productUrl);
  const priceProduct = extractPriceFromFetchedDocument(doc);
  return mergeProducts([jsonProduct, metaProduct, priceProduct]);
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
  const handleTitle = productTitleFromProductUrl(productUrl);
  if (selectedVariant && handleTitle) {
    return handleTitle;
  }

  return product.title || handleTitle;
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
  const price = normalizePrice({
    amount: firstValue(sources, "priceAmount"),
    currency: firstValue(sources, "currency"),
    text: firstValue(sources, "priceText"),
    compareAtAmount: firstValue(sources, "compareAtPriceAmount"),
    compareAtText: firstValue(sources, "compareAtPriceText")
  });
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
    imageUrl: firstValue(sources, "imageUrl"),
    rawCategory: firstValue(sources, "rawCategory")
  });
}
