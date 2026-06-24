# Tuckio v0.1 Release Notes

## Single purpose

Save products from arbitrary shops into a private local library.

Tuckio should be described publicly as a local shopping/product saver, not as price tracking, deal discovery, social shopping, sync, or account-based wishlist software.

Use `tuckio.com` as the public product URL.

Chrome Web Store listing:

https://chromewebstore.google.com/detail/akehcgpjghmmenhicldnppjjelkipfpk

## Chrome Web Store permission notes

- `activeTab`: temporary access to the current HTTP/HTTPS tab after the user clicks Tuckio or the context menu.
- `contextMenus`: exposes **Save to Tuckio** on pages, links, images, and selections.
- `scripting`: dynamically injects packaged content scripts after a user gesture.
- `storage`: stores saved items, categories, settings, and cached currency rates locally.

The extension intentionally does not request persistent `host_permissions` or manifest `content_scripts`.

## Privacy notes

- No backend, account, telemetry, analytics, or remote executable code.
- Saved data remains in `chrome.storage.local`.
- Product enrichment can fetch same-origin product pages and Shopify `/products/<handle>.js` endpoints on the user-selected product URL origin during a user-triggered save.
- RUB summary conversion can request `https://open.er-api.com/v6/latest/<currency>` and caches numeric rates locally.
- Rendered product images use `referrerpolicy="no-referrer"`.
- Tuckio does not call a remote favicon proxy or render passive third-party favicon lookups.
- The Chrome Web Store privacy URL should match `PRIVACY.md`.
- Third-party icon attribution is recorded in `THIRD_PARTY_NOTICES.md`.
- Web-accessible resources use dynamic extension URLs to reduce extension fingerprinting.

## Update checklist

- Run syntax checks and smoke scripts.
- Load unpacked extension in Chrome and Arc.
- Verify action click opens the panel on a product page.
- Verify right-click save on product page, product link, and product image.
- Verify edit saved item updates brand, name, price, image, and category.
- Verify JSON backup export downloads and contains `tuckio.backup.v1`.
- Verify JSON backup import merges valid saved items without duplicating existing saved product URLs.
- Refresh Chrome Web Store screenshots when the visible panel or onboarding changes.
- Keep the Chrome Web Store privacy URL pointed at the policy matching the behavior above.
