const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const backgroundSource = read("extension/background.js");
const constantsSource = read("extension/content/constants.js");
const lifecycleSource = read("extension/content/lifecycle.js");
const renderSource = read("extension/content/panel/render.js");
const searchSource = read("extension/content/panel/search.js");
const compactViewSource = read("extension/content/panel/compact-view.js");
const filterControlsSource = read("extension/content/panel/filter-controls.js");
const sortSource = read("extension/content/panel/sort.js");
const eventsSource = read("extension/content/panel/events.js");
const panelMotionSource = read("extension/content/panel/motion.js");
const panelStylesSource = read("extension/content/styles/panel.js");
const panelCurrencyStyles = read("extension/content/styles/panel-currency.js");
const panelRebuildMotionStyles = read("extension/content/styles/panel-rebuild-motion.js");
const panelMotionStyles = read("extension/content/styles/panel-save-motion.js");
const panelInteractionMotionStyles = read("extension/content/styles/panel-interaction-motion.js");
const motionDoc = read("motion.md");

const contentVersion = constantsSource.match(/CONTENT_VERSION\s*=\s*"([^"]+)"/)?.[1];
assert.ok(contentVersion, "Content version should be declared");
assert.ok(
  backgroundSource.includes(`CONTENT_SCRIPT_VERSION = "${contentVersion}"`),
  "Background should inject the active panel save motion version"
);
assert.match(backgroundSource, /"content\/panel\/empty\.js",\s*"content\/panel\/motion\.js",\s*"content\/panel\/render\.js"/, "Panel motion helper should load before render");
assert.match(backgroundSource, /"content\/styles\/panel-release\.js",\s*"content\/styles\/panel-rebuild-motion\.js",\s*"content\/styles\/panel-save-motion\.js",\s*"content\/styles\/panel-interaction-motion\.js",\s*"content\/styles\/panel\.js"/, "Panel motion styles should load before panel style composition");

assert.match(constantsSource, /displacedItemId: ""/, "Panel state should track the card displaced by an open-panel save");
assert.match(constantsSource, /rebuildMotion: ""/, "Panel state should track transient rebuild motion");
assert.match(lifecycleSource, /panelState\.hasRenderedPanel = false;[\s\S]*?renderStashPanel\(\);/, "Opening Stashed should replay the shell opening animation");
assert.match(lifecycleSource, /const listContextChanged =[\s\S]*?previousActiveCategory !== panelState\.activeCategory[\s\S]*?previousSearchQuery !== panelState\.searchQuery;/, "Shift-right motion should only run in the same visible list context");
assert.match(lifecycleSource, /panelState\.displacedItemId = listContextChanged \? "" : panelSavedItemDisplacedId\(item\);/, "Open-panel save should mark the displaced card before render");
assert.match(lifecycleSource, /panelState\.highlightedItemId = "";[\s\S]*?panelState\.displacedItemId = "";[\s\S]*?renderStashPanel\(\);/, "Open-panel save motion state should clear after the reveal");
assert.match(lifecycleSource, /function panelSavedItemDisplacedId/, "Displaced card should be derived from the visible card list");

assert.match(renderSource, /const isNew = item\.id === panelState\.highlightedItemId;/, "New card should use the existing highlighted item state");
assert.match(renderSource, /panelRebuildMotionClass\(panelState\.rebuildMotion\)/, "Panel render should add transient rebuild motion classes");
assert.match(renderSource, /finishPanelRebuildMotion\(root\)/, "Panel render should clear transient rebuild motion classes");
assert.match(renderSource, /capturePanelItemLayout\(root\)/, "Panel render should capture old card positions before rebuilds");
assert.match(renderSource, /animatePanelItemLayout\(root, previousItemRects\)/, "Panel render should animate card position changes after rebuilds");
assert.match(renderSource, /getPropertyValue\("--wp-items-padding-top"\) !== nextTop/, "Panel top offset sync should avoid redundant layout writes");
assert.match(renderSource, /function syncPanelItemsTopOffset\(root, options = \{\}\)/, "Panel top offset sync should support immediate row-control measurement");
assert.match(renderSource, /const isShiftedRight = item\.id === panelState\.displacedItemId;/, "Displaced card should get a render-time class");
assert.match(renderSource, /is-shifted-right/, "Displaced card class should render into the card list");
assert.match(renderSource, /data-panel-item-id="\$\{escapeAttribute\(item\.id\)\}"/, "Card items should expose stable layout ids");
assert.match(renderSource, /renderPanelNewItemSkeleton\(\)/, "New card should render a skeleton layer");
assert.match(searchSource, /renderPanelTopbarOnly\(root, "search"\)/, "Search open/close should rebuild only the topbar");
assert.match(searchSource, /syncPanelWithRebuildMotion\(root, "search"/, "Search clear should rebuild visible results with motion");
assert.match(compactViewSource, /data-panel-item-id="\$\{escapeAttribute\(item\.id\)\}"/, "Compact rows should expose stable layout ids");
assert.match(filterControlsSource, /const wasVisible = filters\.classList\.contains\("is-controls-visible"\);[\s\S]*?if \(wasVisible === visible\)/, "Hover filter controls should not resync unchanged visibility");
assert.match(sortSource, /syncPanelItemsTopOffset\(root, \{ defer: false \}\);[\s\S]*?requestAnimationFrame[\s\S]*?setTimeout\(\(\) => syncPanelItemsTopOffset\(root, \{ defer: false \}\), 160\)/, "Sort/add row reveal should reserve card-list space before follow-up measurement");
assert.match(compactViewSource, /syncViewMode: true,[\s\S]*?rebuildMotion: "view"/, "Card/list toggle should use in-place view rebuild motion");
assert.match(compactViewSource, /rebuildMotion: "theme"/, "Theme toggle should use in-place theme rebuild motion");
assert.match(eventsSource, /syncPanelWithRebuildMotion\([\s\S]*?options\.rebuildMotion[\s\S]*?syncSettingsUi/, "Settings sync should wrap in-place updates in rebuild motion");
assert.match(panelMotionSource, /wp-new-card-skeleton[\s\S]*wp-new-card-skeleton-media[\s\S]*wp-new-card-skeleton-copy/, "New card skeleton should include media and copy zones");
assert.match(panelMotionSource, /function renderStashPanelWithMotion/, "Panel motion helper should expose render-with-motion");
assert.match(panelMotionSource, /function renderPanelTopbarOnly/, "Panel motion helper should support topbar-only rebuilds");
assert.match(panelMotionSource, /function syncPanelWithRebuildMotion/, "Panel motion helper should expose in-place rebuild motion");
assert.match(panelMotionSource, /function capturePanelItemLayout/, "Panel motion helper should capture card layout positions");
assert.match(panelMotionSource, /function animatePanelItemLayout/, "Panel motion helper should animate card layout movement");
assert.match(panelMotionSource, /is-new[\s\S]*?is-shifted-right/, "Layout motion should avoid conflicting with new-card and displaced-card animations");
assert.match(panelStylesSource, /panelSaveMotionStyles\(\)/, "Panel style composition should include save motion styles");
assert.match(panelStylesSource, /panelRebuildMotionStyles\(\)/, "Panel style composition should include rebuild motion styles");
assert.match(panelStylesSource, /panelInteractionMotionStyles\(\)/, "Panel style composition should include interaction motion styles");

for (const animation of [
  "wpPanelThemeShift",
  "wpPanelThemeWash",
  "wpPanelChromeRebuild",
  "wpPanelSearchRebuild",
  "wpPanelListBreathe",
  "wpPanelViewRebuild",
  "wpPanelItemRebuild",
  "wpPanelThemeContent"
]) {
  assert.match(panelRebuildMotionStyles, new RegExp(`@keyframes ${animation}`), `Panel rebuild motion should define ${animation}`);
}

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
assert.match(panelRebuildMotionStyles, /\.wp-item\.is-layout-moving[\s\S]*?\.wp-item\.is-layout-settling/, "Panel rebuild styles should define card layout movement states");
assert.match(panelRebuildMotionStyles, /transform 560ms cubic-bezier\(\.16, 1, \.3, 1\)/, "Card layout movement should settle smoothly");
assert.match(panelMotionStyles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.wp-new-card-skeleton[\s\S]*?display: none;/, "Panel save motion should respect reduced motion");
assert.match(panelRebuildMotionStyles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.wp-shell\.is-rebuilding[\s\S]*?\.wp-item\.is-layout-settling[\s\S]*?animation: none;/, "Panel rebuild motion should respect reduced motion");
assert.match(panelInteractionMotionStyles, /\.wp-theme-graphite \.wp-inline-search[\s\S]*?rgba\(158, 116, 255, 0\.18\)/, "Graphite search should use a distinct violet/cyan dark iridescent wash");
assert.match(panelInteractionMotionStyles, /\.wp-item:not\(\.is-layout-moving\):not\(\.is-layout-settling\):hover[\s\S]*?translate3d\(0, -3px, 0\)/, "Item hover should use compositor-safe transforms without overriding layout motion");
assert.match(panelInteractionMotionStyles, /backface-visibility: hidden;/, "Panel hover surfaces should be compositor-stabilized");
const filterAddMotionBlock = panelInteractionMotionStyles.match(/\.wp-filter-add \{[\s\S]*?\n    \}/)?.[0] || "";
const sortControlsMotionBlock = panelInteractionMotionStyles.match(/\.wp-sort-controls \{[\s\S]*?\n    \}/)?.[0] || "";
assert.doesNotMatch(filterAddMotionBlock, /\b(?:width|max-width)\s+\d+ms/, "Add control should not animate layout width");
assert.doesNotMatch(sortControlsMotionBlock, /\b(?:width|min-width)\s+\d+ms/, "Sort controls should not animate layout width");
assert.match(filterAddMotionBlock, /opacity 240ms cubic-bezier\(\.22, 1, \.36, 1\)/, "Add control should still reveal visually");
assert.match(sortControlsMotionBlock, /opacity 240ms cubic-bezier\(\.22, 1, \.36, 1\)/, "Sort controls should still reveal visually");
assert.match(panelInteractionMotionStyles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.wp-clear-search[\s\S]*?transition: none;/, "Panel interaction polish should respect reduced motion");
assert.match(panelCurrencyStyles, /\.wp-theme-graphite \.wp-currency-menu[\s\S]*?rgba\(20, 21, 25, 0\.98\)/, "Graphite currency menu should use a dark surface");
assert.match(panelCurrencyStyles, /\.wp-theme-graphite \.wp-currency-option\.is-selected[\s\S]*?rgba\(255, 255, 250, 0\.98\)/, "Graphite selected currency should stay readable");
assert.match(motionDoc, /## Panel Rebuild Motion[\s\S]*?Do not full-render the shell just to toggle list mode or theme\./, "Motion contract should document panel rebuild motion");
assert.match(motionDoc, /## Panel Card Layout Motion[\s\S]*?Every rendered card and compact row must carry `data-panel-item-id`/, "Motion contract should document card layout movement");
assert.match(motionDoc, /## Panel Interaction Polish[\s\S]*?Graphite search uses its own iridescent palette/, "Motion contract should document panel interaction polish");
assert.match(motionDoc, /Layout-affecting width must not animate for add category or sort controls/, "Motion contract should prevent third-row/card crossing");
assert.match(motionDoc, /Hover must not call `renderStashPanel\(\)`/, "Motion contract should document that hover is not a render path");
assert.match(motionDoc, /Graphite currency menus must be dark glass/, "Motion contract should document graphite currency menu contrast");

console.log("panel save motion smoke passed");
