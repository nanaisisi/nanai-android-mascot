import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockCanvas } from "./helpers.js";

const { SurfaceFrameBuffer } = await import(
	"../../ui/ts/surface/compositor/framebuffer.js"
);
const { processChromaKey } = await import(
	"../../ui/ts/surface/compositor/chromakey.js"
);

test("Canvas Pixel Snapshot Cycle 9: SurfaceFrameBuffer boundary clamping and out-of-bounds operations", () => {
	const base = new SurfaceFrameBuffer(4, 4);
	// Fill base with 50, 50, 50, 255
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			base.setPixel(x, y, 50, 50, 50, 255);
		}
	}

	const overlay = new SurfaceFrameBuffer(2, 2);
	overlay.setPixel(0, 0, 255, 0, 0, 255);
	overlay.setPixel(1, 0, 0, 255, 0, 255);
	overlay.setPixel(0, 1, 0, 0, 255, 255);
	overlay.setPixel(1, 1, 255, 255, 0, 255);

	// Completely out-of-bounds composites should be safely ignored
	base.compositeBuffer(overlay, 10, 10, "replace");
	base.compositeBuffer(overlay, -10, -10, "replace");
	assert.deepEqual(base.getPixel(0, 0), [50, 50, 50, 255]);

	// Partial top-left overlap at (-1, -1)
	base.compositeBuffer(overlay, -1, -1, "replace");
	// overlay(1, 1) touches base(0, 0)
	assert.deepEqual(base.getPixel(0, 0), [255, 255, 0, 255]);
	// other pixels remain original
	assert.deepEqual(base.getPixel(1, 0), [50, 50, 50, 255]);

	// Partial bottom-right overlap at (3, 3)
	base.compositeBuffer(overlay, 3, 3, "replace");
	// overlay(0, 0) touches base(3, 3)
	assert.deepEqual(base.getPixel(3, 3), [255, 0, 0, 255]);

	base.destroy();
	overlay.destroy();
});

test("Canvas Pixel Snapshot Cycle 9: Multi-layer sequential blend pipelines and transparent region black verification", async () => {
	// 1. Multi-pass sequential blend mode pipeline
	const fb = new SurfaceFrameBuffer(2, 2);
	// Start with mid gray
	for (let y = 0; y < 2; y++) {
		for (let x = 0; x < 2; x++) {
			fb.setPixel(x, y, 128, 128, 128, 255);
		}
	}

	const layerOverlay = new SurfaceFrameBuffer(2, 2);
	for (let y = 0; y < 2; y++) {
		for (let x = 0; x < 2; x++) {
			layerOverlay.setPixel(x, y, 64, 64, 64, 255);
		}
	}

	// Composite overlay-fast
	fb.compositeBuffer(layerOverlay, 0, 0, "overlay-fast");
	const pOverlay = fb.getPixel(0, 0);
	assert.ok(pOverlay);
	assert.ok(pOverlay[0] < 128, "Overlay with dark tone darkens base");

	// Composite linear-light-fast
	fb.compositeBuffer(layerOverlay, 0, 0, "linear-light-fast");
	const pLinear = fb.getPixel(0, 0);
	assert.ok(pLinear);

	fb.destroy();
	layerOverlay.destroy();

	// 2. processChromaKey with paintTransparentRegionBlack option
	const origDocument = globalThis.document;
	const origImage = globalThis.Image;

	let baseCanvas: unknown = null;
	globalThis.document = {
		createElement(tag: string) {
			if (tag === "canvas") {
				const c = createMockCanvas(2, 2);
				if (!baseCanvas) {
					baseCanvas = c;
				}
				return c;
			}
			return {};
		},
	} as unknown as Document;

	let imageInstanceCount = 0;
	globalThis.Image = class {
		naturalWidth = 2;
		naturalHeight = 2;
		width = 2;
		height = 2;
		onload: (() => void) | null = null;
		_mockData: Uint8ClampedArray;
		constructor() {
			imageInstanceCount++;
			if (imageInstanceCount === 1) {
				// Base image: key color at top-left
				this._mockData = new Uint8ClampedArray([
					0, 255, 0, 255, 0, 255, 0, 255, 100, 100, 100, 255, 0, 0, 255, 255,
				]);
			} else {
				// PNA mask
				this._mockData = new Uint8ClampedArray([
					255, 255, 255, 255, 128, 128, 128, 255, 255, 255, 255, 255, 255, 255,
					255, 255,
				]);
			}
			setTimeout(() => {
				this.onload?.();
			}, 0);
		}
	} as unknown as typeof Image;

	try {
		const dummySrc = "test-cycle9-black.png";
		const pnaSrc = "test-cycle9-black.pna";
		const cache = new Map<string, string>();
		const res = await processChromaKey(dummySrc, pnaSrc, cache, {
			paintTransparentRegionBlack: true,
		});
		assert.ok(typeof res === "string");
		assert.ok(baseCanvas);

		const pixels = (baseCanvas as { _pixelBuffer: Uint8ClampedArray })
			._pixelBuffer;
		assert.equal(pixels[0], 0, "R should be 0 (black)");
		assert.equal(pixels[1], 0, "G should be 0 (black)");
		assert.equal(pixels[2], 0, "B should be 0 (black)");
	} finally {
		globalThis.document = origDocument;
		globalThis.Image = origImage;
	}
});
