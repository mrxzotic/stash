function renderPanelPricesOnly(options = {}) {
  const root = document.getElementById("stash-panel-root")?.shadowRoot;
  if (!root) {
    return;
  }

  const itemsById = new Map(
    panelState.items.map(normalizePanelItem).map((item) => [item.id, item])
  );
  root.querySelectorAll("[data-panel-item-id]").forEach((element) => {
    syncPanelPriceRow(element, itemsById.get(element.dataset.panelItemId), options);
  });
}

function syncPanelPriceRow(element, item, options = {}) {
  const priceRow = element?.querySelector?.(".wp-price-row");
  if (!priceRow || !item) {
    return;
  }

  const priceHtml = renderSitePriceHtml(item, "wp");
  if (!priceHtml) {
    priceRow.remove();
    return;
  }

  if (priceRow.innerHTML.trim() === priceHtml.trim()) {
    return;
  }

  priceRow.innerHTML = priceHtml;
  if (options.animate) {
    restartPanelPriceCount(priceRow);
  }
}

function restartPanelPriceCount(priceRow) {
  window.clearTimeout(priceRow.__stashPriceCountTimer);
  priceRow.classList.remove("is-price-recounting");
  void priceRow.offsetWidth;
  priceRow.classList.add("is-price-recounting");
  priceRow.__stashPriceCountTimer = window.setTimeout(() => {
    priceRow.classList.remove("is-price-recounting");
    priceRow.__stashPriceCountTimer = 0;
  }, 760);
}
