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

assert.match(compactSource, /wp-compact-index/, "Compact rows should render an item index");
assert.match(compactSource, /#\$\{index \+ 1\}/, "Compact item index should use # numbering");
assert.match(compactSource, /wp-compact-actions/, "Compact row actions should be grouped");
assert.match(
  compactSource,
  /savePanelSettings\(\{\s*compactView: !panelState\.compactView\s*\}\)/,
  "Compact toggle should save and fully rerender the requested view mode"
);
assert.doesNotMatch(
  compactSource,
  /syncViewMode:\s*true/,
  "Compact toggle should not rely on partial view-mode sync"
);
assert.match(
  compactStyles,
  /grid-template-columns: 32px 56px minmax\(0, 1fr\) minmax\(72px, max-content\) 56px;/,
  "Compact rows should reserve columns for index, thumb, copy, price, and actions"
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
