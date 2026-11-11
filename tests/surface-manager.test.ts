import assert from "node:assert/strict";
import { test } from "vitest";

const { SurfaceManager } = await import("../ui/ts/surface/surface-manager.js");

test("SurfaceManager initialization, surface ID getters/setters, and animation delegation", () => {
	const mockApp = {};
	const manager = new SurfaceManager(mockApp);

	// 1. Initial surface IDs
	assert.equal(manager.currentSurfaceId, 0);
	assert.equal(manager.currentSurfaceIdFor(0), 0);
	assert.equal(manager.currentSurfaceIdFor(1), 10);
	assert.equal(manager.currentSurfaceIdFor(2), 0); // default fallback

	// 2. setSurfaceId
	manager.setSurfaceId(100, 0);
	assert.equal(manager.currentSurfaceId, 100);
	assert.equal(manager.currentSurfaceIdFor(0), 100);

	manager.setSurfaceId(200, 1);
	assert.equal(manager.currentSurfaceIdFor(1), 200);

	// 3. Animation delegation methods
	manager.stopAnimations(0);
	manager.startAnimations(100, 0);
	manager.pauseAnimationById(10, 0);
	manager.resumeAnimationById(10, 0);
	manager.onTalkEnd(0);

	// 4. isBindAnimationActive
	manager.shellManifest = {
		sakura_bind_groups: [
			{
				number: 10,
				category: "clothes",
				part: "ribbon",
				default: true,
				add_ids: [11],
			},
		],
		kero_bind_groups: [],
	};
	assert.equal(manager.isBindAnimationActive(0, 10), false);
	manager.dressupState.set("0__clothes__ribbon", true);
	(manager as unknown)._activeBindAnimationIdsCache = undefined;
	assert.equal(manager.isBindAnimationActive(0, 10), true);
	assert.equal(manager.isBindAnimationActive(0, 11), true);
	assert.equal(manager.isBindAnimationActive(0, 99), false);
	manager.dressupState.set("0__clothes__ribbon", false);
	(manager as unknown)._activeBindAnimationIdsCache = undefined;
	assert.equal(manager.isBindAnimationActive(0, 10), false);

	assert.ok(true);
});
