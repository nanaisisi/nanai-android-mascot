import assert from "node:assert/strict";
import { test } from "vitest";

const { surfaceDressupMethods } = await import("../ui/js/surface/surface-dressup.js");

test("surfaceDressupMethods covers bindDressup, activeBindLayers, plans, and cache", async () => {
	const eventsSent = [];
	const mockManager = {
		...surfaceDressupMethods,
		dressupState: new Map(),
		app: {
			ghostController: {
				updateSurface: async () => {},
				sendShioriEvent: async (ev, args) => { eventsSent.push({ ev, args }); },
				currentGhost: { name: "TestGhost" },
				currentShell: "master",
			},
		},
		currentSurfaceIdFor() { return 0; },
		shellManifest: {
			sakura_bind_groups: [
				{ number: 100, category: "hat", part: "ribbon", add_ids: [101] },
			],
		},
		animations: {
			"0": [
				{ id: 100, patterns: [{ surface: 10, x: 0, y: 0, method: "Overlay" }] },
				{ id: 101, patterns: [{ surface: 11, x: 5, y: 5, method: "Add" }] },
			],
		},
		resolveSurfaceNumber(s) { return s; },
		planCache: new Map(),
	};

	// 1. bindDressup with explicit status "1"
	await mockManager.bindDressup("hat", "ribbon", "1", 0, true);
	assert.equal(mockManager.dressupState.get("0__hat__ribbon"), true);
	assert.ok(eventsSent.some(e => e.ev === "OnDressupChanged"));

	// 2. bindDressup toggle to false ("0")
	await mockManager.bindDressup("hat", "ribbon", "0", 0, true);
	assert.equal(mockManager.dressupState.get("0__hat__ribbon"), false);

	// 3. activeBindLayers & activeBindAnimationIds (when active)
	mockManager.dressupState.set("0__hat__ribbon", true);
	const layers = mockManager.activeBindLayers(0, 0);
	assert.ok(Array.isArray(layers));

	const ids = mockManager.activeBindAnimationIds(0);
	assert.ok(ids.includes(100));

	// 4. planCacheKey
	const cacheKey = mockManager.planCacheKey(0, 0);
	assert.ok(cacheKey.includes("0__0__"));

	// 5. getCompositionPlan (non-Tauri vs Tauri success vs Tauri cache hit)
	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	const planNoTauri = await mockManager.getCompositionPlan(0, 0);
	assert.equal(planNoTauri, null);

	globalThis.__TAURI_INTERNALS__ = {
		invoke: async (cmd, args) => {
			if (cmd === "surface_composition_plan") {
				return {
					layers: [
						{ Element: { file: "base.png", x: 0, y: 0, method: "Base" } },
						{ Pattern: { surface: 10, x: 0, y: 0, method: "Overlay" } },
					],
				};
			}
		},
		transformCallback: (cb) => cb,
	};
	globalThis.window = globalThis;

	const plan = await mockManager.getCompositionPlan(0, 0);
	assert.ok(plan);

	// Test cache hit
	const planCached = await mockManager.getCompositionPlan(0, 0);
	assert.deepEqual(planCached, plan);

	// 6. planToRenderLayers
	const renderLayers = mockManager.planToRenderLayers(plan, 0);
	assert.ok(renderLayers);
	assert.equal(renderLayers.elements.length, 1);
	assert.equal(renderLayers.bindLayers.length, 1);

	// Test invalid plan without element
	assert.equal(mockManager.planToRenderLayers({ layers: [] }, 0), null);

	// Test invoke error
	globalThis.__TAURI_INTERNALS__.invoke = async () => { throw new Error("fail"); };
	mockManager.planCache.clear();
	assert.equal(await mockManager.getCompositionPlan(0, 0), null);

	delete globalThis.__TAURI_INTERNALS__;
	assert.ok(true);
});
