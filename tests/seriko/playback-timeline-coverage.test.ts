import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
	_playOnePat,
	_playTimelineFrames,
} from "../../ui/ts/surface/animation/playback/playback-timeline.js";

describe("SERIKO Playback Timeline Coverage", () => {
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
});
