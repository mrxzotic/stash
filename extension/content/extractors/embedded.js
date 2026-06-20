function extractFromEmbeddedJson(context = {}) {
  const pyeProduct = extractPyeVueProduct(context);
  if (pyeProduct.title || pyeProduct.priceText || pyeProduct.imageUrl) {
    return pyeProduct;
  }

  const scripts = Array.from(
    document.querySelectorAll(
      'script[type="application/json"], script[type="application/ld+json"], script[id*="__NEXT_DATA__"], script[id*="__NUXT_DATA__"]'
    )
  );
  const candidates = [];

  for (const script of scripts) {
    const raw = script.textContent?.trim();
    if (!raw || raw.length > 1_200_000) {
      continue;
    }

    try {
      collectProductLikeObjects(JSON.parse(raw), candidates, 0);
    } catch {
      continue;
    }
  }

  const candidate = candidates
    .map(productLikeToItem)
    .filter((item) => item.title || item.priceText || item.imageUrl)
    .sort((a, b) => productScore(b) - productScore(a))[0];

  return candidate || {};
}

function extractPyeVueProduct(context = {}) {
  if (!/(^|\.)pyeoptics\.com$/i.test(location.hostname)) {
    return {};
  }

  const targetUrl = normalizeUrl(context.linkUrl || location.href);
  const products = Array.from(document.querySelectorAll("[v-bind\\:given-items]"))
    .flatMap((element) => parsePyeProductsAttribute(element.getAttribute("v-bind:given-items")));
  const product = products.find((candidate) =>
    sameProductPageUrl(toAbsoluteUrl(candidate?.url), targetUrl)
  ) || findPyeVueProductFromContext(products, context);

  return product ? pyeVueProductToItem(product) : {};
}

function parsePyeProductsAttribute(value) {
  const raw = decodeHtmlJsonAttribute(value);
  if (!raw || raw.length > 2_000_000) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function decodeHtmlJsonAttribute(value) {
  return String(value || "")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function pyeVueProductToItem(product) {
  const url = normalizeUrl(toAbsoluteUrl(product.url));
  const price = normalizePrice({ amount: numericPrice(product.price), currency: "RUB" });

  return compactObject({
    title: cleanProductTitle(pyeVueProductTitle(product), "PYE", url),
    brand: "PYE",
    url,
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    imageUrl: toAbsoluteUrl(imageFromProductLike(product.images)),
    rawCategory: cleanText(product.lenses_type),
    fromPyeCatalogCard: true
  });
}

function findPyeVueProductFromContext(products, context = {}) {
  const haystack = normalizeComparableText(pyeContextText(context));
  const contextImage = toAbsoluteUrl(context.srcUrl);
  const candidates = products
    .map((product) => ({
      product,
      score: pyeVueProductContextScore(product, haystack, contextImage)
    }))
    .filter((candidate) => candidate.score >= 36)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.product || null;
}

function pyeContextText(context = {}) {
  const values = [
    context.selectionText,
    context.linkUrl
  ];

  const target = pyeContextTarget();
  const scopes = [
    target?.closest?.("a, article, li, [class*='product' i], [class*='catalog' i], [class*='item' i]"),
    target
  ].filter(Boolean);

  for (const scope of scopes) {
    values.push(scope.innerText, scope.textContent);
    const image = scope.matches?.("img") ? scope : scope.querySelector?.("img");
    values.push(
      image?.alt,
      image?.title,
      image?.currentSrc,
      image?.src,
      image?.getAttribute?.("src"),
      image?.getAttribute?.("data-src")
    );
  }

  return values.map(cleanText).filter(Boolean).join(" ");
}

function pyeContextTarget() {
  try {
    if (typeof getContextTarget === "function") {
      return getContextTarget();
    }
  } catch {
    // Context target can be unavailable in non-DOM smoke tests.
  }
  return null;
}

function pyeVueProductContextScore(product, haystack, contextImage) {
  const title = normalizeComparableText(product?.title);
  const color = normalizeComparableText(pyeVueProductColor(product));
  const fullTitle = normalizeComparableText([product?.title, pyeVueProductColor(product)].filter(Boolean).join(" "));
  let score = 0;

  if (fullTitle && haystack.includes(fullTitle)) score += 46;
  if (title && haystack.includes(title)) score += 10;
  if (color && haystack.includes(color)) score += 24;
  if (contextImage && pyeProductImages(product).some((image) => sameImageUrl(image, contextImage))) score += 60;

  return score;
}

function pyeVueProductTitle(product) {
  return [product?.title, pyeVueProductColor(product)]
    .map(cleanText)
    .filter(Boolean)
    .join(" ");
}

function pyeVueProductColor(product) {
  const attributes = Array.isArray(product?.attributes) ? product.attributes : [];
  return cleanText(
    attributes.find((attribute) => /цвет/i.test(cleanText(attribute?.code)))?.value ||
      attributes[0]?.value
  );
}

function pyeProductImages(product) {
  return (Array.isArray(product?.images) ? product.images : [product?.images])
    .flatMap((image) => [
      image?.src,
      image?.url,
      image?.extra_large,
      image?.large,
      image?.medium,
      image?.small,
      typeof image === "string" ? image : ""
    ])
    .map(toAbsoluteUrl)
    .filter(Boolean);
}

function sameImageUrl(left, right) {
  const leftUrl = normalizeUrl(left);
  const rightUrl = normalizeUrl(right);
  return Boolean(leftUrl && rightUrl && leftUrl === rightUrl);
}

function collectProductLikeObjects(node, candidates, depth) {
  if (!node || depth > 8 || candidates.length > 60) {
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node.slice(0, 120)) {
      collectProductLikeObjects(child, candidates, depth + 1);
    }
    return;
  }

  if (typeof node !== "object") {
    return;
  }

  if (looksLikeProductObject(node)) {
    candidates.push(node);
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === "object") {
      collectProductLikeObjects(value, candidates, depth + 1);
    }
  }
}

function looksLikeProductObject(object) {
  const keys = Object.keys(object).map((key) => key.toLowerCase());
  const hasTitle = keys.some((key) =>
    ["title", "name", "producttitle", "displayname"].includes(key)
  );
  const hasPrice = keys.some((key) =>
    key.includes("price") || key.includes("amount")
  );
  const hasImage = keys.some((key) =>
    key.includes("image") || key.includes("photo") || key.includes("media")
  );
  const hasUrl = keys.some((key) =>
    ["url", "href", "handle", "slug", "path"].includes(key)
  );

  return hasTitle && (hasPrice || hasImage || hasUrl);
}

function productLikeToItem(object) {
  const title =
    object.title ||
    object.name ||
    object.productTitle ||
    object.displayName ||
    object.fullName;
  const brand =
    object.brand?.name ||
    object.brand ||
    object.vendor ||
    object.manufacturer?.name ||
    object.designerName;
  const priceValue = productLikePriceValue(object);
  const compareAtPriceValue = compareAtPriceValueFromProductLike(object);
  const currency = currencyFromProductLike(object, priceValue, compareAtPriceValue);
  const price = normalizePrice({
    amount: normalizeRawProductPrice(priceValue),
    currency,
    text: typeof priceValue === "string" ? priceValue : undefined,
    compareAtAmount: normalizeRawProductPrice(compareAtPriceValue),
    compareAtText: typeof compareAtPriceValue === "string" ? compareAtPriceValue : undefined
  });
  const image =
    imageFromProductLike(object.image) ||
    imageFromProductLike(object.images) ||
    imageFromProductLike(object.featured_image) ||
    imageFromProductLike(object.featuredImage) ||
    imageFromProductLike(object.media);
  const url =
    object.url ||
    object.href ||
    productUrlFromHandle(object.handle || object.slug || object.path);

  return compactObject({
    title: cleanProductTitle(title, brand, url),
    brand: cleanBrandName(brand),
    url: url ? normalizeUrl(toAbsoluteUrl(url)) : "",
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    imageUrl: toAbsoluteUrl(image),
    rawCategory: cleanText(object.category || object.productType || object.type)
  });
}

function compareAtPriceValueFromProductLike(object) {
  return priceScalar(
    object.compare_at_price ??
      object.compareAtPrice ??
      object.originalPrice ??
      object.regularPrice ??
      object.oldPrice ??
      object.wasPrice ??
      object.listPrice ??
      object.retailPrice ??
      object.price?.compare_at_price ??
      object.price?.compareAt ??
      object.price?.compareAtPrice ??
      object.price?.original ??
      object.price?.regular ??
      object.price?.old ??
      object.currentPrice?.compareAt ??
      object.currentPrice?.original ??
      object.prices?.compareAt ??
      object.prices?.original
  );
}

function productLikePriceValue(object) {
  return priceScalar(
    object.price ??
      object.salePrice ??
      object.salesPrice ??
      object.currentPrice ??
      object.finalPrice ??
      object.unitPrice ??
      object.priceValue ??
      object.priceFormatted ??
      object.formattedPrice ??
      object.displayPrice ??
      object.minPrice ??
      object.price_min ??
      object.selectedVariant?.price ??
      object.selectedOrFirstAvailableVariant?.price ??
      object.variants?.[0]?.price ??
      object.priceRange?.minVariantPrice ??
      object.priceRange?.minimumVariantPrice ??
      object.priceRange?.min ??
      object.priceRange?.minimum_price?.final_price ??
      object.prices?.current ??
      object.prices?.price ??
      object.prices?.sale ??
      object.offer ??
      object.offers ??
      object.offer?.price ??
      object.offers?.price
  );
}

function priceScalar(value) {
  if (value === null || value === undefined) {
    return undefined;
  }

  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const scalar = priceScalar(entry);
      if (scalar !== undefined) {
        return scalar;
      }
    }
    return undefined;
  }

  if (typeof value !== "object") {
    return undefined;
  }

  return priceScalar(
    value.amount ??
      value.value ??
      value.centAmount ??
      value.cent_amount ??
      value.formatted ??
      value.formattedValue ??
      value.formatted_value ??
      value.text ??
      value.display ??
      value.displayValue ??
      value.price ??
      value.current ??
      value.now ??
      value.gross?.amount ??
      value.net?.amount
  );
}

function currencyFromProductLike(object, ...priceValues) {
  const price =
    firstPriceObject(object.price) ||
    firstPriceObject(object.currentPrice) ||
    firstPriceObject(object.finalPrice) ||
    firstPriceObject(object.prices) ||
    firstPriceObject(object.priceRange?.minVariantPrice) ||
    firstPriceObject(object.priceRange?.minimumVariantPrice) ||
    firstPriceObject(object.offer) ||
    firstPriceObject(object.offers) ||
    {};
  const direct =
    object.priceCurrency ||
    object.currencyCode ||
    object.currency ||
    object.currencyIso ||
    price.currencyCode ||
    price.currency ||
    price.priceCurrency ||
    price.currencyIso ||
    price.currency?.code ||
    price.gross?.currencyCode ||
    price.net?.currencyCode;
  const textCurrency = currencyFromText(priceValues.filter(Boolean).join(" "));

  return cleanText(direct || textCurrency || findVisibleCurrencyCode(document.body)).toUpperCase();
}

function firstPriceObject(value) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value.find((entry) => entry && typeof entry === "object") || null;
  }

  return typeof value === "object" ? value : null;
}

function productScore(product) {
  const url = product.url ? normalizeUrl(product.url) : "";
  const title = cleanText(product.title);
  return (
    (title ? 4 : 0) +
    (product.priceAmount ? 3 : 0) +
    (product.currency ? 2 : 0) +
    (product.imageUrl ? 2 : 0) +
    (url ? 1 : 0) +
    (url && sameProductPageUrl(url, location.href) ? 10 : 0) +
    (looksLikeDescriptiveTitle(title) ? -6 : 0)
  );
}

function imageFromProductLike(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return imageFromProductLike(value[0]);
  }

  return (
    value.src ||
    value.url ||
    value.extra_large ||
    value.large ||
    value.medium ||
    value.small ||
    value.originalSrc ||
    value.preview_image?.src ||
    value.image?.src ||
    ""
  );
}

function productUrlFromHandle(value) {
  const handle = cleanText(value).replace(/^\/+/, "");
  if (!handle) {
    return "";
  }

  if (/^https?:\/\//i.test(handle)) {
    return handle;
  }

  if (handle.includes("/products/")) {
    return `/${handle}`;
  }

  return `/products/${handle}`;
}
