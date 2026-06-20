const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const promoSource = fs.readFileSync(
  path.join(root, "extension/content/panel/promo.js"),
  "utf8"
);
const promoStyles = fs.readFileSync(
  path.join(root, "extension/content/styles/panel-promo.js"),
  "utf8"
);

assert.doesNotMatch(promoSource, /wp-founder-backdrop/, "Founder popup should not render the old translucent backdrop");
assert.match(promoSource, /wp-founder-screen/, "Founder popup should render an opaque screen over app content");
assert.match(promoSource, /founderVersionLabel/, "Founder popup should display the manifest version");
assert.match(promoSource, /github\.com\/mrxzotic/, "Founder popup should include GitHub");
assert.match(promoSource, /getstash\.app/, "Founder popup should include the site");
assert.match(promoStyles, /\.wp-founder-profile/, "Founder popup should render a profile visual block");
assert.match(promoStyles, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/, "Founder links should render as visual blocks");
assert.doesNotMatch(promoStyles, /wpFounderBackdropIn/, "Founder popup should not keep backdrop animation styles");
assert.match(promoStyles, /\.wp-founder-profile\s*\{[\s\S]*?background: #fff;/, "Founder profile block should be opaque");
assert.match(promoStyles, /\.wp-founder-link\s*\{[\s\S]*?background: #fff;/, "Founder link blocks should be opaque");
assert.match(promoStyles, /\.wp-founder-screen\s*\{[\s\S]*?background: var\(--background\);/, "Founder screen should hide the app with an opaque theme background");
assert.doesNotMatch(promoStyles, /backdrop-filter/, "Founder blocks should not rely on transparency blur");

console.log("panel promo smoke passed");
