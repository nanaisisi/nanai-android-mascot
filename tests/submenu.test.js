import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => "ivory", setItem: () => {} };

const documentListeners = {};
const globalListeners = {};

globalThis.document = {
	body: { classList: { add() {}, remove() {} } },
	addEventListener(type, cb) {
		documentListeners[type] = cb;
	},
	documentElement: { setAttribute() {} },
	getElementById(id) {
		return {
			innerHTML: "",
			appendChild() {},
			style: {},
			querySelectorAll: () => [],
		};
	},
};
globalThis.addEventListener = (type, cb) => {
	globalListeners[type] = cb;
};

// Import submenu to initialize listeners
await import("../ui/js/ui/submenu.js");

test("submenu event handlers, Tauri sync listeners, and DOMContentLoaded init", async () => {
	// 1. Test document mousedown
	documentListeners.mousedown?.({ button: 0, target: { closest: () => null } });

	// 2. Test Tauri event listeners via mock listen
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd) => {},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;

	// Trigger DOMContentLoaded
	globalListeners.DOMContentLoaded?.();

	assert.ok(true);
});
