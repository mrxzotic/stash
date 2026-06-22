function renderPanelEmpty() {
  const state = panelEmptyState();

  return `
    <div class="wp-empty">
      <div>
        ${state.icon ? `<img class="wp-empty-logo" src="${escapeAttribute(tuckioMonochromeLogoUrl())}" alt="" aria-hidden="true">` : ""}
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
      title: t("No archived items"),
      detail: t("Archived items will appear here.")
    };
  }

  if (panelState.searchQuery) {
    return {
      icon: false,
      title: t("No matches"),
      detail: t("Try another name, category, or source.")
    };
  }

  if (!panelActiveItems(panelState.items).length) {
    return {
      icon: true,
      title: t("Save your first product"),
      detail: t("Use the plus button or right-click a product card, image, link, or product page and choose Save to Tuckio.")
    };
  }

  if (panelState.activeCategory !== "all") {
    const category = panelActiveCategoryLabel();
    return {
      icon: false,
      title: t("0 items in {category}", { category }),
      detail: t("Products saved to {category} will appear here.", { category })
    };
  }

  if (panelState.brandFilterKey) {
    const brand = panelState.brandFilterLabel || t("this brand");
    return {
      icon: false,
      title: t("0 items from {brand}", { brand }),
      detail: t("Clear the brand filter to see the rest of your saved products.")
    };
  }

  return {
    icon: false,
    title: t("No items here"),
    detail: t("Saved products that match this view will appear here.")
  };
}

function panelActiveCategoryLabel() {
  const category = panelState.categories.find((item) => item.id === panelState.activeCategory);
  return category ? panelCategoryDisplayLabel(category) : t("this category");
}

function tuckioMonochromeLogoUrl() {
  try {
    return chrome.runtime.getURL("assets/tuckio-app-black.png");
  } catch {
    return "";
  }
}
