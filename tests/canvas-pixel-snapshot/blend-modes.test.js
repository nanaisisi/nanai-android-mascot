import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockCanvas } from "./helpers.js";

const { drawLayer } = await import("../../ui/js/surface/compositor/layer.js");
const { composeSurfaceElements } = await import(
	"../../ui/js/surface/compositor/compose.js"
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
