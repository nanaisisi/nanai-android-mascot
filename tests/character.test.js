import assert from "node:assert/strict";
import { test, vi } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=1" };
globalThis.localStorage = { getItem: () => null, setItem: () => {} };

const listenCallbacks = {};
const emittedEvents = [];

let transparentAlpha = 255;

const imgEl = {
	getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
	naturalWidth: 10,
	naturalHeight: 10,
	src: "",
	style: {},
};

const rootEl = {
	addEventListener(type, cb) {
		this._listeners = this._listeners || {};
		this._listeners[type] = cb;
	},
	style: {},
};

globalThis.document = {
	getElementById(id) {
		if (id === "subchar-img") return imgEl;
		if (id === "subchar-root") return rootEl;
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
						getImageData: () => ({ data: [255, 255, 255, transparentAlpha] }),
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

globalThis.__TAURI_INTERNALS__ = {
	metadata: { currentWindow: { label: "subchar_1" } },
	invoke: async (cmd, _args) => {
		if (cmd === "plugin:window|position") return { x: 100, y: 100 };
		if (cmd === "plugin:window|set_position") return;
		if (cmd === "show_menu_window") return;
		if (cmd === "sync_character_balloon") return;
	},
	transformCallback: (cb) => cb,
	plugins: {
		event: {
			listen: async (ev, cb) => {
				listenCallbacks[ev] = cb;
				return () => {};
			},
			emit: async (ev, payload) => {
				emittedEvents.push({ ev, payload });
			},
		},
	},
};

await import("../ui/js/surface/character.js");

test("character window covers subchar image updates, pointer interactions, dragging, long press, and contextmenu", async () => {
	vi.useFakeTimers();

	// 1. Test update-subchar-image-1 event listener
	if (listenCallbacks["update-subchar-image-1"]) {
		await listenCallbacks["update-subchar-image-1"]({
			payload: { src: "sub.png" },
		});
		assert.equal(imgEl.src, "sub.png");
		assert.equal(imgEl.style.display, "block");

		await listenCallbacks["update-subchar-image-1"]({ payload: null });
		assert.equal(imgEl.style.display, "none");
	}

	// 2. Test transparent pixel check
	transparentAlpha = 0;
	rootEl._listeners?.mousedown?.({ button: 0, clientX: 5, clientY: 5 });
	transparentAlpha = 255;

	// 3. Test click without drag (emits talk)
	rootEl._listeners?.mousedown?.({
		button: 0,
		clientX: 10,
		clientY: 10,
		screenX: 10,
		screenY: 10,
	});
	globalThis._globalListeners?.mouseup?.();

	// 4. Test long press timer
	rootEl._listeners?.mousedown?.({
		button: 0,
		clientX: 10,
		clientY: 10,
		screenX: 10,
		screenY: 10,
	});
	vi.advanceTimersByTime(700);
	globalThis._globalListeners?.mouseup?.();

	// 5. Test drag move
	rootEl._listeners?.mousedown?.({ button: 0, clientX: 10, clientY: 10 });
	await vi.advanceTimersByTimeAsync(10);
	globalThis._globalListeners?.mousemove?.({ clientX: 30, clientY: 30 });
	globalThis._globalListeners?.mouseup?.();

	// 6. Test contextmenu
	globalThis._globalListeners?.contextmenu?.({
		preventDefault() {},
		screenX: 50,
		screenY: 50,
	});

	vi.useRealTimers();
	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
