import assert from "node:assert/strict";
import { describe, it } from "vitest";

const calls = [];
globalThis.window = globalThis;
globalThis.__TAURI_INTERNALS__ = {
	transformCallback: () => 0,
	invoke: async (cmd, args) => {
		calls.push({ cmd, args });
		return `mock-data:${cmd}:${args.surfaceId}`;
	},
};

const { ghostSurfaceLoaderMethods } = await import(
	"../ui/js/surface/ghost-surface-loader.js"
);

function createMockGhostController() {
	const gc = Object.create(ghostSurfaceLoaderMethods);
	gc.app = {
		surfaceManager: {
			chromaKeyCache: new Map([["key1", "val1"]]),
			baseCanvasCache: new Map([["key2", "val2"]]),
		},
	};
	return gc;
}

describe("ghost-surface-loader", () => {
	it("loadSurfaceAsset caches asset requests and avoids duplicate invokes", async () => {
		calls.length = 0;
		const gc = createMockGhostController();

		const res1 = await gc.loadSurfaceAsset(
			"load_surface_image",
			"ghost/path",
			"master",
			0,
		);
		const res2 = await gc.loadSurfaceAsset(
			"load_surface_image",
			"ghost/path",
			"master",
			0,
		);

		assert.equal(res1, "mock-data:load_surface_image:0");
		assert.equal(res2, "mock-data:load_surface_image:0");
		assert.equal(calls.length, 1);
		assert.equal(calls[0].cmd, "load_surface_image");
		assert.deepEqual(calls[0].args, {
			ghostPath: "ghost/path",
			shellName: "master",
			surfaceId: "0",
		});
	});

	it("loadSurfaceAsset evicts oldest entries when cache size exceeds 64", async () => {
		calls.length = 0;
		const gc = createMockGhostController();

		// Fill cache with 66 items (surfaceId 0..65)
		for (let i = 0; i <= 65; i++) {
			await gc.loadSurfaceAsset(
				"load_surface_image",
				"ghost/path",
				"master",
				i,
			);
		}

		assert.equal(gc._surfaceAssetCache.size, 64);
		// Oldest entries (0, 1) should have been evicted
		assert.equal(
			gc._surfaceAssetCache.has("load_surface_image|ghost/path|master|0"),
			false,
		);
		assert.equal(
			gc._surfaceAssetCache.has("load_surface_image|ghost/path|master|1"),
			false,
		);
		// Newest entries should be present
		assert.equal(
			gc._surfaceAssetCache.has("load_surface_image|ghost/path|master|65"),
			true,
		);
	});

	it("clearSurfaceAssetCache clears internal cache and surfaceManager caches", async () => {
		const gc = createMockGhostController();
		await gc.loadSurfaceAsset("load_surface_image", "ghost/path", "master", 0);
		assert.equal(gc._surfaceAssetCache.size, 1);
		assert.equal(gc.app.surfaceManager.chromaKeyCache.size, 1);
		assert.equal(gc.app.surfaceManager.baseCanvasCache.size, 1);

		gc.clearSurfaceAssetCache();

		assert.equal(gc._surfaceAssetCache.size, 0);
		assert.equal(gc.app.surfaceManager.chromaKeyCache.size, 0);
		assert.equal(gc.app.surfaceManager.baseCanvasCache.size, 0);
	});

	it("clearSurfaceAssetCache handles optional chaining safely when app or caches are undefined", () => {
		const gc = Object.create(ghostSurfaceLoaderMethods);
		// No _surfaceAssetCache or app attached
		assert.doesNotThrow(() => {
			gc.clearSurfaceAssetCache();
		});
	});
});
