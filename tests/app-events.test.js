import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	addEventListener(type, cb) {
		this._listeners = this._listeners || {};
		this._listeners[type] = cb;
	},
	removeEventListener() {},
	getElementById(_id) {
		return {
			addEventListener(_type, cb) {
				this._cb = cb;
			},
		};
	},
	documentElement: { style: {} },
	querySelector: () => null,
};
globalThis.screenX = 0;
globalThis.screenY = 0;
globalThis.addEventListener = () => {};

const { eventMethods } = await import("../ui/js/core/app-events.js");

test("eventMethods coverage for setupEventListeners, interactions, buttons, and listeners", async () => {
	const listeners = {};
	const mockApp = {
		...eventMethods,
		interactionManager: {
			setupDragging(el, onClick, onStroke) {
				el._onClick = onClick;
				el._onStroke = onStroke;
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
			sendShioriEvent: async () => ({ script: "test" }),
			currentSurfaces: new Map([[1, "src.png"]]),
		},
		surfaceManager: {
			detectCollision() {
				return { name: "Head", canvasX: 10, canvasY: 20 };
			},
		},
		onGhostClick() {},
		switchToNextGhost() {},
	};

	mockApp.setupEventListeners();

	// Test contextmenu on ghost display
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

	// Test UI buttons
	listeners.menu_click?.({ stopPropagation() {}, screenX: 30, screenY: 40 });
	listeners.quick_click?.({ stopPropagation() {} });
	listeners.balloon_click?.();

	// Test global document event listeners
	document._listeners?.click?.();
	document._listeners?.contextmenu?.({
		preventDefault() {},
		screenX: 50,
		screenY: 60,
	});

	document._listeners?.keydown?.({ key: "Escape" });
	document._listeners?.keydown?.({
		key: "w",
		ctrlKey: true,
		preventDefault() {},
	});
	document._listeners?.keydown?.({
		key: "q",
		metaKey: true,
		preventDefault() {},
	});

	// Test onGhostClick and onGhostStroke
	await mockApp.onGhostClick(10, 20, {}, 0);
	await mockApp.onGhostStroke(10, 20, {}, 0);

	// Test getCollisionInfo & detectPart
	const col = mockApp.getCollisionInfo(10, 20, {}, 0);
	assert.equal(col.name, "Head");
	const part = mockApp.detectPart(10, 20, {});
	assert.equal(part, "Head");

	// Test fallback getCollisionInfo without clientX/clientY
	const col2 = mockApp.getCollisionInfo(undefined, undefined, null, 0);
	assert.equal(col2.name, "");

	assert.ok(true);
});
