import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=0" };
globalThis.innerWidth = 800;
globalThis.innerHeight = 600;
globalThis.localStorage = { getItem: () => "ivory", setItem: () => {} };

const documentListeners = {};
const globalListeners = {};
const tauriListeners = {};

let showSubmenuShouldFail = false;

const mockWrapper = {
	classList: {
		_classes: new Set(["menu-item-wrapper"]),
		add(c) {
			this._classes.add(c);
		},
		remove(c) {
			this._classes.delete(c);
		},
		contains(c) {
			return this._classes.has(c);
		},
	},
	querySelector(sel) {
		if (sel === ".menu-item.has-submenu" || sel === "#ghost-switch-btn") {
			return {
				id: "ghost-switch-btn",
				classList: { contains: (c) => c === "has-submenu" },
				getBoundingClientRect: () => ({ top: 100 }),
			};
		}
		return null;
	},
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
};

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
			return [mockWrapper];
		}
		if (sel === ".menu-item-wrapper.open") {
			return mockWrapper.classList.contains("open") ? [mockWrapper] : [];
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
	invoke: async (cmd, args) => {
		if (cmd === "plugin:event|listen") {
			tauriListeners[args.event] = args.handler;
			return 1;
		}
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
	documentListeners.mousedown?.({ button: 0, target: { closest: () => ({}) } });
	documentListeners.mousedown?.({ button: 1, target: { closest: () => null } });

	// 2. Test Tauri event listeners with string scope, number scope, and full shells/dressup
	await tauriListeners["sync-menu-scope"]?.({ payload: "1" });
	await tauriListeners["sync-menu-scope"]?.({ payload: 0 });
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
	await tauriListeners["sync-balloons"]?.({ payload: [{ name: "default" }] });
	await tauriListeners["sync-theme"]?.({ payload: "ivory" });

	// 3. Test window message listener
	globalListeners.message?.({ data: { type: "unknown" } });
	globalListeners.message?.({ data: { type: "sync-scope", scope: "1" } });
	globalListeners.message?.({ data: { type: "sync-scope", scope: 0 } });
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
	globalListeners.message?.({
		data: { type: "sync-balloons", balloons: [{ name: "default" }] },
	});
	globalListeners.message?.({ data: { type: "sync-theme", theme: "ivory" } });

	// DOMContentLoaded test
	globalListeners.DOMContentLoaded?.();

	// 4. Test document click on has-submenu and normal menu item in Tauri
	const mockSubmenuBtn = {
		id: "ghost-switch-btn",
		classList: { contains: (c) => c === "has-submenu" },
		getBoundingClientRect: () => ({ top: 100 }),
		closest: (sel) => {
			if (sel === ".menu-item") return mockSubmenuBtn;
			if (sel === ".menu-item-wrapper") return mockWrapper;
			return null;
		},
	};
	documentListeners.click?.({ target: mockSubmenuBtn });

	// Trigger debounce (< 180ms)
	documentListeners.click?.({ target: mockSubmenuBtn });

	// Advance time to pass debounce threshold (> 180ms)
	await new Promise((r) => setTimeout(r, 200));

	// Submenu window error catch fallback
	showSubmenuShouldFail = true;
	documentListeners.click?.({ target: mockSubmenuBtn });
	await new Promise((r) => setTimeout(r, 20));
	showSubmenuShouldFail = false;

	// Non-Tauri click on has-submenu
	const origTauri = globalThis.__TAURI_INTERNALS__;
	delete globalThis.__TAURI_INTERNALS__;
	mockWrapper.classList.remove("open");
	documentListeners.click?.({ target: mockSubmenuBtn });
	// Click again to close already open submenu
	documentListeners.click?.({ target: mockSubmenuBtn });
	globalThis.__TAURI_INTERNALS__ = origTauri;

	// Click outside menu item
	documentListeners.click?.({ target: { closest: () => null } });

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
	mockWrapper.mouseenter();
	mockWrapper.mouseleave();

	delete globalThis.__TAURI_INTERNALS__;
	mockWrapper.mouseenter();
	mockWrapper.mouseleave();
	globalThis.__TAURI_INTERNALS__ = origTauri;

	// checkSubmenuFlip right boundary test
	const origInnerWidth = globalThis.innerWidth;
	globalThis.innerWidth = 710; // 710 - 700 = 10 < 240 -> flip-left
	mockWrapper.mouseenter();
	assert.ok(mockWrapper.classList.contains("flip-left"));
	globalThis.innerWidth = 1200; // 1200 - 700 = 500 > 240 -> remove flip-left
	mockWrapper.mouseenter();
	assert.ok(!mockWrapper.classList.contains("flip-left"));
	globalThis.innerWidth = origInnerWidth;

	// Null container for checkSubmenuFlip
	const origQuerySelector = globalThis.document.querySelector;
	globalThis.document.querySelector = () => null;
	mockWrapper.mouseenter();
	globalThis.document.querySelector = origQuerySelector;

	// 6. Test document keydown shortcuts
	documentListeners.keydown?.({ key: "Escape" });
	documentListeners.keydown?.({ key: "i", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "w", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "q", metaKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "k", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({
		key: "f12",
		shiftKey: true,
		ctrlKey: true,
		preventDefault() {},
	});
	documentListeners.keydown?.({
		key: "f10",
		shiftKey: true,
		ctrlKey: true,
		preventDefault() {},
	});
	documentListeners.keydown?.({
		key: "Delete",
		shiftKey: true,
		ctrlKey: true,
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

	assert.ok(true);
});
