import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.Image = class {
	constructor() {
		this.naturalWidth = 100;
		this.naturalHeight = 100;
		setTimeout(() => {
			this.onload?.();
		}, 10);
	}
};

globalThis.document = {
	createElement(tag) {
		if (tag === "canvas") {
			return {
				width: 0,
				height: 0,
				toDataURL: () => "data:image/png;base64,mock",
				getContext() {
					return {
						drawImage() {},
						clearRect() {},
						putImageData() {},
						getImageData: () => ({
							data: new Uint8Array([0, 255, 0, 255, 255, 255, 255, 255]),
						}),
					};
				},
			};
		}
		return {};
	},
};

const {
	processChromaKey,
	drawImageLayer,
	drawLayer,
	composeSurfaceElements,
	SurfaceFrameBuffer,
	compositeElements,
} = await import("../ui/js/surface/surface-compositor.js");

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

	// test destroy
	fb.destroy();
	assert.equal(fb.width, 0);
	assert.equal(fb.height, 0);
	assert.equal(fb.data.length, 0);
});

test("surface-compositor covers processChromaKey, drawLayer, and composeSurfaceElements", async () => {
	// 1. processChromaKey empty source
	const emptyRes = await processChromaKey("");
	assert.equal(emptyRes, "");

	// 2. processChromaKey cache test
	const cache = new Map();
	cache.set("cached", "data:image/png;base64,cached");
	const cachedRes = await processChromaKey("cached", null, cache);
	assert.equal(cachedRes, "data:image/png;base64,cached");

	// 3. processChromaKey normal execution
	const chromaRes = await processChromaKey("image.png", "mask.png", cache);
	assert.ok(chromaRes);

	// 4. drawLayer & drawImageLayer
	const mockCtx = {
		globalCompositeOperation: "source-over",
		drawImage() {},
		clearRect() {},
		putImageData() {},
		getImageData: () => ({
			data: new Uint8Array([0, 255, 0, 255, 255, 255, 255, 255]),
		}),
	};
	const resolvePath = async (f) => (f ? `resolved_${f}` : null);
	await drawLayer(mockCtx, "part.png", resolvePath, 0, 0, "replace");
	await drawLayer(mockCtx, "multiply.png", resolvePath, 0, 0, "blend-multiply");
	await drawLayer(mockCtx, "darken.png", resolvePath, 0, 0, "blend-darken");
	await drawLayer(mockCtx, "lighten.png", resolvePath, 0, 0, "blend-lighten");
	await drawLayer(mockCtx, "dodge.png", resolvePath, 0, 0, "blend-color-dodge");
	await drawLayer(mockCtx, "burn.png", resolvePath, 0, 0, "blend-color-burn");
	await drawLayer(
		mockCtx,
		"hardlight.png",
		resolvePath,
		0,
		0,
		"blend-hard-light",
	);
	await drawLayer(
		mockCtx,
		"softlight.png",
		resolvePath,
		0,
		0,
		"blend-soft-light",
	);
	await drawLayer(mockCtx, "diff.png", resolvePath, 0, 0, "blend-difference");
	await drawLayer(mockCtx, "excl.png", resolvePath, 0, 0, "blend-exclusion");
	await drawLayer(mockCtx, "hue.png", resolvePath, 0, 0, "blend-hue");
	await drawLayer(mockCtx, "sat.png", resolvePath, 0, 0, "blend-saturation");
	await drawLayer(mockCtx, "color.png", resolvePath, 0, 0, "blend-color");
	await drawLayer(mockCtx, "lum.png", resolvePath, 0, 0, "blend-luminosity");
	await drawLayer(mockCtx, "asis.png", resolvePath, 0, 0, "asis");
	await drawLayer(mockCtx, "base.png", resolvePath, 0, 0, "base");
	await drawLayer(mockCtx, "interpolate.png", resolvePath, 0, 0, "interpolate");
	await drawLayer(mockCtx, "", resolvePath, 0, 0, "overlay");

	const mockImg = new globalThis.Image();
	drawImageLayer(mockCtx, mockImg, 0, 0, "interpolate");
	drawImageLayer(mockCtx, null, 0, 0);

	// 5. composeSurfaceElements
	const compEmpty = await composeSurfaceElements([], "", resolvePath, [], {
		returnCanvas: true,
	});
	assert.ok(compEmpty);

	const compRes = await composeSurfaceElements(
		[{ file: "el1.png", x: 0, y: 0, type: "overlay" }],
		"base.png",
		resolvePath,
		[{ file: "bind1.png", x: 5, y: 5, type: "add" }],
		{ returnCanvas: false },
	);
	assert.ok(compRes);

	assert.ok(true);
});
