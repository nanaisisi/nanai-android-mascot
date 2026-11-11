/**
 * @file surface-animation-manager.js
 * @brief SERIKO アニメーションおよび発話口パク管理クラス (ファサードおよび後方互換 re-export)
 */

import {
	clearPausedAnimations,
	findAnimation,
	getActiveAnimationCount,
	getActiveAnimations,
	getActiveCollisions,
	getAnimationOffset,
	isAnimationPaused,
	isAnimationRunning,
	isBlockedByExclusive,
	parseAnimationOptions,
	pauseAnimation,
	resumeAnimation,
	setAnimationOffset,
	stopAnimation,
} from "./animation/animation-options.js";
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
	renderAnimationFrame,
	waitForAnimation,
} from "./animation/animation-playback.js";
import {
	AnimationScheduler,
	createPlaceholderCanvas,
	FrameStepEvent,
} from "./animation/scheduler-events.js";
import {
	buildAnimationTimeline,
	parseInterval,
	resolvePatternWait,
} from "./animation-parser.js";
import { surfaceAnimationPlaybackMethods } from "./surface-animation-playback-methods.js";
import { surfaceAnimationTimers } from "./surface-animation-timers.js";

// Re-export helper functions for backwards compatibility
export {
	_applyAnimationFrame,
	_playAnimationPatterns,
	_playOnePat,
	_playTimelineFrames,
	AnimationScheduler,
	buildAnimationTimeline,
	clearPausedAnimations,
	createPlaceholderCanvas,
	FrameStepEvent,
	findAnimation,
	getActiveAnimationCount,
	getActiveAnimations,
	getActiveCollisions,
	getAnimationOffset,
	isAnimationPaused,
	isAnimationRunning,
	isBlockedByExclusive,
	onCharSpoken,
	onScriptEnd,
	onTalkEnd,
	onTalkStart,
	parseAnimationOptions,
	parseInterval,
	pauseAnimation,
	playAnimationById,
	playAnimationPatterns,
	renderAnimationFrame,
	resolvePatternWait,
	resumeAnimation,
	setAnimationOffset,
	stopAnimation,
	waitForAnimation,
};

export class SurfaceAnimationManager {
	playAnimationPatterns(
		_anim: unknown,
		_baseSurfaceId: string | number,
		_scopeId: number,
	) {
		throw new Error("Method not implemented.");
	}
	playAnimationById(
		_animId: string | number,
		_scopeId: number,
		_waitForComplete: boolean,
	) {
		throw new Error("Method not implemented.");
	}
	waitForAnimation(_animId: string | number, _scopeId: number) {
		throw new Error("Method not implemented.");
	}
	onTalkEnd(_scopeId: number) {
		throw new Error("Method not implemented.");
	}
	onScriptEnd(_scopeId: number) {
		throw new Error("Method not implemented.");
	}
	onCharSpoken(_scopeId: number) {
		throw new Error("Method not implemented.");
	}
	activeAnimationTimers: unknown;
	manager: unknown;
	_spokenCount: unknown;
	_talkStarted: unknown;
	pausedAnimations: Map<unknown, unknown>;
	_runningAnimations: Map<unknown, unknown>;
	_stoppedAnimations: Set<unknown>;
	_exclusiveLocks: Map<unknown, unknown>;
	_sharedIndices: Map<unknown, unknown>;
	_animationOffsets: Map<unknown, unknown>;
	_baseMoveOffsets: Map<unknown, unknown>;
	_baseScalingOffsets: Map<unknown, unknown>;
	_serikoTalkEnabled: Map<unknown, unknown>;
	scheduler: AnimationScheduler;

	constructor(manager: unknown) {
		this.manager = manager;
		this.activeAnimationTimers = {};
		this._spokenCount = {};
		this._talkStarted = {};
		this.pausedAnimations = new Map();
		this._runningAnimations = new Map();
		this._stoppedAnimations = new Set();
		this._exclusiveLocks = new Map();
		this._sharedIndices = new Map();
		this._animationOffsets = new Map();
		this._baseMoveOffsets = new Map();
		this._baseScalingOffsets = new Map();
		this._serikoTalkEnabled = new Map();
		this.scheduler = new AnimationScheduler(this);

		Object.assign(this, surfaceAnimationPlaybackMethods);
	}

	parseAnimationOptions(options = []) {
		return parseAnimationOptions(options);
	}

	isBlockedByExclusive(scopeId = 0, animId: unknown) {
		return isBlockedByExclusive(this, scopeId, animId);
	}

	findAnimation(animIdOrName: number, scopeId = 0) {
		return findAnimation(this, animIdOrName, scopeId);
	}

	stopAnimations(scopeId = 0) {
		surfaceAnimationTimers.stopAnimations.call(this, scopeId);
		for (const key of [...this._animationOffsets.keys()]) {
			if (key.startsWith(`${scopeId}__`)) {
				this._animationOffsets.delete(key);
			}
		}
		this._baseMoveOffsets.delete(scopeId);
		this._baseScalingOffsets.delete(scopeId);
	}

	setBaseScalingOffset(scopeId = 0, scaleX = 100, scaleY = 100) {
		this._baseScalingOffsets.set(scopeId, { scaleX, scaleY });
	}

	getBaseScalingOffset(scopeId = 0) {
		return (
			this._baseScalingOffsets.get(scopeId) || { scaleX: 100, scaleY: 100 }
		);
	}

	setSerikoTalkEnabled(scopeId = 0, enabled = true) {
		this._serikoTalkEnabled.set(scopeId, enabled);
	}

	isSerikoTalkEnabled(scopeId = 0) {
		return this._serikoTalkEnabled.get(scopeId) ?? true;
	}

	setBaseMoveOffset(scopeId = 0, x = 0, y = 0) {
		this._baseMoveOffsets.set(scopeId, { x, y });
	}

	getBaseMoveOffset(scopeId = 0) {
		return this._baseMoveOffsets.get(scopeId) || { x: 0, y: 0 };
	}

	getActiveAnimationCount(scopeId = 0) {
		return getActiveAnimationCount(this, scopeId);
	}

	getActiveAnimations(scopeId = 0) {
		return getActiveAnimations(this, scopeId);
	}

	getActiveCollisions(scopeId = 0) {
		return getActiveCollisions(this, scopeId);
	}

	isAnimationRunning(scopeId = 0, animIdOrName: unknown) {
		return isAnimationRunning(this, scopeId, animIdOrName);
	}

	stopAnimation(scopeId = 0, animIdOrName: string | number | undefined) {
		return stopAnimation(this, scopeId, animIdOrName);
	}

	setAnimationOffset(scopeId = 0, animIdOrName: number, x = 0, y = 0) {
		return setAnimationOffset(this, scopeId, animIdOrName, x, y);
	}

	getAnimationOffset(scopeId = 0, animIdOrName: unknown) {
		return getAnimationOffset(this, scopeId, animIdOrName);
	}

	pauseAnimation(scopeId = 0, animIdOrName: unknown) {
		return pauseAnimation(this, scopeId, animIdOrName);
	}

	resumeAnimation(scopeId = 0, animIdOrName: unknown) {
		return resumeAnimation(this, scopeId, animIdOrName);
	}

	isAnimationPaused(scopeId = 0, animIdOrName: unknown) {
		return isAnimationPaused(this, scopeId, animIdOrName);
	}

	clearPausedAnimations(scopeId = 0) {
		return clearPausedAnimations(this, scopeId);
	}

	startAnimations(surfaceId: string | number, scopeId = 0) {
		surfaceAnimationTimers.startAnimations.call(this, surfaceId, scopeId);
	}

	scheduleAnimation(anim: unknown, surfaceId: unknown, scopeId: unknown) {
		surfaceAnimationTimers.scheduleAnimation.call(
			this,
			anim,
			surfaceId,
			scopeId,
		);
	}

	animationsForTrigger(scopeId: unknown, kind: unknown) {
		return surfaceAnimationTimers.animationsForTrigger.call(
			this,
			scopeId,
			kind,
		);
	}

	triggerAnimations(scopeId: unknown, kind: unknown) {
		surfaceAnimationTimers.triggerAnimations.call(this, scopeId, kind);
	}
}

// Inherit playback methods on prototype as well for prototype lookup
Object.assign(
	SurfaceAnimationManager.prototype,
	surfaceAnimationPlaybackMethods,
);
