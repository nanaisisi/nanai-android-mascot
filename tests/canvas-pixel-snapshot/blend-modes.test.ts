import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockCanvas } from "./helpers.js";

const { drawLayer } = await import("../../ui/ts/surface/compositor/layer.js");
const { composeSurfaceElements } = await import(
	"../../ui/ts/surface/compositor/compose.js"
);

test("drawLayer and composeSurfaceElements blend modes & composite operations", async () => {
	const origDocument = globalThis.document;
	const origImage = globalThis.Image;

	const testCanvas = createMockCanvas(10, 10);
	const ctx = testCanvas.getContext("2d");

	globalThis.Image = class {
		constructor() {
			this.naturalWidth = 5;
			this.naturalHeight = 5;
			this.width = 5;
			this.height = 5;
			this._mockData = new Uint8ClampedArray(5 * 5 * 4).fill(128);
			setTimeout(() => {
				this.onload?.();
			}, 0);
		}
	};

	// Test blend modes mapping
	const blendModes = [
		{ type: "replace", op: "source-over" },
		{ type: "multiply", op: "source-over" },
		{ type: "screen", op: "source-over" },
		{ type: "overlay", op: "source-over" },
		{ type: "add", op: "source-over" },
		{ type: "darken", op: "source-over" },
		{ type: "lighten", op: "source-over" },
		{ type: "color-dodge", op: "source-over" },
		{ type: "color-burn", op: "source-over" },
		{ type: "hard-light", op: "source-over" },
		{ type: "soft-light", op: "source-over" },
		{ type: "difference", op: "source-over" },
		{ type: "exclusion", op: "source-over" },
		{ type: "hue", op: "source-over" },
		{ type: "saturation", op: "source-over" },
		{ type: "color", op: "source-over" },
		{ type: "luminosity", op: "source-over" },
		{ type: "base", op: "source-over" },
	];

	for (const { type } of blendModes) {
		await drawLayer(
			ctx,
			"layer.png",
			async (name) => `resolved/${name}`,
			0,
			0,
			type,
		);
		// After drawing, globalCompositeOperation is restored to previous value
		assert.equal(ctx.globalCompositeOperation, "source-over");
	}

	// Test composeSurfaceElements
	globalThis.document = {
		createElement(tag) {
			if (tag === "canvas") return createMockCanvas(20, 20);
			return {};
		},
	};

	const elements = [
		{ file: "base.png", x: 0, y: 0, type: "base" },
		{ file: "face.png", x: 2, y: 2, type: "overlay" },
	];

	const composedDataUrl = await composeSurfaceElements(
		"surface0",
		elements,
		async (fn) => `http://mock/${fn}`,
	);

	assert.ok(composedDataUrl.startsWith("data:image/png;base64,"));

	// Restore
	globalThis.document = origDocument;
	globalThis.Image = origImage;
});

test("SurfaceFrameBuffer.compositeBuffer extended blend modes pixel calculations", async () => {
	const { SurfaceFrameBuffer } = await import(
		"../../ui/ts/surface/compositor/framebuffer.js"
	);

	const base = new SurfaceFrameBuffer(2, 2);
	// (0,0): (120, 180, 200, 255)
	base.setPixel(0, 0, 120, 180, 200, 255);

	const layer = new SurfaceFrameBuffer(2, 2);
	// (0,0): (50, 60, 220, 255)
	layer.setPixel(0, 0, 50, 60, 220, 255);

	// 1. color-dodge-fast
	const dodgeFb = base.clone();
	dodgeFb.compositeBuffer(layer, 0, 0, "color-dodge-fast");
	// R: (120 * 255) / (255 - 50) = 30600 / 205 = 149
	// G: (180 * 255) / (255 - 60) = 45900 / 195 = 235
	// B: (200 * 255) / (255 - 220) = 51000 / 35 = 1457 -> min(255) = 255
	assert.deepEqual(dodgeFb.getPixel(0, 0), [149, 235, 255, 255]);

	// 2. color-burn-fast
	const burnFb = base.clone();
	burnFb.compositeBuffer(layer, 0, 0, "color-burn-fast");
	// R: 255 - (135 * 255) / 50 = 255 - 688 -> 0
	// G: 255 - (75 * 255) / 60 = 255 - 318 -> 0
	// B: 255 - (55 * 255) / 220 = 255 - 63 = 192
	assert.deepEqual(burnFb.getPixel(0, 0), [0, 0, 192, 255]);

	// 3. linear-burn-fast
	const linearBurnFb = base.clone();
	linearBurnFb.compositeBuffer(layer, 0, 0, "linear-burn-fast");
	// max(0, d + s - 255)
	// R: max(0, 120 + 50 - 255) = 0
	// G: max(0, 180 + 60 - 255) = 0
	// B: max(0, 200 + 220 - 255) = 165
	assert.deepEqual(linearBurnFb.getPixel(0, 0), [0, 0, 165, 255]);

	// 4. linear-light-fast
	const linearLightFb = base.clone();
	linearLightFb.compositeBuffer(layer, 0, 0, "linear-light-fast");
	// clamp(d + 2*s - 255, 0, 255)
	// R: clamp(120 + 100 - 255, 0, 255) = 0
	// G: clamp(180 + 120 - 255, 0, 255) = 45
	// B: clamp(200 + 440 - 255, 0, 255) = 255
	assert.deepEqual(linearLightFb.getPixel(0, 0), [0, 45, 255, 255]);

	// 5. hard-mix-fast
	const hardMixFb = base.clone();
	hardMixFb.compositeBuffer(layer, 0, 0, "hard-mix-fast");
	// linear-light >= 128 ? 255 : 0
	// R: 0 < 128 -> 0
	// G: 45 < 128 -> 0
	// B: 255 >= 128 -> 255
	assert.deepEqual(hardMixFb.getPixel(0, 0), [0, 0, 255, 255]);

	// 6. pin-light-fast
	const pinLightFb = base.clone();
	pinLightFb.compositeBuffer(layer, 0, 0, "pin-light-fast");
	// s < 128: min(d, 2*s) | s >= 128: max(d, 2*(s - 128))
	// R (s=50 < 128): min(120, 100) = 100
	// G (s=60 < 128): min(180, 120) = 120
	// B (s=220 >= 128): max(200, 2*(220-128)=184) = 200
	assert.deepEqual(pinLightFb.getPixel(0, 0), [100, 120, 200, 255]);

	// 7. hard-light-fast
	const hardLightFb = base.clone();
	hardLightFb.compositeBuffer(layer, 0, 0, "hard-light-fast");
	// s < 128: (2 * s * d) / 255 | s >= 128: 255 - 2*(255-s)*(255-d)/255
	// R (s=50): (2 * 50 * 120) / 255 = 12000 / 255 = 47
	// G (s=60): (2 * 60 * 180) / 255 = 21600 / 255 = 84
	// B (s=220): 255 - 2*(35)*(55)/255 = 255 - 3850/255 = 255 - 15 = 240
	assert.deepEqual(hardLightFb.getPixel(0, 0), [47, 84, 240, 255]);
});
