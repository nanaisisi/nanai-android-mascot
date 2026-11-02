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

import {
	applyDockingSnap,
	calculateClampedCoordinates,
	clampPosition,
	createLongPressController,
	createNativeDragSession,
	createStrokeTracker,
	DOCK_LEFT_THRESHOLD,
	DOCK_RESTORE_OFFSET,
	DOCK_RIGHT_THRESHOLD,
	DRAG_MIN_MOVE,
	DRAG_PADDING,
	setupGhostDragging as directSetupGhostDragging,
	isElementDocked,
	LONG_PRESS_DELAY,
	restoreFromDocking,
	STROKE_THRESHOLD,
} from "../ui/js/surface/interaction/drag-handler.js";
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

	test("createLongPressController handles start, timer trigger, cancellation, reset, and cleanup", () => {
		vi.useFakeTimers();
		let triggeredCount = 0;
		const controller = createLongPressController({
			delay: 300,
			onTrigger: () => {
				triggeredCount++;
			},
		});

		assert.equal(controller.isTriggered(), false);

		// Start with canTrigger = true
		controller.start(() => true);
		vi.advanceTimersByTime(200);
		assert.equal(controller.isTriggered(), false);
		assert.equal(triggeredCount, 0);

		vi.advanceTimersByTime(110);
		assert.equal(controller.isTriggered(), true);
		assert.equal(triggeredCount, 1);

		// Reset
		controller.reset();
		assert.equal(controller.isTriggered(), false);

		// Cancel before delay
		controller.start(() => true);
		vi.advanceTimersByTime(100);
		controller.cancel();
		vi.advanceTimersByTime(300);
		assert.equal(controller.isTriggered(), false);
		assert.equal(triggeredCount, 1);

		// canTrigger returning false
		controller.start(() => false);
		vi.advanceTimersByTime(310);
		assert.equal(controller.isTriggered(), false);
		assert.equal(triggeredCount, 1);

		// Cleanup
		controller.cleanup();
		vi.useRealTimers();
	});

	test("createStrokeTracker accumulates distance, triggers on threshold, and resets", () => {
		let strokeCount = 0;
		let lastCoords = null;
		const tracker = createStrokeTracker({
			threshold: 50,
			onStroke: (x, y) => {
				strokeCount++;
				lastCoords = { x, y };
			},
		});

		assert.equal(tracker.isTriggered(), false);
		assert.equal(tracker.getDistance(), 0);

		// First step below threshold
		let triggered = tracker.addDistance(30, 100, 200);
		assert.equal(triggered, false);
		assert.equal(tracker.isTriggered(), false);
		assert.equal(tracker.getDistance(), 30);
		assert.equal(strokeCount, 0);

		// Second step reaches threshold
		triggered = tracker.addDistance(25, 110, 210);
		assert.equal(triggered, true);
		assert.equal(tracker.isTriggered(), true);
		assert.equal(tracker.getDistance(), 55);
		assert.equal(strokeCount, 1);
		assert.deepEqual(lastCoords, { x: 110, y: 210 });

		// Further step while triggered returns true without re-triggering callback
		triggered = tracker.addDistance(40, 150, 250);
		assert.equal(triggered, true);
		assert.equal(strokeCount, 1);

		// Reset
		tracker.reset();
		assert.equal(tracker.isTriggered(), false);
		assert.equal(tracker.getDistance(), 0);
	});

	test("docking helpers handle element docking check, snapping, and restore", () => {
		// Null target
		assert.equal(isElementDocked(null), false);
		assert.equal(applyDockingSnap(null, 1000), "none");
		assert.equal(restoreFromDocking(null, 1000), false);

		const classes = new Set();
		const mockEl = /** @type {any} */ ({
			classList: {
				contains: (c) => classes.has(c),
				add: (c) => classes.add(c),
				remove: (...args) => {
					for (const a of args) classes.delete(a);
				},
			},
			style: {},
			center: 50,
			getBoundingClientRect() {
				return {
					left: this.center - 25,
					top: 100,
					width: 50,
					height: 50,
				};
			},
		});

		assert.equal(isElementDocked(mockEl), false);

		// Snap to left (< 1000 * 0.12 = 120)
		mockEl.center = 100;
		const snapLeft = applyDockingSnap(mockEl, 1000);
		assert.equal(snapLeft, "left");
		assert.equal(classes.has("is-docked-left"), true);
		assert.equal(isElementDocked(mockEl), true);

		// Restore from left
		const restoredLeft = restoreFromDocking(mockEl, 1000, 120);
		assert.equal(restoredLeft, true);
		assert.equal(classes.has("is-docked-left"), false);
		assert.equal(mockEl.style.left, "120px");
		assert.equal(isElementDocked(mockEl), false);

		// Snap to right (> 1000 * 0.88 = 880)
		mockEl.center = 900;
		const snapRight = applyDockingSnap(mockEl, 1000);
		assert.equal(snapRight, "right");
		assert.equal(classes.has("is-docked-right"), true);

		// Restore from right
		const restoredRight = restoreFromDocking(mockEl, 1000, 120);
		assert.equal(restoredRight, true);
		assert.equal(classes.has("is-docked-right"), false);
		assert.equal(mockEl.style.left, `${1000 - 120}px`);

		// Snap center (no dock)
		mockEl.center = 500;
		const snapNone = applyDockingSnap(mockEl, 1000);
		assert.equal(snapNone, "none");
		assert.equal(classes.has("is-docked-left"), false);
		assert.equal(classes.has("is-docked-right"), false);
		assert.equal(restoreFromDocking(mockEl, 1000), false);
	});

	test("drag-motion helpers calculate clamped coordinates and native drag sessions", () => {
		assert.equal(clampPosition(5, 10, 50), 10);
		assert.equal(clampPosition(25, 10, 50), 25);
		assert.equal(clampPosition(60, 10, 50), 50);

		const coords = calculateClampedCoordinates(
			100,
			100,
			-200,
			800,
			40,
			800,
			600,
		);
		assert.equal(coords.x, 40); // clamped min
		assert.equal(coords.y, 560); // 600 - 40 clamped max

		const nativeSession = createNativeDragSession();
		assert.equal(nativeSession.hasStarted(), false);
		assert.equal(nativeSession.canStartNativeDrag("touchstart"), false);
		assert.doesNotThrow(() => nativeSession.moveNativeWindow(10, 20));
		nativeSession.reset();
		assert.equal(nativeSession.hasStarted(), false);

		// Check exported constants
		assert.equal(LONG_PRESS_DELAY, 600);
		assert.equal(STROKE_THRESHOLD, 50);
		assert.equal(DRAG_PADDING, 40);
		assert.equal(DRAG_MIN_MOVE, 5);
		assert.equal(DOCK_LEFT_THRESHOLD, 0.12);
		assert.equal(DOCK_RIGHT_THRESHOLD, 0.88);
		assert.equal(DOCK_RESTORE_OFFSET, 120);
	});
});
