import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	getTouchAngle,
	getTouchCenter,
	getTouchDistance,
	TOUCH_GESTURE_TYPES,
	TouchGestureEvent,
	TouchGestureRecognizer,
} from "../ui/js/ui/touch/index.js";

/**
 * テスト用モック要素作成ヘルパー
 */
function createMockElement() {
	const listeners = {};
	return {
		listeners,
		addEventListener(event, fn) {
			if (!listeners[event]) listeners[event] = [];
			listeners[event].push(fn);
		},
		removeEventListener(event, fn) {
			if (!listeners[event]) return;
			listeners[event] = listeners[event].filter((f) => f !== fn);
		},
		dispatchEvent(event, type) {
			const eventType = type || event.type;
			const fns = listeners[eventType] || [];
			for (const fn of fns) {
				fn(event);
			}
		},
	};
}

describe("TouchGestureEvent & Helpers", () => {
	it("initializes TouchGestureEvent with defaults and custom properties", () => {
		const defaultEv = new TouchGestureEvent("nas:touch:custom");
		expect(defaultEv.type).toBe("nas:touch:custom");
		expect(defaultEv.scale).toBe(1.0);
		expect(defaultEv.deltaX).toBe(0);
		expect(defaultEv.deltaY).toBe(0);
		expect(defaultEv.defaultPrevented).toBe(false);

		const fakeDomEvent = { preventDefault: vi.fn() };
		const customEv = new TouchGestureEvent(TOUCH_GESTURE_TYPES.PINCH, {
			scale: 2.5,
			deltaX: 10,
			deltaY: 20,
			centerX: 100,
			centerY: 150,
			rotation: 45,
			strokeDistance: 120,
			originalEvent: fakeDomEvent,
		});

		expect(customEv.type).toBe(TOUCH_GESTURE_TYPES.PINCH);
		expect(customEv.scale).toBe(2.5);
		expect(customEv.deltaX).toBe(10);
		expect(customEv.deltaY).toBe(20);
		expect(customEv.centerX).toBe(100);
		expect(customEv.centerY).toBe(150);
		expect(customEv.rotation).toBe(45);
		expect(customEv.strokeDistance).toBe(120);

		customEv.preventDefault();
		expect(customEv.defaultPrevented).toBe(true);
		expect(fakeDomEvent.preventDefault).toHaveBeenCalled();
	});

	it("computes touch distance, center, and angle correctly", () => {
		const p1 = { clientX: 0, clientY: 0 };
		const p2 = { clientX: 30, clientY: 40 };

		expect(getTouchDistance(p1, p2)).toBe(50);
		expect(getTouchCenter(p1, p2)).toEqual({ x: 15, y: 20 });
		expect(Math.round(getTouchAngle(p1, p2))).toBe(53);

		// Robustness check for invalid/undefined inputs
		expect(getTouchDistance(null, undefined)).toBe(0);
		expect(getTouchCenter({}, { clientX: NaN, clientY: Infinity })).toEqual({
			x: 0,
			y: 0,
		});
		expect(getTouchAngle(null, null)).toBe(0);
	});
});

describe("TouchGestureRecognizer", () => {
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

	it("recognizes single tap when released without significant movement", () => {
		const tapHandler = vi.fn();
		recognizer.on(TOUCH_GESTURE_TYPES.TAP, tapHandler);

		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 100, clientY: 100 }],
			},
			"touchstart",
		);

		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 100, clientY: 100 }],
			},
			"touchend",
		);

		expect(tapHandler).toHaveBeenCalledTimes(1);
		expect(tapHandler.mock.calls[0][0].centerX).toBe(100);
		expect(tapHandler.mock.calls[0][0].centerY).toBe(100);
	});

	it("recognizes long press when held for the specified duration", () => {
		const longPressHandler = vi.fn();
		recognizer.on(TOUCH_GESTURE_TYPES.LONG_PRESS, longPressHandler);

		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 100, clientY: 100 }],
			},
			"touchstart",
		);

		vi.advanceTimersByTime(200);
		expect(longPressHandler).not.toHaveBeenCalled();

		vi.advanceTimersByTime(150);
		expect(longPressHandler).toHaveBeenCalledTimes(1);
		expect(longPressHandler.mock.calls[0][0].centerX).toBe(100);

		// Touchend after longpress should not trigger tap
		const tapHandler = vi.fn();
		recognizer.on(TOUCH_GESTURE_TYPES.TAP, tapHandler);
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 100, clientY: 100 }],
			},
			"touchend",
		);
		expect(tapHandler).not.toHaveBeenCalled();
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

	it("unregisters listener via off and return function", () => {
		const tapHandler = vi.fn();
		const unregister = recognizer.on(TOUCH_GESTURE_TYPES.TAP, tapHandler);

		unregister();

		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 10, clientY: 10 }],
			},
			"touchstart",
		);

		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 10, clientY: 10 }],
			},
			"touchend",
		);

		expect(tapHandler).not.toHaveBeenCalled();
	});

	it("handles touchcancel gracefully", () => {
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 10, clientY: 10 }],
			},
			"touchstart",
		);

		element.dispatchEvent(
			{
				type: "touchcancel",
			},
			"touchcancel",
		);

		expect(recognizer._isDragging).toBe(false);
	});

	it("recognizes double tap within specified delay and distance", () => {
		const tapHandler = vi.fn();
		const doubleTapHandler = vi.fn();

		recognizer.on(TOUCH_GESTURE_TYPES.TAP, tapHandler);
		recognizer.on(TOUCH_GESTURE_TYPES.DOUBLE_TAP, doubleTapHandler);

		// First tap at (50, 50)
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 50, clientY: 50 }],
			},
			"touchstart",
		);
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 50, clientY: 50 }],
			},
			"touchend",
		);

		expect(tapHandler).toHaveBeenCalledTimes(1);
		expect(doubleTapHandler).not.toHaveBeenCalled();

		// Second tap 100ms later at (52, 51)
		vi.advanceTimersByTime(100);
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 52, clientY: 51 }],
			},
			"touchstart",
		);
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [{ clientX: 52, clientY: 51 }],
			},
			"touchend",
		);

		expect(doubleTapHandler).toHaveBeenCalledTimes(1);
		expect(doubleTapHandler.mock.calls[0][0].tapCount).toBe(2);
		expect(doubleTapHandler.mock.calls[0][0].centerX).toBe(52);
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

	it("resets state on recognizer.reset()", () => {
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [{ clientX: 100, clientY: 100 }],
			},
			"touchstart",
		);

		recognizer.reset();
		expect(recognizer._longPressTimer).toBeNull();
		expect(recognizer._isPinching).toBe(false);
		expect(recognizer._isDragging).toBe(false);
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

	it("recognizes two-finger tap when 2 fingers touch and release without moving", () => {
		const twoFingerHandler = vi.fn();
		recognizer.on(TOUCH_GESTURE_TYPES.TWO_FINGER_TAP, twoFingerHandler);

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

		vi.advanceTimersByTime(80);

		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [
					{ clientX: 100, clientY: 100 },
					{ clientX: 200, clientY: 100 },
				],
			},
			"touchend",
		);

		expect(twoFingerHandler).toHaveBeenCalledTimes(1);
		expect(twoFingerHandler.mock.calls[0][0].centerX).toBe(150);
		expect(twoFingerHandler.mock.calls[0][0].centerY).toBe(100);
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
});
