import assert from "node:assert/strict";
import { test } from "vitest";

const { SurfaceFrameBuffer } = await import(
	"../../ui/ts/surface/compositor/framebuffer.js"
);

test("Canvas Pixel Snapshot Cycle 10: SurfaceFrameBuffer fill and fillRect operations", () => {
	const fb = new SurfaceFrameBuffer(6, 6);

	// 1. fill 全体塗りつぶし
	fb.fill(10, 20, 30, 255);
	assert.deepEqual(fb.getPixel(0, 0), [10, 20, 30, 255]);
	assert.deepEqual(fb.getPixel(5, 5), [10, 20, 30, 255]);

	// 2. fillRect 矩形塗りつぶし
	fb.fillRect(2, 2, 2, 2, 200, 100, 50, 180);
	assert.deepEqual(fb.getPixel(0, 0), [10, 20, 30, 255]);
	assert.deepEqual(fb.getPixel(2, 2), [200, 100, 50, 180]);
	assert.deepEqual(fb.getPixel(3, 3), [200, 100, 50, 180]);
	assert.deepEqual(fb.getPixel(4, 4), [10, 20, 30, 255]);

	// 3. fillRect 境界外・0サイズ耐性
	fb.fillRect(0, 0, 0, 2, 255, 255, 255);
	fb.fillRect(0, 0, 2, 0, 255, 255, 255);
	fb.fillRect(10, 10, 2, 2, 255, 255, 255);
	fb.fillRect(-5, -5, 2, 2, 255, 255, 255);
	// (0,0) は変更されていないこと
	assert.deepEqual(fb.getPixel(0, 0), [10, 20, 30, 255]);

	// 4. fillRect 境界クリッピング
	fb.fillRect(4, 4, 10, 10, 99, 88, 77, 255);
	assert.deepEqual(fb.getPixel(4, 4), [99, 88, 77, 255]);
	assert.deepEqual(fb.getPixel(5, 5), [99, 88, 77, 255]);

	fb.destroy();
});

test("Canvas Pixel Snapshot Cycle 10: SurfaceFrameBuffer copyRect and sub-buffer operations", () => {
	const fb = new SurfaceFrameBuffer(8, 8);
	fb.fill(0, 0, 0, 255);
	fb.fillRect(2, 2, 4, 4, 120, 140, 160, 255);

	// 1. 正常な copyRect 切り出し
	const sub = fb.copyRect(2, 2, 4, 4);
	assert.ok(sub);
	assert.equal(sub.width, 4);
	assert.equal(sub.height, 4);
	assert.deepEqual(sub.getPixel(0, 0), [120, 140, 160, 255]);
	assert.deepEqual(sub.getPixel(3, 3), [120, 140, 160, 255]);

	// 2. 切り出しバッファを別バッファに合成 (compositeBuffer)
	const dst = new SurfaceFrameBuffer(6, 6);
	dst.fill(255, 255, 255, 255);
	dst.compositeBuffer(sub, 1, 1, "replace");
	assert.deepEqual(dst.getPixel(0, 0), [255, 255, 255, 255]);
	assert.deepEqual(dst.getPixel(1, 1), [120, 140, 160, 255]);
	assert.deepEqual(dst.getPixel(4, 4), [120, 140, 160, 255]);
	assert.deepEqual(dst.getPixel(5, 5), [255, 255, 255, 255]);

	// 3. 境界外・無効サイズの copyRect
	assert.equal(fb.copyRect(0, 0, 0, 5), null);
	assert.equal(fb.copyRect(0, 0, 5, 0), null);
	assert.equal(fb.copyRect(10, 10, 2, 2), null);
	assert.equal(fb.copyRect(-1, -1, 0, 0), null);

	// 4. 右下はみ出しクリッピング切り出し
	const clipped = fb.copyRect(6, 6, 10, 10);
	assert.ok(clipped);
	assert.equal(clipped.width, 2);
	assert.equal(clipped.height, 2);

	fb.destroy();
	sub.destroy();
	dst.destroy();
	clipped.destroy();
import { describe, expect, it } from "vitest";
import { SurfaceFrameBuffer } from "../../ui/ts/surface/compositor/framebuffer.js";

describe("Cycle 10 Pixel Ops: HSL Edge Cases, Zero Alpha, and Dither Extremes", () => {
	it("should handle achromatic (zero saturation) base and layer in HSL blend modes", () => {
		// Grayscale base (R=G=B=128)
		const base = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				base.setPixel(x, y, 128, 128, 128, 255);
			}
		}

		// Grayscale layer (R=G=B=200)
		const layer = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				layer.setPixel(x, y, 200, 200, 200, 255);
			}
		}

		// Hue on achromatic colors must not crash and keep RGB identical
		const bHue = base.clone();
		bHue.compositeBuffer(layer, 0, 0, "blend-hue");
		const pHue = bHue.getPixel(0, 0);
		expect(pHue).not.toBeNull();
		expect(pHue?.[3]).toBe(255);
		expect(pHue?.[0]).toBe(pHue?.[1]);
		expect(pHue?.[1]).toBe(pHue?.[2]);

		// Saturation on achromatic colors
		const bSat = base.clone();
		bSat.compositeBuffer(layer, 0, 0, "blend-saturation");
		const pSat = bSat.getPixel(0, 0);
		expect(pSat).not.toBeNull();
		expect(pSat?.[3]).toBe(255);
		expect(pSat?.[0]).toBe(pSat?.[1]);
		expect(pSat?.[1]).toBe(pSat?.[2]);

		// Color on achromatic colors
		const bCol = base.clone();
		bCol.compositeBuffer(layer, 0, 0, "blend-color");
		const pCol = bCol.getPixel(0, 0);
		expect(pCol).not.toBeNull();
		expect(pCol?.[3]).toBe(255);
		expect(pCol?.[0]).toBe(pCol?.[1]);
		expect(pCol?.[1]).toBe(pCol?.[2]);

		// Luminosity on achromatic colors
		const bLum = base.clone();
		bLum.compositeBuffer(layer, 0, 0, "blend-luminosity");
		const pLum = bLum.getPixel(0, 0);
		expect(pLum).not.toBeNull();
		expect(pLum?.[3]).toBe(255);
		expect(pLum?.[0]).toBe(pLum?.[1]);
		expect(pLum?.[1]).toBe(pLum?.[2]);
	});

	it("should preserve base buffer unchanged when layer has zero alpha in HSL modes", () => {
		const base = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				base.setPixel(x, y, 50, 100, 150, 255);
			}
		}

		const transparentLayer = new SurfaceFrameBuffer(2, 2);
		for (let y = 0; y < 2; y++) {
			for (let x = 0; x < 2; x++) {
				transparentLayer.setPixel(x, y, 255, 0, 0, 0); // 0 alpha
			}
		}

		const modes = [
			"blend-hue",
			"blend-saturation",
			"blend-color",
			"blend-luminosity",
			"blend-dither",
		];
		for (const mode of modes) {
			const b = base.clone();
			b.compositeBuffer(transparentLayer, 0, 0, mode);
			expect(b.getPixel(0, 0)).toEqual([50, 100, 150, 255]);
		}
	});

	it("should test 4x4 Bayer dither at 0%, 25%, 75%, and 100% threshold levels", () => {
		const testAlpha = (alpha: number): number => {
			const base = new SurfaceFrameBuffer(4, 4);
			for (let y = 0; y < 4; y++) {
				for (let x = 0; x < 4; x++) {
					base.setPixel(x, y, 0, 0, 0, 255);
				}
			}

			const layer = new SurfaceFrameBuffer(4, 4);
			for (let y = 0; y < 4; y++) {
				for (let x = 0; x < 4; x++) {
					layer.setPixel(x, y, 255, 255, 255, alpha);
				}
			}

			base.compositeBuffer(layer, 0, 0, "blend-dither");

			let count = 0;
			for (let y = 0; y < 4; y++) {
				for (let x = 0; x < 4; x++) {
					const p = base.getPixel(x, y);
					if (p && p[0] === 255) {
						count++;
					}
				}
			}
			return count;
		};

		// 0 alpha: 0 pixels replaced
		expect(testAlpha(0)).toBe(0);
		// 100% alpha (255): all 16 pixels replaced
		expect(testAlpha(255)).toBe(16);
		// 25% alpha (64): exactly 4 pixels replaced
		expect(testAlpha(64)).toBe(4);
		// 75% alpha (192): exactly 12 pixels replaced
		expect(testAlpha(192)).toBe(12);
	});
});
