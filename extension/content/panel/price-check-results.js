async function panelItemWithCheckedPrice(item, price, checkedAt = new Date().toISOString()) {
  const previousPrice = normalizePanelItem(item).price || {};
  const rubPrice = await convertPriceToRub(price);
  const nextPrice = {
    amount: price.amount,
    currency: price.currency,
    originalText: price.originalText,
    compareAtAmount: price.compareAtAmount,
    compareAtText: price.compareAtText,
    isSale: price.isSale,
    rubAmount: rubPrice.amount,
    rubText: rubPrice.text,
    rate: rubPrice.rate,
    rateSource: rubPrice.source
  };
  const nextItem = {
    ...item,
    price: nextPrice,
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    rubPriceText: rubPrice.text,
    rubPriceAmount: rubPrice.amount,
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
  const current = normalizePanelItem(currentItem).price || {};
  const next = normalizePanelItem(nextItem).price || {};
  return [
    "amount",
    "currency",
    "compareAtAmount",
    "compareAtText",
    "isSale",
    "rubAmount"
  ].some((key) => cleanText(current[key]) !== cleanText(next[key]));
}

function panelPriceCheckState(currentItem, nextItem) {
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
  const currentRub = numericPrice(current.rubAmount);
  const nextRub = numericPrice(next.rubAmount);
  if (Number.isFinite(currentRub) && Number.isFinite(nextRub)) {
    return nextRub - currentRub;
  }

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

  return panelPriceCheckCompactObject({
    checkedAt: cleanText(checkedAt),
    state: panelPriceCheckSafeResultState(state),
    previous,
    current,
    deltaAmount: panelPriceCheckAmountDelta(previous, current),
    deltaRubAmount: panelPriceCheckRubDelta(previous, current)
  });
}

function panelPriceCheckSnapshot(price) {
  return panelPriceCheckCompactObject({
    amount: panelPriceCheckFiniteNumber(price?.amount),
    currency: cleanText(price?.currency).toUpperCase(),
    originalText: cleanText(price?.originalText),
    compareAtAmount: panelPriceCheckFiniteNumber(price?.compareAtAmount),
    compareAtText: cleanText(price?.compareAtText),
    isSale: price?.isSale === true ? true : undefined,
    rubAmount: panelPriceCheckFiniteNumber(price?.rubAmount),
    rubText: cleanText(price?.rubText)
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

function panelPriceCheckRubDelta(previous, current) {
  const previousRub = panelPriceCheckFiniteNumber(previous?.rubAmount);
  const currentRub = panelPriceCheckFiniteNumber(current?.rubAmount);
  return Number.isFinite(previousRub) && Number.isFinite(currentRub)
    ? currentRub - previousRub
    : undefined;
}

function panelPriceCheckFiniteNumber(value) {
  const amount = numericPrice(value);
  return Number.isFinite(amount) ? amount : undefined;
}

function panelPriceCheckSafeResultState(state) {
  return /^(same|up|down|updated|missed)$/.test(state) ? state : "same";
}

function panelPriceCheckCompactObject(object) {
  return Object.fromEntries(
    Object.entries(object)
      .filter(([, value]) => value !== undefined && value !== null && value !== "")
      .filter(([, value]) => typeof value !== "object" || Object.keys(value).length > 0)
  );
}
