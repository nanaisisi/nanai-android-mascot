import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockCanvas } from "./helpers.js";

const { composeSurfaceElements } = await import(
	"../../ui/ts/surface/compositor/compose.js"
);

test("SurfaceFrameBuffer Cycle 4: dynamic offset composition, interpolate alpha blend, and boundary tolerance", async () => {
	const { SurfaceFrameBuffer } = await import(
		"../../ui/ts/surface/compositor/framebuffer.js"
	);

	// Create a 16x16 destination buffer initialized to solid black (alpha 255)
	const dst = new SurfaceFrameBuffer(16, 16);
	for (let y = 0; y < 16; y++) {
		for (let x = 0; x < 16; x++) {
			dst.setPixel(x, y, 0, 0, 0, 255);
		}
	}

	// Create an 8x8 source buffer with semi-transparent red (R: 200, G: 0, B: 0, A: 128)
	const src = new SurfaceFrameBuffer(8, 8);
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			src.setPixel(x, y, 200, 0, 0, 128);
		}
	}

	// 1. Composite with positive offset (4, 4) using interpolate
	dst.compositeBuffer(src, 4, 4, "interpolate");

	// Outside composited area (0, 0) should remain untouched (0, 0, 0, 255)
	assert.deepEqual(dst.getPixel(0, 0), [0, 0, 0, 255]);

	// Inside composited area (4, 4) should have interpolated/assigned pixel
	const interpolatedPixel = dst.getPixel(4, 4);
	assert.ok(interpolatedPixel);
	assert.equal(interpolatedPixel[0], 200, "Red channel should be set");
	assert.equal(interpolatedPixel[1], 0);
	assert.equal(interpolatedPixel[2], 0);
	assert.equal(interpolatedPixel[3], 128, "Alpha channel should match source");

	// Test standard overlay alpha blend
	const srcSemiBlue = new SurfaceFrameBuffer(4, 4);
	for (let y = 0; y < 4; y++) {
		for (let x = 0; x < 4; x++) {
			srcSemiBlue.setPixel(x, y, 0, 0, 200, 128);
		}
	}
	dst.compositeBuffer(srcSemiBlue, 0, 0, "overlay");
	const blended = dst.getPixel(0, 0);
	assert.ok(blended);
	assert.ok(
		blended[2] > 50 && blended[2] < 220,
		"Blue channel should be blended",
	);
	assert.equal(
		blended[3],
		255,
		"Alpha channel should remain opaque when blended on opaque background",
	);
	srcSemiBlue.destroy();

	// 2. Boundary tolerance: Composite with negative offset (-4, -4)
	const srcGreen = new SurfaceFrameBuffer(8, 8);
	for (let y = 0; y < 8; y++) {
		for (let x = 0; x < 8; x++) {
			srcGreen.setPixel(x, y, 0, 255, 0, 255);
		}
	}

	assert.doesNotThrow(() => {
		dst.compositeBuffer(srcGreen, -4, -4, "replace");
	}, "Negative offset composite should not throw");

	// At (0, 0), the green replace should have taken effect
	assert.deepEqual(dst.getPixel(0, 0), [0, 255, 0, 255]);

	// 3. Boundary tolerance: Composite completely out of bounds (100, 100) or negative (-50, -50)
	assert.doesNotThrow(() => {
		dst.compositeBuffer(srcGreen, 100, 100, "overlay");
		dst.compositeBuffer(srcGreen, -50, -50, "overlay");
	}, "Completely out of bounds composite should be cleanly clipped without errors");

	// 4. Zero dimensions or invalid input tolerance
	const emptyBuffer = new SurfaceFrameBuffer(0, 0);
	assert.doesNotThrow(() => {
		dst.compositeBuffer(emptyBuffer, 0, 0, "overlay");
		dst.compositeBuffer(null, 0, 0, "overlay");
	});

	// Clean up
	dst.destroy();
	src.destroy();
	srcGreen.destroy();
	emptyBuffer.destroy();
});

test("SurfaceFrameBuffer 32-bit pixel operations, clone, and high-frequency multi-layer composite snapshot", async () => {
	const { SurfaceFrameBuffer } = await import(
		"../../ui/ts/surface/compositor/framebuffer.js"
	);

	// 1. Pixel buffer manipulation & boundary checks
	const fb = new SurfaceFrameBuffer(4, 4);
	assert.equal(fb.width, 4);
	assert.equal(fb.height, 4);
	assert.equal(fb.data.length, 64);

	// Out of bounds getter/setter checks
	assert.equal(fb.getPixel(-1, 0), null);
	assert.equal(fb.getPixel(4, 4), null);
	fb.setPixel(-1, 0, 255, 0, 0, 255); // No-op
	fb.setPixel(4, 4, 255, 0, 0, 255); // No-op

	// Set and get pixel
	fb.setPixel(1, 2, 100, 150, 200, 255);
	assert.deepEqual(fb.getPixel(1, 2), [100, 150, 200, 255]);

	// Clone should be independent deep copy
	const cloned = fb.clone();
	assert.deepEqual(cloned.getPixel(1, 2), [100, 150, 200, 255]);
	cloned.setPixel(1, 2, 10, 20, 30, 40);
	assert.deepEqual(cloned.getPixel(1, 2), [10, 20, 30, 40]);
	assert.deepEqual(fb.getPixel(1, 2), [100, 150, 200, 255]);

	// Clear should zero out buffer
	cloned.clear();
	assert.deepEqual(cloned.getPixel(1, 2), [0, 0, 0, 0]);

	// 2. High-frequency 32-bit pixel buffer throughput & composite simulation
	const origDocument = globalThis.document;
	const origImage = globalThis.Image;

	const canvas = createMockCanvas(32, 32);
	globalThis.document = {
		createElement(tag) {
			if (tag === "canvas") return canvas;
			return {};
		},
	};

	globalThis.Image = class {
		constructor() {
			this.naturalWidth = 16;
			this.naturalHeight = 16;
			this.width = 16;
			this.height = 16;
			this._mockData = new Uint8ClampedArray(16 * 16 * 4).fill(200);
			setTimeout(() => {
				this.onload?.();
			}, 0);
		}
	};

	// Benchmark: batch compose 20 iterations
	const startTime = Date.now();
	const multiElements = [
		{ file: "base.png", x: 0, y: 0, type: "base" },
		{ file: "dress.png", x: 4, y: 4, type: "overlay" },
		{ file: "face.png", x: 8, y: 8, type: "replace" },
		{ file: "acc.png", x: 12, y: 12, type: "add" },
	];

	for (let i = 0; i < 20; i++) {
		const out = await composeSurfaceElements(
			`surf_${i}`,
			multiElements,
			async (name) => `http://mock/${name}`,
		);
		assert.ok(out.startsWith("data:image/png;base64,"));
	}
	const elapsed = Date.now() - startTime;
	assert.ok(
		elapsed < 500,
		`20 batch compositing should complete rapidly (<500ms), took ${elapsed}ms`,
	);

	// Restore
	globalThis.document = origDocument;
	globalThis.Image = origImage;
});
