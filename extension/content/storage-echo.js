var tuckioLocalStorageEchoes = new Map();
var tuckioLocalStorageWriteDepth = 0;

async function setTuckioLocalStorageValue(key, value) {
  rememberTuckioLocalStorageWrite(key, value);
  tuckioLocalStorageWriteDepth += 1;
  try {
    await chrome.storage.local.set({ [key]: value });
  } catch (error) {
    forgetTuckioLocalStorageWrite(key);
    throw error;
  } finally {
    tuckioLocalStorageWriteDepth = Math.max(0, tuckioLocalStorageWriteDepth - 1);
  }
}

function tuckioPanelRenderSuppressedForLocalWrite() {
  return tuckioLocalStorageWriteDepth > 0;
}

function rememberTuckioLocalStorageWrite(key, value) {
  tuckioLocalStorageEchoes.set(key, tuckioStorageEchoSignature(value));
}

function forgetTuckioLocalStorageWrite(key) {
  tuckioLocalStorageEchoes.delete(key);
}

function tuckioStorageChangeIsLocalEcho(changes) {
  const entries = Object.entries(changes || {});
  if (!entries.length) {
    return false;
  }

  const keys = [];
  const isLocalEcho = entries.every(([key, change]) => {
    const expected = tuckioLocalStorageEchoes.get(key);
    if (!expected || expected !== tuckioStorageEchoSignature(change?.newValue)) {
      return false;
    }
    keys.push(key);
    return true;
  });

  if (isLocalEcho) {
    keys.forEach(forgetTuckioLocalStorageWrite);
  }
  return isLocalEcho;
}

function tuckioStorageEchoSignature(value) {
  try {
    return JSON.stringify(tuckioStableStorageEchoValue(value));
  } catch {
    return String(value);
  }
}

function tuckioStableStorageEchoValue(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(tuckioStableStorageEchoValue);
  }

  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, tuckioStableStorageEchoValue(value[key])])
  );
}
