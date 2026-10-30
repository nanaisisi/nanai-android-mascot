import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => "ivory", setItem: () => {} };

const documentListeners = {};
const globalListeners = {};
const tauriListeners = {};

globalThis.document = {
	body: { classList: { add() {}, remove(..._args) {} } },
	addEventListener(type, cb) {
		documentListeners[type] = cb;
	},
	documentElement: { setAttribute() {} },
	getElementById(_id) {
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

globalThis.__TAURI_INTERNALS__ = {
	metadata: {
		currentWindow: { label: "submenu", startDragging: async () => {} },
	},
	invoke: async (cmd) => {
		if (cmd === "hide_menu_window") return;
		if (cmd === "hide_submenu_window") return;
		if (cmd === "notify_submenu_ready") return;
	},
	transformCallback: (cb) => cb,
	plugins: {
		event: {
			listen: async (event, cb) => {
				tauriListeners[event] = cb;
				return () => {};
			},
			emit: async () => {},
		},
	},
};

// Import submenu to initialize listeners
await import("../ui/js/ui/submenu.js");

test("submenu event handlers, Tauri sync listeners, and DOMContentLoaded init", async () => {
	// 1. Test document mousedown
	documentListeners.mousedown?.({ button: 0, target: { closest: () => null } });

	// 2. Trigger DOMContentLoaded
	globalListeners.DOMContentLoaded?.();

	// 3. Test Tauri event listeners
	await tauriListeners["set-submenu-type"]?.({ payload: { type: "dressup" } });

	await tauriListeners["sync-ghosts"]?.({
		payload: {
			ghosts: [{ name: "G1" }],
			currentGhost: "G1",
			shells: [{ name: "master" }],
			currentShell: "master",
			recentGhosts: ["G1"],
			dressup: { sakura: { categories: [] } },
			scope: 0,
		},
	});

	await tauriListeners["sync-balloons"]?.({
		payload: [{ dir_name: "ivory", name: "Ivory" }],
	});

	await tauriListeners["sync-theme"]?.({ payload: "dark" });

	await tauriListeners["sync-menu-scope"]?.({ payload: 1 });

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
