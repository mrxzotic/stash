const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { REGRESSION_BANK_CASES } = require("./regression-bank-cases");

const root = path.resolve(__dirname, "..");
const requiredShops = ["Nike", "Farfetch", "LIME", "P448"];
const ownerScripts = new Map();

assert.ok(REGRESSION_BANK_CASES.length >= 10, "Regression bank should cover representative shops");

for (const shop of requiredShops) {
  assert.ok(
    REGRESSION_BANK_CASES.some((entry) => entry.shop === shop),
    `Regression bank should cover ${shop}`
  );
}

for (const entry of REGRESSION_BANK_CASES) {
  assertRegressionBankCase(entry);
  ownerScripts.set(entry.owner, ownerSourceFor(entry.owner));
  assertOwnerMentionsExpectedFacts(entry, ownerScripts.get(entry.owner));
}

for (const owner of ownerScripts.keys()) {
  try {
    execFileSync(process.execPath, [path.join(root, owner)], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    throw new Error(`${owner} failed:\n${error.stdout || ""}${error.stderr || ""}`);
  }
}

console.log("regression bank smoke passed");

function assertRegressionBankCase(entry) {
  assert.match(entry.id, /^[a-z0-9-]+$/);
  assert.ok(entry.shop);
  assert.ok(entry.owner);
  assert.ok(entry.url);
  assert.ok(entry.expected?.brand);
  assert.ok(entry.expected?.title);
  assert.equal(typeof entry.expected.priceAmount, "number");
  assert.ok(entry.expected.currency);
  assert.ok(entry.expected.imageNeedle);
  assert.equal(fs.existsSync(path.join(root, entry.owner)), true, `${entry.owner} should exist`);
}

function assertOwnerMentionsExpectedFacts(entry, source) {
  const expected = entry.expected;
  for (const needle of [
    expected.brand,
    expected.title,
    String(expected.priceAmount),
    expected.currency,
    expected.imageNeedle
  ]) {
    assert.ok(
      source.includes(needle),
      `${entry.owner} should mention ${JSON.stringify(needle)} for ${entry.id}`
    );
  }
}

function ownerSourceFor(owner) {
  return fs.readFileSync(path.join(root, owner), "utf8");
}
