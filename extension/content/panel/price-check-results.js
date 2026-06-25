async function panelItemWithCheckedPrice(item, price, checkedAt = new Date().toISOString()) {
  const previousPrice = normalizePanelItem(item).price || {};
  const checkedPrice = {
    amount: price.amount,
    currency: price.currency,
    originalText: price.originalText,
    compareAtAmount: price.compareAtAmount,
    compareAtText: price.compareAtText,
    isSale: price.isSale
  };
  const nextPrice = panelPriceCheckShouldKeepCurrentP448Sale(item, checkedPrice)
    ? previousPrice
    : checkedPrice;
  const nextItem = {
    ...item,
    price: nextPrice,
    priceText: nextPrice.originalText,
    priceAmount: nextPrice.amount,
    currency: nextPrice.currency,
    compareAtPriceText: nextPrice.compareAtText,
    compareAtPriceAmount: nextPrice.compareAtAmount,
    isSale: nextPrice.isSale,
    updatedAt: checkedAt
  };
  const currentPrice = normalizePanelItem(nextItem).price || nextPrice;
  const state = panelPriceCheckState(item, nextItem);

  return {
    ...nextItem,
    priceCheck: panelPriceCheckMeta(previousPrice, currentPrice, state, checkedAt)
  };
}

function panelItemWithMissedPriceCheck(item, checkedAt = new Date().toISOString()) {
  const currentPrice = normalizePanelItem(item).price || {};

  return {
    ...item,
    priceCheck: panelPriceCheckMeta(currentPrice, currentPrice, "missed", checkedAt),
    updatedAt: checkedAt
  };
}

function panelItemPriceChanged(currentItem, nextItem) {
  if (
    panelPriceCheckIsP448SaleParserCorrection(currentItem, nextItem) ||
    panelPriceCheckShouldKeepCurrentP448Sale(currentItem, normalizePanelItem(nextItem).price || nextItem?.price || {})
  ) {
    return false;
  }

  const current = normalizePanelItem(currentItem).price || {};
  const next = normalizePanelItem(nextItem).price || {};
  return [
    "amount",
    "currency",
    "compareAtAmount",
    "compareAtText",
    "isSale"
  ].some((key) => cleanText(current[key]) !== cleanText(next[key]));
}

function panelPriceCheckState(currentItem, nextItem) {
  if (
    panelPriceCheckIsP448SaleParserCorrection(currentItem, nextItem) ||
    panelPriceCheckShouldKeepCurrentP448Sale(currentItem, normalizePanelItem(nextItem).price || nextItem?.price || {})
  ) {
    return "same";
  }

  const current = normalizePanelItem(currentItem).price || {};
  const next = normalizePanelItem(nextItem).price || {};
  const delta = panelPriceCheckPriceDelta(current, next);
  if (Number.isFinite(delta) && delta < 0) {
    return "down";
  }
  if (Number.isFinite(delta) && delta > 0) {
    return "up";
  }
  return panelItemPriceChanged(currentItem, nextItem) ? "updated" : "same";
}

function panelPriceCheckPriceDelta(current, next) {
  const currentCurrency = cleanText(current.currency).toUpperCase();
  const nextCurrency = cleanText(next.currency).toUpperCase();
  const currentAmount = numericPrice(current.amount);
  const nextAmount = numericPrice(next.amount);
  if (currentCurrency && currentCurrency === nextCurrency && Number.isFinite(currentAmount) && Number.isFinite(nextAmount)) {
    return nextAmount - currentAmount;
  }

  return undefined;
}

function replacePanelPriceCheckItem(items, updatedItem) {
  const id = normalizePanelItem(updatedItem).id;
  return items.map((item) => normalizePanelItem(item).id === id ? updatedItem : item);
}

function panelPriceCheckMeta(previousPrice, currentPrice, state, checkedAt) {
  const previous = panelPriceCheckSnapshot(previousPrice);
  const current = panelPriceCheckSnapshot(currentPrice);
  const deltaAmount = /^(up|down)$/.test(state)
    ? panelPriceCheckAmountDelta(previous, current)
    : undefined;

  return panelPriceCheckCompactObject({
    checkedAt: cleanText(checkedAt),
    state: panelPriceCheckSafeResultState(state),
    previous,
    current,
    deltaAmount
  });
}

function panelPriceCheckSnapshot(price) {
  return panelPriceCheckCompactObject({
    amount: panelPriceCheckFiniteNumber(price?.amount),
    currency: cleanText(price?.currency).toUpperCase(),
    originalText: cleanText(price?.originalText),
    compareAtAmount: panelPriceCheckFiniteNumber(price?.compareAtAmount),
    compareAtText: cleanText(price?.compareAtText),
    isSale: price?.isSale === true ? true : undefined
  });
}

function panelPriceCheckAmountDelta(previous, current) {
  if (!previous?.currency || previous.currency !== current?.currency) {
    return undefined;
  }

  const previousAmount = panelPriceCheckFiniteNumber(previous.amount);
  const currentAmount = panelPriceCheckFiniteNumber(current.amount);
  return Number.isFinite(previousAmount) && Number.isFinite(currentAmount)
    ? currentAmount - previousAmount
    : undefined;
}

function panelPriceCheckFiniteNumber(value) {
  const amount = numericPrice(value);
  return Number.isFinite(amount) ? amount : undefined;
}

function panelPriceCheckSafeResultState(state) {
  return /^(same|up|down|updated|missed)$/.test(state) ? state : "same";
}

function panelPriceCheckIsP448SaleParserCorrection(currentItem, nextItem) {
  if (!panelPriceCheckIsP448Url(currentItem?.url || nextItem?.url)) {
    return false;
  }

  const current = normalizePanelItem(currentItem).price || {};
  const next = normalizePanelItem(nextItem).price || {};
  const currentCurrency = cleanText(current.currency).toUpperCase();
  const nextCurrency = cleanText(next.currency).toUpperCase();
  const currentAmount = numericPrice(current.amount);
  const nextAmount = numericPrice(next.amount);
  const nextCompareAtAmount = numericPrice(next.compareAtAmount);
  return Boolean(
    currentCurrency &&
      currentCurrency === nextCurrency &&
      next.isSale === true &&
      Number.isFinite(currentAmount) &&
      Number.isFinite(nextAmount) &&
      Number.isFinite(nextCompareAtAmount) &&
      nextAmount < nextCompareAtAmount &&
      Math.abs(currentAmount - nextCompareAtAmount) < 0.01 &&
      !current.isSale
  );
}

function panelPriceCheckShouldKeepCurrentP448Sale(currentItem, checkedPrice) {
  if (!panelPriceCheckIsP448Url(currentItem?.url)) {
    return false;
  }

  const current = normalizePanelItem(currentItem).price || {};
  const currentCurrency = cleanText(current.currency).toUpperCase();
  const nextCurrency = cleanText(checkedPrice?.currency).toUpperCase();
  const currentAmount = numericPrice(current.amount);
  const currentCompareAtAmount = numericPrice(current.compareAtAmount);
  const nextAmount = numericPrice(checkedPrice?.amount);
  return Boolean(
    currentCurrency &&
      currentCurrency === nextCurrency &&
      current.isSale === true &&
      checkedPrice?.isSale !== true &&
      Number.isFinite(currentAmount) &&
      Number.isFinite(currentCompareAtAmount) &&
      Number.isFinite(nextAmount) &&
      currentAmount < currentCompareAtAmount &&
      Math.abs(nextAmount - currentCompareAtAmount) < 0.01
  );
}

function panelPriceCheckIsP448Url(value) {
  try {
    const url = new URL(value || location.href, location.href);
    return /^(?:.+\.)?p448\.com$/i.test(url.hostname) && /\/products\//i.test(url.pathname);
  } catch {
    return false;
  }
}

function panelPriceCheckCompactObject(object) {
  return Object.fromEntries(
    Object.entries(object)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .filter(([, value]) => typeof value !== "object" || Object.keys(value).length > 0)
  );
}
