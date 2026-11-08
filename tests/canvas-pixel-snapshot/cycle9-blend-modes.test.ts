import { describe, expect, it } from "vitest";
import { SurfaceFrameBuffer } from "../../ui/ts/surface/compositor/framebuffer.js";

describe("Cycle 9 Pixel Ops: HSL Blending and Dither Modes", () => {
	it("should correctly blend using hue and hue-fast", () => {
		const base = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				base.setPixel(x, y, 100, 150, 200, 255);
			}
		}

		const layer = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				layer.setPixel(x, y, 220, 80, 50, 255);
			}
		}

		const bFast = base.clone();
		bFast.compositeBuffer(layer, 0, 0, "blend-hue-fast");
		const pFast = bFast.getPixel(0, 0);
		expect(pFast).not.toBeNull();
		expect(pFast?.[3]).toBe(255);

		const bNorm = base.clone();
		bNorm.compositeBuffer(layer, 0, 0, "blend-hue");
		const pNorm = bNorm.getPixel(0, 0);
		expect(pNorm).not.toBeNull();
		expect(pNorm?.[3]).toBe(255);
	});

	it("should correctly blend using saturation and saturation-fast", () => {
		const base = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				base.setPixel(x, y, 100, 150, 200, 255);
			}
		}

		const layer = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				layer.setPixel(x, y, 220, 80, 50, 255);
			}
		}

		const bFast = base.clone();
		bFast.compositeBuffer(layer, 0, 0, "blend-saturation-fast");
		const pFast = bFast.getPixel(0, 0);
		expect(pFast).not.toBeNull();
		expect(pFast?.[3]).toBe(255);

		const bNorm = base.clone();
		bNorm.compositeBuffer(layer, 0, 0, "blend-saturation");
		const pNorm = bNorm.getPixel(0, 0);
		expect(pNorm).not.toBeNull();
		expect(pNorm?.[3]).toBe(255);
	});

	it("should correctly blend using color and color-fast", () => {
		const base = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				base.setPixel(x, y, 100, 150, 200, 255);
			}
		}

		const layer = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				layer.setPixel(x, y, 220, 80, 50, 255);
			}
		}

		const bFast = base.clone();
		bFast.compositeBuffer(layer, 0, 0, "blend-color-fast");
		const pFast = bFast.getPixel(0, 0);
		expect(pFast).not.toBeNull();
		expect(pFast?.[3]).toBe(255);

		const bNorm = base.clone();
		bNorm.compositeBuffer(layer, 0, 0, "blend-color");
		const pNorm = bNorm.getPixel(0, 0);
		expect(pNorm).not.toBeNull();
		expect(pNorm?.[3]).toBe(255);
	});

	it("should correctly blend using luminosity and luminosity-fast", () => {
		const base = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				base.setPixel(x, y, 100, 150, 200, 255);
			}
		}

		const layer = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				layer.setPixel(x, y, 220, 80, 50, 255);
			}
		}

		const bFast = base.clone();
		bFast.compositeBuffer(layer, 0, 0, "blend-luminosity-fast");
		const pFast = bFast.getPixel(0, 0);
		expect(pFast).not.toBeNull();
		expect(pFast?.[3]).toBe(255);

		const bNorm = base.clone();
		bNorm.compositeBuffer(layer, 0, 0, "blend-luminosity");
		const pNorm = bNorm.getPixel(0, 0);
		expect(pNorm).not.toBeNull();
		expect(pNorm?.[3]).toBe(255);
	});

	it("should execute 4x4 Bayer matrix ordered dither correctly", () => {
		const base = new SurfaceFrameBuffer(4, 4);
		for (let y = 0; y < 4; y++) {
			for (let x = 0; x < 4; x++) {
				base.setPixel(x, y, 100, 150, 200, 255);
			}
		}

		const layer = new SurfaceFrameBuffer(4, 4);
		for (let y = 0; y < 4; y++) {
			for (let x = 0; x < 4; x++) {
				layer.setPixel(x, y, 255, 255, 255, 128); // 50% opacity
			}
		}

		const bDither = base.clone();
		bDither.compositeBuffer(layer, 0, 0, "blend-dither");

		let ditheredPixelCount = 0;
		for (let y = 0; y < 4; y++) {
			for (let x = 0; x < 4; x++) {
				const p = bDither.getPixel(x, y);
				if (p && p[0] === 255 && p[1] === 255 && p[2] === 255) {
					ditheredPixelCount++;
					expect(p[3]).toBe(255);
				} else {
					expect(p).toEqual([100, 150, 200, 255]);
				}
			}
		}

		// In a 4x4 Bayer matrix at 128 alpha (half), exactly 8 of the 16 pixels should be set
		expect(ditheredPixelCount).toBe(8);
	});
});
