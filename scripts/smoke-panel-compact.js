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
const releaseStyles = fs.readFileSync(
  path.join(root, "extension/content/styles/panel-release.js"),
  "utf8"
);

assert.match(compactSource, /wp-compact-index/, "Compact rows should render an item index");
assert.match(compactSource, /#\$\{index \+ 1\}/, "Compact item index should use # numbering");
assert.match(compactSource, /wp-compact-actions/, "Compact row actions should be grouped");
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
  compactSource,
  /savePanelSettings\(\s*\{\s*compactView: !panelState\.compactView\s*\},[\s\S]*?syncViewMode:\s*true/,
  "Compact toggle should save and synchronize the requested view mode"
);
assert.match(
  compactStyles,
  /grid-template-columns: 32px 56px minmax\(0, 1fr\) 104px 56px;/,
  "Compact rows should reserve a fixed price column"
);
assert.match(
  releaseStyles,
  /grid-template-columns: 32px 56px minmax\(0, 1fr\) 104px 56px;/,
  "Release styles should not override the fixed compact price column"
);
assert.doesNotMatch(
  `${compactStyles}\n${releaseStyles}`,
  /minmax\(72px, max-content\)/,
  "Compact price columns should not size from row content"
);
assert.match(
  compactStyles,
  /\.wp-compact-item \.wp-compact-copy \.wp-item-title\s*\{[\s\S]*?-webkit-line-clamp: 1;/,
  "Compact titles should truncate before colliding with the price column"
);
assert.match(
  compactStyles,
  /\.wp-compact-price\s*\{[\s\S]*?width: 104px;[\s\S]*?justify-self: stretch;[\s\S]*?text-align: left;/,
  "Compact prices should fill the fixed scan column"
);
assert.match(
  compactStyles,
  /\.wp-compact-price \.wp-native-price\s*\{[\s\S]*?flex-basis: 100%;/,
  "Native compact prices should wrap inside the fixed price column"
);
assert.match(
  compactStyles,
  /\.wp-compact-actions\s*\{[\s\S]*?display: inline-flex;[\s\S]*?gap: 0;/,
  "Compact actions should sit next to each other"
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
