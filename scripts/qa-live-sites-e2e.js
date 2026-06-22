const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const extensionDir = path.join(root, "extension");
const backgroundSource = fs.readFileSync(path.join(extensionDir, "background.js"), "utf8");
const contentVersion = backgroundSource.match(/CONTENT_SCRIPT_VERSION = "([^"]+)"/)?.[1];
const contentScriptFiles = Array.from(
  backgroundSource.match(/const CONTENT_SCRIPT_FILES = \[([\s\S]*?)\];/)?.[1].matchAll(/"([^"]+)"/g) || [],
  (entry) => entry[1]
);

const storageKey = "stash.items.v1";
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const minPassingLiveSites = Number(process.env.QA_MIN_LIVE_SITES || 10);
const maxLiveSites = Number(process.env.QA_MAX_LIVE_SITES || 15);

const liveSites = [
  ["Acne Studios", "https://www.acnestudios.com/us/en/rw-mn-trou000042/BK0776-228.html?g=man"],
  ["Adidas", "https://www.adidas.fi/superstar-vintage-shoes/JQ3255.html"],
  ["AllSaints", "https://www.allsaints.com/eu/men/t-shirts/petals-oversized-short-sleeve-graphic-t-shirt/M062PE-162.html"],
  ["Farfetch", "https://www.farfetch.com/fi/shopping/men/casablanca-logo-buckle-leather-belt-item-36693002.aspx"],
  ["Krakatau", "https://en.krakatauwear.com/collections/mens-spring-summer-2026/products/raincoat-qm572?variant=60972861718858"],
  ["LIME", "https://limestore.com/ru_ru/product/32596_6103_336-sostarennyi_sinii"],
  ["Loewe", "https://www.loewe.com/eur/en/women/bags/bucket-bags/medium-bilbao-bucket-in-smooth-calfskin/AWRAWPRX01-5984.html"],
  ["MR PORTER", "https://www.mrporter.com/en-fi/mens/product/mr-p/clothing/short-sleeve-polo-shirts/organic-cotton-pique-polo-shirt/1647597359927196"],
  ["On", "https://www.on.com/en-fi/products/cloudmonster-3-hyper-ls-u-3ug1001/unisex/black-apollo-shoes-3UG10014670"],
  ["P448", "https://p448.com/products/f25john11-w-960"],
  ["PYE", "https://pyeoptics.com/shop/catalogue/theo-m_8772/"],
  ["Tom Ford", "https://www.tomfordfashion.co.uk/en-gb/silk-satin-bomber%C2%A0/OBB010-FMS072.html"],
  ["Rendez-Vous", "https://www.rendez-vous.ru/catalog/bags/klatch/lumique_lum_bgs26_01_olivkovyy-5144377/"],
  ["RIMOWA", "https://www.rimowa.com/fi/en/luggage/colour/silver/cabin/92553004.html"],
  ["Sorelle Era", "https://www.sorelleera.com/products/sonnet-windbreaker-light-pink"],
  ["The Row", "https://www.therow.com/en-eu/products/vonn-cardigan-blue-melange"]
];

assert.ok(contentVersion, "CONTENT_SCRIPT_VERSION should be readable");
assert.ok(contentScriptFiles.length, "CONTENT_SCRIPT_FILES should be readable");

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function main() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wishlisted-live-qa-"));
  const qaExtensionDir = path.join(tempRoot, "extension");
  const screenshotPath = path.join(tempRoot, "panel-pill-widths.png");
  fs.cpSync(extensionDir, qaExtensionDir, { recursive: true });
  addTemporaryHostPermissions(qaExtensionDir);

  const liveResults = [];
  for (const [index, [name, url]] of liveSites.slice(0, maxLiveSites).entries()) {
    const context = await launchQaContext(qaExtensionDir, path.join(tempRoot, `profile-${index}`));
    try {
      const worker = await extensionWorker(context);
      await worker.evaluate(() => chrome.storage.local.clear());
      const page = await context.newPage();
      liveResults.push(await smokeLiveSite(page, worker, name, url));
      console.log(formatLiveResult(liveResults.at(-1)));
    } finally {
      await context.close().catch(() => {});
    }
  }

  const passing = liveResults.filter((result) => result.ok);
  assert.ok(
    passing.length >= minPassingLiveSites,
    `Expected at least ${minPassingLiveSites} passing live sites, got ${passing.length}`
  );

  const edgeContext = await launchQaContext(qaExtensionDir, path.join(tempRoot, "profile-edge"));
  try {
    const edgePage = await edgeContext.newPage();
    const uiMetrics = await smokePanelEdgeCases(edgePage, await extensionWorker(edgeContext), screenshotPath);
    console.log(`panel edge case smoke passed ${JSON.stringify(uiMetrics)}`);
    console.log(`panel screenshot: ${screenshotPath}`);
  } finally {
    await edgeContext.close().catch(() => {});
  }
}

async function launchQaContext(qaExtensionDir, userDataDir) {
  return chromium.launchPersistentContext(userDataDir, {
    headless: false,
    executablePath: chromePath,
    viewport: { width: 1360, height: 960 },
    args: [
      `--disable-extensions-except=${qaExtensionDir}`,
      `--load-extension=${qaExtensionDir}`,
      "--disable-quic",
      "--no-first-run",
      "--no-default-browser-check"
    ]
  });
}

function addTemporaryHostPermissions(dir) {
  const manifestPath = path.join(dir, "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  manifest.host_permissions = ["http://*/*", "https://*/*"];
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function extensionWorker(context) {
  return context.serviceWorkers()[0] || context.waitForEvent("serviceworker", { timeout: 15000 });
}

async function smokeLiveSite(page, worker, name, url) {
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await dismissCookieBanner(page);
    await page.waitForLoadState("networkidle", { timeout: 7000 }).catch(() => {});
    await page.waitForTimeout(1200);
    const blockedReason = await blockedPageReason(page);
    if (blockedReason) {
      return { name, ok: false, blocked: true, status: response?.status() || 0, title: "", brand: "", price: "", image: false, issues: [blockedReason] };
    }

    const saved = await saveActiveTab(worker);
    const item = saved.stored?.[storageKey]?.[0];
    const issues = validateSavedItem(item);
    return {
      name,
      ok: Boolean(saved.response?.ok && item && issues.length === 0),
      status: response?.status() || 0,
      title: item?.title || "",
      brand: item?.brand || "",
      price: item?.price?.originalText || item?.priceText || "",
      image: Boolean(item?.imageUrl),
      issues
    };
  } catch (error) {
    return { name, ok: false, blocked: false, status: 0, title: "", brand: "", price: "", image: false, issues: [error.message] };
  }
}

async function blockedPageReason(page) {
  const text = await page.locator("body").innerText({ timeout: 2500 }).catch(() => "");
  if (/unable to give you access|access denied|security issue was automatically identified|temporarily blocked|verify you are human|captcha/i.test(text)) {
    return "access blocked";
  }
  return "";
}

async function saveActiveTab(worker) {
  return worker.evaluate(async ({ files, version }) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files });
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "STASH_SAVE_V2",
      contentVersion: version,
      category: "auto",
      context: { pageUrl: tab.url }
    });
    const stored = await chrome.storage.local.get("stash.items.v1");
    return { response, stored };
  }, { files: contentScriptFiles, version: contentVersion });
}

function validateSavedItem(item) {
  const issues = [];
  if (!item) {
    return ["no saved item"];
  }
  const title = String(item.title || "");
  const brand = String(item.brand || "");
  if (!title || title === "Saved Product") issues.push("missing title");
  if (!brand) issues.push("missing brand");
  if (/^(powered by onetrust|accept all cookies|your cookie settings|cookie settings|cookie preferences|privacy preferences|manage cookies|add to cart|add to bag|add to basket|email\*?|details|all details|product details|composition|care|composition and care|free delivery(?:\s+from\b.*)?|skip to main content|man|men|mens|women|womens|unisex|collections?|коллекци(?:я|и)|состав\s+и\s+уход|гид\s+по\s+размерам|таблица\s+размеров|размеры|доставка|возврат|доставка\s+и\s+возврат|оплата|добавить(?:\s+в)?\s+корзину|в\s+корзину|купить)$/i.test(brand) || /^(?:sku|article|арт(?:икул)?\.?|цвет)\s*[:#-]?\s*/iu.test(brand)) {
    issues.push("brand contains UI noise");
  }
  if (!/^https?:\/\//.test(String(item.url || ""))) issues.push("missing URL");
  if (!item.imageUrl) issues.push("missing image");
  if (title.length > 96) issues.push("title too long");
  if (/\b(add to|wishlist|share|sold out|availability|sku|article)\b/i.test(title) || /\bарт(?:икул)?\.?\b/iu.test(title)) {
    issues.push("title contains parser noise");
  }
  return issues;
}

async function smokePanelEdgeCases(page, worker, screenshotPath) {
  await page.goto("https://example.com", { waitUntil: "domcontentloaded", timeout: 30000 });
  const items = seededItems();
  await worker.evaluate(async ({ key, items }) => {
    await chrome.storage.local.set({ [key]: items });
  }, { key: storageKey, items });
  await worker.evaluate(async ({ files, version }) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files });
    await chrome.tabs.sendMessage(tab.id, { type: "STASH_TOGGLE_PANEL_V2", contentVersion: version });
  }, { files: contentScriptFiles, version: contentVersion });
  await page.waitForFunction(() => document.getElementById("stash-panel-root")?.shadowRoot?.querySelector(".wp-shell"));
  const metrics = await page.evaluate(() => {
    const root = document.getElementById("stash-panel-root").shadowRoot;
    const read = (selector) => {
      const element = root.querySelector(selector);
      return {
        text: element?.textContent.trim() || "",
        width: Math.round(element?.getBoundingClientRect().width || 0),
        clientWidth: element?.clientWidth || 0,
        scrollWidth: element?.scrollWidth || 0
      };
    };
    return {
      brand: read(".wp-brand-chip"),
      archive: read(".wp-filter-archive"),
      count: read(".wp-count"),
      total: read(".wp-total")
    };
  });
  assert.ok(metrics.brand.width > 50 && metrics.brand.scrollWidth <= metrics.brand.clientWidth + 1, "brand pill should resize for count 10");
  assert.ok(metrics.archive.width > 50 && metrics.archive.scrollWidth <= metrics.archive.clientWidth + 1, "archive pill should resize for count 12");
  assert.ok(metrics.count.width > 64 && metrics.count.scrollWidth <= metrics.count.clientWidth + 1, "item count pill should resize for count 111");
  assert.ok(metrics.total.scrollWidth <= metrics.total.clientWidth + 1, "summary total should not clip");
  await page.screenshot({ path: screenshotPath, fullPage: false });
  return metrics;
}

function seededItems() {
  const active = Array.from({ length: 111 }, (_, index) => ({
    id: `active-${index + 1}`,
    title: `Product ${index + 1}`,
    brand: `Brand ${index % 10}`,
    url: `https://example.com/products/active-${index + 1}`,
    category: index % 2 ? "tops" : "bags",
    price: { amount: 40 + index, currency: "USD", originalText: `$${40 + index}` },
    priceText: `$${40 + index}`,
    priceAmount: 40 + index,
    currency: "USD",
    imageUrl: "https://example.com/product.jpg",
    createdAt: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString()
  }));
  const archived = Array.from({ length: 12 }, (_, index) => ({
    ...active[index],
    id: `archived-${index + 1}`,
    url: `https://example.com/products/archived-${index + 1}`,
    archivedAt: "2026-06-22T00:00:00.000Z"
  }));
  return [...active, ...archived];
}

async function dismissCookieBanner(page) {
  await page.evaluate(() => {
    const pattern = /^(accept|accept all|agree|allow all|ok|got it|tout accepter|aceptar|принять|согласен)/i;
    for (const element of document.querySelectorAll("button, [role='button'], input[type='button'], input[type='submit']")) {
      const text = (element.innerText || element.value || element.getAttribute("aria-label") || "").trim();
      if (pattern.test(text)) {
        element.click();
        return;
      }
    }
  }).catch(() => {});
}

function formatLiveResult(result) {
  const state = result.ok ? "PASS" : result.blocked ? "BLOCKED" : "FAIL";
  const details = [result.brand, result.title, result.price].filter(Boolean).join(" | ");
  const issues = result.issues?.length ? ` issues=${result.issues.join(",")}` : "";
  return `${state} ${result.name} status=${result.status} image=${result.image}${details ? ` ${details}` : ""}${issues}`;
}
