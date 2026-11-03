import { describe, expect, it, vi } from "vitest";
import {
	ANDROID_EVENTS,
	AndroidBridge,
	BackButtonManager,
	BridgeEventEmitter,
	DockManager,
	OverlayManager,
} from "../../ui/js/ui/touch/index.js";

describe("AndroidBridge - Dock & Submodules", () => {
	it("manages dockMode and coordinates with gestureRecognizer snap events", () => {
		let snapHandler = null;
		const mockRecognizer = {
			setDockState: vi.fn(),
			on: vi.fn((event, cb) => {
				if (event === "nas:touch:snap") {
					snapHandler = cb;
				}
				return () => {};
			}),
		};

		const bridge = new AndroidBridge({ gestureRecognizer: mockRecognizer });
		const dockListener = vi.fn();
		bridge.on(ANDROID_EVENTS.DOCK_CHANGED, dockListener);

		expect(bridge.getDockMode()).toBe("none");

		// setDockMode to left
		bridge.setDockMode("left");
		expect(bridge.getDockMode()).toBe("left");
		expect(bridge.getState().dockState).toBe("left");
		expect(mockRecognizer.setDockState).toHaveBeenCalledWith("left");
		expect(dockListener).toHaveBeenCalledWith(
			expect.objectContaining({ dockState: "left" }),
		);

		// Trigger snap event via recognizer listener
		expect(snapHandler).toBeDefined();
		snapHandler({ dockState: "right" });
		expect(bridge.getDockMode()).toBe("right");
		expect(mockRecognizer.setDockState).toHaveBeenCalledWith("right");
		expect(dockListener).toHaveBeenCalledWith(
			expect.objectContaining({ dockState: "right" }),
		);

		// Reset to none
		bridge.setDockMode("none");
		expect(bridge.getDockMode()).toBe("none");
	});

	it("exports modular classes (BridgeEventEmitter, DockManager, BackButtonManager, OverlayManager) directly and functions correctly", () => {
		expect(BridgeEventEmitter).toBeDefined();
		expect(DockManager).toBeDefined();
		expect(BackButtonManager).toBeDefined();
		expect(OverlayManager).toBeDefined();

		// Test BridgeEventEmitter in isolation
		const emitter = new BridgeEventEmitter();
		const handler = vi.fn();
		const unbind = emitter.on("test-event", handler);
		emitter.dispatch("test-event", { value: 123 });
		expect(handler).toHaveBeenCalledWith({ value: 123 });
		unbind();
		emitter.dispatch("test-event", { value: 456 });
		expect(handler).toHaveBeenCalledTimes(1);

		// Test BridgeEventEmitter error isolation in dispatch
		const explodingListener = () => {
			throw new Error("listener boom");
		};
		const safeListener = vi.fn();
		emitter.on("error-event", explodingListener);
		emitter.on("error-event", safeListener);
		emitter.dispatch("error-event", { pass: true });
		expect(safeListener).toHaveBeenCalledWith({ pass: true });

		// Test DockManager in isolation
		const mockDispatch = vi.fn();
		const dock = new DockManager({ dispatchFn: mockDispatch });
		expect(dock.dockState).toBe("none");
		dock.dockState = "left";
		expect(dock.dockState).toBe("left");
		expect(mockDispatch).toHaveBeenCalledWith(
			ANDROID_EVENTS.DOCK_CHANGED,
			expect.objectContaining({ dockState: "left" }),
		);
		dock.destroy();
		expect(dock.dockState).toBe("none");
	});

	it("handles unbind exceptions gracefully in DockManager when re-assigning recognizer", () => {
		const mockDispatch = vi.fn();
		const dock = new DockManager({ dispatchFn: mockDispatch });

		dock._gestureUnbind = () => {
			throw new Error("mock unbind error");
		};

		// Should not throw even when _gestureUnbind throws
		expect(() => {
			dock.setGestureRecognizer({
				on: vi.fn(() => () => {}),
			});
		}).not.toThrow();

		// Setting null should unbind without throwing
		dock._gestureUnbind = () => {
			throw new Error("mock unbind error on destroy");
		};
		expect(() => {
			dock.destroy();
		}).not.toThrow();
		expect(dock.dockState).toBe("none");
	});
});
