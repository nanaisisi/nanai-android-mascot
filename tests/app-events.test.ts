import assert from "node:assert/strict";
import { test } from "vitest";

type MockEventCallback = (event?: Record<string, unknown>) => unknown;
type MockTauriEventCallback = (event: { payload?: unknown }) => unknown;

interface MockQuickButton {
	_cb?: (event?: { stopPropagation: () => void }) => void;
	addEventListener: (
		_type: string,
		cb: (event?: { stopPropagation: () => void }) => void,
	) => void;
	click: () => void;
}

interface MockGhostDragOptions {
	onGhostMouseDown?: (
		x: number,
		y: number,
		e: unknown,
		button?: number,
		inputType?: string,
	) => void;
	onGhostMouseUp?: (
		x: number,
		y: number,
		e: unknown,
		button?: number,
		inputType?: string,
	) => void;
	onGhostWheel?: (x: number, y: number, e: unknown, delta: number) => void;
	onGhostDragStart?: (x: number, y: number, e: unknown) => void;
	onGhostDragEnd?: (x: number, y: number, e: unknown) => void;
	onGhostHover?: (x: number, y: number, e: unknown) => void;
}

interface MockGhostDisplay {
	_onClick?: (x: number, y: number, e: unknown) => void;
	_onStroke?: (x: number, y: number, e: unknown) => void;
	_options?: MockGhostDragOptions;
	addEventListener: (type: string, cb: MockEventCallback) => void;
	getBoundingClientRect: () => {
		left: number;
		top: number;
		right: number;
		bottom: number;
	};
}

globalThis.window = globalThis as unknown as Window & typeof globalThis;
const quickBtns: Record<string, MockQuickButton> = {};
const documentListeners: Record<string, MockEventCallback> = {};
const globalListeners: Record<string, MockEventCallback> = {};
const tauriListeners: Record<string, MockTauriEventCallback> = {};

globalThis.document = {
	addEventListener(type: string, cb: MockEventCallback) {
		documentListeners[type] = cb;
	},
	removeEventListener() {},
	getElementById(id: string) {
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
} as unknown as Document;

globalThis.screenX = 0;
globalThis.screenY = 0;
globalThis.addEventListener = ((type: string, cb: MockEventCallback) => {
	globalListeners[type] = cb;
}) as unknown as typeof globalThis.addEventListener;

globalThis.__TAURI_INTERNALS__ = {
	metadata: { currentWindow: { label: "main" } },
	invoke: async (cmd: string) => {
		if (cmd === "on_mouse_click") return;
	},
	transformCallback: (cb: unknown) => cb,
	plugins: {
		event: {
			listen: async (event: string, cb: MockTauriEventCallback) => {
				tauriListeners[event] = cb;
				return () => {};
			},
			emit: async (_event: string, _payload: unknown) => {},
		},
	},
};

const { eventMethods } = await import("../ui/ts/core/app-events.js");

test("eventMethods covers 100% of event listeners, buttons, external menus, and ghost click/stroke", async () => {
	const listeners: Record<string, MockEventCallback> = {};
	let shioriDoubleRes: { script: string } | null = null;
	const eventsSent: Array<{ ev: string; args: unknown }> = [];

	const ghostDisplay: MockGhostDisplay = {
		addEventListener(type: string, cb: MockEventCallback) {
			listeners[type] = cb;
		},
		getBoundingClientRect: () => ({
			left: 0,
			top: 0,
			right: 100,
			bottom: 50,
		}),
	};

	const mockApp = {
		...eventMethods,
		interactionManager: {
			setupDragging(
				el: MockGhostDisplay,
				onClick: (x: number, y: number, e: unknown) => void,
				onStroke: (x: number, y: number, e: unknown) => void,
				options: MockGhostDragOptions,
			) {
				el._onClick = onClick;
				el._onStroke = onStroke;
				el._options = options;
			},
		},
		elements: {
			ghostDisplay,
			keroDisplay: {
				addEventListener(type: string, cb: MockEventCallback) {
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
				addEventListener(type: string, cb: MockEventCallback) {
					listeners[`menu_${type}`] = cb;
				},
			},
			quickBubble: {
				addEventListener(type: string, cb: MockEventCallback) {
					listeners[`quick_${type}`] = cb;
				},
			},
			balloonDisplay: {
				addEventListener(type: string, cb: MockEventCallback) {
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
			sendShioriEvent: async (ev: string, args: unknown) => {
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

	await mockApp.setupEventListeners();

	// Test setupDragging onClick & onStroke callbacks (lines 16-17 in setup.ts)
	mockApp.elements.ghostDisplay._onClick?.(10, 20, {});
	mockApp.elements.ghostDisplay._onStroke?.(10, 20, {});

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
	await tauriListeners["menu-action"]?.({});
	await tauriListeners["menu-action"]?.({
		payload: { action: "request-sync", payload: { scope: 1 } },
	});
	await tauriListeners["menu-action"]?.({
		payload: { action: "talk", payload: null },
	});
	await tauriListeners["request-subchar-image"]?.({ payload: { scopeId: 1 } });
	await new Promise((r) => setTimeout(r, 10));

	globalListeners.message?.({ data: null });
	globalListeners.message?.({ data: { type: "other" } });
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
	assert.ok(mouseDownEv);
	assert.deepEqual(mouseDownEv.args, [10, 20, 0, 0, "Head", 0, "mouse"]);

	// Check Reference parameters of OnMouseWheel
	const wheelEv = eventsSent.find((e) => e.ev === "OnMouseWheel");
	assert.ok(wheelEv);
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
		ghostController: {
			currentSurfaces: new Map([[1, "cached.png"]]),
		},
		syncMenuGhosts() {},
		handleMenuAction() {},
		hideMenu() {},
	};
	mockApp.setupGhostInteractions();
	await mockApp.setupExternalMenuListeners();

	await tauriListeners["request-subchar-image"]?.({
		payload: { scopeId: "invalid" },
	});
	await tauriListeners["request-subchar-image"]?.({
		payload: { scopeId: 999 },
	});
	await tauriListeners["request-subchar-image"]?.({ payload: { scopeId: 1 } });
	await new Promise((r) => setTimeout(r, 10));
	assert.ok(true);
});
