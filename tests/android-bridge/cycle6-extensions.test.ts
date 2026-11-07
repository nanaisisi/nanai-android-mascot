import { describe, expect, it, vi } from "vitest";
import {
	AndroidBridge,
	DockManager,
	OverlayManager,
	TouchGestureEvent,
	TouchGestureRecognizer,
} from "../../ui/js/ui/touch/index.js";
import { createMockElement } from "../touch/helpers.js";

describe("Slot-12 Cycle 6 Extensions & Complete Branch Coverage", () => {
	it("exercises DockManager and AndroidBridge collapse, restore, expand, toggle methods", () => {
		const mockDispatch = vi.fn();
		const dock = new DockManager({ dispatchFn: mockDispatch });

		expect(dock.isDocked).toBe(false);

		// collapse to right by default
		dock.collapse();
		expect(dock.dockState).toBe("right");
		expect(dock.isDocked).toBe(true);

		// collapse to left
		dock.collapse("left");
		expect(dock.dockState).toBe("left");
		expect(dock.isDocked).toBe(true);

		// restore
		dock.restore();
		expect(dock.dockState).toBe("none");
		expect(dock.isDocked).toBe(false);

		// toggle from none -> collapsed (right)
		dock.toggle();
		expect(dock.dockState).toBe("right");

		// toggle from collapsed -> restored (none)
		dock.toggle();
		expect(dock.dockState).toBe("none");

		// toggle with explicit left
		dock.toggle("left");
		expect(dock.dockState).toBe("left");

		// expand (alias of restore)
		dock.expand();
		expect(dock.dockState).toBe("none");

		// Test delegation on AndroidBridge
		const bridge = new AndroidBridge();
		expect(bridge.isDocked).toBe(false);
		bridge.collapse("left");
		expect(bridge.isDocked).toBe(true);
		expect(bridge.getDockMode()).toBe("left");

		bridge.restore();
		expect(bridge.isDocked).toBe(false);
		expect(bridge.getDockMode()).toBe("none");

		bridge.toggleDock("right");
		expect(bridge.isDocked).toBe(true);
		expect(bridge.getDockMode()).toBe("right");

		bridge.toggleDock();
		expect(bridge.isDocked).toBe(false);

		bridge.collapse();
		bridge.expand();
		expect(bridge.isDocked).toBe(false);

		bridge.destroy();
	});

	it("exercises OverlayManager and AndroidBridge toggleClickThrough and toggleForegroundService", async () => {
		const mockInvoke = vi.fn().mockResolvedValue(true);
		const overlay = new OverlayManager({ invokeHandler: mockInvoke });

		expect(overlay.isClickThrough).toBe(false);
		expect(overlay.isForegroundServiceActive).toBe(false);

		await overlay.toggleClickThrough();
		expect(overlay.isClickThrough).toBe(true);

		await overlay.toggleClickThrough();
		expect(overlay.isClickThrough).toBe(false);

		await overlay.toggleForegroundService();
		expect(overlay.isForegroundServiceActive).toBe(true);

		await overlay.toggleForegroundService();
		expect(overlay.isForegroundServiceActive).toBe(false);

		// Test delegation on AndroidBridge
		const bridge = new AndroidBridge({ invokeHandler: mockInvoke });
		await bridge.toggleClickThrough();
		expect(bridge.getState().isClickThrough).toBe(true);
		await bridge.toggleClickThrough();
		expect(bridge.getState().isClickThrough).toBe(false);

		await bridge.toggleForegroundService();
		expect(bridge.getState().isForegroundServiceActive).toBe(true);
		await bridge.toggleForegroundService();
		expect(bridge.getState().isForegroundServiceActive).toBe(false);

		bridge.destroy();
	});

	it("covers TouchGestureEvent preventDefault with underlying originalEvent", () => {
		const mockOriginalEvent = {
			preventDefault: vi.fn(),
		};
		const ev = new TouchGestureEvent("nam:touch:test", {
			originalEvent: mockOriginalEvent,
		});
		expect(ev.defaultPrevented).toBe(false);
		ev.preventDefault();
		expect(ev.defaultPrevented).toBe(true);
		expect(mockOriginalEvent.preventDefault).toHaveBeenCalled();

		// without originalEvent
		const evNoOrig = new TouchGestureEvent("nam:touch:test2");
		evNoOrig.preventDefault();
		expect(evNoOrig.defaultPrevented).toBe(true);
	});

	it("covers TouchGestureRecognizer RAF throttling, rotate, and multi-touch branches", () => {
		let rafCallback = null;
		const originalRaf = globalThis.requestAnimationFrame;
		const originalCancelRaf = globalThis.cancelAnimationFrame;
		globalThis.requestAnimationFrame = vi.fn((cb) => {
			rafCallback = cb;
			return 12345;
		});
		globalThis.cancelAnimationFrame = vi.fn();

		const el = createMockElement();
		const recognizer = new TouchGestureRecognizer(el, {
			throttleWithRaf: true,
			minScale: 0.5,
			maxScale: 2.0,
		});

		const rotateListener = vi.fn();
		const pinchListener = vi.fn();
		recognizer.on("nam:touch:rotate", rotateListener);
		recognizer.on("nam:touch:pinch", pinchListener);

		// Touch start with 2 fingers
		const touch1 = { clientX: 100, clientY: 100 };
		const touch2 = { clientX: 200, clientY: 100 };
		recognizer._handleTouchStart({
			touches: [touch1, touch2],
		});

		// Touch move with rotation > 5 degrees
		const touch1Moved = { clientX: 100, clientY: 100 };
		const touch2Rotated = { clientX: 200, clientY: 150 }; // rotated
		recognizer._handleTouchMove({
			touches: [touch1Moved, touch2Rotated],
		});

		expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
		expect(rafCallback).toBeTypeOf("function");

		// When RAF is pending, destroy() cancels it via cancelAnimationFrame
		recognizer.destroy();
		expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(12345);

		globalThis.requestAnimationFrame = originalRaf;
		globalThis.cancelAnimationFrame = originalCancelRaf;
	});

	it("handles handler exception in TouchGestureRecognizer emit gracefully", () => {
		const el = createMockElement();
		const recognizer = new TouchGestureRecognizer(el);
		const errListener = () => {
			throw new Error("handler explosion");
		};
		const safeListener = vi.fn();

		recognizer.on("nam:touch:tap", errListener);
		recognizer.on("nam:touch:tap", safeListener);

		expect(() =>
			recognizer.emit("nam:touch:tap", { tapCount: 1 }),
		).not.toThrow();
		expect(safeListener).toHaveBeenCalled();
		recognizer.destroy();
	});
});
