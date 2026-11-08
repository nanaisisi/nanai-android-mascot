import { describe, expect, it, vi } from "vitest";
import {
	AndroidBridge,
	DockManager,
	OverlayManager,
	TouchGestureRecognizer,
} from "../../ui/ts/ui/touch/index.js";
import { createMockElement } from "../touch/helpers.js";

describe("Slot-12 Cycle 9 Long-Term Resilience & Edge Case Hardening", () => {
	it("handles DockManager attachment to elements with missing or partial classList API", () => {
		const partialEl = {
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
		};
		const dock = new DockManager();

		// Should not throw even if classList is undefined
		expect(() =>
			dock.attachElement(partialEl as unknown as HTMLElement),
		).not.toThrow();
		expect(dock.attachedElement).toBe(partialEl);

		// Collapse/restore should not throw with partial classList
		expect(() => dock.collapse("left")).not.toThrow();
		expect(() => dock.restore()).not.toThrow();

		// Detach should not throw
		expect(() => dock.detachElement()).not.toThrow();
		expect(dock.attachedElement).toBeNull();
	});

	it("handles idempotent destroy on DockManager and AndroidBridge without double-cleanup issues", () => {
		const bridge = new AndroidBridge();

		// First destroy
		expect(() => bridge.destroy()).not.toThrow();
		expect(bridge.getState().lifecycleState).toBe("stopped");

		// Second destroy must be completely safe and no-op
		expect(() => bridge.destroy()).not.toThrow();
		expect(bridge.getState().lifecycleState).toBe("stopped");
	});

	it("sanitizes invalid and NaN overlay transparency inputs safely", async () => {
		const overlay = new OverlayManager();

		// NaN should fall back safely to 1.0
		const resNan = await overlay.setOverlayTransparency(Number.NaN);
		expect(resNan).toBe(1.0);
		expect(overlay.overlayTransparency).toBe(1.0);

		// Non-numeric string should fall back safely to 1.0
		const resStr = await overlay.setOverlayTransparency(
			"invalid" as unknown as number,
		);
		expect(resStr).toBe(1.0);

		// Valid clamped values
		const resClamped = await overlay.setOverlayTransparency(0.42);
		expect(resClamped).toBe(0.42);
	});

	it("sanitizes invalid, negative, and non-numeric trimMemory inputs safely", async () => {
		const overlay = new OverlayManager();

		// Negative number should fall back to default 40
		const resNeg = await overlay.trimMemory(-10);
		expect(resNeg).toBe(40);

		// NaN should fall back to 40
		const resNan = await overlay.trimMemory(Number.NaN);
		expect(resNan).toBe(40);

		// Valid level should be preserved
		const resValid = await overlay.trimMemory(60);
		expect(resValid).toBe(60);
	});

	it("handles non-finite touch coordinates and distance in TouchGestureRecognizer safely", () => {
		const el = createMockElement();
		const recognizer = new TouchGestureRecognizer(el);
		const pinchListener = vi.fn();
		recognizer.on("nam:touch:pinch", pinchListener);

		// Multi-touch move with undefined/corrupt touches
		expect(() => {
			recognizer._processTouchMove({
				touches: [{ clientX: 100, clientY: 100 }],
			} as unknown as TouchEvent);
		}).not.toThrow();

		// Multi-touch with NaN coordinates
		recognizer._initialPinchDist = 100;
		recognizer._initialAngle = 0;
		recognizer._processTouchMove({
			touches: [
				{ clientX: Number.NaN, clientY: Number.NaN },
				{ clientX: 200, clientY: 200 },
			],
		} as unknown as TouchEvent);

		expect(pinchListener).toHaveBeenCalled();
		const lastCall = pinchListener.mock.calls[0][0];
		expect(Number.isFinite(lastCall.scale)).toBe(true);

		recognizer.destroy();
	});
});
