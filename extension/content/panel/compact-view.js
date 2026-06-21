function syncPanelViewMode(root = document.getElementById("stash-panel-root")?.shadowRoot) {
  if (!root) {
    return;
  }

  syncPanelTopbarPreferenceControls(root);
  root.querySelector(".wp-shell")?.classList.toggle("is-compact-view", panelState.compactView);
  const items = root.querySelector(".wp-items");
  if (!items) {
    return;
  }

  items.classList.toggle("is-compact", panelState.compactView);
  items.classList.toggle("is-brand-cloud", panelState.brandCloudOpen && !panelState.brandFilterKey && !panelState.archivedOpen);
  if (panelState.brandCloudOpen && !panelState.brandFilterKey && !panelState.archivedOpen) {
    return;
  }

  renderPanelItemsOnly(root);
}

function renderPanelCompactItem(item, index = 0) {
  const brand = formatBrandName(item.brand || item.source || sourceNameFromUrl(item.url));
  const priceHtml = renderSitePriceHtml(item, "wp");
  const isArchived = isPanelItemArchived(item);
  const itemLabel = panelItemAccessibleName(item);

  return `
    <article class="wp-item wp-compact-item${item.id === panelState.highlightedItemId ? " is-new" : ""}${isArchived ? " is-archived" : ""}">
      <span class="wp-compact-index" aria-label="Item ${index + 1}">#${index + 1}</span>
      <a class="wp-compact-thumb ${compactThumbFocusClass(item)}" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer" aria-label="${escapeAttribute(`Open ${itemLabel}`)}">
        ${renderPanelCardImageFrame(item, { slider: false })}
      </a>
      <div class="wp-compact-copy">
        <a class="wp-brand" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(brand)}</a>
        <a class="wp-item-title" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
      </div>
      ${priceHtml ? `<div class="wp-price-row wp-compact-price">${priceHtml}</div>` : ""}
      <div class="wp-compact-actions">
        ${isArchived
          ? `<button class="wp-restore" type="button" title="${escapeAttribute(panelItemActionLabel("Restore", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Restore", item))}" data-restore-id="${escapeAttribute(item.id)}">${lucideUndoIcon("wp-card-action-icon")}</button>
             <button class="wp-remove" type="button" title="${escapeAttribute(panelItemActionLabel("Delete", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Delete", item))}" data-remove-id="${escapeAttribute(item.id)}">${lucideXIcon("wp-card-action-icon")}</button>`
          : `<button class="wp-edit" type="button" title="${escapeAttribute(panelItemActionLabel("Edit", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Edit", item))}" data-edit-id="${escapeAttribute(item.id)}">${lucidePencilIcon("wp-card-action-icon")}</button>
             <button class="wp-archive" type="button" title="${escapeAttribute(panelItemActionLabel("Archive", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Archive", item))}" data-archive-id="${escapeAttribute(item.id)}">${lucideTrashIcon("wp-card-action-icon")}</button>`}
      </div>
    </article>
  `;
}

function compactThumbFocusClass(item) {
  const terms = [
    item.category,
    item.title,
    item.brand,
    item.source
  ].join(" ").toLowerCase();
  return /\b(shoe|shoes|sneaker|sneakers|trainer|trainers|boot|boots|loafer|loafers|sandal|sandals|flip flop|flip flops|bag|bags|bucket|tote)\b/.test(terms)
    ? "is-object-bottom"
    : "";
}

function toggledGraphiteThemeId() {
  return panelState.backgroundTheme === GRAPHITE_BACKGROUND_THEME
    ? DEFAULT_SETTINGS.backgroundTheme
    : GRAPHITE_BACKGROUND_THEME;
}

function syncPanelTopbarPreferenceControls(root = document.getElementById("stash-panel-root")?.shadowRoot) {
  if (!root) {
    return;
  }

  const compactButton = root.querySelector("[data-panel-compact-toggle]");
  if (compactButton) {
    compactButton.classList.toggle("is-toggle-active", panelState.compactView);
    compactButton.setAttribute("aria-pressed", String(panelState.compactView));
    compactButton.setAttribute("aria-label", panelState.compactView ? "Compact view on. Switch to cards" : "Card view on. Switch to compact");
    compactButton.setAttribute("title", panelState.compactView ? "Card view" : "Compact view");
    compactButton.innerHTML = panelState.compactView ? lucideGridIcon() : lucideListIcon();
  }

  const themeButton = root.querySelector("[data-panel-theme-toggle]");
  if (themeButton) {
    const isGraphite = panelState.backgroundTheme === GRAPHITE_BACKGROUND_THEME;
    themeButton.classList.toggle("is-toggle-active", isGraphite);
    themeButton.setAttribute("aria-pressed", String(isGraphite));
    themeButton.setAttribute("aria-label", isGraphite ? "Graphite mode on. Switch to light" : "Graphite mode off. Switch to graphite");
    themeButton.setAttribute("title", isGraphite ? "Light mode" : "Graphite mode");
    themeButton.innerHTML = isGraphite ? lucideSunIcon() : lucideMoonIcon();
  }
}

function renderPanelSummaryLead() {
  if (!panelState.brandFilterKey) {
    const itemCount = panelActiveItems(panelState.items).length;
    return `
      <button class="wp-count${panelState.brandCloudOpen ? " is-active" : ""}" type="button" aria-pressed="${panelState.brandCloudOpen}" aria-label="${panelCountAriaLabel(itemCount)}" title="${panelState.brandCloudOpen ? "Close brands" : "Show brands"}" data-brand-cloud-toggle>
        ${renderPanelCountContents(itemCount)}
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

function renderPanelCountContents(itemCount) {
  const label = panelState.brandCloudOpen ? "Brands" : panelItemCountLabel(itemCount);
  return `
    <span class="wp-count-label">${escapeHtml(label)}</span>
    ${panelState.brandCloudOpen ? lucideXIcon("wp-count-clear-icon") : ""}
  `;
}

function syncPanelBrandCountControl(root = document.getElementById("stash-panel-root")?.shadowRoot) {
  const count = root?.querySelector(".wp-count");
  if (!count) {
    return;
  }

  const itemCount = panelActiveItems(panelState.items).length;
  count.innerHTML = renderPanelCountContents(itemCount);
  count.classList.toggle("is-active", panelState.brandCloudOpen);
  count.setAttribute("aria-pressed", String(panelState.brandCloudOpen));
  count.setAttribute("aria-label", panelCountAriaLabel(itemCount));
  count.setAttribute("title", panelState.brandCloudOpen ? "Close brands" : "Show brands");
}

function panelCountAriaLabel(itemCount) {
  return panelState.brandCloudOpen
    ? "Brands view open. Close brands"
    : `${panelItemCountLabel(itemCount)} view. Show brands`;
}

function panelItemCountLabel(itemCount) {
  return `${itemCount} ${itemCount === 1 ? "item" : "items"}`;
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
  bindPanelPreferenceEvents(root);
  root.querySelector("[data-brand-cloud-toggle]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    panelState.brandCloudOpen = !panelState.brandCloudOpen;
    panelState.archivedOpen = false;
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
    panelState.brandCloudOpen = false;
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
    panelState.archivedOpen = false;
    panelState.searchOpen = false;
    panelState.settingsOpen = false;
    panelState.categoryComposerOpen = false;
    panelState.deleteCategoryId = "";
    panelState.deleteItemId = "";
    renderStashPanel();
  });
}

function bindPanelPreferenceEvents(root) {
  root.querySelector("[data-panel-compact-toggle]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    panelState.settingsOpen = false;
    safelyRunPanelAction(async () => {
      await savePanelSettings({ compactView: !panelState.compactView });
    });
  });

  root.querySelector("[data-panel-theme-toggle]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    panelState.settingsOpen = false;
    safelyRunPanelAction(async () => {
      await savePanelSettings({ backgroundTheme: toggledGraphiteThemeId() }, { rerender: false });
      syncPanelTopbarPreferenceControls(root);
    });
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
