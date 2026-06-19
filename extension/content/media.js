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

function bestProductImageUrl(context, image, scope) {
  const candidates = [];

  if (context.srcUrl) {
    candidates.push({ url: context.srcUrl, score: 6500 });
  }

  candidates.push(...imageCandidatesFromElement(image, 7000));

  Array.from(scope?.querySelectorAll?.("img") || []).forEach((scopeImage) => {
    candidates.push(
      ...imageCandidatesFromElement(scopeImage, Math.max(0, imageScore(scopeImage) / 100))
    );
  });

  return toAbsoluteUrl(
    candidates
      .filter((candidate) => isUsableProductImageUrl(candidate.url))
      .sort((a, b) => b.score - a.score)[0]?.url || ""
  );
}

function bestProductImageFromSources(sources, productUrl) {
  const first = firstValue(sources, "imageUrl");
  if (!shouldRankProductImageSources(productUrl)) {
    return first || "";
  }

  const candidates = sources
    .map((source, index) => ({
      url: source?.imageUrl,
      score: productImageUrlScore(source?.imageUrl, index)
    }))
    .filter((candidate) => isUsableProductImageUrl(candidate.url));

  return toAbsoluteUrl(candidates.sort((a, b) => b.score - a.score)[0]?.url || first || "");
}

function shouldRankProductImageSources(productUrl) {
  try {
    const url = new URL(productUrl || location.href, location.href);
    return /(^|\.)on\.com$/i.test(url.hostname);
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

  Array.from(picture?.querySelectorAll?.("source[srcset]") || []).forEach((source) => {
    candidates.push(
      ...parseSrcset(source.getAttribute("srcset")).map((candidate) => ({
        ...candidate,
        score: candidate.score + baseScore + 1400
      }))
    );
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
          score: candidate.score + baseScore + 1500
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

  return !/(?:blank|placeholder|transparent|spacer|sprite|pixel|loader|loading|logo|favicon|icon)\.(?:gif|png|svg|webp|jpg|jpeg)(?:[?#]|$)/i.test(text);
}

function parseSrcset(srcset) {
  return String(srcset || "")
    .split(",")
    .map((part) => {
      const [url, descriptor] = part.trim().split(/\s+/);
      const score = Number.parseFloat(descriptor) || 0;
      return { url, score };
    })
    .filter((candidate) => candidate.url);
}
