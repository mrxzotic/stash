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
const aboutStyles = fs.readFileSync(
  path.join(root, "extension/content/styles/panel-about.js"),
  "utf8"
);
const panelStyles = fs.readFileSync(
  path.join(root, "extension/content/styles/panel.js"),
  "utf8"
);
const resetSource = fs.readFileSync(
  path.join(root, "extension/content/panel/reset.js"),
  "utf8"
);
const backgroundSource = fs.readFileSync(
  path.join(root, "extension/background.js"),
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
assert.match(promoSource, /t\("Author"\)/, "About popup should label Alex as Author");
assert.match(promoSource, /Author contacts/, "About popup should expose author contact semantics");
assert.doesNotMatch(promoSource, /t\("Founder"\)|Founder contacts|Founder contact links/, "About popup should not use Founder as visible copy");
assert.doesNotMatch(promoSource, /<span>@zoticx<\/span>/, "Founder profile should not show the handle next to Alex");
assert.match(promoSource, /phosphorXLogoIcon/, "Founder popup should use a Phosphor icon for X");
assert.match(promoSource, /phosphorGithubLogoIcon/, "Founder popup should use a Phosphor icon for GitHub");
assert.match(promoSource, /data-export-backup/, "Founder popup should expose backup export");
assert.match(promoSource, /data-import-backup/, "Founder popup should expose backup import");
assert.match(promoSource, /data-import-backup-file/, "Founder popup should include a JSON file picker");
assert.match(promoSource, /renderFounderDangerZone/, "Founder popup should render a reset danger zone");
assert.match(promoSource, /data-reset-confirm-root/, "Founder popup should expose reset confirmation root");
assert.match(promoSource, /data-reset-confirm-input/, "Founder popup should include hard-confirm input");
assert.match(promoSource, /TUCKIO_RESET_CONFIRM_WORD/, "Founder popup should use the shared reset confirmation word");
assert.match(promoSource, /Export backup/, "Founder popup should label export without visible JSON language");
assert.match(promoSource, /Import backup/, "Founder popup should label import without visible JSON language");
assert.doesNotMatch(promoSource, /Local JSON backup|Export JSON|Import JSON|Import merges with saved items/, "Founder popup should not explain JSON backup to regular users");
assert.doesNotMatch(promoSource, /Download JSON/, "Founder popup should not render backup as a separate large card");
assert.match(promoStyles, /\.wp-founder-app/, "Founder popup should render a Tuckio app header");
assert.match(promoStyles, /\.wp-founder-app-logo\s*\{[^}]*filter: drop-shadow/, "Tuckio logo shadow should follow the transparent icon alpha");
assert.doesNotMatch(promoStyles, /\.wp-founder-app-logo\s*\{[^}]*box-shadow:/, "Tuckio logo should not render inside a framed square");
assert.match(promoStyles, /\.wp-founder-person/, "Founder popup should render a founder profile row");
assert.match(promoStyles, /\.wp-founder-modal\s*\{[\s\S]*?inset: 0;/, "Founder popup should occupy the panel surface");
assert.match(promoStyles, /padding: 64px 48px 40px;/, "Founder popup should use 8px-grid full-view padding");
assert.match(promoStyles, /\.wp-founder-contact-icon\s*\{[\s\S]*?width: 32px;[\s\S]*?height: 32px;/, "Founder contact icons should fit the 8px grid");
assert.match(promoStyles, /\.wp-founder-contact-icons\s*\{[\s\S]*?display: flex;/, "Founder contact links should render as icon-only controls");
assert.match(aboutStyles, /\.wp-founder-backup\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto;/, "Founder popup should render backup as an explicit row");
assert.match(aboutStyles, /\.wp-founder-backup-action\s*\{[\s\S]*?inline-flex;/, "Founder popup should render backup as icon-and-label controls");
assert.match(aboutStyles, /\.wp-founder-modal\s*\{[\s\S]*?padding: 56px 48px 32px;/, "About view should tighten the full-panel composition");
assert.match(aboutStyles, /\.wp-founder-danger\s*\{[\s\S]*?margin-top: 28px;/, "Danger zone should stay in the compact About rhythm");
assert.match(aboutStyles, /\.wp-founder-reset-confirm\s*\{[\s\S]*?grid-template-rows: 0fr;/, "Reset confirm should collapse with animatable grid rows");
assert.match(aboutStyles, /\.wp-founder-danger\.is-confirming \.wp-founder-reset-confirm\s*\{[\s\S]*?grid-template-rows: 1fr;/, "Reset confirm should open with smooth grid motion");
assert.match(aboutStyles, /\.wp-founder-reset-confirm-button:not\(:disabled\)\s*\{[\s\S]*?background: #d1242f;/, "Reset confirm should turn red only after hard confirm");
assert.match(panelStyles, /panelPromoStyles\(\),\s*panelAboutStyles\(\),/, "About styles should override the base promo styles");
assert.match(backgroundSource, /"content\/panel\/export\.js",\s*"content\/panel\/reset\.js",/, "Reset module should load with the panel data actions");
assert.match(backgroundSource, /"content\/styles\/panel-promo\.js",\s*"content\/styles\/panel-about\.js",/, "About style chunk should be injected after promo styles");
assert.match(resetSource, /function bindPanelResetEvents/, "About reset controls should bind in a focused reset module");
assert.match(resetSource, /value\.trim\(\) !== TUCKIO_RESET_CONFIRM_WORD/, "Reset should require the exact hard-confirm word");
assert.match(resetSource, /chrome\.storage\.local\.remove\(Array\.from\(ALLOWED_STORAGE_KEYS\)\)/, "Reset should remove all known Tuckio storage keys");
assert.match(resetSource, /resetPanelStateAfterDataReset/, "Reset should restore in-memory panel defaults after clearing storage");
assert.doesNotMatch(promoStyles, /wpFounderBackdropIn/, "Founder popup should not keep backdrop animation styles");
assert.match(promoStyles, /\.wp-founder-modal\s*\{[\s\S]*?background: var\(--background\);/, "Founder popup should use the panel surface");
assert.match(promoStyles, /\.wp-founder-modal\s*\{[\s\S]*?box-shadow: none;/, "Founder popup should not look like a nested screen");
assert.doesNotMatch(promoStyles, /\.wp-founder-person\s*\{[^}]*background: #fff;/, "Founder profile should not be a separate card");
assert.doesNotMatch(promoStyles, /\.wp-founder-link\s*\{[^}]*background: #fff;/, "Founder links should not be separate cards");
assert.doesNotMatch(promoStyles, /\.wp-founder-link\s*\{[^}]*border: 1px/, "Founder links should not have individual borders");
assert.doesNotMatch(promoStyles, /backdrop-filter/, "Founder blocks should not rely on transparency blur");

console.log("panel promo smoke passed");
