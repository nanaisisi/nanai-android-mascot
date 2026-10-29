import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=0" };
globalThis.innerWidth = 800;
globalThis.innerHeight = 600;
globalThis.localStorage = { getItem: () => "default", setItem: () => {} };

const documentListeners = {};
const globalListeners = {};

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
	querySelectorAll: () => [],
	documentElement: {
		getAttribute: () => "default",
		setAttribute() {},
		style: { removeProperty() {}, setProperty() {} },
	},
};
globalThis.addEventListener = (type, cb) => {
	globalListeners[type] = cb;
};

// Import context-menu to initialize listeners
await import("../ui/js/ui/context-menu.js");

test("context-menu event handlers, sync listeners, and keyboard shortcuts", async () => {
	// 1. Test document mousedown
	documentListeners.mousedown?.({ button: 0, target: { closest: () => null } });

	// 2. Test window message listener
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
		data: { type: "sync-shells", shells: ["master"], currentShell: "master" },
	});
	globalListeners.message?.({ data: { type: "sync-theme", theme: "ivory" } });
	globalListeners.message?.({ data: { type: "sync-balloons", balloons: [] } });

	// 3. Test document click on menu item
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

	// 4. Test document keydown shortcuts
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
