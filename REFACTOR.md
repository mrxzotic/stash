# Wishlisted Refactor Notes

Current state:
- `extension/content.js` has been split into ordered plain MV3 content scripts under `extension/content/**`.
- `extension/popup.js` is still above the 400-line source module target and appears legacy unless `action.default_popup` returns.
- Product extraction has enough fallback logic that new parser work should first isolate the touched extractor/helper instead of adding another branch to a large function.

Target split:
- `content/bootstrap.js`: message handling, panel lifecycle, storage subscriptions.
- `content/extractors/`: JSON-LD, embedded JSON, Shopify, DOM/context extraction.
- `content/pricing.js`: currency parsing, sale/compare-at parsing, rate conversion.
- `content/ui/`: panel rendering, settings controls, confirmation overlay.
- `content/styles.js`: CSS template and design tokens.

Refactor rule:
- Do not do a broad rewrite during tiny fixes.
- When a feature touches one area heavily, extract that area first, keep behavior unchanged, then apply the feature.
- Keep each source module under 400 lines after extraction.
- Keep `content/constants.js` first and `content/bootstrap.js` last in every content-script list.
- Keep `extension/manifest.json` `content_scripts[].js` and `CONTENT_SCRIPT_FILES` in `extension/background.js` identical in path set and order.
- Do not introduce build tooling, ES module imports for content scripts, remote scripts, or dynamic code execution during the split.
- Keep extracted files as classic scripts with explicit global helper dependencies until a separate architecture change replaces that contract.

Chrome extension guardrails:
- All executable code must be packaged in the extension. Remote fetches are allowed only for data and must never be executed.
- Keep CSP strict and do not add `unsafe-eval`, `unsafe-inline`, CDN scripts, or extra web-accessible resources without a concrete need.
- Keep permissions minimal. Broad `http://*/*` and `https://*/*` access is justified only by cross-shop saving; new permissions need a product reason and documentation.
- Since content scripts match all HTTP(S) pages, avoid passive scraping, polling, long timers, and network calls outside user-triggered save/open/settings flows.
- Storage schema changes must preserve existing saved items with explicit versioning or migration.

Parallel work lanes:
- Safe lanes after the split: background/injection, extractor quality, pricing/rates, panel rendering/events, styles, docs/assets.
- Risky shared surfaces: `content/constants.js`, `content/utils.js`, `content/text.js`, `content/pricing/parse.js`, storage keys, manifest script order, and version bumps.
- If two slices need the same shared helper, land the helper extraction first, then branch the feature work.

Verification:
- For changed JS, run the cheapest relevant syntax check: `node --check` on changed files, plus `extension/background.js` when script lists change.
- For script-list changes, smoke test extension load, action-button panel open, and right-click save on at least one product page.
- For parser changes, verify title, brand, image, URL, visible site price, sale state, and category on representative pages before UI polish.
