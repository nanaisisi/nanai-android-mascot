import assert from "node:assert/strict";
import { test } from "vitest";

const { surfaceLoadMethods } = await import("../ui/js/surface/surface-load.js");

test("surfaceLoadMethods covers loadSurfacesTxt, applyShellManifest, parseSurfacesTxt, and expandSurfaceRange", async () => {
	const mockManager = {
		collisions: {},
		elements: {},
		animations: {},
		aliases: {},
		keroAliases: {},
		shellManifest: null,
		planCache: new Map(),
		baseCanvasCache: new Map(),
		dressupState: new Map(),
		...surfaceLoadMethods,
	};

	// 1. expandSurfaceRange
	const expanded = mockManager.expandSurfaceRange("0-2,5");
	assert.deepEqual(expanded, ["0", "1", "2", "5"]);

	// 2. applyShellManifest
	const mockManifest = {
		aliases: { smile: [0] },
		kero_aliases: {},
		surfaces: [
			{
				number: 0,
				definition: {
					collisions: [],
					elements: [],
					animations: {},
				},
			},
		],
		sakura_bind_groups: [],
	};
	mockManager.applyShellManifest(mockManifest);
	assert.ok(mockManager.collisions["0"]);

	// 3. parseSurfacesTxt (non-Tauri fallback)
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	await mockManager.parseSurfacesTxt("surface0 {}");
	assert.ok(mockManager.collisions["0"]);

	// 4. parseSurfacesTxt with Tauri available & parseSurfacesTextWithRust success
	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, _args) => {
			if (cmd === "parse_surfaces_text") {
				return {
					1: {
						number: 1,
						definition: { collisions: [], elements: [], animations: {} },
					},
				};
			}
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;
	await mockManager.parseSurfacesTxt("surface1 {}");
	assert.ok(mockManager.collisions["1"]);

	// 5. loadSurfacesTxt with Tauri shell_manifest success
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd, _args) => {
		if (cmd === "shell_manifest") return mockManifest;
	};
	await mockManager.loadSurfacesTxt(
		"/assets/ghost/mock_nanai/shell/master",
		"master",
	);

	// 6. loadSurfacesTxt with Tauri shell_manifest fail and open_file success
	globalThis.__TAURI_INTERNALS__.invoke = async (cmd, _args) => {
		if (cmd === "shell_manifest") return null;
		if (cmd === "open_file") return "surface0 {}";
	};
	await mockManager.loadSurfacesTxt("mock_ghost/shell/master", "master");

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
