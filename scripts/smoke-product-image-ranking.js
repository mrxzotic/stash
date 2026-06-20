const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sandbox = {
  URL,
  console,
  location: new URL("https://shop.example/products/cloudmonster-2"),
  window: { innerWidth: 1440, innerHeight: 900 }
};

vm.createContext(sandbox);

[
  "extension/content/constants.js",
  "extension/content/utils.js",
  "extension/content/media.js",
  "extension/content/extractors/context.js"
].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
    filename: file
  });
});

const lowResOnImage =
  "https://upload.on-running.com/spree/products/4791/product/low-frost-white.png?width=320";
const highResOnImage =
  "https://upload.on-running.com/spree/products/4791/product/high-frost-white.png?width=1600";
const clickedImage = fakeImage({
  height: 180,
  src: lowResOnImage,
  srcset: `${lowResOnImage} 320w, ${highResOnImage} 1600w`,
  width: 320
});

sandbox.lastContextPoint = { x: 160, y: 90 };

assert.equal(
  sandbox.bestProductImageUrl(
    { srcUrl: lowResOnImage },
    clickedImage,
    { querySelectorAll: () => [clickedImage] }
  ),
  highResOnImage,
  "Image clicks should prefer higher-resolution srcset candidates over context srcUrl"
);

const packshotImageUrl = "https://cdn.example/cloudmonster-packshot.jpg";
const modelImageUrl = "https://cdn.example/cloudmonster-model.jpg";
const packshotImage = fakeImage({
  alt: "Cloudmonster 2 product packshot front",
  className: "product-image primary",
  src: packshotImageUrl
});
const modelImage = fakeImage({
  alt: "Cloudmonster 2 worn by model",
  className: "lookbook model alternate",
  left: 420,
  src: modelImageUrl
});

assert.equal(
  sandbox.bestProductImageUrl(
    { srcUrl: modelImageUrl },
    modelImage,
    { querySelectorAll: () => [packshotImage, modelImage] }
  ),
  packshotImageUrl,
  "Image role scoring should prefer product packshots over model shots in the same card"
);

console.log("product image ranking smoke passed");

function fakeImage(options = {}) {
  return {
    alt: options.alt || "",
    className: options.className || "",
    currentSrc: options.currentSrc || options.src,
    naturalWidth: options.width || 320,
    parentElement: { className: options.parentClassName || "" },
    src: options.src,
    srcset: options.srcset || "",
    title: options.title || "",
    width: options.width || 320,
    closest: () => null,
    getAttribute: (name) => options.attributes?.[name] || "",
    getBoundingClientRect: () => ({
      left: options.left || 0,
      top: options.top || 0,
      width: options.width || 320,
      height: options.height || 180
    })
  };
}
