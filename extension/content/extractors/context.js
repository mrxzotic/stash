function itemProp(scope, name) {
  if (!scope) {
    return "";
  }

  const element = scope.matches?.(`[itemprop="${name}"]`)
    ? scope
    : scope.querySelector?.(`[itemprop="${name}"]`);

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

function extractFromMeta(context) {
  const title =
    metaContent("og:title") ||
    metaContent("twitter:title") ||
    document.querySelector("h1")?.textContent;
  const imageUrl =
    context.srcUrl ||
    metaContent("og:image") ||
    metaContent("twitter:image");
  const priceText =
    metaContent("product:price:amount") ||
    metaContent("og:price:amount") ||
    findVisiblePriceText();
  const currency =
    metaContent("product:price:currency") ||
    metaContent("og:price:currency") ||
    currencyFromText(priceText);
  const price = normalizePrice({ text: priceText, currency });
  const brand =
    metaContent("product:brand") ||
    metaContent("twitter:data1") ||
    document.querySelector('[data-component*="Brand" i]')?.textContent;

  return compactObject({
    title: cleanProductTitle(stripPriceFromText(title), brand, context.linkUrl || location.href),
    brand: cleanBrandName(brand),
    url: normalizeUrl(
      context.linkUrl ||
        document.querySelector('link[rel="canonical"]')?.href ||
        metaContent("og:url") ||
        location.href
    ),
    imageUrl: toAbsoluteUrl(imageUrl),
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale
  });
}

function extractFromContext(context) {
  const target = getContextTarget();
  if (!target) {
    return {};
  }

  const contextLink = findContextLinkByUrl(context.linkUrl);
  const contextImage = findContextImageByUrl(context.srcUrl);
  const anchor = contextLink || contextImage || target;
  const initialLink = contextLink || findClosestProductLink(anchor) || findParentLink(anchor);
  const scope = expandProductScopeToDetails(findProductScope(anchor, initialLink), anchor);
  const link = findProductLink(anchor, scope, context, initialLink);
  const image = contextImage || findProductImage(anchor, scope);
  const linkUrl = context.linkUrl || link?.href || "";
  const textLines = getTextLines(scope);
  const imageAlt = cleanText(image?.alt);
  const linkText = cleanText(link?.textContent);
  const parsedPrice = findBestPrice(textLines, imageAlt, linkText);
  const brand = findLikelyBrand(textLines, imageAlt, linkText);
  const title =
    findLikelyTitle(textLines, imageAlt, linkText, brand) ||
    imageAlt ||
    linkText ||
    context.selectionText;

  return compactObject({
    fromContext: true,
    title: cleanProductTitle(stripPriceFromText(title), brand, linkUrl || location.href),
    brand: cleanBrandName(brand),
    url: linkUrl ? normalizeUrl(linkUrl) : "",
    imageUrl: bestProductImageUrl(context, image, scope),
    priceText: parsedPrice.originalText,
    priceAmount: parsedPrice.amount,
    currency: parsedPrice.currency,
    compareAtPriceText: parsedPrice.compareAtText,
    compareAtPriceAmount: parsedPrice.compareAtAmount,
    isSale: parsedPrice.isSale
  });
}

function findProductScope(target, link) {
  const candidates = [];
  let node = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;

  for (let depth = 0; node && node !== document.body && depth < 9; depth += 1) {
    candidates.push(node);
    node = node.parentElement;
  }

  if (link) {
    let linkNode = link;
    for (let depth = 0; linkNode && linkNode !== document.body && depth < 4; depth += 1) {
      candidates.push(linkNode);
      linkNode = linkNode.parentElement;
    }
  }

  const scored = candidates
    .filter((candidate, index, list) => list.indexOf(candidate) === index)
    .map((candidate) => ({
      node: candidate,
      score: productScopeScore(candidate),
      area: elementArea(candidate)
    }))
    .filter((candidate) => candidate.score >= 4)
    .sort((a, b) => b.score - a.score || a.area - b.area);

  return scored[0]?.node || link?.closest("article, li, div, a") || target.closest?.("article, li, div, a") || target;
}

function expandProductScopeToDetails(scope, target) {
  let best = scope || target;
  let bestScore = productDetailScore(best);
  let node = best?.parentElement;
  const maxArea = Math.max(1, window.innerWidth * window.innerHeight * 0.5);

  for (let depth = 0; node && node !== document.body && depth < 5; depth += 1) {
    const area = elementArea(node);
    if (area > maxArea) {
      break;
    }

    if (hasMultipleProductPageUrls(node)) {
      break;
    }

    const score = productDetailScore(node);
    if (score > bestScore) {
      best = node;
      bestScore = score;
    }

    node = node.parentElement;
  }

  return best;
}

function productDetailScore(element) {
  if (!element) {
    return 0;
  }

  const lines = getTextLines(element);
  const text = lines.join(" ");
  let score = productScopeScore(element);

  if (findBestPrice(lines).amount) score += 10;
  if (lines.some(looksLikeProductName)) score += 4;
  if (lines.some(isBrandLikeLine)) score += 2;
  if (hasMultipleProductPageUrls(element)) score -= 14;
  if (looksLikeDescriptiveTitle(text)) score -= 6;
  if (text.length > 700) score -= 8;

  return score;
}

function productScopeScore(element) {
  if (!element?.querySelectorAll) {
    return 0;
  }

  const text = getTextLines(element).join(" ");
  const productUrls = productPageUrlsInScope(element);
  const linkCount = element.querySelectorAll("a[href]").length;
  const imageCount = element.querySelectorAll("img, picture, source").length;
  const hasProductLink = productUrls.length > 0;
  const className = String(element.className || "");
  let score = 0;

  if (element.matches("article, li, a")) score += 1;
  if (/product|card|item|catalog|tile|goods/i.test(className)) score += 3;
  if (hasProductLink || isProductLikeUrl(element.href)) score += 4;
  if (imageCount > 0) score += 2;
  if (looksLikePrice(text)) score += 2;
  if (text.length >= 8 && text.length <= 420) score += 1;
  if (productUrls.length > 1) score -= 8;
  if (linkCount > 3) score -= 3;
  if (imageCount > 4) score -= 3;
  if (text.length > 1000) score -= 4;
  if (elementArea(element) > window.innerWidth * window.innerHeight * 0.45) score -= 5;

  return score;
}

function elementArea(element) {
  const rect = element?.getBoundingClientRect?.();
  return rect ? Math.max(0, rect.width) * Math.max(0, rect.height) : Number.MAX_SAFE_INTEGER;
}

function getContextTarget() {
  if (lastContextTarget?.isConnected) {
    return lastContextTarget;
  }

  return document.elementsFromPoint(lastContextPoint.x, lastContextPoint.y)
    .find((element) => element && element !== document.documentElement && element !== document.body);
}

function findClosestProductLink(target) {
  const closestLinks = [];
  let node = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;

  for (let depth = 0; node && node !== document.body && depth < 8; depth += 1) {
    if (node.matches?.("a[href]")) {
      closestLinks.push(node);
    }
    const descendant = node.querySelector?.("a[href]");
    if (descendant) {
      closestLinks.push(descendant);
    }
    node = node.parentElement;
  }

  return (
    closestLinks.find((link) => isProductLikeUrl(link.href)) ||
    closestLinks[0] ||
    null
  );
}

function findProductLink(target, scope, context, initialLink) {
  if (context.linkUrl) {
    return findContextLinkByUrl(context.linkUrl, scope) ||
      findContextLinkByUrl(context.linkUrl) ||
      { href: context.linkUrl, textContent: "" };
  }

  if (initialLink?.href && isProductLikeUrl(initialLink.href)) {
    return initialLink;
  }

  const links = Array.from(scope?.querySelectorAll?.("a[href]") || []);
  const productLink = links.find((link) => isProductLikeUrl(link.href));
  if (productLink) {
    return productLink;
  }

  if (initialLink?.href) {
    return initialLink;
  }

  return (
    links.find((link) => link.getBoundingClientRect().width > 20) ||
    null
  );
}

function findProductImage(target, scope) {
  if (target?.matches?.("img")) {
    return target;
  }

  const pointImage = document
    .elementsFromPoint(lastContextPoint.x, lastContextPoint.y)
    .find((element) => element.matches?.("img"));
  if (pointImage) {
    return pointImage;
  }

  const images = Array.from(scope?.querySelectorAll?.("img") || []);
  if (!images.length) {
    return null;
  }

  return images
    .map((image) => ({
      image,
      score: imageScore(image)
    }))
    .sort((a, b) => b.score - a.score)[0]?.image || images[0];
}

function imageScore(image) {
  const rect = image.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const distance = Math.hypot(centerX - lastContextPoint.x, centerY - lastContextPoint.y);
  const visibleArea = Math.max(0, rect.width) * Math.max(0, rect.height);

  return visibleArea - distance * 8;
}

function isProductLikeUrl(value) {
  try {
    const url = new URL(value, location.href);
    const isFarfetchProduct =
      /^(?:.+\.)?farfetch\.com$/i.test(url.hostname) && /-item-\d+\.aspx$/i.test(url.pathname);
    const isPyeProduct =
      typeof isPyeProductUrl === "function" && isPyeProductUrl(url.href);
    return (
      /\/(product|products|item|items|p)\//i.test(url.pathname) ||
      isFarfetchProduct ||
      isPyeProduct ||
      looksLikeSkuProductPath(url)
    );
  } catch {
    return false;
  }
}

function looksLikeSkuProductPath(url) {
  const segments = url.pathname.split("/").filter(Boolean);
  const skuSegment = segments.at(-1) || "";
  const titleSegment = segments.at(-2) || "";
  if (!/\.html?$/i.test(skuSegment) || !titleSegment) {
    return false;
  }

  const sku = skuSegment.replace(/\.html?$/i, "");
  return (
    /^(?=[a-z0-9_-]*[a-z])(?=[a-z0-9_-]*\d)[a-z0-9]{4,24}(?:[-_][a-z0-9]{2,})*$/i.test(sku) &&
    looksLikeProductName(cleanUrlTitleSegment(titleSegment))
  );
}

function findParentLink(target) {
  let node = target;
  for (let depth = 0; node && depth < 4; depth += 1) {
    const link = node.querySelector?.("a[href]");
    if (link) {
      return link;
    }
    node = node.parentElement;
  }
  return null;
}

function getTextLines(scope) {
  if (!scope) {
    return [];
  }

  return String(scope.innerText || scope.textContent || "")
    .split(/\n+/)
    .map((line) => cleanText(line))
    .filter(Boolean)
    .filter((line, index, lines) => lines.indexOf(line) === index)
    .slice(0, 40);
}

function findLikelyTitle(textLines, imageAlt, linkText, brand) {
  const brandText = cleanText(brand).toLocaleLowerCase();
  const candidates = productTextCandidates(textLines, imageAlt, linkText).filter(
    (value) => cleanText(value).toLocaleLowerCase() !== brandText
  );

  return (
    candidates.find(looksLikeProductName) ||
    candidates.find((value) => value.length > 8 && !isBrandLikeLine(value)) ||
    candidates[0]
  );
}

function findLikelyBrand(textLines, imageAlt, linkText) {
  if (/(^|\.)post-post-scriptum\.com$/i.test(location.hostname)) return "P.P.S.";
  const candidates = productTextCandidates(textLines, imageAlt, linkText);
  return candidates.find(isBrandLikeLine) || sourceNameFromUrl(location.href);
}

function productTextCandidates(...groups) {
  return groups
    .flat()
    .map((value) => cleanText(value))
    .filter(Boolean)
    .map(stripPriceFromText)
    .map(stripTitleActionNoise)
    .map(cleanText)
    .filter((value, index, values) => values.indexOf(value) === index)
    .filter((value) => value.length > 1)
    .filter((value) => !looksLikePrice(value))
    .filter((value) => !isNoiseLine(value))
    .filter((value) => !looksLikeMeasurementLine(value));
}

function isBrandLikeLine(value) {
  const text = cleanText(stripPriceFromText(value));
  if (!cleanBrandName(text)) {
    return false;
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return text.length <= 42 && wordCount <= 4;
}
