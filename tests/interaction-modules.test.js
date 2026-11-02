import assert from "node:assert/strict";
import { describe, test, vi } from "vitest";

globalThis.window = globalThis;
globalThis.innerWidth = 800;
globalThis.innerHeight = 600;
if (!globalThis.document) {
	globalThis.document = /** @type {any} */ ({
		createElement(tag) {
			if (tag === "canvas") {
				return {
					width: 0,
					height: 0,
					getContext() {
						return {
							drawImage() {},
							getImageData: () => ({
								data: [255, 255, 255, 255],
							}),
						};
					},
				};
			}
			return {};
		},
	});
}
if (!globalThis.addEventListener) {
	globalThis.addEventListener = () => {};
	globalThis.removeEventListener = () => {};
}

import { setupGhostDragging as directSetupGhostDragging } from "../ui/js/surface/interaction/drag-handler.js";
import { setupHoverAndWheel as directSetupHoverAndWheel } from "../ui/js/surface/interaction/hover-wheel.js";
import { isPixelTransparent as directIsPixelTransparent } from "../ui/js/surface/interaction/transparency.js";
import {
	isPixelTransparent,
	setupGhostDragging,
	setupHoverAndWheel,
} from "../ui/js/surface/interaction.js";

describe("interaction modular sub-components", () => {
	test("isPixelTransparent correctly detects transparent and opaque pixels, handling edge cases", () => {
		// Non-IMG element
		assert.equal(isPixelTransparent(null, 10, 10), false);
		assert.equal(
			isPixelTransparent(/** @type {any} */ ({ tagName: "DIV" }), 10, 10),
			false,
		);

		// Zero-size image
		const zeroImg = /** @type {any} */ ({
			tagName: "IMG",
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				width: 0,
				height: 0,
			}),
			naturalWidth: 10,
			naturalHeight: 10,
		});
		assert.equal(isPixelTransparent(zeroImg, 5, 5), true);

		// Out of bounds image
		const normalImg = /** @type {any} */ ({
			tagName: "IMG",
			getBoundingClientRect: () => ({
				left: 10,
				top: 10,
				width: 100,
				height: 100,
			}),
			naturalWidth: 50,
			naturalHeight: 50,
		});
		// clientX < left
		assert.equal(isPixelTransparent(normalImg, 5, 20), true);
		// clientX >= right
		assert.equal(isPixelTransparent(normalImg, 120, 20), true);

		// Valid coordinates on mock canvas with non-transparent alpha
		assert.equal(isPixelTransparent(normalImg, 50, 50), false);

		// direct export test
		assert.equal(directIsPixelTransparent(normalImg, 50, 50), false);
	});

	test("setupHoverAndWheel manages wheel, hover timer, cancellation and cleanup", () => {
		vi.useFakeTimers();

		const events = [];
		const listeners = {};
		const mockEl = /** @type {any} */ ({
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
			addEventListener: (t, cb) => {
				listeners[t] = cb;
			},
			removeEventListener: (t, cb) => {
				if (listeners[t] === cb) delete listeners[t];
			},
		});

		let interacting = false;
		const cleanup = setupHoverAndWheel(
			mockEl,
			{
				onGhostWheel: (_x, _y, _rect, delta) =>
					events.push({ type: "wheel", delta }),
				onGhostHover: (_x, _y, _rect) => events.push({ type: "hover" }),
			},
			() => interacting,
			200,
		);

		// Wheel event
		listeners.wheel?.({ deltaY: 50, clientX: 10, clientY: 10 });
		assert.equal(events.length, 1);
		assert.equal(events[0].type, "wheel");
		assert.equal(events[0].delta, 50);

		// Hover event triggered after timeout
		listeners.mousemove?.({ clientX: 15, clientY: 15 });
		vi.advanceTimersByTime(100);
		assert.equal(events.length, 1);
		vi.advanceTimersByTime(110);
		assert.equal(events.length, 2);
		assert.equal(events[1].type, "hover");

		// Mouseleave clears hover timer
		listeners.mousemove?.({ clientX: 20, clientY: 20 });
		listeners.mouseleave?.();
		vi.advanceTimersByTime(250);
		assert.equal(events.length, 2); // No new hover event

		// Suppressed if interacting
		interacting = true;
		listeners.mousemove?.({ clientX: 30, clientY: 30 });
		vi.advanceTimersByTime(250);
		assert.equal(events.length, 2);

		// Direct export setup & cleanup
		cleanup();
		assert.equal(listeners.wheel, undefined);
		assert.equal(listeners.mousemove, undefined);
		assert.equal(listeners.mouseleave, undefined);

		// Null target
		const nullCleanup = directSetupHoverAndWheel(null);
		assert.doesNotThrow(() => nullCleanup());

		vi.useRealTimers();
	});

	test("setupGhostDragging handles null target and custom context", () => {
		const resNull = setupGhostDragging(null);
		assert.equal(resNull.isInteractingOrDragging(), false);
		assert.doesNotThrow(() => resNull.cleanup());

		const directNull = directSetupGhostDragging(null);
		assert.equal(directNull.isInteractingOrDragging(), false);

		// Custom context test
		let menuCalled = false;
		let followCoords = null;
		const listeners = {};
		const mockTarget = /** @type {any} */ ({
			querySelector: () => null,
			classList: {
				contains: () => false,
				add() {},
				remove() {},
			},
			style: {},
			getBoundingClientRect: () => ({
				left: 10,
				top: 10,
				width: 50,
				height: 50,
			}),
			addEventListener: (t, cb) => {
				listeners[t] = cb;
			},
			removeEventListener: (t, _cb) => {
				delete listeners[t];
			},
		});

		const { isInteractingOrDragging, cleanup } = setupGhostDragging(
			mockTarget,
			() => {},
			() => {},
			{},
			{
				toggleMenu: () => {
					menuCalled = true;
				},
				updateFollowPosition: (x, y) => {
					followCoords = { x, y };
				},
				isPixelTransparent: () => false,
			},
		);

		assert.equal(isInteractingOrDragging(), false);
		assert.equal(menuCalled, false);
		assert.equal(followCoords, null);
		assert.doesNotThrow(() => cleanup());
	});
});
