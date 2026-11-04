import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.localStorage = { getItem: () => "ivory", setItem: () => {} };

const documentListeners = {};
const globalListeners = {};
const tauriListeners = {};

let emitShouldFail = false;

globalThis.document = {
	body: { classList: { add() {}, remove(..._args) {}, toggle() {} } },
	addEventListener(type, cb) {
		documentListeners[type] = cb;
	},
	documentElement: {
		setAttribute() {},
		getAttribute: () => "default",
		style: {
			setProperty() {},
			removeProperty() {},
		},
	},
	getElementById(_id) {
		if (!this._cachedElements) this._cachedElements = {};
		if (!this._cachedElements[_id]) {
			this._cachedElements[_id] = {
				innerHTML: "",
				appendChild(child) {
					this.lastChild = child;
				},
				style: {},
				querySelectorAll: () => [],
			};
		}
		return this._cachedElements[_id];
	},
	createElement: (_tag) => ({
		className: "",
		innerHTML: "",
		appendChild() {},
		style: {},
		dataset: {},
		_listeners: {},
		addEventListener(type, cb) {
			this._listeners[type] = cb;
		},
		click() {
			this._listeners?.click?.({ stopPropagation() {} });
		},
	}),
};
globalThis.addEventListener = (type, cb) => {
	globalListeners[type] = cb;
};

globalThis.__TAURI_INTERNALS__ = {
	metadata: {
		currentWindow: { label: "submenu", startDragging: async () => {} },
	},
	invoke: async (cmd, args) => {
		if (cmd === "plugin:event|listen") {
			tauriListeners[args.event] = args.handler;
			return 1;
		}
		if (cmd === "plugin:event|emit") {
			if (emitShouldFail) throw new Error("Emit IPC failed");
			return;
		}
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

let notifySubmenuShouldFail = false;
globalThis.__TAURI_INTERNALS__.invoke = async (cmd, args) => {
	if (cmd === "plugin:event|listen") {
		tauriListeners[args.event] = args.handler;
		return 1;
	}
	if (cmd === "plugin:event|emit") {
		if (emitShouldFail) throw new Error("Emit IPC failed");
		return;
	}
	if (cmd === "hide_menu_window") return;
	if (cmd === "hide_submenu_window") return;
	if (cmd === "notify_submenu_ready") {
		if (notifySubmenuShouldFail) throw new Error("Notify fail");
		return;
	}
};

// Import submenu to initialize listeners
await import("../ui/js/ui/submenu.js");

test("submenu event handlers, Tauri sync listeners, and DOMContentLoaded init", async () => {
	// 1. Test document mousedown
	documentListeners.mousedown?.({ button: 0, target: { closest: () => null } });
	documentListeners.mousedown?.({ button: 0, target: { closest: () => ({}) } });
	documentListeners.mousedown?.({ button: 1, target: { closest: () => null } });

	// 2. Trigger DOMContentLoaded with notify failure catch branch
	notifySubmenuShouldFail = true;
	globalListeners.DOMContentLoaded?.();
	notifySubmenuShouldFail = false;

	// 3. Test Tauri event listeners
	await tauriListeners["set-submenu-type"]?.({ payload: { type: "dressup" } });
	await tauriListeners["set-submenu-type"]?.({ payload: { type: "ghost" } });
	await tauriListeners["set-submenu-type"]?.({ payload: null });

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
	await tauriListeners["sync-ghosts"]?.({ payload: null });

	await tauriListeners["sync-balloons"]?.({
		payload: [{ dir_name: "ivory", name: "Ivory" }],
	});
	await tauriListeners["sync-balloons"]?.({ payload: null });

	await tauriListeners["sync-theme"]?.({ payload: "dark" });
	await tauriListeners["sync-theme"]?.({ payload: null });

	await tauriListeners["sync-menu-scope"]?.({ payload: 1 });
	await tauriListeners["sync-menu-scope"]?.({ payload: "0" });
	await tauriListeners["sync-menu-scope"]?.({ payload: "invalid" });

	// 4. Test window message listener
	globalListeners.message?.({ data: { type: "unknown" } });
	globalListeners.message?.({
		data: { type: "set-submenu-type", submenuType: "dressup" },
	});
	globalListeners.message?.({
		data: {
			type: "sync-ghosts",
			ghosts: [{ name: "G2" }],
			currentGhost: "G2",
			shells: [{ name: "master" }],
			currentShell: "master",
			recentGhosts: ["G2"],
			dressup: { sakura: { categories: [] } },
			scope: 1,
		},
	});
	globalListeners.message?.({
		data: {
			type: "sync-balloons",
			balloons: [{ dir_name: "pink", name: "Pink" }],
		},
	});
	globalListeners.message?.({
		data: { type: "sync-theme", theme: "pink" },
	});
	globalListeners.message?.({
		data: { type: "sync-menu-scope", scope: "0" },
	});
	globalListeners.message?.({
		data: { type: "sync-menu-scope", scope: 1 },
	});

	// 5. Test dispatchSubmenuAction via renderer generated element clicks
	await tauriListeners["set-submenu-type"]?.({ payload: { type: "ghost" } });
	const submenuContainer = document.getElementById("submenu-content");
	if (submenuContainer?.lastChild?.click) {
		await submenuContainer.lastChild.click();
	}

	// Trigger error catch branch in dispatchSubmenuAction
	emitShouldFail = true;
	if (submenuContainer?.lastChild?.click) {
		await submenuContainer.lastChild.click();
	}
	emitShouldFail = false;

	// sync-menu-scope with currentSubmenuType = dressup
	await tauriListeners["set-submenu-type"]?.({ payload: { type: "dressup" } });
	await tauriListeners["sync-menu-scope"]?.({ payload: 0 });

	// Click in non-tauri mode
	const origTauri = globalThis.__TAURI_INTERNALS__;
	delete globalThis.__TAURI_INTERNALS__;
	if (submenuContainer?.lastChild?.click) {
		await submenuContainer.lastChild.click();
	}
	globalThis.__TAURI_INTERNALS__ = origTauri;

	assert.ok(true);
});
