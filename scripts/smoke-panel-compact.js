const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const compactSource = fs.readFileSync(
  path.join(root, "extension/content/panel/compact-view.js"),
  "utf8"
);
const compactStyles = fs.readFileSync(
  path.join(root, "extension/content/styles/panel-compact.js"),
  "utf8"
);
const filterEventsSource = fs.readFileSync(
  path.join(root, "extension/content/panel/filter-events.js"),
  "utf8"
);
const reorderSource = fs.readFileSync(
  path.join(root, "extension/content/panel/reorder.js"),
  "utf8"
);
const releaseStyles = fs.readFileSync(
  path.join(root, "extension/content/styles/panel-release.js"),
  "utf8"
);

assert.match(compactSource, /function renderPanelCompactItem\(item, index = 0\)/, "Compact rows should receive their visible row index");
assert.match(compactSource, /<span class="wp-compact-index" aria-hidden="true">\$\{index \+ 1\}<\/span>/, "Compact rows should show a simple numeric index");
assert.doesNotMatch(compactSource, /#\$\{index \+ 1\}/, "Compact row index should not include a hash prefix");
assert.match(compactSource, /syncPanelItemsState\(root\)/, "Compact toggle should use the shared item sync path so archive rows switch modes cleanly");
assert.match(reorderSource, /renderPanelCompactItem\(item, index\)/, "In-place compact row sync should render new archive rows with the correct row index");
assert.match(reorderSource, /syncPanelCompactItemNodeIndex/, "In-place compact row sync should refresh reused row numbers");
assert.match(reorderSource, /parent\.insertBefore\(node, sibling \|\| null\)/, "Compact row sync should insert newly rendered rows instead of only assigning CSS order");
assert.match(compactSource, /wp-compact-actions/, "Compact row actions should be grouped");
assert.match(compactSource, /startPanelViewModeSwitch\(items\)/, "Compact toggle should animate only the content area in place");
assert.match(
  compactSource,
  /<div class="wp-price-row wp-compact-price\$\{priceHtml \? "" : " is-empty"\}/,
  "Compact rows should always reserve the price column"
);
assert.match(
  compactSource,
  /aria-hidden=\\"true\\"/,
  "Empty compact price cells should stay hidden from assistive tech"
);
assert.match(
  filterEventsSource,
  /const compactView = !panelState\.compactView;[\s\S]*?savePanelSettings\(\s*\{\s*compactView\s*\},[\s\S]*?syncViewMode:\s*true/,
  "Compact view control should save and synchronize the toggled view mode"
);
assert.match(
  compactStyles,
  /grid-template-columns: 28px 78px minmax\(0, 1fr\) minmax\(82px, 126px\);/,
  "Compact rows should cap the price column so long prices cannot crush the title"
);
assert.match(
  releaseStyles,
  /grid-template-columns: 28px 78px minmax\(0, 1fr\) minmax\(82px, 126px\);/,
  "Release styles should preserve the capped compact price column"
);
assert.doesNotMatch(
  `${compactStyles}\n${releaseStyles}`,
  /32px 56px|width: 104px/,
  "Compact rows should not keep the old square thumb or fixed price column"
);
assert.match(
  compactStyles,
  /\.wp-compact-item \.wp-compact-copy \.wp-item-title\s*\{[\s\S]*?white-space: normal;[\s\S]*?overflow-wrap: break-word;[\s\S]*?word-break: normal;[\s\S]*?-webkit-line-clamp: unset;/,
  "Compact titles should wrap naturally instead of collapsing words into vertical letters"
);
assert.match(
  compactStyles,
  /\.wp-compact-price\s*\{[\s\S]*?width: auto;[\s\S]*?max-width: 126px;[\s\S]*?padding-right: 10px;[\s\S]*?box-sizing: border-box;[\s\S]*?align-self: center;[\s\S]*?justify-self: end;[\s\S]*?text-align: right;/,
  "Compact prices should stay capped and visually inset from the right edge"
);
assert.match(
  compactStyles,
  /\.wp-compact-price \.wp-native-price\s*\{[\s\S]*?flex-basis: 100%;/,
  "Native compact prices should wrap inside the fixed price column"
);
assert.match(
  compactStyles,
  /\.wp-compact-state\s*\{[\s\S]*?grid-column: 3;[\s\S]*?grid-row: 2;[\s\S]*?justify-content: flex-start;/,
  "Compact decision status should sit below the copy instead of crowding the title"
);
assert.match(
  compactStyles,
  /\.wp-compact-actions\s*\{[\s\S]*?grid-column: 3;[\s\S]*?grid-row: 2;[\s\S]*?width: 88px;[\s\S]*?opacity: 1;[\s\S]*?pointer-events: none;/,
  "Compact actions should keep the active star visible while inactive actions stay non-interactive"
);
assert.match(
  releaseStyles,
  /\.wp-compact-item\.is-archived \.wp-compact-actions \.wp-restore,[\s\S]*?\.wp-compact-item\.is-archived \.wp-compact-actions \.wp-remove\s*\{[\s\S]*?opacity: 0;[\s\S]*?pointer-events: none;/,
  "Archived compact row actions should stay hover-only instead of covering the decision status"
);
assert.match(
  compactStyles,
  /\.wp-compact-thumb\s*\{[\s\S]*?width: 78px;[\s\S]*?height: 98px;/,
  "Compact thumbnails should be taller so saved products are easier to inspect"
);
assert.match(
  compactStyles,
  /\.wp-items\.is-view-mode-switching \.wp-compact-item,[\s\S]*?@keyframes wpCompactViewSwitch/,
  "Compact view switching should use a restrained content-only transition"
);
assert.match(
  compactStyles,
  /\.wp-compact-thumb \.wp-image-frame > img\s*\{[\s\S]*?object-fit: contain;[\s\S]*?object-position: center bottom;/,
  "Compact thumbnails should show full products anchored from the bottom"
);
assert.match(
  compactStyles,
  /\.wp-compact-thumb\.is-object-bottom \.wp-image-frame > img\s*\{[\s\S]*?object-fit: contain;[\s\S]*?object-position: center bottom;/,
  "Bottom-focused compact thumbnails should stay contained instead of cropping"
);
assert.doesNotMatch(
  compactStyles,
  /\.wp-compact-thumb[\s\S]*?object-fit: cover;/,
  "Compact thumbnails should not crop saved product images"
);

console.log("panel compact smoke passed");
