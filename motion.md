# Motion System

Motion in Stashed is product feedback, not decoration. It should make saves feel immediate and legible without adding noise, blocking controls, or changing layout.

## Hard Rules

- Use CSS-driven reveal motion. JavaScript may set state and render classes, but it must not run frame-by-frame animation logic.
- Keep motion one-shot unless it is direct interaction feedback. No ambient infinite shimmer.
- Respect `prefers-reduced-motion: reduce`: hide skeletons, remove animation, remove blur/filter, set final opacity and transform.
- Skeleton layers are visual only: `aria-hidden="true"` and `pointer-events: none`.
- Motion must not resize cards, rows, image frames, buttons, or text containers during reveal.
- Do not add remote assets, remote code, fetched animation JSON, `eval`, or dynamic execution.
- When content behavior changes, bump `CONTENT_VERSION` in `extension/content/constants.js`, keep `CONTENT_SCRIPT_VERSION` in `extension/background.js` in sync, and bump `extension/manifest.json` by one patch version.
- When adding, removing, or reordering motion modules, update `CONTENT_SCRIPT_FILES` in `extension/background.js`.
- Keep source modules under the project size limits. Extract a focused module before growing a large renderer/style file.
- Add or update a targeted smoke test for every new motion contract.

## Script Order

These order constraints are part of the motion contract:

- `content/panel/motion.js` before `content/panel/render.js`
- `content/overlay-motion.js` before `content/overlays.js`
- `content/styles/panel-rebuild-motion.js` before `content/styles/panel.js`
- `content/styles/panel-save-motion.js` before `content/styles/panel.js`
- `content/styles/panel-interaction-motion.js` before `content/styles/panel.js`
- `content/styles/overlay-motion.js` before `content/styles/overlay.js`
- Image motion helpers stay before their owning render/style modules:
  - `content/overlay-images.js` before `content/overlays.js`
  - `content/styles/overlay-images.js` before `content/styles/overlay.js`
  - `content/styles/panel-images.js` before `content/styles/panel.js`

## Saved Overlay Reveal

Files:

- `extension/content/overlay-motion.js`
- `extension/content/styles/overlay-motion.js`
- `extension/content/overlays.js`
- `extension/content/styles/overlay.js`

Render contract:

- The saved overlay panel renders with `wl-panel is-motion-reveal`.
- `renderSavedOverlaySkeleton()` is rendered as the first child inside the panel.
- The skeleton mirrors real zones: header, timer, image, fields, and actions.
- The skeleton contains no visible product copy.

Timing contract:

1. Panel enters with `wlPanelMotionIn` for `360ms`.
2. Skeleton layer enters, sweeps, and exits with `wlSkeletonLayer` and `wlSkeletonSweep` for `980ms`.
3. Header rises with `wlContentRise`, delayed `260ms`.
4. Media shell enters with `wlMediaShellIn`, delayed `410ms`.
5. Product image or placeholder reveals with `wlProductReveal`, delayed `520ms`.
6. Field rows rise with `wlContentRise`, delayed `680ms`, `750ms`, and `820ms`.
7. Action row rises with `wlContentRise`, delayed `910ms`.
8. Buttons settle with `wlButtonSettle`, delayed `980ms`.

Visual contract:

- The overlay card keeps app-sized proportions and stable internal spacing.
- The background wash may be iridescent, but it should stay around `15%` strength and read as depth, not decoration.
- Shine or blink effects are one-shot reveal accents only.
- Product image reveal uses a subtle scale and clipped reveal, not a hard fade.
- Text reveal may use a short blur only during entry.
- The progress/timer bar is inside the card header area, not detached at the window edge.
- Confidence data stays out of the saved overlay unless product direction explicitly reverses that decision.

## Panel Opening

Files:

- `extension/content/lifecycle.js`
- `extension/content/panel/render.js`
- `extension/content/styles/panel.js`

Opening Stashed must replay the panel opening animation every time the app opens.

Contract:

- `openStashPanel()` sets `panelState.hasRenderedPanel = false` before `renderStashPanel()`.
- `renderStashPanel()` applies `is-static` only after the first render.
- The shell opening animation should run on open, not on every internal panel rerender.
- Closing the panel clears `hasRenderedPanel`, `highlightedItemId`, and `displacedItemId`.

## Panel Rebuild Motion

Files:

- `extension/content/panel/motion.js`
- `extension/content/styles/panel-rebuild-motion.js`
- `extension/content/panel/search.js`
- `extension/content/panel/compact-view.js`
- `extension/content/panel/events.js`

This covers interaction rebuilds while Stashed is already open: card/list mode changes and light/graphite theme changes.

Contract:

- Use `renderPanelTopbarOnly(root, "search")` when the search topbar has to replace the summary topbar.
- Use `savePanelSettings(..., { rerender: false, syncViewMode: true, rebuildMotion: "view" })` for card/list changes.
- Use `savePanelSettings(..., { rerender: false, rebuildMotion: "theme" })` for light/graphite changes.
- Do not full-render the shell just to open or close search.
- Do not use rebuild motion for search. Search open/close is a topbar-only swap and must not move the item list.
- Do not full-render the shell just to toggle list mode or theme.
- Do not animate every search keystroke. Live search input should update results directly and stay quiet.
- `panelState.rebuildMotion` is transient and must clear after the reveal window.

Timing contract:

1. Card/list rebuild uses `wpPanelViewRebuild` for about `500ms`.
2. Card/list items use `wpPanelItemRebuild` for about `430ms` with a small stagger.
3. Theme changes use `wpPanelThemeShift`, `wpPanelThemeWash`, and `wpPanelThemeContent` for about `480-520ms`.
4. Rebuild classes clear after `620ms`.

## Panel Card Layout Motion

Files:

- `extension/content/panel/motion.js`
- `extension/content/panel/render.js`
- `extension/content/panel/reorder.js`
- `extension/content/panel/compact-view.js`
- `extension/content/styles/panel-rebuild-motion.js`

This covers existing cards when rows are added, removed, filtered, sorted, archived, restored, or deleted while the panel is open.

Contract:

- Every rendered card and compact row must carry `data-panel-item-id` and `data-panel-motion-id`.
- Brand cloud buttons must carry `data-panel-motion-id="brand:*"` so cloud/list transitions use the same FLIP path.
- Before a list render, capture existing card or brand positions with `capturePanelItemLayout(root)`.
- After the list render, call `animatePanelItemLayout(root, previousRects)`.
- Card mode renders two stable `.wp-item-column` containers so variable-height cards stack tightly instead of sharing CSS grid row heights.
- Pure sort changes should move existing card nodes between the stable columns, or update CSS visual order for compact/brand nodes, instead of replacing list HTML or recreating card nodes, then run the same layout motion.
- Brand sort changes must keep `brandCloudOpen` true, set the brand cloud into sorted-list mode, update CSS order on existing brand buttons, and stay centered instead of using the card-list offset.
- Existing cards glide from their old position to their new position using `is-layout-moving` then `is-layout-settling`.
- Sort/card layout motion has a hard stop: when the card's `transform` transition ends, detach the listener and park the card in `is-layout-positioned`.
- Do not remove the final zero transform or drop compositor state on transition end. That end cleanup repaints every sorted card as a visible flash.
- Existing card-node sort movement must add `is-reordering` to the list so normal entrance animations do not restart when nodes move between columns.
- Card entrance can be staggered on panel open/filter rerender, but not during existing-node sort movement.
- If a moved card finishes under the pointer, keep `is-layout-hover-muted` until pointer leave so hover lift does not fire as the final end-state twitch.
- Do not schedule fallback timers, cooling timers, delayed class removals, or post-sort visual cleanup. Any delayed cleanup reads as a late flicker.
- Layout movement animates translate only. Do not animate filter or scale at the settle boundary; either can cause a one-frame flash.
- Hover glow must stay suppressed through move, settle, and hover-muted states.
- Cleanup must wait for the card's `transform` transition end. No timeout fallback.
- New cards use the saved-card reveal and skeleton, not the layout movement.
- Cards with `is-shifted-right` keep the explicit save displacement animation instead of also receiving layout FLIP.
- Brand cloud view participates in layout movement for brand buttons; only new saved cards and displaced cards skip FLIP.
- Reduced motion skips card layout movement.

## Panel Interaction Polish

Files:

- `extension/content/styles/panel-interaction-motion.js`
- `extension/content/panel/filter-controls.js`
- `extension/content/panel/prices.js`
- `extension/content/pricing/rates.js`

This covers persistent interaction feel after the panel is already open.

Contract:

- Hover must not call `renderStashPanel()` or replace panel HTML.
- Hover-driven filter controls should not write layout state when visibility did not change.
- Item hover transforms should stay on composited layers and must not override `is-layout-moving` or `is-layout-settling`.
- The card-list top offset must be measured from visible filter children, not the full filter container, so hidden controls cannot create phantom rows.
- When optional third-row controls become visible, update only the card-list top offset so cards reserve space without a panel rerender.
- Category filters live in one non-wrapping horizontal rail. Do not let the category taxonomy wrap into multiple rows.
- The active category should be scrolled into view after render rather than pinned with layout-affecting sticky behavior.
- Sort is separate from filtering: one stable sort trigger plus a menu of explicit choices, not hover-revealed sort chips inside the category rail.
- Graphite search uses its own iridescent palette: cool cyan, violet, and rose over dark glass.
- Do not reuse the light-mode mint/pink wash directly in graphite search.
- Graphite currency menus must be dark glass, not a light popover with graphite text.
- Currency option labels, selected rows, and symbols must stay readable in graphite mode.
- Count, filter, sort, icon, save, info, currency, and clear-search pills use the same smooth hover curve: `cubic-bezier(.22, 1, .36, 1)`.
- Hover must not call render paths or write card HTML.
- Hover affordance sizing must stay local to the control itself. Do not run JS layout syncing or whole-panel render paths just because hover controls appear.
- Sort controls must not use native `title` tooltips. They appear after hover delay and read as a one-frame flicker; use `aria-label` only.
- Sort menu open/close should update only the sort control DOM; it must not rerender cards or the full shell.
- Hover lift stays subtle: around `-1px`, with no layout shift.
- Reduced motion removes these hover/reveal transitions.

## Currency And Material Motion

Files:

- `extension/content/pricing/rates.js`
- `extension/content/panel/prices.js`
- `extension/content/styles/panel-1.js`
- `extension/content/styles/panel-currency.js`

Contract:

- Card and overlay prices render on one baseline: converted home-currency primary price first, compare-at beside it, native price muted beside that only when the native currency differs from the selected global currency.
- If the native product currency equals the selected global currency, do not round-trip the amount through stored RUB. Show the native price once.
- Currency changes must update visible card prices in place with the price recount animation. Do not full-render the shell just to change currency.
- Price recount motion is local to `.wp-price-row`; it must not move the card, resize rows, or trigger saved-card skeletons.
- Use three material levels: chrome for topbar, filters, search, sort, and currency controls; airy cards for product content; strongest popover material for currency menus and dialogs.
- Frost chrome through shared tokens, not one-off control colors: `--wp-chrome-*`, `--wp-card-*`, and `--wp-popover-*`.
- Graphite chrome and popovers must remain dark, readable, and heavily frosted. Do not show light popovers in graphite mode.

## Open-Panel Save Motion

Files:

- `extension/content/panel/motion.js`
- `extension/content/styles/panel-save-motion.js`
- `extension/content/lifecycle.js`
- `extension/content/panel/render.js`

This is the save flow when the panel is already open and the user saves through `+`, context menu, or shortcut.

State contract:

- `panelState.highlightedItemId` is the newly saved card.
- `panelState.displacedItemId` is the previous top visible card only when the list context did not change.
- Clear both states after `1400ms`.

Do not shift the previous card when:

- The active category changed.
- Search was cleared or changed.
- Compact view is active.
- Archive view is active.
- Brand cloud root is active.
- The saved item is not the first visible item after sorting/filtering.

Render contract:

- New card gets `wp-item is-new`.
- Previous top card gets `wp-item is-shifted-right`.
- `is-new` renders `renderPanelNewItemSkeleton()` as the first child in the item.
- The skeleton mirrors card zones: media, brand, title, and price.

Timing contract:

1. New card shell enters with `wpNewCardShell` for `520ms`.
2. New card skeleton enters, sweeps, and exits with `wpNewCardSkeletonLayer` and `wpNewCardSkeletonSweep` for `940ms`.
3. Previous top card shifts into the right slot with `wpCardShiftRight` for `520ms`, delayed `60ms`.
4. New media shell enters with `wpNewCardMediaIn`, delayed `360ms`.
5. Product image or placeholder reveals with `wpNewCardProductReveal`, delayed `450ms`.
6. Brand, title, and price rise with `wpNewCardCopyRise`, delayed `650ms`, `720ms`, and `790ms`.
7. Card glow runs once with `wpNewCardGlow` for `1180ms`.
8. Highlight and displacement state clears after `1400ms`.

## Image Carousel Motion

Files:

- `extension/content/overlay-images.js`
- `extension/content/styles/overlay-images.js`
- `extension/content/styles/panel-images.js`

Contract:

- Saved overlay supports sliding across available images and deleting the active alternate image.
- Main panel image controls must stay consistent with the saved overlay controls.
- Sliding images should feel direct and quiet. Do not trigger the full saved overlay or new-card skeleton just because the selected image changed.
- Delete and slide controls must remain keyboard-accessible and visible on focus.
- If a DOM replacement forces an image reveal, keep it local to the image frame.

## Reduced Motion

Every motion surface must provide a reduced-motion branch.

Required behavior:

- Hide skeleton layers.
- Set animated content to `opacity: 1`.
- Set `transform: none`.
- Set `filter: none`.
- Set `animation: none`.
- Keep the same DOM order and accessible controls.

## Checks

Run the cheapest relevant checks for the touched slice:

- Saved overlay motion: `node scripts/smoke-saved-overlay.js`
- Open-panel save motion: `node scripts/smoke-panel-save-motion.js`
- Script ordering changes: `node scripts/smoke-content-script-order.js`
- Background or context-menu changes: `node scripts/smoke-context-menu.js`
- Panel card/action changes: `node scripts/smoke-panel-accessibility.js`
- Changed JavaScript syntax: `node --check <changed-js-files>`

## Do Not

- Do not put progress bars at the top edge of the browser overlay.
- Do not reintroduce confidence percentages into the saved overlay by default.
- Do not animate every rerender.
- Do not animate hover-only controls in a way that hides them from keyboard focus.
- Do not add instructional text explaining the animation in the UI.
- Do not let skeletons cover clickable controls after the reveal window.
- Do not make image, text, or button dimensions unstable during animation.
