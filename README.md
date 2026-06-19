# Wishlisted

Chrome/Arc extension MVP for saving shopping items from across the web into a local visual wishlist.

## Load locally

1. Open Chrome or Arc extensions.
2. Enable developer mode.
3. Choose "Load unpacked".
4. Select the `extension` folder.
5. Click the Wishlisted extension icon to open the in-page wishlist panel.
6. Open a product page or product grid, right click the item/image/card, then choose `Save to Wishlisted`.

## MVP scope

- Generic product extraction from right-clicked cards, schema.org data, app JSON, Shopify product JSON, OpenGraph, and common product selectors.
- One-click right-click save with auto-category.
- Local `chrome.storage.local` wishlist.
- Animated in-page save confirmation.
- In-page wishlist panel with category filters.
- Search in saved items.
- Editable categories from the panel settings button.
- RUB-first price display with original price secondary.
- Source favicon derived from the saved URL.

The current build has no backend sync, accounts, price tracking, or store-specific adapters beyond generic extraction.

## Local workflow

- Each code/content change is committed locally.
- Extension behavior changes bump both `CONTENT_VERSION` in `extension/content.js` and the patch version in `extension/manifest.json`.
- Source modules target 400 lines max; see `AGENTS.md` and `REFACTOR.md` before adding broad feature work.
