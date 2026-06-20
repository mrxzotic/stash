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
  compactStyles,
  /grid-template-columns: 34px 54px minmax\(0, 1fr\) auto 58px;/,
  "Compact rows should reserve columns for index, thumb, copy, price, and actions"
);
assert.match(
  compactStyles,
  /\.wp-compact-actions\s*\{[\s\S]*?display: inline-flex;[\s\S]*?gap: 2px;/,
  "Compact actions should sit next to each other"
);

console.log("panel compact smoke passed");
