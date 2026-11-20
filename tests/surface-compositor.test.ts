import { describe, expect, it, vi } from "vitest";
import {
	drawComposedLayer,
	resolveCompositeOperation,
} from "../ui/ts/surface/surface-compositor.js";

describe("surface-compositor", () => {
	it("resolves SERIKO draw methods to Canvas2D composite operations", () => {
		expect(resolveCompositeOperation("overlay")).toBe("source-over");
		expect(resolveCompositeOperation("add")).toBe("lighter");
		expect(resolveCompositeOperation("addition")).toBe("lighter");
		expect(resolveCompositeOperation("blend-add")).toBe("lighter");
		expect(resolveCompositeOperation("blend-add-fast")).toBe("lighter");
		expect(resolveCompositeOperation("multiply")).toBe("multiply");
		expect(resolveCompositeOperation("blend-multiply-fast")).toBe("multiply");
		expect(resolveCompositeOperation("screen")).toBe("screen");
		expect(resolveCompositeOperation("blend-screen-fast")).toBe("screen");
		expect(resolveCompositeOperation("blend-overlay")).toBe("overlay");
		expect(resolveCompositeOperation("blend-overlay-fast")).toBe("overlay");
		expect(resolveCompositeOperation("blend-darken-fast")).toBe("darken");
		expect(resolveCompositeOperation("blend-lighten-fast")).toBe("lighten");
		expect(resolveCompositeOperation("blend-color-dodge-fast")).toBe(
			"color-dodge",
		);
		expect(resolveCompositeOperation("blend-color-burn-fast")).toBe(
			"color-burn",
		);
		expect(resolveCompositeOperation("blend-hard-light-fast")).toBe(
			"hard-light",
		);
		expect(resolveCompositeOperation("blend-soft-light-fast")).toBe(
			"soft-light",
		);
		expect(resolveCompositeOperation("blend-difference-fast")).toBe(
			"difference",
		);
		expect(resolveCompositeOperation("blend-exclusion-fast")).toBe("exclusion");
		expect(resolveCompositeOperation("blend-hue-fast")).toBe("hue");
		expect(resolveCompositeOperation("blend-saturation-fast")).toBe(
			"saturation",
		);
		expect(resolveCompositeOperation("blend-color-fast")).toBe("color");
		expect(resolveCompositeOperation("blend-luminosity-fast")).toBe(
			"luminosity",
		);
		expect(resolveCompositeOperation("reduce")).toBe("destination-in");
	});

	it("applies composite operation and resets to source-over in drawComposedLayer", () => {
		const ops: string[] = [];
		let currentOp = "source-over";
		const ctx = {
			get globalCompositeOperation() {
				return currentOp;
			},
			set globalCompositeOperation(val: string) {
				currentOp = val;
				ops.push(val);
			},
			clearRect: vi.fn(),
			drawImage: vi.fn(),
		} as unknown as CanvasRenderingContext2D;

		const img = { naturalWidth: 32, naturalHeight: 48 } as HTMLImageElement;

		drawComposedLayer(ctx, img, {
			file: "a.png",
			x: 10,
			y: 20,
			type: "blend-overlay-fast",
		});
		expect(ops).toEqual(["overlay", "source-over"]);
		expect(ctx.drawImage).toHaveBeenCalledWith(img, 10, 20);

		ops.length = 0;
		drawComposedLayer(ctx, img, { file: "b.png", x: 5, y: 6, type: "replace" });
		expect(ctx.clearRect).toHaveBeenCalledWith(5, 6, 32, 48);
		expect(ops).toEqual(["source-over", "source-over"]);
	});
});
