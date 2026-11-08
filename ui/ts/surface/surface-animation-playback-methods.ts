import {
	_applyAnimationFrame,
	_playAnimationPatterns,
	_playOnePat,
	_playTimelineFrames,
	onCharSpoken,
	onScriptEnd,
	onTalkEnd,
	onTalkStart,
	playAnimationById,
	playAnimationPatterns,
	waitForAnimation,
} from "./animation/animation-playback.js";

export const surfaceAnimationPlaybackMethods = {
	playAnimationPatterns(
		anim: unknown,
		baseSurfaceId: string | number | undefined,
		scopeId = 0,
		isExclusive = false,
		exclusiveTargets: unknown = null,
	) {
		return playAnimationPatterns.call(
			this,
			anim,
			baseSurfaceId,
			scopeId,
			isExclusive,
			exclusiveTargets,
		);
	},

	playAnimationById(
		animIdOrName: number,
		scopeId = 0,
		waitForCompletion = false,
	) {
		return playAnimationById.call(
			this,
			animIdOrName,
			scopeId,
			waitForCompletion,
		);
	},

	waitForAnimation(animIdOrName: number, scopeId = 0) {
		return waitForAnimation.call(this, animIdOrName, scopeId);
	},

	onTalkStart(scopeId = 0) {
		onTalkStart.call(this, scopeId);
	},

	onTalkEnd(scopeId = 0) {
		onTalkEnd.call(this, scopeId);
	},

	onCharSpoken(scopeId = 0) {
		onCharSpoken.call(this, scopeId);
	},

	onScriptEnd(scopeId = 0) {
		onScriptEnd.call(this, scopeId);
	},

	_playAnimationPatterns(
		anim: unknown,
		baseSurfaceId: unknown,
		scopeId: unknown,
		isExclusive: unknown,
		exclusiveTargets: unknown,
	) {
		return _playAnimationPatterns.call(
			this,
			anim,
			baseSurfaceId,
			scopeId,
			isExclusive,
			exclusiveTargets,
		);
	},

	_playTimelineFrames(
		timeline: unknown,
		baseSurfaceId: unknown,
		scopeId: unknown,
		key: unknown,
		anim: unknown,
	) {
		return _playTimelineFrames.call(
			this,
			timeline,
			baseSurfaceId,
			scopeId,
			key,
			anim,
		);
	},

	_applyAnimationFrame(
		entry: unknown,
		baseSurfaceId: unknown,
		scopeId: unknown,
		anim: unknown,
	) {
		return _applyAnimationFrame.call(
			this,
			entry,
			baseSurfaceId,
			scopeId,
			anim,
		);
	},

	_playOnePat(
		pat: unknown,
		baseSurfaceId: unknown,
		scopeId: unknown,
		anim: unknown,
	) {
		return _playOnePat.call(this, pat, baseSurfaceId, scopeId, anim);
	},
};
