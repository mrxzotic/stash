function renderPanelEmpty() {
  const state = panelEmptyState();

  return `
    <div class="wp-empty">
      <div>
        ${state.icon ? `<img class="wp-empty-logo" src="${escapeAttribute(stashedGreyscaleLogoUrl())}" alt="" aria-hidden="true">` : ""}
        <strong>${escapeHtml(state.title)}</strong>
        <span>${escapeHtml(state.detail)}</span>
      </div>
    </div>
  `;
}

function panelEmptyState() {
  if (panelState.archivedOpen) {
    return {
      icon: false,
      title: "No archived items",
      detail: "Archived items will appear here."
    };
  }

  if (panelState.searchQuery) {
    return {
      icon: false,
      title: "No matches",
      detail: "Try another name, category, or source."
    };
  }

  if (!panelActiveItems(panelState.items).length) {
    return {
      icon: true,
      title: "Save your first product",
      detail: "Use the plus button or right-click a product card, image, link, or product page and choose Save to Stashed."
    };
  }

  if (panelState.activeCategory !== "all") {
    const category = panelActiveCategoryLabel();
    return {
      icon: false,
      title: `0 items in ${category}`,
      detail: `Products saved to ${category} will appear here.`
    };
  }

  if (panelState.brandFilterKey) {
    const brand = panelState.brandFilterLabel || "this brand";
    return {
      icon: false,
      title: `0 items from ${brand}`,
      detail: "Clear the brand filter to see the rest of your saved products."
    };
  }

  return {
    icon: false,
    title: "No items here",
    detail: "Saved products that match this view will appear here."
  };
}

function panelActiveCategoryLabel() {
  const category = panelState.categories.find((item) => item.id === panelState.activeCategory);
  return category?.label || "this category";
}

function stashedGreyscaleLogoUrl() {
  try {
    return chrome.runtime.getURL("icons/stashed-lock-greyscale-128.png");
  } catch {
    return "";
  }
}
