import { describe, expect, it, vi } from "vitest";
import { ANDROID_EVENTS, AndroidBridge } from "../../ui/js/ui/touch/index.js";

describe("AndroidBridge - Back Button", () => {
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

	it("tracks back handler count and handles throwing handlers without breaking stack evaluation", async () => {
		const bridge = new AndroidBridge();
		expect(bridge.getBackHandlerCount()).toBe(0);

		const throwingHandler = vi.fn(() => {
			throw new Error("handler explosion");
		});
		const fallbackHandler = vi.fn().mockReturnValue(true);

		const unregThrow = bridge.registerBackHandler(throwingHandler);
		const unregFallback = bridge.registerBackHandler(fallbackHandler);

		expect(bridge.getBackHandlerCount()).toBe(2);

		// Fallback handler runs first (LIFO) and returns true
		let handled = await bridge.handleBackButton();
		expect(handled).toBe(true);

		// Now unregister fallback, so throwingHandler is evaluated
		unregFallback();
		expect(bridge.getBackHandlerCount()).toBe(1);

		handled = await bridge.handleBackButton();
		expect(throwingHandler).toHaveBeenCalled();
		expect(handled).toBe(false);

		unregThrow();
		expect(bridge.getBackHandlerCount()).toBe(0);
	});
});
