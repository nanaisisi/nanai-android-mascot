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
				width: 100,
				height: 100,
				toDataURL: () => "data:image/png;base64,mockRender",
				getContext() {
					return {
						drawImage() {},
						clearRect() {},
						putImageData() {},
						getImageData: () => ({ data: new Uint8Array([0, 255, 0, 255]) }),
					};
				},
			};
		}
		return {};
	},
};

const { surfaceRenderMethods } = await import("../ui/js/surface/surface-render.js");

test("surfaceRenderMethods covers composeFrameOnBase, composeSurfaceElements, and processChromaKey", async () => {
	const mockManager = {
		...surfaceRenderMethods,
		planCacheKey: () => "mock_cache_key",
		baseCanvasCache: new Map(),
		async getCompositionPlan() { return null; },
		activeBindLayers() { return []; },
		elements: { "0": [{ file: "el1.png", x: 0, y: 0, type: "overlay" }] },
		chromaKeyCache: new Map(),
	};

	// 1. composeFrameOnBase
	const mockBaseCanvas = document.createElement("canvas");
	const resolvePath = async (f) => f ? `resolved_${f}` : null;
	const frameSrc = await mockManager.composeFrameOnBase(
		mockBaseCanvas,
		[{ file: "frame1.png", x: 10, y: 10, type: "overlay" }],
		resolvePath,
	);
	assert.ok(frameSrc);

	// 2. composeSurfaceElements (legacy fallback path)
	const compRes = await mockManager.composeSurfaceElements(
		0,
		"base.png",
		resolvePath,
		0,
		null,
	);
	assert.ok(compRes);

	// 3. composeSurfaceElements with frameLayers and baseCanvasCache hit
	mockManager.baseCanvasCache.set("mock_cache_key", mockBaseCanvas);
	const compFast = await mockManager.composeSurfaceElements(
		0,
		"base.png",
		resolvePath,
		0,
		[{ file: "anim1.png", x: 0, y: 0 }],
	);
	assert.ok(compFast);

	// 4. processChromaKey
	const chromaRes = await mockManager.processChromaKey("image.png", null);
	assert.ok(chromaRes);

	assert.ok(true);
});
