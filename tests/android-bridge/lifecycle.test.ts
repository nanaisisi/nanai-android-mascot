import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	ANDROID_EVENTS,
	ANDROID_LIFECYCLE_STATES,
	AndroidBridge,
} from "../../ui/js/ui/touch/index.js";

describe("AndroidBridge - Lifecycle", () => {
	const _originalDocument: unknown = null;
	const _originalWindow: unknown = null;

	// biome-ignore lint/suspicious/noImplicitAnyLet: automated fix
	let originalDocument;
	// biome-ignore lint/suspicious/noImplicitAnyLet: automated fix
	let originalWindow;

	beforeEach(() => {
		originalDocument = globalThis.document;
		originalWindow = globalThis.window;
	});

	afterEach(() => {
		Object.defineProperty(globalThis, "document", {
			value: originalDocument,
			configurable: true,
			writable: true,
		});
		Object.defineProperty(globalThis, "window", {
			value: originalWindow,
			configurable: true,
			writable: true,
		});
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
});
