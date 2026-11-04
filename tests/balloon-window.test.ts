import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.location = { search: "?scope=0&theme=ivory" };
globalThis.localStorage = { getItem: () => "ivory", setItem: () => {} };
globalThis.Image = class {
	constructor() {
		this.naturalWidth = 100;
		this.naturalHeight = 100;
		setTimeout(() => {
			this.onload?.();
		}, 0);
	}
};

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
							getAttribute: (a) => (a === "data-choice-id" ? "choice1" : null),
							textContent: "Choice1",
							addEventListener(_t, cb) {
								this._cb = cb;
							},
							click() {
								this._cb?.({ stopPropagation() {} });
							},
						},
					];
				}
				if (sel === ".balloon-anchor") {
					return [
						{
							getAttribute: (a) => (a === "data-anchor-id" ? "anchor1" : null),
							addEventListener(_t, cb) {
								this._cb = cb;
							},
							click() {
								this._cb?.({ stopPropagation() {} });
							},
						},
					];
				}
				return [];
			},
			addEventListener(t, cb) {
				this._listeners = this._listeners || {};
				this._listeners[t] = cb;
			},
			click() {
				this._listeners?.click?.({});
			},
			mousedown() {
				this._listeners?.mousedown?.({ button: 0 });
			},
			mouseup() {
				this._listeners?.mouseup?.();
			},
		};
	}
	return elements[id];
};

const docListeners = {};
globalThis.document = {
	documentElement: { style: { setProperty() {} }, setAttribute() {} },
	body: { style: { setProperty() {} } },
	getElementById(id) {
		return getEl(id);
	},
	querySelector(_selector) {
		return null;
	},
	readyState: "loading",
	addEventListener(type, cb) {
		docListeners[type] = cb;
	},
	createElement(tag) {
		if (tag === "canvas") {
			return {
				width: 0,
				height: 0,
				toDataURL: () => "data:image/png;base64,mock",
				getContext() {
					return {
						drawImage() {},
						clearRect() {},
						putImageData() {},
						getImageData: () => ({
							data: new Uint8Array([0, 255, 0, 255, 255, 255, 255, 255]),
						}),
					};
				},
			};
		}
		return {};
	},
};

globalThis.__TAURI_INTERNALS__ = {
	metadata: {
		currentWindow: { label: "balloon_window_0", startDragging: async () => {} },
	},
	invoke: async (cmd, _args) => {
		if (cmd === "balloon_manifest") {
			return {
				dpi: "120",
				"font.name": "Meiryo",
				"font.height": "12",
				"font.color.r": "100",
				"font.color.g": "150",
				"font.color.b": "200",
				"cursor.font.color.r": "50",
				"cursor.font.color.g": "50",
				"cursor.font.color.b": "50",
				"validrect.left": "10",
				"validrect.top": "10",
				"validrect.right": "10",
				"validrect.bottom": "10",
				"wordwrappoint.x": "-50",
				"balloon.dontmove": "1",
				"arrow.filename": "arrow",
				mousecursor: "cursor.png",
			};
		}
		if (cmd === "load_balloon_image") return "data:image/png;base64,bg";
		if (cmd === "save_balloon_offset_from_position") return;
		if (cmd === "plugin:event|emit" || cmd.includes("emit")) {
			emittedEvents.push(_args);
			return;
		}
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

const {
	updateBalloonWindowScale,
	setupInteractiveElements,
	setupWindowGestures,
} = await import("../ui/js/ghost/balloon-window.js");
const { updateBalloonWindowScale: updateScaleDirect } = await import(
	"../ui/js/ghost/balloon-window/scale.js"
);
const { setupInteractiveElements: setupInteractiveDirect } = await import(
	"../ui/js/ghost/balloon-window/interactive.js"
);
const { loadBalloonSkinImages, applyBalloonDescript } = await import(
	"../ui/js/ghost/balloon-window/theme.js"
);
const { setupWindowGestures: setupGesturesDirect } = await import(
	"../ui/js/ghost/balloon-window/gesture.js"
);

test("balloon-window covers interactive elements, theme/manifest loading, and Tauri scale/drag events", async () => {
	// Trigger DOMContentLoaded listener
	docListeners.DOMContentLoaded?.();

	const balloonBox = getEl("balloon-box");
	const balloonText = getEl("balloon-text");

	// 1. Test click & mousedown/mouseup on balloonBox
	balloonBox.click();
	balloonBox.mousedown();
	balloonBox.mouseup();

	// 2. Test update-balloon-content-0 listener
	if (listenHandlers["update-balloon-content-0"]) {
		await listenHandlers["update-balloon-content-0"]({
			payload: {
				html: '<button class="balloon-choice-btn" data-choice-id="choice1">Choice1</button><a class="balloon-anchor" data-anchor-id="anchor1">Anchor1</a>',
				theme: "ivory",
			},
		});
	}

	// Trigger choice and anchor clicks inside balloonText
	const choices = balloonText.querySelectorAll(".balloon-choice-btn");
	choices[0]?.click();

	const anchors = balloonText.querySelectorAll(".balloon-anchor");
	anchors[0]?.click();

	// 3. Test balloon-theme-changed listener
	if (listenHandlers["balloon-theme-changed"]) {
		await listenHandlers["balloon-theme-changed"]({
			payload: { theme: "dark" },
		});
	}

	// 4. Test balloon-scale-changed listener
	if (listenHandlers["balloon-scale-changed"]) {
		await listenHandlers["balloon-scale-changed"]({
			payload: { userScale: 1.5 },
		});
	}

	// 5. Test touch events (Slot-10 Cycle 3)
	// Single touch drag
	balloonBox._listeners?.touchstart?.({
		touches: [{ clientX: 50, clientY: 50 }],
	});
	// Double tap within 300ms
	balloonBox._listeners?.touchstart?.({
		touches: [{ clientX: 50, clientY: 50 }],
	});
	// Pinch touchmove
	balloonBox._listeners?.touchstart?.({
		touches: [
			{ clientX: 50, clientY: 50 },
			{ clientX: 150, clientY: 50 },
		],
	});
	balloonBox._listeners?.touchmove?.({
		touches: [
			{ clientX: 20, clientY: 50 },
			{ clientX: 180, clientY: 50 },
		],
	});
	// Touchend
	balloonBox._listeners?.touchend?.({
		touches: [],
	});

	// 6. Test submodules directly
	// scale.js
	const mockBox = { style: { transform: "", transformOrigin: "" } };
	const scaleResult = updateBalloonWindowScale(mockBox, 1.25, 0.8);
	assert.strictEqual(scaleResult, 1);
	const scaleResult2 = updateScaleDirect(mockBox, 1.5, 1.0);
	assert.strictEqual(scaleResult2, 1.5);
	assert.strictEqual(mockBox.style.transform, "scale(1.5)");
	updateScaleDirect(null, 1.0, 1.0);

	// interactive.js
	setupInteractiveElements(null, 0);
	const choiceBtn = {
		getAttribute: () => "choice_direct",
		textContent: "Direct Choice",
		addEventListener(_t, cb) {
			this._cb = cb;
		},
	};
	const anchorLink = {
		getAttribute: () => "anchor_direct",
		addEventListener(_t, cb) {
			this._cb = cb;
		},
	};
	const mockText = {
		querySelectorAll: (selector) => {
			if (selector === ".balloon-choice-btn") {
				return [choiceBtn];
			}
			if (selector === ".balloon-anchor") {
				return [anchorLink];
			}
			return [];
		},
	};
	setupInteractiveDirect(mockText, 1);
	choiceBtn._cb?.({ stopPropagation() {} });
	anchorLink._cb?.({ stopPropagation() {} });

	// theme.js
	const loadedBg = await loadBalloonSkinImages("ivory", 0);
	assert.ok(loadedBg);
	const loadedKero = await loadBalloonSkinImages("ivory", 1);
	assert.ok(loadedKero);
	const loadedChar = await loadBalloonSkinImages("ivory", 2);
	assert.ok(loadedChar);

	let callbackDpi = 0;
	let callbackDontMove = null;
	const themeRes = await applyBalloonDescript({
		theme: "ivory",
		scopeId: 0,
		currentUserScale: 1.0,
		onDpiScaleChange: (dpi) => {
			callbackDpi = dpi;
		},
		onDontMoveChange: (dontMove) => {
			callbackDontMove = dontMove;
		},
	});
	assert.ok(themeRes);
	assert.strictEqual(callbackDpi, 0.8);
	assert.strictEqual(callbackDontMove, true);

	// gesture.js
	let userScaleState = 1.0;
	const mockGestureBox = {
		style: { transform: "", transformOrigin: "" },
		listeners: {},
		addEventListener(ev, cb) {
			this.listeners[ev] = cb;
		},
	};
	setupGesturesDirect(mockGestureBox, {
		scopeId: 0,
		getIsBalloonDontMove: () => false,
		getUserScale: () => userScaleState,
		getDpiScale: () => 1.0,
		onUserScaleChange: (s) => {
			userScaleState = s;
		},
	});
	// Click & Mouse events
	mockGestureBox.listeners.click();
	mockGestureBox.listeners.mousedown({ button: 0 });
	mockGestureBox.listeners.mouseup();
	// Touch pinch & tap
	mockGestureBox.listeners.touchstart({
		touches: [{ clientX: 10, clientY: 10 }],
	});
	mockGestureBox.listeners.touchstart({
		touches: [{ clientX: 10, clientY: 10 }],
	}); // double tap triggers 1.25 scale
	assert.strictEqual(userScaleState, 1.25);
	const requestScaleEvent = emittedEvents.find(
		(e) =>
			e.event === "request-balloon-scale-change" &&
			e.payload?.userScale === 1.25,
	);
	assert.ok(requestScaleEvent);

	mockGestureBox.listeners.touchstart({
		touches: [
			{ clientX: 10, clientY: 10 },
			{ clientX: 110, clientY: 10 },
		],
	});
	mockGestureBox.listeners.touchmove({
		touches: [
			{ clientX: 10, clientY: 10 },
			{ clientX: 160, clientY: 10 },
		],
	});
	mockGestureBox.listeners.touchend({ touches: [] });
	const pinchRequestEvent = emittedEvents.find(
		(e) =>
			e.event === "request-balloon-scale-change" && e.payload?.userScale > 1.25,
	);
	assert.ok(pinchRequestEvent);
	setupWindowGestures(null, {});

	// 7. Test Non-Tauri environment early return
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	docListeners.DOMContentLoaded?.();
	const nonTauriThemeRes = await applyBalloonDescript({
		theme: "ivory",
		scopeId: 0,
		currentUserScale: 1.0,
	});
	assert.strictEqual(nonTauriThemeRes, null);

	assert.ok(true);
});
