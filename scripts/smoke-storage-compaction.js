const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const storageSource = fs.readFileSync(
  path.join(root, "extension/content/storage.js"),
  "utf8"
);
const storageQuotaSource = fs.readFileSync(
  path.join(root, "extension/content/storage-quota.js"),
  "utf8"
);

const sampleItem = {
  id: "item-1",
  url: "https://example.com/item",
  title: "Zip Hoodie",
  brand: "Moncler",
  category: "tops",
  imageUrl: "https://example.com/a.jpg",
  imageUrls: [
    "https://example.com/a.jpg",
    "https://example.com/b.jpg",
    "https://example.com/c.jpg",
    "https://example.com/d.jpg"
  ],
  price: { amount: 1178, currency: "USD", originalText: "$1,178", rubAmount: 104842, rubText: "104842 RUB" },
  archivedAt: "2026-06-23T00:00:00.000Z",
  shortlistedAt: "2026-06-22T00:00:00.000Z",
  decision: { state: "bought", decidedAt: "2026-06-23T00:00:00.000Z" },
  hugeRawHtml: "x".repeat(10000),
  variants: ["x".repeat(10000)]
};

const sandbox = {
  STORAGE_KEY: "tuckio.items.v1",
  ALLOWED_STORAGE_KEYS: new Set(["tuckio.items.v1"]),
  LEGACY_STORAGE_KEYS: new Map([["tuckio.items.v1", "stash.items.v1"]]),
  STORAGE_MAX_DEPTH: 8,
  STORAGE_MAX_ARRAY_LENGTH: 500,
  STORAGE_MAX_OBJECT_KEYS: 80,
  STORAGE_MAX_STRING_LENGTH: 8192,
  SAVED_IMAGE_URL_LIMIT: 3,
  writes: [],
  removals: [],
  chrome: {
    storage: {
      local: {
        set: async (payload) => {
          sandbox.writes.push(payload);
          sandbox.payload = payload;
        },
        remove: async (keys) => {
          sandbox.removals.push(keys);
        }
      }
    }
  },
  normalizePanelItem: (item) => ({
    ...item,
    id: item.id || "item",
    url: item.url,
    title: item.title,
    brand: item.brand,
    sourceDomain: "example.com",
    faviconUrl: "",
    category: item.category || "tops",
    imageUrl: item.imageUrl,
    imageUrls: item.imageUrls || [],
    price: item.price || {}
  }),
  normalizeProductImageUrls: (urls, fallback, limit) => [
    ...(Array.isArray(urls) ? urls : []),
    fallback
  ].filter(Boolean).slice(0, limit),
  cleanText: (value) => String(value || "").trim(),
  sourceNameFromUrl: () => "Example",
  normalizeExtensionError: (error) => error
};

vm.createContext(sandbox);
vm.runInContext(storageSource, sandbox, { filename: "content/storage.js" });
vm.runInContext(storageQuotaSource, sandbox, { filename: "content/storage-quota.js" });

async function run() {
  sandbox.sampleItem = sampleItem;
  await vm.runInContext("setLocalStorageValue(STORAGE_KEY, [sampleItem])", sandbox);

  {
    const item = sandbox.payload["tuckio.items.v1"][0];
    assert.equal(item.id, "item-1");
    assert.equal(item.title, "Zip Hoodie");
    assert.equal(item.hugeRawHtml, undefined);
    assert.equal(item.variants, undefined);
    assert.equal(item.imageUrls.length, 3);
    assert.equal(item.archivedAt, "2026-06-23T00:00:00.000Z");
    assert.equal(item.shortlistedAt, "2026-06-22T00:00:00.000Z");
    assert.equal(item.decision.state, "bought");
    assert.equal(item.decision.decidedAt, "2026-06-23T00:00:00.000Z");
  }

  sandbox.writes = [];
  sandbox.removals = [];
  let attempt = 0;
  sandbox.chrome.storage.local.set = async (payload) => {
    sandbox.writes.push(payload);
    attempt += 1;
    if (attempt < 3) {
      throw new Error("Exceeded storage quota.");
    }
    sandbox.payload = payload;
  };

  await vm.runInContext("setLocalStorageValue(STORAGE_KEY, [sampleItem])", sandbox);

  const leanItem = sandbox.payload["tuckio.items.v1"][0];
  assert.deepEqual(sandbox.removals.map((keys) => Array.from(keys)), [["stash.items.v1"]]);
  assert.equal(sandbox.writes.length, 3);
  assert.equal(leanItem.imageUrl, "https://example.com/a.jpg");
  assert.equal(leanItem.imageUrls, undefined);
  assert.equal(leanItem.priceText, undefined);
  assert.equal(leanItem.faviconUrl, undefined);

  sandbox.writes = [];
  sandbox.removals = [];
  attempt = 0;
  sandbox.chrome.storage.local.set = async (payload) => {
    sandbox.writes.push(payload);
    attempt += 1;
    if (attempt < 5) {
      throw new Error("Invalid call to browser.storage.local.set(). Exceeded storage quota.");
    }
    sandbox.payload = payload;
  };

  await vm.runInContext("setLocalStorageValue(STORAGE_KEY, [sampleItem])", sandbox);

  const tinyItem = sandbox.payload["tuckio.items.v1"][0];
  assert.deepEqual(sandbox.removals.map((keys) => Array.from(keys)), [
    ["stash.items.v1"],
    ["tuckio.items.v1", "stash.items.v1"]
  ]);
  assert.equal(sandbox.writes.length, 5);
  assert.equal(tinyItem.imageUrl, undefined);
  assert.equal(tinyItem.imageUrls, undefined);
  assert.equal(tinyItem.url, "https://example.com/item");
  assert.equal(tinyItem.shortlistedAt, "2026-06-22T00:00:00.000Z");
  assert.equal(tinyItem.decision.state, "bought");

  console.log("storage compaction smoke passed");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
