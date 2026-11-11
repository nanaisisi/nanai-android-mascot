import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	TOUCH_GESTURE_TYPES,
	TouchGestureRecognizer,
} from "../../../ui/ts/ui/touch/index.js";
import { createMockElement } from "../helpers.js";

describe("TouchGestureRecognizer - Swipe", () => {
	let element: {
		dispatchEvent: unknown;
		listeners?: Record<string, unknown>;
		addEventListener?: (event: unknown, fn: unknown) => void;
		removeEventListener?: (event: unknown, fn: unknown) => void;
	};
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
});
