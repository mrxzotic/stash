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
    return cleanText(storedFaviconUrl);
  }

  const localIcon = localSourceIconUrl(target);
  if (localIcon) {
    return localIcon;
  }

  const stored = cleanText(storedFaviconUrl);
  if (stored && !shouldReplaceStoredFavicon(target, stored)) {
    return stored;
  }

  return faviconUrlFromDocument(target);
}

function faviconUrlFromDocument(target) {
  const links = sameSiteHost(location.hostname, target.hostname)
    ? Array.from(document.querySelectorAll("link[rel][href]")).filter(isFaviconLink)
    : [];

  return links
    .map((link) => ({
      url: toAbsoluteUrl(link.getAttribute("href")),
      score: faviconLinkScore(link)
    }))
    .filter((candidate) => candidate.url)
    .sort((a, b) => b.score - a.score)[0]?.url || fallbackFaviconUrl(target);
}

function isFaviconLink(link) {
  const rel = cleanText(link.getAttribute("rel")).toLowerCase();
  return rel.includes("icon");
}

function faviconLinkScore(link) {
  const rel = cleanText(link.getAttribute("rel")).toLowerCase();
  const type = cleanText(link.getAttribute("type")).toLowerCase();
  const href = cleanText(link.getAttribute("href")).toLowerCase();
  const size = faviconLinkSize(link);
  return (
    (rel.includes("apple-touch-icon") ? 80 : 0) +
    (rel.includes("icon") ? 60 : 0) +
    (rel.includes("shortcut") ? 20 : 0) +
    (type.includes("png") || /\.png(?:[?#]|$)/i.test(href) ? 18 : 0) +
    (type.includes("svg") || /\.svg(?:[?#]|$)/i.test(href) ? 8 : 0) +
    (type.includes("x-icon") || /\.ico(?:[?#]|$)/i.test(href) ? 6 : 0) +
    Math.min(size, 256)
  );
}

function faviconLinkSize(link) {
  return cleanText(link.getAttribute("sizes"))
    .split(/\s+/)
    .map((size) => Number.parseInt(size, 10) || 0)
    .sort((a, b) => b - a)[0] || 0;
}

function fallbackFaviconUrl(target) {
  const localIcon = localSourceIconUrl(target);
  if (localIcon) {
    return localIcon;
  }

  const host = target.hostname.toLowerCase();
  if (host === "eu.aimeleondore.com") {
    return "https://eu.aimeleondore.com/cdn/shop/files/32x32_110654c9-b299-44a8-b950-40e12e132f45.png?v=1679431768";
  }

  if (sameSiteHost(host, "www.aimeleondore.com")) {
    return "https://www.aimeleondore.com/cdn/shop/files/favicon-32x32.png?v=1671713345";
  }

  return `${target.origin}/favicon.ico`;
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

function shouldReplaceStoredFavicon(target, storedFaviconUrl) {
  let stored;
  try {
    stored = new URL(storedFaviconUrl, target.href);
  } catch {
    return false;
  }

  return (
    sameSiteHost(target.hostname, "www.aimeleondore.com") &&
    /\/favicon\.ico$/i.test(stored.pathname)
  );
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
