function ensureExtractionQuality(product) {
  return product?.extraction?.fields ? product : attachExtractionQuality(product);
}

function attachExtractionQuality(product, sources = [product]) {
  if (!product) {
    return product;
  }

  return compactObject({
    ...product,
    extraction: buildExtractionQuality(product, sources)
  });
}

function buildExtractionQuality(product, sources = [product]) {
  const url = product?.url || location.href;
  const sourceList = normalizeExtractionSources(sources, product);
  const fields = {
    brand: extractionFieldQuality("brand", finalBrandCandidate(product, url), brandCandidates(sourceList, url)),
    title: extractionFieldQuality("title", finalTitleCandidate(product, url), titleCandidates(sourceList, url)),
    price: extractionFieldQuality("price", finalPriceCandidate(product), priceCandidates(sourceList)),
    image: extractionFieldQuality("image", finalImageCandidate(product, url), imageCandidates(sourceList, url))
  };
  const confidenceValues = Object.values(fields)
    .map((field) => field.confidence)
    .filter((value) => Number.isFinite(value));

  return compactObject({
    version: "field-candidates-v1",
    reviewThreshold: 72,
    needsReview: Object.values(fields).some((field) => field.needsReview),
    overallConfidence: confidenceValues.length
      ? Math.round(confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length)
      : 0,
    fields,
    debug: extractionDebugSnapshot(fields)
  });
}

function normalizeExtractionSources(sources, finalProduct) {
  const list = Array.isArray(sources) && sources.length ? sources : [finalProduct];
  return list
    .filter(Boolean)
    .map((source, index) => ({
      source,
      sourceName: source.extractionSource || extractionSourceName(source, index)
    }));
}

function extractionSourceName(source, index) {
  if (source?.fromContext) return "card";
  if (source?.fromSelectedVariant) return "shopify";
  if (source?.fromProductPage || source?.fromPyeProductPage || source?.fromRendezVousProductPage) {
    return "linkedPage";
  }
  return index === 0 ? "selected" : "candidate";
}

function extractionFieldQuality(field, finalCandidate, candidates) {
  const ranked = uniqueFieldCandidates(field, [
    ...candidates,
    finalCandidate
  ].filter(Boolean));
  const selected =
    ranked.find((candidate) => fieldCandidateMatches(field, candidate, finalCandidate)) ||
    finalCandidate ||
    ranked[0] ||
    {};
  const alternatives = ranked
    .filter((candidate) => !fieldCandidateMatches(field, candidate, selected))
    .slice(0, 3);
  const confidence = clamp(Math.round(selected.confidence || 0), 0, 99);

  return compactObject({
    value: selected.value,
    confidence,
    source: selected.source,
    needsReview: confidence < 72,
    alternatives
  });
}

function uniqueFieldCandidates(field, candidates) {
  const seen = new Set();
  return candidates
    .filter((candidate) => candidate?.value)
    .sort((a, b) => b.confidence - a.confidence)
    .filter((candidate) => {
      const key = fieldCandidateKey(field, candidate);
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function fieldCandidateMatches(field, left, right) {
  return Boolean(left && right && fieldCandidateKey(field, left) === fieldCandidateKey(field, right));
}

function fieldCandidateKey(field, candidate) {
  if (!candidate) {
    return "";
  }

  if (field === "price") {
    return [
      numericPrice(candidate.amount),
      cleanText(candidate.currency).toUpperCase(),
      numericPrice(candidate.compareAtAmount) || ""
    ].join("|");
  }

  if (field === "image") {
    return normalizeUrl(candidate.value);
  }

  return normalizeComparableText(candidate.value);
}

function finalBrandCandidate(product, url) {
  const value = cleanBrandName(product?.brand) || cleanText(product?.brand);
  return value ? extractionCandidate("brand", value, brandCandidateConfidence(product, value, url), "selected") : null;
}

function brandCandidates(sources, url) {
  return sources
    .map(({ source, sourceName }) => {
      const value = cleanBrandName(source?.brand) || cleanText(source?.brand);
      return value
        ? extractionCandidate("brand", value, brandCandidateConfidence(source, value, url), sourceName)
        : null;
    })
    .filter(Boolean);
}

function brandCandidateConfidence(source, value, url) {
  const brand = cleanBrandName(value) || cleanText(value);
  const sourceName = sourceNameFromUrl(url);
  const isSourceBrand = compactComparableText(brand) === compactComparableText(sourceName);
  let score = 52;

  if (cleanBrandName(brand)) score += 14;
  if (brand.length <= 32) score += 8;
  if (brand.split(/\s+/).filter(Boolean).length <= 4) score += 8;
  if (normalizeComparableText(source?.title).startsWith(normalizeComparableText(brand))) score += 8;
  if (source?.extractionSource === "linkedPage" || source?.fromProductPage) score += 5;
  if (isSourceBrand && !isMarketplaceProductUrl(url)) score += 10;
  if (isMarketplaceProductUrl(url) && isSourceBrand) score -= 28;
  if (/^(?:source|shop|store)$/i.test(brand)) score -= 22;
  if (looksLikeVariantDescriptor(brand)) score -= 36;
  if (sameComparableFieldValue(brand, source?.title)) score -= 30;

  return clamp(Math.round(score), 0, 99);
}

function finalTitleCandidate(product, url) {
  const value = cleanProductTitle(product?.title, product?.brand, url);
  return value ? extractionCandidate("title", value, titleCandidateConfidence(product, value, url), "selected") : null;
}

function titleCandidates(sources, url) {
  return sources
    .map(({ source, sourceName }) => {
      const value = cleanProductTitle(source?.title, source?.brand, url);
      return value
        ? extractionCandidate("title", value, titleCandidateConfidence(source, value, url), sourceName)
        : null;
    })
    .filter(Boolean);
}

function titleCandidateConfidence(source, value, url) {
  const title = cleanText(value);
  const urlTitle = cleanTitle(productTitleFromUrl(url), source?.brand);
  const wordCount = title.split(/\s+/).filter(Boolean).length;
  let score = 42;

  if (looksLikeProductName(title)) score += 14;
  if (looksLikeModelColorwayTitle(title)) score += 12;
  if (title.length >= 4 && title.length <= 64) score += 10;
  if (wordCount >= 1 && wordCount <= 8) score += 8;
  if (urlTitle && titleMatchesUrlTitle(title, urlTitle)) score += 14;
  if (source?.extractionSource === "linkedPage" || source?.fromProductPage) score += 4;
  if (looksLikeDescriptiveTitle(title) || isNoiseLine(title)) score -= 28;
  if (/\s\|\s/.test(title)) score -= 10;
  if (looksLikeVariantDescriptor(title) && !looksLikeProductName(title)) score -= 30;
  if (sameComparableFieldValue(title, source?.brand)) score -= 26;

  return clamp(Math.round(score), 0, 99);
}

function sameComparableFieldValue(left, right) {
  const leftKey = normalizeComparableText(left);
  const rightKey = normalizeComparableText(right);
  return Boolean(leftKey && rightKey && leftKey === rightKey);
}

function finalPriceCandidate(product) {
  return priceCandidateFromSource(product, "selected");
}

function priceCandidates(sources) {
  return sources
    .map(({ source, sourceName }) => priceCandidateFromSource(source, sourceName))
    .filter(Boolean);
}

function priceCandidateFromSource(source, sourceName) {
  const price = normalizePrice({
    amount: source?.priceAmount,
    currency: source?.currency,
    text: source?.priceText,
    compareAtAmount: source?.compareAtPriceAmount,
    compareAtText: source?.compareAtPriceText
  });
  if (!Number.isFinite(price.amount) && !price.originalText) {
    return null;
  }

  return extractionCandidate("price", price.originalText, priceCandidateConfidence(source, price), sourceName, {
    amount: price.amount,
    currency: price.currency,
    originalText: price.originalText,
    compareAtAmount: price.compareAtAmount,
    compareAtText: price.compareAtText,
    isSale: price.isSale
  });
}

function priceCandidateConfidence(source, price) {
  let score = 30;
  if (Number.isFinite(price.amount) && price.amount > 0) score += 34;
  if (price.currency) score += 14;
  if (price.originalText) score += 8;
  if (Number.isFinite(price.compareAtAmount)) score += 6;
  if (source?.extractionSource === "linkedPage" || source?.fromProductPage) score += 4;
  return clamp(Math.round(score), 0, 99);
}

function finalImageCandidate(product, url) {
  const value = toAbsoluteUrl(product?.imageUrl);
  return value ? extractionCandidate("image", value, imageCandidateConfidence(product, value, url), "selected") : null;
}

function imageCandidates(sources, url) {
  return sources
    .map(({ source, sourceName }) => {
      const value = toAbsoluteUrl(source?.imageUrl);
      return value
        ? extractionCandidate("image", value, imageCandidateConfidence(source, value, url), sourceName)
        : null;
    })
    .filter(Boolean);
}

function imageCandidateConfidence(source, value, url) {
  let score = 0;
  if (isUsableProductImageUrl(value)) score += 60;
  if (source?.extractionSource === "linkedPage" || source?.fromProductPage) score += 12;
  if (source?.fromContext) score += 6;
  if (needsOnProductImageUpgrade({ url, imageUrl: value })) score -= 24;
  if (/placeholder|logo|favicon|sprite|pixel/i.test(value)) score -= 34;
  return clamp(Math.round(score), 0, 99);
}

function extractionCandidate(field, value, confidence, source, extra = {}) {
  return compactObject({
    field,
    value,
    confidence: clamp(Math.round(confidence), 0, 99),
    source,
    ...extra
  });
}

function extractionDebugSnapshot(fields) {
  return compactObject({
    fields: Object.fromEntries(
      Object.entries(fields || {}).map(([field, quality]) => [
        field,
        extractionDebugField(field, quality)
      ])
    )
  });
}

function extractionDebugField(field, quality = {}) {
  const alternatives = Array.isArray(quality.alternatives) ? quality.alternatives : [];
  const selectedSource = cleanText(quality.source) || "unknown";
  const selectedValue = cleanText(quality.value);
  return compactObject({
    selectedSource,
    confidence: quality.confidence,
    reason: extractionDebugReason(field, quality, selectedSource, selectedValue),
    fallbackReason: extractionDebugFallbackReason(alternatives, selectedValue),
    candidateCount: alternatives.length + (selectedValue ? 1 : 0),
    alternatives: alternatives.slice(0, 2).map(extractionDebugAlternative)
  });
}

function extractionDebugReason(field, quality, selectedSource, selectedValue) {
  if (!selectedValue) {
    return "missing";
  }
  if (quality.needsReview) {
    return `needs-review:${field}:${selectedSource}`;
  }
  return `selected:${field}:${selectedSource}`;
}

function extractionDebugFallbackReason(alternatives, selectedValue) {
  if (!selectedValue) {
    return "no-usable-candidate";
  }
  if (!alternatives.length) {
    return "single-usable-candidate";
  }
  const source = cleanText(alternatives[0]?.source) || "alternative";
  return `selected-over:${source}`;
}

function extractionDebugAlternative(candidate) {
  return compactObject({
    value: candidate.value,
    source: candidate.source,
    confidence: candidate.confidence
  });
}
