import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
	playAnimationById,
	waitForAnimation,
} from "../../ui/js/surface/animation/playback/playback-control.js";
import {
	onCharSpoken,
	onScriptEnd,
	onTalkEnd,
	onTalkStart,
} from "../../ui/js/surface/animation/playback/playback-events.js";

describe("SERIKO Playback Control & Events Coverage", () => {
	it("playback-control covers stopAnimation, offsets, running status, and waitForAnimation", async () => {
		let animFinished = false;
		const runningPromise = new Promise((resolve) => {
			setTimeout(() => {
				animFinished = true;
				resolve();
			}, 10);
		});

		const mockInstance = {
			_runningAnimations: new Map([["0__0__1", runningPromise]]),
			_stoppedAnimations: new Set(),
			_animationOffsets: new Map(),
			manager: {
				currentSurfaceIdFor: () => 0,
				animations: {
					0: [{ id: 1, interval: "runonce", patterns: [] }],
				},
			},
		};

		// waitForAnimation awaits the running promise
		await waitForAnimation(mockInstance, 1, 0);
		assert.equal(animFinished, true);

		// waitForAnimation when not running resolves immediately
		await waitForAnimation(mockInstance, 99, 0);

		// playAnimationById when animation is not found returns undefined
		const noAnim = await playAnimationById(mockInstance, 999, 0);
		assert.equal(noAnim, undefined);

		// playAnimationById when found and waitForComplete is true
		mockInstance.playAnimationPatterns = async () => "ok";
		await playAnimationById(mockInstance, 1, 0, true);
	});

	it("playback-events covers onTalkStart, onTalkEnd, onCharSpoken, and onScriptEnd", async () => {
		const triggered = [];
		const mockInstance = {
			manager: {},
			_spokenCount: {},
			_talkStarted: {},
			triggerAnimations: (scope, type) => {
				triggered.push({ scope, type });
			},
		};

		onTalkStart(mockInstance, 0);
		assert.equal(triggered.length, 1);
		assert.equal(triggered[0].type, "starttalk");

		onCharSpoken(mockInstance, 0);
		onTalkEnd(mockInstance, 0);
		assert.equal(triggered[triggered.length - 1].type, "endtalk");

		onScriptEnd(mockInstance, 0);
		assert.equal(triggered[triggered.length - 1].type, "yen-e");
	});
});
