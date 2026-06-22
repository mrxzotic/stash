const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const rootDir = path.resolve(__dirname, "..");
const source = fs.readFileSync(
  path.join(rootDir, "extension/content/panel/dismiss.js"),
  "utf8"
);

let pendingTimer = null;
let closed = 0;
const documentListeners = {};
const rootListeners = {};
const closeButtonListeners = {};
const shell = {};
const host = {};
const outsideNode = {};

const sandbox = {
  panelState: { open: true },
  closeTuckioPanel: () => {
    closed += 1;
    sandbox.panelState.open = false;
  },
  document: {
    addEventListener: (type, listener) => {
      documentListeners[type] = listener;
    },
    removeEventListener: (type, listener) => {
      if (documentListeners[type] === listener) {
        delete documentListeners[type];
      }
    }
  },
  window: {
    __tuckioPanelDismiss: null,
    setTimeout: (callback) => {
      pendingTimer = callback;
      return 1;
    },
    clearTimeout: () => {
      pendingTimer = null;
    }
  }
};

const closeButton = {
  addEventListener: (type, listener) => {
    closeButtonListeners[type] = listener;
  }
};

const root = {
  host,
  querySelector: (selector) => {
    if (selector === ".wp-shell") return shell;
    if (selector === "[data-panel-close]") return closeButton;
    return null;
  },
  addEventListener: (type, listener) => {
    rootListeners[type] = listener;
  },
  removeEventListener: (type, listener) => {
    if (rootListeners[type] === listener) {
      delete rootListeners[type];
    }
  }
};

vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "content/panel/dismiss.js" });

sandbox.bindPanelDismissEvents(root);
assert.equal(typeof documentListeners.pointerdown, "function");
assert.equal(typeof rootListeners.pointerdown, "function");

documentListeners.pointerdown({
  button: 0,
  target: outsideNode,
  composedPath: () => [outsideNode]
});
assert.equal(closed, 0, "Outside pointerdown should defer panel close until the event finishes");
assert.equal(typeof pendingTimer, "function");
pendingTimer();
assert.equal(closed, 1, "Outside pointerdown should close after the defer");

closed = 0;
sandbox.panelState.open = true;
sandbox.bindPanelDismissEvents(root);
documentListeners.pointerdown({
  button: 0,
  target: outsideNode,
  composedPath: () => []
});
rootListeners.pointerdown();
assert.equal(pendingTimer, null, "A shadow-root pointerdown should cancel a misclassified outside close");
assert.equal(closed, 0);

documentListeners.pointerdown({
  button: 0,
  target: host,
  composedPath: () => [shell, root, host]
});
assert.equal(pendingTimer, null, "A normal panel pointerdown should not schedule a close");
assert.equal(closed, 0);

sandbox.unbindPanelDismissEvents(root);
assert.equal(documentListeners.pointerdown, undefined);
assert.equal(rootListeners.pointerdown, undefined);

console.log("panel dismiss smoke passed");
