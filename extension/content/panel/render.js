function renderStashPanel(options = {}) {
  const root = getPanelRoot();
  const displayItems = panelState.items.map(normalizePanelItem);
  const visibleItems = displayItems
    .filter(
      (item) =>
        panelState.activeCategory === "all" ||
        item.category === panelState.activeCategory
    )
    .filter(panelItemMatchesSearch);
  const filterCategories = [
    { id: "all", label: "All" },
    ...panelState.categories
  ];

  root.innerHTML = `
    <style>${panelStyles()}</style>
    <section class="wp-shell wp-theme-${escapeAttribute(panelState.backgroundTheme)}${panelState.hasRenderedPanel ? " is-static" : ""}" role="dialog" aria-label="Stash">
      ${renderPanelTopbarHtml(displayItems)}

      <section class="wp-settings wp-popover" ${panelState.settingsOpen ? "" : "hidden"}>
        <div class="wp-settings-head">
          <h2>Settings</h2>
          ${renderSettingsPromo()}
        </div>
        <section class="wp-settings-section" aria-label="Background settings">
          <div class="wp-settings-section-title">Background</div>
          ${renderSettingsBackgroundGrid()}
        </section>
      </section>

      <nav class="wp-filters" aria-label="Stash categories">
        ${renderCategoryFilters(filterCategories)}
      </nav>
      ${panelState.categoryComposerOpen ? renderCategoryComposer() : ""}
      ${panelState.deleteCategoryId ? renderDeleteCategoryDialog() : ""}

      <section class="wp-items" aria-live="polite">
        ${renderPanelItemsHtml(visibleItems)}
      </section>
    </section>
  `;

  bindPanelEvents(root);
  focusPanelSearch(root);
  focusCategoryComposer(root);
  animatePanelSummaryAfterRender(root, displayItems, options.summaryAnimationFrom);
  refreshPanelSummaryRate();
  panelState.hasRenderedPanel = true;
}

function animatePanelSummaryAfterRender(root, displayItems, previousValue) {
  if (!previousValue) {
    return;
  }

  const total = root.querySelector("[data-total-value]");
  if (!total) {
    return;
  }

  const nextValue = formatPanelSummaryTotal(displayItems, panelState.summaryCurrency);
  total.textContent = previousValue;
  setPanelTotalText(total, nextValue, { animate: true });
}

function renderPanelTopbarHtml(displayItems) {
  return `
    <header class="wp-topbar${panelState.searchOpen ? " is-searching" : ""}">
      ${panelState.searchOpen ? renderPanelSearchHtml() : renderPanelSummaryHtml(displayItems)}
    </header>
  `;
}

function renderSettingsBackgroundGrid() {
  return `
    <div class="wp-background-grid" role="radiogroup" aria-label="Background">
      ${backgroundThemeOptions().map((theme) => {
        const isSelected = theme.id === panelState.backgroundTheme;
        return `
          <button class="wp-background-choice${isSelected ? " is-selected" : ""}" type="button" role="radio" aria-checked="${isSelected}" data-background-theme="${escapeAttribute(theme.id)}">
            <span class="wp-background-swatch wp-background-swatch-${escapeAttribute(theme.id)}" aria-hidden="true">
              <span class="wp-background-check">${isSelected ? lucideCheckIcon("wp-background-check-icon") : ""}</span>
            </span>
            <span>${escapeHtml(theme.label)}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderCategoryFilters(filterCategories) {
  return `
    ${filterCategories.map((category) => {
      const isAll = category.id === "all";
      const isActive = category.id === panelState.activeCategory;
      return `
        <span class="wp-filter-shell${isActive ? " is-active" : ""}${isAll ? " is-all" : ""}">
          <button class="wp-filter${isActive ? " is-active" : ""}" data-category="${escapeAttribute(category.id)}" type="button">
            ${escapeHtml(category.label)}
          </button>
          ${isAll ? "" : `
            <button class="wp-filter-remove" type="button" aria-label="Remove ${escapeAttribute(category.label)}" data-remove-category-prompt="${escapeAttribute(category.id)}">
              ${lucideXIcon("wp-filter-remove-icon")}
            </button>
          `}
        </span>
      `;
    }).join("")}
    <button class="wp-filter wp-filter-add${panelState.categoryComposerOpen ? " is-active" : ""}" type="button" aria-label="Add category" data-add-category>
      ${lucidePlusIcon("wp-filter-add-icon")}
    </button>
  `;
}

function renderCategoryComposer() {
  return `
    <form class="wp-category-composer wp-popover" data-category-form>
      <input data-category-input type="text" placeholder="New category" maxlength="28" autocomplete="off" aria-label="New category">
      <button class="wp-category-submit" type="submit">Add</button>
      <button class="wp-category-cancel" type="button" aria-label="Cancel category" data-cancel-category>${lucideXIcon("wp-category-cancel-icon")}</button>
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
    <section class="wp-confirm-dialog" role="dialog" aria-modal="true" aria-label="Delete category">
      <h3>Delete ${escapeHtml(category.label)}?</h3>
      <p>Items stay saved and move back to All.</p>
      <div class="wp-confirm-actions">
        <button class="wp-confirm-cancel" type="button" data-cancel-delete-category>Cancel</button>
        <button class="wp-confirm-delete" type="button" data-confirm-delete-category="${escapeAttribute(category.id)}">Delete</button>
      </div>
    </section>
  `;
}

function renderPanelSearchHtml() {
  const hasQuery = Boolean(panelState.searchQuery);

  return `
    <div class="wp-inline-search" role="search">
      ${lucideSearchIcon("wp-inline-search-icon")}
      <label class="wp-inline-search-label" for="wp-panel-search-input">Search</label>
      <input id="wp-panel-search-input" data-search type="text" inputmode="search" placeholder="Search saved" autocomplete="off" value="${escapeAttribute(panelState.searchQuery)}">
      <button class="wp-clear-search${hasQuery ? " is-visible" : ""}" type="button" aria-label="Clear search" data-clear-search ${hasQuery ? "" : "disabled"}>
        ${lucideXIcon("wp-clear-search-icon")}
      </button>
    </div>
  `;
}

function renderPanelSummaryHtml(displayItems) {
  return `
    <span class="wp-summary">
      <span class="wp-count">${panelState.items.length} ${panelState.items.length === 1 ? "item" : "items"}</span>
    </span>
    <div class="wp-actions">
      <div class="wp-currency-select" data-currency-root>
        <button class="wp-total" type="button" aria-label="Choose summary currency" aria-haspopup="menu" aria-expanded="false" data-currency-trigger>
          <span class="wp-total-value" data-total-value>${escapeHtml(formatPanelSummaryTotal(displayItems, panelState.summaryCurrency))}</span>
          ${lucideChevronDownIcon("wp-total-chevron")}
        </button>
        ${renderCurrencyMenuHtml()}
      </div>
      <button class="wp-icon-button" type="button" aria-label="Search" aria-expanded="${panelState.searchOpen}" data-panel-search>
        ${lucideSearchIcon()}
      </button>
      <button class="wp-icon-button wp-settings-button${panelState.settingsOpen ? " is-active" : ""}" type="button" aria-label="Settings" aria-expanded="${panelState.settingsOpen}" data-panel-settings>
        ${lucideSettingsIcon()}
      </button>
    </div>
  `;
}

function renderCurrencyMenuHtml() {
  const currencies = summaryCurrencyPickerOptions(panelState.summaryCurrency);

  return `
    <div class="wp-currency-menu" role="menu" hidden data-currency-menu>
      ${currencies.map((currency) => {
        const isSelected = currency === panelState.summaryCurrency;
        return `
          <button class="wp-currency-option${isSelected ? " is-selected" : ""}" type="button" role="menuitemradio" aria-checked="${isSelected}" data-summary-currency="${escapeAttribute(currency)}">
            <span class="wp-currency-check">${isSelected ? lucideCheckIcon("wp-currency-check-icon") : ""}</span>
            <span>${escapeHtml(currency)}</span>
            <span class="wp-currency-symbol">${escapeHtml(currencySymbol(currency))}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderSettingsSelect({ label, ariaLabel, value, options, dataAttribute }) {
  const currentOption =
    options.find((option) => option.value === value) ||
    options[0] ||
    { value, label: value };

  return `
    <div class="wp-settings-row">
      <span>${escapeHtml(label)}</span>
      <div class="wp-select" data-select-root>
        <button class="wp-select-trigger" type="button" aria-label="${escapeAttribute(ariaLabel)}" aria-haspopup="menu" aria-expanded="false" data-select-trigger>
          <span class="wp-select-value">
            <span>${escapeHtml(currentOption.label)}</span>
            ${currentOption.meta ? `<span class="wp-select-symbol">${escapeHtml(currentOption.meta)}</span>` : ""}
          </span>
          ${lucideChevronDownIcon("wp-select-chevron")}
        </button>
        <div class="wp-select-menu" role="menu" hidden>
          ${options.map((option) => {
            const isSelected = option.value === value;
            return `
              <button class="wp-select-option${isSelected ? " is-selected" : ""}" type="button" role="menuitemradio" aria-checked="${isSelected}" ${dataAttribute}="${escapeAttribute(option.value)}">
                <span class="wp-select-check-slot">${isSelected ? lucideCheckIcon("wp-select-check") : ""}</span>
                <span>${escapeHtml(option.label)}</span>
                ${option.meta ? `<span class="wp-select-symbol">${escapeHtml(option.meta)}</span>` : ""}
              </button>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderPanelItem(item) {
  const brand = formatBrandName(item.brand || item.source || sourceNameFromUrl(item.url));
  const priceHtml = renderSitePriceHtml(item, "wp");
  const faviconNode = item.faviconUrl
    ? `<img class="wp-source-favicon" src="${escapeAttribute(item.faviconUrl)}" alt="">`
    : "";

  return `
    <article class="wp-item${item.id === panelState.highlightedItemId ? " is-new" : ""}">
      <a class="wp-media" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">
        ${item.imageUrl ? `<img src="${escapeAttribute(item.imageUrl)}" alt="">` : lucideImageIcon("wp-image-placeholder")}
        <button class="wp-remove" type="button" title="Remove" aria-label="Remove" data-remove-id="${escapeAttribute(item.id)}"></button>
      </a>
      <div class="wp-item-copy">
        <div class="wp-brand-row">
          <a class="wp-brand" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(brand)}</a>
          <a class="wp-source-icon" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer" title="${escapeAttribute(item.sourceDomain)}">
            <span class="wp-source-fallback">${escapeHtml(item.sourceDomain.charAt(0).toUpperCase())}</span>
            ${faviconNode}
          </a>
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

  const visibleItems = panelState.items
    .map(normalizePanelItem)
    .filter(
      (item) =>
        panelState.activeCategory === "all" ||
        item.category === panelState.activeCategory
    )
    .filter(panelItemMatchesSearch);
  list.innerHTML = renderPanelItemsHtml(visibleItems);
  bindImageFallbacks(root);
}

function renderPanelItemsHtml(items) {
  if (!items.length) {
    return renderPanelEmpty();
  }

  const columns = [[], []];
  items.forEach((item, index) => {
    columns[index % columns.length].push(renderPanelItem(item));
  });

  return columns.map(
    (columnItems) => `<div class="wp-item-column">${columnItems.join("")}</div>`
  ).join("");
}

function bindImageFallbacks(root) {
  root.querySelectorAll(".wp-media img, .wl-image img").forEach((image) => {
    syncProductImageRatio(image);
    if (image.__stashImageFallbackBound) {
      return;
    }
    image.addEventListener("load", () => syncProductImageRatio(image));
    image.addEventListener("error", () => {
      const placeholderClass = image.closest(".wl-image")
        ? "wl-image-placeholder"
        : "wp-image-placeholder";
      image.replaceWith(svgElementFromHtml(lucideImageIcon(placeholderClass)));
    });
    image.__stashImageFallbackBound = true;
  });

  root.querySelectorAll(".wp-source-favicon").forEach((image) => {
    if (image.__stashImageFallbackBound) {
      return;
    }
    image.addEventListener("error", () => image.remove());
    image.__stashImageFallbackBound = true;
  });
}

function syncProductImageRatio(image) {
  const media = image.closest(".wp-media");
  if (!media || !image.naturalWidth || !image.naturalHeight) {
    return;
  }

  const ratio = clamp(image.naturalWidth / image.naturalHeight, 0.62, 1.7);
  media.style.setProperty("--wp-media-ratio", ratio.toFixed(4));
}

function svgElementFromHtml(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild || document.createElement("span");
}

function renderPanelEmpty() {
  const hasQuery = Boolean(panelState.searchQuery);
  const isEmptyLibrary = !panelState.items.length && !hasQuery;

  return `
    <div class="wp-empty">
      <div>
        ${isEmptyLibrary ? contourTshirtIcon() : ""}
        <strong>${hasQuery ? "No matches" : "Start saving to see your items"}</strong>
        <span>${hasQuery ? "Try another name, category, or source." : "You have 0 items now."}</span>
      </div>
    </div>
  `;
}
