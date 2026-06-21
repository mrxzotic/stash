function stripPriceFromText(value) {
  return cleanText(value)
    .replace(/[$€£¥₽₴]\s*[\d][\d\s.,]*/g, "")
    .replace(/[\d][\d\s.,]*\s*[$€£¥₽₴]/g, "")
    .replace(new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b\\s*[\\d][\\d\\s.,]*`, "gi"), "")
    .replace(new RegExp(`[\\d][\\d\\s.,]*\\s*\\b(${CURRENCY_CODE_PATTERN})\\b`, "gi"), "")
    .replace(/\s+/g, " ")
    .trim();
}

function bestImageFromElement(image) {
  return imageCandidatesFromElement(image).sort((a, b) => b.score - a.score)[0]?.url || "";
}

function bestProductImageUrl(context, image, scope, productUrl = "") {
  return bestProductImageUrls(context, image, scope, 1, productUrl)[0] || "";
}

function bestProductImageUrls(context, image, scope, limit = Number.POSITIVE_INFINITY, productUrl = "") {
  return productImageUrlsFromCandidates(productImageCandidates(context, image, scope, productUrl), limit);
}

function productImageCandidates(context, image, scope, productUrl = "") {
  const candidates = [];
  if (context.srcUrl && !image) {
    candidates.push({
      url: context.srcUrl,
      score: 12000 + productImageUrlContextScore(context.srcUrl, productUrl)
    });
  }
  candidates.push(...imageCandidatesFromElement(
    image,
    7000 + imageRoleScore(image) + imageProductContextScore(image, productUrl)
  ));

  Array.from(scope?.querySelectorAll?.("img") || []).forEach((scopeImage, index) => {
    const firstProductImageBonus = Math.max(0, 5200 - index * 800);
    candidates.push(
      ...imageCandidatesFromElement(
        scopeImage,
        Math.max(0, imageScore(scopeImage) / 100) +
          firstProductImageBonus +
          imageRoleScore(scopeImage) +
          imageProductContextScore(scopeImage, productUrl)
      )
    );
  });
  Array.from(scope?.querySelectorAll?.("source") || []).forEach((source, index) => {
    const sourceText = ["srcset", "src", "data-srcset", "data-src"].map((attribute) => source.getAttribute(attribute)).join(" ");
    const sourceScore = Math.max(0, 4200 - index * 600) + productImageUrlContextScore(sourceText, productUrl);
    candidates.push(...imageCandidatesFromPictureSource(source, sourceScore));
  });
  return candidates;
}

function imageRoleScore(image) {
  const signal = imageSignal(image);
  let score = 0;

  if (/\b(packshot|flat|flatlay|product|still|cutout|pdp|primary|main|front)\b/i.test(signal)) {
    score += 4200;
  }

  if (
    /\b(model|lifestyle|lookbook|campaign|editorial|worn|wearing|onbody|on-body|hover|alternate|portrait|fullbody)\b/i.test(
      signal
    )
  ) {
    score -= 7200;
  }

  return score;
}

function imageProductContextScore(image, productUrl) {
  const source = image?.currentSrc || image?.src || "";
  const hasLazySource = ["data-srcset", "data-original-srcset", "data-src", "data-original", "data-image", "data-master", "data-lazy-src", "data-zoom-src"].some((attribute) => image?.getAttribute?.(attribute));
  return (hasLazySource && looksLikeSiteFallbackImage(source) ? 0 : productImageUrlContextScore(source, productUrl)) +
    productImageUrlContextScore(image?.srcset || "", productUrl);
}

function productImageUrlContextScore(value, productUrl) {
  const imageText = normalizeComparableText(value);
  if (!imageText) {
    return 0;
  }

  const tokens = productImageContextTokens(productUrl);
  if (tokens.length && tokens.some((token) => imageText.includes(token))) {
    return 9000;
  }

  if (looksLikeSiteFallbackImage(value)) {
    return -16000;
  }

  return 0;
}

function productImageContextTokens(productUrl) {
  try {
    const url = new URL(productUrl || "", location.href);
    const sku = (url.pathname.split("/").filter(Boolean).at(-1) || "")
      .replace(/\.(?:html?|aspx|php)$/i, "");
    const parentSku = sku.replace(/[-_][a-z0-9]{2,}$/i, "");
    const tokens = parentSku !== sku && !/^[a-z]*\d[a-z\d]*$/i.test(parentSku)
      ? [sku, parentSku]
      : [sku];
    return tokens
      .map(normalizeComparableText)
      .filter((token, index, list) => token.length >= 4 && list.indexOf(token) === index);
  } catch {
    return [];
  }
}

function imageSignal(image) {
  if (!image) {
    return "";
  }

  return [
    image.currentSrc,
    image.src,
    image.alt,
    image.title,
    image.getAttribute("aria-label"),
    image.getAttribute("data-alt"),
    image.getAttribute("data-image-type"),
    image.getAttribute("data-testid"),
    image.className,
    image.closest?.("picture")?.className,
    image.parentElement?.className
  ]
    .map(cleanText)
    .join(" ");
}

function bestProductImageFromSources(sources, productUrl) {
  return bestProductImageUrlsFromSources(sources, productUrl, 1)[0] || "";
}

function bestProductImageUrlsFromSources(sources, productUrl, limit = Number.POSITIVE_INFINITY) {
  const first = firstValue(sources, "imageUrl");
  if (!shouldRankProductImageSources(productUrl)) {
    return normalizeProductImageUrls(
      sources.flatMap((source) => [source?.imageUrl, source?.imageUrls]),
      first,
      limit
    );
  }

  const candidates = sources
    .flatMap((source, index) =>
      normalizeProductImageUrls(source?.imageUrls, source?.imageUrl).map((url, imageIndex) => ({
        url,
        score: productImageUrlScore(url, index) + productImageUrlContextScore(url, productUrl) - imageIndex
      }))
    )
    .filter((candidate) => isUsableProductImageUrl(candidate.url));

  return productImageUrlsFromCandidates(candidates, limit, first);
}

function productImageUrlsFromCandidates(candidates, limit = Number.POSITIVE_INFINITY, fallback = "") {
  const ranked = candidates
    .filter((candidate) => isUsableProductImageUrl(candidate.url))
    .sort((a, b) => b.score - a.score)
    .map((candidate) => candidate.url);

  return normalizeProductImageUrls([...ranked, fallback], "", limit);
}

function normalizeProductImageUrls(values, primary = "", limit = Number.POSITIVE_INFINITY) {
  return normalizeProductImageUrlsFor(values, primary, location.href, limit);
}

function normalizeProductImageUrlsFor(values, primary = "", baseUrl = location.href, limit = Number.POSITIVE_INFINITY) {
  const urls = [primary, ...flattenImageUrlValues(values)]
    .map((value) => toAbsoluteUrlFor(value, baseUrl))
    .filter(isUsableProductImageUrl);
  const seen = new Set();

  return urls.filter((url) => {
    const key = normalizeUrl(url);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function flattenImageUrlValues(value) {
  if (!Array.isArray(value)) {
    if (value && typeof value === "object") {
      return flattenImageUrlValues([
        value.src,
        value.url,
        value.contentUrl,
        value.thumbnailUrl,
        value.extra_large,
        value.large,
        value.medium,
        value.small,
        value.originalSrc,
        value.preview_image?.src,
        value.image?.src
      ]);
    }
    return [value];
  }

  return value.flatMap(flattenImageUrlValues);
}

function shouldRankProductImageSources(productUrl) {
  try {
    const url = new URL(productUrl || location.href, location.href);
    return /(^|\.)on\.com$/i.test(url.hostname) || isAllSaintsProductUrl(url.href);
  } catch {
    return false;
  }
}

function needsOnProductImageUpgrade(product) {
  return Boolean(product?.url && product?.imageUrl && isOnProductUrl(product.url) && isOnUploadProductImage(product.imageUrl));
}

function isOnProductUrl(value) {
  try {
    return /(^|\.)on\.com$/i.test(new URL(value || location.href, location.href).hostname);
  } catch {
    return false;
  }
}

function isAllSaintsProductUrl(value) {
  try {
    const url = new URL(value || location.href, location.href);
    return /(^|\.)allsaints\.com$/i.test(url.hostname) && /\/[a-z0-9]+-[a-z0-9]+\.html$/i.test(url.pathname);
  } catch {
    return false;
  }
}

function isOnUploadProductImage(value) {
  try {
    const url = new URL(value || "", location.href);
    return /^upload\.on-running\.com$/i.test(url.hostname) && /\/spree\/products\/\d+\/product\//i.test(url.pathname);
  } catch {
    return false;
  }
}

function productImageUrlScore(value, index) {
  try {
    const url = new URL(value || "", location.href);
    let score = Math.max(0, 1000 - index * 10) + productImageDimensionScore(url);

    if (/^images\.ctfassets\.net$/i.test(url.hostname)) {
      score += 6000;
    }

    if (
      /^upload\.on-running\.com$/i.test(url.hostname) &&
      /\/spree\/products\/\d+\/product\//i.test(url.pathname)
    ) {
      score -= 5000;
    }

    if (/^(?:avif|webp)$/i.test(url.searchParams.get("fm") || "")) {
      score += 200;
    }

    return score;
  } catch {
    return 0;
  }
}

function productImageDimensionScore(url) {
  return Math.max(
    ...["w", "width", "h", "height"].map((key) =>
      Number.parseInt(url.searchParams.get(key), 10) || 0
    )
  );
}

function imageCandidatesFromElement(image, baseScore = 0) {
  if (!image) {
    return [];
  }

  const candidates = [
    ...parseSrcset(image.srcset).map((candidate) => ({
      ...candidate,
      score: candidate.score + baseScore + 1200
    }))
  ];
  const picture = image.closest?.("picture");

  Array.from(picture?.querySelectorAll?.("source") || []).forEach((source) => {
    candidates.push(...imageCandidatesFromPictureSource(source, baseScore + 1400));
  });

  for (const attribute of [
    "data-srcset",
    "data-original-srcset",
    "data-src",
    "data-original",
    "data-image",
    "data-master",
    "data-lazy-src",
    "data-zoom-src"
  ]) {
    const value = image.getAttribute(attribute);
    if (!value) {
      continue;
    }

    if (attribute.endsWith("srcset")) {
      candidates.push(
        ...parseSrcset(value).map((candidate) => ({
          ...candidate,
          score: candidate.score + baseScore + 5000
        }))
      );
    } else {
      candidates.push({ url: value, score: baseScore + 5000 });
    }
  }

  candidates.push({
    url: image.currentSrc || image.src,
    score: baseScore + 1000 + (image.naturalWidth || image.width || 0)
  });

  return candidates.filter((candidate) => isUsableProductImageUrl(candidate.url));
}

function imageCandidatesFromPictureSource(source, baseScore = 0) {
  const candidates = [];
  for (const attribute of ["srcset", "data-srcset", "data-original-srcset", "data-lazy-srcset"]) {
    const value = source.getAttribute(attribute);
    if (!value) {
      continue;
    }
    candidates.push(
      ...parseSrcset(value).map((candidate) => ({
        ...candidate,
        score: candidate.score + baseScore
      }))
    );
  }

  for (const attribute of ["src", "data-src", "data-original", "data-image", "data-lazy-src"]) {
    const value = source.getAttribute(attribute);
    if (value) {
      candidates.push({ url: value, score: baseScore + 5000 });
    }
  }

  return candidates;
}

function isUsableProductImageUrl(value) {
  const text = cleanText(value);
  if (!text || /^(?:blob|data|javascript|file):/i.test(text)) {
    return false;
  }

  try {
    const url = new URL(text, location.href);
    if (!/^https?:$/i.test(url.protocol)) {
      return false;
    }
  } catch {
    return false;
  }

  return !looksLikeSiteFallbackImage(text) &&
    !/(?:blank|placeholder|transparent|spacer|sprite|pixel|loader|loading|logo|favicon|icon)\.(?:gif|png|svg|webp|jpg|jpeg)(?:[?#]|$)/i.test(text);
}
function looksLikeSiteFallbackImage(value) {
  return /(?:fallback[-_/]?image|default[-_/]?image|site[-_/]?image|brand[-_/]?image|\/static\/fallback|AcneStudios\.png)(?:[?#/]|$)/i.test(
    cleanText(value)
  );
}

function parseSrcset(srcset) {
  return String(srcset || "")
    .replace(/(\s(?:\d+(?:\.\d+)?[wx]|\d+h))\s*,\s*/g, "$1\n").split("\n")
    .map((part) => {
      const [url, descriptor] = part.trim().split(/\s+/);
      const score = Number.parseFloat(descriptor) || 0;
      return { url, score };
    })
    .filter((candidate) => candidate.url);
}
