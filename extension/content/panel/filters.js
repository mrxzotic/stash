function renderCategoryFilters(filterCategories, archivedCount = 0) {
  const [, ...categoryOptions] = filterCategories;
  const shortlistChip = renderShortlistFilterChip();
  const brandChip = renderBrandFilterChip();
  const filterMenuTrigger = renderFilterMenuTrigger(categoryOptions);
  const archivedChip = renderArchivedFilter(archivedCount);
  const viewControls = renderPanelViewControls();
  const railControls = `${shortlistChip}${brandChip}${filterMenuTrigger}${archivedChip}`;
  if (!railControls.trim() && !viewControls.trim()) {
    return "";
  }

  return `
    <div class="wp-filter-rail" data-filter-rail>
      ${shortlistChip}
      ${brandChip}
      ${filterMenuTrigger}
      ${archivedChip}
    </div>
    ${filterMenuTrigger ? renderFilterMenu(categoryOptions) : ""}
    ${viewControls}
  `;
}

function renderPanelFiltersNav(filterCategories, archivedCount = 0) {
  const content = renderCategoryFilters(filterCategories, archivedCount).trim();
  if (!content) {
    return "";
  }

  return `
    <nav class="${escapeAttribute(panelFiltersClassName())}" aria-label="${escapeAttribute(t("Tuckio categories"))}">
      ${content}
    </nav>
  `;
}

function panelFiltersClassName() {
  return `wp-filters${panelState.activeCategory !== "all" || panelState.categoryComposerOpen || panelState.archivedOpen ? " is-expanded" : ""}`;
}

function renderPanelViewControls() {
  if (!panelShouldShowViewControls()) {
    return "";
  }

  return `
    <div class="wp-view-controls" data-panel-view-controls>
      ${renderPanelViewToggle()}
      ${renderPanelSortControls()}
    </div>
  `;
}

function panelShouldShowViewControls(items = panelState.items) {
  return panelShouldShowViewToggle(items) || panelShouldShowSortControls(items);
}

function panelShouldShowViewToggle(items = panelState.items) {
  return panelVisibleItems(items).length > 0 && !panelBrandCloudViewIsActive();
}

function panelBrandCloudViewIsActive() {
  return panelState.brandCloudOpen && !panelState.brandFilterKey && !panelState.archivedOpen;
}

function renderPanelViewToggle() {
  if (!panelShouldShowViewToggle()) {
    return "";
  }

  const label = panelState.compactView ? t("Switch to card view") : t("Switch to list view");
  return `
    <button class="wp-view-toggle" type="button" aria-label="${escapeAttribute(label)}" data-panel-hint="${escapeAttribute(panelViewToggleHint())}" data-panel-view-toggle>
      ${renderPanelViewToggleIcon()}
    </button>
  `;
}

function panelViewToggleHint() {
  return panelState.compactView ? t("List view") : t("Card view");
}

function renderPanelViewToggleIcon() {
  return panelState.compactView
    ? phosphorGridIcon("wp-view-toggle-icon")
    : phosphorListIcon("wp-view-toggle-icon");
}

function renderShortlistFilterChip() {
  const count = panelShortlistCount();
  if (!count) {
    return "";
  }

  return `
    <button class="wp-filter wp-filter-shortlist${panelState.shortlistOpen ? " is-active" : ""}" type="button" aria-label="${escapeAttribute(t("Shortlisted items: {count}", { count }))}" aria-pressed="${panelState.shortlistOpen}" data-panel-hint="${escapeAttribute(panelShortlistChipHint())}" data-shortlist-toggle>
      ${phosphorStarIcon("wp-shortlist-chip-icon")}
      <span class="wp-shortlist-chip-count">${count}</span>
      ${panelState.shortlistOpen ? renderPanelChipClearIcon() : ""}
    </button>
  `;
}

function renderBrandFilterChip() {
  const brandCount = panelBrandFilterCount();
  const hasBrandFilter = Boolean(panelState.brandFilterKey);
  if (!brandCount && !hasBrandFilter) {
    return "";
  }

  const isActive = panelState.brandCloudOpen || hasBrandFilter;
  return `
    <button class="wp-brand-chip${isActive ? " is-active" : ""}${hasBrandFilter ? " is-filtered" : ""}" type="button" aria-label="${escapeAttribute(panelBrandChipAriaLabel(brandCount))}" aria-pressed="${isActive}" data-panel-hint="${escapeAttribute(panelBrandChipHint())}" data-brand-cloud-toggle>
      ${phosphorTagIcon("wp-brand-chip-icon")}
      ${hasBrandFilter
        ? `<span class="wp-brand-chip-label">${escapeHtml(panelBrandChipLabel())}</span>`
        : `<span class="wp-brand-chip-count">${brandCount}</span>`}
      ${isActive ? renderPanelChipClearIcon() : ""}
    </button>
  `;
}

function renderFilterMenuTrigger(categories) {
  if (!panelShouldShowCategoryFilterTrigger()) {
    return "";
  }

  const isOpen = panelState.filterMenuOpen;
  const hasActiveFilter = panelActiveFilterCount() > 0;
  return `
    <button class="wp-filter wp-filter-trigger${hasActiveFilter ? " is-active" : ""}" type="button" aria-label="${escapeAttribute(panelFilterTriggerAriaLabel(categories))}" aria-haspopup="menu" aria-expanded="${isOpen}" data-panel-hint="${escapeAttribute(panelFilterChipHint(categories))}" data-filter-menu-trigger>
      ${phosphorFunnelSimpleIcon("wp-filter-trigger-icon")}
      <span class="wp-filter-trigger-label">${escapeHtml(panelFilterTriggerLabel(categories))}</span>
      ${hasActiveFilter ? renderPanelChipClearIcon("data-filter-clear") : phosphorChevronDownIcon("wp-filter-chevron")}
    </button>
  `;
}

function panelShouldShowCategoryFilterTrigger(items = panelState.items) {
  return panelScopedItems(items).length > 0 || panelActiveFilterCount() > 0;
}

function renderPanelChipClearIcon(attribute = "") {
  return `<span class="wp-chip-clear" ${attribute} aria-hidden="true">${phosphorXIcon("wp-chip-clear-icon")}</span>`;
}

function renderFilterMenu(categories) {
  const isOpen = panelState.filterMenuOpen;
  return `
    <div class="wp-filter-menu wp-popover" role="menu" ${isOpen ? "" : "hidden"} data-filter-menu>
      ${categories.map(renderFilterMenuRow).join("")}
      <button class="wp-filter-menu-add" type="button" role="menuitem" data-add-category>
        ${phosphorPlusIcon("wp-filter-menu-add-icon")}
        <span>${escapeHtml(t("Add category"))}</span>
      </button>
    </div>
  `;
}

function renderFilterMenuRow(category) {
  const isActive = category.id === panelState.activeCategory;
  return `
    <div class="wp-filter-menu-row${isActive ? " is-active" : ""}" role="none">
      <button class="wp-filter-menu-option" type="button" role="menuitemradio" aria-checked="${isActive}" data-category="${escapeAttribute(category.id)}">
        <span class="wp-filter-menu-check">${isActive ? phosphorCheckIcon("wp-filter-menu-check-icon") : ""}</span>
        <span class="wp-filter-menu-label">${escapeHtml(panelCategoryDisplayLabel(category))}</span>
      </button>
      <button class="wp-filter-menu-remove" type="button" aria-label="${escapeAttribute(t("Remove {category}", { category: panelCategoryDisplayLabel(category) }))}" data-remove-category-prompt="${escapeAttribute(category.id)}">
        ${phosphorXIcon("wp-filter-remove-icon")}
      </button>
    </div>
  `;
}

function renderArchivedFilter(archivedCount) {
  if (!archivedCount) {
    return "";
  }

  return `
    <button class="wp-filter wp-filter-archive${panelState.archivedOpen ? " is-active" : ""}" type="button" aria-label="${escapeAttribute(t("Archived items: {count}", { count: archivedCount }))}" aria-pressed="${panelState.archivedOpen}" data-panel-hint="${escapeAttribute(panelArchiveChipHint())}" data-archive-view-toggle>
      ${phosphorArchiveIcon("wp-archive-chip-icon")}
      <span class="wp-archive-count">${archivedCount}</span>
      ${panelState.archivedOpen ? renderPanelChipClearIcon() : ""}
    </button>
  `;
}

function syncPanelFilterRail(root) {
  const rail = root?.querySelector?.("[data-filter-rail]");
  syncPanelFilterMenuPosition(root);
  observePanelFilterCrowding(root, rail);
  syncPanelFilterRailLayout(root, rail);
}

function syncPanelFilterRailLayout(root, rail = root?.querySelector?.("[data-filter-rail]")) {
  const active = Array.from(rail?.children || []).find((child) =>
    child.classList?.contains("is-active")
  );
  if (!rail) {
    return;
  }
  if (!active) {
    syncPanelFilterCrowding(root, rail);
    return;
  }

  window.requestAnimationFrame(() => {
    scrollPanelFilterChipIntoView(rail, active);
    const isCrowded = applyPanelFilterCrowding(root, rail);
    if (!isCrowded) {
      return;
    }

    window.requestAnimationFrame(() => {
      scrollPanelFilterChipIntoView(rail, active);
      applyPanelFilterCrowding(root, rail);
    });
  });
}

function syncPanelFilterCrowding(root, rail = root?.querySelector?.("[data-filter-rail]")) {
  if (!root || !rail) {
    return;
  }

  window.requestAnimationFrame(() => {
    applyPanelFilterCrowding(root, rail);
  });
}

function applyPanelFilterCrowding(root, rail = root?.querySelector?.("[data-filter-rail]")) {
  const filters = root?.querySelector?.(".wp-filters");
  if (!filters || !rail) {
    return false;
  }

  if (filters.classList.contains("is-filter-crowded")) {
    const expandedWidth = Number(filters.__tuckioFilterExpandedWidth) || rail.scrollWidth;
    if (expandedWidth > rail.clientWidth + 1 || panelFilterRailHasClippedChild(rail)) {
      return true;
    }
  }

  filters.classList.remove("is-filter-crowded");
  filters.__tuckioFilterExpandedWidth = rail.scrollWidth;
  const isCrowded = panelFilterRailIsCrowded(rail);
  filters.classList.toggle("is-filter-crowded", isCrowded);
  return isCrowded;
}

function observePanelFilterCrowding(root, rail = root?.querySelector?.("[data-filter-rail]")) {
  const filters = root?.querySelector?.(".wp-filters");
  if (!root || !filters || !rail || typeof ResizeObserver !== "function") {
    return;
  }

  root.__tuckioFilterCrowdingObserver?.disconnect?.();
  const observer = new ResizeObserver(() => schedulePanelFilterRailLayout(root));
  root.__tuckioFilterCrowdingObserver = observer;
  observer.observe(filters);
  observer.observe(rail);
  filters.querySelectorAll("[data-panel-view-controls], [data-panel-sort-trigger], [data-filter-menu-trigger]")
    .forEach((item) => observer.observe(item));
}

function schedulePanelFilterRailLayout(root) {
  if (!root || root.__tuckioFilterRailLayoutScheduled) {
    return;
  }

  root.__tuckioFilterRailLayoutScheduled = true;
  window.requestAnimationFrame(() => {
    root.__tuckioFilterRailLayoutScheduled = false;
    syncPanelFilterMenuPosition(root);
    syncPanelFilterRailLayout(root);
  });
}

function scrollPanelFilterChipIntoView(rail, chip) {
  const railWidth = Number(rail?.clientWidth);
  const chipLeft = Number(chip?.offsetLeft);
  const chipWidth = Number(chip?.offsetWidth);
  if (!rail || !Number.isFinite(railWidth) || railWidth <= 0 ||
    !Number.isFinite(chipLeft) || !Number.isFinite(chipWidth)) {
    chip?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    return;
  }

  const padding = 2;
  const currentLeft = Number(rail.scrollLeft) || 0;
  const visibleLeft = currentLeft + padding;
  const visibleRight = currentLeft + railWidth - padding;
  const chipRight = chipLeft + chipWidth;
  if (chipLeft < visibleLeft) {
    rail.scrollLeft = Math.max(0, chipLeft - padding);
    return;
  }
  if (chipRight > visibleRight) {
    rail.scrollLeft = Math.max(0, chipRight - railWidth + padding);
  }
}

function panelFilterRailIsCrowded(rail) {
  const railRect = rail?.getBoundingClientRect?.();
  if (!railRect) {
    return false;
  }

  return rail.scrollWidth > rail.clientWidth + 1 || panelFilterRailHasClippedChild(rail, railRect);
}

function panelFilterRailHasClippedChild(rail, railRect = rail?.getBoundingClientRect?.()) {
  if (!railRect) {
    return false;
  }

  const leftEdge = railRect.left - 1;
  const rightEdge = railRect.right + 1;
  return Array.from(rail.children || []).some((child) => {
    const rect = child.getBoundingClientRect?.();
    return rect && rect.width > 0 && (rect.left < leftEdge || rect.right > rightEdge);
  });
}

function syncPanelFilterMenu(root) {
  const menu = root?.querySelector?.("[data-filter-menu]");
  const trigger = root?.querySelector?.("[data-filter-menu-trigger]");
  if (!menu || !trigger) {
    return;
  }

  const isOpen = panelState.filterMenuOpen;
  menu.hidden = !isOpen;
  trigger.classList.toggle("is-active", panelActiveFilterCount() > 0);
  trigger.setAttribute("aria-expanded", String(isOpen));
  trigger.setAttribute("aria-label", panelFilterTriggerAriaLabel(panelState.categories));
  const label = trigger.querySelector(".wp-filter-trigger-label");
  if (label) {
    label.textContent = panelFilterTriggerLabel(panelState.categories);
  }
  trigger.dataset.panelHint = panelFilterChipHint(panelState.categories);
  syncPanelFilterMenuPosition(root);
}

function closePanelFilterMenu(root = document.getElementById("tuckio-panel-root")?.shadowRoot) {
  if (!panelState.filterMenuOpen) {
    return;
  }

  panelState.filterMenuOpen = false;
  syncPanelFilterMenu(root);
}

function syncPanelFilterMenuPosition(root) {
  const filters = root?.querySelector?.(".wp-filters");
  const trigger = root?.querySelector?.("[data-filter-menu-trigger]");
  if (!filters || !trigger) {
    return;
  }

  const filtersRect = filters.getBoundingClientRect?.();
  const triggerRect = trigger.getBoundingClientRect?.();
  if (!filtersRect || !triggerRect) {
    return;
  }

  filters.style.setProperty("--wp-filter-menu-left", `${Math.max(0, Math.round(triggerRect.left - filtersRect.left))}px`);
}

function panelMainScopeIsActive() {
  return !panelState.archivedOpen &&
    !panelState.shortlistOpen &&
    !panelState.brandCloudOpen &&
    !panelState.brandFilterKey &&
    panelState.activeCategory === "all" &&
    !panelState.searchQuery &&
    !panelState.categoryComposerOpen;
}

function panelActiveFilterCount() {
  return panelState.activeCategory !== "all" ? 1 : 0;
}

function panelFilterTriggerLabel(categories) {
  const count = panelActiveFilterCount();
  if (!count) {
    return t("Filter");
  }

  return t("Filter ({count})", { count });
}

function panelFilterTriggerAriaLabel(categories) {
  const label = panelFilterTriggerLabel(categories);
  return panelState.filterMenuOpen
    ? t("{label}. Close category filter menu", { label })
    : t("{label}. Open category filter menu", { label });
}

function panelShortlistChipHint() {
  return panelState.shortlistOpen ? t("Showing shortlist") : t("Shortlist: priority picks");
}

function panelFilterChipHint(categories) {
  const category = categories.find((item) => item.id === panelState.activeCategory);
  return category
    ? t("Category filter: {category}", { category: panelCategoryDisplayLabel(category) })
    : t("Category filter");
}

function panelArchiveChipHint() {
  return panelState.archivedOpen ? t("Showing archive") : t("Archive: bought and archived items");
}

function panelBrandFilterCount() {
  return new Set(panelActiveItems(panelState.items).map(panelItemBrandKey)).size;
}

function panelBrandChipLabel() {
  return String(panelState.brandFilterLabel || panelState.brandFilterKey || t("Brand"))
    .trim()
    .toUpperCase();
}

function panelBrandChipAriaLabel(brandCount) {
  if (panelState.brandFilterKey) {
    return t("{brand}. Close brands", { brand: panelBrandChipLabel() });
  }

  const brandNoun = panelBrandNoun(brandCount);
  return panelState.brandCloudOpen
    ? t("{count} {brandNoun}. Close brands", { count: brandCount, brandNoun })
    : t("{count} {brandNoun}. Show brands", { count: brandCount, brandNoun });
}

function panelBrandChipHint() {
  return panelState.brandFilterKey
    ? t("Brand filter: {brand}", { brand: panelBrandChipLabel() })
    : t("Brand cloud: saved brands");
}
