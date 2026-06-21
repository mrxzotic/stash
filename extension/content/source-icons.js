function faviconUrlFromUrl(value) {
  let target;
  try {
    target = new URL(value || location.href, location.href);
  } catch {
    return "";
  }

  return faviconUrlFromDocument(target);
}

function faviconUrlForSource(value, storedFaviconUrl = "") {
  let target;
  try {
    target = new URL(value || location.href, location.href);
  } catch {
    return isPackagedSourceIconUrl(storedFaviconUrl) ? cleanText(storedFaviconUrl) : fallbackSourceIconUrl();
  }

  const localIcon = localSourceIconUrl(target);
  if (localIcon) {
    return localIcon;
  }

  const stored = cleanText(storedFaviconUrl);
  if (isPackagedSourceIconUrl(stored)) {
    return stored;
  }

  return fallbackSourceIconUrl();
}

function faviconUrlFromDocument(target) {
  const localIcon = localSourceIconUrl(target);
  return localIcon || fallbackSourceIconUrl();
}

function localSourceIconUrl(target) {
  const host = target.hostname.toLowerCase();
  if (sameSiteHost(host, "www.aimeleondore.com")) {
    return extensionAssetUrl("assets/source-aimeleondore.png");
  }

  return "";
}

function extensionAssetUrl(path) {
  if (typeof chrome === "undefined" || !chrome.runtime?.getURL) {
    return "";
  }

  return chrome.runtime.getURL(path);
}

function fallbackSourceIconUrl() {
  return extensionAssetUrl("assets/phosphor-light/globe.svg");
}

function isPackagedSourceIconUrl(value) {
  const text = cleanText(value);
  if (!text) {
    return false;
  }

  try {
    const url = new URL(text, location.href);
    return url.protocol === "chrome-extension:" || url.protocol === "moz-extension:";
  } catch {
    return false;
  }
}

function sameSiteHost(left, right) {
  const leftHost = rootHost(left);
  const rightHost = rootHost(right);
  return Boolean(leftHost && rightHost && leftHost === rightHost);
}

function rootHost(value) {
  const host = cleanText(value).toLowerCase().replace(/^www\./, "");
  const parts = host.split(".").filter(Boolean);
  return parts.length > 2 ? parts.slice(-2).join(".") : host;
}
