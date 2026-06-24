const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const backgroundSource = read("extension/background.js");
const constantsSource = read("extension/content/constants.js");
const lifecycleSource = read("extension/content/lifecycle.js");
const renderSource = read("extension/content/panel/render.js");
const filtersSource = read("extension/content/panel/filters.js");
const emptySource = read("extension/content/panel/empty.js");
const searchSource = read("extension/content/panel/search.js");
const compactViewSource = read("extension/content/panel/compact-view.js");
const preferencesSource = read("extension/content/panel/preferences.js");
const archiveSource = read("extension/content/panel/archive.js");
const filterEventsSource = read("extension/content/panel/filter-events.js");
const filterControlsSource = read("extension/content/panel/filter-controls.js");
const sortSource = read("extension/content/panel/sort.js");
const reorderSource = read("extension/content/panel/reorder.js");
const eventsSource = read("extension/content/panel/events.js");
const panelMotionSource = read("extension/content/panel/motion.js");
const panelStylesSource = read("extension/content/styles/panel.js");
const panelContentStylesSource = read("extension/content/styles/panel-content.js");
const panelChunk5Styles = read("extension/content/styles/panel-5.js");
const panelCurrencyStyles = read("extension/content/styles/panel-currency.js");
const panelRebuildMotionStyles = read("extension/content/styles/panel-rebuild-motion.js");
const panelMotionStyles = read("extension/content/styles/panel-save-motion.js");
const panelInteractionMotionStyles = read("extension/content/styles/panel-interaction-motion.js");
const motionDoc = read("motion.md");
const syncPanelViewStateBody = panelMotionSource.match(/function syncPanelViewState\(root, options = \{\}\) \{[\s\S]*?\n\}/)?.[0] || "";
const animatePanelItemLayoutBody = panelMotionSource.match(/function animatePanelItemLayout\(root, previousRects\) \{[\s\S]*?\n\}/)?.[0] || "";
const reorderPanelItemsOnlyBody = reorderSource.match(/function reorderPanelItemsOnly\(root\) \{[\s\S]*?\n\}/)?.[0] || "";

const contentVersion = constantsSource.match(/CONTENT_VERSION\s*=\s*"([^"]+)"/)?.[1];
assert.ok(contentVersion, "Content version should be declared");
assert.ok(
  backgroundSource.includes(`CONTENT_SCRIPT_VERSION = "${contentVersion}"`),
  "Background should inject the active panel save motion version"
);
assert.match(backgroundSource, /"content\/panel\/empty\.js",\s*"content\/panel\/motion\.js",\s*"content\/panel\/filters\.js",\s*"content\/panel\/preferences\.js",\s*"content\/panel\/render\.js",\s*"content\/panel\/reorder\.js"/, "Panel motion, filter, preference, and reorder helpers should load before item-only flows");
assert.match(backgroundSource, /"content\/styles\/panel-release\.js",\s*"content\/styles\/panel-decision-ui\.js",\s*"content\/styles\/panel-decision-motion\.js",\s*"content\/styles\/panel-edit\.js",\s*"content\/styles\/panel-rebuild-motion\.js",\s*"content\/styles\/panel-save-motion\.js",\s*"content\/styles\/panel-interaction-motion\.js",\s*"content\/styles\/panel-hints\.js",\s*"content\/styles\/panel\.js"/, "Panel motion styles should load before panel style composition");

assert.match(constantsSource, /displacedItemId: ""/, "Panel state should track the card displaced by an open-panel save");
assert.match(constantsSource, /rebuildMotion: ""/, "Panel state should track transient rebuild motion");
assert.match(constantsSource, /brandCloudSortList: false/, "Panel state should track sorted brand-cloud list mode separately from brand view");
assert.match(lifecycleSource, /panelState\.hasRenderedPanel = false;[\s\S]*?renderTuckioPanel\(\);/, "Opening Tuckio should replay the shell opening animation");
assert.match(lifecycleSource, /const listContextChanged =[\s\S]*?previousActiveCategory !== panelState\.activeCategory[\s\S]*?previousSearchQuery !== panelState\.searchQuery;/, "Shift-right motion should only run in the same visible list context");
assert.match(lifecycleSource, /panelState\.displacedItemId = listContextChanged \? "" : panelSavedItemDisplacedId\(item\);/, "Open-panel save should mark the displaced card before render");
assert.match(lifecycleSource, /panelState\.highlightedItemId = "";[\s\S]*?panelState\.displacedItemId = "";[\s\S]*?renderTuckioPanel\(\);/, "Open-panel save motion state should clear after the reveal");
assert.match(lifecycleSource, /function panelSavedItemDisplacedId/, "Displaced card should be derived from the visible card list");

assert.match(renderSource, /const isNew = item\.id === panelState\.highlightedItemId;/, "New card should use the existing highlighted item state");
assert.match(renderSource, /panelRebuildMotionClass\(panelState\.rebuildMotion\)/, "Panel render should add transient rebuild motion classes");
assert.match(renderSource, /finishPanelRebuildMotion\(root\)/, "Panel render should clear transient rebuild motion classes");
assert.match(renderSource, /capturePanelItemLayout\(root\)/, "Panel render should capture old card positions before rebuilds");
assert.match(renderSource, /animatePanelItemLayout\(root, previousItemRects\)/, "Panel render should animate card position changes after rebuilds");
assert.match(renderSource, /getPropertyValue\("--wp-items-padding-top"\) !== nextTop/, "Panel top offset sync should avoid redundant layout writes");
assert.match(renderSource, /function syncPanelItemsTopOffset\(root, options = \{\}\)/, "Panel top offset sync should support immediate row-control measurement");
assert.match(renderSource, /const chromeBottom = filters \? panelVisibleFiltersBottom\(filters\) : topbar\.getBoundingClientRect\(\)\.bottom;/, "Panel top offset should fall back to the topbar when the filter row is absent");
assert.match(renderSource, /const baseTop = filters[\s\S]*?\? \(panelState\.compactView \? 96 : 112\)[\s\S]*?: 80;/, "Zero-item panels should reserve topbar-only content padding");
assert.match(renderSource, /const measuredTop = chromeBottom - shellTop \+ 16;/, "Panel item list should reserve one grid step under the visible chrome");
assert.match(renderSource, /roundPanelGridOffset\(Math\.max\(baseTop, measuredTop\)\)/, "Brand cloud and card grid should share the same 8px-aligned content origin");
assert.match(renderSource, /function roundPanelGridOffset\(value\)[\s\S]*?Math\.ceil\(value \/ 8\) \* 8;/, "Panel content origin should snap to the 8px grid");
assert.doesNotMatch(renderSource, /isBrandCloudRoot \? baseTop : Math\.max\(baseTop, measuredTop\)/, "Brand cloud should not use a separate vertical offset from the item grid");
assert.match(renderSource, /function panelVisibleFilterChildBottom\(filters, child\)[\s\S]*?style\.visibility === "hidden"/, "Panel top offset should ignore hidden filter controls");
assert.match(renderSource, /function panelOptionalFilterControlIsVisible\(filters, child\)[\s\S]*?is-controls-visible/, "Panel top offset should include optional controls when the third row is visible");
assert.match(renderSource, /function panelIsOptionalFilterControl\(child\)[\s\S]*?wp-filter-add/, "Panel top offset should treat only add-category as optional chrome");
assert.match(renderSource, /const isShiftedRight = item\.id === panelState\.displacedItemId;/, "Displaced card should get a render-time class");
assert.match(renderSource, /is-shifted-right/, "Displaced card class should render into the card list");
assert.match(renderSource, /data-panel-item-id="\$\{escapeAttribute\(item\.id\)\}"/, "Card items should expose stable layout ids");
assert.match(renderSource, /data-panel-motion-id="\$\{escapeAttribute\(item\.id\)\}"/, "Card items should expose stable motion ids");
assert.match(renderSource, /renderPanelCardColumns\(items\)/, "Card mode should render through stable packed columns");
assert.match(renderSource, /const filtersNav = renderPanelFiltersNav\(filterCategories, panelArchivedCount\(displayItems\)\);/, "Panel render should omit the filter nav when there are no meaningful controls");
assert.match(filtersSource, /if \(!railControls\.trim\(\) && !viewControls\.trim\(\)\) \{[\s\S]*?return "";/, "Zero-item panels should not render an empty filter rail");
assert.match(sortSource, /function panelShouldShowSearchControl\(items = panelState\.items\)[\s\S]*?panelSearchableItems\(items\)\.length >= 3;/, "Search should appear only for a meaningful searchable scope");
assert.match(renderSource, /function renderPanelSearchTrigger\(\)[\s\S]*?panelShouldShowSearchControl\(\)/, "Topbar search trigger should render from the search threshold");
assert.match(panelChunk5Styles, /\.wp-empty\s*\{[\s\S]*?top: var\(--wp-items-padding-top, 112px\);/, "Empty CTA should center from the measured chrome padding");
assert.match(emptySource, /Use \+ or right-click a product page\./, "First-save empty copy should stay short");
assert.match(emptySource, /No active products[\s\S]*?data-archive-view-toggle/, "No-active-items empty state should offer a direct archive action when archive has items");
assert.match(panelChunk5Styles, /\.wp-empty-action\s*\{[\s\S]*?background: transparent;[\s\S]*?pointer-events: auto;/, "Empty archive action should stay as text while remaining clickable");
assert.match(filtersSource, /class="wp-filter-rail"[\s\S]*?data-filter-rail/, "Category filters should render inside a horizontal rail");
assert.match(filtersSource, /function syncPanelFilterRail[\s\S]*?scrollIntoView/, "Active category should be kept visible in the horizontal rail");
assert.match(renderSource, /renderPanelNewItemSkeleton\(\)/, "New card should render a skeleton layer");
assert.match(searchSource, /renderPanelTopbarOnly\(root, "search"\)/, "Search open/close should update only the topbar");
assert.doesNotMatch(searchSource, /syncPanelWithRebuildMotion\(root, "search"/, "Search should not trigger rebuild motion or item movement");
assert.match(compactViewSource, /data-panel-item-id="\$\{escapeAttribute\(item\.id\)\}"/, "Compact rows should expose stable layout ids");
assert.match(compactViewSource, /data-panel-motion-id="\$\{escapeAttribute\(item\.id\)\}"/, "Compact rows should expose stable motion ids");
assert.match(compactViewSource, /data-panel-motion-id="brand:\$\{escapeAttribute\(brand\.key\)\}"/, "Brand cloud items should expose stable motion ids");
assert.match(compactViewSource, /data-brand-cloud-toggle[\s\S]*?syncPanelViewStateWithMotion\(\)/, "Opening or closing Brands should sync the view in place without replaying the panel");
assert.match(archiveSource, /function togglePanelArchivedView\(\)[\s\S]*?syncPanelViewStateWithMotion\(\)/, "Opening or closing Archive should sync the view in place without replaying the panel");
assert.match(archiveSource, /function decidePanelItem\(id, state\)[\s\S]*?syncPanelViewStateWithMotion\(\{ animateSummary: true \}\)/, "Decision-to-archive should preserve summary animation without view replay");
assert.match(compactViewSource, /panelSortedBrandCloudItems/, "Brand cloud should have its own sorted list ordering");
assert.match(filterControlsSource, /const wasVisible = filters\.classList\.contains\("is-controls-visible"\);[\s\S]*?if \(wasVisible === visible\)/, "Hover filter controls should not resync unchanged visibility");
assert.doesNotMatch(filterControlsSource, /syncPanelSortControlLayout\(root\)/, "Hover filter controls should not use the sort layout helper");
assert.match(filterControlsSource, /function syncPanelFilterControlsLayout\(root\)[\s\S]*?syncPanelItemsTopOffset\(root, \{ defer: false \}\)/, "Visible third-row controls should reserve card-list space without rerendering");
assert.doesNotMatch(filterControlsSource, /setProperty\?\.\("--wp-filter-static-width"/, "Hover filter controls should not write inline layout widths");
assert.match(sortSource, /syncPanelItemsTopOffset\(root, \{ defer: false \}\);[\s\S]*?requestAnimationFrame[\s\S]*?setTimeout\(\(\) => syncPanelItemsTopOffset\(root, \{ defer: false \}\), 160\)/, "Sort/add row reveal should reserve card-list space before follow-up measurement");
assert.match(sortSource, /reorderPanelItemsOnly\(root\);[\s\S]*?syncPanelSortControlLayout\(root\);/, "Sort should reuse existing card DOM without a render fallback");
assert.match(sortSource, /data-panel-sort-trigger[\s\S]*?data-panel-sort-menu[\s\S]*?data-panel-sort-option/, "Sort should render as one separate trigger with a menu");
assert.match(sortSource, /function applyPanelSortOption/, "Sort menu options should apply explicit field and direction");
assert.match(sortSource, /function closePanelSortMenu/, "Sort menu should close without full panel rerender");
assert.match(sortSource, /panelState\.brandCloudSortList = panelState\.brandCloudOpen && !panelState\.brandFilterKey && !panelState\.archivedOpen;/, "Sort should preserve brand view and switch brands into sorted-list motion mode");
assert.doesNotMatch(sortSource, /panelState\.brandCloudOpen = false/, "Sort should not close the brand screen");
assert.doesNotMatch(sortSource, /renderPanelItemsOnly\(root\)/, "Sort should not rerender the card list");
assert.doesNotMatch(sortSource, /title="\$\{escapeAttribute\(state\.title\)\}"|setAttribute\("title"/, "Sort should not use delayed native title tooltips");
assert.match(reorderSource, /function renderPanelCardColumns/, "Card mode should provide stable masonry column containers");
assert.match(reorderSource, /syncPanelCardColumns\(columns, nodes\)/, "Card sort should update existing card nodes inside stable columns");
assert.match(reorderSource, /function reorderPanelBrandCloud/, "Brand sort should reorder the existing brand-cloud nodes");
assert.match(reorderSource, /cloud\.classList\.toggle\("is-sort-list", panelState\.brandCloudSortList\)/, "Brand sort should animate from cloud layout to centered list layout");
assert.match(reorderSource, /node\.style\.order = String\(index\)/, "Compact and brand sort should use CSS order on existing nodes");
assert.match(reorderSource, /column\.insertBefore\(node, nextSibling\)/, "Card sort should move existing nodes between columns without recreating cards");
assert.match(reorderSource, /classList\.add\("is-reordering"\)/, "Card sort should suppress entrance animation while moving existing nodes");
assert.match(reorderSource, /syncPanelNodeOrder\(compactList, nodes\)/, "Compact sort should update visual order on existing row nodes");
assert.doesNotMatch(reorderPanelItemsOnlyBody, /innerHTML\s*=/, "Sort reorder should not replace card HTML");
assert.doesNotMatch(reorderPanelItemsOnlyBody, /replaceChildren/, "Sort reorder should not bulk-replace card nodes");
assert.doesNotMatch(reorderPanelItemsOnlyBody, /appendChild/, "Sort reorder should not append recreated card nodes");
assert.match(filterEventsSource, /syncViewMode: true,[\s\S]*?syncSummary: false/, "Card/list toggle should update view state without refreshing unrelated chrome");
assert.match(preferencesSource, /backgroundTheme: toggledGraphiteThemeId\(\)[\s\S]*?syncSummary: false/, "Theme toggle should update theme state without refreshing unrelated chrome");
assert.match(filterEventsSource, /\{ compactView \},\s*\{ rerender: false, syncViewMode: true, syncSummary: false \}/, "List view toggle should sync in place without rebuild motion");
assert.doesNotMatch(preferencesSource, /backgroundTheme: toggledGraphiteThemeId\(\)[\s\S]*?rebuildMotion:/, "Theme toggle should not enter rebuild motion");
assert.match(eventsSource, /syncPanelWithRebuildMotion\([\s\S]*?options\.rebuildMotion[\s\S]*?syncSettingsUi/, "Settings sync should wrap in-place updates in rebuild motion");
assert.match(panelMotionSource, /wp-new-card-skeleton[\s\S]*wp-new-card-skeleton-media[\s\S]*wp-new-card-skeleton-copy/, "New card skeleton should include media and copy zones");
assert.match(panelMotionSource, /function renderTuckioPanelWithMotion/, "Panel motion helper should expose render-with-motion");
assert.match(panelMotionSource, /function renderPanelTopbarOnly/, "Panel motion helper should support topbar-only updates");
assert.match(panelMotionSource, /return kind === "view" \? kind : "";/, "Only explicit view rebuilds should use rebuild motion");
assert.match(panelMotionSource, /function syncPanelWithRebuildMotion/, "Panel motion helper should expose in-place rebuild motion");
assert.match(panelMotionSource, /function syncPanelViewStateWithMotion/, "Panel helper should expose in-place view-state sync");
assert.doesNotMatch(panelMotionSource, /function syncPanelViewStateWithMotion[\s\S]*?syncPanelWithRebuildMotion\(root, "view"/, "State swaps should not add view rebuild motion");
assert.doesNotMatch(syncPanelViewStateBody, /capturePanelItemLayout|animatePanelItemLayout/, "View-state swaps should not run FLIP layout motion or a final settle pass");
assert.match(syncPanelViewStateBody, /syncPanelItemsState\(root\)/, "View-state swaps should sync the existing items container");
assert.match(syncPanelViewStateBody, /syncPanelDecisionMode\(root\)/, "View-state swaps should close stale decision chrome after decisions");
assert.doesNotMatch(syncPanelViewStateBody, /renderTuckioPanel|root\.innerHTML/, "View-state swaps should not rebuild the shell");
assert.match(reorderSource, /function syncPanelItemsContent/, "State swaps should use item-level DOM reconciliation");
assert.match(reorderSource, /node\?\.dataset\.panelRenderSignature === signature/, "Existing cards should only be reused when the render signature still matches");
assert.match(renderSource, /data-panel-render-signature="\$\{escapeAttribute\(panelItemRenderSignature\(item, "cards"\)\)\}"/, "Initial card render should carry a render signature for the first in-place decision sync");
assert.match(compactViewSource, /data-panel-render-signature="\$\{escapeAttribute\(panelItemRenderSignature\(item, "compact"\)\)\}"/, "Initial compact render should carry a render signature for the first in-place decision sync");
assert.match(panelMotionSource, /function capturePanelItemLayout/, "Panel motion helper should capture card layout positions");
assert.match(panelMotionSource, /function animatePanelItemLayout/, "Panel motion helper should animate card layout movement");
assert.match(panelMotionSource, /\[data-panel-motion-id\]/, "Layout motion should work on cards, compact rows, and brand cloud nodes");
assert.doesNotMatch(animatePanelItemLayoutBody, /is-brand-cloud[\s\S]*?return;/, "Brand cloud should not skip layout motion when reorder explicitly uses it");
assert.match(panelMotionSource, /is-new[\s\S]*?is-shifted-right/, "Layout motion should avoid conflicting with new-card and displaced-card animations");
assert.match(panelMotionSource, /addEventListener\("transitionend", finish\)/, "Layout motion cleanup should wait for transform transitionend");
assert.doesNotMatch(panelMotionSource, /finishPanelMovedItem\(element\),\s*\d+|PANEL_LAYOUT_SETTLE_MS|PANEL_LAYOUT_COOLING_MS|__tuckioLayoutMotionTimer|__tuckioLayoutCoolingTimer/, "Layout motion should not schedule fallback or cooling cleanup");
assert.doesNotMatch(panelMotionSource, /PANEL_LAYOUT_RESTING_MS|add\("is-layout-resting"\)|add\("is-layout-cooling"\)|__tuckioLayoutRestingTimer/, "Layout motion should not schedule delayed post-sort visual cleanup");
assert.match(panelMotionSource, /classList\.add\("is-layout-positioned"\)[\s\S]*?setProperty\("--wp-layout-dx", "0px"\)/, "Layout motion should park cards on the final zero transform instead of dropping compositor state");
assert.doesNotMatch(panelMotionSource, /removeProperty\("--wp-layout-dx"\)|removeProperty\("--wp-layout-dy"\)/, "Layout motion should not remove final transform vars at transition end");
assert.match(panelMotionSource, /is-layout-hover-muted[\s\S]*?addEventListener\("pointerleave", finish, \{ once: true \}\)/, "Layout motion should mute hover until pointer leaves a moved card");
assert.match(panelMotionSource, /matches\?\.\(":hover"\)/, "Layout motion should detect cards that settle under the pointer");
assert.doesNotMatch(panelMotionSource, /--wp-layout-scale/, "Layout motion should not scale cards and trigger final raster flicker");
assert.match(panelStylesSource, /panelSaveMotionStyles\(\)/, "Panel style composition should include save motion styles");
assert.match(panelStylesSource, /panelRebuildMotionStyles\(\)/, "Panel style composition should include rebuild motion styles");
assert.match(panelStylesSource, /panelInteractionMotionStyles\(\)/, "Panel style composition should include interaction motion styles");
assert.match(panelContentStylesSource, /\.wp-items\s*\{[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);[\s\S]*?column-gap: 16px;/, "Card mode should keep two visual columns");
assert.match(panelContentStylesSource, /\.wp-item-column\s*\{[\s\S]*?display: grid;[\s\S]*?gap: 16px;/, "Card mode columns should stack variable-height cards tightly");
assert.match(panelContentStylesSource, /\.wp-item-column \.wp-item:nth-child\(2\)[\s\S]*?animation-delay: 34ms;/, "Card entrance should use a restrained stagger");
assert.match(panelContentStylesSource, /\.wp-brand-cloud\.is-sort-list[\s\S]*?flex-direction: column;[\s\S]*?align-items: center;/, "Sorted brand mode should switch the cloud to a vertical list");
assert.match(panelChunk5Styles, /\.wp-brand-cloud\.is-sort-list\s*\{[\s\S]*?max-height: min\(540px, calc\(100svh - var\(--wp-items-padding-top, 112px\) - 96px\)\);[\s\S]*?overflow-y: auto;[\s\S]*?scroll-snap-type: y proximity;[\s\S]*?mask-image: linear-gradient/, "Sorted brand list should become an internal wheel-scroll surface");
assert.match(panelChunk5Styles, /\.wp-brand-cloud\.is-sort-list::-webkit-scrollbar\s*\{[\s\S]*?display: none;/, "Brand wheel should hide native WebKit scrollbars");
assert.match(panelChunk5Styles, /\.wp-brand-cloud\.is-sort-list \.wp-brand-cloud-item\s*\{[\s\S]*?scroll-snap-align: center;/, "Brand wheel items should snap toward the center");
assert.match(panelContentStylesSource, /\.wp-items\.is-brand-cloud\s*\{[\s\S]*?display: flex;[\s\S]*?flex-direction: column;[\s\S]*?justify-content: safe center;[\s\S]*?padding: var\(--wp-items-padding-top, 112px\) 24px 48px;/, "Brand cloud view should be centered inside the area that starts under the filters");
assert.match(panelContentStylesSource, /\.wp-brand-cloud\s*\{[\s\S]*?align-content: flex-start;[\s\S]*?padding: 8px;/, "Default brand cloud should keep its centered cloud spacing");

for (const animation of [
  "wpPanelViewRebuild",
  "wpPanelItemRebuild"
]) {
  assert.match(panelRebuildMotionStyles, new RegExp(`@keyframes ${animation}`), `Panel rebuild motion should define ${animation}`);
}
assert.doesNotMatch(panelRebuildMotionStyles, /is-search-rebuild|is-theme-rebuild|wpPanelSearch|wpPanelListBreathe|wpPanelThemeContent/, "Search and theme should not carry rebuild motion styles");

for (const animation of [
  "wpNewCardShell",
  "wpCardShiftRight",
  "wpNewCardSkeletonLayer",
  "wpNewCardSkeletonSweep",
  "wpNewCardMediaIn",
  "wpNewCardProductReveal",
  "wpNewCardCopyRise",
  "wpNewCardGlow"
]) {
  assert.match(panelMotionStyles, new RegExp(`@keyframes ${animation}`), `Panel save motion should define ${animation}`);
}
assert.match(panelMotionStyles, /\.wp-shell\.is-static \.wp-item\.is-new/, "New-card reveal should override static panel rerenders");
assert.match(panelMotionStyles, /\.wp-shell\.is-static \.wp-item\.is-shifted-right/, "Displaced-card motion should override static panel rerenders");
assert.match(panelRebuildMotionStyles, /\.wp-shell\.is-static\.is-view-rebuild \.wp-item/, "View rebuild should override static panel item animation suppression");
assert.doesNotMatch(panelRebuildMotionStyles, /\.wp-shell\.is-view-rebuild::before|\.wp-shell\.is-view-rebuild::after|wpPanelTopSurfaceReveal|wpPanelBottomSurfaceReveal/, "View rebuild should not animate shell surfaces or stable chrome");
assert.match(panelRebuildMotionStyles, /\.wp-shell\.is-view-rebuild \.wp-brand-cloud-item[\s\S]*?wpPanelItemRebuild/, "Brand cloud items should enter through view rebuild motion");
assert.match(panelRebuildMotionStyles, /@keyframes wpPanelCloudReveal/, "Brand cloud should have a dedicated soft reveal");
assert.match(panelRebuildMotionStyles, /\.wp-item\.is-layout-moving[\s\S]*?\.wp-item\.is-layout-settling[\s\S]*?\.wp-item\.is-layout-positioned[\s\S]*?\.wp-item\.is-layout-hover-muted/, "Panel rebuild styles should define card layout movement states");
assert.match(panelRebuildMotionStyles, /\.wp-brand-cloud-item\.is-layout-moving[\s\S]*?\.wp-brand-cloud-item\.is-layout-settling/, "Panel rebuild styles should animate brand-cloud layout movement states");
assert.match(panelRebuildMotionStyles, /\.wp-items\.is-reordering \.wp-item,[\s\S]*?\.wp-items\.is-reordering \.wp-brand-cloud-item[\s\S]*?animation: none !important;/, "Sort movement should not restart entrance animations");
assert.doesNotMatch(panelRebuildMotionStyles, /is-layout-resting|is-layout-cooling/, "Panel rebuild styles should not use delayed resting/cooling states");
assert.match(panelRebuildMotionStyles, /transform 520ms cubic-bezier\(\.18, \.9, \.22, 1\)/, "Card layout movement should settle with the spring-like curve");
assert.match(panelRebuildMotionStyles, /transform: translate3d\(var\(--wp-layout-dx, 0\), var\(--wp-layout-dy, 0\), 0\);/, "Card layout movement should translate without scaling");
assert.doesNotMatch(panelRebuildMotionStyles, /\.wp-item\.is-layout-settling\s*\{[\s\S]*?filter 560ms/, "Card layout movement should not repaint-filter at the settle boundary");
assert.match(panelRebuildMotionStyles, /\.wp-item\.is-layout-positioned,[\s\S]*?\.wp-brand-cloud-item\.is-layout-positioned\s*\{[\s\S]*?animation: none !important;/, "Parked layout state should keep final compositor state without a visual transition");
assert.match(panelRebuildMotionStyles, /\.wp-item\.is-layout-moving::before,[\s\S]*?\.wp-item\.is-layout-hover-muted::before[\s\S]*?opacity: 0 !important;/, "Layout motion should suppress hover glow during cleanup");
assert.match(panelMotionStyles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.wp-new-card-skeleton[\s\S]*?display: none;/, "Panel save motion should respect reduced motion");
assert.match(panelRebuildMotionStyles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.wp-shell\.is-rebuilding[\s\S]*?\.wp-item\.is-layout-settling[\s\S]*?animation: none;/, "Panel rebuild motion should respect reduced motion");
assert.match(panelInteractionMotionStyles, /\.wp-theme-graphite \.wp-inline-search[\s\S]*?rgba\(158, 116, 255, 0\.18\)/, "Graphite search should use a distinct violet/cyan dark iridescent wash");
assert.match(panelInteractionMotionStyles, /\.wp-item:not\(\.is-layout-moving\):not\(\.is-layout-settling\):not\(\.is-layout-hover-muted\):hover[\s\S]*?translate3d\(0, -3px, 0\)/, "Item hover should use compositor-safe transforms without overriding layout motion");
assert.doesNotMatch(panelInteractionMotionStyles, /not\(\.is-layout-positioned\)/, "Parked cards should keep normal hover behavior");
assert.match(panelInteractionMotionStyles, /backface-visibility: hidden;/, "Panel hover surfaces should be compositor-stabilized");
assert.match(panelInteractionMotionStyles, /\.wp-filter-add\s*\{[\s\S]*?opacity 240ms cubic-bezier\(\.22, 1, \.36, 1\)[\s\S]*?transform 300ms cubic-bezier\(\.22, 1, \.36, 1\)/, "Add control hover should animate opacity/transform only");
assert.match(panelInteractionMotionStyles, /\.wp-sort-menu\s*\{[\s\S]*?opacity 240ms cubic-bezier\(\.22, 1, \.36, 1\)[\s\S]*?transform 300ms cubic-bezier\(\.22, 1, \.36, 1\)/, "Sort menu should animate opacity/transform only");
const filterAddMotionBlock = panelInteractionMotionStyles.match(/\.wp-filter-add \{[\s\S]*?\n    \}/)?.[0] || "";
const sortControlsMotionBlock = panelInteractionMotionStyles.match(/\.wp-sort-menu \{[\s\S]*?\n    \}/)?.[0] || "";
assert.doesNotMatch(filterAddMotionBlock, /\b(?:width|max-width)\s+\d+ms/, "Add control should not animate layout width");
assert.doesNotMatch(sortControlsMotionBlock, /\b(?:width|min-width)\s+\d+ms/, "Sort controls should not animate layout width");
assert.match(filterAddMotionBlock, /opacity 240ms cubic-bezier\(\.22, 1, \.36, 1\)/, "Add control should still reveal visually");
assert.match(sortControlsMotionBlock, /opacity 240ms cubic-bezier\(\.22, 1, \.36, 1\)/, "Sort menu should still reveal visually");
assert.match(panelInteractionMotionStyles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.wp-clear-search[\s\S]*?transition: none;/, "Panel interaction polish should respect reduced motion");
assert.match(panelCurrencyStyles, /\.wp-theme-graphite \.wp-currency-menu[\s\S]*?var\(--wp-popover-bg\)/, "Graphite currency menu should use the dark popover surface");
assert.match(panelCurrencyStyles, /\.wp-theme-graphite \.wp-currency-option\.is-selected[\s\S]*?rgba\(255, 255, 250, 0\.98\)/, "Graphite selected currency should stay readable");
assert.match(motionDoc, /## Panel Rebuild Motion[\s\S]*?Do not full-render the shell just to toggle list mode or theme\./, "Motion contract should document panel rebuild motion");
assert.match(motionDoc, /## Panel Card Layout Motion[\s\S]*?Every rendered card and compact row must carry `data-panel-item-id`/, "Motion contract should document card layout movement");
assert.match(motionDoc, /Card mode renders two stable `\.wp-item-column` containers[\s\S]*?Pure sort changes should move existing card nodes between the stable columns[\s\S]*?Sort\/card layout motion has a hard stop[\s\S]*?is-layout-positioned[\s\S]*?Do not remove the final zero transform[\s\S]*?No timeout fallback/, "Motion contract should document hard-stop packed-column layout cleanup");
assert.match(motionDoc, /## Panel Interaction Polish[\s\S]*?Graphite search uses its own iridescent palette/, "Motion contract should document panel interaction polish");
assert.match(motionDoc, /The card-list top offset must be measured from visible filter children[\s\S]*?Hover affordance sizing must stay local to the control itself/, "Motion contract should prevent hover-driven panel flicker");
assert.match(motionDoc, /Sort controls must not use native `title` tooltips/, "Motion contract should prevent delayed native tooltip flicker");
assert.match(motionDoc, /Hover must not call `renderTuckioPanel\(\)`/, "Motion contract should document that hover is not a render path");
assert.match(motionDoc, /Graphite currency menus must be dark glass/, "Motion contract should document graphite currency menu contrast");

console.log("panel save motion smoke passed");
