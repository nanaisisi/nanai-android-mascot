import assert from "node:assert/strict";
import { test } from "vitest";
import { SurfaceAnimationManager } from "../ui/js/surface/surface-animation-manager.js";

const deferred = () => {
	let resolve;
	const promise = new Promise((r) => {
		resolve = r;
	});
	return { promise, resolve };
};

test("talk animation does not start overlapping sequences per scope", async () => {
	const pending = deferred();
	let calls = 0;
	const manager = {
		animations: {
			0: [{ id: 1, interval: "talk,1", patterns: [{ surface: 1, wait: 1 }] }],
		},
		currentSurfaceIdFor: () => 0,
		resolveSurfaceNumber: (id) => id,
		app: {
			ghostController: {
				updateSurface: async () => {
					calls++;
					await pending.promise;
				},
			},
		},
	};
	const animation = new SurfaceAnimationManager(manager);
	animation.onCharSpoken(0);
	animation.onCharSpoken(0);
	await new Promise((r) => setTimeout(r, 20));
	assert.equal(calls, 1);
	pending.resolve();
	await new Promise((r) => setTimeout(r, 80));
	const before = calls;
	animation.onCharSpoken(0);
	await new Promise((r) => setTimeout(r, 20));
	assert.equal(calls, before + 2); // 新しい口パク 1 コマ + ベース復帰
});

test("animation frame waits for surface composition before advancing", async () => {
	const pending = deferred();
	const calls = [];
	const manager = {
		currentSurfaceIdFor: () => 0,
		resolveSurfaceNumber: (id) => id,
		app: {
			ghostController: {
				updateSurface: async (...args) => {
					calls.push(args);
					if (args[2]) await pending.promise;
				},
			},
		},
	};
	const animation = new SurfaceAnimationManager(manager);
	const playing = animation.playAnimationPatterns(
		{ patterns: [{ surface: 1, wait: 1 }] },
		0,
		0,
	);
	await new Promise((r) => setTimeout(r, 80));
	assert.equal(calls.length, 1);
	pending.resolve();
	await playing;
	assert.equal(calls.length, 2);
	assert.deepEqual(calls[1], [0, 0, []]);
});
