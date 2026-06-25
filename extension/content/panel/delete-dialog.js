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
      <h3 id="wp-delete-item-title">${escapeHtml(t("Delete item?"))}</h3>
      <p>${escapeHtml(t("{item} will be removed from your saved items.", { item: item.title }))}</p>
      <div class="wp-confirm-actions">
        <button class="wp-confirm-cancel" type="button" data-autofocus data-cancel-delete-item>${escapeHtml(t("Cancel"))}</button>
        <button class="wp-confirm-delete" type="button" data-confirm-delete-item="${escapeAttribute(item.id)}">${escapeHtml(t("Delete"))}</button>
      </div>
    </section>
  `;
}
