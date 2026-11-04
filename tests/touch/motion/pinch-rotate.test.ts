import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	TOUCH_GESTURE_TYPES,
	TouchGestureRecognizer,
} from "../../../ui/js/ui/touch/index.js";
import { createMockElement } from "../helpers.js";

describe("TouchGestureRecognizer - Pinch & Rotate", () => {
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
});
