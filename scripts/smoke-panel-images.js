const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const panelImagesSource = read("extension/content/panel/images.js");
const panelRenderSource = read("extension/content/panel/render.js");
const panelImageStyles = read("extension/content/styles/panel-images.js");
const panelReleaseStyles = read("extension/content/styles/panel-release.js");
const overlayImageSource = read("extension/content/overlay-images.js");
const overlayImageStyles = read("extension/content/styles/overlay-images.js");

assert.match(panelRenderSource, /renderPanelCardMedia\(item\)/, "Cards should render media through the shared media renderer");
assert.match(panelImagesSource, /phosphorImageOffIcon\(iconClass\)/, "Missing image fallback should use the vendored Phosphor broken-image icon");
assert.doesNotMatch(panelImagesSource, /tuckioMonochromeLogoUrl\(\)/, "Missing image fallback should not render the app logo as a product image");
assert.match(panelRenderSource, /function replaceBrokenProductImage\(image\)/, "Broken loaded images should be replaced through one fallback helper");
assert.match(panelRenderSource, /image\.complete && !image\.naturalWidth/, "Cached broken images should fall back without showing browser alt text");
assert.match(panelRenderSource, /\.wp-image-frame, \.wl-image-frame/, "Broken panel and overlay image frames should both be replaceable");
assert.match(panelImagesSource, /removePanelCardImage\(media\.dataset\.imageSliderId,\s*imageUrl,\s*currentIndex,\s*media\)/, "Panel image deletion should pass the removed index, not a promoted next image");
assert.match(panelImagesSource, /const primary = remaining\[0\];/, "Panel image deletion should preserve the remaining image order");
assert.match(panelImagesSource, /replacePanelCardImageMedia\(media,\s*updatedItem,\s*nextImageIndex\)/, "Panel image deletion should replace only the media node");
assert.doesNotMatch(panelImagesSource, /nextImageUrl|nextKey/, "Panel image deletion should not promote the next image to first");
assert.doesNotMatch(panelImagesSource, /renderPanelItemsOnly\(/, "Panel image deletion should not rerender the full item list");
assert.match(panelImagesSource, /restorePanelMediaHover\(nextMedia,\s*shouldRestoreHover\)/, "Panel image deletion should restore hover controls after DOM replacement");
assert.match(panelImageStyles, /\.wp-media\.is-hover-restored \.wp-image-slider-button/, "Panel slider arrows should respect restored hover state");
assert.match(panelImageStyles, /\.wp-media\.is-hover-restored \.wp-image-slider-tray/, "Panel delete tray should respect restored hover state");
assert.match(panelReleaseStyles, /\.wp-media\.is-hover-restored \.wp-shortlist/, "Panel card actions should respect restored hover state");

assert.match(overlayImageSource, /removeSavedOverlayImage\(root,\s*media,\s*item,\s*imageUrl,\s*currentIndex\)/, "Saved overlay image deletion should pass the removed index");
assert.match(overlayImageSource, /const primary = remaining\[0\];/, "Saved overlay image deletion should preserve the remaining image order");
assert.match(overlayImageSource, /restoreSavedOverlayImageHover\(nextMedia,\s*shouldRestoreHover\)/, "Saved overlay image deletion should restore hover controls");
assert.doesNotMatch(overlayImageSource, /nextImageUrl|nextKey/, "Saved overlay image deletion should not promote the next image to first");
assert.match(overlayImageStyles, /\.wl-image\.has-slider\.is-hover-restored \.wl-image-slider-button/, "Saved overlay slider arrows should respect restored hover state");

console.log("panel image smoke passed");
