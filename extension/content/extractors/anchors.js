function findContextLinkByUrl(value, scope = document) {
  if (!value) {
    return null;
  }

  const linkUrl = normalizeUrl(value);
  return Array.from(scope?.querySelectorAll?.("a[href]") || [])
    .find((link) => sameProductPageUrl(link.href, linkUrl) || normalizeUrl(link.href) === linkUrl) || null;
}

function findContextImageByUrl(value, scope = document) {
  if (!value) {
    return null;
  }

  const imageUrl = normalizeUrl(value);
  return Array.from(scope?.querySelectorAll?.("img") || [])
    .find((image) =>
      imageCandidatesFromElement(image)
        .some((candidate) => normalizeUrl(toAbsoluteUrl(candidate.url)) === imageUrl)
    ) || null;
}
