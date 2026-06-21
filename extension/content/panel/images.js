function panelCardImageUrls(item) {
  return normalizeProductImageUrls(item.imageUrls, item.imageUrl, SAVED_IMAGE_URL_LIMIT);
}

function panelImageSliderAttributes(item) {
  const urls = panelCardImageUrls(item);
  if (urls.length < 2) {
    return "";
  }

  return `data-image-slider-id="${escapeAttribute(item.id)}" data-image-index="0" data-image-initial-url="${escapeAttribute(urls[0])}"`;
}

function renderPanelCardImageFrame(item, options = {}) {
  const urls = panelCardImageUrls(item);
  const imageUrl = urls[0] || "";
  const alt = options.alt ?? panelProductImageAlt(item);
  const frame = imageUrl
    ? `<span class="wp-image-frame is-wide"><img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(alt)}" referrerpolicy="no-referrer"></span>`
    : lucideImageIcon("wp-image-placeholder");
  const slider = options.slider === false || urls.length < 2
    ? ""
    : renderPanelImageSliderControls(urls, item);

  return `${frame}${slider}`;
}

function renderPanelImageSliderControls(urls, item = null) {
  const label = item ? ` for ${panelItemAccessibleName(item)}` : "";
  return `
    <button class="wp-image-slider-button is-prev" type="button" aria-label="${escapeAttribute(`Previous image${label}`)}" data-image-slide="previous">
      ${lucideChevronLeftIcon("wp-image-slider-icon")}
    </button>
    <button class="wp-image-slider-button is-next" type="button" aria-label="${escapeAttribute(`Next image${label}`)}" data-image-slide="next">
      ${lucideChevronRightIcon("wp-image-slider-icon")}
    </button>
    <span class="wp-image-slider-tray">
      ${renderPanelImageDeleteButton(item)}
    </span>
    ${renderPanelImageSliderDots(urls)}
  `;
}

function renderPanelImageSliderDots(urls) {
  return `
    <span class="wp-image-slider" aria-hidden="true">
      ${urls.map((url, index) => `
        <span class="wp-image-slider-dot${index === 0 ? " is-active" : ""}" data-image-url="${escapeAttribute(url)}"></span>
      `).join("")}
    </span>
  `;
}

function renderPanelImageDeleteButton(item = null) {
  const label = item ? ` from ${panelItemAccessibleName(item)}` : "";
  return `
    <button class="wp-image-delete-button" type="button" aria-label="${escapeAttribute(`Remove current image${label}`)}" title="Remove image" data-image-delete>
      ${lucideImageOffIcon("wp-image-delete-icon")}
    </button>
  `;
}

function bindPanelImageSliderEvents(root) {
  const items = root.querySelector(".wp-items");
  if (!items || items.__stashImageSliderBound) {
    return;
  }

  items.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-image-delete]");
    if (deleteButton && items.contains(deleteButton)) {
      event.preventDefault();
      event.stopPropagation();
      deletePanelCardImage(deleteButton.closest("[data-image-slider-id]"));
      return;
    }

    const button = event.target.closest("[data-image-slide]");
    if (!button || !items.contains(button)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const media = button.closest("[data-image-slider-id]");
    slidePanelCardImage(media, button.dataset.imageSlide === "previous" ? -1 : 1);
    if (event.detail > 0) {
      button.blur();
    }
  });
  items.__stashImageSliderBound = true;
}

function slidePanelCardImage(media, direction) {
  const urls = panelMediaImageUrls(media);
  if (urls.length < 2) {
    return;
  }

  const currentIndex = Number(media.dataset.imageIndex) || 0;
  const nextIndex = (currentIndex + direction + urls.length) % urls.length;
  setPanelCardImageIndex(media, nextIndex, urls);
  commitPanelCardImage(media);
}

function setPanelCardImageIndex(media, index, urls = panelMediaImageUrls(media)) {
  const imageUrl = urls[index] || urls[0] || "";
  const image = media.querySelector(".wp-image-frame > img");
  if (!image || image.src === imageUrl) {
    return;
  }

  image.src = imageUrl;
  media.dataset.imageIndex = String(index);
  media.querySelectorAll(".wp-image-slider-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === index);
  });
}

function commitPanelCardImage(media) {
  const imageUrl = panelMediaImageUrls(media)[Number(media.dataset.imageIndex) || 0] || "";
  if (!imageUrl || imageUrl === media.dataset.imageInitialUrl) {
    return;
  }

  media.dataset.imageInitialUrl = imageUrl;
  safelyRunPanelAction(() => savePanelCardImageChoice(media.dataset.imageSliderId, imageUrl));
}

async function savePanelCardImageChoice(id, imageUrl) {
  let changed = false;
  const nextItems = panelState.items.map((item) => {
    const normalized = normalizePanelItem(item);
    if (normalized.id !== id || normalized.imageUrl === imageUrl) {
      return item;
    }

    changed = true;
    return {
      ...item,
      id: normalized.id,
      imageUrl,
      imageUrls: normalizeProductImageUrls(normalized.imageUrls, imageUrl, SAVED_IMAGE_URL_LIMIT),
      updatedAt: new Date().toISOString()
    };
  });

  if (!changed) {
    return;
  }

  panelState.items = nextItems;
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
}

function deletePanelCardImage(media) {
  const urls = panelMediaImageUrls(media);
  if (!media?.dataset.imageSliderId || urls.length < 2) {
    return;
  }

  const currentIndex = clamp(Number(media.dataset.imageIndex) || 0, 0, urls.length - 1);
  const imageUrl = urls[currentIndex] || urls[0] || "";
  const remaining = urls.filter((_, index) => index !== currentIndex);
  const nextImageUrl = remaining[Math.min(currentIndex, remaining.length - 1)] || remaining[0] || "";
  const root = media.getRootNode?.();
  safelyRunPanelAction(() =>
    removePanelCardImage(media.dataset.imageSliderId, imageUrl, nextImageUrl, root)
  );
}

async function removePanelCardImage(id, imageUrl, nextImageUrl, root) {
  const removedKey = normalizeUrl(imageUrl);
  const nextKey = normalizeUrl(nextImageUrl);
  let changed = false;
  const nextItems = panelState.items.map((item) => {
    const normalized = normalizePanelItem(item);
    if (normalized.id !== id) {
      return item;
    }

    const remaining = normalized.imageUrls.filter((url) => normalizeUrl(url) !== removedKey);
    if (!remaining.length || remaining.length === normalized.imageUrls.length) {
      return item;
    }

    const primary = remaining.find((url) => normalizeUrl(url) === nextKey) || remaining[0];
    changed = true;
    return {
      ...item,
      id: normalized.id,
      imageUrl: primary,
      imageUrls: normalizeProductImageUrls(remaining, primary, SAVED_IMAGE_URL_LIMIT),
      updatedAt: new Date().toISOString()
    };
  });

  if (!changed) {
    return;
  }

  panelState.items = nextItems;
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
  renderPanelItemsOnly(root?.querySelector ? root : document.getElementById("stash-panel-root")?.shadowRoot);
}

function panelMediaImageUrls(media) {
  return Array.from(media.querySelectorAll("[data-image-url]"))
    .map((dot) => dot.dataset.imageUrl)
    .filter(Boolean);
}
