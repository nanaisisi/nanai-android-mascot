import assert from "node:assert/strict";
import { describe, test, vi } from "vitest";
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
	isElementDocked,
	LONG_PRESS_DELAY,
	restoreFromDocking,
	STROKE_THRESHOLD,
} from "../../ui/js/surface/interaction/drag-handler.js";
import { setupInteractionDomGlobals } from "./helpers.js";

setupInteractionDomGlobals();

describe("drag interaction submodules", () => {
	test("createLongPressController and createStrokeTracker default options fallback", () => {
		const controller = createLongPressController();
		assert.equal(controller.isTriggered(), false);

		const tracker = createStrokeTracker();
		assert.equal(tracker.getDistance(), 0);
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

	test("drag-motion helpers calculate clamped coordinates and native drag sessions", async () => {
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
		assert.equal(nativeSession.canStartNativeDrag("mousedown"), false);

		nativeSession.startNativeDrag(() => true);
		assert.equal(nativeSession.hasStarted(), true);
		nativeSession.moveNativeWindow(10, 20);
		nativeSession.reset();
		assert.equal(nativeSession.hasStarted(), false);

		// With Tauri and resolved window position
		globalThis.__TAURI_INTERNALS__ = {
			metadata: { currentWindow: { label: "main" } },
			invoke: async (cmd) => {
				if (cmd === "plugin:window|current_window_position") return { type: "Physical", x: 100, y: 100 };
				if (cmd === "plugin:window|set_window_position") return {};
			},
			transformCallback: (cb) => cb,
		};
		const nativeSessionTauri = createNativeDragSession();
		assert.equal(nativeSessionTauri.canStartNativeDrag("mousedown"), true);
		nativeSessionTauri.startNativeDrag(() => true);
		await new Promise((r) => setTimeout(r, 30));
		nativeSessionTauri.moveNativeWindow(15, 25);
		nativeSessionTauri.reset();
		delete globalThis.__TAURI_INTERNALS__;

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
