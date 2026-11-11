import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
	clearPausedAnimations,
	findAnimation,
	getAnimationOffset,
	isAnimationPaused,
	isAnimationRunning,
	isBlockedByExclusive,
	parseAnimationOptions,
	pauseAnimation,
	resumeAnimation,
	setAnimationOffset,
	stopAnimation,
} from "../../ui/ts/surface/animation/animation-options.js";
import {
	AnimationScheduler,
	createPlaceholderCanvas,
	FrameStepEvent,
} from "../../ui/ts/surface/animation/scheduler-events.js";

describe("SERIKO Animation Options & Scheduler Coverage", () => {
	it("animation-options covers this-binding, exclusive targets, offsets, and pause/resume", () => {
		const mockInstance = {
			_exclusiveLocks: new Map(),
			_runningAnimations: new Map(),
			_stoppedAnimations: new Set(),
			_animationOffsets: new Map(),
			pausedAnimations: new Map(),
			manager: {
				currentSurfaceIdFor: () => 0,
				animations: {
					0: [
						{ id: 1, name: "blink", option: "exclusive" },
						{ id: 2, option: "background" },
					],
				},
			},
		};

		const opts = parseAnimationOptions([
			"exclusive(1,2)",
			"background",
			"shared-index",
			"exclusive=1+2",
		]);
		assert.ok(opts.isExclusive);
		assert.ok(opts.isBackground);
		assert.ok(opts.isSharedIndex);
		assert.ok(opts.exclusiveTargets.has(1));

		// isBlockedByExclusive with targets (keyed by numeric scopeId)
		mockInstance._exclusiveLocks.set(0, { targets: new Set([5, 6]) });
		assert.equal(isBlockedByExclusive(mockInstance, 0, 5), true);
		assert.equal(isBlockedByExclusive(mockInstance, 0, 7), false);

		// Call via .call(mockInstance) for this-binding coverage
		assert.equal(findAnimation.call(mockInstance, "1", 0).id, 1);
		assert.equal(isAnimationRunning.call(mockInstance, 0, 1), false);
		stopAnimation.call(mockInstance, 0, 1);
		setAnimationOffset.call(mockInstance, 0, 1, 10, 20);
		assert.deepEqual(getAnimationOffset.call(mockInstance, 0, 1), {
			x: 10,
			y: 20,
		});
		pauseAnimation.call(mockInstance, 0, 1);
		assert.equal(isAnimationPaused.call(mockInstance, 0, 1), true);
		resumeAnimation.call(mockInstance, 0, 1);
		assert.equal(isAnimationPaused.call(mockInstance, 0, 1), false);
		clearPausedAnimations.call(mockInstance, 0);
	});

	it("scheduler-events covers FrameStepEvent, AnimationScheduler listener errors, and canvas creation in DOM", () => {
		const ev = new FrameStepEvent({
			scopeId: 0,
			baseSurfaceId: 0,
			animationId: 1,
			pattern: { surface: 10 },
			elapsedMs: 100,
			isFinished: false,
		});

		const scheduler = new AnimationScheduler();
		// Throwing listener to cover catch block
		scheduler.onFrameStep(() => {
			throw new Error("listener test error");
		});
		scheduler.notifyFrameStep(ev);

		// Create canvas in DOM environment
		const canvas = createPlaceholderCanvas(50, 50, "#ff0000");
		assert.ok(canvas);
	});
});
