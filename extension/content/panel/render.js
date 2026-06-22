function renderStashPanel(options = {}) {
  const root = getPanelRoot();
  const previousItemRects = panelState.hasRenderedPanel ? capturePanelItemLayout(root) : null;
  const rebuildMotionClass = panelState.hasRenderedPanel
    ? panelRebuildMotionClass(panelState.rebuildMotion)
    : "";
  const displayItems = panelState.items.map(normalizePanelItem);
  const summaryItems = panelSummaryItems(panelState.items);
  const visibleItems = panelSortedItems(panelVisibleItems(panelState.items));
  const filterCategories = [
    { id: "all", label: "All" },
    ...panelState.categories
  ];

  root.innerHTML = `
    <style>${panelStyles()}</style>
    <section class="wp-shell wp-theme-${escapeAttribute(panelState.backgroundTheme)}${panelState.compactView ? " is-compact-view" : ""}${panelState.hasRenderedPanel ? " is-static" : ""}${rebuildMotionClass}" role="dialog" aria-label="${escapeAttribute(t("Stashed"))}">
      ${renderPanelTopbarHtml(summaryItems)}
      ${renderFounderPromoDialog()}

      <nav class="wp-filters${panelState.activeCategory !== "all" || panelState.categoryComposerOpen || panelState.archivedOpen ? " is-expanded" : ""}" aria-label="${escapeAttribute(t("Stashed categories"))}">
        ${renderCategoryFilters(filterCategories, panelArchivedCount(displayItems))}
      </nav>
      ${panelState.categoryComposerOpen ? renderCategoryComposer() : ""}
      ${panelState.deleteCategoryId ? renderDeleteCategoryDialog() : ""}
      ${panelState.deleteItemId ? renderDeleteItemDialog() : ""}
      ${panelState.editItemId ? renderEditItemDialog() : ""}

      <section class="wp-items${panelState.compactView ? " is-compact" : ""}${panelState.archivedOpen ? " is-archive-view" : ""}${panelState.brandCloudOpen && !panelState.brandFilterKey && !panelState.archivedOpen ? " is-brand-cloud" : ""}" aria-live="polite">
        ${renderPanelItemsHtml(visibleItems)}
      </section>
    </section>
  `;

  bindPanelEvents(root);
  syncPanelFilterRail(root);
  syncPanelItemsTopOffset(root);
  syncPanelFocusAfterRender(root);
  animatePanelSummaryAfterRender(root, summaryItems, options.summaryAnimationFrom);
  refreshPanelSummaryRate();
  panelState.hasRenderedPanel = true;
  finishPanelRebuildMotion(root);
  animatePanelItemLayout(root, previousItemRects);
}

function animatePanelSummaryAfterRender(root, displayItems, previousValue) {
  if (!previousValue) {
    return;
  }

  const total = root.querySelector("[data-total-value]");
  if (!total) {
    return;
  }

  const nextValue = formatPanelSummaryTotal(panelTopbarValueItems(displayItems), panelState.summaryCurrency);
  total.textContent = previousValue;
  setPanelTotalText(total, nextValue, { animate: true });
}

function syncPanelItemsTopOffset(root, options = {}) {
  const shell = root.querySelector(".wp-shell");
  const filters = root.querySelector(".wp-filters");
  const items = root.querySelector(".wp-items");
  if (!shell || !filters || !items) {
    return;
  }

  const applyOffset = () => {
    const shellTop = shell.getBoundingClientRect().top;
    const filterBottom = panelVisibleFiltersBottom(filters);
    const baseTop = panelState.compactView
      ? 144
      : 136;
    const measuredTop = filterBottom - shellTop + 16;
    const nextTop = `${roundPanelGridOffset(Math.max(baseTop, measuredTop))}px`;
    if (items.style.getPropertyValue("--wp-items-padding-top") !== nextTop) {
      items.style.setProperty("--wp-items-padding-top", nextTop);
    }
  };

  if (options.defer === false) {
    applyOffset();
    return;
  }

  window.requestAnimationFrame(applyOffset);
}

function roundPanelGridOffset(value) {
  return Math.ceil(value / 8) * 8;
}

function panelVisibleFiltersBottom(filters) {
  const visibleBottoms = Array.from(filters.children)
    .map((child) => panelVisibleFilterChildBottom(filters, child))
    .filter((bottom) => Number.isFinite(bottom));
  return visibleBottoms.length ? Math.max(...visibleBottoms) : filters.getBoundingClientRect().bottom;
}
function panelVisibleFilterChildBottom(filters, child) {
  if (panelIsFloatingFilterControl(child)) {
    return NaN;
  }
  if (panelIsOptionalFilterControl(child) && !panelOptionalFilterControlIsVisible(filters, child)) {
    return NaN;
  }
  const rect = child.getBoundingClientRect?.();
  if (!rect || rect.width < 0.5 || rect.height < 0.5) {
    return NaN;
  }
  const style = window.getComputedStyle?.(child);
  if (style && (style.display === "none" || style.visibility === "hidden")) {
    return NaN;
  }
  return rect.bottom;
}

function panelIsFloatingFilterControl(child) {
  return child.matches?.(".wp-filter-menu") === true;
}

function panelIsOptionalFilterControl(child) {
  return child.matches?.(".wp-filter-add") === true;
}

function panelOptionalFilterControlIsVisible(filters, child) {
  return (
    filters.classList?.contains?.("is-controls-visible") || filters.matches?.(":focus-within") === true ||
    child.matches?.(":hover, :focus-within, .is-active") === true
  );
}

function renderPanelTopbarHtml(displayItems) {
  return `
    <header class="wp-topbar${panelState.searchOpen ? " is-searching" : ""}">
      ${panelState.searchOpen ? renderPanelSearchHtml() : renderPanelSummaryHtml(displayItems)}
    </header>
  `;
}

function renderCategoryComposer() {
  return `
    <form class="wp-category-composer wp-popover" data-category-form>
      <input data-category-input type="text" placeholder="${escapeAttribute(t("New category"))}" maxlength="28" autocomplete="off" aria-label="${escapeAttribute(t("New category"))}">
      <button class="wp-category-submit" type="submit">${escapeHtml(t("Add"))}</button>
      <button class="wp-category-cancel" type="button" aria-label="${escapeAttribute(t("Cancel category"))}" data-cancel-category>${phosphorXIcon("wp-category-cancel-icon")}</button>
    </form>
  `;
}

function renderDeleteCategoryDialog() {
  const category = panelState.categories.find((item) => item.id === panelState.deleteCategoryId);
  if (!category) {
    return "";
  }

  return `
    <div class="wp-dialog-backdrop" role="presentation" data-cancel-delete-category></div>
    <section class="wp-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="wp-delete-category-title" data-panel-modal>
      <h3 id="wp-delete-category-title">${escapeHtml(t("Delete {category}?", { category: panelCategoryDisplayLabel(category) }))}</h3>
      <p>${escapeHtml(t("Items stay saved and move back to All."))}</p>
      <div class="wp-confirm-actions">
        <button class="wp-confirm-cancel" type="button" data-autofocus data-cancel-delete-category>${escapeHtml(t("Cancel"))}</button>
        <button class="wp-confirm-delete" type="button" data-confirm-delete-category="${escapeAttribute(category.id)}">${escapeHtml(t("Delete"))}</button>
      </div>
    </section>
  `;
}

function renderDeleteItemDialog() {
  const item = panelState.items
    .map(normalizePanelItem)
    .find((savedItem) => savedItem.id === panelState.deleteItemId);
  if (!item) {
    return "";
  }

  return `
    <div class="wp-dialog-backdrop" role="presentation" data-cancel-delete-item></div>
    <section class="wp-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="wp-delete-item-title" data-panel-modal>
      <h3 id="wp-delete-item-title">${escapeHtml(t("Delete {item}?", { item: item.title }))}</h3>
      <p>${escapeHtml(t("This removes it from Stashed."))}</p>
      <div class="wp-confirm-actions">
        <button class="wp-confirm-cancel" type="button" data-autofocus data-cancel-delete-item>${escapeHtml(t("Cancel"))}</button>
        <button class="wp-confirm-delete" type="button" data-confirm-delete-item="${escapeAttribute(item.id)}">${escapeHtml(t("Delete"))}</button>
      </div>
    </section>
  `;
}

function renderPanelSearchHtml() {
  const hasQuery = Boolean(panelState.searchQuery);
  const actionLabel = hasQuery ? t("Clear search") : t("Close search");

  return `
    <div class="wp-inline-search" role="search">
      ${phosphorSearchIcon("wp-inline-search-icon")}
      <label class="wp-inline-search-label" for="wp-panel-search-input">${escapeHtml(t("Search"))}</label>
      <input id="wp-panel-search-input" data-search type="text" inputmode="search" placeholder="${escapeAttribute(t("Search saved"))}" autocomplete="off" value="${escapeAttribute(panelState.searchQuery)}">
      <button class="wp-clear-search is-visible" type="button" aria-label="${escapeAttribute(actionLabel)}" title="${escapeAttribute(actionLabel)}" data-clear-search>
        ${phosphorXIcon("wp-clear-search-icon")}
      </button>
    </div>
  `;
}

function renderPanelSummaryHtml(displayItems) {
  const valueItems = panelTopbarValueItems(displayItems);
  return `
    <span class="wp-summary">
      ${renderPanelSaveCurrentTrigger()}
      <span class="wp-summary-capsule">
        ${renderPanelSummaryLead(displayItems)}
        <div class="wp-currency-select" data-currency-root>
          <button class="wp-total" type="button" aria-label="${escapeAttribute(t("Choose summary currency"))}" aria-haspopup="menu" aria-expanded="false" data-currency-trigger>
            <span class="wp-total-value" data-total-value>${escapeHtml(formatPanelSummaryTotal(valueItems, panelState.summaryCurrency))}</span>
            ${phosphorChevronDownIcon("wp-total-chevron")}
          </button>
          ${renderCurrencyMenuHtml()}
        </div>
      </span>
    </span>
    <div class="wp-actions">
      <button class="wp-icon-button wp-search-button" type="button" aria-label="${escapeAttribute(t("Search"))}" aria-expanded="${panelState.searchOpen}" data-panel-search>
        ${phosphorSearchIcon()}
      </button>
      ${renderPanelOverflowMenu()}
    </div>
  `;
}

function renderPanelOverflowMenu() {
  const isOpen = panelState.settingsOpen;
  return `
    <div class="wp-overflow${isOpen ? " is-open" : ""}" style="${escapeAttribute(PANEL_OVERFLOW_ROOT_INLINE_STYLE)}" data-panel-overflow-root>
      <button class="wp-icon-button wp-overflow-button${isOpen ? " is-active" : ""}" type="button" aria-label="${escapeAttribute(t("More options"))}" aria-haspopup="menu" aria-expanded="${isOpen}" data-panel-overflow-trigger>
        ${phosphorDotsThreeVerticalIcon("wp-overflow-button-icon")}
      </button>
      <div class="wp-overflow-menu" style="${escapeAttribute(panelOverflowMenuInlineStyle(isOpen))}" role="menu" ${isOpen ? "" : "hidden"} data-panel-overflow-menu>
        <button class="wp-overflow-option" style="${escapeAttribute(PANEL_OVERFLOW_OPTION_INLINE_STYLE)}" type="button" role="menuitemcheckbox" aria-checked="${panelState.backgroundTheme === GRAPHITE_BACKGROUND_THEME}" data-panel-theme-toggle>
          ${renderPanelThemeToggleContents()}
        </button>
        <button class="wp-overflow-option" style="${escapeAttribute(PANEL_OVERFLOW_OPTION_INLINE_STYLE)}" type="button" role="menuitemcheckbox" aria-checked="${panelState.compactView}" data-panel-compact-toggle>
          ${renderPanelCompactToggleContents()}
        </button>
        ${renderPanelLanguageSelect()}
        <div class="wp-overflow-divider" style="${escapeAttribute(PANEL_OVERFLOW_DIVIDER_INLINE_STYLE)}" role="separator" aria-hidden="true"></div>
        <button class="wp-overflow-option" style="${escapeAttribute(PANEL_OVERFLOW_OPTION_INLINE_STYLE)}" type="button" role="menuitem" data-founder-promo-trigger>
          ${phosphorInfoIcon("wp-overflow-option-icon")}
          <span>${escapeHtml(t("About"))}</span>
          ${phosphorChevronRightIcon("wp-overflow-chevron")}
        </button>
      </div>
    </div>
  `;
}

function panelOverflowMenuInlineStyle(isOpen = panelState.settingsOpen) {
  return `${PANEL_OVERFLOW_MENU_INLINE_STYLE}display:${isOpen ? "grid" : "none"};${panelState.backgroundTheme === GRAPHITE_BACKGROUND_THEME ? PANEL_OVERFLOW_GRAPHITE_MENU_INLINE_STYLE : ""}`;
}

function renderCurrencyMenuHtml() {
  const currencies = summaryCurrencyPickerOptions(panelState.summaryCurrency);

  return `
    <div class="wp-currency-menu" role="menu" hidden data-currency-menu>
      ${currencies.map((currency) => {
        const isSelected = currency === panelState.summaryCurrency;
        return `
          <button class="wp-currency-option${isSelected ? " is-selected" : ""}" type="button" role="menuitemradio" aria-checked="${isSelected}" data-summary-currency="${escapeAttribute(currency)}">
            <span class="wp-currency-check">${isSelected ? phosphorCheckIcon("wp-currency-check-icon") : ""}</span>
            <span>${escapeHtml(currency)}</span>
            <span class="wp-currency-symbol">${escapeHtml(currencySymbol(currency))}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderPanelItem(item) {
  const brand = formatBrandName(item.brand || item.source || sourceNameFromUrl(item.url));
  const priceHtml = renderSitePriceHtml(item, "wp");
  const isArchived = isPanelItemArchived(item);
  const itemLabel = panelItemAccessibleName(item);
  const imageUrls = panelCardImageUrls(item);
  const isNew = item.id === panelState.highlightedItemId;
  const isShiftedRight = item.id === panelState.displacedItemId;

  return `
    <article class="wp-item${isNew ? " is-new" : ""}${isShiftedRight ? " is-shifted-right" : ""}${isArchived ? " is-archived" : ""}" data-panel-item-id="${escapeAttribute(item.id)}" data-panel-motion-id="${escapeAttribute(item.id)}">
      ${isNew && !isArchived ? renderPanelNewItemSkeleton() : ""}
      <div class="wp-media" ${panelImageSliderAttributes(item)}>
        <a class="wp-media-link" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer" aria-label="${escapeAttribute(t("Open {item}", { item: itemLabel }))}">
          ${renderPanelCardImageFrame(item, { slider: false })}
        </a>
        ${imageUrls.length > 1 ? renderPanelImageSliderControls(imageUrls, item) : ""}
        ${isArchived
          ? `<button class="wp-restore" type="button" title="${escapeAttribute(panelItemActionLabel("Restore", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Restore", item))}" data-restore-id="${escapeAttribute(item.id)}">${phosphorUndoIcon("wp-card-action-icon")}</button>
             <button class="wp-remove" type="button" title="${escapeAttribute(panelItemActionLabel("Delete", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Delete", item))}" data-remove-id="${escapeAttribute(item.id)}">${phosphorXIcon("wp-card-action-icon")}</button>`
          : `<button class="wp-edit" type="button" title="${escapeAttribute(panelItemActionLabel("Edit", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Edit", item))}" data-edit-id="${escapeAttribute(item.id)}">${phosphorPencilIcon("wp-card-action-icon")}</button>
             <button class="wp-archive" type="button" title="${escapeAttribute(panelItemActionLabel("Archive", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Archive", item))}" data-archive-id="${escapeAttribute(item.id)}">${phosphorTrashIcon("wp-card-action-icon")}</button>`}
      </div>
      <div class="wp-item-copy">
        <div class="wp-brand-row">
          <a class="wp-brand" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(brand)}</a>
        </div>
        <div class="wp-title-row">
          <a class="wp-item-title" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
        </div>
        ${priceHtml ? `<div class="wp-price-row">${priceHtml}</div>` : ""}
      </div>
    </article>
  `;
}

function renderPanelItemsOnly(root) {
  const list = root.querySelector(".wp-items");
  if (!list) {
    return;
  }

  const previousItemRects = capturePanelItemLayout(root);
  const visibleItems = panelSortedItems(panelVisibleItems(panelState.items));
  list.innerHTML = renderPanelItemsHtml(visibleItems);
  bindImageFallbacks(root);
  syncPanelSortControls(root);
  animatePanelItemLayout(root, previousItemRects);
}

function renderPanelItemsHtml(items) {
  if (!items.length) {
    return renderPanelEmpty();
  }

  if (panelState.brandCloudOpen && !panelState.brandFilterKey && !panelState.archivedOpen) {
    return renderPanelBrandCloud(items);
  }

  if (panelState.compactView) {
    return `<div class="wp-compact-list">${items.map(renderPanelCompactItem).join("")}</div>`;
  }

  return renderPanelCardColumns(items);
}

function bindImageFallbacks(root) {
  root.querySelectorAll(".wp-image-frame > img, .wl-image img").forEach((image) => {
    syncProductImageRatio(image);
    if (image.__stashImageFallbackBound) {
      return;
    }
    image.addEventListener("load", () => syncProductImageRatio(image));
    image.addEventListener("error", () => {
      const placeholderClass = image.closest(".wl-image")
        ? "wl-image-placeholder"
        : "wp-image-placeholder";
      const frame = image.closest(".wp-image-frame");
      if (frame) {
        frame.replaceWith(elementFromHtml(renderMissingProductImage("wp")));
        return;
      }
      image.replaceWith(elementFromHtml(renderMissingProductImage(placeholderClass.startsWith("wl") ? "wl" : "wp")));
    });
    image.__stashImageFallbackBound = true;
  });

}

function syncProductImageRatio(image) {
  const media = image.closest(".wp-media");
  if (!image.naturalWidth || !image.naturalHeight) {
    return;
  }

  const imageRatio = image.naturalWidth / image.naturalHeight;
  const mediaRatio = clamp(imageRatio, 0.62, 1.7);
  const frame = image.closest(".wp-image-frame");
  if (media) {
    media.style.setProperty("--wp-media-ratio", mediaRatio.toFixed(4));
  }
  if (frame) {
    frame.style.setProperty("--wp-image-ratio", imageRatio.toFixed(4));
    frame.classList.toggle("is-wide", imageRatio >= mediaRatio);
    frame.classList.toggle("is-tall", imageRatio < mediaRatio);
  }
}

function elementFromHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild || document.createElement("span");
}
