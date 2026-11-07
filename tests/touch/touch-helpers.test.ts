import { describe, expect, it, vi } from "vitest";
import {
	getTouchAngle,
	getTouchCenter,
	getTouchDistance,
	TOUCH_GESTURE_TYPES,
	TouchGestureEvent,
} from "../../ui/js/ui/touch/index.js";

describe("TouchGestureEvent & Helpers", () => {
	it("initializes TouchGestureEvent with defaults and custom properties", () => {
		const defaultEv = new TouchGestureEvent("nam:touch:custom");
		expect(defaultEv.type).toBe("nam:touch:custom");
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
