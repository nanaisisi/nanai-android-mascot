import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	ANDROID_EVENTS,
	AndroidBridge,
	applyPlatformUiClasses,
	detectPlatformMode,
} from "../../ui/ts/ui/touch/index.js";

describe("Slot-12 Android UI Branching & Platform Detection", () => {
	let originalNavigator: unknown;

	beforeEach(() => {
		originalNavigator = globalThis.navigator;
		delete (globalThis as unknown as Record<string, unknown>)
			.__TAURI_INTERNALS__;
	});

	afterEach(() => {
		Object.defineProperty(globalThis, "navigator", {
			value: originalNavigator,
			configurable: true,
			writable: true,
		});
		delete (globalThis as unknown as Record<string, unknown>)
			.__TAURI_INTERNALS__;
	});

	it("detectPlatformMode correctly differentiates all 4 platform modes", () => {
		// 1. Desktop Web
		Object.defineProperty(globalThis, "navigator", {
			value: {
				userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
			},
			configurable: true,
			writable: true,
		});
		expect(detectPlatformMode()).toBe("desktop-web");

		// 2. Desktop Native (Tauri present)
		(globalThis as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
			invoke: vi.fn(),
		};
		expect(detectPlatformMode()).toBe("desktop-native");

		// 3. Android Native (Tauri present + Android userAgent)
		Object.defineProperty(globalThis, "navigator", {
			value: {
				userAgent:
					"Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36",
			},
			configurable: true,
			writable: true,
		});
		expect(detectPlatformMode()).toBe("android-native");

		// 4. Android Web (Android userAgent without Tauri)
		delete (globalThis as unknown as Record<string, unknown>)
			.__TAURI_INTERNALS__;
		expect(detectPlatformMode()).toBe("android-web");
	});

	it("applyPlatformUiClasses toggles expected CSS classes on target element", () => {
		// Mock Android Web
		Object.defineProperty(globalThis, "navigator", {
			value: {
				userAgent:
					"Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36",
			},
			configurable: true,
			writable: true,
		});

		const classSet = new Set<string>();
		const mockElement = {
			classList: {
				add: (cls: string) => classSet.add(cls),
				remove: (cls: string) => classSet.delete(cls),
				toggle: (cls: string, force?: boolean) => {
					if (force === undefined) {
						if (classSet.has(cls)) classSet.delete(cls);
						else classSet.add(cls);
					} else if (force) {
						classSet.add(cls);
					} else {
						classSet.delete(cls);
					}
					return classSet.has(cls);
				},
				contains: (cls: string) => classSet.has(cls),
			},
		};

		const mode = applyPlatformUiClasses(mockElement);
		expect(mode).toBe("android-web");
		expect(mockElement.classList.contains("is-android-device")).toBe(true);
		expect(mockElement.classList.contains("is-desktop-device")).toBe(false);
		expect(mockElement.classList.contains("is-web-android")).toBe(true);
		expect(mockElement.classList.contains("is-native-android")).toBe(false);
		expect(mockElement.classList.contains("is-web-runtime")).toBe(true);
		expect(mockElement.classList.contains("is-native-runtime")).toBe(false);

		// Switch to Desktop Native
		(globalThis as unknown as Record<string, unknown>).__TAURI_INTERNALS__ = {
			invoke: vi.fn(),
		};
		Object.defineProperty(globalThis, "navigator", {
			value: {
				userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
			},
			configurable: true,
			writable: true,
		});

		const desktopMode = applyPlatformUiClasses(mockElement);
		expect(desktopMode).toBe("desktop-native");
		expect(mockElement.classList.contains("is-android-device")).toBe(false);
		expect(mockElement.classList.contains("is-desktop-device")).toBe(true);
		expect(mockElement.classList.contains("is-web-android")).toBe(false);
		expect(mockElement.classList.contains("is-native-android")).toBe(false);
		expect(mockElement.classList.contains("is-web-runtime")).toBe(false);
		expect(mockElement.classList.contains("is-native-runtime")).toBe(true);
	});

	it("AndroidBridge dispatches PLATFORM_MODE_DETECTED and state reflects platformMode", () => {
		Object.defineProperty(globalThis, "navigator", {
			value: {
				userAgent:
					"Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36",
			},
			configurable: true,
			writable: true,
		});

		const listener = vi.fn();
		const bridge = new AndroidBridge({ syncUiClasses: false });
		bridge.on(ANDROID_EVENTS.PLATFORM_MODE_DETECTED, listener);

		const mode = bridge.applyPlatformUi();
		expect(mode).toBe("android-web");
		expect(listener).toHaveBeenCalledWith(
			expect.objectContaining({
				platformMode: "android-web",
				isAndroid: true,
				isNative: false,
			}),
		);

		const state = bridge.getState();
		expect(state.platformMode).toBe("android-web");
		expect(state.isAndroid).toBe(true);
		expect(state.isNativeAndroid).toBe(false);
	});

	it("handles gracefully when document or targetElement has no classList", () => {
		const mode = applyPlatformUiClasses(null);
		expect(typeof mode).toBe("string");

		const invalidEl = {};
		const fallbackMode = applyPlatformUiClasses(invalidEl);
		expect(typeof fallbackMode).toBe("string");
	});
});
