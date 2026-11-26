import assert from "node:assert/strict";
import { test } from "vitest";
import { ghostSurfaceLoaderMethods } from "../ui/ts/surface/ghost-surface-loader.js";

test("loadSurfaceAsset evicts rejected promises so subsequent loads retry", async () => {
	const g = globalThis as unknown as Record<string, unknown>;
	const origWindow = g.window;
	const origTauri = g.__TAURI_INTERNALS__;
	let attempts = 0;
	g.window = globalThis;
	g.__TAURI_INTERNALS__ = {
		invoke: async () => {
			attempts += 1;
			if (attempts === 1) {
				throw new Error("transient load failure");
			}
			return "data:image/png;base64,AAAA";
		},
		transformCallback: (cb: unknown) => cb,
	};

	const chromaKeyCache = new Map<string, string>([["k", "v"]]);
	const host = {
		...ghostSurfaceLoaderMethods,
		app: {
			surfaceManager: {
				chromaKeyCache,
			},
		},
	};

	try {
		await assert.rejects(
			() => host.loadSurfaceAsset("load_surface_image", "/ghost", "master", 0),
			/transient load failure/,
		);
		const retryResult = await host.loadSurfaceAsset(
			"load_surface_image",
			"/ghost",
			"master",
			0,
		);
		assert.equal(retryResult, "data:image/png;base64,AAAA");
		assert.equal(attempts, 2);

		host.clearSurfaceAssetCache();
		assert.equal(chromaKeyCache.size, 0);
	} finally {
		if (origWindow === undefined) {
			delete g.window;
		} else {
			g.window = origWindow;
		}
		if (origTauri === undefined) {
			delete g.__TAURI_INTERNALS__;
		} else {
			g.__TAURI_INTERNALS__ = origTauri;
		}
	}
});
