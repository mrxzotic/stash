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
