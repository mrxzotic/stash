function renderSavedOverlayImage(item) {
  const urls = panelCardImageUrls(item);
  const imageUrl = urls[0] || "";

  if (!imageUrl) {
    return `<div class="wl-image">${renderMissingProductImage("wl")}</div>`;
  }

  const sliderAttributes = urls.length > 1
    ? ` data-overlay-image-slider-id="${escapeAttribute(savedOverlayItemIdentity(item).id)}" data-overlay-image-index="0" data-overlay-image-initial-url="${escapeAttribute(imageUrl)}"`
    : "";

  return `
    <div class="wl-image${urls.length > 1 ? " has-slider" : ""}"${sliderAttributes}>
      <span class="wl-image-frame">
        <img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(panelProductImageAlt(item))}" referrerpolicy="no-referrer">
      </span>
      ${urls.length > 1 ? renderSavedOverlayImageControls(urls, item) : ""}
    </div>
  `;
}

function renderSavedOverlayImageControls(urls, item) {
  const label = ` for ${panelItemAccessibleName(item)}`;
  return `
    <button class="wl-image-slider-button is-prev" type="button" aria-label="${escapeAttribute(`Previous image${label}`)}" data-overlay-image-slide="previous">
      ${phosphorChevronLeftIcon("wl-image-slider-icon")}
    </button>
    <button class="wl-image-slider-button is-next" type="button" aria-label="${escapeAttribute(`Next image${label}`)}" data-overlay-image-slide="next">
      ${phosphorChevronRightIcon("wl-image-slider-icon")}
    </button>
    <span class="wl-image-slider-tray">
      <button class="wl-image-delete-button" type="button" aria-label="${escapeAttribute(`Remove current image${label}`)}" title="Remove image" data-overlay-image-delete>
        ${phosphorImageOffIcon("wl-image-delete-icon")}
      </button>
    </span>
    <span class="wl-image-slider" aria-hidden="true">
      ${urls.map((url, index) => `
        <span class="wl-image-slider-dot${index === 0 ? " is-active" : ""}" data-overlay-image-url="${escapeAttribute(url)}"></span>
      `).join("")}
    </span>
  `;
}

function bindSavedOverlayImageEvents(root, item) {
  unbindSavedOverlayImageEvents(root);
  root.__stashOverlayImageClick = (event) => {
    const deleteButton = event.target.closest?.("[data-overlay-image-delete]");
    if (deleteButton && root.contains(deleteButton)) {
      event.preventDefault();
      event.stopPropagation();
      const media = deleteButton.closest("[data-overlay-image-slider-id]");
      deleteSavedOverlayImage(root, media, item);
      return;
    }

    const button = event.target.closest?.("[data-overlay-image-slide]");
    if (!button || !root.contains(button)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const media = button.closest("[data-overlay-image-slider-id]");
    slideSavedOverlayImage(media, button.dataset.overlayImageSlide === "previous" ? -1 : 1, item);
    if (event.detail > 0) {
      button.blur();
    }
  };
  root.addEventListener("click", root.__stashOverlayImageClick);
}

function unbindSavedOverlayImageEvents(root) {
  if (!root.__stashOverlayImageClick) {
    return;
  }

  root.removeEventListener("click", root.__stashOverlayImageClick);
  root.__stashOverlayImageClick = null;
}

function slideSavedOverlayImage(media, direction, item) {
  const urls = savedOverlayImageUrls(media);
  if (urls.length < 2) {
    return;
  }

  const currentIndex = clamp(Number(media.dataset.overlayImageIndex) || 0, 0, urls.length - 1);
  const nextIndex = (currentIndex + direction + urls.length) % urls.length;
  setSavedOverlayImageIndex(media, nextIndex, urls);
  commitSavedOverlayImage(media, item);
}

function setSavedOverlayImageIndex(media, index, urls = savedOverlayImageUrls(media)) {
  const imageUrl = urls[index] || urls[0] || "";
  const image = media?.querySelector(".wl-image-frame > img");
  if (!imageUrl || !image) {
    return;
  }

  if (image.getAttribute("src") !== imageUrl) {
    image.setAttribute("src", imageUrl);
  }
  media.dataset.overlayImageIndex = String(index);
  media.querySelectorAll(".wl-image-slider-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });
}

function commitSavedOverlayImage(media, item) {
  const imageUrl = savedOverlayImageUrls(media)[Number(media?.dataset.overlayImageIndex) || 0] || "";
  if (!imageUrl || imageUrl === media?.dataset.overlayImageInitialUrl) {
    return;
  }

  media.dataset.overlayImageInitialUrl = imageUrl;
  safelyRunPanelAction(() => saveSavedOverlayImageChoice(item, imageUrl));
}

function deleteSavedOverlayImage(root, media, item) {
  const urls = savedOverlayImageUrls(media);
  if (urls.length < 2) {
    return;
  }

  const currentIndex = clamp(Number(media.dataset.overlayImageIndex) || 0, 0, urls.length - 1);
  const imageUrl = urls[currentIndex] || urls[0] || "";
  const remaining = urls.filter((_, index) => index !== currentIndex);
  const nextImageUrl = remaining[Math.min(currentIndex, remaining.length - 1)] || remaining[0] || "";
  safelyRunPanelAction(() =>
    removeSavedOverlayImage(root, media, item, imageUrl, nextImageUrl)
  );
}

async function saveSavedOverlayImageChoice(item, imageUrl) {
  const result = await updateSavedOverlayStoredItem(item, (savedItem, urls) => {
    if (normalizeUrl(savedItem.imageUrl) === normalizeUrl(imageUrl)) {
      return null;
    }

    return {
      ...savedItem,
      id: savedItem.id || savedOverlayItemIdentity(item).id,
      imageUrl,
      imageUrls: normalizeProductImageUrls(urls, imageUrl, SAVED_IMAGE_URL_LIMIT),
      updatedAt: new Date().toISOString()
    };
  });

  if (result && panelState.open) {
    renderStashPanel();
  }
}

async function removeSavedOverlayImage(root, media, item, imageUrl, nextImageUrl) {
  const removedKey = normalizeUrl(imageUrl);
  const nextKey = normalizeUrl(nextImageUrl);
  const result = await updateSavedOverlayStoredItem(item, (savedItem, urls) => {
    const remaining = urls.filter((url) => normalizeUrl(url) !== removedKey);
    if (!remaining.length || remaining.length === urls.length) {
      return null;
    }

    const primary = remaining.find((url) => normalizeUrl(url) === nextKey) || remaining[0];
    return {
      ...savedItem,
      id: savedItem.id || savedOverlayItemIdentity(item).id,
      imageUrl: primary,
      imageUrls: normalizeProductImageUrls(remaining, primary, SAVED_IMAGE_URL_LIMIT),
      updatedAt: new Date().toISOString()
    };
  });

  if (!result?.item) {
    return;
  }

  replaceSavedOverlayImageMedia(root, media, result.item);
  if (panelState.open) {
    renderStashPanel();
  }
}

async function updateSavedOverlayStoredItem(item, updater) {
  const identity = savedOverlayItemIdentity(item);
  if (!identity.id && !identity.url) {
    return null;
  }

  const stored = await getLocalStorageValue(STORAGE_KEY);
  const currentItems = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
  let updatedItem = null;
  const nextItems = currentItems.map((savedItem) => {
    if (!savedOverlayItemsMatch(savedItem, identity)) {
      return savedItem;
    }

    const urls = normalizeProductImageUrls(savedItem.imageUrls, savedItem.imageUrl, SAVED_IMAGE_URL_LIMIT);
    const nextItem = updater(savedItem, urls);
    if (!nextItem) {
      return savedItem;
    }

    updatedItem = nextItem;
    return nextItem;
  });

  if (!updatedItem) {
    return null;
  }

  await setLocalStorageValue(STORAGE_KEY, nextItems);
  panelState.items = nextItems;
  return { item: updatedItem, items: nextItems };
}

function replaceSavedOverlayImageMedia(root, media, item) {
  const template = document.createElement("template");
  template.innerHTML = renderSavedOverlayImage(item).trim();
  const nextMedia = template.content.firstElementChild;
  if (!nextMedia) {
    return;
  }

  media.replaceWith(nextMedia);
  bindImageFallbacks(root);
}

function savedOverlayImageUrls(media) {
  return Array.from(media?.querySelectorAll("[data-overlay-image-url]") || [])
    .map((dot) => dot.dataset.overlayImageUrl)
    .filter(Boolean);
}

function savedOverlayItemIdentity(item) {
  const url = normalizeUrl(item?.url || "");
  return {
    id: item?.id || (url ? productId(url) : ""),
    url
  };
}

function savedOverlayItemsMatch(savedItem, identity) {
  const savedUrl = normalizeUrl(savedItem?.url || "");
  const savedId = savedItem?.id || (savedUrl ? productId(savedUrl) : "");
  return Boolean(
    (identity.id && savedId === identity.id) ||
    (identity.url && savedUrl === identity.url)
  );
}
