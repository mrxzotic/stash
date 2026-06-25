function compactStoragePriceCheck(value) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const state = compactStoragePriceCheckState(value.state);
  const checkedAt = compactStorageDate(value.checkedAt);
  if (!state || !checkedAt) {
    return undefined;
  }

  return compactStorageObject({
    checkedAt,
    state,
    previous: compactStoragePriceCheckSnapshot(value.previous),
    current: compactStoragePriceCheckSnapshot(value.current),
    deltaAmount: compactStorageFiniteNumber(value.deltaAmount),
    deltaRubAmount: compactStorageFiniteNumber(value.deltaRubAmount)
  });
}

function compactStoragePriceCheckSnapshot(value) {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  return compactStorageObject({
    amount: compactStorageFiniteNumber(value.amount),
    currency: cleanText(value.currency).toUpperCase(),
    originalText: cleanText(value.originalText),
    compareAtAmount: compactStorageFiniteNumber(value.compareAtAmount),
    compareAtText: cleanText(value.compareAtText),
    isSale: value.isSale === true ? true : undefined,
    rubAmount: compactStorageFiniteNumber(value.rubAmount),
    rubText: cleanText(value.rubText)
  });
}

function compactStoragePriceCheckState(value) {
  const state = cleanText(value).toLowerCase();
  return /^(same|up|down|updated|missed)$/.test(state) ? state : "";
}

function compactStorageFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
