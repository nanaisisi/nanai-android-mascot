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
});
