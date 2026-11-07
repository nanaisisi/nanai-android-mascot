import assert from "node:assert/strict";
import { test } from "vitest";

const { SurfaceFrameBuffer } = await import(
	"../../ui/js/surface/compositor/framebuffer.js"
);

test("Canvas Pixel Snapshot Cycle 8: SurfaceFrameBuffer extreme alpha & clipping edge cases", () => {
	// 1. Extreme alpha composite (alpha = 0, alpha = 255, partial alpha)
	const dst = new SurfaceFrameBuffer(2, 2);
	dst.setPixel(0, 0, 100, 100, 100, 255);
	dst.setPixel(1, 0, 100, 100, 100, 0);

	const src = new SurfaceFrameBuffer(2, 2);
	src.setPixel(0, 0, 200, 200, 200, 0); // Transparent source over opaque dst -> dst unchanged
	src.setPixel(1, 0, 200, 200, 200, 255); // Opaque source over transparent dst -> src replaces dst

	dst.compositeBuffer(src, 0, 0, "overlay");

	assert.deepEqual(
		dst.getPixel(0, 0),
		[100, 100, 100, 255],
		"Transparent src should not modify dst",
	);
	assert.deepEqual(
		dst.getPixel(1, 0),
		[200, 200, 200, 255],
		"Opaque src over transparent dst replaces",
	);

	// 2. High-precision coordinate boundary tolerance with negative and fractional-like offsets
	const canvasFb = new SurfaceFrameBuffer(4, 4);
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			canvasFb.setPixel(x, y, 10, 20, 30, 255);
		}
	}

	const stampFb = new SurfaceFrameBuffer(3, 3);
	for (let y = 0; y < 3; y++) {
		for (let x = 0; x < 3; x++) {
			stampFb.setPixel(x, y, 255, 255, 255, 255);
		}
	}

	// Stamp partially out of top-left boundary (-1, -1)
	canvasFb.compositeBuffer(stampFb, -1, -1, "replace");
	// (0, 0) should be affected by stamp's (1, 1)
	assert.deepEqual(canvasFb.getPixel(0, 0), [255, 255, 255, 255]);
	// (0, 1) should be affected by stamp's (1, 2)
	assert.deepEqual(canvasFb.getPixel(0, 1), [255, 255, 255, 255]);
	// (2, 2) should remain original [10, 20, 30, 255]
	assert.deepEqual(canvasFb.getPixel(2, 2), [10, 20, 30, 255]);

	// Stamp partially out of bottom-right boundary (2, 2)
	canvasFb.compositeBuffer(stampFb, 2, 2, "replace");
	assert.deepEqual(canvasFb.getPixel(2, 2), [255, 255, 255, 255]);
	assert.deepEqual(canvasFb.getPixel(3, 3), [255, 255, 255, 255]);

	dst.destroy();
	src.destroy();
	canvasFb.destroy();
	stampFb.destroy();
});

test("Canvas Pixel Snapshot Cycle 8: SurfaceFrameBuffer multi-pass sequential blending integrity", () => {
	// Destination starting at neutral gray 128
	const fb = new SurfaceFrameBuffer(1, 1);
	fb.setPixel(0, 0, 128, 128, 128, 255);

	const layer1 = new SurfaceFrameBuffer(1, 1);
	layer1.setPixel(0, 0, 128, 128, 128, 255);

	// Pass 1: multiply-fast -> (128 * 128) / 255 = 64
	fb.compositeBuffer(layer1, 0, 0, "multiply-fast");
	assert.equal(fb.getPixel(0, 0)?.[0], 64);

	// Pass 2: screen-fast -> 255 - ((255 - 64) * (255 - 128)) / 255 = 255 - (191 * 127) / 255 = 255 - 95 = 160
	fb.compositeBuffer(layer1, 0, 0, "screen-fast");
	const pScreen = fb.getPixel(0, 0);
	assert.ok(pScreen);
	assert.ok(Math.abs(pScreen[0] - 160) <= 2);

	// Pass 3: add-fast -> min(255, 160 + 128) = 255
	fb.compositeBuffer(layer1, 0, 0, "add-fast");
	assert.equal(fb.getPixel(0, 0)?.[0], 255);

	// Pass 4: subtract-fast -> max(0, 255 - 128) = 127
	fb.compositeBuffer(layer1, 0, 0, "subtract-fast");
	assert.equal(fb.getPixel(0, 0)?.[0], 127);

	fb.destroy();
	layer1.destroy();
});
