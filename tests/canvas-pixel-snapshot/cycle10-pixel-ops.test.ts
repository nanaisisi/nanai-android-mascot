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
});
