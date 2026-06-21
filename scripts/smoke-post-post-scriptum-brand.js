const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sandbox = {
  URL,
  console,
  window: { innerWidth: 1440, innerHeight: 900 },
  document: { querySelectorAll: () => [], title: "P.P.S." },
  location: new URL("https://post-post-scriptum.com/man/categories=dzhinsy/")
};

vm.createContext(sandbox);

[
  "extension/content/constants.js",
  "extension/content/utils.js",
  "extension/content/media.js",
  "extension/content/text.js",
  "extension/content/source-icons.js",
  "extension/content/extractors/context.js"
].forEach((file) => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, {
    filename: file
  });
});

assert.equal(sandbox.cleanBrandName("P.P.S."), "P.P.S.");
assert.equal(
  sandbox.sourceNameFromUrl("https://post-post-scriptum.com/man/categories=dzhinsy/"),
  "P.P.S."
);
assert.equal(
  sandbox.findLikelyBrand([
    "СИНИЙ ВИНТАЖНЫЙ",
    "Fit Широкие Джинсы Завышенной Посадки",
    "14 000 ₽"
  ], "", ""),
  "P.P.S."
);

sandbox.location = new URL("https://www.farfetch.com/fi/shopping/men/new-items-2/items.aspx");
assert.equal(
  sandbox.findLikelyBrand(["New Season", "Acne Studios", "jersey T-shirt with logo", "365 €"], "", ""),
  "Acne Studios"
);

console.log("post-post-scriptum brand smoke passed");
