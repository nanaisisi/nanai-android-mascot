import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockCanvas } from "./helpers.js";

const { SurfaceFrameBuffer } = await import(
	"../../ui/ts/surface/compositor/framebuffer.js"
);
const { processChromaKey } = await import(
	"../../ui/ts/surface/compositor/chromakey.js"
);

test("Canvas Pixel Snapshot Cycle 7: SurfaceFrameBuffer add-glow, color-dodge-glow, darker-color, lighter-color", () => {
	// 1. Add-glow (clamped addition)
	const dstAddGlow = new SurfaceFrameBuffer(1, 1);
	dstAddGlow.setPixel(0, 0, 150, 100, 50, 255);
	const srcAddGlow = new SurfaceFrameBuffer(1, 1);
	srcAddGlow.setPixel(0, 0, 150, 200, 100, 255);

	dstAddGlow.compositeBuffer(srcAddGlow, 0, 0, "blend-add-glow-fast");
	const pAddGlow = dstAddGlow.getPixel(0, 0);
	assert.ok(pAddGlow);
	assert.equal(pAddGlow[0], 255, "R: 150 + 150 clamped to 255");
	assert.equal(pAddGlow[1], 255, "G: 100 + 200 clamped to 255");
	assert.equal(pAddGlow[2], 150, "B: 50 + 100 = 150");
	assert.equal(pAddGlow[3], 255);

	// 2. Darker-color
	const dstDarker = new SurfaceFrameBuffer(1, 1);
	dstDarker.setPixel(0, 0, 200, 200, 200, 255); // lum = 200
	const srcDarker = new SurfaceFrameBuffer(1, 1);
	srcDarker.setPixel(0, 0, 50, 50, 50, 255); // lum = 50 < 200

	dstDarker.compositeBuffer(srcDarker, 0, 0, "blend-darker-color-fast");
	const pDarker = dstDarker.getPixel(0, 0);
	assert.ok(pDarker);
	assert.equal(pDarker[0], 50, "Darker pixel is selected");
	assert.equal(pDarker[1], 50);
	assert.equal(pDarker[2], 50);

	// 3. Lighter-color
	const dstLighter = new SurfaceFrameBuffer(1, 1);
	dstLighter.setPixel(0, 0, 80, 80, 80, 255); // lum = 80
	const srcLighter = new SurfaceFrameBuffer(1, 1);
	srcLighter.setPixel(0, 0, 180, 180, 180, 255); // lum = 180 > 80

	dstLighter.compositeBuffer(srcLighter, 0, 0, "blend-lighter-color-fast");
	const pLighter = dstLighter.getPixel(0, 0);
	assert.ok(pLighter);
	assert.equal(pLighter[0], 180, "Lighter pixel is selected");
	assert.equal(pLighter[1], 180);
	assert.equal(pLighter[2], 180);

	// 4. Color-dodge-glow
	const dstDodge = new SurfaceFrameBuffer(1, 1);
	dstDodge.setPixel(0, 0, 100, 100, 100, 255);
	const srcDodge = new SurfaceFrameBuffer(1, 1);
	srcDodge.setPixel(0, 0, 128, 128, 128, 255);

	dstDodge.compositeBuffer(srcDodge, 0, 0, "blend-color-dodge-glow-fast");
	const pDodge = dstDodge.getPixel(0, 0);
	assert.ok(pDodge);
	// (100 * 255) / (255 - 128) = 25500 / 127 = 200
	assert.ok(Math.abs(pDodge[0] - 200) <= 2);

	dstAddGlow.destroy();
	srcAddGlow.destroy();
	dstDarker.destroy();
	srcDarker.destroy();
	dstLighter.destroy();
	srcLighter.destroy();
	dstDodge.destroy();
	srcDodge.destroy();
});

test("Canvas Pixel Snapshot Cycle 7: processChromaKey options.paintTransparentRegionBlack", async () => {
	const origDocument = globalThis.document;
	const origImage = globalThis.Image;

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	let baseCanvas: any = null;
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
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
	} as any;

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
				// Base image: green at top-left
				this._mockData = new Uint8ClampedArray([
					0, 255, 0, 255, 0, 255, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255,
				]);
			} else {
				// PNA mask: 255 (opaque) at top-left
				this._mockData = new Uint8ClampedArray([
					255, 255, 255, 255, 128, 128, 128, 255, 0, 0, 0, 255, 255, 255, 255,
					255,
				]);
			}
			setTimeout(() => {
				this.onload?.();
			}, 0);
		}
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
	} as any;

	try {
		const dummySrc = "test-black.png";
		const pnaSrc = "test-black.pna";
		const cache = new Map<string, string>();
		const res = await processChromaKey(dummySrc, pnaSrc, cache, {
			paintTransparentRegionBlack: true,
		});
		assert.ok(typeof res === "string");
		assert.ok(baseCanvas);

		const pixels = baseCanvas._pixelBuffer;
		assert.equal(pixels[0], 0, "R should be 0 (black)");
		assert.equal(pixels[1], 0, "G should be 0 (black)");
		assert.equal(pixels[2], 0, "B should be 0 (black)");
	} finally {
		globalThis.document = origDocument;
		globalThis.Image = origImage;
	}
});
