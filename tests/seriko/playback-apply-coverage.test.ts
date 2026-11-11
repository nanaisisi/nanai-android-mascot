import assert from "node:assert/strict";
import { describe, it } from "vitest";
import {
	pauseAnimation,
	resumeAnimation,
	setAnimationOffset,
} from "../../ui/ts/surface/animation/animation-options.js";
import { _applyAnimationFrame } from "../../ui/ts/surface/animation/playback/playback-apply.js";
import { renderAnimationFrame } from "../../ui/ts/surface/animation/playback/playback-render.js";

describe("SERIKO Playback Apply Coverage", () => {
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
});
