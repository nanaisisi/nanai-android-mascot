/**
 * @file framebuffer-contract.test.ts
 * @brief SurfaceFrameBuffer 基本機能および compositeElements コントラクトテスト
 */

import assert from "node:assert/strict";
import { test } from "vitest";
import { setupSurfaceCompositorMockEnv } from "./helpers.js";

setupSurfaceCompositorMockEnv();

const { SurfaceFrameBuffer, compositeElements } = await import(
	"../../ui/js/surface/surface-compositor.js"
);

test("surface-compositor covers SurfaceFrameBuffer and Contract functions", async () => {
	const fb = new SurfaceFrameBuffer(10, 10);
	assert.equal(fb.width, 10);
	assert.equal(fb.height, 10);
	assert.equal(fb.data.length, 10 * 10 * 4);

	fb.setPixel(0, 0, 255, 128, 64, 255);
	assert.deepEqual(fb.getPixel(0, 0), [255, 128, 64, 255]);
	assert.equal(fb.getPixel(100, 100), null);

	fb.setPixel(100, 100, 0, 0, 0, 0); // out of bounds check

	const fromImg = SurfaceFrameBuffer.fromImageData({
		width: 2,
		height: 2,
		data: new Uint8ClampedArray(16),
	});
	assert.equal(fromImg.width, 2);

	const mockCanvas = document.createElement("canvas");
	mockCanvas.width = 2;
	mockCanvas.height = 2;
	const fromCanvas = SurfaceFrameBuffer.fromCanvas(mockCanvas);
	assert.ok(fromCanvas);

	// clone and clear test
	const cloned = fb.clone();
	assert.equal(cloned.width, fb.width);
	assert.equal(cloned.height, fb.height);
	assert.deepEqual(cloned.getPixel(0, 0), [255, 128, 64, 255]);

	cloned.clear();
	assert.deepEqual(cloned.getPixel(0, 0), [0, 0, 0, 0]);

	// compositeElements contract alias
	assert.equal(typeof compositeElements, "function");
	const res = await compositeElements([], "", async () => null);
	assert.equal(res, "");
});
