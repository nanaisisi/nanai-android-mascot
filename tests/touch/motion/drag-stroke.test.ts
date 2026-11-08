import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	TOUCH_GESTURE_TYPES,
	TouchGestureRecognizer,
} from "../../../ui/js/ui/touch/index.js";
import { createMockElement } from "../helpers.js";

describe("TouchGestureRecognizer - Drag & Stroke", () => {
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

	it("falls back to recognizer last coordinates when changedTouches is empty or undefined on drag end", () => {
		const dragEndHandler = vi.fn();
		recognizer.on(TOUCH_GESTURE_TYPES.DRAG_END, dragEndHandler);

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
				touches: [{ clientX: 75, clientY: 85 }],
			},
			"touchmove",
		);

		element.dispatchEvent(
			{
				type: "touchend",
				touches: [],
				changedTouches: [],
			},
			"touchend",
		);

		expect(dragEndHandler).toHaveBeenCalledTimes(1);
		expect(dragEndHandler.mock.calls[0][0].centerX).toBe(75);
		expect(dragEndHandler.mock.calls[0][0].centerY).toBe(85);
	});
});
