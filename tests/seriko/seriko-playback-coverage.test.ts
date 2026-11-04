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
} from "../../ui/js/surface/animation/animation-options.js";
import { _applyAnimationFrame } from "../../ui/js/surface/animation/playback/playback-apply.js";
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
import { renderAnimationFrame } from "../../ui/js/surface/animation/playback/playback-render.js";
import {
	_playOnePat,
	_playTimelineFrames,
} from "../../ui/js/surface/animation/playback/playback-timeline.js";
import {
	AnimationScheduler,
	createPlaceholderCanvas,
	FrameStepEvent,
} from "../../ui/js/surface/animation/scheduler-events.js";

describe("SERIKO Playback Timeline & Apply Coverage", () => {
	it("_playTimelineFrames supports direct calling and this-binding with early returns and completions", async () => {
		// Early return on empty patterns or timeline
		await _playTimelineFrames({}, {}, {});
		await _playTimelineFrames({}, { patterns: [] }, { frames: [] });

		const frameApplied = [];
		const mockInstance = {
			_stoppedAnimations: new Set(),
			manager: {
				currentSurfaceIdFor: (_scope) => 0,
			},
			_applyAnimationFrame: async (pat) => {
				frameApplied.push(pat.index);
				return pat.index !== 2; // return false on index 2 to test break
			},
		};

		const anim = {
			patterns: [
				{ index: 1, surface: 10 },
				{ index: 0, surface: 11 },
				{ index: 2, surface: 12 },
				{ index: 3, surface: 13 },
			],
		};
		const timeline = { frames: [0, 5, 10, 15] };

		// Target as instance
		await _playTimelineFrames(mockInstance, timeline, anim, 0, 0, "0:0:1", {});
		assert.deepEqual(frameApplied, [0, 1, 2]);

		// Test target as timeline with this context and _applyAnimationFrame fallback
		const ctx = {
			_stoppedAnimations: new Set(["stoppedKey"]),
			manager: {
				currentSurfaceIdFor: () => 0,
			},
		};
		// stopped key returns early
		await _playTimelineFrames.call(ctx, timeline, anim, 0, 0, "stoppedKey", {});

		// Surface change returns early
		const ctxSurfaceMismatch = {
			_stoppedAnimations: new Set(),
			manager: {
				currentSurfaceIdFor: () => 999,
			},
		};
		await _playTimelineFrames.call(
			ctxSurfaceMismatch,
			timeline,
			anim,
			0,
			0,
			"validKey",
			{},
		);
	});

	it("_playOnePat handles target as instance and this context", async () => {
		const mockInstance = {
			manager: {
				currentSurfaceIdFor: () => 0,
				app: { ghostController: {} },
			},
			_applyAnimationFrame: async () => true,
		};
		const res1 = await _playOnePat(
			mockInstance,
			{ wait: "0", surface: 10 },
			{},
			0,
			0,
			"key",
			() => true,
			{},
		);
		assert.equal(res1, true);

		// Fallback when isCurrent is false
		const res2 = await _playOnePat(
			mockInstance,
			{ wait: "5", surface: 10 },
			{},
			0,
			0,
			"key",
			() => false,
			{},
		);
		assert.equal(res2, false);

		// Call with this context
		const ctx = {
			_applyAnimationFrame: async () => true,
		};
		const res3 = await _playOnePat.call(
			ctx,
			{ wait: "0", surface: 10 },
			{},
			0,
			0,
			"key",
			() => true,
			{},
		);
		assert.equal(res3, true);

		// Call with this context without _applyAnimationFrame (without gc it returns false)
		const ctxNoApply = {
			manager: { currentSurfaceIdFor: () => 0 },
		};
		const res4 = await _playOnePat.call(
			ctxNoApply,
			{ wait: "0", surface: -1 },
			{},
			0,
			0,
			"key",
			() => true,
			{},
		);
		assert.equal(res4, false);
	});

	it("_applyAnimationFrame covers control patterns, sound, offsets, and rendering", async () => {
		const frames = [];
		const mockInstance = {
			pausedAnimations: new Map(),
			_animationOffsets: new Map(),
			manager: {
				currentSurfaceIdFor: () => 0,
				resolveSurfaceNumber: (id) => id,
				app: {
					ghostController: {
						updateSurface: async (...args) => frames.push(args),
					},
				},
			},
			playAnimationById: async () => {},
			stopAnimation: () => {},
			_runningAnimations: new Map(),
			_exclusiveLocks: new Map(),
		};

		// Control pattern start
		let resCtrl = await _applyAnimationFrame(
			mockInstance,
			{ method: "start", args: [100] },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);
		assert.equal(resCtrl, true);

		// Control pattern stop
		resCtrl = await _applyAnimationFrame(
			mockInstance,
			{ method: "stop", args: [100] },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);
		assert.equal(resCtrl, true);

		// Control pattern parallelstart / parallelstop / alternativestart / alternativestop
		await _applyAnimationFrame(
			mockInstance,
			{ method: "parallelstart", args: [101, 102] },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);
		await _applyAnimationFrame(
			mockInstance,
			{ method: "parallelstop", args: [101, 102] },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);
		await _applyAnimationFrame(
			mockInstance,
			{ method: "alternativestart", args: [103] },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);
		await _applyAnimationFrame(
			mockInstance,
			{ method: "alternativestop", args: [103] },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);

		// Sound pattern
		await _applyAnimationFrame(
			mockInstance,
			{ method: "sound", sound: "test.wav" },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);

		// Standard surface frame render with dynamic offset
		setAnimationOffset(mockInstance, 0, 1, 10, 20);
		await _applyAnimationFrame(
			mockInstance,
			{ surface: 10, offsetx: 5, offsety: 10, method: "overlay" },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);

		// Surface -1 (clear overlay)
		await _applyAnimationFrame(
			mockInstance,
			{ surface: -1 },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);

		// BaseSurfaceId is -1 -> render returns false
		const resNeg = await renderAnimationFrame(
			mockInstance,
			{ surface: 10 },
			-1,
			0,
			{},
		);
		assert.equal(resNeg, false);

		// Test alternative/parallel with actual targetIds
		await _applyAnimationFrame(
			mockInstance,
			{ type: "alternativestart(1,2)" },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);
		await _applyAnimationFrame(
			mockInstance,
			{ type: "alternativestop(1,2)" },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);
		await _applyAnimationFrame(
			mockInstance,
			{ type: "parallelstart(1,2)" },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);
		await _applyAnimationFrame(
			mockInstance,
			{ type: "parallelstop(1,2)" },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);

		// Test pause check loop in _applyAnimationFrame
		pauseAnimation(mockInstance, 0, 1);
		const _checks = 0;
		setTimeout(() => {
			resumeAnimation(mockInstance, 0, 1);
		}, 130);
		await _applyAnimationFrame(
			mockInstance,
			{ surface: -1 },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);

		// Test calling _applyAnimationFrame via .call(this)
		await _applyAnimationFrame.call(
			mockInstance,
			{ surface: -1 },
			{ id: 1 },
			0,
			0,
			"key",
			() => true,
			{},
		);
	});

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
