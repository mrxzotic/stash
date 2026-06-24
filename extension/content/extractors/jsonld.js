function findJsonLdProduct() {
  const scripts = Array.from(
    document.querySelectorAll('script[type="application/ld+json"]')
  );
  const products = [];

  for (const script of scripts) {
    const raw = script.textContent?.trim();
    if (!raw) {
      continue;
    }

    try {
      collectProducts(JSON.parse(raw), products);
    } catch {
      continue;
    }
  }

  const product = selectJsonLdProduct(products, location.href);
  if (!product) {
    return {};
  }

  const offers = Array.isArray(product.offers)
    ? product.offers
    : [product.offers].filter(Boolean);
  const offer = offers.find((candidate) => offerMatchesCurrentUrl(candidate)) || offers[0] || {};
  const imageUrls = normalizeProductImageUrls(product.image);
  const brand = jsonLdProductBrand(product);

  return compactObject({
    title: cleanText(product.name),
    brand: cleanBrandName(brand),
    url: normalizeUrl(toAbsoluteUrl(product.url)),
    priceText: formatOriginalPrice(offer.price, offer.priceCurrency),
    priceAmount: numericPrice(offer.price),
    currency: cleanText(offer.priceCurrency),
    compareAtPriceText: formatOriginalPrice(offer.highPrice || offer.priceSpecification?.price, offer.priceCurrency),
    compareAtPriceAmount: numericPrice(offer.highPrice || offer.priceSpecification?.price),
    imageUrl: imageUrls[0] || "",
    imageUrls,
    rawCategory: cleanText(product.category),
    fromJsonLd: true
  });
}

function findJsonLdProductInDocument(doc, productUrl) {
  const products = [];

  Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).forEach((script) => {
    const raw = script.textContent?.trim();
    if (!raw) {
      return;
    }

    try {
      collectProducts(JSON.parse(raw), products);
    } catch {
      // Ignore malformed merchant JSON-LD.
    }
  });

  const product = selectJsonLdProduct(products, productUrl);
  if (!product) {
    return {};
  }

  const offers = Array.isArray(product.offers)
    ? product.offers
    : [product.offers].filter(Boolean);
  const offer = offers.find((candidate) => offerMatchesUrl(candidate, productUrl)) || offers[0] || {};
  const imageUrls = normalizeProductImageUrlsFor(product.image, "", productUrl);
  const brand = jsonLdProductBrand(product);

  return compactObject({
    title: cleanProductTitle(product.name, brand, productUrl),
    brand: cleanBrandName(brand),
    url: normalizeUrl(toAbsoluteUrlFor(product.url || productUrl, productUrl)),
    priceText: formatOriginalPrice(offer.price, offer.priceCurrency),
    priceAmount: numericPrice(offer.price),
    currency: cleanText(offer.priceCurrency),
    compareAtPriceText: formatOriginalPrice(offer.highPrice || offer.priceSpecification?.price, offer.priceCurrency),
    compareAtPriceAmount: numericPrice(offer.highPrice || offer.priceSpecification?.price),
    imageUrl: imageUrls[0] || "",
    imageUrls,
    rawCategory: cleanText(product.category),
    fromJsonLd: true
  });
}

function productMatchesUrl(product, productUrl) {
  const offers = Array.isArray(product?.offers)
    ? product.offers
    : [product?.offers].filter(Boolean);
  return Boolean(
    (product?.url && sameProductPageUrl(toAbsoluteUrlFor(product.url, productUrl), productUrl)) ||
      offers.some((offer) => offerMatchesUrl(offer, productUrl))
  );
}

function selectJsonLdProduct(products, targetUrl) {
  return (
    products.find((candidate) => productMatchesUrl(candidate, targetUrl)) ||
    products.find(hasUsableJsonLdName) ||
    products[0]
  );
}

function hasUsableJsonLdName(product) {
  return Boolean(cleanTitle(product?.name, jsonLdProductBrand(product)));
}

function jsonLdProductBrand(product) {
  return typeof product?.brand === "string"
    ? product.brand
    : product?.brand?.name || product?.manufacturer?.name;
}

function extractMetaProductFromDocument(doc, productUrl) {
  const meta = (property) =>
    doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`)?.content || "";
  const title =
    meta("og:title") ||
    meta("twitter:title") ||
    doc.querySelector("h1")?.textContent ||
    doc.title;
  const brand =
    meta("product:brand") ||
    meta("twitter:data1") ||
    doc.querySelector('[data-component*="Brand" i]')?.textContent;
  const priceText =
    meta("product:price:amount") ||
    meta("og:price:amount") ||
    meta("twitter:data2");
  const currency =
    meta("product:price:currency") ||
    meta("og:price:currency") ||
    currencyFromText(priceText);
  const price = normalizePrice({ text: priceText, currency });

  return compactObject({
    title: cleanProductTitle(stripPriceFromText(title), brand, productUrl),
    brand: cleanBrandName(brand),
    url: normalizeUrl(toAbsoluteUrlFor(meta("og:url") || productUrl, productUrl)),
    imageUrl: toAbsoluteUrlFor(meta("og:image") || meta("twitter:image"), productUrl),
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale
  });
}

function extractPriceFromFetchedDocument(doc, productUrl = location.href) {
  const text = cleanText(doc.body?.textContent || "");
  const lines = text
    .split(/(?<=[^\d])\s+(?=[^\d])|\n+/)
    .map(cleanText)
    .filter((line) => line.length <= 96)
    .filter((line) => looksLikePrice(line) && !/shipping|delivery|returns|free/i.test(line))
    .slice(0, 40);
  const farfetchSale = farfetchSalePriceFromFetchedText(text, productUrl);
  const price = farfetchSale.isSale
    ? farfetchSale
    : findBestPrice(hasSalePriceEvidence(text) ? [text, ...lines] : lines);

  return compactObject({
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale
  });
}

function farfetchSalePriceFromFetchedText(text, productUrl) {
  if (!isFarfetchProductUrl(productUrl) || !hasSalePriceEvidence(text)) {
    return {};
  }

  const cluster = visibleSalePriceClusterText({ textContent: text });
  return cluster ? normalizePrice({ text: cluster }) : {};
}

function collectProducts(node, products) {
  if (!node) {
    return;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      collectProducts(child, products);
    }
    return;
  }

  if (typeof node !== "object") {
    return;
  }

  const type = node["@type"];
  const types = Array.isArray(type) ? type : [type];
  if (types.some((value) => String(value).toLowerCase() === "product")) {
    products.push(node);
  }

  for (const value of Object.values(node)) {
    if (value && typeof value === "object") {
      collectProducts(value, products);
    }
  }
}

function offerMatchesCurrentUrl(offer) {
  return offerMatchesUrl(offer, location.href);
}

function offerMatchesUrl(offer, targetUrl) {
  const offerUrl = offer?.url;
  if (!offerUrl) {
    return false;
  }

  try {
    const current = new URL(targetUrl, location.href);
    const candidate = new URL(offerUrl, location.href);
    const currentVariant = current.searchParams.get("variant");
    const candidateVariant = candidate.searchParams.get("variant");
    if (currentVariant && candidateVariant) {
      return currentVariant === candidateVariant;
    }
  } catch {
    return false;
  }

  return sameProductPageUrl(offerUrl, targetUrl);
}
