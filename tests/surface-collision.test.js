import assert from "node:assert/strict";
import { test } from "vitest";

const { surfaceCollisionMethods } = await import(
	"../ui/js/surface/surface-collision.js"
);

test("surfaceCollisionMethods covers resolveSurfaceNumber and detectCollision", async () => {
	const mockManager = {
		...surfaceCollisionMethods,
		aliases: {
			smile: [1, 2],
			SMILE: [1, 2],
		},
		keroAliases: {
			normal: [10],
		},
		currentSurfaceIdFor(scopeId) {
			return scopeId === 1 ? 10 : 0;
		},
		baseWidth: 200,
		baseHeight: 400,
		collisions: {
			0: [{ name: "head", shape: "rect", x1: 0, y1: 0, x2: 100, y2: 100 }],
			default: [],
		},
	};

	// 1. resolveSurfaceNumber
	assert.equal(mockManager.resolveSurfaceNumber(5), 5);
	assert.equal(mockManager.resolveSurfaceNumber("10"), "10");
	assert.equal(mockManager.resolveSurfaceNumber(""), "");
	assert.equal(mockManager.resolveSurfaceNumber(null), null);
	assert.equal(mockManager.resolveSurfaceNumber("unknown"), "unknown");

	const resolvedSmile = mockManager.resolveSurfaceNumber("smile", 0);
	assert.ok(["1", "2"].includes(String(resolvedSmile)));

	const resolvedCase = mockManager.resolveSurfaceNumber("SMILE", 0);
	assert.ok(["1", "2"].includes(String(resolvedCase)));

	const resolvedKero = mockManager.resolveSurfaceNumber("normal", 1);
	assert.equal(resolvedKero, "10");

	// 2. detectCollision
	const rect = { left: 0, top: 0, width: 200, height: 400 };
	// clickX = 50 (relX = 0.25 -> canvasX = 50), clickY = 50 (relY = 0.125 -> canvasY = 50)
	const hit = mockManager.detectCollision(50, 50, rect, 0, 0);
	assert.equal(hit.name, "head");
	assert.equal(hit.canvasX, 50);
	assert.equal(hit.canvasY, 50);

	// Miss collision
	const miss = mockManager.detectCollision(180, 380, rect, 0, 0);
	assert.equal(miss.name, "");

	// Detect with currentSurfaceIdFor (surfaceId = null)
	const hitDefault = mockManager.detectCollision(50, 50, rect, null, 0);
	assert.equal(hitDefault.name, "head");

	assert.ok(true);
});
