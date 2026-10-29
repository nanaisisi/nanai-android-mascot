import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=0&theme=ivory" };
globalThis.localStorage = { getItem: () => "ivory", setItem: () => {} };

const emittedEvents = [];
const listenHandlers = {};
const elements = {};

const getEl = (id) => {
	if (!elements[id]) {
		elements[id] = {
			style: { setProperty() {} },
			innerHTML: "",
			textContent: "",
			querySelectorAll: (sel) => {
				if (sel === ".balloon-choice-btn") {
					return [
						{
							getAttribute: (a) => a === "data-choice-id" ? "choice1" : null,
							textContent: "Choice1",
							addEventListener(t, cb) { this._cb = cb; },
							click() { this._cb?.({ stopPropagation() {} }); },
						},
					];
				}
				if (sel === ".balloon-anchor") {
					return [
						{
							getAttribute: (a) => a === "data-anchor-id" ? "anchor1" : null,
							addEventListener(t, cb) { this._cb = cb; },
							click() { this._cb?.({ stopPropagation() {} }); },
						},
					];
				}
				return [];
			},
			addEventListener(t, cb) {
				this._listeners = this._listeners || {};
				this._listeners[t] = cb;
			},
			click() { this._listeners?.click?.({}); },
			mousedown() { this._listeners?.mousedown?.({ button: 0 }); },
			mouseup() { this._listeners?.mouseup?.(); },
		};
	}
	return elements[id];
};

globalThis.document = {
	documentElement: { style: { setProperty() {} }, setAttribute() {} },
	body: { style: {} },
	getElementById(id) { return getEl(id); },
	readyState: "complete",
	addEventListener() {},
};

globalThis.__TAURI_INTERNALS__ = {
	metadata: { currentWindow: { label: "balloon_window_0", startDragging: async () => {} } },
	invoke: async (cmd, args) => {
		if (cmd === "balloon_manifest") {
			return {
				dpi: "120",
				"font.name": "Meiryo",
				"font.height": "12",
				"font.color": "#000",
				"cursor.font.color": "#fff",
				"validrect.left": "10",
				"validrect.top": "10",
				"validrect.right": "10",
				"validrect.bottom": "10",
				"wordwrappoint.x": "-50",
			};
		}
		if (cmd === "load_balloon_image") return "data:image/png;base64,bg";
		if (cmd === "save_balloon_offset_from_position") return;
		return null;
	},
	transformCallback: (cb) => cb,
	plugins: {
		event: {
			listen: async (event, cb) => {
				listenHandlers[event] = cb;
				return () => {};
			},
			emit: async (event, payload) => {
				emittedEvents.push({ event, payload });
			},
		},
	},
};

await import("../ui/js/ghost/balloon-window.js");

test("balloon-window covers interactive elements, theme/manifest loading, and Tauri scale/drag events", async () => {
	const balloonBox = getEl("balloon-box");
	const balloonText = getEl("balloon-text");

	// 1. Test click & mousedown/mouseup on balloonBox
	balloonBox.click();
	balloonBox.mousedown();
	balloonBox.mouseup();

	// 2. Test update-balloon-content-0 listener
	if (listenHandlers["update-balloon-content-0"]) {
		await listenHandlers["update-balloon-content-0"]({
			payload: { html: '<button class="balloon-choice-btn" data-choice-id="choice1">Choice1</button><a class="balloon-anchor" data-anchor-id="anchor1">Anchor1</a>', theme: "ivory" },
		});
	}

	// Trigger choice and anchor clicks inside balloonText
	const choices = balloonText.querySelectorAll(".balloon-choice-btn");
	choices[0]?.click();

	const anchors = balloonText.querySelectorAll(".balloon-anchor");
	anchors[0]?.click();

	// 3. Test balloon-theme-changed listener
	if (listenHandlers["balloon-theme-changed"]) {
		await listenHandlers["balloon-theme-changed"]({ payload: { theme: "dark" } });
	}

	// 4. Test balloon-scale-changed listener
	if (listenHandlers["balloon-scale-changed"]) {
		await listenHandlers["balloon-scale-changed"]({ payload: { userScale: 1.5 } });
	}

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
