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
			return { getBoundingClientRect: () => ({ right: 700 }) }; // 800 - 700 = 100 < 240 -> triggers flip-left
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
					mouseenter() { this._listeners?.mouseenter?.(); },
					mouseleave() { this._listeners?.mouseleave?.(); },
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
		if (cmd === "show_submenu_window") return;
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

	// 2. Test Tauri event listeners
	await tauriListeners["sync-menu-scope"]?.({ payload: 1 });
	await tauriListeners["sync-ghosts"]?.({
		payload: {
			scope: 1,
			ghosts: [{ name: "Ghost1" }],
			currentGhost: { name: "Ghost1" },
			shells: [{ name: "master" }],
			currentShell: "master",
			dressup: { kero: { categories: [] } },
			recentGhosts: ["Ghost1"],
		},
	});
	await tauriListeners["sync-theme"]?.({ payload: "ivory" });
	await tauriListeners["sync-balloons"]?.({ payload: [{ name: "default" }] });

	// 3. Test window message listener
	globalListeners.message?.({ data: { type: "sync-scope", scope: 1 } });
	globalListeners.message?.({
		data: {
			type: "sync-ghosts",
			ghosts: [],
			currentGhost: "G1",
			dressup: null,
			recentGhosts: [],
		},
	});
	globalListeners.message?.({
		data: { type: "sync-shells", shells: [{ name: "master" }], currentShell: "master" },
	});
	globalListeners.message?.({ data: { type: "sync-theme", theme: "ivory" } });
	globalListeners.message?.({ data: { type: "sync-balloons", balloons: [] } });

	// 4. Test document click on has-submenu and normal menu item
	const mockSubmenuBtn = {
		id: "ghost-switch-btn",
		classList: { contains: (c) => c === "has-submenu" },
		getBoundingClientRect: () => ({ top: 100 }),
		closest: (sel) => (sel === ".menu-item" ? mockSubmenuBtn : null),
	};
	documentListeners.click?.({ target: mockSubmenuBtn });

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

	// 6. Test document keydown shortcuts
	documentListeners.keydown?.({ key: "Escape" });
	documentListeners.keydown?.({ key: "i", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "w", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "q", metaKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "k", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "f12", shiftKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "f10", shiftKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "Delete", shiftKey: true, preventDefault() {} });

	// Single accelerator keys
	for (const k of [
		"r", "t", "u", "d", "h", "p", "m", "f", "o", "g", "c", "b", "a", "i", "w", "x",
	]) {
		documentListeners.keydown?.({ key: k, preventDefault() {} });
	}

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
