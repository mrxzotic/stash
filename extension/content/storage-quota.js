function shouldRetryStorageQuotaWrite(key, value, error) {
  return key === STORAGE_KEY && Array.isArray(value) && isStorageQuotaError(error);
}

async function retryQuotaStorageWrite(key, value, sanitized, initialError) {
  let lastError = initialError;
  await removeStorageKeys([LEGACY_STORAGE_KEYS.get(key)]);

  for (const retryValue of storageQuotaRetryValues(key, value, sanitized)) {
    try {
      await chrome.storage.local.set({ [key]: retryValue });
      return retryValue;
    } catch (error) {
      lastError = error;
      if (!isStorageQuotaError(error)) break;
    }
  }

  return resetOversizedStorageKeyAndWriteTinyValue(key, value, lastError);
}

function storageQuotaRetryValues(key, value, sanitized) {
  return [
    sanitized,
    sanitizeStorageValue(storageValueForWrite(key, value, { mode: "lean" })),
    sanitizeStorageValue(storageValueForWrite(key, value, { mode: "tiny" }))
  ];
}

async function resetOversizedStorageKeyAndWriteTinyValue(key, value, initialError) {
  const tinyValue = sanitizeStorageValue(storageValueForWrite(key, value, { mode: "tiny" }));
  try {
    await removeStorageKeys([key, LEGACY_STORAGE_KEYS.get(key)]);
    await chrome.storage.local.set({ [key]: tinyValue });
    return tinyValue;
  } catch (error) {
    throw normalizeExtensionError(error || initialError);
  }
}

function isStorageQuotaError(error) {
  return /quota|quotaexceeded|exceeded storage/i.test(String(error?.message || error || ""));
}
