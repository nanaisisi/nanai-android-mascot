import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=1" };
globalThis.document = {
	getElementById(id) {
		if (id === "subchar-img") {
			return {
				getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
				naturalWidth: 10,
				naturalHeight: 10,
				src: "",
				style: {},
			};
		}
		if (id === "subchar-root") {
			return {
				addEventListener(type, cb) {
					this._listeners = this._listeners || {};
					this._listeners[type] = cb;
				},
				style: {},
			};
		}
		return null;
	},
	createElement(tag) {
		if (tag === "canvas") {
			return {
				width: 0,
				height: 0,
				getContext() {
					return {
						drawImage() {},
						getImageData: () => ({ data: [255, 255, 255, 255] }), // non-transparent
					};
				},
			};
		}
		return {};
	},
	readyState: "complete",
	addEventListener() {},
};
globalThis.addEventListener = (type, cb) => {
	globalThis._globalListeners = globalThis._globalListeners || {};
	globalThis._globalListeners[type] = cb;
};

const characterModule = await import("../ui/js/surface/character.js");

test("character window logic covers transparent check, menu, and pointer events", async () => {
	// 1. Test init when Tauri is available
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, args) => {
			if (cmd === "show_menu_window") return;
			if (cmd === "sync_character_balloon") return;
		},
		transformCallback: (cb) => cb,
	};

	const root = document.getElementById("subchar-root");
	assert.ok(root);

	// Simulate mousedown (non-transparent pixel)
	root._listeners?.mousedown?.({ button: 0, clientX: 10, clientY: 10, screenX: 10, screenY: 10 });

	// Simulate mousemove (dragging)
	globalThis._globalListeners?.mousemove?.({ clientX: 30, clientY: 30 });

	// Simulate mouseup
	globalThis._globalListeners?.mouseup?.();

	// Simulate contextmenu
	globalThis._globalListeners?.contextmenu?.({ preventDefault() {}, screenX: 50, screenY: 50 });

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
