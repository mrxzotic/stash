function itemProp(scope, name) {
  if (!scope) {
    return "";
  }

  const element = itemPropElement(scope, name);

  if (!element) {
    return "";
  }

  return (
    element.getAttribute("content") ||
    element.getAttribute("href") ||
    element.getAttribute("src") ||
    element.textContent ||
    ""
  );
}

function itemPropElement(scope, name) {
  if (scope.matches?.(`[itemprop="${name}"]`)) {
    return scope;
  }

  return Array.from(scope.querySelectorAll?.(`[itemprop="${name}"]`) || [])
    .find((element) => {
      const ownerScope = itemPropOwnerScope(element);
      return ownerScope === scope || (!ownerScope && !scope.hasAttribute?.("itemscope"));
    }) || null;
}

function itemPropOwnerScope(element) {
  let node = element?.parentElement || null;
  while (node) {
    if (node.hasAttribute?.("itemscope")) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function extractFromMicrodata() {
  const product =
    document.querySelector('[itemscope][itemtype*="schema.org/Product" i]') ||
    document.querySelector('[itemtype*="schema.org/Product" i]');

  if (!product) {
    return {};
  }

  const offer = product.querySelector('[itemprop="offers"]');
  const title =
    itemProp(product, "name") ||
    product.querySelector("h1, h2, h3")?.textContent;
  const brandNode = product.querySelector('[itemprop="brand"]');
  const brand =
    itemProp(product, "brand") ||
    itemProp(brandNode, "name") ||
    brandNode?.textContent;
  const image =
    itemProp(product, "image") ||
    bestImageFromElement(product.querySelector("img"));
  const priceText =
    itemProp(product, "price") ||
    itemProp(offer, "price") ||
    product.querySelector('[itemprop="price"]')?.textContent ||
    findVisiblePriceText(product);
  const currency =
    itemProp(product, "priceCurrency") ||
    itemProp(offer, "priceCurrency") ||
    currencyFromText(priceText) ||
    findVisibleCurrencyCode(product);
  const price = normalizePrice({ text: priceText, currency });
  const url = itemProp(product, "url") || itemProp(offer, "url");

  return compactObject({
    title: cleanProductTitle(title, brand, url || location.href),
    brand: cleanBrandName(brand),
    url: normalizeUrl(
      url ||
        product.querySelector("a[href]")?.href ||
        document.querySelector('link[rel="canonical"]')?.href ||
        location.href
    ),
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    imageUrl: toAbsoluteUrl(image),
    rawCategory: itemProp(product, "category"),
    fromMicrodata: true
  });
}

function extractFromCommonSelectors() {
  const title = textFromFirst([
    '[data-testid*="product-title" i]',
    '[data-test*="product-title" i]',
    '[data-qa*="product-title" i]',
    '[class*="product"][class*="title" i]',
    '[class*="title"][class*="product" i]',
    '.product__title',
    '.product-title',
    'h1[itemprop="name"]',
    "main h1",
    "h1"
  ]);
  const brand = textFromFirst([
    '[data-testid*="brand" i]',
    '[data-test*="brand" i]',
    '[data-qa*="brand" i]',
    '[class*="product"][class*="brand" i]',
    '[class*="brand"][class*="product" i]',
    ".product__vendor",
    ".product-vendor"
  ]);
  const imageElement = firstElement([
    '[data-testid*="product" i] img',
    '[class*="product" i] img',
    '[class*="gallery" i] img',
    '[class*="media" i] img',
    "main img"
  ]);
  const imageAltTitle = cleanText(
    imageElement?.getAttribute("alt") ||
      imageElement?.getAttribute("title")
  );
  const titleCandidate = isNoiseLine(title) ? imageAltTitle : title || imageAltTitle;
  const productScope = document.querySelector("main") || document.body;
  const priceText = bestVisibleProductPriceText(textFromFirst([
    '[data-testid*="price" i]',
    '[data-test*="price" i]',
    '[data-qa*="price" i]',
    '[itemprop="price"]',
    '[class*="price" i]',
    '[class*="amount" i]'
  ]), productScope);
  const currency = currencyFromText(priceText) || findVisibleCurrencyCode(productScope);
  const price = normalizePrice({ text: priceText, currency });
  const image =
    bestImageFromElement(imageElement) ||
    metaContent("og:image") ||
    metaContent("twitter:image");

  return compactObject({
    title: cleanProductTitle(titleCandidate, brand, location.href),
    brand: cleanBrandName(brand),
    url: normalizeUrl(
      document.querySelector('link[rel="canonical"]')?.href ||
        metaContent("og:url") ||
        location.href
    ),
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    imageUrl: toAbsoluteUrl(image),
    rawCategory: textFromFirst([
      '[data-testid*="breadcrumb" i]',
      ".breadcrumb",
      '[aria-label*="breadcrumb" i]'
    ])
  });
}

function extractFromPagePrice() {
  const scope = document.querySelector("main") || document.body || document;
  const priceText = visibleSalePriceClusterText(scope) || findVisiblePriceText(scope);
  const currency =
    currencyFromText(priceText) ||
    findVisibleCurrencyCode(scope);
  const price = normalizePrice({ text: priceText, currency });

  return compactObject({
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale
  });
}

function textFromFirst(selectors, scope = document) {
  const element = firstElement(selectors, scope);
  return cleanText(
    element?.getAttribute("content") ||
      element?.getAttribute("aria-label") ||
      element?.textContent
  );
}

function firstElement(selectors, scope = document) {
  for (const selector of selectors) {
    const element = scope.querySelector?.(selector);
    if (element) {
      return element;
    }
  }

  return null;
}
