function renderSettingsViewOptions() {
  return `
    <label class="wp-settings-row wp-checkbox-row">
      <span>
        <span>Compact view</span>
        <small>Dense rows for scanning brand, name, and price.</small>
      </span>
      <input type="checkbox" data-compact-view ${panelState.compactView ? "checked" : ""}>
    </label>
  `;
}

function syncPanelViewMode(root = document.getElementById("stash-panel-root")?.shadowRoot) {
  if (!root) {
    return;
  }

  root.querySelector(".wp-shell")?.classList.toggle("is-compact-view", panelState.compactView);
  const items = root.querySelector(".wp-items");
  if (!items) {
    return;
  }

  items.classList.toggle("is-compact", panelState.compactView);
  items.classList.toggle("is-brand-cloud", panelState.brandCloudOpen && !panelState.brandFilterKey);
  if (panelState.brandCloudOpen && !panelState.brandFilterKey) {
    return;
  }

  renderPanelItemsOnly(root);
}

function renderPanelCompactItem(item, index = 0) {
  const brand = formatBrandName(item.brand || item.source || sourceNameFromUrl(item.url));
  const priceHtml = renderSitePriceHtml(item, "wp");

  return `
    <article class="wp-item wp-compact-item${item.id === panelState.highlightedItemId ? " is-new" : ""}">
      <span class="wp-compact-index" aria-hidden="true">${index + 1}</span>
      <a class="wp-compact-thumb" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">
        ${item.imageUrl ? `<span class="wp-image-frame is-wide"><img src="${escapeAttribute(item.imageUrl)}" alt=""></span>` : lucideImageIcon("wp-image-placeholder")}
      </a>
      <div class="wp-compact-copy">
        <a class="wp-brand" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(brand)}</a>
        <a class="wp-item-title" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
      </div>
      ${priceHtml ? `<div class="wp-price-row wp-compact-price">${priceHtml}</div>` : ""}
      <button class="wp-remove" type="button" title="Remove" aria-label="Remove" data-remove-id="${escapeAttribute(item.id)}"></button>
    </article>
  `;
}

function renderPanelSummaryLead() {
  if (!panelState.brandFilterKey) {
    const itemCount = `${panelState.items.length} ${panelState.items.length === 1 ? "item" : "items"}`;
    const label = panelState.brandCloudOpen ? "Brands" : itemCount;
    return `
      <button class="wp-count${panelState.brandCloudOpen ? " is-active" : ""}" type="button" aria-pressed="${panelState.brandCloudOpen}" aria-label="${panelState.brandCloudOpen ? "Brands view on. Show items" : `${itemCount} view on. Show brands`}" title="${panelState.brandCloudOpen ? "Show items" : "Show brands"}" data-brand-cloud-toggle>
        <span class="wp-count-label">${escapeHtml(label)}</span>
      </button>
    `;
  }

  const label = panelState.brandFilterLabel || "Brand";
  return `
    <span class="wp-summary-brand-filter">
      <span class="wp-summary-brand-pill is-active" aria-label="${escapeAttribute(`Brand filter active: ${label}`)}">
        <span class="wp-summary-brand-label">${escapeHtml(label)}</span>
        <button class="wp-summary-brand-clear" type="button" aria-label="Clear ${escapeAttribute(label)} brand filter" data-clear-brand-filter>
          ${lucideXIcon("wp-filter-remove-icon")}
        </button>
      </span>
    </span>
  `;
}

function renderPanelBrandCloud(items) {
  const brandNodes = panelBrandCloudItems(items).map((brand) => `
    <button class="wp-brand-cloud-item" type="button" style="--wp-brand-cloud-scale: ${brand.scale.toFixed(3)}" data-brand-filter-key="${escapeAttribute(brand.key)}" data-brand-filter-label="${escapeAttribute(brand.label)}">
      <span class="wp-brand-cloud-name">${escapeHtml(brand.label)}</span>
      <span class="wp-brand-cloud-count">${brand.count}</span>
    </button>
  `).join("");
  return `<div class="wp-brand-cloud" aria-label="Brands by saved item count">${brandNodes}</div>`;
}

function bindPanelBrandCloudEvents(root) {
  root.querySelector("[data-brand-cloud-toggle]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    panelState.brandCloudOpen = !panelState.brandCloudOpen;
    panelState.categoryComposerOpen = false;
    panelState.deleteCategoryId = "";
    panelState.deleteItemId = "";
    renderStashPanel();
  });

  root.querySelector("[data-clear-brand-filter]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    panelState.brandFilterKey = "";
    panelState.brandFilterLabel = "";
    panelState.brandCloudOpen = true;
    panelState.searchOpen = false;
    panelState.categoryComposerOpen = false;
    panelState.deleteCategoryId = "";
    panelState.deleteItemId = "";
    renderStashPanel();
  });

  root.querySelector(".wp-brand-cloud")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-brand-filter-key]");
    if (!button) {
      return;
    }
    event.preventDefault();
    panelState.brandFilterKey = button.dataset.brandFilterKey || "";
    panelState.brandFilterLabel = button.dataset.brandFilterLabel || "";
    panelState.brandCloudOpen = false;
    panelState.searchOpen = false;
    panelState.settingsOpen = false;
    panelState.categoryComposerOpen = false;
    panelState.deleteCategoryId = "";
    panelState.deleteItemId = "";
    renderStashPanel();
  });
}

function panelItemMatchesBrandFilter(item) {
  return !panelState.brandFilterKey || panelItemBrandKey(item) === panelState.brandFilterKey;
}

function panelBrandCloudItems(items) {
  const brands = new Map();
  items.forEach((item) => {
    const label = panelItemBrandLabel(item);
    const key = panelItemBrandKey(item);
    const current = brands.get(key) || { key, label, count: 0 };
    current.count += 1;
    brands.set(key, current);
  });
  const sorted = Array.from(brands.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 40);
  const maxRoot = Math.sqrt(sorted[0]?.count || 1);
  return sorted.map((brand) => ({
    ...brand, scale: maxRoot <= 1 ? 1 : 0.9 + (Math.sqrt(brand.count) / maxRoot) * 0.58
  }));
}

function panelItemBrandLabel(item) {
  return formatBrandName(item.brand || item.source || sourceNameFromUrl(item.url));
}

function panelItemBrandKey(item) {
  return panelItemBrandLabel(item).toLowerCase();
}
