function renderCategoryFilters(filterCategories, archivedCount = 0) {
  const [, ...categoryOptions] = filterCategories;

  return `
    <div class="wp-filter-rail" data-filter-rail>
      ${renderShortlistFilterChip()}
      ${renderBrandFilterChip()}
      ${renderFilterMenuTrigger(categoryOptions)}
      ${renderArchivedFilter(archivedCount)}
    </div>
    ${renderFilterMenu(categoryOptions)}
    ${renderPanelSortControls()}
  `;
}

function renderShortlistFilterChip() {
  const count = panelShortlistCount();
  if (!count) {
    return "";
  }

  return `
    <button class="wp-filter wp-filter-shortlist${panelState.shortlistOpen ? " is-active" : ""}" type="button" aria-label="${escapeAttribute(t("Shortlisted items: {count}", { count }))}" aria-pressed="${panelState.shortlistOpen}" data-shortlist-toggle>
      ${phosphorStarIcon("wp-shortlist-chip-icon")}
      <span class="wp-shortlist-chip-count">${count}</span>
      ${panelState.shortlistOpen ? renderPanelChipClearIcon() : ""}
    </button>
  `;
}

function renderBrandFilterChip() {
  const brandCount = panelBrandFilterCount();
  const isActive = panelState.brandCloudOpen || panelState.brandFilterKey;
  return `
    <button class="wp-brand-chip${isActive ? " is-active" : ""}" type="button" aria-label="${escapeAttribute(panelBrandChipAriaLabel(brandCount))}" aria-pressed="${isActive}" data-brand-cloud-toggle>
      ${phosphorTagIcon("wp-brand-chip-icon")}
      <span class="wp-brand-chip-count">${brandCount}</span>
      ${isActive ? renderPanelChipClearIcon() : ""}
    </button>
  `;
}

function renderFilterMenuTrigger(categories) {
  const isOpen = panelState.filterMenuOpen;
  const hasActiveFilter = panelActiveFilterCount() > 0;
  return `
    <button class="wp-filter wp-filter-trigger${hasActiveFilter ? " is-active" : ""}" type="button" aria-label="${escapeAttribute(panelFilterTriggerAriaLabel(categories))}" aria-haspopup="menu" aria-expanded="${isOpen}" data-filter-menu-trigger>
      ${phosphorListIcon("wp-filter-trigger-icon")}
      <span class="wp-filter-trigger-label">${escapeHtml(panelFilterTriggerLabel(categories))}</span>
      ${hasActiveFilter ? renderPanelChipClearIcon("data-filter-clear") : phosphorChevronDownIcon("wp-filter-chevron")}
    </button>
  `;
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
  const isActive = !panelState.archivedOpen && category.id === panelState.activeCategory;
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
    <button class="wp-filter wp-filter-archive${panelState.archivedOpen ? " is-active" : ""}" type="button" aria-label="${escapeAttribute(t("Archived items: {count}", { count: archivedCount }))}" aria-pressed="${panelState.archivedOpen}" data-archive-view-toggle>
      ${phosphorArchiveIcon("wp-archive-chip-icon")}
      <span class="wp-archive-count">${archivedCount}</span>
      ${panelState.archivedOpen ? renderPanelChipClearIcon() : ""}
    </button>
  `;
}

function syncPanelFilterRail(root) {
  const rail = root?.querySelector?.("[data-filter-rail]");
  syncPanelFilterMenuPosition(root);
  const active = Array.from(rail?.children || []).find((child) =>
    child.classList?.contains("is-active")
  );
  if (!rail || !active) {
    return;
  }

  window.requestAnimationFrame(() => {
    active.scrollIntoView?.({ block: "nearest", inline: "center" });
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

function panelBrandFilterCount() {
  return new Set(panelActiveItems(panelState.items).map(panelItemBrandKey)).size;
}

function panelBrandChipAriaLabel(brandCount) {
  const brandNoun = panelBrandNoun(brandCount);
  return panelState.brandCloudOpen || panelState.brandFilterKey
    ? t("{count} {brandNoun}. Close brands", { count: brandCount, brandNoun })
    : t("{count} {brandNoun}. Show brands", { count: brandCount, brandNoun });
}
