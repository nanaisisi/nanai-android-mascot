import assert from "node:assert/strict";
import { test } from "vitest";

const { processChromaKey } = await import(
	"../ui/js/surface/compositor/chromakey.js"
);
const { drawLayer } = await import("../ui/js/surface/compositor/layer.js");
const { composeSurfaceElements } = await import(
	"../ui/js/surface/compositor/compose.js"
);
const { BalloonThemeManager } = await import(
	"../ui/js/core/actions/balloon-theme.js"
);

// In-memory Canvas and ImageData Mock for Pixel Level Comparisons
function createMockCanvas(width, height) {
	const pixelBuffer = new Uint8ClampedArray(width * height * 4);
	const data32 = new Uint32Array(pixelBuffer.buffer);

	const context = {
		globalCompositeOperation: "source-over",
		width,
		height,
		drawImage(img, dx = 0, dy = 0) {
			if (img?._mockData) {
				const srcData = img._mockData;
				const src32 = new Uint32Array(srcData.buffer);
				for (let y = 0; y < img.naturalHeight; y++) {
					for (let x = 0; x < img.naturalWidth; x++) {
						const destX = dx + x;
						const destY = dy + y;
						if (destX < width && destY < height) {
							const destIdx = destY * width + destX;
							const srcIdx = y * img.naturalWidth + x;
							data32[destIdx] = src32[srcIdx];
						}
					}
				}
			}
		},
		clearRect(x, y, w, h) {
			for (let cy = y; cy < y + h && cy < height; cy++) {
				for (let cx = x; cx < x + w && cx < width; cx++) {
					data32[cy * width + cx] = 0;
				}
			}
		},
		getImageData(_sx, _sy, sw, sh) {
			return {
				data: pixelBuffer,
				width: sw,
				height: sh,
			};
		},
		putImageData(imgData, _dx, _dy) {
			pixelBuffer.set(imgData.data);
		},
	};

	return {
		width,
		height,
		getContext: () => context,
		toDataURL: (type) => `data:${type};base64,mockCanvasData`,
		_pixelBuffer: pixelBuffer,
		_data32: data32,
	};
}

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

test("SurfaceFrameBuffer Cycle 4: dynamic offset composition, interpolate alpha blend, and boundary tolerance", async () => {
	const { SurfaceFrameBuffer } = await import(
		"../ui/js/surface/compositor/framebuffer.js"
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
		"../ui/js/surface/compositor/framebuffer.js"
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

test("BalloonThemeManager computeNineSlice snapshot calculation and CSS border properties", () => {
	const mgr = new BalloonThemeManager();

	// 1. Valid 9-slice calculation with custom borders
	const props = {
		"validrect.left": "15",
		"validrect.top": "20",
		"validrect.right": "85",
		"validrect.bottom": "80",
	};
	const slice = mgr.computeNineSlice(props, "http://mock/balloon-bg.png");

	assert.ok(slice);
	assert.equal(slice.source, "http://mock/balloon-bg.png");
	assert.equal(slice.slice, "20 85 80 15 fill");
	assert.equal(slice.width, "20px 85px 80px 15px");
	assert.equal(slice.repeat, "repeat");
	assert.equal(
		slice.cssBorderImage,
		'url("http://mock/balloon-bg.png") 20 85 80 15 fill / 20px 85px 80px 15px repeat',
	);

	// 2. Default fallback when no validrect is provided
	const defaultSlice = mgr.computeNineSlice({}, null);
	assert.ok(defaultSlice);
	assert.equal(defaultSlice.slice, "16 16 16 16 fill");
	assert.equal(defaultSlice.width, "16px 16px 16px 16px");
	assert.equal(defaultSlice.cssBorderImage, "");

	// 3. Fallback when invalid/negative coordinates are given
	const invalidProps = {
		"validrect.left": "invalid",
		"validrect.top": "-5",
		"border.repeat": "stretch",
	};
	const fallbackSlice = mgr.computeNineSlice(invalidProps, "bg.png");
	assert.equal(fallbackSlice.slice, "16 16 16 16 fill");
	assert.equal(fallbackSlice.repeat, "stretch");
	assert.equal(
		fallbackSlice.cssBorderImage,
		'url("bg.png") 16 16 16 16 fill / 16px 16px 16px 16px stretch',
	);
});

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
