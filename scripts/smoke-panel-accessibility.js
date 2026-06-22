const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const focusSource = read("extension/content/panel/focus.js");
const constantsSource = read("extension/content/constants.js");
const renderSource = read("extension/content/panel/render.js");
const compactSource = read("extension/content/panel/compact-view.js");
const imageSource = read("extension/content/panel/images.js");
const editSource = read("extension/content/panel/edit.js");
const promoSource = read("extension/content/panel/promo.js");
const eventsSource = read("extension/content/panel/events.js");
const panelBaseStyles = read("extension/content/styles/panel-1.js");
const panelChromeStyles = read("extension/content/styles/panel-2.js");
const panelOverflowStyles = read("extension/content/styles/panel-overflow.js");
const panelContentStyles = read("extension/content/styles/panel-content.js");
const panelCurrencyStyles = read("extension/content/styles/panel-currency.js");
const panelReleaseStyles = read("extension/content/styles/panel-release.js");
const panelEditStyles = read("extension/content/styles/panel-edit.js");

assert.match(focusSource, /function trapPanelModalFocus/, "Panel should trap keyboard focus inside open modals");
assert.match(focusSource, /function rememberPanelFocus/, "Panel should remember the trigger before opening a modal");
assert.match(focusSource, /function restorePanelFocus/, "Panel should restore focus after a modal closes");
assert.match(eventsSource, /trapPanelModalFocus\(root, event\)/, "Panel keydown handler should call the modal focus trap");

assert.doesNotMatch(renderSource, /<a class="wp-media"/, "Card action buttons should not be nested inside the media link");
assert.match(renderSource, /class="wp-media-link"/, "Card media should still expose a dedicated product link");
assert.match(panelContentStyles, /\.wp-media-link/, "Card media link should have explicit layout styles");

for (const source of [renderSource, compactSource]) {
  assert.match(source, /panelItemActionLabel\("Edit", item\)/, "Edit buttons should include item-specific labels");
  assert.match(source, /panelItemActionLabel\("Archive", item\)/, "Archive buttons should include item-specific labels");
  assert.match(source, /panelItemActionLabel\("Delete", item\)/, "Delete buttons should include item-specific labels");
}

assert.match(imageSource, /panelProductImageAlt\(item\)/, "Product images should use item-specific alt text");
assert.match(imageSource, /Previous image\{label\}/, "Image slider controls should include item context");
assert.match(editSource, /data-panel-modal/, "Edit dialog should be marked as a trapped modal");
assert.match(editSource, /data-autofocus/, "Edit dialog should define an initial focus target");
assert.match(promoSource, /data-panel-modal/, "Founder dialog should be marked as a trapped modal");
assert.match(promoSource, /tabindex="-1" aria-hidden="true" data-import-backup-file/, "Hidden import input should not enter tab order");
assert.match(panelBaseStyles, /:focus-visible/, "Panel should define visible focus states");
assert.doesNotMatch(renderSource, /wp-header-material/, "Panel should not render a dedicated header slab");
assert.doesNotMatch(panelBaseStyles, /\.wp-header-material/, "Panel should not style a dedicated header slab");
assert.match(compactSource, /class="wp-count-figure"[\s\S]*?&nbsp;\$\{escapeHtml\(panelItemNoun\(totalCount\)\)\}/, "Topbar item count should render a visible space between the mono figure and label");
assert.match(panelChromeStyles, /\.wp-summary-capsule\s*\{[\s\S]*?max-width: min\(100%, 320px\);[\s\S]*?overflow: visible;/, "Summary capsule should resize for larger item counts and totals without clipping menus");
assert.match(panelChromeStyles, /\.wp-count\s*\{[\s\S]*?width: max-content;[\s\S]*?min-width: 64px;[\s\S]*?max-width: none;/, "Topbar item count should keep a compact floor and resize for multi-digit counts");
assert.match(panelChromeStyles, /\.wp-count-label\s*\{[\s\S]*?overflow: visible;[\s\S]*?text-overflow: clip;/, "Topbar item label should not be ellipsized inside the count pill");
assert.match(panelChromeStyles, /\.wp-count-figure\s*\{[\s\S]*?min-width: 1ch;[\s\S]*?font-variant-numeric: tabular-nums;/, "Topbar item count digits should reserve one tabular digit and grow naturally");
assert.match(panelChromeStyles, /\.wp-summary-capsule\s*\{[\s\S]*?overflow: visible;/, "Summary capsule should not clip the currency menu");
assert.match(panelCurrencyStyles, /\.wp-summary-capsule \.wp-total\s*\{[\s\S]*?max-width: none;/, "Summary total pill should resize instead of clipping larger amounts");
assert.match(panelCurrencyStyles, /\.wp-summary-capsule \.wp-total-value\s*\{[\s\S]*?max-width: none;[\s\S]*?overflow: visible;[\s\S]*?text-overflow: clip;/, "Summary total value should not be ellipsized inside the pill");
assert.match(panelCurrencyStyles, /\.wp-currency-select\.is-open\s*\{[\s\S]*?z-index: 16;/, "Open currency select should rise above neighboring topbar chrome");
assert.match(renderSource, /class="wp-overflow-menu"/, "Overflow menu should not inherit generic popover layout classes");
assert.doesNotMatch(renderSource, /wp-overflow-menu wp-popover/, "Overflow menu should stay decoupled from generic popover sizing");
assert.match(renderSource, /phosphorDotsThreeVerticalIcon\("wp-overflow-button-icon"\)/, "Overflow trigger should use the vendored Phosphor menu icon");
assert.doesNotMatch(renderSource, /wp-overflow-dotmark/, "Overflow trigger should not render a text dotmark");
assert.match(renderSource, /wp-overflow-button\$\{isOpen \? " is-active" : ""\}/, "Overflow trigger active state should only follow the open menu state");
assert.match(renderSource, /aria-expanded="\$\{isOpen\}"/, "Overflow trigger should expose the live open state");
assert.match(renderSource, /function panelOverflowMenuInlineStyle\(isOpen = panelState\.settingsOpen\)/, "Overflow menu inline style should be shared between render and sync paths");
assert.match(renderSource, /display:\$\{isOpen \? "grid" : "none"\};/, "Overflow menu inline fallback should render closed as display none");
assert.match(eventsSource, /menu\.setAttribute\("style", panelOverflowMenuInlineStyle\(panelState\.settingsOpen\)\);/, "Overflow menu toggle should update inline display and theme variables in the no-rerender path");
assert.match(compactSource, /renderPanelOverflowSwitch\(isGraphite\)/, "Dark mode switch should render from the theme state");
assert.match(compactSource, /renderPanelOverflowSwitch\(panelState\.compactView\)/, "List view switch should render from the saved view state");
assert.match(compactSource, /wp-overflow-switch\$\{isActive \? " is-on" : ""\}/, "Overflow switch should only look on when its state is active");
assert.match(renderSource, /PANEL_OVERFLOW_OPTION_INLINE_STYLE/, "Overflow options should include inline fallback row styling");
assert.match(constantsSource, /color:var\(--wp-overflow-option-color/, "Overflow inline fallback color should stay theme-aware");
assert.match(constantsSource, /--wp-overflow-switch-on-bg/, "Overflow switch inline fallback should use theme variables");
assert.match(constantsSource, /PANEL_OVERFLOW_GRAPHITE_MENU_INLINE_STYLE[\s\S]*?--wp-overflow-option-color:rgba\(244,244,240,0\.72\)/, "Graphite overflow inline fallback should not depend only on stylesheet variables");
assert.match(renderSource, /panelState\.backgroundTheme === GRAPHITE_BACKGROUND_THEME \? PANEL_OVERFLOW_GRAPHITE_MENU_INLINE_STYLE : ""/, "Overflow menu should apply graphite inline variables only in dark mode");
assert.match(compactSource, /syncSummary: false/, "Display preference toggles should not refresh unrelated summary chrome");
assert.doesNotMatch(compactSource, /closePanelOverflowMenu\(root\);[\s\S]*?savePanelSettings/, "Display preference row clicks should not close the overflow menu");
assert.doesNotMatch(compactSource, /rebuildMotion: "view"|rebuildMotion: "theme"/, "Display preference row clicks should not trigger app rebuild motion");
assert.match(panelOverflowStyles, /\.wp-theme-graphite \.wp-overflow-menu\s*\{[\s\S]*?--wp-overflow-option-color: rgba\(244, 244, 240, 0\.72\);[\s\S]*?--wp-overflow-switch-on-bg: rgba\(244, 244, 240, 0\.9\);/, "Graphite overflow menu should define readable fallback colors");
assert.doesNotMatch(promoSource, /panelState\.settingsOpen = false;[\s\S]*?panelState\.founderPromoOpen/, "About trigger should not close the overflow menu");
assert.match(promoSource, /function syncPanelFounderPromoDialog/, "About dialog should sync in place without rerendering the app");
assert.match(panelOverflowStyles, /\.wp-overflow-menu\s*\{[\s\S]*?right: 0;[\s\S]*?width: 250px;[\s\S]*?max-width: calc\(100vw - 32px\);/, "Overflow menu should keep its own geometry instead of inheriting generic popover sizing");
assert.match(panelOverflowStyles, /\.wp-overflow-menu\[hidden\]\s*\{[\s\S]*?display: none;/, "Overflow menu hidden state should override its open grid layout");
assert.match(panelOverflowStyles, /\.wp-overflow-option > span\s*\{[\s\S]*?min-width: 0;[\s\S]*?text-overflow: ellipsis;/, "Overflow menu labels should stay inside the option row");
assert.match(eventsSource, /closePanelOverflowMenu\(root\);[\s\S]*?closePanelSortMenu\(root\);[\s\S]*?closePanelFilterMenu\(root\);[\s\S]*?togglePanelCurrencySelect/, "Opening currency should close competing menus first");
assert.match(panelEditStyles, /\.wp-edit-category input:focus-visible \+ span/, "Hidden category radios should focus the visible chip");
assert.match(panelReleaseStyles, /\.wp-item:focus-within \.wp-archive/, "Archive action should reveal for keyboard focus");
assert.match(panelReleaseStyles, /\.wp-item:focus-within \.wp-remove/, "Delete action should reveal for keyboard focus");
assert.match(panelReleaseStyles, /z-index: 4;/, "Card action buttons should sit above the media link layer");
assert.match(panelContentStyles, /\.wp-archive,[\s\S]*?\.wp-remove\s*\{[\s\S]*?pointer-events: auto;/, "Archive hitbox should be clickable on first pointer press");
assert.match(panelReleaseStyles, /\.wp-edit,[\s\S]*?\.wp-restore,[\s\S]*?\.wp-archive,[\s\S]*?\.wp-remove\s*\{[\s\S]*?pointer-events: auto;/, "Card action buttons should not require a prior hover before click");
assert.match(panelReleaseStyles, /\.wp-filter-archive\.is-active\s*\{[\s\S]*?border-style: solid;[\s\S]*?background: rgba\(8, 11, 16, 0\.86\);/, "Archived active pill should use the same solid outline grammar as the chip row");
assert.match(panelReleaseStyles, /\.wp-archive-count\s*\{[\s\S]*?min-width: 1ch;[\s\S]*?font-variant-numeric: tabular-nums;/, "Archived count should reserve one tabular digit and grow naturally");
assert.doesNotMatch(panelReleaseStyles, /\.wp-filter-archive\.is-active\s*\{[\s\S]*?210, 34, 34|\.wp-theme-graphite \.wp-filter-archive\.is-active\s*\{[\s\S]*?255, 92, 92/, "Archived active pill should not use destructive red styling");

console.log("panel accessibility smoke passed");
