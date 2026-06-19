# Wishlisted Agent Rules

Work like a pragmatic product engineer.

- Keep changes small, visible, and directly tied to the current request.
- Preserve user changes; do not reset or rewrite unrelated files.
- Prefer the extension's existing plain MV3 structure over adding build tooling.
- Use `rg` for search and `apply_patch` for manual edits.
- Run the cheapest relevant check after edits, usually `node --check` for changed JS.
- When changing content-script behavior in `extension/content/**`, bump `CONTENT_VERSION` in `extension/content/constants.js` so Arc/Chrome reinjects the new scripts.
- Content scripts are ordered plain MV3 files. When adding, removing, renaming, or reordering them, update both `extension/manifest.json` `content_scripts[].js` and `CONTENT_SCRIPT_FILES` in `extension/background.js` in the same change.
- When changing extension behavior/assets, bump `extension/manifest.json` by one patch version (`0.0.1`) in the same update.
- Every completed code/content change must end with a local git commit. Check `git status` first, stage only intended project files, run the cheapest relevant checks, then commit locally with a concise imperative message.
- Source modules target `400` lines max. New modules must stay under that. Existing oversized files are legacy debt; do not grow them for broad features. If a change would add meaningful size to an oversized file, extract a focused module first or record a refactor task.
- Render/component functions target `80` lines max; parser/extraction helpers target `120` lines max. Split by responsibility before adding another branch to a large function.
- Chrome Web Store readiness is a hard constraint: no remote executable code, no `eval`, no `new Function`, no dynamic execution of fetched text, no unnecessary permissions, no hidden collection of personal data, no background scraping beyond user-triggered save/open flows, and every new network request must be documented and non-executable.
- Keep MV3 security posture strict: scripts and libraries must be packaged with the extension, CSP must stay `script-src 'self'`, web-accessible resources must be minimal, and broad host access must remain justified by the cross-shop save workflow or be moved toward `activeTab`/optional host permissions.
- Content scripts run on all matched shopping pages, so do not add passive page analysis, polling, timers, or remote calls outside explicit save/open/settings flows. Heavy parsing should stay behind a user-triggered path or be lazy-injected if it becomes expensive.
- Storage changes must be version-aware: keep stable keys, add explicit migrations for schema changes, and preserve previously saved wishlist items.
- Card data quality is a hard constraint: never ship visible titles containing SKU/catalog/article IDs, raw SEO/material descriptions, availability copy, social/share text, or other parser noise. If the parser cannot produce a short commercial model name plus brand and visible site price when a price exists on the page, fix the parser before polishing UI.
- Do not add visible containers, pills, cards, badges, or backgrounds around simple text or icons unless explicitly requested.
- Keep final updates short and factual.
