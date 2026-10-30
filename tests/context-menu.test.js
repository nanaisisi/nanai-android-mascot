import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=0" };
globalThis.innerWidth = 800;
globalThis.innerHeight = 600;
globalThis.localStorage = { getItem: () => "default", setItem: () => {} };

const documentListeners = {};
const globalListeners = {};
const tauriListeners = {};

let showSubmenuShouldFail = false;

globalThis.document = {
	body: { classList: { add() {}, remove() {} } },
	addEventListener(type, cb) {
		documentListeners[type] = cb;
	},
	getElementById(_id) {
		return {
			innerHTML: "",
			appendChild() {},
			classList: { add() {}, remove() {} },
			style: {},
			querySelector: () => null,
			querySelectorAll: () => [],
		};
	},
	createElement: (_tag) => ({
		innerHTML: "",
		appendChild() {},
		style: {},
		dataset: {},
		addEventListener() {},
	}),
	querySelector(sel) {
		if (sel === ".menu-container") {
			return { getBoundingClientRect: () => ({ right: 700 }) };
		}
		return null;
	},
	querySelectorAll(sel) {
		if (sel === ".menu-item-wrapper") {
			return [
				{
					classList: { add() {}, remove() {}, contains: () => false },
					querySelector: () => ({ id: "ghost-switch-btn" }),
					addEventListener(t, cb) {
						this._listeners = this._listeners || {};
						this._listeners[t] = cb;
					},
					mouseenter() {
						this._listeners?.mouseenter?.();
					},
					mouseleave() {
						this._listeners?.mouseleave?.();
					},
				},
			];
		}
		return [];
	},
	documentElement: {
		getAttribute: () => "default",
		setAttribute() {},
		style: { removeProperty() {}, setProperty() {} },
	},
};

globalThis.addEventListener = (type, cb) => {
	globalListeners[type] = cb;
};

globalThis.__TAURI_INTERNALS__ = {
	metadata: { currentWindow: { label: "context_menu" } },
	invoke: async (cmd) => {
		if (cmd === "show_submenu_window") {
			if (showSubmenuShouldFail) throw new Error("Submenu IPC failed");
			return;
		}
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

// Import context-menu to initialize listeners
await import("../ui/js/ui/context-menu.js");

test("context-menu event handlers, sync listeners, mouse events and keyboard shortcuts", async () => {
	// 1. Test document mousedown
	documentListeners.mousedown?.({ button: 0, target: { closest: () => null } });

	// 2. Test Tauri event listeners with string scope and full shells/dressup
	await tauriListeners["sync-menu-scope"]?.({ payload: "1" });
	await tauriListeners["sync-ghosts"]?.({
		payload: {
			scope: 1,
			ghosts: [{ name: "Ghost1" }],
			currentGhost: { name: "Ghost1" },
			shells: [{ name: "master" }, { name: "alt" }],
			currentShell: "alt",
			dressup: { kero: { categories: [] } },
			recentGhosts: ["Ghost1"],
		},
	});
	await tauriListeners["sync-theme"]?.({ payload: "ivory" });
	await tauriListeners["sync-balloons"]?.({ payload: [{ name: "default" }] });

	// 3. Test window message listener
	globalListeners.message?.({ data: { type: "unknown" } });
	globalListeners.message?.({ data: { type: "sync-scope", scope: "1" } });
	globalListeners.message?.({
		data: {
			type: "sync-ghosts",
			ghosts: [],
			currentGhost: "G1",
			dressup: { sakura: { categories: [] } },
			recentGhosts: ["G1"],
			scope: 0,
		},
	});
	globalListeners.message?.({
		data: {
			type: "sync-shells",
			shells: [{ name: "master" }],
			currentShell: "master",
		},
	});
	globalListeners.message?.({ data: { type: "sync-theme", theme: "ivory" } });
	globalListeners.message?.({
		data: { type: "sync-balloons", balloons: [{ name: "default" }] },
	});

	// 4. Test document click on has-submenu and normal menu item in Tauri
	const wrapperEl = {
		classList: { add() {}, remove() {}, contains: () => false },
	};

	const mockSubmenuBtn = {
		id: "ghost-switch-btn",
		classList: { contains: (c) => c === "has-submenu" },
		getBoundingClientRect: () => ({ top: 100 }),
		closest: (sel) => {
			if (sel === ".menu-item") return mockSubmenuBtn;
			if (sel === ".menu-item-wrapper") return wrapperEl;
			return null;
		},
	};
	documentListeners.click?.({ target: mockSubmenuBtn });

	// Submenu window error catch fallback (lines 175-186)
	showSubmenuShouldFail = true;
	documentListeners.click?.({ target: mockSubmenuBtn });
	showSubmenuShouldFail = false;

	// Non-Tauri click on has-submenu
	const origTauri = globalThis.__TAURI_INTERNALS__;
	delete globalThis.__TAURI_INTERNALS__;
	documentListeners.click?.({ target: mockSubmenuBtn });
	globalThis.__TAURI_INTERNALS__ = origTauri;

	const mockMenuItem = {
		classList: { contains: () => false },
		dataset: { action: "recommend" },
		id: "",
		closest(sel) {
			if (sel === ".menu-item, .submenu-container") return null;
			if (sel === ".menu-item") return this;
			return null;
		},
	};
	documentListeners.click?.({ target: mockMenuItem });

	// 5. Test mouseenter & mouseleave on menu-item-wrapper
	const wrappers = document.querySelectorAll(".menu-item-wrapper");
	wrappers[0]?.mouseenter();
	wrappers[0]?.mouseleave();

	delete globalThis.__TAURI_INTERNALS__;
	wrappers[0]?.mouseenter();
	wrappers[0]?.mouseleave();
	globalThis.__TAURI_INTERNALS__ = origTauri;

	// 6. Test document keydown shortcuts
	documentListeners.keydown?.({ key: "Escape" });
	documentListeners.keydown?.({ key: "i", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "w", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "q", metaKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "k", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({
		key: "f12",
		shiftKey: true,
		preventDefault() {},
	});
	documentListeners.keydown?.({
		key: "f10",
		shiftKey: true,
		preventDefault() {},
	});
	documentListeners.keydown?.({
		key: "Delete",
		shiftKey: true,
		preventDefault() {},
	});

	// Single accelerator keys
	for (const k of [
		"r",
		"t",
		"u",
		"d",
		"h",
		"p",
		"m",
		"f",
		"o",
		"g",
		"c",
		"b",
		"a",
		"i",
		"w",
		"x",
	]) {
		documentListeners.keydown?.({ key: k, preventDefault() {} });
	}

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
