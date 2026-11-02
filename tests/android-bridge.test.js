import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	ANDROID_EVENTS,
	ANDROID_LIFECYCLE_STATES,
	AndroidBridge,
} from "../ui/js/ui/touch/index.js";

describe("AndroidBridge", () => {
	let originalNavigator;
	let originalDocument;

	beforeEach(() => {
		originalNavigator = globalThis.navigator;
		originalDocument = globalThis.document;
	});

	afterEach(() => {
		Object.defineProperty(globalThis, "navigator", {
			value: originalNavigator,
			configurable: true,
			writable: true,
		});
		Object.defineProperty(globalThis, "document", {
			value: originalDocument,
			configurable: true,
			writable: true,
		});
	});

	it("detects Android platform accurately based on userAgent", () => {
		Object.defineProperty(globalThis, "navigator", {
			value: {
				userAgent:
					"Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36",
			},
			configurable: true,
			writable: true,
		});

		const bridge = new AndroidBridge();
		expect(bridge.isAndroid()).toBe(true);

		Object.defineProperty(globalThis, "navigator", {
			value: {
				userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
			},
			configurable: true,
			writable: true,
		});

		const desktopBridge = new AndroidBridge();
		expect(desktopBridge.isAndroid()).toBe(false);
	});

	it("handles fallback mode when Tauri is not available", async () => {
		const bridge = new AndroidBridge();

		const overlayResult = await bridge.requestOverlayPermission();
		expect(overlayResult).toContain("オーバーレイ権限");

		const fgResult = await bridge.setupForegroundService(true);
		expect(fgResult).toContain("常駐モード状態");

		const state = bridge.getState();
		expect(state.isOverlayEnabled).toBe(true);
		expect(state.isForegroundServiceActive).toBe(true);
	});

	it("calls invoke when Tauri is available", async () => {
		const mockInvoke = vi.fn().mockImplementation((cmd, args) => {
			if (cmd === "request_overlay_permission") {
				return Promise.resolve("JNI overlay permission granted");
			}
			if (cmd === "setup_foreground_service") {
				return Promise.resolve(`Foreground service toggled: ${args.enabled}`);
			}
			return Promise.reject(new Error("Unknown command"));
		});

		// Mock __TAURI_INTERNALS__ so isTauriAvailable() returns true
		globalThis.__TAURI_INTERNALS__ = { invoke: mockInvoke };

		const bridge = new AndroidBridge({ invokeHandler: mockInvoke });

		const overlayResult = await bridge.requestOverlayPermission();
		expect(overlayResult).toBe("JNI overlay permission granted");
		expect(mockInvoke).toHaveBeenCalledWith("request_overlay_permission");

		const fgResult = await bridge.setupForegroundService(true);
		expect(fgResult).toBe("Foreground service toggled: true");
		expect(mockInvoke).toHaveBeenCalledWith("setup_foreground_service", {
			enabled: true,
		});

		delete globalThis.__TAURI_INTERNALS__;
	});

	it("manages event listeners and dispatches overlay mode changes", async () => {
		const bridge = new AndroidBridge();
		const listener = vi.fn();

		const unsubscribe = bridge.on(
			ANDROID_EVENTS.OVERLAY_MODE_CHANGED,
			listener,
		);

		await bridge.requestOverlayPermission();
		expect(listener).toHaveBeenCalledTimes(1);
		expect(listener.mock.calls[0][0].enabled).toBe(true);

		// Unregister
		unsubscribe();
		await bridge.requestOverlayPermission();
		expect(listener).toHaveBeenCalledTimes(1);
	});

	it("handles document visibilitychange for lifecycle events (PAUSE / RESUME)", () => {
		const listeners = {};
		const mockDoc = {
			hidden: false,
			addEventListener: (event, handler) => {
				listeners[event] = handler;
			},
		};
		Object.defineProperty(globalThis, "document", {
			value: mockDoc,
			configurable: true,
			writable: true,
		});

		const bridge = new AndroidBridge();
		const pauseListener = vi.fn();
		const resumeListener = vi.fn();

		bridge.on(ANDROID_EVENTS.PAUSE, pauseListener);
		bridge.on(ANDROID_EVENTS.RESUME, resumeListener);

		// Simulate background transition
		mockDoc.hidden = true;
		listeners.visibilitychange();
		expect(pauseListener).toHaveBeenCalledTimes(1);
		expect(resumeListener).not.toHaveBeenCalled();

		// Simulate foreground resume
		mockDoc.hidden = false;
		listeners.visibilitychange();
		expect(resumeListener).toHaveBeenCalledTimes(1);
	});

	it("updates lifecycle state and triggers reset on gestureRecognizer", () => {
		const listeners = {};
		const mockDoc = {
			hidden: false,
			addEventListener: (event, handler) => {
				listeners[event] = handler;
			},
		};
		Object.defineProperty(globalThis, "document", {
			value: mockDoc,
			configurable: true,
			writable: true,
		});

		const mockRecognizer = { reset: vi.fn() };
		const bridge = new AndroidBridge({ gestureRecognizer: mockRecognizer });

		const stateListener = vi.fn();
		bridge.on(ANDROID_EVENTS.STATE_CHANGED, stateListener);

		expect(bridge.getState().lifecycleState).toBe(
			ANDROID_LIFECYCLE_STATES.ACTIVE,
		);

		// Go background
		mockDoc.hidden = true;
		listeners.visibilitychange();

		expect(mockRecognizer.reset).toHaveBeenCalledTimes(1);
		expect(bridge.getState().lifecycleState).toBe(
			ANDROID_LIFECYCLE_STATES.PAUSED,
		);
		expect(stateListener).toHaveBeenCalledWith(
			expect.objectContaining({ state: ANDROID_LIFECYCLE_STATES.PAUSED }),
		);

		// Resume
		mockDoc.hidden = false;
		listeners.visibilitychange();
		expect(bridge.getState().lifecycleState).toBe(
			ANDROID_LIFECYCLE_STATES.ACTIVE,
		);
	});

	it("manages overlay transparency and click-through settings", async () => {
		const bridge = new AndroidBridge();

		const alphaListener = vi.fn();
		const clickThroughListener = vi.fn();

		bridge.on(ANDROID_EVENTS.OVERLAY_TRANSPARENCY_CHANGED, alphaListener);
		bridge.on(ANDROID_EVENTS.CLICK_THROUGH_CHANGED, clickThroughListener);

		// Transparency clamped
		const alpha = await bridge.setOverlayTransparency(0.75);
		expect(alpha).toBe(0.75);
		expect(alphaListener).toHaveBeenCalledWith({ alpha: 0.75 });

		await bridge.setOverlayTransparency(1.5);
		expect(bridge.getState().overlayTransparency).toBe(1.0);

		await bridge.setOverlayTransparency(-0.2);
		expect(bridge.getState().overlayTransparency).toBe(0.0);

		// Click through
		const ct = await bridge.setClickThrough(true);
		expect(ct).toBe(true);
		expect(clickThroughListener).toHaveBeenCalledWith({ enabled: true });
		expect(bridge.getState().isClickThrough).toBe(true);
	});

	it("handles trimMemory and dispatches TRIM_MEMORY event", async () => {
		const bridge = new AndroidBridge();
		const trimListener = vi.fn();
		bridge.on(ANDROID_EVENTS.TRIM_MEMORY, trimListener);

		const level = await bridge.trimMemory(80);
		expect(level).toBe(80);
		expect(trimListener).toHaveBeenCalledWith(
			expect.objectContaining({ level: 80 }),
		);
	});

	it("manages back button handler stack in LIFO order", async () => {
		const bridge = new AndroidBridge();
		const backListener = vi.fn();
		bridge.on(ANDROID_EVENTS.BACK_BUTTON, backListener);

		const firstHandler = vi.fn().mockReturnValue(false);
		const secondHandler = vi.fn().mockReturnValue(true);

		const unregisterFirst = bridge.registerBackHandler(firstHandler);
		const unregisterSecond = bridge.registerBackHandler(secondHandler);

		const handled = await bridge.handleBackButton();
		expect(handled).toBe(true);
		expect(secondHandler).toHaveBeenCalled();
		expect(firstHandler).not.toHaveBeenCalled(); // stopped by secondHandler returning true

		// Unregister second handler
		unregisterSecond();
		const handled2 = await bridge.handleBackButton();
		expect(handled2).toBe(false);
		expect(firstHandler).toHaveBeenCalled();

		unregisterFirst();
	});

	it("handles freeze and pagehide lifecycle transitions and destroy cleanup", () => {
		const docListeners = {};
		const winListeners = {};

		const mockDoc = {
			hidden: false,
			addEventListener: (event, handler) => {
				docListeners[event] = handler;
			},
			removeEventListener: (event) => {
				delete docListeners[event];
			},
		};
		const mockWin = {
			addEventListener: (event, handler) => {
				winListeners[event] = handler;
			},
			removeEventListener: (event) => {
				delete winListeners[event];
			},
		};

		Object.defineProperty(globalThis, "document", {
			value: mockDoc,
			configurable: true,
			writable: true,
		});
		Object.defineProperty(globalThis, "window", {
			value: mockWin,
			configurable: true,
			writable: true,
		});

		const mockRecognizer = { reset: vi.fn(), destroy: vi.fn() };
		const bridge = new AndroidBridge({ gestureRecognizer: mockRecognizer });

		expect(bridge.isThrottled()).toBe(false);

		// Freeze event
		const pauseListener = vi.fn();
		bridge.on(ANDROID_EVENTS.PAUSE, pauseListener);
		docListeners.freeze();
		expect(bridge.getState().lifecycleState).toBe(
			ANDROID_LIFECYCLE_STATES.PAUSED,
		);
		expect(bridge.isThrottled()).toBe(true);
		expect(pauseListener).toHaveBeenCalled();

		// Pagehide event
		const stopListener = vi.fn();
		bridge.on(ANDROID_EVENTS.STOP, stopListener);
		winListeners.pagehide({ persisted: true });
		expect(bridge.getState().lifecycleState).toBe(
			ANDROID_LIFECYCLE_STATES.STOPPED,
		);
		expect(bridge.isThrottled()).toBe(true);
		expect(stopListener).toHaveBeenCalledWith(
			expect.objectContaining({ persisted: true }),
		);

		// Destroy
		bridge.destroy();
		expect(mockRecognizer.destroy).toHaveBeenCalled();
		expect(bridge.getState().lifecycleState).toBe(
			ANDROID_LIFECYCLE_STATES.STOPPED,
		);
	});

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
});
