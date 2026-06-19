# Wishlisted Refactor Notes

Current debt:
- `extension/content.js` is a legacy monolith at more than 4,000 lines.
- `extension/popup.js` is also above the new 400-line source module target.
- Product extraction now has enough site-specific fallback logic that the next parser feature should split it before adding more heuristics.

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
