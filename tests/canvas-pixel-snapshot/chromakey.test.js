import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockCanvas } from "./helpers.js";

const { processChromaKey } = await import(
	"../../ui/js/surface/compositor/chromakey.js"
);

test("Canvas ChromaKey pixel manipulation & PNA alpha mask comparison", async () => {
	const origDocument = globalThis.document;
	const origImage = globalThis.Image;

	// Mock environment
	let createdCanvas = null;
	globalThis.document = {
		createElement(tag) {
			if (tag === "canvas") {
				createdCanvas = createMockCanvas(2, 2);
				return createdCanvas;
			}
			return {};
		},
	};

	// 2x2 image with pure green (0, 255, 0, 255) at top-left and top-right, red at bottom
	globalThis.Image = class {
		constructor() {
			this.naturalWidth = 2;
			this.naturalHeight = 2;
			this.width = 2;
			this.height = 2;
			const buf = new Uint8ClampedArray([
				0, 255, 0, 255, 0, 255, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255,
			]);
			this._mockData = buf;
			setTimeout(() => {
				this.onload?.();
			}, 0);
		}
	};

	const result = await processChromaKey("test-surface.png");
	assert.ok(result.startsWith("data:image/png;base64,"));
	assert.ok(createdCanvas);

	// Verify top-left green was made transparent (alpha = 0)
	const pixels = createdCanvas._pixelBuffer;
	assert.equal(pixels[3], 0, "Top-left alpha must be 0 (transparent)");
	assert.equal(pixels[7], 0, "Top-right green alpha must be 0 (transparent)");
	assert.equal(
		pixels[11],
		255,
		"Bottom-left red alpha must remain 255 (opaque)",
	);
	assert.equal(
		pixels[15],
		255,
		"Bottom-right blue alpha must remain 255 (opaque)",
	);

	// Restore
	globalThis.document = origDocument;
	globalThis.Image = origImage;
});
