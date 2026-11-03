import { describe, expect, it, vi } from "vitest";
import { OverlayManager } from "../../ui/js/ui/touch/bridge/overlay.js";

describe("OverlayManager - Comprehensive Edge Cases & Branches", () => {
	it("exercises Tauri invoke error handling across all methods", async () => {
		const mockInvoke = vi.fn().mockRejectedValue(new Error("IPC failure"));
		globalThis.__TAURI_INTERNALS__ = { invoke: mockInvoke };

		const overlay = new OverlayManager({ invokeHandler: mockInvoke });

		// requestOverlayPermission error
		await expect(overlay.requestOverlayPermission()).rejects.toThrow(
			"IPC failure",
		);

		// setupForegroundService error
		await expect(overlay.setupForegroundService(true)).rejects.toThrow(
			"IPC failure",
		);

		// setOverlayTransparency fallback on error
		const alpha = await overlay.setOverlayTransparency(0.4);
		expect(alpha).toBe(0.4);
		expect(overlay.overlayTransparency).toBe(0.4);

		// setClickThrough fallback on error
		const clickThrough = await overlay.setClickThrough(true);
		expect(clickThrough).toBe(true);
		expect(overlay.isClickThrough).toBe(true);

		// trimMemory fallback on error
		const level = await overlay.trimMemory(60);
		expect(level).toBe(60);

		// reset state
		overlay.reset();
		expect(overlay.isForegroundServiceActive).toBe(false);
		expect(overlay.isOverlayEnabled).toBe(false);
		expect(overlay.overlayTransparency).toBe(1.0);
		expect(overlay.isClickThrough).toBe(false);

		delete globalThis.__TAURI_INTERNALS__;
	});
});
