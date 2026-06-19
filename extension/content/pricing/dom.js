function metaContent(property) {
  return document.querySelector(`meta[property="${property}"], meta[name="${property}"]`)?.content;
}

function findVisiblePriceText(scope = document) {
  const candidates = visiblePriceCandidates(scope);

  if (candidates.length <= 1) {
    return candidates[0];
  }

  const firstPrice = parsePricesFromText(candidates[0])[0];
  const companion = candidates.slice(1, 6).find((candidate) => {
    const price = parsePricesFromText(candidate)[0];
    return (
      price &&
      firstPrice &&
      price.currency === firstPrice.currency &&
      price.amount !== firstPrice.amount
    );
  });

  return companion ? `${candidates[0]} ${companion}` : candidates[0];
}

function visiblePriceCandidates(scope = document) {
  const selectors = [
    '[itemprop*="price" i]',
    '[content*="$"], [content*="€"], [content*="£"], [content*="¥"], [content*="₽"], [content*="₴"]',
    '[aria-label*="$"], [aria-label*="€"], [aria-label*="£"], [aria-label*="¥"], [aria-label*="₽"], [aria-label*="₴"]',
    '[data-testid*="price" i]',
    '[data-test*="price" i]',
    '[data-qa*="price" i]',
    '[class*="price" i]',
    '[class*="amount" i]',
    "button",
    '[role="button"]',
    "span",
    "p",
    "strong",
    "s"
  ].join(",");
  const candidates = [];

  Array.from(scope.querySelectorAll?.(selectors) || []).forEach((node) => {
    if (!isUsablePriceElement(node)) {
      return;
    }

    priceTextsFromElement(node).forEach((text) => {
      if (text.length <= 96 && looksLikePrice(text)) {
        candidates.push({
          text,
          score: priceElementScore(node, text)
        });
      }
    });
  });

  return candidates
    .sort((a, b) => b.score - a.score)
    .map((candidate) => candidate.text)
    .filter((text, index, list) => list.indexOf(text) === index)
    .slice(0, 8);
}

function priceTextsFromElement(element) {
  const values = [
    element.getAttribute("content"),
    element.getAttribute("aria-label"),
    element.getAttribute("data-price"),
    element.getAttribute("data-amount"),
    element.getAttribute("data-value"),
    element.getAttribute("value"),
    element.innerText,
    element.textContent
  ];

  if (element.dataset) {
    Object.entries(element.dataset).forEach(([key, value]) => {
      if (/price|amount|value|currency/i.test(key)) {
        values.push(value);
      }
    });
  }

  return values
    .map(cleanText)
    .filter(Boolean)
    .flatMap((text) => {
      const prices = parsePricesFromText(text);
      return prices.length ? prices.map((price) => price.originalText) : [text];
    })
    .filter((text, index, list) => list.indexOf(text) === index);
}

function isUsablePriceElement(element) {
  if (
    !element ||
    element.closest?.("#stash-panel-root, #stash-extension-root") ||
    element.closest?.("[aria-hidden='true']")
  ) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number(style.opacity) === 0
  ) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function priceElementScore(element, text) {
  const className = String(element.className || "");
  const label = [
    className,
    element.id,
    element.getAttribute("data-testid"),
    element.getAttribute("data-test"),
    element.getAttribute("data-qa"),
    element.getAttribute("itemprop")
  ].join(" ");
  let score = 0;

  if (/price|amount|cost/i.test(label)) score += 12;
  if (element.matches?.("meta, [itemprop*='price' i]")) score += 8;
  if (element.closest?.("main")) score += 3;
  if (element.closest?.("button, [role='button']")) score += 2;
  if (parsePricesFromText(text).length > 1) score += 3;
  if (text.length <= 32) score += 2;
  if (/shipping|delivery|free|returns/i.test(text)) score -= 10;

  return score;
}

function findVisibleCurrencyCode(scope = document) {
  const text = [
    metaContent("product:price:currency"),
    metaContent("og:price:currency"),
    scope?.textContent?.slice(0, 5000)
  ]
    .filter(Boolean)
    .join(" ");
  const match = text.match(new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b`, "i"));

  return match?.[1]?.toUpperCase() || "";
}
