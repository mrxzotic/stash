function findBestPrice(...groups) {
  const values = groups.flat().filter(Boolean).map(cleanText);

  for (const value of values) {
    const prices = parsePricesFromText(value);
    const price = prices.length
      ? priceWithCompareAt(prices[prices.length - 1], prices)
      : normalizePrice({ text: value });
    if (Number.isFinite(price.amount) && price.currency) {
      return price;
    }
  }

  return {};
}

function parsePricesFromText(value) {
  const text = cleanText(value);
  if (!text) {
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
      const amountText = first.length === 1 || first.match(/^[A-Z]{3}$/i)
        ? second
        : first;
      const price = parsedPrice(amountText, currency, match[0]);
      if (Number.isFinite(price.amount) && price.currency) {
        matches.push({ ...price, index: match.index });
      }
    }
  }

  return matches
    .sort((a, b) => a.index - b.index)
    .map(({ index, ...price }) => price);
}

function normalizePrice({ amount, currency, text, compareAtAmount, compareAtText } = {}) {
  const parsed = parsePriceFromText(text, currency);
  const priceAmount = numericPrice(amount) ?? parsed.amount;
  const priceCurrency = cleanText(currency || parsed.currency).toUpperCase();
  const originalText =
    parsed.originalText ||
    formatOriginalPrice(priceAmount, priceCurrency) ||
    cleanText(text);
  const compareAt = normalizeCompareAtPrice(
    {
      amount: compareAtAmount ?? parsed.compareAtAmount,
      currency: priceCurrency,
      text: compareAtText ?? parsed.compareAtText
    },
    { amount: priceAmount, currency: priceCurrency }
  );

  return compactObject({
    amount: priceAmount,
    currency: priceCurrency,
    originalText,
    compareAtAmount: compareAt.amount,
    compareAtText: compareAt.originalText,
    isSale: Boolean(compareAt.amount)
  });
}

function parsePriceFromText(value, fallbackCurrency) {
  const text = cleanText(value);
  if (!text) {
    return {};
  }

  const prices = parsePricesFromText(text);
  if (prices.length) {
    return priceWithCompareAt(prices[prices.length - 1], prices);
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

function priceWithCompareAt(price, candidates = []) {
  const currentAmount = numericPrice(price.amount);
  const currentCurrency = cleanText(price.currency).toUpperCase();
  const originalText =
    price.originalText ||
    formatOriginalPrice(currentAmount, currentCurrency);
  const compareAt = candidates
    .filter((candidate) => cleanText(candidate.currency).toUpperCase() === currentCurrency)
    .filter((candidate) => Number.isFinite(candidate.amount))
    .filter((candidate) => candidate.amount > currentAmount)
    .sort((a, b) => b.amount - a.amount)[0];

  return compactObject({
    amount: currentAmount,
    currency: currentCurrency,
    originalText,
    compareAtAmount: compareAt?.amount,
    compareAtText:
      compareAt?.originalText ||
      formatOriginalPrice(compareAt?.amount, compareAt?.currency),
    isSale: Boolean(compareAt)
  });
}

function normalizeCompareAtPrice(compareAt, current) {
  const parsed = parsePriceFromText(compareAt.text, compareAt.currency);
  const amount = numericPrice(compareAt.amount) ?? parsed.amount;
  const currency = cleanText(compareAt.currency || parsed.currency || current.currency).toUpperCase();
  const currentAmount = numericPrice(current.amount);
  const currentCurrency = cleanText(current.currency).toUpperCase();

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(currentAmount) ||
    !currency ||
    currency !== currentCurrency ||
    amount <= currentAmount
  ) {
    return {};
  }

  return {
    amount,
    currency,
    originalText:
      parsed.originalText ||
      formatOriginalPrice(amount, currency) ||
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
    originalText: cleanText(originalText)
  };
}

function parseLocalizedNumber(value) {
  let text = String(value || "").replace(/\s/g, "");
  if (!text) {
    return undefined;
  }

  if (text.includes(",") && text.includes(".")) {
    text = text.replace(/,/g, "");
  } else if (text.includes(",") && !text.includes(".")) {
    const commaIndex = text.lastIndexOf(",");
    const decimals = text.length - commaIndex - 1;
    text = decimals === 2 ? text.replace(",", ".") : text.replace(/,/g, "");
  }

  const amount = Number.parseFloat(text);
  return Number.isFinite(amount) ? amount : undefined;
}
