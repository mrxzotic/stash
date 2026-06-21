function renderSavedOverlayFields(item) {
  const fields = savedOverlayFields(item);
  return `
    ${fields.map((field) => `
    <div class="wl-field is-${escapeAttribute(field.key)}">
      <dt>${escapeHtml(field.label)}</dt>
      <dd>
        <span class="wl-field-value">${field.html}</span>
      </dd>
    </div>
    `).join("")}
  `;
}

function savedOverlayFields(item) {
  const brand = formatBrandName(item.brand || item.source || sourceNameFromUrl(item.url));
  const title = cleanProductTitle(item.title, brand, item.url) || "Saved Product";
  const priceHtml = renderSitePriceHtml(item, "wl") || `<span class="wl-missing">Not found</span>`;
  const brandQuality = savedFieldQuality("brand", item, brand);
  const titleQuality = savedFieldQuality("title", item, title);
  const priceQuality = savedFieldQuality("price", item, "");

  return [
    {
      key: "brand",
      field: "brand",
      label: "Brand",
      html: escapeHtml(brand),
      ...brandQuality
    },
    {
      key: "name",
      field: "title",
      label: "Name",
      html: escapeHtml(title),
      ...titleQuality
    },
    {
      key: "price",
      field: "price",
      label: "Price",
      html: priceHtml,
      ...priceQuality
    }
  ];
}

function savedFieldQuality(field, item, fallbackValue) {
  const quality = item.extraction?.fields?.[field];
  if (quality && Number.isFinite(quality.confidence)) {
    return {
      confidence: clamp(Math.round(quality.confidence), 0, 99),
      needsReview: Boolean(quality.needsReview),
      alternatives: Array.isArray(quality.alternatives) ? quality.alternatives : []
    };
  }

  return {
    confidence: savedFieldConfidence(field === "title" ? "name" : field, item, fallbackValue),
    needsReview: false,
    alternatives: []
  };
}

function savedFieldConfidence(type, item, value) {
  if (type === "brand") {
    return savedBrandConfidence(item, value);
  }

  if (type === "name") {
    return savedNameConfidence(item, value);
  }

  return savedPriceConfidence(item);
}

function savedBrandConfidence(item, value) {
  const brand = cleanBrandName(value) || cleanText(value);
  if (!brand) {
    return 0;
  }

  const source = sourceNameFromUrl(item.url);
  const title = cleanText(item.title);
  let score = 58;
  if (cleanBrandName(brand)) score += 12;
  if (brand.length <= 32) score += 8;
  if (brand.split(/\s+/).filter(Boolean).length <= 4) score += 8;
  if (normalizeComparableText(title).startsWith(normalizeComparableText(brand))) score += 6;
  if (normalizeComparableText(source) === normalizeComparableText(brand)) score += 8;
  if (/^(?:source|shop|store)$/i.test(brand)) score -= 22;

  return clamp(Math.round(score), 0, 99);
}

function savedNameConfidence(item, value) {
  const title = cleanText(value);
  if (!title || /^saved product$/i.test(title)) {
    return 0;
  }

  const urlTitle = cleanTitle(productTitleFromUrl(item.url), item.brand);
  const wordCount = title.split(/\s+/).filter(Boolean).length;
  let score = 54;
  if (looksLikeProductName(title)) score += 14;
  if (title.length >= 4 && title.length <= 64) score += 10;
  if (wordCount >= 1 && wordCount <= 8) score += 8;
  if (urlTitle && savedTitleMatchesUrlTitle(title, urlTitle)) score += 10;
  if (looksLikeDescriptiveTitle(title) || isNoiseLine(title)) score -= 28;

  return clamp(Math.round(score), 0, 99);
}

function savedTitleMatchesUrlTitle(title, urlTitle) {
  const titleKey = normalizeComparableText(title);
  const urlKey = normalizeComparableText(urlTitle);
  return Boolean(
    titleKey &&
      urlKey &&
      (titleKey === urlKey || titleKey.includes(urlKey) || urlKey.includes(titleKey))
  );
}

function savedPriceConfidence(item) {
  const price = item.price || {};
  const amount = price.amount ?? item.priceAmount;
  const currency = price.currency || item.currency;
  const text = price.originalText || item.priceText;
  if (!Number.isFinite(amount) && !cleanText(text)) {
    return 0;
  }

  let score = 36;
  if (Number.isFinite(amount) && amount > 0) score += 36;
  if (cleanText(currency)) score += 14;
  if (cleanText(text)) score += 8;
  if (Number.isFinite(price.compareAtAmount ?? item.compareAtPriceAmount)) score += 4;

  return clamp(Math.round(score), 0, 99);
}
