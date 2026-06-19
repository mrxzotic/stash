function renderStashPanel() {
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
  const summaryCurrencies = summaryCurrencyOptions();
  const backgroundThemes = backgroundThemeOptions();

  root.innerHTML = `
    <style>${panelStyles()}</style>
    <section class="wp-shell wp-theme-${escapeAttribute(panelState.backgroundTheme)}${panelState.hasRenderedPanel ? " is-static" : ""}" role="dialog" aria-label="Stash">
      <header class="wp-topbar${panelState.searchOpen ? " is-searching" : ""}">
        ${panelState.searchOpen ? `
          <label class="wp-inline-search">
            ${lucideSearchIcon("wp-inline-search-icon")}
            <span>Search</span>
            <input data-search type="text" inputmode="search" placeholder="Search saved" autocomplete="off" value="${escapeAttribute(panelState.searchQuery)}">
          </label>
        ` : `
          <span class="wp-summary">
            <span class="wp-count">${panelState.items.length} ${panelState.items.length === 1 ? "item" : "items"}</span>
          </span>
          <div class="wp-actions">
            <span class="wp-total" aria-label="Stash total">${escapeHtml(formatPanelSummaryTotal(displayItems, panelState.summaryCurrency))}</span>
            <button class="wp-icon-button" type="button" aria-label="Search" aria-expanded="${panelState.searchOpen}" data-panel-search>
              ${lucideSearchIcon()}
            </button>
            <button class="wp-icon-button wp-settings-button${panelState.settingsOpen ? " is-active" : ""}" type="button" aria-label="Settings" aria-expanded="${panelState.settingsOpen}" data-panel-settings>
              ${lucideSettingsIcon()}
            </button>
          </div>
        `}
      </header>

      <section class="wp-settings wp-popover" ${panelState.settingsOpen ? "" : "hidden"}>
        <div class="wp-settings-head">
          <h2>Settings</h2>
        </div>
        <section class="wp-settings-section" aria-label="General settings">
          <div class="wp-settings-section-title">General</div>
          ${renderSettingsSelect({
            label: "Currency",
            ariaLabel: "Summary currency",
            value: panelState.summaryCurrency,
            options: summaryCurrencies.map((currency) => ({
              value: currency,
              label: currency,
              meta: currencySymbol(currency)
            })),
            dataAttribute: "data-summary-currency"
          })}
          ${renderSettingsSelect({
            label: "Background",
            ariaLabel: "Background theme",
            value: panelState.backgroundTheme,
            options: backgroundThemes.map((theme) => ({ value: theme.id, label: theme.label })),
            dataAttribute: "data-background-theme"
          })}
        </section>

        <section class="wp-settings-section" aria-label="Categories">
          <div class="wp-settings-section-head">
            <span>Categories</span>
            <button class="wp-text-button" type="button" data-reset-categories>Reset</button>
          </div>
          <div class="wp-category-list">
            ${panelState.categories.map(
              (category) => `
                <div class="wp-category-row">
                  <input data-category-label="${escapeAttribute(category.id)}" value="${escapeAttribute(category.label)}" maxlength="28" aria-label="Category name">
                  <button class="wp-icon-button wp-remove-category" type="button" aria-label="Remove ${escapeAttribute(category.label)}" data-remove-category="${escapeAttribute(category.id)}"></button>
                </div>
              `
            ).join("")}
          </div>
          <form class="wp-category-form" data-category-form>
            <input data-category-input type="text" placeholder="New category" maxlength="28" autocomplete="off">
            <button type="submit">Add</button>
          </form>
        </section>
      </section>

      <nav class="wp-filters" aria-label="Stash categories">
        ${filterCategories.map(
          (category) => `
            <button class="wp-filter${category.id === panelState.activeCategory ? " is-active" : ""}" data-category="${escapeAttribute(category.id)}" type="button">
              ${escapeHtml(category.label)}
            </button>
          `
        ).join("")}
      </nav>

      <section class="wp-items" aria-live="polite">
        ${renderPanelItemsHtml(visibleItems)}
      </section>
    </section>
  `;

  bindPanelEvents(root);
  focusPanelSearch(root);
  refreshPanelSummaryRate();
  panelState.hasRenderedPanel = true;
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

  return `
    <article class="wp-item${item.id === panelState.highlightedItemId ? " is-new" : ""}">
      <a class="wp-media" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">
        ${item.imageUrl ? `<img src="${escapeAttribute(item.imageUrl)}" alt="">` : lucideImageIcon("wp-image-placeholder")}
        <button class="wp-remove" type="button" title="Remove" aria-label="Remove" data-remove-id="${escapeAttribute(item.id)}"></button>
      </a>
      <div class="wp-item-copy">
        <div class="wp-brand-row">
          <a class="wp-brand" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(brand)}</a>
          <a class="wp-source-icon" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer" title="${escapeAttribute(item.sourceDomain)}" style="--wp-favicon-url: url('${escapeAttribute(cssUrl(item.faviconUrl))}')">
            <span class="wp-source-fallback">${escapeHtml(item.sourceDomain.charAt(0).toUpperCase())}</span>
            <span class="wp-source-favicon" aria-hidden="true"></span>
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
  return items.length ? items.map(renderPanelItem).join("") : renderPanelEmpty();
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
