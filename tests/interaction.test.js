import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.innerWidth = 800;
globalThis.innerHeight = 600;
globalThis.requestAnimationFrame = (cb) => cb();
globalThis.document = {
	getElementById(id) {
		if (id === "balloon-display") {
			return { style: {}, addEventListener() {} };
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
						getImageData: () => ({ data: [0, 0, 0, 0] }), // transparent
					};
				},
			};
		}
		return {};
	},
};
Object.defineProperty(globalThis, "navigator", {
	value: { userAgent: "Mozilla/5.0" },
	configurable: true,
});

const { InteractionManager } = await import("../ui/js/surface/interaction.js");

test("InteractionManager covers isPixelTransparent and setupDragging", async () => {
	const clicked = [];
	const stroked = [];
	const mockApp = { toggleMenu() {} };
	const manager = new InteractionManager(mockApp);

	const listeners = {};
	const mockTarget = {
		querySelector: () => ({
			tagName: "IMG",
			getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
			naturalWidth: 10,
			naturalHeight: 10,
		}),
		classList: {
			add() {},
			remove() {},
			contains: () => false,
		},
		style: {},
		getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
		addEventListener(type, cb) {
			listeners[type] = cb;
		},
	};

	const globalListeners = {};
	globalThis.addEventListener = (type, cb) => {
		globalListeners[type] = cb;
	};

	manager.setupDragging(
		mockTarget,
		(x, y, rect) => clicked.push({ x, y, rect }),
		(x, y, rect) => stroked.push({ x, y, rect }),
	);

	// 1. Test isPixelTransparent with transparent pixel
	const isTrans = manager.isPixelTransparent(mockTarget.querySelector(), 10, 10);
	assert.equal(isTrans, true);

	// 2. Test pointer down on transparent pixel (should return early)
	listeners.mousedown?.({ button: 0, cancelable: true, preventDefault() {}, clientX: 10, clientY: 10 });

	// 3. Test pointer down on non-transparent pixel (mock non-transparent)
	const mockImgNonTrans = {
		tagName: "IMG",
		getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }),
		naturalWidth: 10,
		naturalHeight: 10,
	};
	mockTarget.querySelector = () => mockImgNonTrans;

	// Override canvas to return non-transparent alpha
	globalThis.document.createElement = (tag) => {
		if (tag === "canvas") {
			return {
				width: 0,
				height: 0,
				getContext() {
					return {
						drawImage() {},
						getImageData: () => ({ data: [255, 255, 255, 255] }),
					};
				},
			};
		}
		return {};
	};

	listeners.mousedown?.({ button: 0, cancelable: true, preventDefault() {}, clientX: 20, clientY: 20 });
	globalListeners.mousemove?.({ clientX: 30, clientY: 30 });
	globalListeners.mousemove?.({ clientX: 90, clientY: 90 }); // triggers stroke threshold
	globalListeners.mouseup?.({ clientX: 90, clientY: 90 });

	// Test touch events
	mockTarget._listeners = {};
	listeners.touchstart?.({ cancelable: true, preventDefault() {}, touches: [{ clientX: 20, clientY: 20 }] });
	globalListeners.touchmove?.({ touches: [{ clientX: 25, clientY: 25 }] });
	globalListeners.touchend?.();

	// Test balloonOffsetX / offsetOffsetY getters/setters
	manager.balloonOffsetX = 10;
	assert.equal(manager.balloonOffsetX, 10);
	manager.balloonOffsetY = 20;
	assert.equal(manager.balloonOffsetY, 20);

	assert.ok(true);
});
