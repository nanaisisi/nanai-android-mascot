import { describe, expect, it, vi } from "vitest";
import { OverlayManager } from "../ui/ts/ui/touch/bridge/overlay.js";
import { computeUnifiedLayout } from "../ui/ts/ui/touch/bridge/unified-layout.js";

describe("computeUnifiedLayout", () => {
	it("returns empty for no characters", () => {
		expect(computeUnifiedLayout([])).toEqual({
			width: 0,
			height: 0,
			items: [],
		});
	});
	it("lays out side-by-side, bottom aligned, with scale and gap", () => {
		const r = computeUnifiedLayout(
			[
				{ id: 0, width: 100, height: 200 },
				{ id: 1, width: 100, height: 100, scale: 0.5 },
				{ id: 2, width: 50, height: 50, visible: false },
			],
			10,
		);
		expect(r.width).toBe(160);
		expect(r.height).toBe(200);
		expect(r.items).toEqual([
			{ id: 0, x: 0, y: 0, width: 100, height: 200 },
			{ id: 1, x: 110, y: 150, width: 50, height: 50 },
		]);
	});
	it("ignores invalid sizes", () => {
		expect(
			computeUnifiedLayout([{ id: 0, width: NaN, height: 10 }]).items,
		).toEqual([]);
	});
});

describe("OverlayManager unified", () => {
	it("is a no-op when disabled and resizes when enabled", async () => {
		const invokeHandler = vi.fn().mockResolvedValue(undefined);
		const m = new OverlayManager({ invokeHandler });
		const chars = [{ id: 0, width: 10, height: 20 }];
		expect(await m.applyUnifiedLayout(chars)).toBeNull();
		expect(m.setUnified(true)).toBe(true);
		const r = await m.applyUnifiedLayout(chars);
		expect(r?.width).toBe(10);
		m.reset();
		expect(m.isUnified).toBe(false);
	});
});

describe("unified setting wiring", () => {
	it("bridge listens to the request event", async () => {
		const { AndroidBridge } = await import(
			"../ui/ts/ui/touch/android-bridge.js"
		);
		const target = new EventTarget();
		vi.stubGlobal("window", target);
		const b = new AndroidBridge({ syncUiClasses: false });
		target.dispatchEvent(
			new CustomEvent("nam:android:overlay-unified-request", {
				detail: { enabled: true },
			}),
		);
		expect(b.getState().isOverlayUnified).toBe(true);
		vi.unstubAllGlobals();
	});
});
