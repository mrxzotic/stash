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

function renderPanelCardMedia(item) {
  const imageUrls = panelCardImageUrls(item);
  const itemLabel = panelItemAccessibleName(item);

  return `
    <div class="wp-media" ${panelImageSliderAttributes(item)}>
      <a class="wp-media-link" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer" aria-label="${escapeAttribute(t("Open {item}", { item: itemLabel }))}">
        ${renderPanelCardImageFrame(item, { slider: false })}
      </a>
      ${imageUrls.length > 1 ? renderPanelImageSliderControls(imageUrls, item) : ""}
      ${renderPanelCardActions(item)}
    </div>
  `;
}

function renderPanelCardImageFrame(item, options = {}) {
  const urls = panelCardImageUrls(item);
  const imageUrl = urls[0] || "";
  const alt = options.alt ?? panelProductImageAlt(item);
  const frame = imageUrl
    ? `<span class="wp-image-frame is-wide"><img src="${escapeAttribute(imageUrl)}" alt="${escapeAttribute(alt)}" referrerpolicy="no-referrer"></span>`
    : renderMissingProductImage("wp");
  const slider = options.slider === false || urls.length < 2
    ? ""
    : renderPanelImageSliderControls(urls, item);

  return `${frame}${slider}`;
}

function renderMissingProductImage(namespace = "wp") {
  const className = namespace === "wl" ? "wl-image-missing" : "wp-image-missing";
  const textClass = namespace === "wl" ? "wl-image-missing-text" : "wp-image-missing-text";
  const iconClass = namespace === "wl" ? "wl-image-missing-icon" : "wp-image-missing-icon";
  return `
    <span class="${className}" role="img" aria-label="${escapeAttribute(t("Oops, image missing"))}">
      ${phosphorImageOffIcon(iconClass)}
      <span class="${textClass}">${escapeHtml(t("Oops, image missing"))}</span>
    </span>
  `;
}

function renderPanelImageSliderControls(urls, item = null) {
  const label = item ? t(" for {item}", { item: panelItemAccessibleName(item) }) : "";
  return `
    <button class="wp-image-slider-button is-prev" type="button" aria-label="${escapeAttribute(t("Previous image{label}", { label }))}" data-image-slide="previous">
      ${phosphorChevronLeftIcon("wp-image-slider-icon")}
    </button>
    <button class="wp-image-slider-button is-next" type="button" aria-label="${escapeAttribute(t("Next image{label}", { label }))}" data-image-slide="next">
      ${phosphorChevronRightIcon("wp-image-slider-icon")}
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
  const label = item ? t(" from {item}", { item: panelItemAccessibleName(item) }) : "";
  return `
    <button class="wp-image-delete-button" type="button" aria-label="${escapeAttribute(t("Remove current image{label}", { label }))}" title="${escapeAttribute(t("Remove image"))}" data-image-delete>
      ${phosphorImageOffIcon("wp-image-delete-icon")}
    </button>
  `;
}

function bindPanelImageSliderEvents(root) {
  const items = root.querySelector(".wp-items");
  if (!items || items.__tuckioImageSliderBound) {
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
  items.__tuckioImageSliderBound = true;
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
  if (!media || !urls.length) {
    return;
  }

  const nextIndex = clamp(index, 0, urls.length - 1);
  const imageUrl = urls[nextIndex] || urls[0] || "";
  const image = media.querySelector(".wp-image-frame > img");
  if (!image || !imageUrl) {
    return;
  }

  if (image.getAttribute("src") !== imageUrl) {
    image.setAttribute("src", imageUrl);
  }
  media.dataset.imageIndex = String(nextIndex);
  media.querySelectorAll(".wp-image-slider-dot").forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === nextIndex);
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
  safelyRunPanelAction(() =>
    removePanelCardImage(media.dataset.imageSliderId, imageUrl, currentIndex, media)
  );
}

async function removePanelCardImage(id, imageUrl, removedIndex, media) {
  const removedKey = normalizeUrl(imageUrl);
  let changed = false;
  let updatedItem = null;
  let nextImageIndex = 0;
  const nextItems = panelState.items.map((item) => {
    const normalized = normalizePanelItem(item);
    if (normalized.id !== id) {
      return item;
    }

    const remaining = normalized.imageUrls.filter((url) => normalizeUrl(url) !== removedKey);
    if (!remaining.length || remaining.length === normalized.imageUrls.length) {
      return item;
    }

    const primary = remaining[0];
    nextImageIndex = clamp(removedIndex, 0, remaining.length - 1);
    changed = true;
    updatedItem = {
      ...item,
      id: normalized.id,
      imageUrl: primary,
      imageUrls: normalizeProductImageUrls(remaining, primary, SAVED_IMAGE_URL_LIMIT),
      updatedAt: new Date().toISOString()
    };
    return updatedItem;
  });

  if (!changed) {
    return;
  }

  panelState.items = nextItems;
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
  replacePanelCardImageMedia(media, updatedItem, nextImageIndex);
}

function replacePanelCardImageMedia(media, item, imageIndex = 0) {
  const template = document.createElement("template");
  template.innerHTML = renderPanelCardMedia(item).trim();
  const nextMedia = template.content.firstElementChild;
  if (!nextMedia || !media?.isConnected) {
    return;
  }

  const shouldRestoreHover = Boolean(media.matches?.(":hover") || media.closest?.(".wp-item")?.matches?.(":hover"));
  media.replaceWith(nextMedia);
  const urls = panelMediaImageUrls(nextMedia);
  const nextIndex = urls.length ? clamp(imageIndex, 0, urls.length - 1) : 0;
  if (urls.length > 1) {
    setPanelCardImageIndex(nextMedia, nextIndex, urls);
    nextMedia.dataset.imageInitialUrl = urls[nextIndex] || urls[0] || "";
  }
  restorePanelMediaHover(nextMedia, shouldRestoreHover);
  bindImageFallbacks(nextMedia);
}

function restorePanelMediaHover(media, shouldRestore = false) {
  const item = media?.closest?.(".wp-item");
  if (!media || (!shouldRestore && !item?.matches?.(":hover"))) {
    return;
  }

  media.classList.add("is-hover-restored");
  const clearHover = () => {
    media.classList.remove("is-hover-restored");
    media.removeEventListener("pointerleave", clearHover);
  };
  media.addEventListener("pointerleave", clearHover);
}

function panelMediaImageUrls(media) {
  return Array.from(media?.querySelectorAll("[data-image-url]") || [])
    .map((dot) => dot.dataset.imageUrl)
    .filter(Boolean);
}
