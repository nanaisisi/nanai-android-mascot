import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	TOUCH_GESTURE_TYPES,
	TouchGestureRecognizer,
} from "../../ui/js/ui/touch/index.js";
import { createMockElement } from "./helpers.js";

describe("TouchGestureRecognizer - Motion", () => {
	let element;
	let recognizer;

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

	it("recognizes drag start, move, and end events", () => {
		const dragStartHandler = vi.fn();
		const dragHandler = vi.fn();
		const dragEndHandler = vi.fn();

		recognizer.on(TOUCH_GESTURE_TYPES.DRAG_START, dragStartHandler);
		recognizer.on(TOUCH_GESTURE_TYPES.DRAG, dragHandler);
		recognizer.on(TOUCH_GESTURE_TYPES.DRAG_END, dragEndHandler);

		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 100, clientY: 100 }],
			},
			"touchstart",
		);

		// Small slop move (< 5px)
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 102, clientY: 102 }],
			},
			"touchmove",
		);
		expect(dragStartHandler).not.toHaveBeenCalled();

		// Actual drag move (> slopThreshold)
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 120, clientY: 130 }],
			},
			"touchmove",
		);

		expect(dragStartHandler).toHaveBeenCalledTimes(1);
		expect(dragHandler).toHaveBeenCalledTimes(1);
		expect(dragHandler.mock.calls[0][0].deltaX).toBe(20);
		expect(dragHandler.mock.calls[0][0].deltaY).toBe(30);

		// Touch end
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 120, clientY: 130 }],
			},
			"touchend",
		);

		expect(dragEndHandler).toHaveBeenCalledTimes(1);
	});

	it("recognizes stroke when back-and-forth accumulated distance exceeds threshold", () => {
		const strokeHandler = vi.fn();
		recognizer.on(TOUCH_GESTURE_TYPES.STROKE, strokeHandler);

		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 100, clientY: 100 }],
			},
			"touchstart",
		);

		// Move +15px
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 115, clientY: 100 }],
			},
			"touchmove",
		);

		// Move -15px
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 100, clientY: 100 }],
			},
			"touchmove",
		);

		// Move +15px (total accumulated 45px > threshold 40px)
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 115, clientY: 100 }],
			},
			"touchmove",
		);

		expect(strokeHandler).toHaveBeenCalledTimes(1);
		expect(
			strokeHandler.mock.calls[0][0].strokeDistance,
		).toBeGreaterThanOrEqual(40);
	});

	it("recognizes pinch zoom and rotation with multi-touch", () => {
		const pinchHandler = vi.fn();
		const rotateHandler = vi.fn();

		recognizer.on(TOUCH_GESTURE_TYPES.PINCH, pinchHandler);
		recognizer.on(TOUCH_GESTURE_TYPES.ROTATE, rotateHandler);

		// 2 touches: (100, 100) and (200, 100) -> initial dist = 100, angle = 0
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [
					{ clientX: 100, clientY: 100 },
					{ clientX: 200, clientY: 100 },
				],
			},
			"touchstart",
		);

		// Move: (50, 100) and (250, 100) -> dist = 200 -> scale = 2.0
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [
					{ clientX: 50, clientY: 100 },
					{ clientX: 250, clientY: 100 },
				],
			},
			"touchmove",
		);

		expect(pinchHandler).toHaveBeenCalled();
		expect(pinchHandler.mock.calls[0][0].scale).toBeCloseTo(2.0);

		// Move with rotation: (100, 50) and (100, 250) -> angle = 90
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [
					{ clientX: 100, clientY: 50 },
					{ clientX: 100, clientY: 250 },
				],
			},
			"touchmove",
		);

		expect(rotateHandler).toHaveBeenCalled();
		expect(Math.abs(rotateHandler.mock.calls[0][0].rotation)).toBeGreaterThan(
			5,
		);
	});

	it("clamps pinch scale within minScale and maxScale bounds", () => {
		const pinchHandler = vi.fn();
		recognizer.on(TOUCH_GESTURE_TYPES.PINCH, pinchHandler);

		// Initial distance = 100
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [
					{ clientX: 100, clientY: 100 },
					{ clientX: 200, clientY: 100 },
				],
			},
			"touchstart",
		);

		// Extreme expand: distance = 1000 (rawScale = 10, maxScale = 5.0)
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [
					{ clientX: 0, clientY: 100 },
					{ clientX: 1000, clientY: 100 },
				],
			},
			"touchmove",
		);

		expect(pinchHandler).toHaveBeenCalled();
		expect(pinchHandler.mock.calls[0][0].scale).toBe(5.0);
	});

	it("recognizes swipe in four directions (left, right, up, down)", () => {
		const swipeHandler = vi.fn();
		recognizer.on(TOUCH_GESTURE_TYPES.SWIPE, swipeHandler);

		// Swipe Right
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 100, clientY: 100 }],
			},
			"touchstart",
		);
		vi.advanceTimersByTime(50);
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

		expect(swipeHandler).toHaveBeenCalledTimes(1);
		expect(swipeHandler.mock.calls[0][0].direction).toBe("right");
		expect(swipeHandler.mock.calls[0][0].distance).toBe(80);
		expect(swipeHandler.mock.calls[0][0].velocity).toBeGreaterThan(0.3);

		// Swipe Left
		swipeHandler.mockClear();
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 200, clientY: 100 }],
			},
			"touchstart",
		);
		vi.advanceTimersByTime(50);
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 120, clientY: 100 }],
			},
			"touchmove",
		);
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 120, clientY: 100 }],
			},
			"touchend",
		);
		expect(swipeHandler).toHaveBeenCalledTimes(1);
		expect(swipeHandler.mock.calls[0][0].direction).toBe("left");

		// Swipe Down
		swipeHandler.mockClear();
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 100, clientY: 100 }],
			},
			"touchstart",
		);
		vi.advanceTimersByTime(50);
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 100, clientY: 180 }],
			},
			"touchmove",
		);
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 100, clientY: 180 }],
			},
			"touchend",
		);
		expect(swipeHandler).toHaveBeenCalledTimes(1);
		expect(swipeHandler.mock.calls[0][0].direction).toBe("down");

		// Swipe Up
		swipeHandler.mockClear();
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 100, clientY: 200 }],
			},
			"touchstart",
		);
		vi.advanceTimersByTime(50);
		element.dispatchEvent(
			{
				type: "touchmove",
				touches: [{ clientX: 100, clientY: 120 }],
			},
			"touchmove",
		);
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 100, clientY: 120 }],
			},
			"touchend",
		);
		expect(swipeHandler).toHaveBeenCalledTimes(1);
		expect(swipeHandler.mock.calls[0][0].direction).toBe("up");
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
