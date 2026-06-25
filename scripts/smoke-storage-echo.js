const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "extension/content/storage-echo.js"), "utf8");
const sandbox = {};

vm.createContext(sandbox);
vm.runInContext(source, sandbox);

sandbox.expected = {
  id: "item-1",
  price: { amount: 120, currency: "USD" },
  images: [{ url: "a" }, { url: "b" }]
};
sandbox.actual = {
  images: [{ url: "a" }, { url: "b" }],
  price: { currency: "USD", amount: 120 },
  id: "item-1"
};

assert.equal(
  vm.runInContext("tuckioStorageEchoSignature(expected)", sandbox),
  vm.runInContext("tuckioStorageEchoSignature(actual)", sandbox),
  "Local storage echo signatures should ignore object key order"
);

vm.runInContext("rememberTuckioLocalStorageWrite('items', expected)", sandbox);
assert.equal(
  vm.runInContext("tuckioStorageChangeIsLocalEcho({ items: { newValue: actual } })", sandbox),
  true,
  "Local storage echo should suppress reordered Chrome storage values"
);
assert.equal(
  vm.runInContext("tuckioStorageChangeIsLocalEcho({ items: { newValue: actual } })", sandbox),
  false,
  "Local storage echo should be consumed once"
);

console.log("storage echo smoke passed");
