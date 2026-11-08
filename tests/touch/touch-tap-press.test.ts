import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	TOUCH_GESTURE_TYPES,
	TouchGestureRecognizer,
} from "../../ui/js/ui/touch/index.js";
import { createMockElement } from "./helpers.js";

describe("TouchGestureRecognizer - Tap & Press", () => {
	let element: unknown = null;
	let recognizer: unknown = null;

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

	it("transitions smoothly when one of two fingers is lifted during multi-touch", () => {
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

		// One finger lifts, leaving 1 finger at (200, 100)
		element.dispatchEvent(
			{
				type: "touchend",
				touches: [{ clientX: 200, clientY: 100 }],
				changedTouches: [{ clientX: 100, clientY: 100 }],
			},
			"touchend",
		);

		expect(recognizer._isPinching).toBe(false);
		expect(recognizer._startX).toBe(200);
		expect(recognizer._startY).toBe(100);
		expect(recognizer._hasMoved).toBe(false);
	});

	it("handles 3 or more touches by clearing long press and marking multi-finger movement", () => {
		element.dispatchEvent(
			{
				type: "touchstart",
				touches: [
					{ clientX: 50, clientY: 50 },
					{ clientX: 100, clientY: 50 },
					{ clientX: 150, clientY: 50 },
				],
			},
			"touchstart",
		);

		expect(recognizer._longPressTimer).toBeNull();
		expect(recognizer._twoFingerMoved).toBe(true);
	});
});
