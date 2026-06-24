# Tuckio v0.1.436 Release Notes

## Single purpose

Save products from arbitrary shops into a private local library.

Tuckio should be described publicly as a local shopping/product saver, not as price tracking, deal discovery, social shopping, sync, or account-based wishlist software.

Use `tuckio.com` as the public product URL.

Chrome Web Store listing:

https://chromewebstore.google.com/detail/akehcgpjghmmenhicldnppjjelkipfpk

## Store update behavior

Chrome Web Store users receive the new package automatically after review and publication. Do not add extension-side remote code loaders or custom update polling. The Store update path depends on a higher `extension/manifest.json` version.

## Chrome Web Store permission notes

- `activeTab`: temporary access to the current HTTP/HTTPS tab after the user clicks Tuckio or the context menu.
- `contextMenus`: exposes **Save to Tuckio** on pages, links, images, and selections.
- `scripting`: dynamically injects packaged content scripts after a user gesture.
- `storage`: stores saved items, categories, settings, and cached currency rates locally.

The extension intentionally does not request persistent `host_permissions` or manifest `content_scripts`.

Packaged web-accessible resources are limited to local app artwork, extension icons, Phosphor SVG icons, and bundled font files. They use dynamic extension URLs.

## Privacy notes

- No backend, account, telemetry, analytics, or remote executable code.
- Saved data remains in `chrome.storage.local`.
- Product enrichment can fetch same-origin product pages and Shopify `/products/<handle>.js` endpoints on the user-selected product URL origin during a user-triggered save.
- RUB summary conversion can request `https://open.er-api.com/v6/latest/<currency>` and caches numeric rates locally.
- Rendered product images use `referrerpolicy="no-referrer"`.
- Tuckio does not call a remote favicon proxy or render passive third-party favicon lookups.
- The panel uses packaged fonts and icons instead of remote font CSS or executable UI assets.
- The Chrome Web Store privacy URL should match `PRIVACY.md`.
- Third-party icon attribution is recorded in `THIRD_PARTY_NOTICES.md`.
- Web-accessible resources use dynamic extension URLs to reduce extension fingerprinting.

## Update checklist

- Bump `extension/manifest.json` patch version for extension behavior or asset changes.
- Bump `CONTENT_VERSION` in `extension/content/constants.js` when content-script behavior changes.
- Run syntax checks and smoke scripts:
  - `find extension/content -type f -name '*.js' -print | sort | xargs node --check`
  - `node --check extension/background.js`
  - `find scripts -maxdepth 1 -name 'smoke-*.js' -print | sort | xargs -n1 node`
- Run Playwright QA when changing panel workflows or parser behavior:
  - `node scripts/qa-panel-decisions-e2e.js`
  - `node scripts/qa-live-sites-e2e.js`
- Load unpacked extension in Chrome and Arc.
- Verify action click opens the panel on a product page.
- Verify right-click save on product page, product link, and product image.
- Verify edit saved item updates brand, name, price, image, and category.
- Verify JSON backup export downloads and contains `tuckio.backup.v1`.
- Verify JSON backup import merges valid saved items without duplicating existing saved product URLs.
- Build the Chrome Web Store ZIP from inside `extension/` so `manifest.json` is at archive root.
- Run `unzip -t` on the generated ZIP before upload.
- Refresh Chrome Web Store screenshots when the visible panel or onboarding changes.
- Keep the Chrome Web Store privacy URL pointed at the policy matching the behavior above.
