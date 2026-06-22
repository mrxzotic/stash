# Tuckio Privacy Policy

Last updated: June 21, 2026

Tuckio is a local shopping/product saver. It saves products from pages the user explicitly opens or right-clicks and keeps the product library in local browser storage.

## Data Tuckio Handles

Tuckio can save product URLs, source domains, product names, brands, prices, image URLs, categories, archive state, settings, cached currency rates, and JSON backups imported by the user.

Tuckio does not collect accounts, passwords, payment details, emails, contacts, precise location, health data, or browsing history unrelated to a user-triggered save/open flow.

## Storage

Saved items, categories, settings, archive state, and cached currency rates are stored in `chrome.storage.local` on the user's device.

Tuckio has no backend account system and does not sync saved items to a server.

## Network Use

Tuckio does not use analytics, telemetry, advertising identifiers, tracking pixels, or remote executable code.

Network activity is limited to user-facing save/open flows:

- Product-page enrichment can fetch the same-origin product page when saved card data is incomplete.
- Shopify enrichment can fetch `/products/<handle>.js` on the origin of the user-selected product URL.
- Currency totals can fetch RUB exchange rates from `https://open.er-api.com/v6/latest/<currency>` and cache numeric rates locally.
- Saved product images can load from their original shop when the panel is open. Rendered image elements use `referrerpolicy="no-referrer"`.

Tuckio does not call remote favicon proxies or perform passive third-party asset lookups for saved shops.

## Sharing

Tuckio does not sell user data, transfer user data for advertising, or allow humans to read saved user data.

The only data sent to third parties is the minimal request data required by the user-facing network behavior above. For example, an exchange-rate request includes the selected currency code, and a product enrichment request goes to the same shop origin for the product the user chose to save.

## User Control

Users can edit or delete saved items inside Tuckio. Users can export a local JSON backup or import a JSON backup file. Removing the extension or clearing extension storage removes locally stored Tuckio data from that browser profile.

## Limited Use Statement

Tuckio's use of information received from Google APIs adheres to the Chrome Web Store User Data Policy, including the Limited Use requirements.
