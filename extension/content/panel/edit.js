function renderEditItemDialog() {
  const item = editablePanelItem();
  if (!item) {
    return "";
  }

  const price = item.price || {};
  const priceAmount = editPriceAmountValue(price);
  const currency = editCurrencyCode(price.currency || item.currency);

  return `
    <div class="wp-dialog-backdrop" role="presentation" data-cancel-edit-item></div>
    <form class="wp-edit-dialog" role="dialog" aria-modal="true" aria-labelledby="wp-edit-item-title" data-panel-modal data-edit-item-form>
      <div class="wp-edit-head">
        <h3 id="wp-edit-item-title">Edit item</h3>
        <button class="wp-edit-close" type="button" aria-label="Cancel edit" data-cancel-edit-item>${lucideXIcon("wp-edit-close-icon")}</button>
      </div>
      <label class="wp-edit-field">
        <span>Brand</span>
        <input name="brand" type="text" value="${escapeAttribute(item.brand)}" maxlength="80" autocomplete="off" data-autofocus>
      </label>
      <label class="wp-edit-field">
        <span>Name</span>
        <input name="title" type="text" value="${escapeAttribute(item.title)}" maxlength="140" autocomplete="off">
      </label>
      <div class="wp-edit-price-row">
        <label class="wp-edit-field">
          <span>Price</span>
          <input name="price" type="text" value="${escapeAttribute(priceAmount)}" maxlength="40" inputmode="decimal" autocomplete="off">
        </label>
        <label class="wp-edit-field">
          <span>Currency</span>
          <select name="currency" aria-label="Currency">
            ${renderEditCurrencyOptions(currency)}
          </select>
        </label>
      </div>
      <label class="wp-edit-field">
        <span>Image URL</span>
        <input name="imageUrl" type="url" value="${escapeAttribute(item.imageUrl || "")}" maxlength="2048" autocomplete="off">
      </label>
      <div class="wp-edit-field">
        <span>Category</span>
        <div class="wp-edit-category-list" role="radiogroup" aria-label="Category">
          ${renderEditCategoryOptions(item.category)}
        </div>
      </div>
      <div class="wp-edit-actions">
        <button class="wp-confirm-cancel" type="button" data-cancel-edit-item>Cancel</button>
        <button class="wp-confirm-delete wp-edit-save" type="submit">Save</button>
      </div>
    </form>
  `;
}

function editPriceAmountValue(price) {
  const amount = numericPrice(price.amount ?? price.originalText);
  if (!Number.isFinite(amount)) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(amount);
}

function editCurrencyCode(currency) {
  const code = cleanText(currency).toUpperCase();
  if (isSummaryCurrency(code)) {
    return code;
  }

  return isSummaryCurrency(panelState.summaryCurrency)
    ? panelState.summaryCurrency
    : DEFAULT_SETTINGS.summaryCurrency;
}

function renderEditCurrencyOptions(selectedCurrency) {
  return summaryCurrencyOptions().map((currency) => `
    <option value="${escapeAttribute(currency)}" ${currency === selectedCurrency ? "selected" : ""}>${escapeHtml(currency)}</option>
  `).join("");
}

function renderEditCategoryOptions(selectedCategory) {
  return panelState.categories.map((category) => {
    const isSelected = category.id === selectedCategory;
    return `
      <label class="wp-edit-category${isSelected ? " is-selected" : ""}">
        <input type="radio" name="category" value="${escapeAttribute(category.id)}" ${isSelected ? "checked" : ""}>
        <span>${escapeHtml(category.label)}</span>
      </label>
    `;
  }).join("");
}

function editablePanelItem() {
  return panelState.items
    .map(normalizePanelItem)
    .find((item) => item.id === panelState.editItemId);
}

function bindPanelEditEvents(root) {
  root.querySelector(".wp-items")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-edit-id]");
    if (!button) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    rememberPanelFocus(button);
    panelState.editItemId = button.dataset.editId;
    panelState.categoryComposerOpen = false;
    panelState.deleteCategoryId = "";
    panelState.deleteItemId = "";
    panelState.settingsOpen = false;
    renderStashPanel();
  });

  root.querySelector("[data-edit-item-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    safelyRunPanelAction(() => savePanelEditedItem(event.currentTarget));
  });

  root.querySelectorAll("[data-cancel-edit-item]").forEach((button) => {
    button.addEventListener("click", () => {
      panelState.editItemId = "";
      renderStashPanel();
    });
  });
}

async function savePanelEditedItem(form) {
  const id = panelState.editItemId;
  const index = panelState.items.findIndex((item) => normalizePanelItem(item).id === id);
  if (index < 0) {
    panelState.editItemId = "";
    renderStashPanel();
    return;
  }

  const formData = new FormData(form);
  const current = normalizePanelItem(panelState.items[index]);
  const brand = editedBrand(formData, current);
  const title = editedTitle(formData, current, brand);
  const price = editedPrice(formData, current);
  const rubPrice = await convertPriceToRub(price);
  const imageUrl = cleanText(formData.get("imageUrl")) || current.imageUrl;
  const category = cleanText(formData.get("category"));
  const nextItem = {
    ...panelState.items[index],
    id: current.id,
    source: current.source || sourceNameFromUrl(current.url),
    sourceDomain: current.sourceDomain || sourceDomainFromUrl(current.url),
    faviconUrl: faviconUrlForSource(current.url, current.faviconUrl),
    url: current.url,
    title,
    brand,
    imageUrl: toAbsoluteUrl(imageUrl),
    imageUrls: normalizeProductImageUrls(current.imageUrls, imageUrl, SAVED_IMAGE_URL_LIMIT),
    category: hasCategory(panelState.categories, category) ? category : current.category,
    price: editedStoredPrice(price, rubPrice),
    priceText: price.originalText,
    priceAmount: price.amount,
    currency: price.currency,
    compareAtPriceText: price.compareAtText,
    compareAtPriceAmount: price.compareAtAmount,
    isSale: price.isSale,
    rubPriceText: rubPrice.text,
    rubPriceAmount: rubPrice.amount,
    updatedAt: new Date().toISOString()
  };

  panelState.items = panelState.items.map((item, itemIndex) =>
    itemIndex === index ? nextItem : item
  );
  panelState.editItemId = "";
  await setLocalStorageValue(STORAGE_KEY, panelState.items);
  renderStashPanel();
}

function editedBrand(formData, current) {
  const value = cleanText(formData.get("brand"));
  return cleanBrandName(value) || value || current.brand || sourceNameFromUrl(current.url);
}

function editedTitle(formData, current, brand) {
  const value = cleanText(formData.get("title"));
  return cleanProductTitle(value, brand, current.url) || current.title || "Saved Product";
}

function editedPrice(formData, current) {
  const priceInput = cleanText(formData.get("price"));
  const currencyInput = editCurrencyCode(formData.get("currency"));
  const currentPrice = current.price || {};
  return normalizePrice({
    amount: priceInput ? numericPrice(priceInput) : currentPrice.amount,
    currency: currencyInput || currentPrice.currency,
    text: priceInput || currentPrice.originalText,
    compareAtAmount: currentPrice.compareAtAmount,
    compareAtText: currentPrice.compareAtText
  });
}

function editedStoredPrice(price, rubPrice) {
  return {
    amount: price.amount,
    currency: price.currency,
    originalText: price.originalText,
    compareAtAmount: price.compareAtAmount,
    compareAtText: price.compareAtText,
    isSale: price.isSale,
    rubAmount: rubPrice.amount,
    rubText: rubPrice.text,
    rate: rubPrice.rate,
    rateSource: rubPrice.source
  };
}
