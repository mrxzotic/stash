const fs = require("node:fs");
const path = require("node:path");

function contentScriptFiles(root = path.resolve(__dirname, "..")) {
  const source = fs.readFileSync(path.join(root, "extension/background.js"), "utf8");
  const match = source.match(/const CONTENT_SCRIPT_FILES = \[([\s\S]*?)\];/);
  if (!match) {
    throw new Error("CONTENT_SCRIPT_FILES not found in background.js");
  }

  return Array.from(match[1].matchAll(/"([^"]+)"/g), (entry) => entry[1]);
}

module.exports = { contentScriptFiles };
