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

function isInstance(obj: unknown) {
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
 * @param {unknown} target
 * @param {unknown} animOrBaseSurfaceId
 * @param {unknown} baseSurfaceIdOrScopeId
 * @param {unknown} scopeIdOrKey
 * @param {unknown} keyParam
 * @returns {Promise<void>}
 */
export async function _playAnimationPatterns(
	this: unknown,
	target: unknown,
	animOrBaseSurfaceId: unknown,
	baseSurfaceIdOrScopeId: undefined,
	scopeIdOrKey: undefined,
	keyParam: undefined,
) {
	let instance: unknown, anim: unknown, baseSurfaceId: unknown, scopeId: unknown, key: unknown;
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

	if (!anim?.patterns?.length) return;
	const gc = instance?.manager?.app?.ghostController;
	const isCurrent = () =>
		!instance?._stoppedAnimations?.has(key) &&
		String(instance?.manager?.currentSurfaceIdFor?.(scopeId)) ===
			String(baseSurfaceId);

	const parsedOpts = instance?.parseAnimationOptions
		? instance.parseAnimationOptions(anim.options)
		: parseAnimationOptions(anim.options);

	const options = {
		...parsedOpts,
		animId: anim?.id,
	};

	// exclusive オプション処理: 他のアニメーションを停止しロック取得
	if (options.isExclusive) {
		instance?._exclusiveLocks?.set(scopeId, {
			animId: anim.id,
			targets: options.exclusiveTargets,
		});
		if (instance?._runningAnimations) {
			for (const [otherKey] of instance._runningAnimations.entries()) {
				if (otherKey !== key && otherKey.startsWith(`${scopeId}__`)) {
					const otherId = otherKey.split("__")[2];
					if (
						!options.exclusiveTargets ||
						options.exclusiveTargets.has(Number.parseInt(otherId, 10))
					) {
						instance?._stoppedAnimations?.add(otherKey);
					}
				}
			}
		}
	}

	// shared-index 保持判定
	const sharedKey = `${scopeId}__${anim.id}`;
	const startIndex = options.isSharedIndex
		? instance?._sharedIndices?.get(sharedKey) || 0
		: 0;

	const currentOffset = instance?.getAnimationOffset
		? instance.getAnimationOffset(scopeId, anim.id)
		: getAnimationOffset(instance, scopeId, anim.id);

	// アニメーションスケジューラインベント通知 (start)
	const scheduler = instance?.scheduler;
	if (scheduler) {
		scheduler.notifyFrameStep(
			new FrameStepEvent({
				animationId: anim.id,
				scopeId,
				baseSurfaceId,
				pattern: anim.patterns[0],
				patternIndex: 0,
				totalPatterns: anim.patterns.length,
				offsetX: currentOffset.x,
				offsetY: currentOffset.y,
				isBackground: Boolean(options.isBackground),
				isFinished: false,
			}),
		);
	}

	const timeline = await buildAnimationTimeline(anim.patterns);

	try {
		if (timeline?.frames?.length) {
			await _playTimelineFrames.call(
				instance,
				timeline,
				anim,
				baseSurfaceId,
				scopeId,
				key,
				{ startIndex, options },
			);
		} else {
			let idx = startIndex;
			while (idx < anim.patterns.length && isCurrent()) {
				const pat = anim.patterns[idx];
				const stepOffset = instance?.getAnimationOffset
					? instance.getAnimationOffset(scopeId, anim.id)
					: getAnimationOffset(instance, scopeId, anim.id);

				if (scheduler) {
					scheduler.notifyFrameStep(
						new FrameStepEvent({
							animationId: anim.id,
							scopeId,
							baseSurfaceId,
							pattern: pat,
							patternIndex: idx,
							totalPatterns: anim.patterns.length,
							offsetX: stepOffset.x,
							offsetY: stepOffset.y,
							isBackground: Boolean(options.isBackground),
							isFinished: idx === anim.patterns.length - 1,
						}),
					);
				}

				const ok = await _playOnePat.call(
					instance,
					pat,
					anim,
					baseSurfaceId,
					scopeId,
					key,
					isCurrent,
					options,
				);

				if (!ok) break;

				idx++;
				if (options.isSharedIndex) {
					instance?._sharedIndices?.set(sharedKey, idx % anim.patterns.length);
				}
			}
		}
	} finally {
		if (options.isExclusive) {
			instance?._exclusiveLocks?.delete(scopeId);
		}
		if (gc?.updateSurface) {
			gc.updateSurface(baseSurfaceId || 0, scopeId || 0, []);
		}
		if (isCurrent() && gc?.sendShioriEvent) {
			await gc
				.sendShioriEvent("OnAnimationComplete", [
					String(scopeId),
					String(anim.id),
				])
				.catch(() => null);
		}
	}
}
