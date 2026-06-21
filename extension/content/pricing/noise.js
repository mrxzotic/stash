function hasCompareAtEvidence(price, candidates = []) {
  const currency = cleanText(price.currency).toUpperCase();
  const comparable = candidates.filter((candidate) =>
    Number.isFinite(candidate.amount) &&
      cleanText(candidate.currency).toUpperCase() === currency
  );
  if (comparable.length < 2) {
    return false;
  }

  return (
    comparable.some((candidate) => candidate.saleEvidence) ||
    comparable.every((candidate) => isStandalonePriceText(candidate.sourceText))
  );
}

function hasSalePriceEvidence(value) {
  return /\b(?:sale|regular|was|were|now|save|saved|discount|markdown|reduced|reduction|clearance|last\s+season)\b|\b\d{1,2}\s*%\s*off\b|-\s*\d{1,2}\s*%/i.test(
    cleanText(value)
  );
}

function isStandalonePriceText(value) {
  const text = cleanText(value).replace(new RegExp(`\\b(?:${CURRENCY_CODE_PATTERN})\\b`, "gi"), "");
  return Boolean(text) && !/[a-zа-я]/i.test(text);
}

function isOnlyNonProductPriceText(value) {
  const text = cleanText(value);
  return text.length <= 140 && hasNonProductPriceContextBeforePrice(text);
}

function hasNonProductPriceContextBeforePrice(value) {
  const text = cleanText(value);
  const index = firstPriceTokenIndex(text);
  return index >= 0 && isNonProductPriceMatch(text, index);
}

function isNonProductPriceMatch(text, index) {
  const before = cleanText(String(text || "").slice(Math.max(0, index - 90), index));
  return (
    firstPriceTokenIndex(before) < 0 &&
    (
      /\b(?:free\s+shipping|shipping|delivery|returns?|orders?)\b/i.test(before) ||
      /(?:бесплатная\s+доставка|доставка|возврат|заказ(?:е|ы)?)/i.test(before)
    )
  );
}

function firstPriceTokenIndex(value) {
  const text = cleanText(value);
  const match = text.match(
    new RegExp(`[$€£¥₽₴]\\s*\\d|\\d[\\d\\s.,]*\\s*[$€£¥₽₴]|\\b(?:${CURRENCY_CODE_PATTERN})\\b\\s*\\d|\\d[\\d\\s.,]*\\s*\\b(?:${CURRENCY_CODE_PATTERN})\\b`, "i")
  );
  return match ? match.index : -1;
}
