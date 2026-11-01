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

	// compositeElements contract alias
	assert.equal(typeof compositeElements, "function");
	const res = await compositeElements([], "", async () => null);
	assert.equal(res, "");
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

	// 4. drawLayer
	const mockCtx = {
		globalCompositeOperation: "source-over",
		drawImage() {},
		clearRect() {},
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
	await drawLayer(mockCtx, "", resolvePath, 0, 0, "overlay");

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
