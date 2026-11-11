import assert from "node:assert/strict";
import { test } from "vitest";
import { SurfaceAnimationManager } from "../ui/ts/surface/surface-animation-manager.js";

const deferred = () => {
	let resolve: ((value?: unknown) => void) | undefined;
	const promise = new Promise((r) => {
		resolve = r;
	});
	return { promise, resolve };
};

test("talk animation does not start overlapping sequences per scope", async () => {
	const pending = deferred();
	const calls: unknown[] = [];
	const manager = {
		animations: {
			0: [{ id: 1, interval: "talk,1", patterns: [{ surface: 1, wait: 1 }] }],
		},
		currentSurfaceIdFor: () => 0,
		resolveSurfaceNumber: (id: unknown) => id,
		app: {
			ghostController: {
				updateSurface: async (...args: unknown[]) => {
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
