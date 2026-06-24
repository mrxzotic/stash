function findBestPrice(...groups) {
  const values = groups.flat().filter(Boolean).map(cleanText);
  const candidates = [];
  let hasStartedPriceBlock = false;

  for (const value of values) {
    if (isInstallmentPriceText(value)) {
      continue;
    }

    const prices = priceCandidatesFromText(value);
    if (!prices.length) {
      if (hasStartedPriceBlock) {
        break;
      }
      continue;
    }

    hasStartedPriceBlock = true;
    candidates.push(...prices);
  }

  return bestPriceFromCandidates(candidates);
}

function priceCandidatesFromText(value) {
  const prices = parsePricesFromText(value);
  if (prices.length) {
    return prices;
  }

  if (isOnlyNonProductPriceText(value)) {
    return [];
  }

  const price = normalizePrice({ text: value });
  return Number.isFinite(price.amount) && price.currency ? [price] : [];
}

function bestPriceFromCandidates(candidates) {
  const firstCurrency = cleanText(candidates[0]?.currency).toUpperCase();
  if (!firstCurrency) {
    return {};
  }

  const sameCurrencyCandidates = candidates.filter(
    (candidate) => cleanText(candidate.currency).toUpperCase() === firstCurrency
  );
  return priceWithCompareAt(
    currentPriceCandidate(sameCurrencyCandidates),
    sameCurrencyCandidates
  );
}

function bestPriceFromSources(sources) {
  return sources
    .map((source, index) => {
      const price = normalizePrice({
        amount: source?.priceAmount,
        currency: source?.currency,
        text: source?.priceText,
        compareAtAmount: source?.compareAtPriceAmount,
        compareAtText: source?.compareAtPriceText
      });
      return {
        price,
        score: priceSourceScore(source, price, index)
      };
    })
    .filter((candidate) =>
      Number.isFinite(candidate.price.amount) && candidate.price.currency
    )
    .sort((a, b) => b.score - a.score)[0]?.price || {};
}

function priceSourceScore(source, price, index) {
  let score = Math.max(0, 24 - index * 2);
  const hasPositiveAmount = Number.isFinite(price.amount) && price.amount > 0;

  if (hasPositiveAmount) score += 20;
  else if (Number.isFinite(price.amount)) score -= 30;
  if (price.currency) score += 8;
  if (price.originalText) score += 4;
  if (hasPositiveAmount && Number.isFinite(price.compareAtAmount)) score += 24;
  if (hasPositiveAmount && source?.isSale) score += 8;
  if (parsePricesFromText(source?.priceText).length > 1) score += 5;
  if (!source?.priceText && source?.priceAmount) score -= 3;

  return score;
}

function parsePricesFromText(value) {
  const text = cleanText(normalizePriceText(value));
  if (!text || isInstallmentPriceText(text)) {
    return [];
  }

  const matches = [];
  const patterns = [
    /([$€£¥₽₴])\s*([\d][\d\s.,]*)/gi,
    /([\d][\d\s.,]*)\s*([$€£¥₽₴])/gi,
    new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b\\s*([\\d][\\d\\s.,]*)`, "gi"),
    new RegExp(`([\\d][\\d\\s.,]*)\\s*\\b(${CURRENCY_CODE_PATTERN})\\b`, "gi")
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text))) {
      const first = match[1];
      const second = match[2];
      const currency = first.length === 1
        ? currencyFromSymbol(first)
        : second.length === 1
          ? currencyFromSymbol(second)
          : first.match(/^[A-Z]{3}$/i)
            ? first
            : second;
      const rawAmountText = first.length === 1 || first.match(/^[A-Z]{3}$/i)
        ? second
        : first;
      const { amountText, originalText } = trimPercentDiscountSuffix(
        rawAmountText,
        match[0],
        text.slice(pattern.lastIndex)
      );
      if (isNonProductPriceMatch(text, match.index)) {
        continue;
      }
      const price = parsedPrice(amountText, currency, originalText);
      if (Number.isFinite(price.amount) && price.currency) {
        matches.push({
          ...price,
          index: match.index,
          sourceText: text,
          saleEvidence: hasSalePriceEvidence(text)
        });
      }
    }
  }

  return matches
    .sort((a, b) => a.index - b.index)
    .map(({ index, ...price }) => price);
}

function trimPercentDiscountSuffix(amountText, originalText, remainingText) {
  if (!/^\s*%/.test(remainingText)) {
    return { amountText, originalText };
  }

  const trimmedAmount = String(amountText || "").replace(/\s+\d{1,2}$/, "");
  if (trimmedAmount === amountText) {
    return { amountText, originalText };
  }

  return {
    amountText: trimmedAmount,
    originalText: String(originalText || "").replace(/\s+\d{1,2}$/, "")
  };
}

function normalizePrice({ amount, currency, text, compareAtAmount, compareAtText } = {}) {
  const parsed = parsePriceFromText(text, currency);
  const explicitAmount = numericPrice(amount);
  const priceAmount = explicitAmount === 0 && Number.isFinite(parsed.amount) && parsed.amount > 0
    ? parsed.amount
    : explicitAmount ?? parsed.amount;
  const priceCurrency = cleanText(currency || parsed.currency).toUpperCase();
  const originalText =
    formatOriginalPrice(priceAmount, priceCurrency) ||
    parsed.originalText ||
    cleanText(text);
  const compareAt = normalizeCompareAtPrice(
    {
      amount: compareAtAmount ?? parsed.compareAtAmount,
      currency: priceCurrency,
      text: compareAtText ?? parsed.compareAtText
    },
    { amount: priceAmount, currency: priceCurrency }
  );

  return normalizeSuspiciousLowCompareAtPrice(compactObject({
    amount: priceAmount,
    currency: priceCurrency,
    originalText,
    compareAtAmount: compareAt.amount,
    compareAtText: compareAt.originalText,
    isSale: Boolean(compareAt.amount)
  }));
}

function parsePriceFromText(value, fallbackCurrency) {
  const text = cleanText(normalizePriceText(value));
  if (!text || isInstallmentPriceText(text)) {
    return {};
  }

  const prices = parsePricesFromText(text);
  if (prices.length) {
    return priceWithCompareAt(currentPriceCandidate(prices), prices);
  }

  if (isOnlyNonProductPriceText(text)) {
    return {};
  }

  const symbolBefore = text.match(/([$€£¥₽₴])\s*([\d][\d\s.,]*)/);
  if (symbolBefore) {
    return parsedPrice(symbolBefore[2], currencyFromSymbol(symbolBefore[1]), symbolBefore[0]);
  }

  const symbolAfter = text.match(/([\d][\d\s.,]*)\s*([$€£¥₽₴])/);
  if (symbolAfter) {
    return parsedPrice(symbolAfter[1], currencyFromSymbol(symbolAfter[2]), symbolAfter[0]);
  }

  const codeBefore = text.match(
    new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b\\s*([\\d][\\d\\s.,]*)`, "i")
  );
  if (codeBefore) {
    return parsedPrice(codeBefore[2], codeBefore[1], codeBefore[0]);
  }

  const codeAfter = text.match(
    new RegExp(`([\\d][\\d\\s.,]*)\\s*\\b(${CURRENCY_CODE_PATTERN})\\b`, "i")
  );
  if (codeAfter) {
    return parsedPrice(codeAfter[1], codeAfter[2], codeAfter[0]);
  }

  if (fallbackCurrency && /^[\d\s.,]+$/.test(text)) {
    return parsedPrice(text, fallbackCurrency, formatOriginalPrice(text, fallbackCurrency));
  }

  return {};
}

function currentPriceCandidate(prices) {
  if (prices.length < 2) {
    return prices[0];
  }

  const currency = cleanText(prices[0].currency).toUpperCase();
  const sameCurrency = prices.every(
    (price) => cleanText(price.currency).toUpperCase() === currency
  );
  if (!sameCurrency) {
    return prices[prices.length - 1];
  }

  const priced = prices.filter((price) => Number.isFinite(price.amount));
  const positive = priced.filter((price) => price.amount > 0);
  const usable = withoutSuspiciousTinyCurrentPrices(positive.length ? positive : priced);
  return usable.sort((a, b) => a.amount - b.amount)[0] || prices[prices.length - 1];
}

function priceWithCompareAt(price, candidates = []) {
  const currentAmount = numericPrice(price.amount);
  const currentCurrency = cleanText(price.currency).toUpperCase();
  const originalText =
    formatOriginalPrice(currentAmount, currentCurrency) ||
    price.originalText;
  const compareAt = hasCompareAtEvidence(price, candidates)
    ? candidates
        .filter((candidate) => cleanText(candidate.currency).toUpperCase() === currentCurrency)
        .filter((candidate) => Number.isFinite(candidate.amount))
        .filter((candidate) => candidate.amount > currentAmount)
        .sort((a, b) => b.amount - a.amount)[0]
    : null;

  return normalizeSuspiciousLowCompareAtPrice(compactObject({
    amount: currentAmount,
    currency: currentCurrency,
    originalText,
    compareAtAmount: compareAt?.amount,
    compareAtText:
      compareAt?.originalText ||
      formatOriginalPrice(compareAt?.amount, compareAt?.currency),
    isSale: Boolean(compareAt)
  }));
}

function withoutSuspiciousTinyCurrentPrices(prices) {
  const highest = prices
    .filter((price) => Number.isFinite(price.amount))
    .sort((a, b) => b.amount - a.amount)[0]?.amount;
  if (!Number.isFinite(highest)) {
    return prices;
  }

  const filtered = prices.filter((price) =>
    !isSuspiciousTinyCurrentPrice(price.amount, highest)
  );
  return filtered.length ? filtered : prices;
}

function normalizeSuspiciousLowCompareAtPrice(price) {
  if (!isSuspiciousTinyCurrentPrice(price.amount, price.compareAtAmount)) {
    return price;
  }

  const amount = numericPrice(price.compareAtAmount);
  const currency = cleanText(price.currency).toUpperCase();
  return compactObject({
    amount,
    currency,
    originalText:
      price.compareAtText ||
      formatOriginalPrice(amount, currency) ||
      price.originalText
  });
}

function isSuspiciousTinyCurrentPrice(amount, referenceAmount) {
  const current = numericPrice(amount);
  const reference = numericPrice(referenceAmount);
  return (
    Number.isFinite(current) &&
    Number.isFinite(reference) &&
    current >= 0 &&
    current <= 10 &&
    reference >= 100 &&
    reference / Math.max(current, 1) >= 8
  );
}

function normalizeCompareAtPrice(compareAt, current) {
  const parsed = parsePriceFromText(compareAt.text, compareAt.currency);
  const amount = numericPrice(compareAt.amount) ?? parsed.amount;
  const currency = cleanText(compareAt.currency || parsed.currency || current.currency).toUpperCase();
  const currentAmount = numericPrice(current.amount);
  const currentCurrency = cleanText(current.currency).toUpperCase();
  const scaledAmount =
    Number.isFinite(amount) && currentAmount > 0 &&
    amount / Math.max(currentAmount, 1) >= 20 && amount / 100 > currentAmount
      ? amount / 100
      : amount;

  if (
    !Number.isFinite(scaledAmount) ||
    !Number.isFinite(currentAmount) ||
    !currency ||
    currency !== currentCurrency ||
    scaledAmount <= currentAmount
  ) {
    return {};
  }

  return {
    amount: scaledAmount,
    currency,
    originalText:
      formatOriginalPrice(scaledAmount, currency) ||
      parsed.originalText ||
      cleanText(compareAt.text)
  };
}

function parsedPrice(rawAmount, currency, originalText) {
  const amount = parseLocalizedNumber(rawAmount);
  if (!Number.isFinite(amount)) {
    return {};
  }

  return {
    amount,
    currency: cleanText(currency).toUpperCase(),
    originalText: formatOriginalPrice(amount, currency) || cleanText(originalText)
  };
}

function parseLocalizedNumber(value) {
  let text = String(value || "").replace(/\s/g, "");
  if (!text) {
    return undefined;
  }

  if (text.includes(",") && text.includes(".")) {
    const commaIndex = text.lastIndexOf(",");
    const dotIndex = text.lastIndexOf(".");
    text = commaIndex > dotIndex
      ? text.replace(/\./g, "").replace(",", ".")
      : text.replace(/,/g, "");
  } else if (text.includes(",") && !text.includes(".")) {
    const commaIndex = text.lastIndexOf(",");
    const decimals = text.length - commaIndex - 1;
    text = decimals === 2 ? text.replace(",", ".") : text.replace(/,/g, "");
  } else if (text.includes(".") && /^\d{1,3}(?:\.\d{3})+$/.test(text)) {
    text = text.replace(/\./g, "");
  }

  const amount = Number.parseFloat(text);
  return Number.isFinite(amount) ? amount : undefined;
}

function isInstallmentPriceText(value) {
  const text = cleanText(normalizePriceText(value));
  return /\b(?:klarna|afterpay|clearpay|affirm|installments?|instalments?|monthly|pay\s+in\s+\d|split\s+payments?)\b|(?:\/|\bper\s+)(?:month|mo|mth)\b|(?:долями|подели|сплит|рассроч|плат[её]ж|частями|по\s+[\d\s.,]+\s*₽\s*[x×х]\s*\d)/i.test(text);
}
