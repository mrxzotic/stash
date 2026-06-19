# Stash Refactor Notes

Current structure:
- `extension/background.js`: MV3 service-worker events, context menu, action click, and dynamic content-script injection.
- `extension/content/constants.js`: shared constants, storage keys, defaults, and `CONTENT_VERSION`.
- `extension/content/extractors/`: product extraction from JSON-LD, embedded data, DOM, context targets, and enrichment.
- `extension/content/pricing/`: price parsing, DOM price lookup, and currency conversion rates.
- `extension/content/panel/`: panel rendering, event binding, and item interactions.
- `extension/content/styles/`: panel and overlay CSS chunks.
- `extension/content/bootstrap.js`: message handling and content-script startup.

Rules:
- Keep the extension plain MV3 unless a build step becomes clearly necessary.
- Keep each source module under 400 lines.
- Update both `extension/manifest.json` and `CONTENT_SCRIPT_FILES` in `extension/background.js` when content-script files change.
- Keep `content/bootstrap.js` last in the ordered script list.
