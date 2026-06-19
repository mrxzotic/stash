(() => {
  const CONTENT_VERSION = "2026-06-19-strict-card-model-v1";

  if (window.__wishlistedContentVersion === CONTENT_VERSION) {
    return;
  }

  window.__wishlistedContentVersion = CONTENT_VERSION;
  window.__wishlistedContentLoaded = true;

  const STORAGE_KEY = "wishlisted.items.v1";
  const RATE_STORAGE_KEY = "wishlisted.rubRates.v1";
  const CATEGORY_STORAGE_KEY = "wishlisted.categories.v1";
  const CATEGORY_SCHEMA_STORAGE_KEY = "wishlisted.categories.schema.v1";
  const CATEGORY_SCHEMA_VERSION = 2;
  const SETTINGS_STORAGE_KEY = "wishlisted.settings.v1";
  const DEFAULT_SETTINGS = {
    summaryCurrency: "USD",
    backgroundTheme: "warm"
  };
  const DEFAULT_CATEGORIES = [
    { id: "tops", label: "Tops" },
    { id: "bottoms", label: "Bottoms" },
    { id: "outerwear", label: "Outerwear" },
    { id: "shoes", label: "Shoes" },
    { id: "bags", label: "Bags" },
    { id: "accessories", label: "Accessories" }
  ];
  const DEFAULT_RUB_RATES = {
    RUB: 1,
    USD: 89,
    EUR: 96,
    UAH: 2.2,
    GBP: 113,
    JPY: 0.62,
    AUD: 59,
    CAD: 65,
    CHF: 102,
    CNY: 12.2,
    KRW: 0.065,
    AED: 24.2,
    SAR: 23.7,
    QAR: 24.5,
    KWD: 291,
    BHD: 236,
    OMR: 231,
    TRY: 2.75,
    KZT: 0.17,
    GEL: 32.8,
    AMD: 0.23,
    PLN: 24,
    SEK: 9.4,
    NOK: 8.8,
    DKK: 12.9,
    HKD: 11.4,
    SGD: 68
  };
  const CURRENCY_SYMBOLS = {
    RUB: "₽",
    USD: "$",
    EUR: "€",
    UAH: "₴",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    CNY: "CN¥",
    KRW: "KRW",
    AED: "AED",
    SAR: "SAR",
    QAR: "QAR",
    KWD: "KWD",
    BHD: "BHD",
    OMR: "OMR",
    TRY: "TRY",
    KZT: "KZT",
    GEL: "GEL",
    AMD: "AMD",
    PLN: "PLN",
    SEK: "SEK",
    NOK: "NOK",
    DKK: "DKK",
    HKD: "HKD",
    SGD: "S$"
  };
  const LEADING_SYMBOL_CURRENCIES = new Set([
    "USD",
    "GBP",
    "JPY",
    "AUD",
    "CAD",
    "CNY",
    "HKD",
    "SGD"
  ]);
  const CURRENCY_CODE_PATTERN =
    "USD|EUR|GBP|JPY|AUD|CAD|CHF|CNY|KRW|RUB|UAH|AED|SAR|QAR|KWD|BHD|OMR|TRY|KZT|GEL|AMD|PLN|SEK|NOK|DKK|HKD|SGD";
  const RATE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
  const BRAND_ALIASES = new Map([
    ["aime leon dore eu", "Aimé Leon Dore"],
    ["aime leon dore", "Aimé Leon Dore"],
    ["aimé leon dore eu", "Aimé Leon Dore"],
    ["aimé leon dore", "Aimé Leon Dore"],
    ["tomfordfashion", "Tom Ford"],
    ["tom ford fashion", "Tom Ford"],
    ["tomford", "Tom Ford"],
    ["loewe", "Loewe"],
    ["rimowa", "RIMOWA"],
    ["on", "On"],
    ["suitsupply", "Suitsupply"],
    ["about blank", "about:blank"],
    ["about:blank", "about:blank"],
    ["marcelo miracles", "Marcelo Miracles"]
  ]);

  let lastContextTarget = null;
  let lastContextPoint = { x: Math.round(window.innerWidth * 0.72), y: 180 };
  const panelState = {
    open: false,
    searchOpen: false,
    settingsOpen: false,
    activeCategory: "all",
    searchQuery: "",
    items: [],
    categories: DEFAULT_CATEGORIES,
    summaryCurrency: DEFAULT_SETTINGS.summaryCurrency,
    summaryRate: {
      currency: DEFAULT_SETTINGS.summaryCurrency,
      value: DEFAULT_RUB_RATES[DEFAULT_SETTINGS.summaryCurrency],
      source: "fallback",
      updatedAt: 0
    },
    summaryRateLoading: "",
    backgroundTheme: DEFAULT_SETTINGS.backgroundTheme,
    hasRenderedPanel: false,
    highlightedItemId: "",
    highlightTimer: 0
  };

  removeStaleExtensionRoots();

  document.addEventListener(
    "contextmenu",
    (event) => {
      lastContextTarget = event.target;
      lastContextPoint = { x: event.clientX, y: event.clientY };
    },
    true
  );

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "WISHLISTED_PING") {
      sendResponse({ ok: true });
      return false;
    }

    if (message?.type === "WISHLISTED_TOGGLE_PANEL") {
      toggleWishlistPanel()
        .then((result) => sendResponse(result))
        .catch((error) => sendResponse({ ok: false, error: error.message }));
      return true;
    }

    if (message?.type !== "WISHLISTED_SAVE") {
      return false;
    }

    saveCurrentProduct(message)
      .then((result) => sendResponse(result))
      .catch((error) => {
        showErrorOverlay(error);
        sendResponse({ ok: false, error: error.message });
      });

    return true;
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !panelState.open) {
      return;
    }

    let requiresFullRender = false;
    let settingsChanged = false;

    if (changes[STORAGE_KEY]) {
      panelState.items = Array.isArray(changes[STORAGE_KEY].newValue)
        ? changes[STORAGE_KEY].newValue
        : [];
      requiresFullRender = true;
    }

    if (changes[CATEGORY_STORAGE_KEY]) {
      panelState.categories = normalizeCategories(changes[CATEGORY_STORAGE_KEY].newValue);
      if (
        panelState.activeCategory !== "all" &&
        !hasCategory(panelState.categories, panelState.activeCategory)
      ) {
        panelState.activeCategory = "all";
      }
      requiresFullRender = true;
    }

    if (changes[SETTINGS_STORAGE_KEY]) {
      const settings = normalizePanelSettings(changes[SETTINGS_STORAGE_KEY].newValue);
      panelState.summaryCurrency = settings.summaryCurrency;
      panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
      panelState.backgroundTheme = settings.backgroundTheme;
      settingsChanged = true;
    }

    if (settingsChanged && !requiresFullRender) {
      syncPanelSettingsControls();
      renderPanelSummaryOnly();
      refreshPanelSummaryRate();
      return;
    }

    renderWishlistPanel();
  });

  async function saveCurrentProduct(message) {
    const product = await enrichProduct(extractProduct(message.context || {}));
    const [categories, settings] = await Promise.all([getCategories(), getPanelSettings()]);
    panelState.summaryCurrency = settings.summaryCurrency;
    panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
    panelState.backgroundTheme = settings.backgroundTheme;
    const category =
      message.category && message.category !== "auto" && hasCategory(categories, message.category)
        ? message.category
        : inferCategory(product, categories);
    const item = await normalizeItem(product, category, categories);
    const items = await upsertItem(item);

    if (panelState.open) {
      showSavedItemInPanel(item, items, categories);
    } else {
      showSavedOverlay(item, items, categories);
    }
    return { ok: true, item };
  }

  async function toggleWishlistPanel() {
    if (panelState.open) {
      closeWishlistPanel();
      return { ok: true, open: false };
    }

    await openWishlistPanel();
    return { ok: true, open: true };
  }

  async function openWishlistPanel() {
    await loadPanelData();
    panelState.open = true;
    panelState.hasRenderedPanel = false;
    renderWishlistPanel();
  }

  function closeWishlistPanel() {
    const host = document.getElementById("wishlisted-panel-root");
    if (host) {
      host.remove();
    }
    panelState.open = false;
    panelState.settingsOpen = false;
    panelState.hasRenderedPanel = false;
    panelState.highlightedItemId = "";
    window.clearTimeout(panelState.highlightTimer);
  }

  function showSavedItemInPanel(item, items, categories) {
    clearSavedOverlay();
    panelState.items = items;
    panelState.categories = categories;
    panelState.highlightedItemId = item.id;

    if (panelState.activeCategory !== "all" && panelState.activeCategory !== item.category) {
      panelState.activeCategory = item.category;
    }

    if (panelState.searchQuery && !panelItemMatchesSearch(normalizePanelItem(item))) {
      panelState.searchQuery = "";
      panelState.searchOpen = false;
    }

    renderWishlistPanel();
    window.clearTimeout(panelState.highlightTimer);
    panelState.highlightTimer = window.setTimeout(() => {
      if (!panelState.open || panelState.highlightedItemId !== item.id) {
        return;
      }
      panelState.highlightedItemId = "";
      renderWishlistPanel();
    }, 1400);
  }

  function clearSavedOverlay() {
    const host = document.getElementById("wishlisted-extension-root");
    if (host?.shadowRoot) {
      window.clearTimeout(host.shadowRoot.__wishlistedTimer);
      host.shadowRoot.innerHTML = "";
    }
  }

  function removeStaleExtensionRoots() {
    document.getElementById("wishlisted-panel-root")?.remove();
    document.getElementById("wishlisted-extension-root")?.remove();
  }

  async function loadPanelData() {
    const stored = await getLocalStorageValue([
      STORAGE_KEY,
      CATEGORY_STORAGE_KEY,
      SETTINGS_STORAGE_KEY
    ]);
    panelState.items = Array.isArray(stored[STORAGE_KEY]) ? stored[STORAGE_KEY] : [];
    panelState.categories = normalizeCategories(stored[CATEGORY_STORAGE_KEY]);
    const settings = normalizePanelSettings(stored[SETTINGS_STORAGE_KEY]);
    panelState.summaryCurrency = settings.summaryCurrency;
    panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
    panelState.backgroundTheme = settings.backgroundTheme;
  }

  function renderWishlistPanel() {
    const root = getPanelRoot();
    const displayItems = panelState.items.map(normalizePanelItem);
    const visibleItems = displayItems
      .filter(
        (item) =>
          panelState.activeCategory === "all" ||
          item.category === panelState.activeCategory
      )
      .filter(panelItemMatchesSearch);
    const filterCategories = [
      { id: "all", label: "All" },
      ...panelState.categories
    ];
    const summaryCurrencies = summaryCurrencyOptions();
    const backgroundThemes = backgroundThemeOptions();

    root.innerHTML = `
      <style>${panelStyles()}</style>
      <section class="wp-shell wp-theme-${escapeAttribute(panelState.backgroundTheme)}${panelState.hasRenderedPanel ? " is-static" : ""}" role="dialog" aria-label="Wishlisted">
        <header class="wp-topbar${panelState.searchOpen ? " is-searching" : ""}">
          ${panelState.searchOpen ? `
            <label class="wp-inline-search">
              ${lucideSearchIcon("wp-inline-search-icon")}
              <span>Search</span>
              <input data-search type="text" inputmode="search" placeholder="Search saved" autocomplete="off" value="${escapeAttribute(panelState.searchQuery)}">
            </label>
          ` : `
            <span class="wp-summary">
              <span class="wp-count">${panelState.items.length} ${panelState.items.length === 1 ? "item" : "items"}</span>
            </span>
            <div class="wp-actions">
              <span class="wp-total" aria-label="Wishlist total">${escapeHtml(formatPanelSummaryTotal(displayItems, panelState.summaryCurrency))}</span>
              <button class="wp-icon-button" type="button" aria-label="Search" aria-expanded="${panelState.searchOpen}" data-panel-search>
                ${lucideSearchIcon()}
              </button>
              <button class="wp-icon-button wp-settings-button${panelState.settingsOpen ? " is-active" : ""}" type="button" aria-label="Settings" aria-expanded="${panelState.settingsOpen}" data-panel-settings>
                ${lucideSettingsIcon()}
              </button>
            </div>
          `}
        </header>

        <section class="wp-settings wp-popover" ${panelState.settingsOpen ? "" : "hidden"}>
          <div class="wp-settings-head">
            <h2>Settings</h2>
          </div>
          <section class="wp-settings-section" aria-label="General settings">
            <div class="wp-settings-section-title">General</div>
            ${renderSettingsSelect({
              label: "Currency",
              ariaLabel: "Summary currency",
              value: panelState.summaryCurrency,
              options: summaryCurrencies.map((currency) => ({
                value: currency,
                label: currency,
                meta: currencySymbol(currency)
              })),
              dataAttribute: "data-summary-currency"
            })}
            ${renderSettingsSelect({
              label: "Background",
              ariaLabel: "Background theme",
              value: panelState.backgroundTheme,
              options: backgroundThemes.map((theme) => ({ value: theme.id, label: theme.label })),
              dataAttribute: "data-background-theme"
            })}
          </section>

          <section class="wp-settings-section" aria-label="Categories">
            <div class="wp-settings-section-head">
              <span>Categories</span>
              <button class="wp-text-button" type="button" data-reset-categories>Reset</button>
            </div>
            <div class="wp-category-list">
              ${panelState.categories.map(
                (category) => `
                  <div class="wp-category-row">
                    <input data-category-label="${escapeAttribute(category.id)}" value="${escapeAttribute(category.label)}" maxlength="28" aria-label="Category name">
                    <button class="wp-icon-button wp-remove-category" type="button" aria-label="Remove ${escapeAttribute(category.label)}" data-remove-category="${escapeAttribute(category.id)}"></button>
                  </div>
                `
              ).join("")}
            </div>
            <form class="wp-category-form" data-category-form>
              <input data-category-input type="text" placeholder="New category" maxlength="28" autocomplete="off">
              <button type="submit">Add</button>
            </form>
          </section>
        </section>

        <nav class="wp-filters" aria-label="Wishlist categories">
          ${filterCategories.map(
            (category) => `
              <button class="wp-filter${category.id === panelState.activeCategory ? " is-active" : ""}" data-category="${escapeAttribute(category.id)}" type="button">
                ${escapeHtml(category.label)}
              </button>
            `
          ).join("")}
        </nav>

        <section class="wp-items" aria-live="polite">
          ${renderPanelItemsHtml(visibleItems)}
        </section>
      </section>
    `;

    bindPanelEvents(root);
    focusPanelSearch(root);
    refreshPanelSummaryRate();
    panelState.hasRenderedPanel = true;
  }

  function renderSettingsSelect({ label, ariaLabel, value, options, dataAttribute }) {
    const currentOption =
      options.find((option) => option.value === value) ||
      options[0] ||
      { value, label: value };

    return `
      <div class="wp-settings-row">
        <span>${escapeHtml(label)}</span>
        <div class="wp-select" data-select-root>
          <button class="wp-select-trigger" type="button" aria-label="${escapeAttribute(ariaLabel)}" aria-haspopup="menu" aria-expanded="false" data-select-trigger>
            <span class="wp-select-value">
              <span>${escapeHtml(currentOption.label)}</span>
              ${currentOption.meta ? `<span class="wp-select-symbol">${escapeHtml(currentOption.meta)}</span>` : ""}
            </span>
            ${lucideChevronDownIcon("wp-select-chevron")}
          </button>
          <div class="wp-select-menu" role="menu" hidden>
            ${options.map((option) => {
              const isSelected = option.value === value;
              return `
                <button class="wp-select-option${isSelected ? " is-selected" : ""}" type="button" role="menuitemradio" aria-checked="${isSelected}" ${dataAttribute}="${escapeAttribute(option.value)}">
                  <span class="wp-select-check-slot">${isSelected ? lucideCheckIcon("wp-select-check") : ""}</span>
                  <span>${escapeHtml(option.label)}</span>
                  ${option.meta ? `<span class="wp-select-symbol">${escapeHtml(option.meta)}</span>` : ""}
                </button>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  }

  function renderPanelItem(item) {
    const brand = formatBrandName(item.brand || item.source || sourceNameFromUrl(item.url));
    const priceHtml = renderSitePriceHtml(item, "wp");

    return `
      <article class="wp-item${item.id === panelState.highlightedItemId ? " is-new" : ""}">
        <a class="wp-media" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">
          ${item.imageUrl ? `<img src="${escapeAttribute(item.imageUrl)}" alt="">` : lucideImageIcon("wp-image-placeholder")}
          <button class="wp-remove" type="button" title="Remove" aria-label="Remove" data-remove-id="${escapeAttribute(item.id)}"></button>
        </a>
        <div class="wp-item-copy">
          <div class="wp-brand-row">
            <a class="wp-brand" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(brand)}</a>
            <a class="wp-source-icon" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer" title="${escapeAttribute(item.sourceDomain)}" style="--wp-favicon-url: url('${escapeAttribute(cssUrl(item.faviconUrl))}')">
              <span class="wp-source-fallback">${escapeHtml(item.sourceDomain.charAt(0).toUpperCase())}</span>
              <span class="wp-source-favicon" aria-hidden="true"></span>
            </a>
          </div>
          <div class="wp-title-row">
            <a class="wp-item-title" href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a>
          </div>
          ${priceHtml ? `<div class="wp-price-row">${priceHtml}</div>` : ""}
        </div>
      </article>
    `;
  }

  function renderPanelItemsOnly(root) {
    const list = root.querySelector(".wp-items");
    if (!list) {
      return;
    }

    const visibleItems = panelState.items
      .map(normalizePanelItem)
      .filter(
        (item) =>
          panelState.activeCategory === "all" ||
          item.category === panelState.activeCategory
      )
      .filter(panelItemMatchesSearch);
    list.innerHTML = renderPanelItemsHtml(visibleItems);
    bindImageFallbacks(root);
  }

  function renderPanelItemsHtml(items) {
    return items.length ? items.map(renderPanelItem).join("") : renderPanelEmpty();
  }

  function bindImageFallbacks(root) {
    root.querySelectorAll(".wp-media img, .wl-image img").forEach((image) => {
      syncProductImageRatio(image);
      if (image.__wishlistedImageFallbackBound) {
        return;
      }
      image.addEventListener("load", () => syncProductImageRatio(image));
      image.addEventListener("error", () => {
        const placeholderClass = image.closest(".wl-image")
          ? "wl-image-placeholder"
          : "wp-image-placeholder";
        image.replaceWith(svgElementFromHtml(lucideImageIcon(placeholderClass)));
      });
      image.__wishlistedImageFallbackBound = true;
    });
  }

  function syncProductImageRatio(image) {
    const media = image.closest(".wp-media");
    if (!media || !image.naturalWidth || !image.naturalHeight) {
      return;
    }

    const ratio = clamp(image.naturalWidth / image.naturalHeight, 0.62, 1.7);
    media.style.setProperty("--wp-media-ratio", ratio.toFixed(4));
  }

  function svgElementFromHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    return template.content.firstElementChild || document.createElement("span");
  }

  function renderPanelEmpty() {
    const hasQuery = Boolean(panelState.searchQuery);
    const isEmptyLibrary = !panelState.items.length && !hasQuery;

    return `
      <div class="wp-empty">
        <div>
          ${isEmptyLibrary ? contourTshirtIcon() : ""}
          <strong>${hasQuery ? "No matches" : "Start saving to see your items"}</strong>
          <span>${hasQuery ? "Try another name, category, or source." : "You have 0 items now."}</span>
        </div>
      </div>
    `;
  }

  function bindPanelEvents(root) {
    const shell = root.querySelector(".wp-shell");
    if (!shell) {
      return;
    }

    bindImageFallbacks(root);

    root.querySelector("[data-panel-search]")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      panelState.searchOpen = true;
      if (panelState.searchOpen) {
        panelState.settingsOpen = false;
      }
      renderWishlistPanel();
    });
    root.querySelector("[data-panel-settings]")?.addEventListener("click", () => {
      panelState.settingsOpen = !panelState.settingsOpen;
      if (panelState.settingsOpen) {
        panelState.searchOpen = false;
      }
      renderWishlistPanel();
    });
    root.querySelector("[data-search]")?.addEventListener("input", (event) => {
      panelState.searchQuery = event.target.value;
      renderPanelItemsOnly(root);
    });
    root.querySelector(".wp-settings")?.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-select-trigger]");
      if (trigger) {
        event.preventDefault();
        toggleSettingsSelect(trigger);
        return;
      }

      const currencyButton = event.target.closest("[data-summary-currency]");
      if (currencyButton) {
        event.preventDefault();
        const currency = cleanText(currencyButton.dataset.summaryCurrency).toUpperCase();
        if (isSummaryCurrency(currency)) {
          safelyRunPanelAction(() =>
            savePanelSettings({ summaryCurrency: currency }, { rerender: false })
          );
        }
        return;
      }

      const backgroundButton = event.target.closest("[data-background-theme]");
      if (backgroundButton) {
        event.preventDefault();
        const backgroundTheme = cleanText(backgroundButton.dataset.backgroundTheme).toLowerCase();
        if (isBackgroundTheme(backgroundTheme)) {
          safelyRunPanelAction(() =>
            savePanelSettings({ backgroundTheme }, { rerender: false })
          );
        }
        return;
      }

      if (!event.target.closest("[data-select-root]")) {
        closeSettingsSelects(event.currentTarget);
      }
    });
    root.querySelector(".wp-filters")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) {
        return;
      }
      panelState.searchOpen = false;
      panelState.activeCategory = button.dataset.category;
      renderWishlistPanel();
    });
    root.querySelector(".wp-items")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-id]");
      if (!button) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      safelyRunPanelAction(() => removePanelItem(button.dataset.removeId));
    });
    root.querySelector("[data-category-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = root.querySelector("[data-category-input]");
      const label = cleanCategoryLabel(input?.value);
      if (!label) {
        return;
      }
      input.value = "";
      safelyRunPanelAction(() =>
        savePanelCategories([
          ...panelState.categories,
          { id: uniquePanelCategoryId(label), label }
        ])
      );
    });
    root.querySelector(".wp-category-list")?.addEventListener("change", (event) => {
      const input = event.target.closest("[data-category-label]");
      if (!input) {
        return;
      }
      const id = input.dataset.categoryLabel;
      safelyRunPanelAction(() =>
        savePanelCategories(
          panelState.categories.map((category) =>
            category.id === id
              ? { ...category, label: cleanCategoryLabel(input.value) || category.label }
              : category
          )
        )
      );
    });
    root.querySelector(".wp-category-list")?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-category]");
      if (!button) {
        return;
      }
      const nextCategories = panelState.categories.filter(
        (category) => category.id !== button.dataset.removeCategory
      );
      safelyRunPanelAction(() =>
        savePanelCategories(nextCategories.length ? nextCategories : DEFAULT_CATEGORIES)
      );
    });
    root.querySelector("[data-reset-categories]")?.addEventListener("click", () => {
      safelyRunPanelAction(() => savePanelCategories(DEFAULT_CATEGORIES));
    });
    if (!root.__wishlistedPanelKeydownBound) {
      root.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeWishlistPanel();
        }
      });
      root.__wishlistedPanelKeydownBound = true;
    }

    if (!root.__wishlistedPanelClickawayBound) {
      root.addEventListener("click", (event) => {
        const target = event.target;
        if (target.closest?.(".wp-inline-search") || target.closest?.("[data-panel-search]")) {
          return;
        }

        if (panelState.searchOpen) {
          panelState.searchOpen = false;
          renderWishlistPanel();
          return;
        }

        if (target.closest?.(".wp-popover") || target.closest?.("[data-panel-settings]")) {
          return;
        }

        if (panelState.settingsOpen) {
          panelState.settingsOpen = false;
          renderWishlistPanel();
        }
      });
      root.__wishlistedPanelClickawayBound = true;
    }
  }

  function toggleSettingsSelect(trigger) {
    const selectRoot = trigger.closest("[data-select-root]");
    const menu = selectRoot?.querySelector(".wp-select-menu");
    if (!selectRoot || !menu) {
      return;
    }

    const willOpen = menu.hidden;
    closeSettingsSelects(selectRoot.closest(".wp-settings") || document, selectRoot);
    menu.hidden = !willOpen;
    trigger.setAttribute("aria-expanded", String(willOpen));
  }

  function closeSettingsSelects(scope, exceptRoot) {
    scope.querySelectorAll?.("[data-select-root]").forEach((selectRoot) => {
      if (selectRoot === exceptRoot) {
        return;
      }
      selectRoot.querySelector(".wp-select-menu")?.setAttribute("hidden", "");
      selectRoot.querySelector("[data-select-trigger]")?.setAttribute("aria-expanded", "false");
    });
  }

  function focusPanelSearch(root) {
    const search = root.querySelector("[data-search]");
    if (search && panelState.searchOpen) {
      window.requestAnimationFrame(() => {
        try {
          search.focus({ preventScroll: true });
          search.setSelectionRange(search.value.length, search.value.length);
        } catch {
          search.focus();
        }
      });
    }
  }

  async function removePanelItem(id) {
    panelState.items = panelState.items.filter((item) => normalizePanelItem(item).id !== id);
    await setLocalStorageValue(STORAGE_KEY, panelState.items);
    renderWishlistPanel();
  }

  function safelyRunPanelAction(action) {
    Promise.resolve()
      .then(action)
      .catch((error) => {
        try {
          showErrorOverlay(error);
        } catch {
          removeStaleExtensionRoots();
        }
      });
  }

  async function savePanelCategories(nextCategories) {
    panelState.categories = normalizeCategories(nextCategories);
    if (
      panelState.activeCategory !== "all" &&
      !hasCategory(panelState.categories, panelState.activeCategory)
    ) {
      panelState.activeCategory = "all";
    }
    await setLocalStorageValue(CATEGORY_STORAGE_KEY, panelState.categories);
    renderWishlistPanel();
  }

  async function savePanelSettings(nextSettings, options = {}) {
    const settings = normalizePanelSettings({
      summaryCurrency: panelState.summaryCurrency,
      backgroundTheme: panelState.backgroundTheme,
      ...nextSettings
    });
    panelState.summaryCurrency = settings.summaryCurrency;
    panelState.summaryRate = fallbackSummaryRate(settings.summaryCurrency);
    panelState.backgroundTheme = settings.backgroundTheme;
    await setLocalStorageValue(SETTINGS_STORAGE_KEY, settings);
    if (options.rerender === false) {
      syncPanelSettingsControls();
      renderPanelSummaryOnly();
      refreshPanelSummaryRate();
      return;
    }

    renderWishlistPanel();
  }

  function normalizePanelItem(item) {
    const url = normalizeUrl(item.url || location.href);
    const sourceDomain = item.sourceDomain || sourceDomainFromUrl(url);
    const price = normalizePanelPrice(item);
    const rawTitle = cleanText(item.title);
    const rawBrand = cleanText(item.brand);
    const shouldSwapBrandTitle = looksLikeProductName(rawBrand) && isBrandLikeLine(rawTitle);
    const title = shouldSwapBrandTitle ? rawBrand : rawTitle;
    const brand = shouldSwapBrandTitle ? rawTitle : rawBrand;
    const cleanBrand = cleanBrandName(brand) || sourceNameFromUrl(url);

    return {
      ...item,
      id: item.id || productId(url),
      url,
      title: cleanProductTitle(title, cleanBrand, url) || "Saved Product",
      brand: cleanBrand,
      category: item.category || panelState.categories[0]?.id || "tops",
      sourceDomain,
      faviconUrl: item.faviconUrl || faviconUrlFromUrl(url),
      price
    };
  }

  function normalizePanelPrice(item) {
    const storedPrice = item.price || {};
    const parsed = normalizePrice({
      amount: storedPrice.amount ?? item.priceAmount,
      currency: storedPrice.currency ?? item.currency,
      text: storedPrice.originalText ?? item.priceText,
      compareAtAmount: storedPrice.compareAtAmount ?? item.compareAtPriceAmount,
      compareAtText: storedPrice.compareAtText ?? item.compareAtPriceText
    });
    const rubAmount =
      storedPrice.rubAmount ??
      item.rubPriceAmount ??
      convertToRubSync(parsed.amount, parsed.currency);
    const rubText =
      storedPrice.rubText ||
      item.rubPriceText ||
      (Number.isFinite(rubAmount) ? formatRubPrice(rubAmount) : "");

    return {
      amount: parsed.amount,
      currency: parsed.currency,
      originalText: parsed.originalText,
      compareAtAmount: parsed.compareAtAmount,
      compareAtText: parsed.compareAtText,
      isSale: parsed.isSale,
      rubAmount,
      rubText
    };
  }

  function convertToRubSync(amount, currency) {
    const code = cleanText(currency).toUpperCase();
    const rate = DEFAULT_RUB_RATES[code];
    if (!Number.isFinite(amount) || !Number.isFinite(rate)) {
      return undefined;
    }

    return Math.round(amount * rate);
  }

  function renderPanelSummaryOnly() {
    const root = document.getElementById("wishlisted-panel-root")?.shadowRoot;
    const total = root?.querySelector(".wp-total");
    const count = root?.querySelector(".wp-count");
    if (!total || !count) {
      return;
    }

    const displayItems = panelState.items.map(normalizePanelItem);
    count.textContent = `${panelState.items.length} ${panelState.items.length === 1 ? "item" : "items"}`;
    total.textContent = formatPanelSummaryTotal(displayItems, panelState.summaryCurrency);
  }

  function syncPanelSettingsControls() {
    const root = document.getElementById("wishlisted-panel-root")?.shadowRoot;
    if (!root) {
      return;
    }

    const shell = root.querySelector(".wp-shell");
    if (shell) {
      backgroundThemeOptions().forEach((theme) => {
        shell.classList.toggle(`wp-theme-${theme.id}`, theme.id === panelState.backgroundTheme);
      });
    }

    syncPanelSelectControl(root, {
      selector: "[data-summary-currency]",
      datasetKey: "summaryCurrency",
      value: panelState.summaryCurrency,
      label: panelState.summaryCurrency,
      meta: currencySymbol(panelState.summaryCurrency)
    });

    const backgroundLabel =
      backgroundThemeOptions().find((theme) => theme.id === panelState.backgroundTheme)?.label ||
      panelState.backgroundTheme;
    syncPanelSelectControl(root, {
      selector: "[data-background-theme]",
      datasetKey: "backgroundTheme",
      value: panelState.backgroundTheme,
      label: backgroundLabel
    });
  }

  function syncPanelSelectControl(root, { selector, datasetKey, value, label, meta = "" }) {
    const buttons = Array.from(root.querySelectorAll(selector));
    const selectRoot = buttons[0]?.closest("[data-select-root]");
    if (!selectRoot) {
      return;
    }

    const trigger = selectRoot.querySelector("[data-select-trigger]");
    const valueNode = selectRoot.querySelector(".wp-select-value");
    const menu = selectRoot.querySelector(".wp-select-menu");

    if (valueNode) {
      valueNode.innerHTML = `
        <span>${escapeHtml(label)}</span>
        ${meta ? `<span class="wp-select-symbol">${escapeHtml(meta)}</span>` : ""}
      `;
    }

    buttons.forEach((button) => {
      const isSelected = cleanText(button.dataset[datasetKey]) === cleanText(value);
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-checked", String(isSelected));
      const checkSlot = button.querySelector(".wp-select-check-slot");
      if (checkSlot) {
        checkSlot.innerHTML = isSelected ? lucideCheckIcon("wp-select-check") : "";
      }
    });

    trigger?.setAttribute("aria-expanded", "false");
    menu?.setAttribute("hidden", "");
  }

  function refreshPanelSummaryRate() {
    const currency = cleanText(panelState.summaryCurrency).toUpperCase();
    const currentRate = panelState.summaryRate;
    if (!panelState.open || !currency || panelState.summaryRateLoading === currency) {
      return;
    }

    if (
      currentRate?.currency === currency &&
      Number.isFinite(currentRate.value) &&
      Date.now() - currentRate.updatedAt < RATE_MAX_AGE_MS
    ) {
      return;
    }

    panelState.summaryRateLoading = currency;
    getRubRate(currency)
      .then((rate) => {
        if (!panelState.open || panelState.summaryCurrency !== currency) {
          return;
        }

        const fallbackRate = DEFAULT_RUB_RATES[currency];
        panelState.summaryRate = {
          currency,
          value: Number.isFinite(rate.value) ? rate.value : fallbackRate,
          source: rate.source || "fallback",
          updatedAt: rate.updatedAt || Date.now()
        };
        renderPanelSummaryOnly();
      })
      .catch(() => {
        const fallbackRate = DEFAULT_RUB_RATES[currency];
        panelState.summaryRate = {
          currency,
          value: fallbackRate,
          source: "fallback",
          updatedAt: Date.now()
        };
        renderPanelSummaryOnly();
      })
      .finally(() => {
        if (panelState.summaryRateLoading === currency) {
          panelState.summaryRateLoading = "";
        }
      });
  }

  function fallbackSummaryRate(currency) {
    const code = isSummaryCurrency(currency)
      ? cleanText(currency).toUpperCase()
      : DEFAULT_SETTINGS.summaryCurrency;
    return {
      currency: code,
      value: DEFAULT_RUB_RATES[code],
      source: "fallback",
      updatedAt: 0
    };
  }

  function panelItemMatchesSearch(item) {
    const query = cleanText(panelState.searchQuery).toLowerCase();
    if (!query) {
      return true;
    }

    return [
      item.title,
      item.brand,
      item.category,
      categoryLabelFor(panelState.categories, item.category),
      item.sourceDomain,
      item.price.originalText,
      item.price.rubText
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  }

  function uniquePanelCategoryId(label) {
    const base = slugify(label) || "category";
    let id = base;
    let index = 2;

    while (
      hasCategory(panelState.categories, id) ||
      id === "all" ||
      id === "auto"
    ) {
      id = `${base}-${index}`;
      index += 1;
    }

    return id;
  }

  function lucideSearchIcon(className = "wp-lucide") {
    return `
      <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m21 21-4.34-4.34"/>
        <circle cx="11" cy="11" r="8"/>
      </svg>
    `;
  }

  function lucideSettingsIcon() {
    return `
      <svg class="wp-lucide" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.32-1.915"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    `;
  }

  function lucideChevronDownIcon(className = "wp-lucide") {
    return `
      <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    `;
  }

  function lucideCheckIcon(className = "wp-lucide") {
    return `
      <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    `;
  }

  function lucideLinkIcon(className = "wp-lucide") {
    return `
      <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83a5 5 0 0 0-7.07-7.07L11.5 4.43"/>
        <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.83a5 5 0 1 0 7.07 7.07l1.33-1.33"/>
      </svg>
    `;
  }

  function lucidePercentIcon(className = "wp-lucide") {
    return `
      <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <line x1="19" y1="5" x2="5" y2="19"/>
        <circle cx="6.5" cy="6.5" r="2.5"/>
        <circle cx="17.5" cy="17.5" r="2.5"/>
      </svg>
    `;
  }

  function lucideImageIcon(className = "wp-lucide") {
    return `
      <svg class="${escapeAttribute(className)}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>
      </svg>
    `;
  }

  function contourTshirtIcon() {
    return `
      <svg class="wp-empty-tee" viewBox="0 0 140 140" fill="none" aria-hidden="true">
        <path d="M50 26 34 31 18 54l22 14 8-12v56h44V56l8 12 22-14-16-23-16-5c-4 9-11 14-20 14s-16-5-20-14Z"/>
        <path d="M48 112h44"/>
        <path d="M48 57c7 4 14 6 22 6s15-2 22-6"/>
        <path d="M57 31c3 7 7 10 13 10s10-3 13-10"/>
      </svg>
    `;
  }

  function extractProduct(context) {
    const jsonLdProduct = findJsonLdProduct();
    const microdataProduct = extractFromMicrodata();
    const embeddedProduct = extractFromEmbeddedJson();
    const commonSelectorProduct = extractFromCommonSelectors();
    const contextualProduct = extractFromContext(context);
    const metaProduct = extractFromMeta(context);
    const pagePriceProduct = extractFromPagePrice();
    const pageUrl = normalizeUrl(location.href);
    const hasClickedProduct =
      contextualProduct.fromContext &&
      (contextualProduct.url || contextualProduct.title || contextualProduct.imageUrl);
    const contextUrl = contextualProduct.url ? normalizeUrl(contextualProduct.url) : "";
    const basePageProductSources = [
      commonSelectorProduct,
      microdataProduct,
      jsonLdProduct,
      embeddedProduct,
      metaProduct,
      pagePriceProduct
    ];
    const hasPageProductDetails = basePageProductSources.some(
      (source) => source.title || source.priceAmount || source.priceText || source.imageUrl
    );
    const currentPageIsProduct = isProductLikeUrl(pageUrl) && hasPageProductDetails;
    const pageProductSources = currentPageIsProduct
      ? [
          jsonLdProduct,
          metaProduct,
          microdataProduct,
          commonSelectorProduct,
          embeddedProduct,
          pagePriceProduct
        ]
      : basePageProductSources;
    const contextLinkUrl = context.linkUrl ? normalizeUrl(context.linkUrl) : "";
    const clickedDifferentProduct =
      !currentPageIsProduct &&
      hasClickedProduct &&
      contextUrl &&
      !sameProductPageUrl(contextUrl, pageUrl) &&
      isProductLikeUrl(contextUrl);
    const linkedDifferentProduct =
      !currentPageIsProduct &&
      contextLinkUrl &&
      !sameProductPageUrl(contextLinkUrl, pageUrl) &&
      isProductLikeUrl(contextLinkUrl);
    const isProductPageContext =
      currentPageIsProduct ||
      (!clickedDifferentProduct &&
        !linkedDifferentProduct &&
        (isProductLikeUrl(pageUrl) || hasPageProductDetails));
    const sources = hasClickedProduct && !isProductPageContext
      ? [contextualProduct]
      : [
          jsonLdProduct,
          microdataProduct,
          embeddedProduct,
          commonSelectorProduct,
          metaProduct,
          pagePriceProduct
        ];
    const detailSources = isProductPageContext ? pageProductSources : sources;
    const urlSources = isProductPageContext ? [contextualProduct, ...pageProductSources] : sources;
    const pageImageSources = [
      jsonLdProduct,
      metaProduct,
      commonSelectorProduct,
      microdataProduct,
      embeddedProduct
    ];
    const imageSources = isProductPageContext
      ? [...pageImageSources, contextualProduct]
      : hasClickedProduct
        ? [contextualProduct]
        : sources;
    const url = isProductPageContext ? pageUrl : firstValue(urlSources, "url") || pageUrl;
    const price = normalizePrice({
      amount: firstValue(detailSources, "priceAmount"),
      currency: firstValue(detailSources, "currency"),
      text: firstValue(detailSources, "priceText"),
      compareAtAmount: firstValue(detailSources, "compareAtPriceAmount"),
      compareAtText: firstValue(detailSources, "compareAtPriceText")
    });

    return compactObject({
      source: sourceNameFromUrl(url),
      sourceDomain: sourceDomainFromUrl(url),
      faviconUrl: faviconUrlFromUrl(url),
      url,
      title: cleanProductTitle(
        firstValue(detailSources, "title") || contextualProduct.title || document.title,
        firstValue(detailSources, "brand") || contextualProduct.brand,
        url
      ),
      brand: cleanBrandName(firstValue(detailSources, "brand") || contextualProduct.brand) || sourceNameFromUrl(url),
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale,
      imageUrl: firstValue(imageSources, "imageUrl"),
      rawCategory: firstValue(detailSources, "rawCategory") || contextualProduct.rawCategory,
      fromProductPage: isProductPageContext
    });
  }

  function findJsonLdProduct() {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]')
    );
    const products = [];

    for (const script of scripts) {
      const raw = script.textContent?.trim();
      if (!raw) {
        continue;
      }

      try {
        collectProducts(JSON.parse(raw), products);
      } catch {
        continue;
      }
    }

    const product = products[0];
    if (!product) {
      return {};
    }

    const offers = Array.isArray(product.offers)
      ? product.offers
      : [product.offers].filter(Boolean);
    const offer = offers.find((candidate) => offerMatchesCurrentUrl(candidate)) || offers[0] || {};
    const image = Array.isArray(product.image) ? product.image[0] : product.image;
    const brand =
      typeof product.brand === "string"
        ? product.brand
        : product.brand?.name || product.manufacturer?.name;

    return compactObject({
      title: cleanText(product.name),
      brand: cleanBrandName(brand),
      url: normalizeUrl(toAbsoluteUrl(product.url)),
      priceText: formatOriginalPrice(offer.price, offer.priceCurrency),
      priceAmount: numericPrice(offer.price),
      currency: cleanText(offer.priceCurrency),
      compareAtPriceText: formatOriginalPrice(offer.highPrice || offer.priceSpecification?.price, offer.priceCurrency),
      compareAtPriceAmount: numericPrice(offer.highPrice || offer.priceSpecification?.price),
      imageUrl: toAbsoluteUrl(image),
      rawCategory: cleanText(product.category)
    });
  }

  function findJsonLdProductInDocument(doc, productUrl) {
    const products = [];

    Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).forEach((script) => {
      const raw = script.textContent?.trim();
      if (!raw) {
        return;
      }

      try {
        collectProducts(JSON.parse(raw), products);
      } catch {
        // Ignore malformed merchant JSON-LD.
      }
    });

    const product = products.find((candidate) => productMatchesUrl(candidate, productUrl)) || products[0];
    if (!product) {
      return {};
    }

    const offers = Array.isArray(product.offers)
      ? product.offers
      : [product.offers].filter(Boolean);
    const offer = offers.find((candidate) => offerMatchesUrl(candidate, productUrl)) || offers[0] || {};
    const image = Array.isArray(product.image) ? product.image[0] : product.image;
    const brand =
      typeof product.brand === "string"
        ? product.brand
        : product.brand?.name || product.manufacturer?.name;

    return compactObject({
      title: cleanProductTitle(product.name, brand, productUrl),
      brand: cleanBrandName(brand),
      url: normalizeUrl(toAbsoluteUrlFor(product.url || productUrl, productUrl)),
      priceText: formatOriginalPrice(offer.price, offer.priceCurrency),
      priceAmount: numericPrice(offer.price),
      currency: cleanText(offer.priceCurrency),
      compareAtPriceText: formatOriginalPrice(offer.highPrice || offer.priceSpecification?.price, offer.priceCurrency),
      compareAtPriceAmount: numericPrice(offer.highPrice || offer.priceSpecification?.price),
      imageUrl: toAbsoluteUrlFor(image, productUrl),
      rawCategory: cleanText(product.category)
    });
  }

  function productMatchesUrl(product, productUrl) {
    return product?.url && sameProductPageUrl(toAbsoluteUrlFor(product.url, productUrl), productUrl);
  }

  function extractMetaProductFromDocument(doc, productUrl) {
    const meta = (property) =>
      doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`)?.content || "";
    const title =
      meta("og:title") ||
      meta("twitter:title") ||
      doc.querySelector("h1")?.textContent ||
      doc.title;
    const brand =
      meta("product:brand") ||
      meta("twitter:data1") ||
      doc.querySelector('[data-component*="Brand" i]')?.textContent;
    const priceText =
      meta("product:price:amount") ||
      meta("og:price:amount") ||
      meta("twitter:data2");
    const currency =
      meta("product:price:currency") ||
      meta("og:price:currency") ||
      currencyFromText(priceText);
    const price = normalizePrice({ text: priceText, currency });

    return compactObject({
      title: cleanProductTitle(stripPriceFromText(title), brand, productUrl),
      brand: cleanBrandName(brand),
      url: normalizeUrl(toAbsoluteUrlFor(meta("og:url") || productUrl, productUrl)),
      imageUrl: toAbsoluteUrlFor(meta("og:image") || meta("twitter:image"), productUrl),
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale
    });
  }

  function extractPriceFromFetchedDocument(doc) {
    const lines = cleanText(doc.body?.textContent || "")
      .split(/(?<=[^\d])\s+(?=[^\d])|\n+/)
      .map(cleanText)
      .filter((line) => line.length <= 96)
      .filter((line) => looksLikePrice(line) && !/shipping|delivery|returns|free/i.test(line))
      .slice(0, 40);
    const price = findBestPrice(lines);

    return compactObject({
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale
    });
  }

  function collectProducts(node, products) {
    if (!node) {
      return;
    }

    if (Array.isArray(node)) {
      for (const child of node) {
        collectProducts(child, products);
      }
      return;
    }

    if (typeof node !== "object") {
      return;
    }

    const type = node["@type"];
    const types = Array.isArray(type) ? type : [type];
    if (types.some((value) => String(value).toLowerCase() === "product")) {
      products.push(node);
    }

    for (const value of Object.values(node)) {
      if (value && typeof value === "object") {
        collectProducts(value, products);
      }
    }
  }

  function offerMatchesCurrentUrl(offer) {
    return offerMatchesUrl(offer, location.href);
  }

  function offerMatchesUrl(offer, targetUrl) {
    const offerUrl = offer?.url;
    if (!offerUrl) {
      return false;
    }

    try {
      const current = new URL(targetUrl, location.href);
      const candidate = new URL(offerUrl, location.href);
      const currentVariant = current.searchParams.get("variant");
      const candidateVariant = candidate.searchParams.get("variant");
      if (currentVariant && candidateVariant) {
        return currentVariant === candidateVariant;
      }
    } catch {
      return false;
    }

    return sameProductPageUrl(offerUrl, targetUrl);
  }

  function extractFromMicrodata() {
    const product =
      document.querySelector('[itemscope][itemtype*="schema.org/Product" i]') ||
      document.querySelector('[itemtype*="schema.org/Product" i]');

    if (!product) {
      return {};
    }

    const title =
      itemProp(product, "name") ||
      product.querySelector("h1, h2, h3")?.textContent;
    const brandNode = product.querySelector('[itemprop="brand"]');
    const brand =
      itemProp(product, "brand") ||
      itemProp(brandNode, "name") ||
      brandNode?.textContent;
    const image =
      itemProp(product, "image") ||
      bestImageFromElement(product.querySelector("img"));
    const priceText =
      itemProp(product, "price") ||
      product.querySelector('[itemprop="price"]')?.textContent ||
      findVisiblePriceText(product);
    const currency =
      itemProp(product, "priceCurrency") ||
      currencyFromText(priceText) ||
      findVisibleCurrencyCode(product);
    const price = normalizePrice({ text: priceText, currency });

    return compactObject({
      title: cleanProductTitle(title, brand, itemProp(product, "url") || location.href),
      brand: cleanBrandName(brand),
      url: normalizeUrl(
        itemProp(product, "url") ||
          product.querySelector("a[href]")?.href ||
          document.querySelector('link[rel="canonical"]')?.href ||
          location.href
      ),
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale,
      imageUrl: toAbsoluteUrl(image),
      rawCategory: itemProp(product, "category")
    });
  }

  function extractFromCommonSelectors() {
    const title = textFromFirst([
      '[data-testid*="product-title" i]',
      '[data-test*="product-title" i]',
      '[data-qa*="product-title" i]',
      '[class*="product"][class*="title" i]',
      '[class*="title"][class*="product" i]',
      '.product__title',
      '.product-title',
      'h1[itemprop="name"]',
      "main h1",
      "h1"
    ]);
    const brand = textFromFirst([
      '[data-testid*="brand" i]',
      '[data-test*="brand" i]',
      '[data-qa*="brand" i]',
      '[class*="product"][class*="brand" i]',
      '[class*="brand"][class*="product" i]',
      ".product__vendor",
      ".product-vendor"
    ]);
    const priceText = textFromFirst([
      '[data-testid*="price" i]',
      '[data-test*="price" i]',
      '[data-qa*="price" i]',
      '[itemprop="price"]',
      '[class*="price" i]',
      '[class*="amount" i]'
    ]) || findVisiblePriceText(document.body);
    const currency = currencyFromText(priceText) || findVisibleCurrencyCode(document.body);
    const price = normalizePrice({ text: priceText, currency });
    const image =
      bestImageFromElement(
        firstElement([
          '[data-testid*="product" i] img',
          '[class*="product" i] img',
          '[class*="gallery" i] img',
          '[class*="media" i] img',
          "main img"
        ])
      ) ||
      metaContent("og:image") ||
      metaContent("twitter:image");

    return compactObject({
      title: cleanProductTitle(title, brand, location.href),
      brand: cleanBrandName(brand),
      url: normalizeUrl(
        document.querySelector('link[rel="canonical"]')?.href ||
          metaContent("og:url") ||
          location.href
      ),
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale,
      imageUrl: toAbsoluteUrl(image),
      rawCategory: textFromFirst([
        '[data-testid*="breadcrumb" i]',
        ".breadcrumb",
        '[aria-label*="breadcrumb" i]'
      ])
    });
  }

  function extractFromPagePrice() {
    const scope = document.querySelector("main") || document.body || document;
    const priceText = findVisiblePriceText(scope);
    const currency =
      currencyFromText(priceText) ||
      findVisibleCurrencyCode(scope);
    const price = normalizePrice({ text: priceText, currency });

    return compactObject({
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale
    });
  }

  function textFromFirst(selectors, scope = document) {
    const element = firstElement(selectors, scope);
    return cleanText(
      element?.getAttribute("content") ||
        element?.getAttribute("aria-label") ||
        element?.textContent
    );
  }

  function firstElement(selectors, scope = document) {
    for (const selector of selectors) {
      const element = scope.querySelector?.(selector);
      if (element) {
        return element;
      }
    }

    return null;
  }

  function extractFromEmbeddedJson() {
    const scripts = Array.from(
      document.querySelectorAll(
        'script[type="application/json"], script[type="application/ld+json"], script[id*="__NEXT_DATA__"], script[id*="__NUXT_DATA__"]'
      )
    );
    const candidates = [];

    for (const script of scripts) {
      const raw = script.textContent?.trim();
      if (!raw || raw.length > 1_200_000) {
        continue;
      }

      try {
        collectProductLikeObjects(JSON.parse(raw), candidates, 0);
      } catch {
        continue;
      }
    }

    const candidate = candidates
      .map(productLikeToItem)
      .filter((item) => item.title || item.priceText || item.imageUrl)
      .sort((a, b) => productScore(b) - productScore(a))[0];

    return candidate || {};
  }

  function collectProductLikeObjects(node, candidates, depth) {
    if (!node || depth > 8 || candidates.length > 60) {
      return;
    }

    if (Array.isArray(node)) {
      for (const child of node.slice(0, 120)) {
        collectProductLikeObjects(child, candidates, depth + 1);
      }
      return;
    }

    if (typeof node !== "object") {
      return;
    }

    if (looksLikeProductObject(node)) {
      candidates.push(node);
    }

    for (const value of Object.values(node)) {
      if (value && typeof value === "object") {
        collectProductLikeObjects(value, candidates, depth + 1);
      }
    }
  }

  function looksLikeProductObject(object) {
    const keys = Object.keys(object).map((key) => key.toLowerCase());
    const hasTitle = keys.some((key) =>
      ["title", "name", "producttitle", "displayname"].includes(key)
    );
    const hasPrice = keys.some((key) =>
      key.includes("price") || key.includes("amount")
    );
    const hasImage = keys.some((key) =>
      key.includes("image") || key.includes("photo") || key.includes("media")
    );
    const hasUrl = keys.some((key) =>
      ["url", "href", "handle", "slug", "path"].includes(key)
    );

    return hasTitle && (hasPrice || hasImage || hasUrl);
  }

  function productLikeToItem(object) {
    const title =
      object.title ||
      object.name ||
      object.productTitle ||
      object.displayName ||
      object.fullName;
    const brand =
      object.brand?.name ||
      object.brand ||
      object.vendor ||
      object.manufacturer?.name ||
      object.designerName;
    const priceValue = productLikePriceValue(object);
    const compareAtPriceValue = compareAtPriceValueFromProductLike(object);
    const currency = currencyFromProductLike(object, priceValue, compareAtPriceValue);
    const price = normalizePrice({
      amount: normalizeRawProductPrice(priceValue),
      currency,
      text: typeof priceValue === "string" ? priceValue : undefined,
      compareAtAmount: normalizeRawProductPrice(compareAtPriceValue),
      compareAtText: typeof compareAtPriceValue === "string" ? compareAtPriceValue : undefined
    });
    const image =
      imageFromProductLike(object.image) ||
      imageFromProductLike(object.images) ||
      imageFromProductLike(object.featured_image) ||
      imageFromProductLike(object.featuredImage) ||
      imageFromProductLike(object.media);
    const url =
      object.url ||
      object.href ||
      productUrlFromHandle(object.handle || object.slug || object.path);

    return compactObject({
      title: cleanProductTitle(title, brand, url),
      brand: cleanBrandName(brand),
      url: url ? normalizeUrl(toAbsoluteUrl(url)) : "",
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale,
      imageUrl: toAbsoluteUrl(image),
      rawCategory: cleanText(object.category || object.productType || object.type)
    });
  }

  function compareAtPriceValueFromProductLike(object) {
    return priceScalar(
      object.compare_at_price ??
        object.compareAtPrice ??
        object.originalPrice ??
        object.regularPrice ??
        object.oldPrice ??
        object.wasPrice ??
        object.listPrice ??
        object.retailPrice ??
        object.price?.compare_at_price ??
        object.price?.compareAt ??
        object.price?.compareAtPrice ??
        object.price?.original ??
        object.price?.regular ??
        object.price?.old ??
        object.currentPrice?.compareAt ??
        object.currentPrice?.original ??
        object.prices?.compareAt ??
        object.prices?.original
    );
  }

  function productLikePriceValue(object) {
    return priceScalar(
      object.price ??
        object.salePrice ??
        object.salesPrice ??
        object.currentPrice ??
        object.finalPrice ??
        object.unitPrice ??
        object.priceValue ??
        object.priceFormatted ??
        object.formattedPrice ??
        object.displayPrice ??
        object.minPrice ??
        object.price_min ??
        object.selectedVariant?.price ??
        object.selectedOrFirstAvailableVariant?.price ??
        object.variants?.[0]?.price ??
        object.priceRange?.minVariantPrice ??
        object.priceRange?.minimumVariantPrice ??
        object.priceRange?.min ??
        object.priceRange?.minimum_price?.final_price ??
        object.prices?.current ??
        object.prices?.price ??
        object.prices?.sale ??
        object.offer ??
        object.offers ??
        object.offer?.price ??
        object.offers?.price
    );
  }

  function priceScalar(value) {
    if (value === null || value === undefined) {
      return undefined;
    }

    if (typeof value === "number" || typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        const scalar = priceScalar(entry);
        if (scalar !== undefined) {
          return scalar;
        }
      }
      return undefined;
    }

    if (typeof value !== "object") {
      return undefined;
    }

    return priceScalar(
      value.amount ??
        value.value ??
        value.centAmount ??
        value.cent_amount ??
        value.formatted ??
        value.formattedValue ??
        value.formatted_value ??
        value.text ??
        value.display ??
        value.displayValue ??
        value.price ??
        value.current ??
        value.now ??
        value.gross?.amount ??
        value.net?.amount
    );
  }

  function currencyFromProductLike(object, ...priceValues) {
    const price =
      firstPriceObject(object.price) ||
      firstPriceObject(object.currentPrice) ||
      firstPriceObject(object.finalPrice) ||
      firstPriceObject(object.prices) ||
      firstPriceObject(object.priceRange?.minVariantPrice) ||
      firstPriceObject(object.priceRange?.minimumVariantPrice) ||
      firstPriceObject(object.offer) ||
      firstPriceObject(object.offers) ||
      {};
    const direct =
      object.priceCurrency ||
      object.currencyCode ||
      object.currency ||
      object.currencyIso ||
      price.currencyCode ||
      price.currency ||
      price.priceCurrency ||
      price.currencyIso ||
      price.currency?.code ||
      price.gross?.currencyCode ||
      price.net?.currencyCode;
    const textCurrency = currencyFromText(priceValues.filter(Boolean).join(" "));

    return cleanText(direct || textCurrency || findVisibleCurrencyCode(document.body)).toUpperCase();
  }

  function firstPriceObject(value) {
    if (!value) {
      return null;
    }

    if (Array.isArray(value)) {
      return value.find((entry) => entry && typeof entry === "object") || null;
    }

    return typeof value === "object" ? value : null;
  }

  function productScore(product) {
    const url = product.url ? normalizeUrl(product.url) : "";
    const title = cleanText(product.title);
    return (
      (title ? 4 : 0) +
      (product.priceAmount ? 3 : 0) +
      (product.currency ? 2 : 0) +
      (product.imageUrl ? 2 : 0) +
      (url ? 1 : 0) +
      (url && sameProductPageUrl(url, location.href) ? 10 : 0) +
      (looksLikeDescriptiveTitle(title) ? -6 : 0)
    );
  }

  function imageFromProductLike(value) {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return imageFromProductLike(value[0]);
    }

    return (
      value.src ||
      value.url ||
      value.originalSrc ||
      value.preview_image?.src ||
      value.image?.src ||
      ""
    );
  }

  function productUrlFromHandle(value) {
    const handle = cleanText(value).replace(/^\/+/, "");
    if (!handle) {
      return "";
    }

    if (/^https?:\/\//i.test(handle)) {
      return handle;
    }

    if (handle.includes("/products/")) {
      return `/${handle}`;
    }

    return `/products/${handle}`;
  }

  async function enrichProduct(product) {
    if (hasCompletePageProduct(product)) {
      return product;
    }

    const pageProduct = await fetchProductPageProduct(product);
    if (pageProduct.title || pageProduct.priceText || pageProduct.imageUrl) {
      product = shouldPreferFetchedProduct(product, pageProduct)
        ? mergeProducts([pageProduct, product])
        : mergeProducts([product, pageProduct]);
    }

    const shopifyProduct = await fetchShopifyProduct(product.url);
    if (!shopifyProduct.title && !shopifyProduct.priceText && !shopifyProduct.imageUrl) {
      return product;
    }

    if (shopifyProduct.fromSelectedVariant) {
      return mergeProducts([shopifyProduct, product]);
    }

    return product.fromContext
      ? mergeProducts([product, shopifyProduct])
      : mergeProducts([shopifyProduct, product]);
  }

  function hasCompletePageProduct(product) {
    return Boolean(
      product?.fromProductPage &&
        product.title &&
        product.imageUrl &&
        (product.priceText || Number.isFinite(product.priceAmount))
    );
  }

  function shouldPreferFetchedProduct(product, pageProduct) {
    return Boolean(
      (!product?.priceText && !Number.isFinite(product?.priceAmount) && pageProduct?.priceText) ||
        looksLikeDescriptiveTitle(product?.title) ||
        !product?.title
    );
  }

  async function fetchProductPageProduct(product) {
    if (!needsFetchedProductPage(product)) {
      return {};
    }

    let url;
    try {
      url = new URL(product.url, location.href);
    } catch {
      return {};
    }

    if (!/^https?:$/i.test(url.protocol) || url.origin !== location.origin) {
      return {};
    }

    try {
      const response = await fetch(url.toString(), {
        credentials: "same-origin",
        cache: "force-cache"
      });
      if (!response.ok) {
        return {};
      }

      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      return extractFromFetchedProductPage(doc, url.toString());
    } catch {
      return {};
    }
  }

  function needsFetchedProductPage(product) {
    return Boolean(
      product?.url &&
        (!product.priceText ||
          !Number.isFinite(product.priceAmount) ||
          looksLikeDescriptiveTitle(product.title) ||
          !product.title)
    );
  }

  function extractFromFetchedProductPage(doc, productUrl) {
    const jsonProduct = findJsonLdProductInDocument(doc, productUrl);
    const metaProduct = extractMetaProductFromDocument(doc, productUrl);
    const priceProduct = extractPriceFromFetchedDocument(doc);
    return mergeProducts([jsonProduct, metaProduct, priceProduct]);
  }

  async function fetchShopifyProduct(productUrl) {
    if (!productUrl) {
      return {};
    }

    let url;
    try {
      url = new URL(productUrl, location.href);
    } catch {
      return {};
    }

    const match = url.pathname.match(/\/products\/([^/?#]+)/i);
    if (!match) {
      return {};
    }

    const productJsonUrl = `${url.origin}/products/${match[1]}.js`;

    try {
      const response = await fetch(productJsonUrl, {
        credentials: "omit",
        cache: "force-cache"
      });
      if (!response.ok) {
        return {};
      }

      const data = await response.json();
      return shopifyProductToItem(data, productUrl);
    } catch {
      return {};
    }
  }

  function shopifyProductToItem(product, productUrl) {
    const selectedVariant = selectedShopifyVariant(product, productUrl);
    const currency =
      findVisibleCurrencyCode(document.body) ||
      currencyFromText(findVisiblePriceText(document.body));
    const amount = normalizeRawProductPrice(
      selectedVariant?.price ?? product.price ?? product.price_min
    );
    const compareAtAmount = normalizeRawProductPrice(
      selectedVariant?.compare_at_price ??
        product.compare_at_price ??
        product.compare_at_price_min ??
        product.variants?.find((variant) => variant?.compare_at_price)?.compare_at_price
    );
    const price = normalizePrice({
      amount,
      currency,
      text: amount && currency ? formatOriginalPrice(amount, currency) : undefined,
      compareAtAmount,
      compareAtText: compareAtAmount && currency
        ? formatOriginalPrice(compareAtAmount, currency)
        : undefined
    });
    const image =
      bestShopifyVariantImage(product, selectedVariant) ||
      bestShopifyImage(product.featured_image) ||
      bestShopifyImage(product.images) ||
      bestShopifyImage(product.featuredImage);

    return compactObject({
      title: cleanProductTitle(
        shopifyTitle(product, productUrl, selectedVariant),
        product.vendor,
        productUrl
      ),
      brand: cleanBrandName(product.vendor),
      url: normalizeUrl(productUrl),
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale,
      imageUrl: toAbsoluteUrl(image),
      rawCategory: cleanText(
        [product.type, ...(Array.isArray(product.tags) ? product.tags : [])].join(" ")
      ),
      fromSelectedVariant: Boolean(selectedVariant)
    });
  }

  function selectedShopifyVariant(product, productUrl) {
    const variantId = variantIdFromUrl(productUrl);
    if (!variantId || !Array.isArray(product?.variants)) {
      return null;
    }

    return product.variants.find((variant) => String(variant?.id) === variantId) || null;
  }

  function variantIdFromUrl(productUrl) {
    try {
      return new URL(productUrl, location.href).searchParams.get("variant");
    } catch {
      return "";
    }
  }

  function shopifyTitle(product, productUrl, selectedVariant) {
    const handleTitle = productTitleFromProductUrl(productUrl);
    if (selectedVariant && handleTitle) {
      return handleTitle;
    }

    return product.title || handleTitle;
  }

  function productTitleFromProductUrl(productUrl) {
    try {
      const url = new URL(productUrl, location.href);
      const match = url.pathname.match(/\/products\/([^/?#]+)/i);
      if (!match) {
        return "";
      }

      return decodeURIComponent(match[1])
        .replace(/[-_]+/g, " ")
        .replace(/\s+in\s+([a-z]+)$/i, " $1");
    } catch {
      return "";
    }
  }

  function bestShopifyVariantImage(product, variant) {
    if (!variant) {
      return "";
    }

    const directImage =
      bestShopifyImage(variant.featured_image) ||
      bestShopifyImage(variant.image) ||
      bestShopifyImage(variant.image_url);
    if (directImage) {
      return directImage;
    }

    const imageId = variant.image_id || variant.featured_image?.id;
    if (!imageId) {
      return "";
    }

    const images = [
      ...(Array.isArray(product.images) ? product.images : []),
      product.featured_image,
      product.featuredImage
    ].filter(Boolean);
    const match = images.find((image) => String(image?.id) === String(imageId));
    return bestShopifyImage(match);
  }

  function bestShopifyImage(value) {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.find(Boolean) || "";
    }

    return value.src || value.url || "";
  }

  function normalizeRawProductPrice(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value >= 1000 && Number.isInteger(value) ? value / 100 : value;
    }

    const amount = numericPrice(value);
    if (!Number.isFinite(amount)) {
      return undefined;
    }

    if (looksLikePrice(value)) {
      return amount;
    }

    return amount >= 1000 && !String(value).includes(".") ? amount / 100 : amount;
  }

  function mergeProducts(products) {
    const sources = products.filter(Boolean);
    const price = normalizePrice({
      amount: firstValue(sources, "priceAmount"),
      currency: firstValue(sources, "currency"),
      text: firstValue(sources, "priceText"),
      compareAtAmount: firstValue(sources, "compareAtPriceAmount"),
      compareAtText: firstValue(sources, "compareAtPriceText")
    });
    const url = firstValue(sources, "url") || normalizeUrl(location.href);

    return compactObject({
      source: sourceNameFromUrl(url),
      sourceDomain: sourceDomainFromUrl(url),
      faviconUrl: faviconUrlFromUrl(url),
      url,
      title: cleanProductTitle(
        firstValue(sources, "title") || document.title,
        firstValue(sources, "brand"),
        url
      ),
      brand: cleanBrandName(firstValue(sources, "brand")) || sourceNameFromUrl(url),
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale,
      imageUrl: firstValue(sources, "imageUrl"),
      rawCategory: firstValue(sources, "rawCategory")
    });
  }

  function itemProp(scope, name) {
    if (!scope) {
      return "";
    }

    const element = scope.matches?.(`[itemprop="${name}"]`)
      ? scope
      : scope.querySelector?.(`[itemprop="${name}"]`);

    if (!element) {
      return "";
    }

    return (
      element.getAttribute("content") ||
      element.getAttribute("href") ||
      element.getAttribute("src") ||
      element.textContent ||
      ""
    );
  }

  function extractFromMeta(context) {
    const title =
      metaContent("og:title") ||
      metaContent("twitter:title") ||
      document.querySelector("h1")?.textContent;
    const imageUrl =
      context.srcUrl ||
      metaContent("og:image") ||
      metaContent("twitter:image");
    const priceText =
      metaContent("product:price:amount") ||
      metaContent("og:price:amount") ||
      findVisiblePriceText();
    const currency =
      metaContent("product:price:currency") ||
      metaContent("og:price:currency") ||
      currencyFromText(priceText);
    const price = normalizePrice({ text: priceText, currency });
    const brand =
      metaContent("product:brand") ||
      metaContent("twitter:data1") ||
      document.querySelector('[data-component*="Brand" i]')?.textContent;

    return compactObject({
      title: cleanProductTitle(stripPriceFromText(title), brand, context.linkUrl || location.href),
      brand: cleanBrandName(brand),
      url: normalizeUrl(
        context.linkUrl ||
          document.querySelector('link[rel="canonical"]')?.href ||
          metaContent("og:url") ||
          location.href
      ),
      imageUrl: toAbsoluteUrl(imageUrl),
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale
    });
  }

  function extractFromContext(context) {
    const target = getContextTarget();
    if (!target) {
      return {};
    }

    const initialLink = findClosestProductLink(target) || findParentLink(target);
    const scope = expandProductScopeToDetails(findProductScope(target, initialLink), target);
    const link = findProductLink(target, scope, context, initialLink);
    const image = findProductImage(target, scope);
    const linkUrl = context.linkUrl || link?.href || "";
    const textLines = getTextLines(scope);
    const imageAlt = cleanText(image?.alt);
    const linkText = cleanText(link?.textContent);
    const parsedPrice = findBestPrice(textLines, imageAlt, linkText);
    const brand = findLikelyBrand(textLines, imageAlt, linkText);
    const title =
      findLikelyTitle(textLines, imageAlt, linkText, brand) ||
      imageAlt ||
      linkText ||
      context.selectionText;

    return compactObject({
      fromContext: true,
      title: cleanProductTitle(stripPriceFromText(title), brand, linkUrl || location.href),
      brand: cleanBrandName(brand),
      url: linkUrl ? normalizeUrl(linkUrl) : "",
      imageUrl: bestProductImageUrl(context, image, scope),
      priceText: parsedPrice.originalText,
      priceAmount: parsedPrice.amount,
      currency: parsedPrice.currency,
      compareAtPriceText: parsedPrice.compareAtText,
      compareAtPriceAmount: parsedPrice.compareAtAmount,
      isSale: parsedPrice.isSale
    });
  }

  function findProductScope(target, link) {
    const candidates = [];
    let node = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;

    for (let depth = 0; node && node !== document.body && depth < 9; depth += 1) {
      candidates.push(node);
      node = node.parentElement;
    }

    if (link) {
      let linkNode = link;
      for (let depth = 0; linkNode && linkNode !== document.body && depth < 4; depth += 1) {
        candidates.push(linkNode);
        linkNode = linkNode.parentElement;
      }
    }

    const scored = candidates
      .filter((candidate, index, list) => list.indexOf(candidate) === index)
      .map((candidate) => ({
        node: candidate,
        score: productScopeScore(candidate),
        area: elementArea(candidate)
      }))
      .filter((candidate) => candidate.score >= 4)
      .sort((a, b) => b.score - a.score || a.area - b.area);

    return scored[0]?.node || link?.closest("article, li, div, a") || target.closest?.("article, li, div, a") || target;
  }

  function expandProductScopeToDetails(scope, target) {
    let best = scope || target;
    let bestScore = productDetailScore(best);
    let node = best?.parentElement;
    const maxArea = Math.max(1, window.innerWidth * window.innerHeight * 0.5);

    for (let depth = 0; node && node !== document.body && depth < 5; depth += 1) {
      const area = elementArea(node);
      if (area > maxArea) {
        break;
      }

      const score = productDetailScore(node);
      if (score > bestScore) {
        best = node;
        bestScore = score;
      }

      node = node.parentElement;
    }

    return best;
  }

  function productDetailScore(element) {
    if (!element) {
      return 0;
    }

    const lines = getTextLines(element);
    const text = lines.join(" ");
    let score = productScopeScore(element);

    if (findBestPrice(lines).amount) score += 10;
    if (lines.some(looksLikeProductName)) score += 4;
    if (lines.some(isBrandLikeLine)) score += 2;
    if (looksLikeDescriptiveTitle(text)) score -= 6;
    if (text.length > 700) score -= 8;

    return score;
  }

  function productScopeScore(element) {
    if (!element?.querySelectorAll) {
      return 0;
    }

    const text = getTextLines(element).join(" ");
    const linkCount = element.querySelectorAll("a[href]").length;
    const imageCount = element.querySelectorAll("img, picture, source").length;
    const hasProductLink = Array.from(element.querySelectorAll("a[href]")).some((link) =>
      isProductLikeUrl(link.href)
    );
    const className = String(element.className || "");
    let score = 0;

    if (element.matches("article, li, a")) score += 1;
    if (/product|card|item|catalog|tile|goods/i.test(className)) score += 3;
    if (hasProductLink || isProductLikeUrl(element.href)) score += 4;
    if (imageCount > 0) score += 2;
    if (looksLikePrice(text)) score += 2;
    if (text.length >= 8 && text.length <= 420) score += 1;
    if (linkCount > 3) score -= 3;
    if (imageCount > 4) score -= 3;
    if (text.length > 1000) score -= 4;
    if (elementArea(element) > window.innerWidth * window.innerHeight * 0.45) score -= 5;

    return score;
  }

  function elementArea(element) {
    const rect = element?.getBoundingClientRect?.();
    return rect ? Math.max(0, rect.width) * Math.max(0, rect.height) : Number.MAX_SAFE_INTEGER;
  }

  function getContextTarget() {
    if (lastContextTarget?.isConnected) {
      return lastContextTarget;
    }

    return document.elementsFromPoint(lastContextPoint.x, lastContextPoint.y)
      .find((element) => element && element !== document.documentElement && element !== document.body);
  }

  function findClosestProductLink(target) {
    const closestLinks = [];
    let node = target.nodeType === Node.ELEMENT_NODE ? target : target.parentElement;

    for (let depth = 0; node && node !== document.body && depth < 8; depth += 1) {
      if (node.matches?.("a[href]")) {
        closestLinks.push(node);
      }
      const descendant = node.querySelector?.("a[href]");
      if (descendant) {
        closestLinks.push(descendant);
      }
      node = node.parentElement;
    }

    return (
      closestLinks.find((link) => isProductLikeUrl(link.href)) ||
      closestLinks[0] ||
      null
    );
  }

  function findProductLink(target, scope, context, initialLink) {
    if (context.linkUrl) {
      return { href: context.linkUrl, textContent: "" };
    }

    if (initialLink?.href) {
      return initialLink;
    }

    const links = Array.from(scope?.querySelectorAll?.("a[href]") || []);
    return (
      links.find((link) => isProductLikeUrl(link.href)) ||
      links.find((link) => link.getBoundingClientRect().width > 20) ||
      null
    );
  }

  function findProductImage(target, scope) {
    if (target?.matches?.("img")) {
      return target;
    }

    const pointImage = document
      .elementsFromPoint(lastContextPoint.x, lastContextPoint.y)
      .find((element) => element.matches?.("img"));
    if (pointImage) {
      return pointImage;
    }

    const images = Array.from(scope?.querySelectorAll?.("img") || []);
    if (!images.length) {
      return null;
    }

    return images
      .map((image) => ({
        image,
        score: imageScore(image)
      }))
      .sort((a, b) => b.score - a.score)[0]?.image || images[0];
  }

  function imageScore(image) {
    const rect = image.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.hypot(centerX - lastContextPoint.x, centerY - lastContextPoint.y);
    const visibleArea = Math.max(0, rect.width) * Math.max(0, rect.height);

    return visibleArea - distance * 8;
  }

  function isProductLikeUrl(value) {
    try {
      const url = new URL(value, location.href);
      return /\/(product|products|item|items|p)\//i.test(url.pathname);
    } catch {
      return false;
    }
  }

  function findParentLink(target) {
    let node = target;
    for (let depth = 0; node && depth < 4; depth += 1) {
      const link = node.querySelector?.("a[href]");
      if (link) {
        return link;
      }
      node = node.parentElement;
    }
    return null;
  }

  function getTextLines(scope) {
    if (!scope) {
      return [];
    }

    return String(scope.innerText || scope.textContent || "")
      .split(/\n+/)
      .map((line) => cleanText(line))
      .filter(Boolean)
      .filter((line, index, lines) => lines.indexOf(line) === index)
      .slice(0, 40);
  }

  function findLikelyTitle(textLines, imageAlt, linkText, brand) {
    const brandText = cleanText(brand).toLocaleLowerCase();
    const candidates = productTextCandidates(textLines, imageAlt, linkText).filter(
      (value) => cleanText(value).toLocaleLowerCase() !== brandText
    );

    return (
      candidates.find(looksLikeProductName) ||
      candidates.find((value) => value.length > 8 && !isBrandLikeLine(value)) ||
      candidates[0]
    );
  }

  function findLikelyBrand(textLines, imageAlt, linkText) {
    const candidates = productTextCandidates(textLines, imageAlt, linkText);
    return candidates.find(isBrandLikeLine) || sourceNameFromUrl(location.href);
  }

  function productTextCandidates(...groups) {
    return groups
      .flat()
      .map((value) => cleanText(value))
      .filter(Boolean)
      .map(stripPriceFromText)
      .map(stripTitleActionNoise)
      .map(cleanText)
      .filter((value, index, values) => values.indexOf(value) === index)
      .filter((value) => value.length > 1)
      .filter((value) => !looksLikePrice(value))
      .filter((value) => !isNoiseLine(value))
      .filter((value) => !looksLikeMeasurementLine(value));
  }

  function isBrandLikeLine(value) {
    const text = cleanText(stripPriceFromText(value));
    if (!cleanBrandName(text)) {
      return false;
    }

    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return text.length <= 42 && wordCount <= 4;
  }

  async function upsertItem(item) {
    const stored = await getLocalStorageValue(STORAGE_KEY);
    const currentItems = Array.isArray(stored[STORAGE_KEY])
      ? stored[STORAGE_KEY]
      : [];
    const nextItems = [
      item,
      ...currentItems.filter((existing) => existing.url !== item.url)
    ].slice(0, 300);

    await setLocalStorageValue(STORAGE_KEY, nextItems);
    return nextItems;
  }

  async function setLocalStorageValue(key, value) {
    const sanitized = sanitizeStorageValue(value);
    try {
      await chrome.storage.local.set({ [key]: sanitized });
    } catch (error) {
      throw normalizeExtensionError(error);
    }
  }

  async function getLocalStorageValue(keys) {
    try {
      return await chrome.storage.local.get(keys);
    } catch (error) {
      throw normalizeExtensionError(error);
    }
  }

  function normalizeExtensionError(error) {
    if (/extension context invalidated/i.test(String(error?.message || error))) {
      removeStaleExtensionRoots();
      return new Error("Wishlisted was reloaded. Refresh this page and try again.");
    }
    return error;
  }

  function sanitizeStorageValue(value) {
    if (value === undefined || typeof value === "function" || typeof value === "symbol") {
      return undefined;
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : undefined;
    }

    if (value === null || typeof value !== "object") {
      return value;
    }

    if (Array.isArray(value)) {
      return value
        .map(sanitizeStorageValue)
        .filter((entry) => entry !== undefined);
    }

    return Object.fromEntries(
      Object.entries(value)
        .map(([entryKey, entryValue]) => [entryKey, sanitizeStorageValue(entryValue)])
        .filter(([, entryValue]) => entryValue !== undefined)
    );
  }

  async function normalizeItem(product, category, categories) {
    const url = normalizeUrl(product.url || location.href);
    const price = normalizePrice({
      amount: product.priceAmount,
      currency: product.currency,
      text: product.priceText,
      compareAtAmount: product.compareAtPriceAmount,
      compareAtText: product.compareAtPriceText
    });
    const rubPrice = await convertPriceToRub(price);
    const title =
      cleanProductTitle(stripPriceFromText(product.title), product.brand, url) ||
      "Saved Product";
    const inferredCategory = hasCategory(categories, category)
      ? category
      : inferCategory(product, categories);
    const sourceDomain = product.sourceDomain || sourceDomainFromUrl(url);

    return {
      id: productId(url),
      source: product.source || sourceNameFromUrl(url),
      sourceDomain,
      faviconUrl: product.faviconUrl || faviconUrlFromUrl(url),
      url,
      title,
      brand: cleanBrandName(product.brand) || sourceNameFromUrl(url),
      price: {
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
      },
      priceText: price.originalText,
      priceAmount: price.amount,
      currency: price.currency,
      compareAtPriceText: price.compareAtText,
      compareAtPriceAmount: price.compareAtAmount,
      isSale: price.isSale,
      rubPriceText: rubPrice.text,
      rubPriceAmount: rubPrice.amount,
      imageUrl: toAbsoluteUrl(product.imageUrl),
      category: inferredCategory,
      createdAt: new Date().toISOString()
    };
  }

  function inferCategory(product, categories = DEFAULT_CATEGORIES) {
    const signals = [
      product.title,
      product.rawCategory,
      [product.title, product.brand, product.rawCategory].filter(Boolean).join(" ")
    ];

    for (const signal of signals) {
      const intent = inferCategoryIntent(signal);
      const categoryId = categoryIdForIntent(categories, intent);
      if (categoryId) {
        return categoryId;
      }
    }

    return categoryIdForIntent(categories, "tops") || categories[0]?.id || "tops";
  }

  function inferCategoryIntent(value) {
    const text = cleanText(value).toLowerCase();
    if (!text) {
      return "";
    }

    const rules = [
      ["shoes", /\b(boot|boots|shoe|shoes|sneaker|sneakers|loafer|loafers|sandal|sandals|heel|heels|pump|pumps)\b/],
      ["bags", /\b(bag|bags|tote|clutch|backpack|crossbody|shoulder bag)\b/],
      ["accessories", /\b(accessory|accessories|belt|belts|cap|caps|hat|hats|beanie|scarf|scarves|sunglasses|glasses|wallet|wallets|pouch|pouches|jewelry|jewellery|necklace|bracelet|ring|watch|watches|socks|tie|ties)\b/],
      ["outerwear", /\b(jacket|coat|parka|blazer|trench|bomber|overcoat|vest|gilet)\b/],
      ["bottoms", /\b(trouser|trousers|jeans|pants|shorts|skirt|leggings|cargo)\b/],
      ["tops", /\b(t-shirt|tee|shirt|top|sweater|hoodie|sweatshirt|sweat|knit|cardigan|polo|zip hoodie)\b/]
    ];

    return rules.find(([, pattern]) => pattern.test(text))?.[0] || "";
  }

  function categoryIdForIntent(categories, intent) {
    const aliases = {
      tops: ["tops", "top", "shirts", "shirt", "tees", "tee", "knitwear", "sweats"],
      bottoms: ["bottoms", "bottom", "pants", "trousers", "jeans", "shorts"],
      outerwear: ["outerwear", "jackets", "jacket", "coats", "coat"],
      shoes: ["shoes", "shoe", "footwear", "sneakers", "boots"],
      bags: ["bags", "bag"],
      accessories: ["accessories", "accessory", "access", "jewelry", "jewellery", "belts", "hats", "caps"]
    };
    const candidates = aliases[intent] || [];
    const fallbackIntent = intent === "outerwear" ? "tops" : "";
    const fallbackCandidates = fallbackIntent ? aliases[fallbackIntent] || [] : [];
    const accepted = new Set([intent, ...candidates, ...fallbackCandidates].filter(Boolean));

    return categories.find((category) => {
      const id = slugify(category.id);
      const label = slugify(category.label);
      return accepted.has(id) || accepted.has(label);
    })?.id;
  }

  function showSavedOverlay(item, items, categories = DEFAULT_CATEGORIES) {
    const root = getOverlayRoot();

    root.innerHTML = `
      <style>${overlayStyles()}</style>
      <section class="wl-panel" aria-live="polite">
        <p class="wl-kicker">Added:</p>
        <article class="wl-item">
          <div class="wl-image">${item.imageUrl ? `<img src="${escapeAttribute(item.imageUrl)}" alt="">` : lucideImageIcon("wl-image-placeholder")}</div>
          <h2>${escapeHtml(item.title)}</h2>
          ${renderSitePriceHtml(item, "wl")}
        </article>
        <button class="wl-open-button" type="button" data-open-wishlist>
          ${lucideLinkIcon("wl-button-icon")}
          <span>Open wishlist</span>
        </button>
      </section>
    `;

    root.querySelector("[data-open-wishlist]")?.addEventListener("click", () => {
      window.clearTimeout(root.__wishlistedTimer);
      root.innerHTML = "";
      safelyRunPanelAction(() => openWishlistPanel());
    });
    bindImageFallbacks(root);

    window.clearTimeout(root.__wishlistedTimer);
    root.__wishlistedTimer = window.setTimeout(() => {
      root.innerHTML = "";
    }, 8000);
  }

  function showErrorOverlay(error) {
    const root = getOverlayRoot();
    root.innerHTML = `
      <style>${overlayStyles()}</style>
      <div class="wl-error">
        <strong>Could not save this item</strong>
        <span>${escapeHtml(error.message || "Try a product page or product card.")}</span>
      </div>
    `;
    window.clearTimeout(root.__wishlistedTimer);
    root.__wishlistedTimer = window.setTimeout(() => {
      root.innerHTML = "";
    }, 2600);
  }

  function getOverlayRoot() {
    let host = document.getElementById("wishlisted-extension-root");
    if (!host) {
      host = document.createElement("div");
      host.id = "wishlisted-extension-root";
      host.style.position = "fixed";
      host.style.inset = "0";
      host.style.zIndex = "2147483647";
      host.style.pointerEvents = "none";
      document.documentElement.appendChild(host);
    }

    if (!host.shadowRoot) {
      host.attachShadow({ mode: "open" });
    }

    return host.shadowRoot;
  }

  function getPanelRoot() {
    let host = document.getElementById("wishlisted-panel-root");
    if (!host) {
      host = document.createElement("div");
      host.id = "wishlisted-panel-root";
      host.style.position = "fixed";
      host.style.inset = "0";
      host.style.zIndex = "2147483646";
      host.style.pointerEvents = "none";
      document.documentElement.appendChild(host);
    }

    if (!host.shadowRoot) {
      host.attachShadow({ mode: "open" });
    }

    return host.shadowRoot;
  }

  function panelStyles() {
    return `
      :host {
        all: initial;
        color-scheme: light;
        font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
        --figure-font: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        --text-micro: 10px;
        --text-caption: 11px;
        --text-control: 12px;
        --text-body: 13px;
        --text-ui: 14px;
        --text-heading: 16px;
        --background: #fbfbf8;
        --foreground: #080b10;
        --muted: #737373;
        --muted-foreground: #8a8a8a;
        --border: rgba(10, 10, 10, 0.08);
        --input: rgba(236, 233, 227, 0.78);
        --card: rgba(255, 255, 255, 0.62);
        --hover: rgba(245, 244, 240, 0.84);
        --shell-bg: rgba(251, 251, 248, 0.86);
        --shell-edge-strong: rgba(251, 251, 248, 0.64);
        --shell-edge-mid: rgba(251, 251, 248, 0.38);
        --shell-edge-clear: rgba(251, 251, 248, 0);
        --shell-edge-mesh-a: rgba(255, 255, 255, 0.54);
        --shell-edge-mesh-b: rgba(232, 226, 214, 0.22);
        --shell-shadow: rgba(0, 0, 0, 0.2);
        --primary: #050505;
        --primary-foreground: #ffffff;
        --radius: 8px;
      }

      * {
        box-sizing: border-box;
      }

      *::-webkit-scrollbar {
        width: 0;
        height: 0;
      }

      .wp-shell {
        position: fixed;
        top: 24px;
        right: 24px;
        width: min(420px, calc(100vw - 32px), calc((100vh - 48px) * 9 / 16));
        height: min(746px, calc(100vh - 48px));
        max-height: calc(100vh - 48px);
        display: flex;
        flex-direction: column;
        padding: 20px;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--shell-bg);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.7),
          0 28px 80px var(--shell-shadow);
        backdrop-filter: blur(30px) saturate(1.22);
        color: var(--foreground);
        pointer-events: auto;
        overflow: hidden;
        isolation: isolate;
        contain: layout style paint;
        transform: translateZ(0);
        backface-visibility: hidden;
        scrollbar-width: none;
        animation: wpPanelIn 260ms cubic-bezier(.16, 1, .3, 1) both;
      }

      .wp-theme-white {
        --background: #ffffff;
        --muted: #747474;
        --muted-foreground: #8c8c8c;
        --border: rgba(10, 10, 10, 0.08);
        --input: rgba(230, 230, 230, 0.72);
        --card: rgba(255, 255, 255, 0.68);
        --hover: rgba(241, 241, 241, 0.82);
        --shell-bg: rgba(255, 255, 255, 0.84);
        --shell-edge-strong: rgba(255, 255, 255, 0.64);
        --shell-edge-mid: rgba(255, 255, 255, 0.36);
        --shell-edge-clear: rgba(255, 255, 255, 0);
        --shell-edge-mesh-a: rgba(255, 255, 255, 0.58);
        --shell-edge-mesh-b: rgba(236, 236, 236, 0.22);
        --shell-shadow: rgba(0, 0, 0, 0.18);
      }

      .wp-theme-ice {
        --background: #f6fbff;
        --muted: #687586;
        --muted-foreground: #8b98a8;
        --border: rgba(128, 150, 173, 0.24);
        --input: rgba(215, 226, 239, 0.64);
        --card: rgba(255, 255, 255, 0.58);
        --hover: rgba(232, 240, 249, 0.78);
        --shell-bg: rgba(244, 249, 255, 0.76);
        --shell-edge-strong: rgba(244, 249, 255, 0.62);
        --shell-edge-mid: rgba(244, 249, 255, 0.36);
        --shell-edge-clear: rgba(244, 249, 255, 0);
        --shell-edge-mesh-a: rgba(255, 255, 255, 0.5);
        --shell-edge-mesh-b: rgba(210, 231, 250, 0.2);
        --shell-shadow: rgba(20, 34, 52, 0.2);
      }

      .wp-shell::before,
      .wp-shell::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        z-index: 2;
        pointer-events: none;
        background-repeat: repeat, no-repeat, no-repeat, no-repeat;
        background-size: 72px 72px, 110% 84%, 96% 78%, 100% 100%;
        background-blend-mode: soft-light, normal, normal, normal;
        -webkit-backdrop-filter: blur(16px) saturate(1.08);
        backdrop-filter: blur(16px) saturate(1.08);
        transform: translateZ(0);
        backface-visibility: hidden;
        will-change: opacity;
        contain: paint;
      }

      .wp-shell::before {
        top: 0;
        height: 228px;
        background-image:
          url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='72'%20height='72'%20viewBox='0%200%2072%2072'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='.78'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3CfeColorMatrix%20type='saturate'%20values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type='table'%20tableValues='0%20.18'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width='72'%20height='72'%20filter='url(%23n)'%20opacity='.25'/%3E%3C/svg%3E"),
          radial-gradient(ellipse at 26% 0%, var(--shell-edge-mesh-a) 0%, color-mix(in srgb, var(--shell-edge-mesh-a) 42%, transparent) 42%, transparent 72%),
          radial-gradient(ellipse at 82% 18%, var(--shell-edge-mesh-b) 0%, transparent 66%),
          linear-gradient(
            to bottom,
            var(--shell-edge-strong) 0%,
            color-mix(in srgb, var(--shell-edge-strong) 74%, transparent) 32%,
            var(--shell-edge-mid) 58%,
            color-mix(in srgb, var(--shell-edge-mid) 24%, transparent) 78%,
            var(--shell-edge-clear) 100%
          );
        -webkit-mask-image: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.86) 0%,
          rgba(0, 0, 0, 0.78) 30%,
          rgba(0, 0, 0, 0.5) 68%,
          transparent 100%
        );
        mask-image: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0.86) 0%,
          rgba(0, 0, 0, 0.78) 30%,
          rgba(0, 0, 0, 0.5) 68%,
          transparent 100%
        );
      }

      .wp-shell::after {
        bottom: 0;
        height: 112px;
        background-image:
          url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='72'%20height='72'%20viewBox='0%200%2072%2072'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='.78'%20numOctaves='2'%20stitchTiles='stitch'/%3E%3CfeColorMatrix%20type='saturate'%20values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncA%20type='table'%20tableValues='0%20.18'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect%20width='72'%20height='72'%20filter='url(%23n)'%20opacity='.25'/%3E%3C/svg%3E"),
          radial-gradient(ellipse at 70% 100%, var(--shell-edge-mesh-a) 0%, color-mix(in srgb, var(--shell-edge-mesh-a) 38%, transparent) 40%, transparent 72%),
          radial-gradient(ellipse at 18% 84%, var(--shell-edge-mesh-b) 0%, transparent 64%),
          linear-gradient(
            to top,
            var(--shell-edge-strong) 0%,
            color-mix(in srgb, var(--shell-edge-strong) 66%, transparent) 34%,
            var(--shell-edge-mid) 56%,
            color-mix(in srgb, var(--shell-edge-mid) 20%, transparent) 76%,
            var(--shell-edge-clear) 100%
          );
        -webkit-mask-image: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.82) 0%,
          rgba(0, 0, 0, 0.64) 42%,
          rgba(0, 0, 0, 0.36) 72%,
          transparent 100%
        );
        mask-image: linear-gradient(
          to top,
          rgba(0, 0, 0, 0.82) 0%,
          rgba(0, 0, 0, 0.64) 42%,
          rgba(0, 0, 0, 0.36) 72%,
          transparent 100%
        );
      }

      .wp-shell.is-static,
      .wp-shell.is-static .wp-item {
        animation: none;
      }

      button,
      a,
      input {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      .wp-topbar {
        position: relative;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
      }

      .wp-topbar.is-searching {
        display: block;
      }

      .wp-settings h2 {
        margin: 0;
      }

      .wp-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
      }

      .wp-summary {
        display: inline-flex;
        align-items: baseline;
        gap: 6px;
        min-width: 0;
        flex: 1 1 auto;
        color: var(--foreground);
        font-size: var(--text-ui);
        line-height: 1;
        white-space: nowrap;
      }

      .wp-count {
        font-weight: 400;
      }

      .wp-total {
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 16px;
        border: 1px solid rgba(255, 255, 255, 0.48);
        border-radius: 999px;
        color: var(--foreground);
        background:
          linear-gradient(135deg, rgba(255, 255, 255, 0.78), rgba(230, 238, 255, 0.52) 38%, rgba(255, 229, 245, 0.44) 72%, rgba(255, 255, 255, 0.66)),
          rgba(255, 255, 255, 0.75);
        font-family: var(--figure-font);
        font-variant-numeric: tabular-nums;
        font-weight: 780;
        box-shadow: none;
        white-space: nowrap;
      }

      .wp-icon-button {
        position: relative;
        width: 40px;
        height: 40px;
        display: grid;
        place-items: center;
        border: 0;
        border-radius: var(--radius);
        background: transparent;
        color: var(--foreground);
        box-shadow: none;
      }

      .wp-icon-button.is-active {
        color: var(--foreground);
        background: transparent;
      }

      .wp-filter:hover,
      .wp-text-button:hover {
        background: var(--hover);
      }

      .wp-icon-button:hover,
      .wp-icon-button.is-active:hover {
        background: transparent;
        color: var(--muted);
      }

      .wp-lucide {
        width: 18px;
        height: 18px;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .wp-remove::before,
      .wp-remove::after,
      .wp-remove-category::before,
      .wp-remove-category::after {
        content: "";
        position: absolute;
        width: 13px;
        height: 1.5px;
        border-radius: var(--radius);
        background: currentColor;
      }

      .wp-remove::before,
      .wp-remove-category::before {
        transform: rotate(45deg);
      }

      .wp-remove::after,
      .wp-remove-category::after {
        transform: rotate(-45deg);
      }

      .wp-popover {
        position: absolute;
        top: 72px;
        right: 24px;
        z-index: 7;
        width: min(352px, calc(100% - 48px));
        padding: 16px;
        border: 1px solid rgba(60, 60, 67, 0.14);
        border-radius: var(--radius);
        background: #fff;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 18px 44px rgba(15, 23, 42, 0.14);
        animation: wpPanelIn 160ms cubic-bezier(.16, 1, .3, 1) both;
      }

      .wp-settings.wp-popover {
        width: min(336px, calc(100% - 48px));
        max-height: min(560px, calc(100vh - 116px));
        padding: 16px;
        overflow-y: auto;
        scrollbar-width: none;
        background: rgba(255, 255, 255, 0.98);
        border-color: rgba(60, 60, 67, 0.16);
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.88) inset,
          0 24px 54px rgba(0, 0, 0, 0.18);
      }

      .wp-settings.wp-popover::-webkit-scrollbar {
        display: none;
      }

      .wp-settings[hidden] {
        display: none;
      }

      .wp-settings-head {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        padding: 0;
        margin: 0 0 8px;
      }

      .wp-settings h2 {
        margin: 0;
        font-size: var(--text-heading);
        line-height: 1.2;
        font-weight: 780;
        letter-spacing: 0;
      }

      .wp-text-button,
      .wp-category-form button {
        height: 32px;
        padding: 0 12px;
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--primary);
        color: var(--primary-foreground);
        font-size: var(--text-control);
        font-weight: 700;
      }

      .wp-text-button {
        height: auto;
        padding: 0;
        border: 0;
        background: transparent;
        color: var(--muted);
        font-size: var(--text-control);
        font-weight: 680;
      }

      .wp-settings-section {
        display: grid;
        gap: 8px;
        padding: 0;
        margin-top: 16px;
        border: 0;
        border-radius: 0;
        background: transparent;
        box-shadow: none;
      }

      .wp-settings-section + .wp-settings-section {
        padding-top: 16px;
        margin-top: 16px;
        border-top: 1px solid rgba(60, 60, 67, 0.12);
      }

      .wp-settings-section-title,
      .wp-settings-section-head {
        color: var(--muted);
        font-size: var(--text-caption);
        line-height: 1;
        font-weight: 700;
        margin: 0;
      }

      .wp-settings-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .wp-settings-row {
        width: 100%;
        min-height: 40px;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
        gap: 16px;
        padding: 0;
        border: 0;
        border-radius: var(--radius);
        background: transparent;
      }

      .wp-settings-row + .wp-settings-row {
        margin-top: 0;
        border-top: 0;
      }

      .wp-settings-row > span {
        color: var(--foreground);
        font-size: var(--text-body);
        font-weight: 720;
      }

      .wp-select {
        position: relative;
        width: 128px;
        min-width: 128px;
        display: flex;
        justify-content: flex-end;
      }

      .wp-select-trigger {
        height: 32px;
        width: 100%;
        min-width: 0;
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 0 8px 0 12px;
        border: 1px solid rgba(60, 60, 67, 0.14);
        border-radius: var(--radius);
        background: #fff;
        color: var(--foreground);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        font-size: var(--text-body);
        font-weight: 700;
        letter-spacing: 0;
      }

      .wp-select-value {
        width: 100%;
        min-width: 0;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: baseline;
        gap: 8px;
      }

      .wp-select-value > span:first-child {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .wp-select-symbol {
        display: inline-block;
        min-width: 0;
        color: rgba(8, 11, 16, 0.5);
        font-family: var(--figure-font);
        font-variant-numeric: tabular-nums;
        font-weight: 680;
        white-space: nowrap;
      }

      .wp-select-trigger:focus-visible {
        outline: 2px solid rgba(0, 0, 0, 0.18);
        outline-offset: 2px;
      }

      .wp-select-chevron {
        width: 14px;
        height: 14px;
        stroke: var(--muted);
        stroke-width: 2.2;
        stroke-linecap: round;
        stroke-linejoin: round;
        transition: transform 140ms ease;
      }

      .wp-select-trigger[aria-expanded="true"] .wp-select-chevron {
        transform: rotate(180deg);
      }

      .wp-select-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        z-index: 12;
        width: 160px;
        max-height: 224px;
        display: grid;
        gap: 4px;
        padding: 4px;
        border: 1px solid rgba(60, 60, 67, 0.14);
        border-radius: var(--radius);
        background: #fff;
        overflow-y: auto;
        scrollbar-width: none;
        box-shadow:
          0 1px 0 rgba(255, 255, 255, 0.9) inset,
          0 14px 34px rgba(15, 23, 42, 0.16);
      }

      .wp-select-menu::-webkit-scrollbar {
        display: none;
      }

      .wp-select-menu[hidden] {
        display: none;
      }

      .wp-select-option {
        width: 100%;
        height: 32px;
        display: grid;
        grid-template-columns: 20px minmax(0, 1fr) auto;
        align-items: center;
        gap: 8px;
        padding: 0 8px;
        border: 0;
        border-radius: var(--radius);
        background: transparent;
        color: var(--foreground);
        font-size: var(--text-body);
        font-weight: 650;
        text-align: left;
        white-space: nowrap;
      }

      .wp-select-option > span:nth-child(2) {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .wp-select-option:hover,
      .wp-select-option:focus-visible,
      .wp-select-option.is-selected {
        outline: 0;
        background: #f3f4f6;
      }

      .wp-select-check-slot {
        width: 16px;
        height: 16px;
        display: inline-grid;
        place-items: center;
      }

      .wp-select-check {
        width: 14px;
        height: 14px;
        stroke: var(--foreground);
        stroke-width: 2.4;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .wp-category-list {
        max-height: 160px;
        display: grid;
        gap: 4px;
        overflow-y: auto;
        scrollbar-width: none;
        border: 0;
        border-radius: 0;
        background: transparent;
      }

      .wp-category-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 32px;
        align-items: center;
        gap: 8px;
        min-height: 40px;
        padding: 0;
        border-radius: var(--radius);
      }

      .wp-category-row + .wp-category-row {
        border-top: 0;
      }

      .wp-category-row input,
      .wp-category-form input,
      .wp-search input {
        width: 100%;
        border: 1px solid var(--input);
        border-radius: var(--radius);
        outline: 0;
        background: var(--card);
        color: var(--foreground);
        font-weight: 620;
      }

      .wp-category-row input,
      .wp-category-form input {
        height: 32px;
        padding: 0;
        font-size: var(--text-body);
      }

      .wp-category-row input {
        height: 40px;
        border: 0;
        background: transparent;
      }

      .wp-category-row:focus-within {
        border-radius: var(--radius);
        background: rgba(0, 0, 0, 0.03);
      }

      .wp-category-row input:focus,
      .wp-category-form input:focus,
      .wp-search input:focus {
        border-color: #171717;
      }

      .wp-remove-category {
        width: 32px;
        height: 32px;
        box-shadow: none;
        color: var(--muted);
      }

      .wp-category-form {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 8px;
        padding-top: 8px;
        margin-top: 8px;
        border-top: 1px solid rgba(60, 60, 67, 0.1);
      }

      .wp-category-form input {
        padding: 0 12px;
        background: #fff;
      }

      .wp-inline-search {
        position: relative;
        width: 100%;
        height: 40px;
        display: grid;
        grid-template-columns: 24px minmax(0, 1fr);
        align-items: center;
        gap: 8px;
        color: var(--foreground);
      }

      .wp-inline-search span {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        border: 0;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
      }

      .wp-inline-search-icon {
        width: 20px;
        height: 20px;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .wp-inline-search input {
        width: 100%;
        height: 40px;
        padding: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--foreground);
        font-size: var(--text-ui);
        font-weight: 680;
      }

      .wp-inline-search input::placeholder {
        color: var(--muted-foreground);
      }

      .wp-filters {
        position: relative;
        z-index: 3;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
      }

      .wp-filter {
        flex: 0 0 auto;
        height: 32px;
        padding: 0 16px;
        border: 1px solid var(--border);
        border-radius: 999px;
        color: var(--foreground);
        background: var(--card);
        font-size: var(--text-body);
        font-weight: 720;
        transition: background 140ms ease, color 140ms ease, border-color 140ms ease;
      }

      .wp-filter.is-active {
        color: var(--primary-foreground);
        background: var(--primary);
        border-color: var(--primary);
      }

      .wp-items {
        position: absolute;
        inset: 0;
        z-index: 1;
        min-height: 100%;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-content: start;
        gap: 24px 16px;
        padding: 168px 24px 56px;
        margin-top: 0;
        overflow-y: auto;
        scroll-behavior: smooth;
        overscroll-behavior: contain;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
        transform: translateZ(0);
        backface-visibility: hidden;
        contain: layout paint style;
      }

      .wp-item {
        min-width: 0;
        animation: wpItemIn 240ms cubic-bezier(.16, 1, .3, 1) both;
      }

      .wp-item.is-new .wp-media {
        box-shadow: none;
      }

      .wp-item.is-new .wp-item-title {
        text-decoration: underline;
        text-decoration-thickness: 2px;
        text-underline-offset: 3px;
      }

      .wp-media {
        position: relative;
        display: grid;
        place-items: center;
        aspect-ratio: var(--wp-media-ratio, 4 / 5);
        margin-bottom: 8px;
        border: 0;
        border-radius: var(--radius);
        background: transparent;
        overflow: hidden;
      }

      .wp-media img {
        display: block;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        object-fit: contain;
        object-position: center;
      }

      .wp-image-placeholder {
        width: 42px;
        height: 42px;
        color: rgba(16, 16, 16, 0.2);
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .wp-item:hover .wp-media img {
        transform: none;
      }

      .wp-remove {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        border: 0;
        border-radius: 0;
        color: rgba(16, 16, 16, 0.72);
        background: transparent;
        cursor: pointer;
        opacity: 0;
        pointer-events: none;
        transform: none;
        transition: opacity 140ms ease, color 140ms ease;
      }

      .wp-remove::before,
      .wp-remove::after {
        width: 18px;
        height: 2px;
      }

      .wp-item:hover .wp-remove,
      .wp-remove:focus-visible {
        opacity: 1;
        pointer-events: auto;
        transform: none;
        color: rgba(16, 16, 16, 0.92);
      }

      .wp-item-copy {
        display: grid;
        gap: 4px;
      }

      .wp-brand-row,
      .wp-title-row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 8px;
        align-items: center;
        min-width: 0;
      }

      .wp-price-row {
        min-width: 0;
        display: inline-flex;
        align-items: baseline;
        justify-content: flex-start;
        gap: 6px;
        max-width: 100%;
      }

      .wp-brand {
        min-width: 0;
        color: rgba(8, 11, 16, 0.5);
        font-family: var(--figure-font);
        font-variant-numeric: tabular-nums;
        font-size: var(--text-caption);
        line-height: 1.1;
        font-weight: 650;
        text-decoration: none;
        text-transform: uppercase;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .wp-item-title {
        display: -webkit-box;
        min-width: 0;
        color: var(--foreground);
        font-size: var(--text-ui);
        line-height: 1.16;
        font-weight: 760;
        letter-spacing: 0;
        text-decoration: none;
        overflow: hidden;
        overflow-wrap: anywhere;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      .wp-source-icon {
        position: relative;
        width: 20px;
        height: 20px;
        display: grid;
        place-items: center;
        border: 0;
        border-radius: 0;
        background: transparent;
        color: rgba(16, 16, 16, 0.48);
        text-decoration: none;
        overflow: hidden;
      }

      .wp-source-fallback {
        font-family: var(--figure-font);
        font-size: var(--text-micro);
        line-height: 1;
        font-weight: 700;
      }

      .wp-source-favicon {
        position: absolute;
        inset: 2px;
        background-image: var(--wp-favicon-url);
        background-position: center;
        background-repeat: no-repeat;
        background-size: contain;
      }

      .wp-site-price,
      .wp-compare-price {
        color: rgba(8, 11, 16, 0.5);
        font-family: var(--figure-font);
        font-variant-numeric: tabular-nums;
        font-size: var(--text-control);
        line-height: 1.2;
        font-weight: 700;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .wp-site-price.is-sale {
        color: #d92d20;
      }

      .wp-compare-price {
        font-weight: 650;
        min-width: 0;
      }

      .wp-empty {
        grid-column: 1 / -1;
        min-height: 430px;
        display: grid;
        place-items: center;
        color: rgba(16, 16, 16, 0.46);
        text-align: center;
        font-size: var(--text-body);
        line-height: 1.4;
      }

      .wp-empty > div {
        display: grid;
        justify-items: center;
        gap: 8px;
      }

      .wp-empty-tee {
        width: 96px;
        height: 96px;
        margin-bottom: 4px;
        stroke: rgba(16, 16, 16, 0.2);
        stroke-width: 4;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .wp-empty strong {
        display: block;
        color: var(--foreground);
        font-size: var(--text-heading);
      }

      @media (max-width: 560px) {
        .wp-shell {
          top: 12px;
          right: 12px;
          left: 12px;
          width: auto;
          height: calc(100vh - 24px);
          max-height: calc(100vh - 24px);
          border-radius: var(--radius);
        }
      }

      @keyframes wpPanelIn {
        from {
          opacity: 0;
          transform: translateY(-10px) scale(.98);
          filter: blur(8px);
        }

        to {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @keyframes wpItemIn {
        from {
          opacity: 0;
          transform: translateY(8px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
  }

  function extensionAssetUrl(path) {
    try {
      return chrome.runtime.getURL(path);
    } catch (error) {
      if (/extension context invalidated/i.test(String(error?.message || error))) {
        return "";
      }
      throw error;
    }
  }

  function overlayStyles() {
    return `
      :host {
        all: initial;
        color-scheme: light;
        font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
        --figure-font: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
        --text-control: 12px;
        --text-body: 13px;
        --text-ui: 14px;
        --text-heading: 16px;
      }

      * {
        box-sizing: border-box;
      }

      button {
        font: inherit;
        cursor: pointer;
      }

      .wl-panel {
        position: fixed;
        top: 24px;
        right: 24px;
        width: min(286px, calc(100vw - 32px));
        display: grid;
        gap: 12px;
        padding: 16px;
        color: #101010;
        background: rgba(251, 251, 248, 0.88);
        border: 1px solid rgba(10, 10, 10, 0.08);
        border-radius: 8px;
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.7),
          0 20px 56px rgba(0, 0, 0, 0.14);
        backdrop-filter: blur(26px) saturate(1.2);
        transform-origin: top right;
        animation: wlPanelIn 220ms cubic-bezier(.16, 1, .3, 1) both;
        overflow: hidden;
        pointer-events: auto;
      }

      .wl-kicker {
        margin: 0;
        color: #101010;
        font-size: var(--text-ui);
        line-height: 1;
        font-weight: 760;
        text-align: center;
      }

      .wl-item {
        min-width: 0;
      }

      .wl-image {
        aspect-ratio: 4 / 5;
        display: grid;
        place-items: center;
        margin-bottom: 8px;
        background: transparent;
        border: 0;
        border-radius: 0;
        overflow: visible;
      }

      .wl-image img {
        width: 100%;
        height: 100%;
        border-radius: 8px;
        object-fit: contain;
        object-position: center;
      }

      .wl-image-placeholder {
        width: 52px;
        height: 52px;
        color: rgba(16, 16, 16, 0.2);
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .wl-item p {
        display: block;
        margin: 0 0 4px;
        color: rgba(16, 16, 16, 0.5);
        font-size: var(--text-body);
        line-height: 1.25;
        font-weight: 400;
      }

      .wl-item h2 {
        margin: 0;
        color: #101010;
        font-size: var(--text-ui);
        line-height: 1.16;
        font-weight: 720;
        letter-spacing: 0;
      }

      .wl-site-price,
      .wl-compare-price {
        display: inline-block;
        margin-top: 5px;
        color: rgba(8, 11, 16, 0.5);
        font-family: var(--figure-font);
        font-variant-numeric: tabular-nums;
        font-size: var(--text-body);
        line-height: 1.2;
        font-weight: 680;
      }

      .wl-site-price.is-sale {
        color: #d92d20;
      }

      .wl-compare-price {
        margin-top: 4px;
        margin-left: 6px;
      }

      .wl-open-button {
        justify-self: center;
        height: 32px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 0 12px;
        margin-top: 2px;
        border: 0;
        border-radius: 999px;
        color: #fff;
        background: #050505;
        font-size: var(--text-control);
        line-height: 1;
        font-weight: 760;
      }

      .wl-button-icon {
        width: 14px;
        height: 14px;
        stroke: currentColor;
        stroke-width: 2.2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }

      .wl-error {
        position: fixed;
        left: 50%;
        bottom: 34px;
        transform: translateX(-50%);
        padding: 12px 16px;
        border-radius: 8px;
        color: #fff;
        background: #050505;
        box-shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
        font-size: var(--text-body);
        font-weight: 700;
        display: grid;
        gap: 4px;
        min-width: 260px;
        border-radius: 8px;
        animation: wlPanelIn 220ms cubic-bezier(.16, 1, .3, 1) both;
      }

      .wl-error span {
        color: rgba(255, 255, 255, 0.68);
        font-size: var(--text-control);
        font-weight: 520;
      }

      @keyframes wlPanelIn {
        0% {
          opacity: 0;
          transform: translateY(-8px) scale(.98);
          filter: blur(6px);
        }
        100% {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      }

      @media (max-width: 560px) {
        .wl-panel {
          top: 12px;
          right: 12px;
          left: 12px;
          width: auto;
          padding: 16px;
          border-radius: 8px;
        }
      }
    `;
  }

  function metaContent(property) {
    return document.querySelector(`meta[property="${property}"], meta[name="${property}"]`)?.content;
  }

  function findVisiblePriceText(scope = document) {
    const candidates = visiblePriceCandidates(scope);

    if (candidates.length <= 1) {
      return candidates[0];
    }

    const firstPrice = parsePricesFromText(candidates[0])[0];
    const companion = candidates.slice(1, 6).find((candidate) => {
      const price = parsePricesFromText(candidate)[0];
      return (
        price &&
        firstPrice &&
        price.currency === firstPrice.currency &&
        price.amount !== firstPrice.amount
      );
    });

    return companion ? `${candidates[0]} ${companion}` : candidates[0];
  }

  function visiblePriceCandidates(scope = document) {
    const selectors = [
      '[itemprop*="price" i]',
      '[content*="$"], [content*="€"], [content*="£"], [content*="¥"], [content*="₽"], [content*="₴"]',
      '[aria-label*="$"], [aria-label*="€"], [aria-label*="£"], [aria-label*="¥"], [aria-label*="₽"], [aria-label*="₴"]',
      '[data-testid*="price" i]',
      '[data-test*="price" i]',
      '[data-qa*="price" i]',
      '[class*="price" i]',
      '[class*="amount" i]',
      "button",
      '[role="button"]',
      "span",
      "p",
      "strong",
      "s"
    ].join(",");
    const candidates = [];

    Array.from(scope.querySelectorAll?.(selectors) || []).forEach((node) => {
      if (!isUsablePriceElement(node)) {
        return;
      }

      priceTextsFromElement(node).forEach((text) => {
        if (text.length <= 96 && looksLikePrice(text)) {
          candidates.push({
            text,
            score: priceElementScore(node, text)
          });
        }
      });
    });

    return candidates
      .sort((a, b) => b.score - a.score)
      .map((candidate) => candidate.text)
      .filter((text, index, list) => list.indexOf(text) === index)
      .slice(0, 8);
  }

  function priceTextsFromElement(element) {
    const values = [
      element.getAttribute("content"),
      element.getAttribute("aria-label"),
      element.getAttribute("data-price"),
      element.getAttribute("data-amount"),
      element.getAttribute("data-value"),
      element.getAttribute("value"),
      element.innerText,
      element.textContent
    ];

    if (element.dataset) {
      Object.entries(element.dataset).forEach(([key, value]) => {
        if (/price|amount|value|currency/i.test(key)) {
          values.push(value);
        }
      });
    }

    return values
      .map(cleanText)
      .filter(Boolean)
      .flatMap((text) => {
        const prices = parsePricesFromText(text);
        return prices.length ? prices.map((price) => price.originalText) : [text];
      })
      .filter((text, index, list) => list.indexOf(text) === index);
  }

  function isUsablePriceElement(element) {
    if (
      !element ||
      element.closest?.("#wishlisted-panel-root, #wishlisted-extension-root") ||
      element.closest?.("[aria-hidden='true']")
    ) {
      return false;
    }

    const style = window.getComputedStyle(element);
    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      Number(style.opacity) === 0
    ) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function priceElementScore(element, text) {
    const className = String(element.className || "");
    const label = [
      className,
      element.id,
      element.getAttribute("data-testid"),
      element.getAttribute("data-test"),
      element.getAttribute("data-qa"),
      element.getAttribute("itemprop")
    ].join(" ");
    let score = 0;

    if (/price|amount|cost/i.test(label)) score += 12;
    if (element.matches?.("meta, [itemprop*='price' i]")) score += 8;
    if (element.closest?.("main")) score += 3;
    if (element.closest?.("button, [role='button']")) score += 2;
    if (parsePricesFromText(text).length > 1) score += 3;
    if (text.length <= 32) score += 2;
    if (/shipping|delivery|free|returns/i.test(text)) score -= 10;

    return score;
  }

  function findVisibleCurrencyCode(scope = document) {
    const text = [
      metaContent("product:price:currency"),
      metaContent("og:price:currency"),
      scope?.textContent?.slice(0, 5000)
    ]
      .filter(Boolean)
      .join(" ");
    const match = text.match(new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b`, "i"));

    return match?.[1]?.toUpperCase() || "";
  }

  function firstValue(sources, key) {
    for (const source of sources) {
      const value = source?.[key];
      if (value === null || value === undefined) {
        continue;
      }
      if (typeof value === "string" && value.trim() === "") {
        continue;
      }
      return value;
    }
    return undefined;
  }

  async function getCategories() {
    const stored = await getLocalStorageValue([
      CATEGORY_STORAGE_KEY,
      CATEGORY_SCHEMA_STORAGE_KEY
    ]);
    const categories = normalizeCategories(stored[CATEGORY_STORAGE_KEY]);

    if (stored[CATEGORY_SCHEMA_STORAGE_KEY] === CATEGORY_SCHEMA_VERSION) {
      return categories;
    }

    const nextCategories = shouldAddAccessoriesCategory(categories)
      ? [...categories, { id: "accessories", label: "Accessories" }].slice(0, 12)
      : categories;

    if (nextCategories.length !== categories.length) {
      await setLocalStorageValue(CATEGORY_STORAGE_KEY, nextCategories);
    }
    await setLocalStorageValue(CATEGORY_SCHEMA_STORAGE_KEY, CATEGORY_SCHEMA_VERSION);

    return nextCategories;
  }

  async function getPanelSettings() {
    const stored = await getLocalStorageValue(SETTINGS_STORAGE_KEY);
    return normalizePanelSettings(stored[SETTINGS_STORAGE_KEY]);
  }

  function normalizeCategories(value) {
    const categories = Array.isArray(value) ? value : DEFAULT_CATEGORIES;
    const seen = new Set();

    return categories
      .map((category) => ({
        id: slugify(category.id || category.label),
        label: cleanCategoryLabel(category.label || category.id)
      }))
      .filter((category) => category.id && category.label)
      .filter((category) => {
        if (seen.has(category.id) || category.id === "all" || category.id === "auto") {
          return false;
        }
        seen.add(category.id);
        return true;
      })
      .slice(0, 12);
  }

  function shouldAddAccessoriesCategory(categories) {
    const categoryIds = new Set(categories.map((category) => slugify(category.id || category.label)));
    const categoryLabels = new Set(categories.map((category) => slugify(category.label)));
    const hasAccessories =
      categoryIds.has("accessories") ||
      categoryIds.has("access") ||
      categoryLabels.has("accessories") ||
      categoryLabels.has("access");
    const hasOldDefaults = ["tops", "bottoms", "outerwear", "shoes", "bags"].every((id) =>
      categoryIds.has(id)
    );

    return !hasAccessories && hasOldDefaults;
  }

  function normalizePanelSettings(value) {
    const currency = cleanText(value?.summaryCurrency).toUpperCase();
    const backgroundTheme = cleanText(value?.backgroundTheme).toLowerCase();
    return {
      summaryCurrency: isSummaryCurrency(currency)
        ? currency
        : DEFAULT_SETTINGS.summaryCurrency,
      backgroundTheme: isBackgroundTheme(backgroundTheme)
        ? backgroundTheme
        : DEFAULT_SETTINGS.backgroundTheme
    };
  }

  function summaryCurrencyOptions() {
    return Object.keys(DEFAULT_RUB_RATES);
  }

  function isSummaryCurrency(currency) {
    return summaryCurrencyOptions().includes(cleanText(currency).toUpperCase());
  }

  function backgroundThemeOptions() {
    return [
      { id: "warm", label: "Warm" },
      { id: "white", label: "White" },
      { id: "ice", label: "Ice" }
    ];
  }

  function isBackgroundTheme(theme) {
    const id = cleanText(theme).toLowerCase();
    return backgroundThemeOptions().some((option) => option.id === id);
  }

  function hasCategory(categories, id) {
    return Boolean(id && categories.some((category) => category.id === id));
  }

  function categoryLabelFor(categories, id) {
    return (
      categories.find((category) => category.id === id)?.label ||
      cleanCategoryLabel(id) ||
      "Saved"
    );
  }

  function cleanCategoryLabel(value) {
    return String(value || "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 28);
  }

  function slugify(value) {
    return cleanCategoryLabel(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32);
  }

  function findBestPrice(...groups) {
    const values = groups.flat().filter(Boolean).map(cleanText);

    for (const value of values) {
      const prices = parsePricesFromText(value);
      const price = prices.length
        ? priceWithCompareAt(prices[prices.length - 1], prices)
        : normalizePrice({ text: value });
      if (Number.isFinite(price.amount) && price.currency) {
        return price;
      }
    }

    return {};
  }

  function parsePricesFromText(value) {
    const text = cleanText(value);
    if (!text) {
      return [];
    }

    const matches = [];
    const patterns = [
      /([$€£¥₽₴])\s*([\d][\d\s.,]*)/gi,
      /([\d][\d\s.,]*)\s*([$€£¥₽₴])/gi,
      new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b\\s*([\\d][\\d\\s.,]*)`, "gi"),
      new RegExp(`([\\d][\\d\\s.,]*)\\s*\\b(${CURRENCY_CODE_PATTERN})\\b`, "gi")
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text))) {
        const first = match[1];
        const second = match[2];
        const currency = first.length === 1
          ? currencyFromSymbol(first)
          : second.length === 1
            ? currencyFromSymbol(second)
            : first.match(/^[A-Z]{3}$/i)
              ? first
              : second;
        const amountText = first.length === 1 || first.match(/^[A-Z]{3}$/i)
          ? second
          : first;
        const price = parsedPrice(amountText, currency, match[0]);
        if (Number.isFinite(price.amount) && price.currency) {
          matches.push({ ...price, index: match.index });
        }
      }
    }

    return matches
      .sort((a, b) => a.index - b.index)
      .map(({ index, ...price }) => price);
  }

  function normalizePrice({ amount, currency, text, compareAtAmount, compareAtText } = {}) {
    const parsed = parsePriceFromText(text, currency);
    const priceAmount = numericPrice(amount) ?? parsed.amount;
    const priceCurrency = cleanText(currency || parsed.currency).toUpperCase();
    const originalText =
      parsed.originalText ||
      formatOriginalPrice(priceAmount, priceCurrency) ||
      cleanText(text);
    const compareAt = normalizeCompareAtPrice(
      {
        amount: compareAtAmount ?? parsed.compareAtAmount,
        currency: priceCurrency,
        text: compareAtText ?? parsed.compareAtText
      },
      { amount: priceAmount, currency: priceCurrency }
    );

    return compactObject({
      amount: priceAmount,
      currency: priceCurrency,
      originalText,
      compareAtAmount: compareAt.amount,
      compareAtText: compareAt.originalText,
      isSale: Boolean(compareAt.amount)
    });
  }

  function parsePriceFromText(value, fallbackCurrency) {
    const text = cleanText(value);
    if (!text) {
      return {};
    }

    const prices = parsePricesFromText(text);
    if (prices.length) {
      return priceWithCompareAt(prices[prices.length - 1], prices);
    }

    const symbolBefore = text.match(/([$€£¥₽₴])\s*([\d][\d\s.,]*)/);
    if (symbolBefore) {
      return parsedPrice(symbolBefore[2], currencyFromSymbol(symbolBefore[1]), symbolBefore[0]);
    }

    const symbolAfter = text.match(/([\d][\d\s.,]*)\s*([$€£¥₽₴])/);
    if (symbolAfter) {
      return parsedPrice(symbolAfter[1], currencyFromSymbol(symbolAfter[2]), symbolAfter[0]);
    }

    const codeBefore = text.match(
      new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b\\s*([\\d][\\d\\s.,]*)`, "i")
    );
    if (codeBefore) {
      return parsedPrice(codeBefore[2], codeBefore[1], codeBefore[0]);
    }

    const codeAfter = text.match(
      new RegExp(`([\\d][\\d\\s.,]*)\\s*\\b(${CURRENCY_CODE_PATTERN})\\b`, "i")
    );
    if (codeAfter) {
      return parsedPrice(codeAfter[1], codeAfter[2], codeAfter[0]);
    }

    if (fallbackCurrency && /^[\d\s.,]+$/.test(text)) {
      return parsedPrice(text, fallbackCurrency, formatOriginalPrice(text, fallbackCurrency));
    }

    return {};
  }

  function priceWithCompareAt(price, candidates = []) {
    const currentAmount = numericPrice(price.amount);
    const currentCurrency = cleanText(price.currency).toUpperCase();
    const originalText =
      price.originalText ||
      formatOriginalPrice(currentAmount, currentCurrency);
    const compareAt = candidates
      .filter((candidate) => cleanText(candidate.currency).toUpperCase() === currentCurrency)
      .filter((candidate) => Number.isFinite(candidate.amount))
      .filter((candidate) => candidate.amount > currentAmount)
      .sort((a, b) => b.amount - a.amount)[0];

    return compactObject({
      amount: currentAmount,
      currency: currentCurrency,
      originalText,
      compareAtAmount: compareAt?.amount,
      compareAtText:
        compareAt?.originalText ||
        formatOriginalPrice(compareAt?.amount, compareAt?.currency),
      isSale: Boolean(compareAt)
    });
  }

  function normalizeCompareAtPrice(compareAt, current) {
    const parsed = parsePriceFromText(compareAt.text, compareAt.currency);
    const amount = numericPrice(compareAt.amount) ?? parsed.amount;
    const currency = cleanText(compareAt.currency || parsed.currency || current.currency).toUpperCase();
    const currentAmount = numericPrice(current.amount);
    const currentCurrency = cleanText(current.currency).toUpperCase();

    if (
      !Number.isFinite(amount) ||
      !Number.isFinite(currentAmount) ||
      !currency ||
      currency !== currentCurrency ||
      amount <= currentAmount
    ) {
      return {};
    }

    return {
      amount,
      currency,
      originalText:
        parsed.originalText ||
        formatOriginalPrice(amount, currency) ||
        cleanText(compareAt.text)
    };
  }

  function parsedPrice(rawAmount, currency, originalText) {
    const amount = parseLocalizedNumber(rawAmount);
    if (!Number.isFinite(amount)) {
      return {};
    }

    return {
      amount,
      currency: cleanText(currency).toUpperCase(),
      originalText: cleanText(originalText)
    };
  }

  function parseLocalizedNumber(value) {
    let text = String(value || "").replace(/\s/g, "");
    if (!text) {
      return undefined;
    }

    if (text.includes(",") && text.includes(".")) {
      text = text.replace(/,/g, "");
    } else if (text.includes(",") && !text.includes(".")) {
      const commaIndex = text.lastIndexOf(",");
      const decimals = text.length - commaIndex - 1;
      text = decimals === 2 ? text.replace(",", ".") : text.replace(/,/g, "");
    }

    const amount = Number.parseFloat(text);
    return Number.isFinite(amount) ? amount : undefined;
  }

  async function convertPriceToRub(price) {
    if (!Number.isFinite(price.amount) || !price.currency) {
      return {};
    }

    if (price.currency === "RUB") {
      return {
        amount: Math.round(price.amount),
        text: formatRubPrice(price.amount),
        rate: 1,
        source: "original"
      };
    }

    const rate = await getRubRate(price.currency);
    if (!Number.isFinite(rate.value)) {
      return {};
    }

    const amount = Math.round(price.amount * rate.value);
    return {
      amount,
      text: formatRubPrice(amount),
      rate: rate.value,
      source: rate.source
    };
  }

  async function getRubRate(currency) {
    const code = cleanText(currency).toUpperCase();
    if (code === "RUB") {
      return { value: 1, source: "original", updatedAt: Date.now() };
    }

    const now = Date.now();
    const stored = await getLocalStorageValue(RATE_STORAGE_KEY);
    const cache = stored[RATE_STORAGE_KEY] || {};
    const cached = cache[code];
    if (cached && now - cached.updatedAt < RATE_MAX_AGE_MS) {
      return { value: cached.value, source: cached.source, updatedAt: cached.updatedAt };
    }

    try {
      const response = await fetch(`https://open.er-api.com/v6/latest/${encodeURIComponent(code)}`);
      const data = await response.json();
      const value = Number(data?.rates?.RUB);
      if (Number.isFinite(value) && value > 0) {
        await setLocalStorageValue(RATE_STORAGE_KEY, {
          ...cache,
          [code]: { value, source: "open.er-api.com", updatedAt: now }
        });
        return { value, source: "open.er-api.com", updatedAt: now };
      }
    } catch {
      // Fall back below; saving should never fail because rate lookup failed.
    }

    return {
      value: DEFAULT_RUB_RATES[code],
      source: DEFAULT_RUB_RATES[code] ? "fallback" : "",
      updatedAt: now
    };
  }

  function formatRubPrice(value) {
    if (!Number.isFinite(value)) {
      return "";
    }

    try {
      return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0
      }).format(value);
    } catch {
      return `${Math.round(value)} RUB`;
    }
  }

  function formatOriginalPrice(value, currency) {
    const amount = numericPrice(value);
    const code = cleanText(currency).toUpperCase();
    if (!Number.isFinite(amount) || !code) {
      return "";
    }

    const formattedAmount = Number.isInteger(amount)
      ? String(amount)
      : String(amount.toFixed(2)).replace(/\.?0+$/, "");
    const symbol = CURRENCY_SYMBOLS[code] || code;

    if (["USD", "GBP", "JPY", "CNY"].includes(code)) {
      return `${symbol}${formattedAmount}`;
    }

    return `${formattedAmount} ${symbol}`;
  }

  function renderSitePriceHtml(item, namespace) {
    const currentText = item.price?.originalText || item.priceText;
    const compareAtText = item.price?.compareAtText || item.compareAtPriceText;
    const isSale =
      item.price?.isSale &&
      currentText &&
      compareAtText &&
      cleanText(currentText) !== cleanText(compareAtText);
    const baseClass = namespace === "wl" ? "wl-site-price" : "wp-site-price";
    const compareClass = namespace === "wl" ? "wl-compare-price" : "wp-compare-price";

    if (!currentText) {
      return "";
    }

    if (isSale) {
      return `
        <span class="${baseClass} is-sale">${escapeHtml(currentText)}</span>
        <span class="${compareClass}">(<s>${escapeHtml(compareAtText)}</s>)</span>
      `;
    }

    return `<span class="${baseClass}">${escapeHtml(currentText)}</span>`;
  }

  function stripPriceFromText(value) {
    return cleanText(value)
      .replace(/[$€£¥₽₴]\s*[\d][\d\s.,]*/g, "")
      .replace(/[\d][\d\s.,]*\s*[$€£¥₽₴]/g, "")
      .replace(new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b\\s*[\\d][\\d\\s.,]*`, "gi"), "")
      .replace(new RegExp(`[\\d][\\d\\s.,]*\\s*\\b(${CURRENCY_CODE_PATTERN})\\b`, "gi"), "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function bestImageFromElement(image) {
    return imageCandidatesFromElement(image).sort((a, b) => b.score - a.score)[0]?.url || "";
  }

  function bestProductImageUrl(context, image, scope) {
    const candidates = [];

    if (context.srcUrl) {
      candidates.push({ url: context.srcUrl, score: 50000 });
    }

    candidates.push(...imageCandidatesFromElement(image, 7000));

    Array.from(scope?.querySelectorAll?.("img") || []).forEach((scopeImage) => {
      candidates.push(
        ...imageCandidatesFromElement(scopeImage, Math.max(0, imageScore(scopeImage) / 100))
      );
    });

    return toAbsoluteUrl(
      candidates
        .filter((candidate) => isUsableProductImageUrl(candidate.url))
        .sort((a, b) => b.score - a.score)[0]?.url || ""
    );
  }

  function imageCandidatesFromElement(image, baseScore = 0) {
    if (!image) {
      return [];
    }

    const candidates = [
      ...parseSrcset(image.srcset).map((candidate) => ({
        ...candidate,
        score: candidate.score + baseScore + 1200
      }))
    ];
    const picture = image.closest?.("picture");

    Array.from(picture?.querySelectorAll?.("source[srcset]") || []).forEach((source) => {
      candidates.push(
        ...parseSrcset(source.getAttribute("srcset")).map((candidate) => ({
          ...candidate,
          score: candidate.score + baseScore + 1400
        }))
      );
    });

    for (const attribute of [
      "data-srcset",
      "data-original-srcset",
      "data-src",
      "data-original",
      "data-image",
      "data-master",
      "data-lazy-src",
      "data-zoom-src"
    ]) {
      const value = image.getAttribute(attribute);
      if (!value) {
        continue;
      }

      if (attribute.endsWith("srcset")) {
        candidates.push(
          ...parseSrcset(value).map((candidate) => ({
            ...candidate,
            score: candidate.score + baseScore + 1500
          }))
        );
      } else {
        candidates.push({ url: value, score: baseScore + 5000 });
      }
    }

    candidates.push({
      url: image.currentSrc || image.src,
      score: baseScore + 9000 + (image.naturalWidth || image.width || 0)
    });

    return candidates.filter((candidate) => isUsableProductImageUrl(candidate.url));
  }

  function isUsableProductImageUrl(value) {
    const text = cleanText(value);
    if (!text || /^blob:/i.test(text)) {
      return false;
    }

    if (/^data:/i.test(text)) {
      return text.length > 1000 && !/^data:image\/(?:gif|svg\+xml)/i.test(text);
    }

    return !/(?:blank|placeholder|transparent|spacer|sprite|pixel|loader|loading|logo|favicon|icon)\.(?:gif|png|svg|webp|jpg|jpeg)(?:[?#]|$)/i.test(text);
  }

  function parseSrcset(srcset) {
    return String(srcset || "")
      .split(",")
      .map((part) => {
        const [url, descriptor] = part.trim().split(/\s+/);
        const score = Number.parseFloat(descriptor) || 0;
        return { url, score };
      })
      .filter((candidate) => candidate.url);
  }

  function isNoiseLine(value) {
    return /^(new|new in|new season|available in|sale|regular price|sale price|unit price|sold out|add to cart|add to bag|wishlist|save|size|sizes|size guide|select size|item added|item added view cart|view cart|recommended|sponsored|copy|copied|shipping|returns|free shipping)$/i.test(
      cleanText(value)
    ) || /^(favorite|share|copy link|copied link|telegram|vk|vkontakte|whatsapp|pinterest|поделиться|скопировать|скопировать ссылку|ссылка скопирована|вконтакте|избранное)$/i.test(
      cleanText(value)
    ) || /^image:/i.test(cleanText(value));
  }

  function looksLikeMeasurementLine(value) {
    const text = cleanText(value);
    return (
      /^\d+(?:[.,]\d+)?\s*x\s*\d+(?:[.,]\d+)?(?:\s*x\s*\d+(?:[.,]\d+)?)?(?:\s*(?:cm|mm|in|inch|inches))?$/i.test(text) ||
      /\b\d+(?:[.,]\d+)?\s*(?:cm|mm|in|inch|inches|kg|g)\b/i.test(text) ||
      /^(?:xxs|xs|s|m|l|xl|xxl|xxxl|one size|os)$/i.test(text)
    );
  }

  function looksLikeProductName(value) {
    return /\b(?:sneakers?|shoes?|boots?|sandals?|loafers?|hoodies?|jackets?|coats?|trousers?|pants|chinos|jeans|shorts?|shirts?|t-shirts?|tees?|polos?|sweaters?|sweatshirts?|cardigans?|bags?|totes?|backpacks?|luggage|suitcases?|check-?in|glasses|sunglasses|frames?|caps?|hats?|beanies?|belts?|wallets?|dresses?|skirts?|blazers?|zips?|pullovers?|crew(?:neck)?|alpaca|cloudmonster|cloudsolo|charms?|dice|necklaces?|джемпер|толстовка|брюки|шорты|рубашка|футболка|кроссовки|ботинки|куртка|сумка|очки|худи)\b/i.test(
      cleanText(value)
    );
  }

  function cleanBrandName(value) {
    const text = canonicalBrandName(cleanText(stripPriceFromText(value)));
    if (
      !text ||
      looksLikePrice(text) ||
      isNoiseLine(text) ||
      looksLikeMeasurementLine(text) ||
      looksLikeProductName(text)
    ) {
      return "";
    }

    return text;
  }

  function formatBrandName(value) {
    return (cleanBrandName(value) || cleanText(value) || "SOURCE").toLocaleUpperCase();
  }

  function canonicalBrandName(value) {
    const text = cleanText(value)
      .replace(/[._-]+/g, " ")
      .replace(/\b(?:us|usa|uk|eu|intl|international|official|store|shop|fashion)\b$/i, "")
      .replace(/\s+/g, " ")
      .trim();
    const key = text.toLocaleLowerCase();
    if (BRAND_ALIASES.has(key)) {
      return BRAND_ALIASES.get(key);
    }

    for (const [alias, canonical] of BRAND_ALIASES) {
      const normalizedAlias = alias.replace(/\s+/g, " ");
      if (key.startsWith(`${normalizedAlias} `)) {
        return canonical;
      }
    }

    return text;
  }

  function sourceDomainFromUrl(value) {
    try {
      return new URL(value || location.href, location.href).hostname.replace(/^www\./i, "");
    } catch {
      return location.hostname.replace(/^www\./i, "");
    }
  }

  function sourceNameFromUrl(value) {
    const domain = sourceDomainFromUrl(value);
    const label = domain.split(".")[0] || "Source";
    const brand = cleanBrandName(label);
    return brand || label.charAt(0).toUpperCase() + label.slice(1);
  }

  function faviconUrlFromUrl(value) {
    const domain = sourceDomainFromUrl(value);
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }

  function cleanTitle(value, brand = "") {
    const brandText = cleanBrandName(brand);
    const cleaned = stripLeadingBrandFromTitle(
      stripTitleActionNoise(stripPriceFromText(value))
        .replace(/\s*\|\s*FARFETCH.*$/i, "")
        .replace(/\s*-\s*FARFETCH.*$/i, "")
        .replace(/\s*\|\s*LOEWE.*$/i, "")
        .replace(/\s*-\s*LOEWE.*$/i, "")
        .replace(/\s*\|\s*TOM FORD.*$/i, "")
        .replace(/\s*-\s*TOM FORD.*$/i, "")
        .replace(/\s*\|\s*AIM[ÉE] LEON DORE.*$/i, "")
        .replace(/\s*-\s*AIM[ÉE] LEON DORE.*$/i, "")
        .replace(/\bnew season\b/gi, "")
        .replace(/\b(?:available in|colour|color|size|sizes|view product|product details)\b/gi, "")
        .replace(/\s+\b(?=[A-Za-z0-9]*\d)(?=[A-Za-z0-9]*[A-Za-z])[A-Za-z0-9]{7,}\b$/g, "")
        .replace(/\s+(?:[-–—|])\s+(?:all|available|shop|select|size|men|women|unisex)\b.*$/i, "")
        .replace(/\s+\b(?:men|women|mens|womens|unisex)\b$/i, "")
        .replace(/\s+in\s+(black|white|blue|red|green|pink|grey|gray|brown|beige)$/i, " $1"),
      brandText
    );

    return titleCaseTitle(cleaned);
  }

  function cleanProductTitle(value, brand = "", url = "") {
    const title = cleanTitle(value, brand);
    const urlTitle = cleanTitle(productTitleFromUrl(url), brand);

    if (!title) {
      return urlTitle;
    }

    if (shouldPreferUrlTitle(title, urlTitle)) {
      return urlTitle;
    }

    return title;
  }

  function shouldPreferUrlTitle(title, urlTitle) {
    if (!urlTitle || urlTitle.length < 5) {
      return false;
    }

    if (!title) {
      return true;
    }

    if (looksLikeDescriptiveTitle(title)) {
      return true;
    }

    const titleWords = title.split(/\s+/).filter(Boolean).length;
    const urlWords = urlTitle.split(/\s+/).filter(Boolean).length;
    return title.length > 64 && urlTitle.length < title.length && urlWords >= 2 && urlWords <= titleWords;
  }

  function looksLikeDescriptiveTitle(value) {
    const text = cleanText(value);
    if (!text) {
      return false;
    }

    return (
      /\b(?:all season|stretch cotton|cervotessile|crafted from|made from|composition|product details|select size|add to basket|add to cart)\b/i.test(text) ||
      /\bby\s+[A-Z][\p{L}\s.,'-]{6,}$/iu.test(text) ||
      text.split(/\s+/).filter(Boolean).length > 12
    );
  }

  function productTitleFromUrl(value) {
    if (!value) {
      return "";
    }

    try {
      const url = new URL(value, location.href);
      const candidates = url.pathname
        .split("/")
        .filter(Boolean)
        .reverse()
        .map(cleanUrlTitleSegment)
        .filter(isUsableUrlTitleSegment);

      return candidates[0] || "";
    } catch {
      return "";
    }
  }

  function cleanUrlTitleSegment(value) {
    return cleanText(decodeURIComponent(value || ""))
      .replace(/\.(?:html?|aspx|php)$/i, "")
      .replace(/\bitem[-_\s]*\d+.*$/i, "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+in\s+([a-z]+)$/i, " $1")
      .replace(/\b(?:men|women|mens|womens|unisex|kids)\b$/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isUsableUrlTitleSegment(value) {
    const text = cleanText(value);
    if (!text || text.length < 4) {
      return false;
    }

    if (
      /^(?:en|us|usa|uk|gb|eu|ru|ru ru|products?|collections?|catalog|shopping|men|women|sale|new|item|p|dp)$/i.test(text)
    ) {
      return false;
    }

    if (/^[a-z]{0,4}[-_\s]?\d{3,}[a-z0-9\s-]*$/i.test(text)) {
      return false;
    }

    return text.split(/\s+/).length >= 2 || looksLikeProductName(text);
  }

  function stripTitleActionNoise(value) {
    const text = cleanText(value);
    if (!text) {
      return "";
    }

    const actionPattern =
      /\s+(?:(?:favorite|избранное)(?=\s+(?:share|copy|telegram|vk|vkontakte|whatsapp|pinterest|поделиться|скопировать|вконтакте))|share|copy link|copied link|telegram|vk|vkontakte|whatsapp|pinterest|поделиться|скопировать(?:\s+ссылку)?|ссылка\s+скопирована|вконтакте)\b.*$/i;
    const match = text.match(actionPattern);
    if (!match) {
      return text;
    }

    const beforeAction = cleanText(text.slice(0, match.index));
    return beforeAction.length >= 4 ? beforeAction : text;
  }

  function stripLeadingBrandFromTitle(value, brand) {
    const text = cleanText(value);
    const brandText = cleanText(brand);
    if (!text || !brandText) {
      return text;
    }

    const normalizedText = normalizeComparableText(text);
    const normalizedBrand = normalizeComparableText(brandText);
    if (!normalizedBrand || !normalizedText.startsWith(normalizedBrand)) {
      return text;
    }

    const rest = text.slice(brandText.length).replace(/^[-–—:|,\s]+/, "");
    return rest || text;
  }

  function normalizeComparableText(value) {
    return cleanText(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/gi, " ")
      .trim()
      .toLocaleLowerCase();
  }

  function titleCaseTitle(value) {
    const text = cleanText(value);
    if (!text) {
      return "";
    }

    const lower = text
      .toLocaleLowerCase()
      .replace(/\p{L}[\p{L}\p{N}'’:-]*/gu, (word) =>
        word
          .split(/([:'’-])/)
          .map((part) =>
            /^[\p{L}\p{N}]/u.test(part)
              ? part.charAt(0).toLocaleUpperCase() + part.slice(1)
              : part
          )
          .join("")
      )
      .replace(/\bMm6\b/g, "MM6")
      .replace(/\bAcg\b/g, "ACG")
      .replace(/\bCdg\b/g, "CDG")
      .replace(/\bY-3\b/g, "Y-3")
      .replace(/\bDc-(\d+)/g, "DC-$1")
      .replace(/\bRub\b/g, "RUB")
      .replace(/\bUsd\b/g, "USD")
      .replace(/\bEur\b/g, "EUR")
      .replace(/\bGbp\b/g, "GBP");

    return lower;
  }

  function cleanText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compactObject(object) {
    return Object.fromEntries(
      Object.entries(object).filter(([, value]) => {
        if (value === null || value === undefined) {
          return false;
        }
        return typeof value !== "string" || value.trim() !== "";
      })
    );
  }

  function normalizeUrl(value) {
    try {
      const url = new URL(value || location.href, location.href);
      url.hash = "";
      for (const key of Array.from(url.searchParams.keys())) {
        if (/^(utm_|fbclid|gclid|gbraid|wbraid)/i.test(key)) {
          url.searchParams.delete(key);
        }
      }
      return url.toString();
    } catch {
      return location.href;
    }
  }

  function sameProductPageUrl(left, right) {
    try {
      const leftUrl = new URL(left || location.href, location.href);
      const rightUrl = new URL(right || location.href, location.href);
      const leftHandle = productHandleFromUrl(leftUrl);
      const rightHandle = productHandleFromUrl(rightUrl);
      if (leftHandle && rightHandle) {
        return leftUrl.origin === rightUrl.origin && leftHandle === rightHandle;
      }

      return (
        leftUrl.origin === rightUrl.origin &&
        leftUrl.pathname.replace(/\/+$/, "") === rightUrl.pathname.replace(/\/+$/, "")
      );
    } catch {
      return normalizeUrl(left) === normalizeUrl(right);
    }
  }

  function productHandleFromUrl(url) {
    return decodeURIComponent(url.pathname.match(/\/products\/([^/?#]+)/i)?.[1] || "")
      .toLocaleLowerCase();
  }

  function toAbsoluteUrl(value) {
    if (!value) {
      return "";
    }
    try {
      return new URL(value, location.href).toString();
    } catch {
      return "";
    }
  }

  function toAbsoluteUrlFor(value, baseUrl) {
    if (!value) {
      return "";
    }

    try {
      return new URL(value, baseUrl || location.href).toString();
    } catch {
      return "";
    }
  }

  function looksLikePrice(value) {
    const text = String(value || "");
    return (
      /[$€£¥₽₴]\s?\d|\d[\d\s.,]*\s?[$€£¥₽₴]/i.test(text) ||
      new RegExp(`\\d[\\d\\s.,]*\\s?(?:${CURRENCY_CODE_PATTERN})\\b`, "i").test(text) ||
      new RegExp(`\\b(?:${CURRENCY_CODE_PATTERN})\\b\\s?\\d`, "i").test(text)
    );
  }

  function numericPrice(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    const match = String(value || "").match(/[\d][\d\s.,]*/);
    if (!match) {
      return undefined;
    }

    return parseLocalizedNumber(match[0]);
  }

  function currencyFromText(value) {
    const text = String(value || "");
    if (text.includes("$") || /\bUSD\b/i.test(text)) return "USD";
    if (text.includes("€") || /\bEUR\b/i.test(text)) return "EUR";
    if (text.includes("£") || /\bGBP\b/i.test(text)) return "GBP";
    if (text.includes("¥") || /\bJPY\b/i.test(text)) return "JPY";
    if (text.includes("₽") || /\bRUB\b/i.test(text)) return "RUB";
    if (text.includes("₴") || /\bUAH\b/i.test(text)) return "UAH";
    const code = text.match(new RegExp(`\\b(${CURRENCY_CODE_PATTERN})\\b`, "i"))?.[0];
    return code || "";
  }

  function currencyFromSymbol(symbol) {
    return {
      "$": "USD",
      "€": "EUR",
      "£": "GBP",
      "¥": "JPY",
      "₽": "RUB",
      "₴": "UAH"
    }[symbol] || "";
  }

  function currencySymbol(currency) {
    const code = cleanText(currency).toUpperCase();
    return CURRENCY_SYMBOLS[code] || code;
  }

  function formatPrice(price, currency) {
    const amount = numericPrice(price);
    if (amount === undefined) {
      return cleanText(price);
    }

    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency || "USD"
      }).format(amount);
    } catch {
      return `${currency || ""} ${amount}`.trim();
    }
  }

  function formatCollectionTotal(items) {
    const priced = items.filter((item) =>
      Number.isFinite(item.price?.rubAmount ?? item.rubPriceAmount)
    );

    if (!priced.length) {
      return `${items.length} saved`;
    }

    const total = priced.reduce(
      (sum, item) => sum + (item.price?.rubAmount ?? item.rubPriceAmount),
      0
    );
    return formatRubPrice(total);
  }

  function formatPanelSummaryTotal(items, currency = DEFAULT_SETTINGS.summaryCurrency) {
    const totalRub = items.reduce((sum, item) => {
      const amount = item.price?.rubAmount ?? item.rubPriceAmount;
      return Number.isFinite(amount) ? sum + amount : sum;
    }, 0);

    const selectedCurrency = isSummaryCurrency(currency)
      ? cleanText(currency).toUpperCase()
      : DEFAULT_SETTINGS.summaryCurrency;
    const rate =
      panelState.summaryRate?.currency === selectedCurrency &&
      Number.isFinite(panelState.summaryRate.value)
        ? panelState.summaryRate.value
        : DEFAULT_RUB_RATES[selectedCurrency];
    const converted = Number.isFinite(rate) && rate > 0 ? totalRub / rate : 0;
    return formatSummaryCurrency(converted, selectedCurrency);
  }

  function formatSummaryCurrency(value, currency) {
    if (!Number.isFinite(value)) {
      return formatSummaryCurrency(0, currency);
    }

    const code = cleanText(currency).toUpperCase();
    const amount = Math.ceil(Math.max(0, value));
    const locale = code === "RUB" ? "ru-RU" : "en-US";
    const formatted = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    }).format(amount);
    const symbol = currencySymbol(code);

    if (LEADING_SYMBOL_CURRENCIES.has(code)) {
      return `${symbol}${formatted}`;
    }

    return `${formatted} ${symbol}`;
  }

  function productId(url) {
    let hash = 0;
    for (let index = 0; index < url.length; index += 1) {
      hash = (hash << 5) - hash + url.charCodeAt(index);
      hash |= 0;
    }
    return `wishlisted-${Math.abs(hash)}`;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function cssUrl(value) {
    return String(value || "").replace(/["'\\\n\r]/g, "");
  }
})();
