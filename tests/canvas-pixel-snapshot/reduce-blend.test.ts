import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockCanvas } from "./helpers.js";

const { SurfaceFrameBuffer } = await import(
	"../../ui/ts/surface/compositor/framebuffer.js"
);
const { drawImageLayer } = await import(
	"../../ui/ts/surface/compositor/layer.js"
);
const { processChromaKey } = await import(
	"../../ui/ts/surface/compositor/chromakey.js"
);

test("Canvas Pixel Snapshot Cycle 5: DrawMethod::Reduce alpha multiplication math", () => {
	// Create destination buffer with solid magenta (R:255, G:0, B:255, A:200)
	const dst = new SurfaceFrameBuffer(4, 4);
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			dst.setPixel(x, y, 255, 0, 255, 200);
		}
	}

	// Create source buffer with semi-transparent cyan (R:0, G:255, B:255, A:128)
	const src = new SurfaceFrameBuffer(2, 2);
	for (let y = 0; y < 2; y++) {
		for (let x = 0; x < 2; x++) {
			src.setPixel(x, y, 0, 255, 255, 128);
		}
	}

	// Composite using "reduce"
	dst.compositeBuffer(src, 1, 1, "reduce");

	// Outside composited area (0, 0) remains unchanged
	assert.deepEqual(dst.getPixel(0, 0), [255, 0, 255, 200]);

	// Inside composited area (1, 1):
	// Math.round((200 * 128) / 255) = Math.round(25600 / 255) = 100
	const reducedPixel = dst.getPixel(1, 1);
	assert.ok(reducedPixel);
	// RGB channels from dst should remain preserved
	assert.equal(reducedPixel[0], 255, "R channel preserved");
	assert.equal(reducedPixel[1], 0, "G channel preserved");
	assert.equal(reducedPixel[2], 255, "B channel preserved");
	// Alpha channel should be multiplied
	assert.equal(reducedPixel[3], 100, "Alpha multiplied correctly");
});

test("Canvas Pixel Snapshot Cycle 5: fast-blend aliases (overlaymultiply, overlayscreen)", () => {
	const canvas = createMockCanvas(10, 10);
	const ctx = canvas.getContext("2d");

	let clearedRect = null;
	ctx.clearRect = (x, y, w, h) => {
		clearedRect = { x, y, w, h };
	};

	const operations = [];
	ctx.drawImage = () => {
		operations.push(ctx.globalCompositeOperation);
	};

	const mockImg = {
		naturalWidth: 8,
		naturalHeight: 8,
		width: 8,
		height: 8,
	};

	// Test overlaymultiply sets multiply operation during drawImage
	drawImageLayer(ctx, mockImg, 0, 0, "overlaymultiply");
	assert.equal(operations[0], "multiply");
	// After drawing, globalCompositeOperation should be restored to initial "source-over"
	assert.equal(ctx.globalCompositeOperation, "source-over");

	// Test overlayscreen sets screen operation during drawImage
	drawImageLayer(ctx, mockImg, 0, 0, "overlayscreen");
	assert.equal(operations[1], "screen");
	assert.equal(ctx.globalCompositeOperation, "source-over");

	// Test replace clears destination rect
	drawImageLayer(ctx, mockImg, 2, 3, "replace");
	assert.deepEqual(clearedRect, { x: 2, y: 3, w: 8, h: 8 });
});

test("Canvas Pixel Snapshot Cycle 5: use_self_alpha chromakey bypass", async () => {
	const origDoc = globalThis.document;
	const origImg = globalThis.Image;

	// Mock Image and Canvas
	globalThis.Image = class {
		constructor() {
			this.naturalWidth = 4;
			this.naturalHeight = 4;
			this.width = 4;
			this.height = 4;
			setTimeout(() => this.onload?.(), 0);
		}
	};

	const testSrc = "http://localhost/ghost/surface0000.png";

	// When useSelfAlpha is true, chromakey processing resolves directly with imageSrc
	const result = await processChromaKey(
		testSrc,
		null,
		null,
		false,
		true, // useSelfAlpha
	);

	assert.equal(
		result,
		testSrc,
		"When useSelfAlpha is enabled, imageSrc must be returned directly without chroma alteration",
	);

	globalThis.document = origDoc;
	globalThis.Image = origImg;
});
