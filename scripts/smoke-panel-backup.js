const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const backupSource = fs.readFileSync(
  path.join(root, "extension/content/panel/export.js"),
  "utf8"
);

assert.match(backupSource, /schema:\s*BACKUP_SCHEMA/, "Backup export should write the v1 schema marker");
assert.match(backupSource, /LEGACY_BACKUP_SCHEMA/, "Backup import should accept legacy exports");
assert.match(backupSource, /file\.size > 6 \* 1024 \* 1024/, "Backup import should reject oversized files");
assert.match(backupSource, /id:\s*productId\(normalized\.url\)/, "Imported items should use canonical URL-derived IDs");
assert.match(backupSource, /const key = productId\(item\.url\) \|\| item\.id;/, "Import merge should dedupe by product URL first");
assert.match(backupSource, /\.slice\(0, 300\)/, "Import merge should keep the local storage cap");

console.log("panel backup smoke passed");
