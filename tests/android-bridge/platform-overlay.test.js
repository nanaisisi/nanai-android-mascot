import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ANDROID_EVENTS, AndroidBridge } from "../../ui/js/ui/touch/index.js";

describe("AndroidBridge - Platform & Overlay", () => {
	let originalNavigator;

	beforeEach(() => {
		originalNavigator = globalThis.navigator;
	});

	afterEach(() => {
		Object.defineProperty(globalThis, "navigator", {
			value: originalNavigator,
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
});
