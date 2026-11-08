/**
 * @file playback-frames.js
 * @brief SERIKO アニメーションフレーム描画・タイムライン再生処理 (統括モジュール)
 */

import { buildAnimationTimeline } from "../../animation-parser.js";
import {
	getAnimationOffset,
	parseAnimationOptions,
} from "../animation-options.js";
import { FrameStepEvent } from "../scheduler-events.js";
import { _playOnePat, _playTimelineFrames } from "./playback-timeline.js";

// 外部互換性のための再エクスポート
export { _applyAnimationFrame } from "./playback-apply.js";
export { renderAnimationFrame } from "./playback-render.js";
export { _playOnePat, _playTimelineFrames } from "./playback-timeline.js";

function isInstance(obj) {
	return (
		obj !== null &&
		typeof obj === "object" &&
		("manager" in obj ||
			"_runningAnimations" in obj ||
			"_exclusiveLocks" in obj ||
			"activeAnimationTimers" in obj)
	);
}

/**
 * SERIKO アニメーションパターンの全体実行（排他ロック、shared-index、タイムライン/単体再生、完了通知）
 * @param {any} target
 * @param {any} animOrBaseSurfaceId
 * @param {any} baseSurfaceIdOrScopeId
 * @param {any} scopeIdOrKey
 * @param {any} keyParam
 * @returns {Promise<void>}
 */
export async function _playAnimationPatterns(
	target,
	animOrBaseSurfaceId,
	baseSurfaceIdOrScopeId,
	scopeIdOrKey,
	keyParam,
) {
	let _instance: unknown,
		_anim: unknown,
		_baseSurfaceId: unknown,
		_scopeId: unknown,
		_key: unknown;

	// biome-ignore lint/suspicious/noImplicitAnyLet: automated fix
	let instance, anim, baseSurfaceId, scopeId, key;

	if (isInstance(target)) {
		instance = target;
		anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyParam;
	} else {
		instance = this;
		anim = target;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
	}

	if (!anim.patterns?.length) return;
	const gc = instance.manager.app?.ghostController;
	if (!gc) return;
	const isCurrent = () =>
		!instance._stoppedAnimations.has(key) &&
		String(instance.manager.currentSurfaceIdFor(scopeId)) ===
			String(baseSurfaceId);

	const parsedOpts = instance.parseAnimationOptions
		? instance.parseAnimationOptions(anim.options)
		: parseAnimationOptions(anim.options);

	const options = {
		...parsedOpts,
		animId: anim.id,
	};

	// exclusive オプション処理: 他のアニメーションを停止しロック取得
	if (options.isExclusive) {
		instance._exclusiveLocks.set(scopeId, {
			animId: anim.id,
			targets: options.exclusiveTargets,
		});
		for (const [otherKey] of instance._runningAnimations.entries()) {
			if (otherKey !== key && otherKey.startsWith(`${scopeId}__`)) {
				const otherId = otherKey.split("__")[2];
				if (
					!options.exclusiveTargets ||
					options.exclusiveTargets.has(Number.parseInt(otherId, 10))
				) {
					instance._stoppedAnimations.add(otherKey);
				}
			}
		}
	}

	// shared-index 保持判定
	const sharedKey = `${scopeId}__${anim.id}`;
	const startIndex = options.isSharedIndex
		? instance._sharedIndices.get(sharedKey) || 0
		: 0;

	const currentOffset = instance.getAnimationOffset
		? instance.getAnimationOffset(scopeId, anim.id)
		: getAnimationOffset(instance, scopeId, anim.id);

	instance.scheduler?.notifyFrameStep(
		new FrameStepEvent({
			scopeId,
			baseSurfaceId,
			animationId: anim?.id ?? 0,
			pattern: anim.patterns[startIndex] || anim.patterns[0],
			elapsedMs: 0,
			isFinished: false,
			isBackground: options.isBackground,
			offsetX: currentOffset.x,
			offsetY: currentOffset.y,
		}),
	);

	const patternsToPlay =
		startIndex > 0 && startIndex < anim.patterns.length
			? anim.patterns.slice(startIndex)
			: anim.patterns;

	const timeline = await buildAnimationTimeline(patternsToPlay);
	let finalPatternIndex = 0;
	if (timeline) {
		const playFramesFn = instance._playTimelineFrames
			? (...args) => instance._playTimelineFrames(...args)
			: (...args) => _playTimelineFrames(instance, ...args);
		await playFramesFn(timeline, anim, baseSurfaceId, scopeId, key, options);
	} else {
		for (let i = 0; i < patternsToPlay.length; i++) {
			const pat = patternsToPlay[i];
			finalPatternIndex = startIndex + i;
			if (options.isSharedIndex) {
				instance._sharedIndices.set(sharedKey, finalPatternIndex);
			}
			const playOneFn = instance._playOnePat
				? (...args) => instance._playOnePat(...args)
				: (...args) => _playOnePat(instance, ...args);
			const cont = await playOneFn(
				pat,
				anim,
				baseSurfaceId,
				scopeId,
				key,
				isCurrent,
				options,
			);
			if (!cont) break;
		}
	}

	if (
		String(instance.manager.currentSurfaceIdFor(scopeId)) ===
		String(baseSurfaceId)
	) {
		await gc.updateSurface(baseSurfaceId, scopeId, []);
	}

	if (options.isExclusive) {
		if (instance._exclusiveLocks.get(scopeId)?.animId === anim.id) {
			instance._exclusiveLocks.delete(scopeId);
		}
	}

	instance.scheduler?.notifyFrameStep(
		new FrameStepEvent({
			scopeId,
			baseSurfaceId,
			animationId: anim?.id ?? 0,
			pattern: anim.patterns[anim.patterns.length - 1],
			elapsedMs: Date.now(),
			isFinished: true,
			isBackground: options.isBackground,
			offsetX: currentOffset.x,
			offsetY: currentOffset.y,
		}),
	);
}
