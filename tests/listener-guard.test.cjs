const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { test } = require("node:test");

const source = fs.readFileSync("copy-unlocker-extension/unlock-copy.js", "utf8");
const start = source.indexOf("  const wrapListener =");
const end = source.indexOf("  const installEventFirewall =");

function createTarget() {
  const context = vm.createContext({});
  vm.runInContext(`
    const state = { wrappedListeners: new WeakMap() };
    const hardBlockedEvents = new Set(["copy"]);
    const keyboardEvents = new Set(["keydown"]);
    const pointerEvents = new Set(["mousedown"]);
    const shouldStopPageHandler = () => false;
    class EventTarget {
      constructor() { this.listeners = new Map(); }
      addEventListener(type, listener) {
        if (!this.listeners.has(type)) this.listeners.set(type, new Set());
        this.listeners.get(type).add(listener);
      }
      removeEventListener(type, listener) {
        this.listeners.get(type)?.delete(listener);
      }
    }
    ${source.slice(start, end)}
    globalThis.target = new EventTarget();
    globalThis.install = installAddEventListenerGuard;
  `, context);
  return context;
}

test("removes wrapped function and object listeners", () => {
  for (const listener of [() => {}, { handleEvent() {} }]) {
    const { target, install } = createTarget();
    install();
    target.addEventListener("keydown", listener);
    assert.equal(target.listeners.get("keydown").size, 1);
    target.removeEventListener("keydown", listener);
    assert.equal(target.listeners.get("keydown").size, 0);
  }
});

test("removes listeners registered before activation", () => {
  const { target, install } = createTarget();
  const listener = () => {};
  target.addEventListener("keydown", listener);
  install();
  target.addEventListener("keydown", listener);
  target.removeEventListener("keydown", listener);
  assert.equal(target.listeners.get("keydown").size, 0);
});

test("preserves case-sensitive custom event names and repeated installation", () => {
  const { target, install } = createTarget();
  install();
  install();
  const listener = () => {};
  target.addEventListener("COPY", listener);
  assert.ok(target.listeners.get("COPY").has(listener));
  target.removeEventListener("COPY", listener);
  assert.equal(target.listeners.get("COPY").size, 0);
  target.removeEventListener("keydown", null);
});
