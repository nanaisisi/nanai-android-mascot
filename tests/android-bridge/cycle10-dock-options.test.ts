import { describe, expect, it, vi } from "vitest";
import {
	AndroidBridge,
	DockManager,
	TouchGestureRecognizer,
} from "../../ui/ts/ui/touch/index.js";
import { createMockElement } from "../touch/helpers.js";

describe("Slot-12 Cycle 10 Dock Options & Gesture Configuration", () => {
	it("initializes DockManager with custom dockMargin and autoRestoreOnTap", () => {
		const dock = new DockManager({
			dockMargin: 16,
			autoRestoreOnTap: false,
		});

		expect(dock.getDockOptions()).toEqual({
			dockMargin: 16,
			autoRestoreOnTap: false,
		});
	});

	it("sanitizes dockMargin and dispatches DOCK_OPTIONS_CHANGED on setDockOptions", () => {
		const dispatchFn = vi.fn();
		const dock = new DockManager({ dispatchFn });

		// Update options
		const res = dock.setDockOptions({
			dockMargin: 24,
			autoRestoreOnTap: false,
		});

		expect(res).toEqual({
			dockMargin: 24,
			autoRestoreOnTap: false,
		});
		expect(dispatchFn).toHaveBeenCalledWith(
			"nam:android:dock-options-changed",
			expect.objectContaining({
				dockMargin: 24,
				autoRestoreOnTap: false,
			}),
		);

		// Invalid negative margin falls back to 0
		dock.setDockOptions({ dockMargin: -10 });
		expect(dock.getDockOptions().dockMargin).toBe(0);

		// NaN falls back to 0
		dock.setDockOptions({ dockMargin: Number.NaN });
		expect(dock.getDockOptions().dockMargin).toBe(0);
	});

	it("respects autoRestoreOnTap: false during attached element tap/click when docked", () => {
		const el = createMockElement();
		const dock = new DockManager({
			element: el as unknown as HTMLElement,
			autoRestoreOnTap: false,
		});

		dock.collapse("left");
		expect(dock.isDocked).toBe(true);

		// Simulate tap/click
		const listeners = (
			el as unknown as {
				listeners: Record<string, ((...args: unknown[]) => void)[]>;
			}
		).listeners;
		const clickHandler = listeners?.click?.[0];
		expect(typeof clickHandler).toBe("function");

		// Click should NOT restore when autoRestoreOnTap is false
		clickHandler({ stopPropagation: vi.fn(), preventDefault: vi.fn() });
		expect(dock.isDocked).toBe(true);
		expect(dock.dockState).toBe("left");

		// Enable autoRestoreOnTap and click again
		dock.setDockOptions({ autoRestoreOnTap: true });
		clickHandler({ stopPropagation: vi.fn(), preventDefault: vi.fn() });
		expect(dock.isDocked).toBe(false);
		expect(dock.dockState).toBe("none");
	});

	it("delegates getDockOptions and setDockOptions from AndroidBridge", () => {
		const bridge = new AndroidBridge({
			dockMargin: 12,
			autoRestoreOnTap: true,
		});

		expect(bridge.getDockOptions()).toEqual({
			dockMargin: 12,
			autoRestoreOnTap: true,
		});

		const updated = bridge.setDockOptions({
			dockMargin: 20,
			autoRestoreOnTap: false,
		});

		expect(updated).toEqual({
			dockMargin: 20,
			autoRestoreOnTap: false,
		});
		expect(bridge.getDockOptions()).toEqual({
			dockMargin: 20,
			autoRestoreOnTap: false,
		});

		bridge.destroy();
	});

	it("updates gesture thresholds and queries isGestureActive on TouchGestureRecognizer", () => {
		const el = createMockElement();
		const recognizer = new TouchGestureRecognizer(el, {
			longPressDelay: 500,
		});

		expect(recognizer.getGestureOptions().longPressDelay).toBe(500);

		recognizer.setGestureOptions({
			longPressDelay: 400,
			strokeThreshold: 60,
			slopThreshold: 12,
			doubleTapDelay: 250,
			swipeMinDistance: 50,
			swipeMinVelocity: 0.5,
			snapThreshold: 30,
			screenWidth: 480,
		});

		const opts = recognizer.getGestureOptions();
		expect(opts.longPressDelay).toBe(400);
		expect(opts.strokeThreshold).toBe(60);
		expect(opts.slopThreshold).toBe(12);
		expect(opts.doubleTapDelay).toBe(250);
		expect(opts.swipeMinDistance).toBe(50);
		expect(opts.swipeMinVelocity).toBe(0.5);
		expect(opts.snapThreshold).toBe(30);
		expect(opts.screenWidth).toBe(480);

		// Initially not active
		expect(recognizer.isGestureActive()).toBe(false);

		// When touch starts
		recognizer._activeTouches.set(1, { x: 10, y: 10 });
		expect(recognizer.isGestureActive()).toBe(true);

		recognizer.reset();
		expect(recognizer.isGestureActive()).toBe(false);

		recognizer.destroy();
	});
});
