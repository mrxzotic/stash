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
  const imageUrls = normalizeProductImageUrls(product.images);

  return compactObject({
    title: cleanProductTitle(pyeVueProductTitle(product), "PYE", url),
    brand: "PYE",
    url,
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    imageUrl: imageUrls[0] || "",
    imageUrls,
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
