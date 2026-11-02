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
});
