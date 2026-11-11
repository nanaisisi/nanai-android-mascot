import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	TOUCH_GESTURE_TYPES,
	TouchGestureRecognizer,
} from "../../../ui/ts/ui/touch/index.js";
import { createMockElement } from "../helpers.js";

describe("TouchGestureRecognizer - RAF Throttle & Screen Snap", () => {
	let element: ReturnType<typeof createMockElement>;
	let recognizer: TouchGestureRecognizer;

	beforeEach(() => {
		vi.useFakeTimers();
		element = createMockElement();
		recognizer = new TouchGestureRecognizer(element, {
			longPressDelay: 300,
			strokeThreshold: 40,
			slopThreshold: 5,
		});
	});

	afterEach(() => {
		recognizer.destroy();
		vi.useRealTimers();
	});

	it("supports throttleWithRaf option for move handling", () => {
		const originalRaf = globalThis.requestAnimationFrame;
		const originalCaf = globalThis.cancelAnimationFrame;

		let _rafCallback = null;
		globalThis.requestAnimationFrame = vi.fn((cb) => {
			_rafCallback = cb;
			return 123;
		});
		globalThis.cancelAnimationFrame = vi.fn();

		const rafRecognizer = new TouchGestureRecognizer(element, {
			throttleWithRaf: true,
			slopThreshold: 2,
		});

		const dragHandler = vi.fn();
		rafRecognizer.on(TOUCH_GESTURE_TYPES.DRAG, dragHandler);

		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 50, clientY: 50 }],
			},
			"touchstart",
		);

		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 70, clientY: 70 }],
			},
			"touchmove",
		);

		expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
		expect(dragHandler).not.toHaveBeenCalled();

		// Trigger another move while RAF is pending
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 75, clientY: 75 }],
			},
			"touchmove",
		);

		// Now destroy before RAF fires
		rafRecognizer.destroy();
		expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();

		globalThis.requestAnimationFrame = originalRaf;
		globalThis.cancelAnimationFrame = originalCaf;
	});

	it("detects screen edge snap and dockState transitions", () => {
		const snapRecognizer = new TouchGestureRecognizer(element, {
			snapThreshold: 40,
			screenWidth: 360,
		});
		const snapListener = vi.fn();
		snapRecognizer.on(TOUCH_GESTURE_TYPES.SNAP, snapListener);

		// 1. Drag and drop near left edge (x=20 <= 40)
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 80, clientY: 100 }],
			},
			"touchstart",
		);
		vi.advanceTimersByTime(100);
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 20, clientY: 100 }],
			},
			"touchmove",
		);
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 20, clientY: 100 }],
			},
			"touchend",
		);

		expect(snapListener).toHaveBeenCalledTimes(1);
		expect(snapListener.mock.calls[0][0].dockState).toBe("left");
		expect(snapRecognizer.getDockState()).toBe("left");

		// 2. Drag to center screen (x=180) -> dockState becomes "none"
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 20, clientY: 100 }],
			},
			"touchstart",
		);
		vi.advanceTimersByTime(100);
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 180, clientY: 100 }],
			},
			"touchmove",
		);
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 180, clientY: 100 }],
			},
			"touchend",
		);
		expect(snapRecognizer.getDockState()).toBe("none");

		// 3. Quick swipe right to right half of screen (endX=340 >= 360-40)
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 250, clientY: 100 }],
			},
			"touchstart",
		);
		vi.advanceTimersByTime(30);
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 340, clientY: 100 }],
			},
			"touchmove",
		);
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 340, clientY: 100 }],
			},
			"touchend",
		);
		expect(snapListener).toHaveBeenCalledTimes(2);
		expect(snapListener.mock.calls[1][0].dockState).toBe("right");
		expect(snapRecognizer.getDockState()).toBe("right");

		// 4. Manual setDockState
		snapRecognizer.setDockState("none");
		expect(snapRecognizer.getDockState()).toBe("none");
		snapRecognizer.destroy();
	});
});
