const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const utilsSource = fs.readFileSync(
  path.join(root, "extension/content/utils.js"),
  "utf8"
);
const productUrlSource = fs.readFileSync(
  path.join(root, "extension/content/extractors/product-url.js"),
  "utf8"
);
const storageSource = fs.readFileSync(
  path.join(root, "extension/content/storage.js"),
  "utf8"
);
const storagePriceCheckSource = fs.readFileSync(
  path.join(root, "extension/content/storage-price-check.js"),
  "utf8"
);
const storageEchoSource = fs.readFileSync(
  path.join(root, "extension/content/storage-echo.js"),
  "utf8"
);
const storageQuotaSource = fs.readFileSync(
  path.join(root, "extension/content/storage-quota.js"),
  "utf8"
);
const storageUpsertSource = fs.readFileSync(
  path.join(root, "extension/content/storage-upsert.js"),
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
  price: { amount: 1178, currency: "USD", originalText: "$1,178" },
  priceCheck: {
    checkedAt: "2026-06-25T10:30:00.000Z",
    state: "down",
    previous: { amount: 1200, currency: "USD", originalText: "$1,200" },
    current: { amount: 1178, currency: "USD", originalText: "$1,178" },
    deltaAmount: -22
  },
  extraction: {
    needsReview: true,
    fields: {
      title: { confidence: 0.42, sources: ["meta"] },
      price: { confidence: 0.95, sources: ["jsonld"] }
    }
  },
  archivedAt: "2026-06-23T00:00:00.000Z",
  shortlistedAt: "2026-06-22T00:00:00.000Z",
  decision: { state: "bought", decidedAt: "2026-06-23T00:00:00.000Z" },
  hugeRawHtml: "x".repeat(10000),
  variants: ["x".repeat(10000)]
};

const sandbox = {
  URL,
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
  currentStored: { "tuckio.items.v1": [] },
  location: new URL("https://shop.example/products/cloudmonster-2"),
  chrome: {
    storage: {
      local: {
        get: async () => sandbox.currentStored,
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
  normalizeProductImageUrls: (urls, fallback, limit) => Array.from(new Set([
    fallback,
    ...(Array.isArray(urls) ? urls : [])
  ].filter(Boolean))).slice(0, limit),
  cleanText: (value) => String(value || "").trim(),
  sourceNameFromUrl: () => "Example",
  normalizeExtensionError: (error) => error
};

vm.createContext(sandbox);
vm.runInContext(utilsSource, sandbox, { filename: "content/utils.js" });
vm.runInContext(productUrlSource, sandbox, { filename: "content/extractors/product-url.js" });
vm.runInContext(storagePriceCheckSource, sandbox, { filename: "content/storage-price-check.js" });
vm.runInContext(storageEchoSource, sandbox, { filename: "content/storage-echo.js" });
vm.runInContext(storageSource, sandbox, { filename: "content/storage.js" });
vm.runInContext(storageQuotaSource, sandbox, { filename: "content/storage-quota.js" });
vm.runInContext(storageUpsertSource, sandbox, { filename: "content/storage-upsert.js" });

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
    assert.equal(item.priceCheck.checkedAt, "2026-06-25T10:30:00.000Z");
    assert.equal(item.priceCheck.state, "down");
    assert.equal(item.priceCheck.previous.amount, 1200);
    assert.equal(item.priceCheck.current.amount, 1178);
    assert.equal(item.priceCheck.deltaAmount, -22);
    assert.equal(item.priceCheck.deltaRubAmount, undefined);
    assert.equal(item.extraction.needsReview, true);
    assert.equal(item.extraction.fields.title.confidence, 0.42);
  }

  sandbox.twoImageItem = {
    ...sampleItem,
    id: "two-images",
    imageUrl: "https://example.com/a.jpg",
    imageUrls: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    priceCheck: undefined
  };
  await vm.runInContext("setLocalStorageValue(STORAGE_KEY, [twoImageItem])", sandbox);
  {
    const item = sandbox.payload["tuckio.items.v1"][0];
    assert.equal(item.imageUrls.length, 2);
    assert.deepEqual(item.imageUrls, ["https://example.com/a.jpg", "https://example.com/b.jpg"]);
  }

  sandbox.oneImageItem = {
    ...sampleItem,
    id: "one-image",
    imageUrl: "https://example.com/only.jpg",
    imageUrls: [],
    priceCheck: undefined
  };
  await vm.runInContext("setLocalStorageValue(STORAGE_KEY, [oneImageItem])", sandbox);
  {
    const item = sandbox.payload["tuckio.items.v1"][0];
    assert.equal(item.imageUrls.length, 1);
    assert.deepEqual(item.imageUrls, ["https://example.com/only.jpg"]);
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
  assert.equal(leanItem.priceCheck.state, "down");
  assert.equal(leanItem.extraction.needsReview, true);

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
  assert.equal(tinyItem.priceCheck.state, "down");
  assert.equal(tinyItem.extraction.needsReview, true);

  sandbox.writes = [];
  sandbox.removals = [];
  sandbox.currentStored = {
    "tuckio.items.v1": [
      {
        id: "old-cloudmonster",
        url: "https://shop.example/products/cloudmonster-2?variant=111",
        title: "Old Cloudmonster",
        brand: "On",
        category: "shoes",
        createdAt: "2026-06-01T00:00:00.000Z",
        shortlistedAt: "2026-06-02T00:00:00.000Z",
        decision: { state: "bought", decidedAt: "2026-06-03T00:00:00.000Z" },
        price: {}
      },
      {
        id: "cloudsurfer",
        url: "https://shop.example/products/cloudsurfer",
        title: "Cloudsurfer",
        brand: "On",
        price: {}
      }
    ]
  };
  sandbox.nextItem = {
    id: "new-cloudmonster",
    url: "https://shop.example/products/cloudmonster-2?variant=222&utm_source=feed",
    title: "New Cloudmonster",
    brand: "On",
    category: "tops",
    price: {}
  };

  const repeatedSave = await vm.runInContext("upsertItemWithResult(nextItem)", sandbox);

  const dedupedItems = sandbox.payload["tuckio.items.v1"];
  assert.equal(repeatedSave.state, "updated");
  assert.equal(repeatedSave.item.id, "old-cloudmonster");
  assert.equal(dedupedItems.length, 2);
  assert.deepEqual(Array.from(dedupedItems, (item) => item.title), ["New Cloudmonster", "Cloudsurfer"]);
  assert.equal(dedupedItems[0].id, "old-cloudmonster");
  assert.equal(dedupedItems[0].category, "shoes");
  assert.equal(dedupedItems[0].createdAt, "2026-06-01T00:00:00.000Z");
  assert.equal(dedupedItems[0].shortlistedAt, "2026-06-02T00:00:00.000Z");
  assert.equal(dedupedItems[0].decision.state, "bought");

  sandbox.currentStored = { "tuckio.items.v1": [] };
  sandbox.freshItem = {
    id: "fresh",
    url: "https://shop.example/products/fresh",
    title: "Fresh",
    brand: "On",
    price: {}
  };
  const freshSave = await vm.runInContext("upsertItemWithResult(freshItem)", sandbox);
  assert.equal(freshSave.state, "created");
  assert.equal(freshSave.items.length, 1);

  console.log("storage compaction smoke passed");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
