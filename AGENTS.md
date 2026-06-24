# Tuckio Agent Rules

Work like a pragmatic product engineer.

- Keep changes small, visible, and directly tied to the current request.
- Preserve user changes; do not reset or rewrite unrelated files.
- Prefer the extension's existing plain MV3 structure over adding build tooling.
- Use `rg` for search and `apply_patch` for manual edits.
- Run the cheapest relevant check after edits, usually `node --check` for changed JS.
- When changing content-script behavior in `extension/content/**`, bump `CONTENT_VERSION` in `extension/content/constants.js` so Arc/Chrome reinjects the new scripts.
- Content scripts are ordered plain MV3 files and dynamically injected after user gestures. When adding, removing, renaming, or reordering them, update `CONTENT_SCRIPT_FILES` in `extension/background.js`; keep `extension/content/constants.js` first and `extension/content/bootstrap.js` last.
- When changing extension behavior/assets, bump `extension/manifest.json` by one patch version (`0.0.1`) in the same update.
- Hard rule: never push directly to the current tracking branch or to `main`. Publishing changes to GitHub must go through a pull request: check `git status` first, stage only intended project files, run the cheapest relevant checks, commit with a concise imperative message, push a PR branch, and open a pull request before reporting done. If PR creation is not requested, keep changes local.
- Hard rule: do not render shop logos as SVG wordmarks or generated SVG art. Source marks must stay icon-only.
- Source modules target `400` lines max. New modules must stay under that. If a change would add meaningful size to a large file, extract a focused module first or record a refactor task.
- Render/component functions target `80` lines max; parser/extraction helpers target `120` lines max. Split by responsibility before adding another branch to a large function.
- Chrome Web Store readiness is a hard constraint: no remote executable code, no `eval`, no `new Function`, no dynamic execution of fetched text, no unnecessary permissions, no hidden collection of personal data, no background scraping beyond user-triggered save/open flows, and every new network request must be documented and non-executable.
- Keep MV3 security posture strict: scripts and libraries must be packaged with the extension, CSP must stay `script-src 'self'`, web-accessible resources must be minimal, and broad host access must remain avoided unless a future cross-shop workflow cannot work with `activeTab`/optional host permissions.
- Content scripts are injected into the active page after explicit save/open gestures, so do not add passive page analysis, polling, timers, or remote calls outside explicit save/open/settings flows. Heavy parsing should stay behind a user-triggered path.
- Do not use remote favicon proxies or passive third-party asset lookups for saved items; those leak saved shop domains. Use local fallback glyphs unless the user explicitly accepts the privacy tradeoff.
- Storage changes must be version-aware: keep stable keys, add explicit migrations for schema changes, and preserve previously saved items.
- Card data quality is a hard constraint: never ship visible titles containing SKU/catalog/article IDs, raw SEO/material descriptions, availability copy, social/share text, or other parser noise. If the parser cannot produce a short commercial model name plus brand and visible site price when a price exists on the page, fix the parser before polishing UI.
- Parser/extraction changes must include a targeted regression smoke for the failing shop/case plus at least one nearby existing parser case before commit; do not rely on screenshots alone.
- Do not add visible containers, pills, cards, badges, or backgrounds around simple text or icons unless explicitly requested.
- Keep final updates short and factual.
