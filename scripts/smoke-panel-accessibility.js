const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const focusSource = read("extension/content/panel/focus.js");
const renderSource = read("extension/content/panel/render.js");
const compactSource = read("extension/content/panel/compact-view.js");
const imageSource = read("extension/content/panel/images.js");
const editSource = read("extension/content/panel/edit.js");
const promoSource = read("extension/content/panel/promo.js");
const eventsSource = read("extension/content/panel/events.js");
const panelBaseStyles = read("extension/content/styles/panel-1.js");
const panelContentStyles = read("extension/content/styles/panel-content.js");
const panelReleaseStyles = read("extension/content/styles/panel-release.js");

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
assert.match(imageSource, /Previous image\$\{label\}/, "Image slider controls should include item context");
assert.match(editSource, /data-panel-modal/, "Edit dialog should be marked as a trapped modal");
assert.match(editSource, /data-autofocus/, "Edit dialog should define an initial focus target");
assert.match(promoSource, /data-panel-modal/, "Founder dialog should be marked as a trapped modal");
assert.match(promoSource, /tabindex="-1" aria-hidden="true" data-import-backup-file/, "Hidden import input should not enter tab order");
assert.match(panelBaseStyles, /:focus-visible/, "Panel should define visible focus states");
assert.match(panelReleaseStyles, /\.wp-edit-category input:focus-visible \+ span/, "Hidden category radios should focus the visible chip");
assert.match(panelReleaseStyles, /\.wp-item:focus-within \.wp-archive/, "Archive action should reveal for keyboard focus");
assert.match(panelReleaseStyles, /\.wp-item:focus-within \.wp-remove/, "Delete action should reveal for keyboard focus");
assert.match(panelReleaseStyles, /z-index: 4;/, "Card action buttons should sit above the media link layer");
assert.match(panelContentStyles, /\.wp-archive,[\s\S]*?\.wp-remove\s*\{[\s\S]*?pointer-events: auto;/, "Archive hitbox should be clickable on first pointer press");
assert.match(panelReleaseStyles, /\.wp-edit,[\s\S]*?\.wp-restore,[\s\S]*?\.wp-archive,[\s\S]*?\.wp-remove\s*\{[\s\S]*?pointer-events: auto;/, "Card action buttons should not require a prior hover before click");
assert.match(panelReleaseStyles, /\.wp-filter-archive\.is-active\s*\{[\s\S]*?border-style: dotted;[\s\S]*?background: rgba\(8, 11, 16, 0\.08\);/, "Archived active pill should stay neutral and dotted");
assert.doesNotMatch(panelReleaseStyles, /\.wp-filter-archive\.is-active\s*\{[\s\S]*?210, 34, 34|\.wp-theme-graphite \.wp-filter-archive\.is-active\s*\{[\s\S]*?255, 92, 92/, "Archived active pill should not use destructive red styling");

console.log("panel accessibility smoke passed");
