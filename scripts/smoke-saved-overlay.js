const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const overlaySource = read("extension/content/overlays.js");
const overlayImageSource = read("extension/content/overlay-images.js");
const overlayMotionSource = read("extension/content/overlay-motion.js");
const overlayStyles = read("extension/content/styles/overlay.js");
const overlayImageStyles = read("extension/content/styles/overlay-images.js");
const overlayMotionStyles = read("extension/content/styles/overlay-motion.js");
const fieldSource = read("extension/content/overlay-fields.js");
const fieldStyles = read("extension/content/styles/overlay-fields.js");
const panelBaseStyles = read("extension/content/styles/panel-1.js");
const panelCardStyles = read("extension/content/styles/panel-5.js");
const constantsSource = read("extension/content/constants.js");
const backgroundSource = read("extension/background.js");
const overlayBehaviorSource = `${overlaySource}\n${overlayImageSource}\n${overlayMotionSource}`;

const contentVersion = constantsSource.match(/CONTENT_VERSION\s*=\s*"([^"]+)"/)?.[1];
assert.ok(contentVersion, "Content version should be declared");
assert.ok(
  backgroundSource.includes(`CONTENT_SCRIPT_VERSION = "${contentVersion}"`),
  "Background should use the active overlay content version"
);
assert.match(overlaySource, /Auto-close in/, "Saved overlay timer should describe auto-close behavior");
assert.doesNotMatch(overlaySource, /class="wl-progress"/, "Saved overlay timer should not be a top-edge meter");
assert.match(overlaySource, /wl-timer-track[\s\S]*?data-timer-progress/, "Saved overlay timer should live inside the card header");
assert.doesNotMatch(fieldSource, /wl-confidence-summary|>Confidence</, "Saved overlay should not show extraction confidence");
assert.doesNotMatch(fieldStyles, /\.wl-confidence/, "Saved overlay should not style visible confidence controls");
assert.doesNotMatch(fieldSource, /data-field-alternative|wl-alternates/, "Saved overlay should not show review choices while auto-closing");
assert.doesNotMatch(fieldStyles, /\.wl-alt-button|\.wl-alternates/, "Saved overlay should not style review choices");
assert.match(overlaySource, /wl-action-group is-left[\s\S]*?data-cancel-addition/, "Undo should be separated on the left");
assert.match(overlaySource, /wl-timer-line[\s\S]*?data-toggle-timer/, "Pause should be paired with the auto-close copy");
assert.match(overlaySource, /wl-action-group is-right[\s\S]*?data-open-stash/, "Open Stash should be grouped on the right");
assert.doesNotMatch(overlaySource, /data-edit-saved-item|wl-edit-button|>Edit</, "Saved overlay should not show an edit decision while auto-closing");
assert.match(fieldStyles, /\.wl-actions\s*\{[\s\S]*?justify-content: space-between;/, "Saved overlay actions should not be centered");
assert.match(fieldStyles, /\.wl-open-button\s*\{[\s\S]*?background: #050505;/, "Open Stash should be the primary CTA");
assert.doesNotMatch(overlaySource, /lucide[A-Z]/, "Saved overlay should not use lucide icons");
assert.doesNotMatch(overlayImageSource, /lucide[A-Z]/, "Saved overlay image controls should not use lucide icons");
for (const icon of [
  "phosphorPauseIcon",
  "phosphorXIcon",
  "phosphorLinkIcon",
  "phosphorChevronLeftIcon",
  "phosphorChevronRightIcon",
  "phosphorImageOffIcon"
]) {
  assert.match(overlayBehaviorSource, new RegExp(icon), `Saved overlay should use ${icon}`);
}
assert.match(backgroundSource, /"content\/overlay-fields\.js",\s*"content\/overlay-images\.js",\s*"content\/overlay-motion\.js",\s*"content\/overlays\.js"/, "Overlay helpers should load before the saved overlay");
assert.match(backgroundSource, /"content\/styles\/overlay-fields\.js",\s*"content\/styles\/overlay-images\.js",\s*"content\/styles\/overlay-motion\.js",\s*"content\/styles\/overlay\.js"/, "Overlay motion styles should load before the saved overlay stylesheet");
assert.match(overlaySource, /renderSavedOverlayImage\(item\)/, "Saved overlay should render images through the slider-aware image renderer");
assert.match(overlayImageSource, /renderMissingProductImage\("wl"\)/, "Saved overlay should use the Stashed missing-image fallback");
assert.doesNotMatch(overlayImageSource, /phosphorImageIcon\("wl-image-placeholder"\)/, "Saved overlay should not use the old generic image icon fallback");
assert.match(overlaySource, /wl-panel is-motion-reveal/, "Saved overlay should opt into staged motion reveal");
assert.match(overlaySource, /renderSavedOverlaySkeleton\(\)/, "Saved overlay should render the skeleton layer before content");
assert.match(overlayImageSource, /data-overlay-image-slide="previous"[\s\S]*?data-overlay-image-slide="next"/, "Saved overlay should support previous and next image controls");
assert.match(overlayImageSource, /data-overlay-image-delete/, "Saved overlay should include the same current-image delete affordance as cards");
assert.match(overlayImageSource, /data-overlay-image-url/, "Saved overlay should expose image dots for every saved product image");
assert.match(overlayImageSource, /saveSavedOverlayImageChoice/, "Saved overlay image changes should persist");
assert.match(overlayImageSource, /removeSavedOverlayImage/, "Saved overlay image deletion should persist");
assert.match(overlayStyles, /width: min\(420px, calc\(100vw - 32px\), calc\(\(100vh - 48px\) \* 9 \/ 16\)\);/, "Saved overlay should use the original app width model");
assert.match(overlayStyles, /height: min\(746px, calc\(100vh - 48px\)\);/, "Saved overlay should use the original app height model");
assert.doesNotMatch(overlayStyles, /aspect-ratio: 1 \/ 1;/, "Saved overlay should not force square aspect ratio");
assert.match(overlayStyles, /\.wl-timer-track\s*\{[\s\S]*?height: 5px;/, "Saved overlay timer bar should be visibly thick enough");
for (const token of ["--text-micro: 10px;", "--text-caption: 11px;", "--text-control: 12px;", "--text-body: 13px;", "--text-ui: 14px;", "--text-heading: 16px;"]) {
  assert.match(panelBaseStyles, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Main panel should define typography token ${token}`);
  assert.match(overlayStyles, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `Saved overlay should share typography token ${token}`);
}
assert.match(overlayStyles, /\.wl-kicker\s*\{[\s\S]*?font-size: var\(--text-heading\);/, "Saved overlay heading should match the main panel heading token");
assert.match(overlayStyles, /\.wl-countdown\s*\{[\s\S]*?font-size: var\(--text-caption\);/, "Saved overlay timer copy should match the main panel caption token");
assert.match(fieldStyles, /\.wl-field dt\s*\{[\s\S]*?font-size: var\(--text-micro\);/, "Saved overlay labels should use the shared micro token");
assert.match(fieldStyles, /\.wl-field-value\s*\{[\s\S]*?font-size: var\(--text-ui\);/, "Saved overlay product text should match main card title size");
assert.match(panelCardStyles, /\.wp-item-title[\s\S]*?font-size: var\(--text-ui\);/, "Main card title should use the UI token");
assert.match(fieldStyles, /\.wl-site-price,\s*\.wl-compare-price\s*\{[\s\S]*?font-size: var\(--text-control\);/, "Saved overlay price should match main card price size");
assert.match(fieldStyles, /\.wl-price-stack\s*\{[\s\S]*?display: inline-grid;/, "Saved overlay price should stack primary and secondary currencies");
assert.match(fieldStyles, /\.wl-field\.is-price \.wl-field-value\s*\{[\s\S]*?white-space: normal;/, "Saved overlay price should be able to wrap into two lines");
assert.match(panelCardStyles, /\.wp-site-price,\s*\.wp-compare-price\s*\{[\s\S]*?font-size: var\(--text-control\);/, "Main card price should use the control token");
assert.match(fieldStyles, /\.wl-open-button,\s*\.wl-cancel-button\s*\{[\s\S]*?font-size: var\(--text-control\);/, "Saved overlay actions should match main control size");
assert.match(overlayStyles, /overlayImageStyles\(\)/, "Saved overlay shell should include image styles");
assert.match(overlayStyles, /overlayMotionStyles\(\)/, "Saved overlay shell should include motion styles");
assert.match(overlayMotionSource, /wl-skeleton-layer[\s\S]*wl-skeleton-media[\s\S]*wl-skeleton-fields[\s\S]*wl-skeleton-actions/, "Saved overlay should include full-card skeleton structure");
for (const animation of ["wlPanelMotionIn", "wlSkeletonLayer", "wlSkeletonSweep", "wlContentRise", "wlMediaShellIn", "wlProductReveal", "wlButtonSettle"]) {
  assert.match(overlayMotionStyles, new RegExp(`@keyframes ${animation}`), `Saved overlay should define ${animation}`);
}
assert.match(overlayMotionStyles, /\.wl-panel\.is-motion-reveal \.wl-field:nth-child\(1\)[\s\S]*?animation-delay: 680ms;/, "Saved overlay field reveal should be staggered");
assert.match(overlayMotionStyles, /\.wl-panel\.is-motion-reveal \.wl-actions[\s\S]*?animation-delay: 910ms;/, "Saved overlay actions should reveal after fields");
assert.match(overlayMotionStyles, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.wl-skeleton-layer[\s\S]*?display: none;/, "Saved overlay motion should respect reduced motion");
assert.match(overlayImageStyles, /\.wl-image-slider-button\s*\{/, "Saved overlay should style image slider arrows");
assert.match(overlayImageStyles, /\.wl-image-delete-button\s*\{/, "Saved overlay should style the image delete button");
assert.match(overlayImageStyles, /\.wl-image-slider-dot\.is-active\s*\{/, "Saved overlay should style active image dots");
assert.match(overlayStyles, /\.wl-panel::before\s*\{[\s\S]*?opacity: 0\.15;/, "Saved overlay should have a restrained 15 percent iridescent wash");
assert.match(overlayStyles, /animation: wlSurfaceShine 920ms 180ms cubic-bezier\(.16, 1, .3, 1\) both;/, "Saved overlay shine should run once on entry");
assert.doesNotMatch(overlayStyles, /wlSurfaceShine[\s\S]*infinite/, "Saved overlay shine should not loop");
assert.doesNotMatch(fieldStyles, /grid-template-columns: minmax\(0, 1fr\) 58px;/, "Confidence should not crowd each data row");

console.log("saved overlay smoke passed");
