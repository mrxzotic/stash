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
    <article class="wp-item wp-compact-item${item.id === panelState.highlightedItemId ? " is-new" : ""}${isArchived ? " is-archived" : ""}" data-panel-item-id="${escapeAttribute(item.id)}" data-panel-motion-id="${escapeAttribute(item.id)}">
      <span class="wp-compact-index" aria-label="${escapeAttribute(t("Item {number}", { number: index + 1 }))}">#${index + 1}</span>
      <a class="wp-compact-thumb ${compactThumbFocusClass(item)}" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer" aria-label="${escapeAttribute(t("Open {item}", { item: itemLabel }))}">
        ${renderPanelCardImageFrame(item, { slider: false })}
      </a>
      <div class="wp-compact-copy">
        <a class="wp-brand" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(brand)}</a>
        <a class="wp-item-title" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
      </div>
      <div class="wp-price-row wp-compact-price${priceHtml ? "" : " is-empty"}"${priceHtml ? "" : " aria-hidden=\"true\""}>${priceHtml}</div>
      <div class="wp-compact-actions">
        ${isArchived
          ? `<button class="wp-restore" type="button" title="${escapeAttribute(panelItemActionLabel("Restore", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Restore", item))}" data-restore-id="${escapeAttribute(item.id)}">${phosphorUndoIcon("wp-card-action-icon")}</button>
             <button class="wp-remove" type="button" title="${escapeAttribute(panelItemActionLabel("Delete", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Delete", item))}" data-remove-id="${escapeAttribute(item.id)}">${phosphorXIcon("wp-card-action-icon")}</button>`
          : `<button class="wp-edit" type="button" title="${escapeAttribute(panelItemActionLabel("Edit", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Edit", item))}" data-edit-id="${escapeAttribute(item.id)}">${phosphorPencilIcon("wp-card-action-icon")}</button>
             <button class="wp-archive" type="button" title="${escapeAttribute(panelItemActionLabel("Archive", item))}" aria-label="${escapeAttribute(panelItemActionLabel("Archive", item))}" data-archive-id="${escapeAttribute(item.id)}">${phosphorTrashIcon("wp-card-action-icon")}</button>`}
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
    compactButton.setAttribute("aria-checked", String(panelState.compactView));
    compactButton.setAttribute("aria-label", panelState.compactView ? t("List view on") : t("List view off"));
    compactButton.setAttribute("title", t("List view"));
    compactButton.innerHTML = renderPanelCompactToggleContents();
  }

  const themeButton = root.querySelector("[data-panel-theme-toggle]");
  if (themeButton) {
    const isGraphite = panelState.backgroundTheme === GRAPHITE_BACKGROUND_THEME;
    themeButton.classList.toggle("is-toggle-active", isGraphite);
    themeButton.setAttribute("aria-checked", String(isGraphite));
    themeButton.setAttribute("aria-label", isGraphite ? t("Dark mode on") : t("Dark mode off"));
    themeButton.setAttribute("title", t("Dark mode"));
    themeButton.innerHTML = renderPanelThemeToggleContents();
  }
}

function renderPanelThemeToggleContents() {
  const isGraphite = panelState.backgroundTheme === GRAPHITE_BACKGROUND_THEME;
  return `
    ${phosphorMoonIcon("wp-overflow-option-icon")}
    <span>${escapeHtml(t("Dark mode"))}</span>
    ${renderPanelOverflowSwitch(isGraphite)}
  `;
}

function renderPanelCompactToggleContents() {
  return `
    ${phosphorListIcon("wp-overflow-option-icon")}
    <span>${escapeHtml(t("List view"))}</span>
    ${renderPanelOverflowSwitch(panelState.compactView)}
  `;
}

function renderPanelOverflowSwitch(isActive) {
  const switchStyle = `${PANEL_OVERFLOW_SWITCH_INLINE_STYLE}${isActive ? PANEL_OVERFLOW_SWITCH_ON_INLINE_STYLE : ""}`;
  const knobStyle = `${PANEL_OVERFLOW_SWITCH_KNOB_INLINE_STYLE}${isActive ? PANEL_OVERFLOW_SWITCH_KNOB_ON_INLINE_STYLE : ""}`;
  return `<span class="wp-overflow-switch${isActive ? " is-on" : ""}" style="${escapeAttribute(switchStyle)}" aria-hidden="true"><span class="wp-overflow-switch-knob" style="${escapeAttribute(knobStyle)}"></span></span>`;
}

function renderPanelSummaryLead(displayItems = panelSummaryItems(panelState.items)) {
  return `
    <span class="wp-count" aria-label="${escapeAttribute(panelCountAriaLabel(displayItems))}">
      ${renderPanelCountContents(displayItems)}
    </span>
  `;
}

function renderPanelCountContents(displayItems = panelSummaryItems(panelState.items)) {
  const totalCount = displayItems.length;
  if (panelTopbarCountIsScoped()) {
    return `
      <span class="wp-count-figure">${panelTopbarVisibleItems().length}</span><span class="wp-count-label">&nbsp;${escapeHtml(t("of"))}&nbsp;</span>
      <span class="wp-count-figure">${totalCount}</span>
    `;
  }

  return `
    <span class="wp-count-figure">${totalCount}</span><span class="wp-count-label">&nbsp;${escapeHtml(panelItemNoun(totalCount))}</span>
  `;
}

function syncPanelBrandCountControl(root = document.getElementById("stash-panel-root")?.shadowRoot) {
  const count = root?.querySelector(".wp-count");
  if (!count) {
    return;
  }

  const displayItems = panelSummaryItems(panelState.items);
  count.innerHTML = renderPanelCountContents(displayItems);
  count.classList.remove("is-active");
  count.removeAttribute("aria-pressed");
  count.setAttribute("aria-label", panelCountAriaLabel(displayItems));
}

function panelCountAriaLabel(displayItems = panelSummaryItems(panelState.items)) {
  const label = panelTopbarCountLabel(displayItems);
  return panelTopbarCountIsScoped()
    ? t("Showing {label} items", { label })
    : t("{label} saved", { label });
}

function panelTopbarCountLabel(displayItems = panelSummaryItems(panelState.items)) {
  const totalCount = displayItems.length;
  if (!panelTopbarCountIsScoped()) {
    return panelItemCountLabel(totalCount);
  }

  return `${panelTopbarVisibleItems().length} of ${totalCount}`;
}

function panelTopbarValueItems(displayItems = panelSummaryItems(panelState.items)) {
  return panelTopbarCountIsScoped() ? panelTopbarVisibleItems() : displayItems;
}

function panelTopbarVisibleItems() {
  return panelVisibleItems(panelState.items);
}

function panelTopbarCountIsScoped() {
  return Boolean(panelState.searchQuery || panelState.activeCategory !== "all" || panelState.brandFilterKey);
}

function panelItemCountLabel(itemCount) {
  return `${itemCount} ${panelItemNoun(itemCount)}`;
}

function renderPanelBrandCloud(items) {
  const modeClass = panelState.brandCloudSortList ? " is-sort-list" : "";
  const brandNodes = panelBrandCloudItems(items).map((brand) => `
    <button class="wp-brand-cloud-item" type="button" style="--wp-brand-cloud-scale: ${brand.scale.toFixed(3)}" data-panel-motion-id="brand:${escapeAttribute(brand.key)}" data-brand-filter-key="${escapeAttribute(brand.key)}" data-brand-filter-label="${escapeAttribute(brand.label)}">
      <span class="wp-brand-cloud-name">${escapeHtml(brand.label)}</span>
      <span class="wp-brand-cloud-count">${brand.count}</span>
    </button>
  `).join("");
  return `<div class="wp-brand-cloud${modeClass}" aria-label="${escapeAttribute(t("Brands by saved item count"))}">${brandNodes}</div>`;
}

function bindPanelBrandCloudEvents(root) {
  bindPanelPreferenceEvents(root);
  root.querySelector("[data-brand-cloud-toggle]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const willOpen = !panelState.brandCloudOpen || Boolean(panelState.brandFilterKey);
    panelState.brandCloudOpen = willOpen;
    if (willOpen) {
      panelState.brandFilterKey = "";
      panelState.brandFilterLabel = "";
    }
    panelState.brandCloudSortList = false;
    panelState.archivedOpen = false;
    panelState.filterMenuOpen = false;
    panelState.sortMenuOpen = false;
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
    panelState.brandCloudSortList = false;
    panelState.searchOpen = false;
    panelState.filterMenuOpen = false;
    panelState.sortMenuOpen = false;
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
    panelState.brandCloudSortList = false;
    panelState.archivedOpen = false;
    panelState.searchOpen = false;
    panelState.settingsOpen = false;
    panelState.filterMenuOpen = false;
    panelState.sortMenuOpen = false;
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
    closePanelLanguageMenu(root);
    safelyRunPanelAction(async () => {
      await savePanelSettings(
        { compactView: !panelState.compactView },
        { rerender: false, syncViewMode: true, syncSummary: false }
      );
    });
  });

  root.querySelector("[data-panel-theme-toggle]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    closePanelLanguageMenu(root);
    safelyRunPanelAction(async () => {
      await savePanelSettings(
        { backgroundTheme: toggledGraphiteThemeId() },
        { rerender: false, syncSummary: false }
      );
    });
  });

  root.querySelector("[data-panel-language-trigger]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    togglePanelLanguageMenu(event.currentTarget);
  });

  root.querySelector("[data-panel-language-menu]")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-panel-language]");
    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const language = cleanText(button.dataset.panelLanguage).toLowerCase();
    if (!isPanelLanguage(language) || language === panelState.language) {
      closePanelLanguageMenu(root);
      return;
    }
    panelState.settingsOpen = false;
    safelyRunPanelAction(() => savePanelSettings({ language }));
  });
}

function togglePanelLanguageMenu(trigger) {
  const languageRoot = trigger.closest("[data-panel-language-root]");
  const menu = languageRoot?.querySelector("[data-panel-language-menu]");
  if (!languageRoot || !menu) {
    return;
  }

  const willOpen = menu.hidden;
  closePanelLanguageMenu(languageRoot.getRootNode());
  menu.hidden = !willOpen;
  languageRoot.classList.toggle("is-open", willOpen);
  trigger.setAttribute("aria-expanded", String(willOpen));
}

function closePanelLanguageMenu(scope = document.getElementById("stash-panel-root")?.shadowRoot) {
  scope?.querySelectorAll?.("[data-panel-language-root]").forEach((languageRoot) => {
    languageRoot.classList.remove("is-open");
    languageRoot.querySelector("[data-panel-language-menu]")?.setAttribute("hidden", "");
    languageRoot.querySelector("[data-panel-language-trigger]")?.setAttribute("aria-expanded", "false");
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
    const current = brands.get(key) || { key, label, count: 0, recentAt: 0, price: undefined };
    const itemPrice = panelSortPrice(item);
    current.count += 1;
    current.recentAt = Math.max(current.recentAt, panelCreatedTime(item));
    current.price = Number.isFinite(itemPrice)
      ? Math.min(current.price ?? itemPrice, itemPrice)
      : current.price;
    brands.set(key, current);
  });
  const sorted = panelSortedBrandCloudItems(Array.from(brands.values())).slice(0, 40);
  const maxCount = sorted[0]?.count || 1;
  const countRange = Math.max(1, maxCount - 1);
  return sorted.map((brand) => ({
    ...brand,
    scale: panelState.brandCloudSortList
      ? 1.3
      : maxCount <= 1 ? 1 : 1 + Math.pow((brand.count - 1) / countRange, 0.75) * 0.82
  }));
}

function panelSortedBrandCloudItems(brands) {
  if (!panelState.brandCloudSortList) {
    return brands.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }

  const direction = panelState.sortDirection === PANEL_SORT_ASC ? 1 : -1;
  if (panelState.sortField === PANEL_SORT_FIELD_NAME) {
    return brands.sort((a, b) =>
      direction * a.label.localeCompare(b.label) ||
      b.count - a.count ||
      b.recentAt - a.recentAt
    );
  }

  if (panelState.sortField === PANEL_SORT_FIELD_PRICE) {
    return brands.sort((a, b) =>
      direction * panelCompareBrandPriceEntries(a, b) ||
      a.label.localeCompare(b.label)
    );
  }

  return brands.sort((a, b) =>
    direction * (a.recentAt - b.recentAt) ||
    a.label.localeCompare(b.label)
  );
}

function panelCompareBrandPriceEntries(left, right) {
  if (Number.isFinite(left.price) && Number.isFinite(right.price) && left.price !== right.price) {
    return left.price - right.price;
  }

  if (Number.isFinite(left.price) !== Number.isFinite(right.price)) {
    return Number.isFinite(left.price) ? -1 : 1;
  }

  return 0;
}

function panelItemBrandLabel(item) {
  return formatBrandName(item.brand || item.source || sourceNameFromUrl(item.url));
}

function panelItemBrandKey(item) {
  return panelItemBrandLabel(item).toLowerCase();
}
