import assert from "node:assert/strict";
import { test, beforeAll } from "vitest";
import { wasmBridge } from "../ui/ts/core/wasm-bridge.js";
import { parseSurfacesTxt } from "../ui/ts/surface/surface-parser.js";

beforeAll(async () => {
	await wasmBridge.init();
});

test("surface-parser Wasm delegation covers parseSurfacesTxt", () => {
	const sampleTxt = `
		// Comment
		surface0-1
		{
			collisionex0,head,rect,10,10,50,50
			collisionex1,circle,c1,20,20,10,10
			collision0,0,0,40,40,bust
			element0,overlay,surface0.png,0,0
		}

		surface2
		{
			0pattern0,6,85,overlay,0,0
		}
	`;

	const parsed = parseSurfacesTxt(sampleTxt);
	assert.ok(parsed);
	assert.ok(parsed.collisions);
	assert.ok(parsed.elements);
});
