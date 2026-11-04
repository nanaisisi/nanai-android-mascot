import assert from "node:assert/strict";
import { test } from "vitest";

const { SurfaceManager } = await import("../ui/js/surface/surface-manager.js");

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

	assert.ok(true);
});
