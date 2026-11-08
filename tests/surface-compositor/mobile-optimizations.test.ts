/**
 * @file mobile-optimizations.test.ts
 * @brief Cycle 3 モバイル最適化テスト (data32, clearRect, compositeBuffer, destroy)
 */

import assert from "node:assert/strict";
import { test } from "vitest";
import { setupSurfaceCompositorMockEnv } from "./helpers.js";

setupSurfaceCompositorMockEnv();

const { SurfaceFrameBuffer } = await import(
	"../../ui/js/surface/surface-compositor.js"
);

test("surface-compositor covers Cycle 3 mobile optimizations: data32, clearRect, compositeBuffer, destroy", () => {
	const fb = new SurfaceFrameBuffer(4, 4);
	assert.equal(fb.data32.length, 16);

	// Fill all pixels with white opaque
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			fb.setPixel(x, y, 255, 255, 255, 255);
		}
	}
	assert.deepEqual(fb.getPixel(1, 1), [255, 255, 255, 255]);

	// clearRect: (1, 1) width 2, height 2
	fb.clearRect(1, 1, 2, 2);
	assert.deepEqual(fb.getPixel(0, 0), [255, 255, 255, 255]);
	assert.deepEqual(fb.getPixel(1, 1), [0, 0, 0, 0]);
	assert.deepEqual(fb.getPixel(2, 2), [0, 0, 0, 0]);
	assert.deepEqual(fb.getPixel(3, 3), [255, 255, 255, 255]);

	// out of bounds clearRect no throw
	fb.clearRect(-5, -5, 1, 1);
	fb.clearRect(0, 0, 0, 0);

	// compositeBuffer test
	const layer = new SurfaceFrameBuffer(2, 2);
	layer.setPixel(0, 0, 200, 100, 50, 255); // opaque
	layer.setPixel(1, 0, 200, 100, 50, 128); // semi-transparent
	layer.setPixel(0, 1, 0, 0, 0, 0); // transparent

	fb.compositeBuffer(layer, 0, 0, "overlay");
	assert.deepEqual(fb.getPixel(0, 0), [200, 100, 50, 255]);
	// layer (0, 1) is transparent, so fb (0, 1) keeps original white
	assert.deepEqual(fb.getPixel(0, 1), [255, 255, 255, 255]);

	// test replace mode
	fb.compositeBuffer(layer, 2, 2, "replace");
	assert.deepEqual(fb.getPixel(2, 2), [200, 100, 50, 255]);

	// test interpolate mode
	const interpLayer = new SurfaceFrameBuffer(2, 2);
	interpLayer.setPixel(0, 0, 200, 100, 50, 255); // same color as fb (0,0) -> should skip
	interpLayer.setPixel(1, 0, 10, 20, 30, 255); // different -> should apply
	fb.compositeBuffer(interpLayer, 0, 0, "interpolate");
	assert.deepEqual(fb.getPixel(0, 0), [200, 100, 50, 255]);
	assert.deepEqual(fb.getPixel(1, 0), [10, 20, 30, 255]);

	// test reduce mode (alpha multiplication)
	const reduceLayer = new SurfaceFrameBuffer(2, 2);
	reduceLayer.setPixel(0, 0, 0, 0, 0, 128); // 50% opacity
	fb.compositeBuffer(reduceLayer, 0, 0, "reduce");
	// fb(0, 0) original alpha was 255, now Math.round((255 * 128) / 255) = 128
	assert.deepEqual(fb.getPixel(0, 0), [200, 100, 50, 128]);

	// test in-memory blend modes in compositeBuffer
	const blendBuf = new SurfaceFrameBuffer(2, 2);
	blendBuf.setPixel(0, 0, 120, 180, 200, 255);

	const blendSrc = new SurfaceFrameBuffer(2, 2);
	blendSrc.setPixel(0, 0, 50, 60, 220, 255);

	// subtract-fast: max(0, 120-50)=70, max(0, 180-60)=120, max(0, 200-220)=0
	blendBuf.compositeBuffer(blendSrc, 0, 0, "subtract-fast");
	assert.deepEqual(blendBuf.getPixel(0, 0), [70, 120, 0, 255]);

	// divide-fast: (70*255)/50=357->255, (120*255)/60=510->255, 0->0
	blendBuf.compositeBuffer(blendSrc, 0, 0, "divide-fast");
	assert.deepEqual(blendBuf.getPixel(0, 0), [255, 255, 0, 255]);

	// blend-overlay-fast test
	const overlayBuf = new SurfaceFrameBuffer(1, 1);
	overlayBuf.setPixel(0, 0, 100, 100, 100, 255);
	const overlaySrc = new SurfaceFrameBuffer(1, 1);
	overlaySrc.setPixel(0, 0, 200, 200, 200, 255);
	// d = 100 < 128: 2 * 100 * 200 / 255 = 156
	overlayBuf.compositeBuffer(overlaySrc, 0, 0, "blend-overlay-fast");
	assert.deepEqual(overlayBuf.getPixel(0, 0), [156, 156, 156, 255]);

	// blend-softlight-fast test
	const softBuf = new SurfaceFrameBuffer(1, 1);
	softBuf.setPixel(0, 0, 128, 128, 128, 255);
	const softSrc = new SurfaceFrameBuffer(1, 1);
	softSrc.setPixel(0, 0, 128, 128, 128, 255);
	softBuf.compositeBuffer(softSrc, 0, 0, "blend-softlight-fast");
	const softPixel = softBuf.getPixel(0, 0);
	assert.ok(softPixel && softPixel[0] >= 127 && softPixel[0] <= 129);

	// test destroy
	fb.destroy();
	assert.equal(fb.width, 0);
	assert.equal(fb.height, 0);
	assert.equal(fb.data.length, 0);
});
