/**
 * @file layer-composition.test.ts
 * @brief レイヤー合成・クロマキー処理・要素合成テスト (processChromaKey, drawLayer, composeSurfaceElements)
 */

import assert from "node:assert/strict";
import { test } from "vitest";
import { setupSurfaceCompositorMockEnv } from "./helpers.js";

setupSurfaceCompositorMockEnv();

const { processChromaKey, drawImageLayer, drawLayer, composeSurfaceElements } =
	await import("../../ui/js/surface/surface-compositor.js");

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

	// 3b. processChromaKey with useSelfAlpha: bypasses chromakeying
	const selfAlphaRes = await processChromaKey("selfalpha.png", null, cache, {
		useSelfAlpha: true,
	});
	assert.equal(selfAlphaRes, "selfalpha.png");

	// 4. drawLayer & drawImageLayer
	const mockCtx = {
		globalCompositeOperation: "source-over",
		drawImage() {},
		clearRect() {},
		putImageData() {},
		getImageData: () => ({
			data: new Uint8Array([0, 255, 0, 255, 255, 255, 255, 255]),
		}),
	};
	const resolvePath = async (f: string) => (f ? `resolved_${f}` : null);
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
	await drawLayer(mockCtx, "interpolate.png", resolvePath, 0, 0, "interpolate");
	await drawLayer(mockCtx, "reduce.png", resolvePath, 0, 0, "reduce");
	await drawLayer(
		mockCtx,
		"overlaymul.png",
		resolvePath,
		0,
		0,
		"overlaymultiply",
	);
	await drawLayer(
		mockCtx,
		"overlayscreen.png",
		resolvePath,
		0,
		0,
		"overlayscreen",
	);
	await drawLayer(mockCtx, "", resolvePath, 0, 0, "overlay");

	const mockImg = new globalThis.Image();
	drawImageLayer(mockCtx, mockImg, 0, 0, "interpolate");
	drawImageLayer(mockCtx, null, 0, 0);

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
