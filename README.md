# Tuckio

Tuckio is a plain Manifest V3 Chrome/Arc extension for saving products from any shop into a private local library.

The v0.1 promise is intentionally narrow: save products cleanly from arbitrary shops, keep the library local, and make saved data easy to correct or back up. The public product domain is `tuckio.com`.

## What it does

- Saves products from right-clicked product cards, images, links, and product pages.
- Extracts product data from schema.org JSON-LD, embedded app JSON, Shopify product JSON, OpenGraph, microdata, and DOM context.
- Stores the library locally in `chrome.storage.local`.
- Opens as a compact in-page panel with category filters, search, and view/theme toggles.
- Keeps visible product cards clean: short commercial model name, brand, image, source URL, and original site price.
- Lets users edit saved brand, name, price, image URL, and category.
- Exports and imports local JSON backups.
- Supports sale display with current price and compare-at price.
- Converts totals with cached RUB fallback rates while preserving the original site currency on cards.

## Install locally

1. Open `chrome://extensions` in Chrome or Arc.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select the `extension` folder from this repo.
5. Click the Tuckio extension icon to open the in-page panel.
6. Open a product page or product grid, right click an item/image/card, then choose **Save to Tuckio**.

## Privacy

Tuckio has no backend, accounts, telemetry, or hidden collection. Saved items stay in local browser storage.

The publishable privacy policy is in [PRIVACY.md](PRIVACY.md).

Tuckio uses `activeTab`, `contextMenus`, `scripting`, and `storage`. It does not request persistent all-site host access. Content scripts are injected only after the user clicks the extension action or chooses **Save to Tuckio** from the context menu on an HTTP/HTTPS page.

Current network behavior is limited to user-triggered save/open flows:

- Product-page enrichment can fetch the same-origin product page when the clicked card is missing title, image, price, or a sharper product image.
- Shopify enrichment can fetch a matching `/products/<handle>.js` endpoint on the user-selected product URL origin.
- Currency totals can fetch RUB exchange rates from `https://open.er-api.com/v6/latest/<currency>` and cache the numeric rate locally.
- Saved product images can load from the original shop when the panel is open, with `referrerpolicy="no-referrer"` on rendered image elements.

Tuckio does not call a remote favicon proxy or render passive third-party favicon lookups.

## Project structure

```text
extension/
  manifest.json
  background.js
  content/
    bootstrap.js
    constants.js
    extractors/
    panel/
    pricing/
    styles/
    storage.js
    text.js
    utils.js
```

Content scripts are ordered classic MV3 files and dynamically injected from `CONTENT_SCRIPT_FILES` in `extension/background.js`. If a content file is added, removed, renamed, or reordered, update that list and keep `extension/content/constants.js` first and `extension/content/bootstrap.js` last. `extension/manifest.json` intentionally does not declare always-on `content_scripts`.

## Development

This repo intentionally has no build step.

- Prefer small, visible changes.
- Keep new source modules under 400 lines.
- Keep `extension/content/constants.js` first and `extension/content/bootstrap.js` last in the content-script order.
- When changing content-script behavior, bump `CONTENT_VERSION` in `extension/content/constants.js`.
- When changing extension behavior or assets, bump the patch version in `extension/manifest.json`.
- Keep storage keys namespaced under `tuckio.*`; schema changes need explicit versioning or migration.
- Run the cheapest relevant check after edits, usually `node --check` for changed JS files.

Useful checks:

```bash
find extension/content -type f -name '*.js' -print | sort | xargs node --check
node --check extension/background.js
find scripts -maxdepth 1 -name 'smoke-*.js' -print | sort | xargs -n1 node
```

## Status

Tuckio is approaching a v0.1 public release. It currently focuses on local saving, generic extraction, manual correction, JSON backup export/import, and a polished in-page panel. It does not include sync, accounts, price tracking, store-specific adapters, or Chrome Web Store packaging automation yet.

## License

MIT

Third-party notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
