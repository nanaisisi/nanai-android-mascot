import assert from "node:assert/strict";
import { test } from "vitest";

const { SurfaceFrameBuffer } = await import(
	"../../ui/ts/surface/compositor/framebuffer.js"
);
const { surfaceDressupMethods } = await import(
	"../../ui/ts/surface/surface-dressup.js"
);

test("Canvas Pixel Snapshot Cycle 6: SurfaceFrameBuffer extended blend modes (subtract, divide, overlay, softlight)", () => {
	// 1. Subtract blend mode
	// dst: (100, 150, 200, 255), src: (30, 180, 50, 255)
	// subtract result: max(0, dr - sr) => R: 70, G: 0, B: 150, A: 255
	const dstSub = new SurfaceFrameBuffer(1, 1);
	dstSub.setPixel(0, 0, 100, 150, 200, 255);
	const srcSub = new SurfaceFrameBuffer(1, 1);
	srcSub.setPixel(0, 0, 30, 180, 50, 255);

	dstSub.compositeBuffer(srcSub, 0, 0, "subtract-fast");
	const pSub = dstSub.getPixel(0, 0);
	assert.ok(pSub);
	assert.equal(pSub[0], 70, "R: 100 - 30 = 70");
	assert.equal(pSub[1], 0, "G: 150 - 180 clamped to 0");
	assert.equal(pSub[2], 150, "B: 200 - 50 = 150");
	assert.equal(pSub[3], 255);

	// 2. Divide blend mode (including zero division test)
	// dst: (100, 50, 0, 255), src: (200, 0, 50, 255)
	// divide result: sr === 0 ? 255 : min(255, (dr * 255) / sr)
	// R: (100 * 255) / 200 = 127
	// G: src is 0 => 255
	// B: (0 * 255) / 50 = 0
	const dstDiv = new SurfaceFrameBuffer(1, 1);
	dstDiv.setPixel(0, 0, 100, 50, 0, 255);
	const srcDiv = new SurfaceFrameBuffer(1, 1);
	srcDiv.setPixel(0, 0, 200, 0, 50, 255);

	dstDiv.compositeBuffer(srcDiv, 0, 0, "divide-fast");
	const pDiv = dstDiv.getPixel(0, 0);
	assert.ok(pDiv);
	assert.equal(pDiv[0], 127, "R: divide correctly calculated");
	assert.equal(pDiv[1], 255, "G: zero-division yields 255");
	assert.equal(pDiv[2], 0, "B: 0 / 50 = 0");

	// 3. Overlay blend mode
	// dr < 128: (2 * dr * sr) / 255
	// dr >= 128: 255 - (2 * (255 - dr) * (255 - sr)) / 255
	const dstOvl = new SurfaceFrameBuffer(2, 1);
	dstOvl.setPixel(0, 0, 64, 0, 0, 255); // dr < 128
	dstOvl.setPixel(1, 0, 192, 0, 0, 255); // dr >= 128
	const srcOvl = new SurfaceFrameBuffer(2, 1);
	srcOvl.setPixel(0, 0, 128, 0, 0, 255);
	srcOvl.setPixel(1, 0, 128, 0, 0, 255);

	dstOvl.compositeBuffer(srcOvl, 0, 0, "overlay-fast");
	const pOvl1 = dstOvl.getPixel(0, 0);
	const pOvl2 = dstOvl.getPixel(1, 0);
	// (2 * 64 * 128) / 255 = 64
	assert.equal(pOvl1[0], 64);
	// 255 - (2 * (255 - 192) * (255 - 128)) / 255 = 255 - (2 * 63 * 127) / 255 = 255 - 62 = 193 (approx)
	assert.ok(Math.abs(pOvl2[0] - 192) <= 2);

	// 4. Softlight blend mode
	const dstSoft = new SurfaceFrameBuffer(1, 1);
	dstSoft.setPixel(0, 0, 128, 128, 128, 255);
	const srcSoft = new SurfaceFrameBuffer(1, 1);
	srcSoft.setPixel(0, 0, 128, 128, 128, 255);

	dstSoft.compositeBuffer(srcSoft, 0, 0, "softlight-fast");
	const pSoft = dstSoft.getPixel(0, 0);
	assert.ok(pSoft);
	assert.ok(
		Math.abs(pSoft[0] - 128) <= 2,
		"Neutral softlight preserves midtones",
	);

	dstSub.destroy();
	srcSub.destroy();
	dstDiv.destroy();
	srcDiv.destroy();
	dstOvl.destroy();
	srcOvl.destroy();
	dstSoft.destroy();
	srcSoft.destroy();
});

test("Canvas Pixel Snapshot Cycle 6: SERIKO insert,ID dressup composition and cycle prevention", () => {
	// Mock surface manager instance with surfaceDressupMethods
	const dressupState = new Map();
	dressupState.set("0__clothing__dress", true);
	dressupState.set("0__clothing__ribbon", true);
	dressupState.set("0__clothing__loop", true);

	const mockManager = {
		dressupState,
		currentSurfaceIdFor: () => 0,
		resolveSurfaceNumber: (num) => num,
		shellManifest: {
			sakura_bind_groups: [
				{
					number: 10,
					name: "dress",
					category: "clothing",
					part: "dress",
					add_ids: [],
				},
				{
					number: 20,
					name: "ribbon",
					category: "clothing",
					part: "ribbon",
					add_ids: [],
				},
				{
					number: 30,
					name: "loop",
					category: "clothing",
					part: "loop",
					add_ids: [31],
				},
			],
			kero_bind_groups: [],
		},
		animations: {
			0: [
				// Anim 10: dress inserts 20 (ribbon) then draws surface 101
				{
					id: 10,
					patterns: [
						{ type: "insert", surface: 20, x: 0, y: 0 },
						{ type: "overlay", surface: 101, x: 0, y: 0 },
					],
				},
				// Anim 20: ribbon draws surface 201
				{
					id: 20,
					patterns: [{ type: "overlay", surface: 201, x: 5, y: 5 }],
				},
				// Cyclic animations: 30 inserts 31, 31 inserts 30
				{
					id: 30,
					patterns: [
						{ type: "insert", surface: 31, x: 0, y: 0 },
						{ type: "overlay", surface: 301, x: 0, y: 0 },
					],
				},
				{
					id: 31,
					patterns: [
						{ type: "insert", surface: 30, x: 0, y: 0 },
						{ type: "overlay", surface: 302, x: 0, y: 0 },
					],
				},
			],
		},
		...surfaceDressupMethods,
	};

	const layers = mockManager.activeBindLayers(0, 0);
	assert.ok(Array.isArray(layers));

	// Verification 1: Inserted item (201: ribbon) appears before dress overlay (101)
	const ribbonLayerIdx = layers.findIndex((l) => l.file === "surface201.png");
	const dressLayerIdx = layers.findIndex((l) => l.file === "surface101.png");
	assert.ok(ribbonLayerIdx !== -1, "Ribbon layer should be expanded");
	assert.ok(dressLayerIdx !== -1, "Dress layer should be expanded");
	assert.ok(
		ribbonLayerIdx < dressLayerIdx,
		"Inserted ribbon must be composed before dress overlay",
	);

	// Verification 2: Cycle between 30 and 31 terminates cleanly without maximum call stack error
	const loop301Count = layers.filter((l) => l.file === "surface301.png").length;
	const loop302Count = layers.filter((l) => l.file === "surface302.png").length;
	assert.ok(loop301Count <= 1, "Cyclic anim 301 must not be duplicated");
	assert.ok(loop302Count <= 1, "Cyclic anim 302 must not be duplicated");
});
