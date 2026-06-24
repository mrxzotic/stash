# Tuckio

Tuckio is a plain Manifest V3 Chrome/Arc extension for saving products from any shop into a private local library.

The v0.1 promise is intentionally narrow: save products cleanly from arbitrary shops, keep the library local, and make saved data easy to correct or back up. The public product domain is `tuckio.com`.

Chrome Web Store listing: https://chromewebstore.google.com/detail/akehcgpjghmmenhicldnppjjelkipfpk

Current extension version: `0.1.432`.

## What it does

- Saves products from right-clicked product cards, images, links, and product pages.
- Extracts product data from schema.org JSON-LD, embedded app JSON, Shopify product JSON, OpenGraph, microdata, and DOM context.
- Stores the library locally in `chrome.storage.local`.
- Opens as a compact in-page panel with category filters, shortlist, archive, search, and view/theme toggles.
- Keeps visible product cards clean: short commercial model name, brand, image, source URL, and original site price.
- Lets users edit saved brand, name, price, image URL, category, and item state.
- Exports and imports local JSON backups.
- Supports sale display with current price and compare-at price.
- Converts totals with cached RUB fallback rates while preserving the original site currency on cards.

## Install

Install the published extension from the Chrome Web Store:

https://chromewebstore.google.com/detail/akehcgpjghmmenhicldnppjjelkipfpk

## Install locally

Use the local install flow for development and release checks:

1. Open `chrome://extensions` in Chrome or Arc.
2. Enable Developer mode.
3. Choose **Load unpacked**.
4. Select the `extension` folder from this repo.
5. Click the Tuckio extension icon to open the in-page panel.
6. Open a product page or product grid, right click an item/image/card, then choose **Save to Tuckio**.

## Safari local wrapper

The Safari wrapper lives in `safari/Tuckio` and references the canonical `extension` folder instead of copying it.

Regenerate it with:

```bash
xcrun safari-web-extension-packager extension \
  --project-location safari \
  --app-name Tuckio \
  --bundle-identifier com.tuckio.tuckio \
  --swift \
  --macos-only \
  --no-open \
  --no-prompt
```

Build it with:

```bash
xcodebuild -project safari/Tuckio/Tuckio.xcodeproj \
  -scheme Tuckio \
  -configuration Debug \
  -destination 'platform=macOS' \
  build
```

For local runtime testing in Safari, enable Safari Settings -> Advanced -> Show features for web developers, then Safari Settings -> Developer -> Allow unsigned extensions. A distributable Safari build needs an Apple code-signing identity configured in Xcode.

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

UI icons, product app artwork, and bundled Inter/IBM Plex Mono font subsets are packaged with the extension. The panel does not fetch remote font CSS or executable UI assets.

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

Playwright QA scripts require a local Chrome-compatible browser and a `playwright` Node module available to Node. Set `CHROME_PATH` if Chrome is not installed at the default macOS path.

```bash
node scripts/qa-panel-decisions-e2e.js
node scripts/qa-live-sites-e2e.js
```

## Release packaging

Chrome Web Store packages are ZIPs built directly from the `extension` folder. `manifest.json` must be at the archive root, not nested inside an `extension/` directory.

```bash
version=$(node -p "require('./extension/manifest.json').version")
stamp=$(date +%Y%m%d-%H%M%S)
mkdir -p output/chrome-web-store
(cd extension && zip -qr "../output/chrome-web-store/tuckio-chrome-v${version}-${stamp}.zip" . -x '*.DS_Store' '__MACOSX/*')
unzip -t "output/chrome-web-store/tuckio-chrome-v${version}-${stamp}.zip"
```

Generated release ZIPs and Playwright screenshots stay local under `output/`; do not commit them.

## Status

Tuckio v0.1 is published on the Chrome Web Store. It currently focuses on local saving, generic extraction, manual correction, JSON backup export/import, archive/state workflows, and a polished in-page panel. It does not include sync, accounts, price tracking, store-specific adapters, or background shopping automation.

## License

MIT

Third-party notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
