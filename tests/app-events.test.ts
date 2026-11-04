import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
const quickBtns = {};
const documentListeners = {};
const globalListeners = {};
const tauriListeners = {};

globalThis.document = {
	addEventListener(type, cb) {
		documentListeners[type] = cb;
	},
	removeEventListener() {},
	getElementById(id) {
		if (!quickBtns[id]) {
			quickBtns[id] = {
				addEventListener(_type, cb) {
					this._cb = cb;
				},
				click() {
					this._cb?.({ stopPropagation() {} });
				},
			};
		}
		return quickBtns[id];
	},
	documentElement: { style: {} },
	querySelector: () => null,
};

globalThis.screenX = 0;
globalThis.screenY = 0;
globalThis.addEventListener = (type, cb) => {
	globalListeners[type] = cb;
};

globalThis.__TAURI_INTERNALS__ = {
	metadata: { currentWindow: { label: "main" } },
	invoke: async (cmd) => {
		if (cmd === "on_mouse_click") return;
	},
	transformCallback: (cb) => cb,
	plugins: {
		event: {
			listen: async (event, cb) => {
				tauriListeners[event] = cb;
				return () => {};
			},
			emit: async (_event, _payload) => {},
		},
	},
};

const { eventMethods } = await import("../ui/js/core/app-events.js");

test("eventMethods covers 100% of event listeners, buttons, external menus, and ghost click/stroke", async () => {
	const listeners = {};
	let shioriDoubleRes = null;
	const eventsSent = [];

	const mockApp = {
		...eventMethods,
		interactionManager: {
			setupDragging(el, onClick, onStroke, options) {
				el._onClick = onClick;
				el._onStroke = onStroke;
				el._options = options;
			},
		},
		elements: {
			ghostDisplay: {
				addEventListener(type, cb) {
					listeners[type] = cb;
				},
				getBoundingClientRect: () => ({
					left: 0,
					top: 0,
					right: 100,
					bottom: 50,
				}),
			},
			keroDisplay: {
				addEventListener(type, cb) {
					listeners[`kero_${type}`] = cb;
				},
			},
			menuBtn: {
				getBoundingClientRect: () => ({
					left: 0,
					top: 0,
					right: 50,
					bottom: 25,
				}),
				addEventListener(type, cb) {
					listeners[`menu_${type}`] = cb;
				},
			},
			quickBubble: {
				addEventListener(type, cb) {
					listeners[`quick_${type}`] = cb;
				},
			},
			balloonDisplay: {
				addEventListener(type, cb) {
					listeners[`balloon_${type}`] = cb;
				},
			},
		},
		toggleMenu() {},
		toggleQuickActionsPanel() {},
		hideQuickActionsPanel() {},
		handleMenuAction() {},
		sakuraPlayer: { skip() {}, timeCritical: false, isPlaying: false },
		modalManager: { hide() {} },
		hideMenu() {},
		closeApp() {},
		syncMenuGhosts() {},
		ghostController: {
			sendShioriEvent: async (ev, args) => {
				eventsSent.push({ ev, args });
				if (ev === "OnMouseDoubleClick") return shioriDoubleRes;
				return { script: "click_script" };
			},
			currentSurfaces: new Map([[1, "subchar.png"]]),
		},
		surfaceManager: {
			detectCollision() {
				return { name: "Head", canvasX: 10, canvasY: 20 };
			},
		},
		switchToNextGhost() {},
	};

	mockApp.setupEventListeners();

	// 1. Test contextmenu on ghost & kero display
	listeners.contextmenu?.({
		preventDefault() {},
		stopPropagation() {},
		screenX: 10,
		screenY: 20,
	});
	listeners.kero_contextmenu?.({
		preventDefault() {},
		stopPropagation() {},
		screenX: 15,
		screenY: 25,
	});

	// 2. Test UI buttons
	listeners.menu_click?.({ stopPropagation() {}, screenX: 30, screenY: 40 });
	listeners.quick_click?.({ stopPropagation() {} });
	listeners.balloon_click?.();

	// Quick action buttons
	quickBtns["qa-talk-btn"]?.click();
	quickBtns["qa-ghost-btn"]?.click();
	quickBtns["qa-balloon-btn"]?.click();
	quickBtns["qa-minimize-btn"]?.click();

	// 3. Test global document event listeners
	documentListeners.click?.();
	documentListeners.contextmenu?.({
		preventDefault() {},
		screenX: 50,
		screenY: 60,
	});

	documentListeners.keydown?.({ key: "Escape" });
	documentListeners.keydown?.({ key: "w", ctrlKey: true, preventDefault() {} });
	documentListeners.keydown?.({ key: "q", metaKey: true, preventDefault() {} });

	// 4. Test external menu listeners (Tauri + postMessage)
	await tauriListeners["menu-action"]?.({
		payload: { action: "request-sync", payload: { scope: 1 } },
	});
	await tauriListeners["menu-action"]?.({
		payload: { action: "talk", payload: null },
	});
	await tauriListeners["request-subchar-image"]?.({ payload: { scopeId: 1 } });

	globalListeners.message?.({
		data: {
			type: "menu-action",
			action: "request-sync",
			payload: { scope: 1 },
		},
	});
	globalListeners.message?.({
		data: { type: "menu-action", action: "talk", payload: null },
	});

	// 5. Test onGhostClick and onGhostStroke (with script response)
	shioriDoubleRes = { script: "double_click_script" };
	await mockApp.onGhostClick(10, 20, {}, 0);
	await mockApp.onGhostStroke(10, 20, {}, 0);

	// Test onGhostClick fallback to OnMouseClick when double click has no script
	shioriDoubleRes = null;
	await mockApp.onGhostClick(10, 20, {}, 0);

	// Test timeCritical section early return
	mockApp.sakuraPlayer.timeCritical = true;
	mockApp.sakuraPlayer.isPlaying = true;
	await mockApp.onGhostClick(10, 20, {}, 0);
	await mockApp.onGhostStroke(10, 20, {}, 0);

	// 6. Test onGhostMouseDown, onGhostMouseUp, onGhostWheel, onGhostDragStart, onGhostDragEnd, onGhostHover
	mockApp.sakuraPlayer.timeCritical = false;
	mockApp.sakuraPlayer.isPlaying = false;
	await mockApp.onGhostMouseDown(10, 20, {}, 0, "mouse", 0);
	await mockApp.onGhostMouseUp(10, 20, {}, 0, "mouse", 0);
	await mockApp.onGhostWheel(10, 20, {}, 120, 0);
	await mockApp.onGhostDragStart(10, 20, {}, 0);
	await mockApp.onGhostDragEnd(10, 20, {}, 0);
	await mockApp.onGhostHover(10, 20, {}, 0);

	// Test timeCritical early return for new mouse handlers
	mockApp.sakuraPlayer.timeCritical = true;
	mockApp.sakuraPlayer.isPlaying = true;
	await mockApp.onGhostMouseDown(10, 20, {}, 0, "mouse", 0);
	await mockApp.onGhostMouseUp(10, 20, {}, 0, "mouse", 0);
	await mockApp.onGhostWheel(10, 20, {}, 120, 0);
	await mockApp.onGhostDragStart(10, 20, {}, 0);
	await mockApp.onGhostDragEnd(10, 20, {}, 0);
	await mockApp.onGhostHover(10, 20, {}, 0);

	// Verify eventsSent contains the new events
	const eventNames = eventsSent.map((e) => e.ev);
	assert.ok(eventNames.includes("OnMouseDown"));
	assert.ok(eventNames.includes("OnMouseUp"));
	assert.ok(eventNames.includes("OnMouseWheel"));
	assert.ok(eventNames.includes("OnMouseDragStart"));
	assert.ok(eventNames.includes("OnMouseDragEnd"));
	assert.ok(eventNames.includes("OnMouseHover"));

	// Check Reference parameters of OnMouseDown
	const mouseDownEv = eventsSent.find((e) => e.ev === "OnMouseDown");
	assert.deepEqual(mouseDownEv.args, [10, 20, 0, 0, "Head", 0, "mouse"]);

	// Check Reference parameters of OnMouseWheel
	const wheelEv = eventsSent.find((e) => e.ev === "OnMouseWheel");
	assert.deepEqual(wheelEv.args, [10, 20, 120, 0, "Head"]);

	// 7. Test interactionManager setup options invocation
	const ghostOpts = mockApp.elements.ghostDisplay._options;
	assert.ok(ghostOpts);
	ghostOpts.onGhostMouseDown?.(10, 20, {}, 0, "mouse");
	ghostOpts.onGhostMouseUp?.(10, 20, {}, 0, "mouse");
	ghostOpts.onGhostWheel?.(10, 20, {}, 120);
	ghostOpts.onGhostDragStart?.(10, 20, {});
	ghostOpts.onGhostDragEnd?.(10, 20, {});
	ghostOpts.onGhostHover?.(10, 20, {});

	// 8. Test getCollisionInfo & detectPart
	const col = mockApp.getCollisionInfo(10, 20, {}, 0);
	assert.equal(col.name, "Head");
	const part = mockApp.detectPart(10, 20, {});
	assert.equal(part, "Head");

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});

test("eventMethods covers edge branches in setupGhostInteractions (null element) and request-subchar-image listener", async () => {
	const mockApp = {
		...eventMethods,
		interactionManager: { setupDragging() {} },
		elements: {},
	};
	mockApp.setupGhostInteractions();

	await tauriListeners["request-subchar-image"]?.({ payload: { scopeId: "invalid" } });
	await tauriListeners["request-subchar-image"]?.({ payload: { scopeId: 999 } });
	assert.ok(true);
});
