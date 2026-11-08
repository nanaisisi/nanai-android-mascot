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
	/**
	 * @param {import('./surface.js').SurfaceManager} manager
	 */
	constructor(manager) {
		this.manager = manager;
		/** @type {Record<number, any[]>} */
		this.activeAnimationTimers = {};
		this._spokenCount = {};
		this._talkStarted = {};
		/** @type {Map<string, boolean>} `\![anim,pause,ID]` で一時停止中のアニメーション */
		this.pausedAnimations = new Map();
		/** @type {Map<string, Promise<void>>} 再生中のアニメーション */
		this._runningAnimations = new Map();
		this._stoppedAnimations = new Set();
		/** @type {Map<number, { animId: number|string, targets: Set<number>|null }>} exclusive 排他ロック中のアニメーション (scopeId -> exclusive info) */
		this._exclusiveLocks = new Map();
		/** @type {Map<string, number>} shared-index 保持テーブル (`${scopeId}__${animId}` -> lastPatternIndex) */
		this._sharedIndices = new Map();
		/** @type {Map<string, { x: number, y: number }>} \![anim,offset,ID,x,y] による動的オフセット (`${scopeId}__${animId}`) */
		this._animationOffsets = new Map();
		/** @type {Map<number, { x: number, y: number }>} move 描画メソッドによるベースサーフィス相対位置オフセット */
		this._baseMoveOffsets = new Map();
		/** @type {Map<number, { scaleX: number, scaleY: number }>} scaling 描画メソッドによるベースサーフィス倍率 */
		this._baseScalingOffsets = new Map();
		/** @type {Map<number, boolean>} SERIKO 口パクの有効/無効フラグ (\![set,serikotalk,true/false]) */
		this._serikoTalkEnabled = new Map();
		/** @type {AnimationScheduler} Slot-08 外部インターフェース規約スケジューラ */
		this.scheduler = new AnimationScheduler(this);
	}

	parseAnimationOptions(options = []) {
		return parseAnimationOptions(options);
	}

	isBlockedByExclusive(scopeId = 0, animId) {
		return isBlockedByExclusive(this, scopeId, animId);
	}

	findAnimation(animIdOrName, scopeId = 0) {
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

	isAnimationRunning(scopeId = 0, animIdOrName) {
		return isAnimationRunning(this, scopeId, animIdOrName);
	}

	stopAnimation(scopeId = 0, animIdOrName) {
		return stopAnimation(this, scopeId, animIdOrName);
	}

	setAnimationOffset(scopeId = 0, animIdOrName, x = 0, y = 0) {
		return setAnimationOffset(this, scopeId, animIdOrName, x, y);
	}

	getAnimationOffset(scopeId = 0, animIdOrName) {
		return getAnimationOffset(this, scopeId, animIdOrName);
	}

	pauseAnimation(scopeId = 0, animIdOrName) {
		return pauseAnimation(this, scopeId, animIdOrName);
	}

	resumeAnimation(scopeId = 0, animIdOrName) {
		return resumeAnimation(this, scopeId, animIdOrName);
	}

	isAnimationPaused(scopeId = 0, animIdOrName) {
		return isAnimationPaused(this, scopeId, animIdOrName);
	}

	clearPausedAnimations(scopeId = 0) {
		return clearPausedAnimations(this, scopeId);
	}

	startAnimations(surfaceId, scopeId = 0) {
		surfaceAnimationTimers.startAnimations.call(this, surfaceId, scopeId);
	}

	scheduleAnimation(anim, surfaceId, scopeId) {
		surfaceAnimationTimers.scheduleAnimation.call(
			this,
			anim,
			surfaceId,
			scopeId,
		);
	}

	animationsForTrigger(scopeId, kind) {
		return surfaceAnimationTimers.animationsForTrigger.call(
			this,
			scopeId,
			kind,
		);
	}

	triggerAnimations(scopeId, kind) {
		surfaceAnimationTimers.triggerAnimations.call(this, scopeId, kind);
	}

	playAnimationPatterns(anim, baseSurfaceId, scopeId) {
		return playAnimationPatterns(this, anim, baseSurfaceId, scopeId);
	}

	_playAnimationPatterns(anim, baseSurfaceId, scopeId, key) {
		return _playAnimationPatterns(this, anim, baseSurfaceId, scopeId, key);
	}

	_playTimelineFrames(
		timeline,
		anim,
		baseSurfaceId,
		scopeId,
		key,
		options = {},
	) {
		return _playTimelineFrames(
			this,
			timeline,
			anim,
			baseSurfaceId,
			scopeId,
			key,
			options,
		);
	}

	_applyAnimationFrame(
		pat,
		anim,
		baseSurfaceId,
		scopeId,
		key,
		isCurrent,
		options = {},
	) {
		return _applyAnimationFrame(
			this,
			pat,
			anim,
			baseSurfaceId,
			scopeId,
			key,
			isCurrent,
			options,
		);
	}

	_playOnePat(pat, anim, baseSurfaceId, scopeId, key, isCurrent, options = {}) {
		return _playOnePat(
			this,
			pat,
			anim,
			baseSurfaceId,
			scopeId,
			key,
			isCurrent,
			options,
		);
	}

	renderAnimationFrame(pat, baseSurfaceId, scopeId, animationOptions = {}) {
		return renderAnimationFrame(
			this,
			pat,
			baseSurfaceId,
			scopeId,
			animationOptions,
		);
	}

	playAnimationById(animIdOrName, scopeId = 0, waitForComplete = false) {
		return playAnimationById(this, animIdOrName, scopeId, waitForComplete);
	}

	waitForAnimation(animIdOrName, scopeId = 0, timeoutMs = 30000) {
		return waitForAnimation(this, animIdOrName, scopeId, timeoutMs);
	}

	onTalkStart(scopeId = 0) {
		return onTalkStart(this, scopeId);
	}

	onTalkEnd(scopeId = 0) {
		return onTalkEnd(this, scopeId);
	}

	onScriptEnd(scopeId = 0) {
		return onScriptEnd(this, scopeId);
	}

	onCharSpoken(scopeId = 0) {
		return onCharSpoken(this, scopeId);
	}
}
