async function upsertItem(item) {
  const result = await upsertItemWithResult(item);
  return result.items;
}

async function upsertItemWithResult(item) {
  const stored = await getLocalStorageValue(STORAGE_KEY);
  const currentItems = Array.isArray(stored[STORAGE_KEY])
    ? stored[STORAGE_KEY]
    : [];
  const itemKey = savedItemIdentityKey(item);
  const previousItem = currentItems.find((existing) => savedItemIdentityKey(existing) === itemKey);
  const nextItem = previousItem ? mergeRepeatedSavedItem(previousItem, item) : item;
  const nextItems = [
    nextItem,
    ...currentItems.filter((existing) => savedItemIdentityKey(existing) !== itemKey)
  ].slice(0, 300);

  const storedItems = await setLocalStorageValue(STORAGE_KEY, nextItems);
  const items = Array.isArray(storedItems) ? storedItems : nextItems;
  return {
    state: previousItem ? "updated" : "created",
    item: items.find((existing) => savedItemIdentityKey(existing) === itemKey) || nextItem,
    items,
    previousItem
  };
}

function mergeRepeatedSavedItem(previousItem, item) {
  return {
    ...item,
    id: previousItem.id || item.id,
    category: previousItem.category || item.category,
    shortlistedAt: previousItem.shortlistedAt,
    decision: previousItem.decision,
    archivedAt: previousItem.archivedAt,
    createdAt: previousItem.createdAt || item.createdAt,
    updatedAt: new Date().toISOString()
  };
}

function savedItemIdentityKey(item) {
  const rawUrl = cleanText(item?.url);
  if (rawUrl) {
    const url = normalizeUrl(rawUrl);
    return productIdentityKey(url) || url;
  }
  return cleanText(item?.id);
}
