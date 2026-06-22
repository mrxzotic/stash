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
assert.doesNotMatch(promoSource, /wp-founder-screen/, "Founder popup should render as a full in-panel view");
assert.match(promoSource, /founderVersionLabel/, "Founder popup should display the manifest version");
assert.match(promoSource, /tuckioLogoUrl/, "Founder popup should show the Tuckio logo");
assert.match(promoSource, /assets\/tuckio-app-open\.png/, "Founder popup should use the Tuckio app artwork");
assert.match(promoSource, /Save products from any shop/, "Founder popup should describe Tuckio first");
assert.match(promoSource, /github\.com\/mrxzotic/, "Founder popup should include GitHub");
assert.match(promoSource, /tuckio\.com/, "Founder popup should include the site");
assert.match(promoSource, /Founder/, "Founder popup should separate founder contacts");
assert.doesNotMatch(promoSource, /<span>@zoticx<\/span>/, "Founder profile should not show the handle next to Alex");
assert.match(promoSource, /phosphorXLogoIcon/, "Founder popup should use a Phosphor icon for X");
assert.match(promoSource, /phosphorGithubLogoIcon/, "Founder popup should use a Phosphor icon for GitHub");
assert.match(promoSource, /data-export-backup/, "Founder popup should expose JSON export");
assert.match(promoSource, /data-import-backup/, "Founder popup should expose JSON import");
assert.match(promoSource, /data-import-backup-file/, "Founder popup should include a JSON file picker");
assert.match(promoSource, /Local JSON backup/, "Founder popup should label local backup");
assert.match(promoSource, /Export JSON/, "Founder popup should label JSON export");
assert.match(promoSource, /Import JSON/, "Founder popup should label JSON import");
assert.match(promoSource, /Import merges with saved items/, "Founder popup should explain JSON import behavior");
assert.doesNotMatch(promoSource, /Download JSON/, "Founder popup should not render backup as a separate large card");
assert.match(promoStyles, /\.wp-founder-app/, "Founder popup should render a Tuckio app header");
assert.match(promoStyles, /\.wp-founder-app-logo\s*\{[^}]*filter: drop-shadow/, "Tuckio logo shadow should follow the transparent icon alpha");
assert.doesNotMatch(promoStyles, /\.wp-founder-app-logo\s*\{[^}]*box-shadow:/, "Tuckio logo should not render inside a framed square");
assert.match(promoStyles, /\.wp-founder-person/, "Founder popup should render a founder profile row");
assert.match(promoStyles, /\.wp-founder-modal\s*\{[\s\S]*?inset: 0;/, "Founder popup should occupy the panel surface");
assert.match(promoStyles, /padding: 64px 48px 40px;/, "Founder popup should use 8px-grid full-view padding");
assert.match(promoStyles, /\.wp-founder-contact-icon\s*\{[\s\S]*?width: 32px;[\s\S]*?height: 32px;/, "Founder contact icons should fit the 8px grid");
assert.match(promoStyles, /\.wp-founder-contact-icons\s*\{[\s\S]*?display: flex;/, "Founder contact links should render as icon-only controls");
assert.match(promoStyles, /\.wp-founder-backup-actions/, "Founder popup should include labeled backup actions");
assert.doesNotMatch(promoStyles, /wpFounderBackdropIn/, "Founder popup should not keep backdrop animation styles");
assert.match(promoStyles, /\.wp-founder-modal\s*\{[\s\S]*?background: var\(--background\);/, "Founder popup should use the panel surface");
assert.match(promoStyles, /\.wp-founder-modal\s*\{[\s\S]*?box-shadow: none;/, "Founder popup should not look like a nested screen");
assert.doesNotMatch(promoStyles, /\.wp-founder-person\s*\{[^}]*background: #fff;/, "Founder profile should not be a separate card");
assert.doesNotMatch(promoStyles, /\.wp-founder-link\s*\{[^}]*background: #fff;/, "Founder links should not be separate cards");
assert.doesNotMatch(promoStyles, /\.wp-founder-link\s*\{[^}]*border: 1px/, "Founder links should not have individual borders");
assert.doesNotMatch(promoStyles, /backdrop-filter/, "Founder blocks should not rely on transparency blur");

console.log("panel promo smoke passed");
