/**
 * @file playback-frames.ts
 * @brief SERIKO アニメーションフレーム描画・タイムライン再生処理 (統括モジュール)
 */

import { buildAnimationTimeline } from "../../animation-parser.js";
import {
	getAnimationOffset,
	parseAnimationOptions,
} from "../animation-options.js";
import {
	type AnimationInstance,
	isInstance,
} from "../animation-options-parser.js";
import { FrameStepEvent } from "../scheduler-events.js";
import { _playOnePat, _playTimelineFrames } from "./playback-timeline.js";

// 外部互換性のための再エクスポート
export { _applyAnimationFrame } from "./playback-apply.js";
export { renderAnimationFrame } from "./playback-render.js";
export { _playOnePat, _playTimelineFrames } from "./playback-timeline.js";

interface AnimationDef {
	id?: number;
	patterns?: Array<{ wait?: unknown; [key: string]: unknown }>;
	options?: unknown;
	interval?: unknown;
	[key: string]: unknown;
}

/**
 * SERIKO アニメーションパターンの全体実行（排他ロック、shared-index、タイムライン/単体再生、完了通知）
 */
export async function _playAnimationPatterns(
	this: unknown,
	target: unknown,
	animOrBaseSurfaceId: unknown,
	baseSurfaceIdOrScopeId?: unknown,
	scopeIdOrKey?: unknown,
	keyParam?: unknown,
) {
	let instance: AnimationInstance | null = null;
	let anim: AnimationDef | null = null;
	let baseSurfaceId: unknown = 0;
	let scopeId: unknown = 0;
	let key: unknown = "";

	if (isInstance(target)) {
		instance = target;
		anim = animOrBaseSurfaceId as AnimationDef;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyParam;
	} else {
		instance = this as AnimationInstance;
		anim = target as AnimationDef;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
	}

	if (!anim?.patterns?.length) return;
	const gc = (
		instance?.manager?.app as {
			ghostController?: {
				updateSurface?: (
					b: unknown,
					s: unknown,
					layers: unknown[],
				) => Promise<unknown>;
				sendShioriEvent?: (event: string, args: unknown[]) => Promise<unknown>;
				[key: string]: unknown;
			};
		}
	)?.ghostController;

	const isCurrent = () =>
		!instance?._stoppedAnimations?.has(key as string) &&
		String(instance?.manager?.currentSurfaceIdFor?.(scopeId)) ===
			String(baseSurfaceId);

	const parsedOpts = instance?.parseAnimationOptions
		? (
				instance.parseAnimationOptions as (...args: unknown[]) => {
					isExclusive?: boolean;
					exclusiveTargets?: Set<number>;
					isBackground?: boolean;
					isSharedIndex?: boolean;
					[key: string]: unknown;
				}
			)(anim.options)
		: parseAnimationOptions(anim.options);

	const options: {
		isExclusive?: boolean;
		exclusiveTargets?: Set<number>;
		isBackground?: boolean;
		isSharedIndex?: boolean;
		animId?: number;
		[key: string]: unknown;
	} = {
		...(parsedOpts as object),
		animId: anim?.id,
	};

	// exclusive オプション処理: 他のアニメーションを停止しロック取得
	if (options.isExclusive) {
		instance?._exclusiveLocks?.set(scopeId, {
			animId: anim.id,
			targets: options.exclusiveTargets,
		});
		if (instance?._runningAnimations) {
			for (const [otherKey] of (
				instance._runningAnimations as Map<string, unknown>
			).entries()) {
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
		? (instance?._sharedIndices?.get(sharedKey) as number) || 0
		: 0;

	const currentOffset = instance?.getAnimationOffset
		? ((instance.getAnimationOffset as (...args: unknown[]) => unknown)(
				scopeId,
				anim.id,
			) as { x?: number; y?: number } | undefined)
		: (getAnimationOffset(instance, scopeId, anim.id) as
				| { x?: number; y?: number }
				| undefined);

	// アニメーションスケジューラインベント通知 (start)
	const scheduler = instance?.scheduler;
	if (scheduler?.notifyFrameStep && anim.patterns[0]) {
		scheduler.notifyFrameStep(
			new FrameStepEvent({
				animationId: anim.id,
				scopeId,
				baseSurfaceId,
				pattern: anim.patterns[0],
				patternIndex: 0,
				totalPatterns: anim.patterns.length,
				offsetX: currentOffset?.x ?? 0,
				offsetY: currentOffset?.y ?? 0,
				elapsedMs: 0,
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
		} else if (anim.patterns) {
			let idx = startIndex;
			while (idx < anim.patterns.length && isCurrent()) {
				const pat = anim.patterns[idx];
				const stepOffset = instance?.getAnimationOffset
					? ((instance.getAnimationOffset as (...args: unknown[]) => unknown)(
							scopeId,
							anim.id,
						) as { x?: number; y?: number } | undefined)
					: (getAnimationOffset(instance, scopeId, anim.id) as
							| { x?: number; y?: number }
							| undefined);

				if (scheduler?.notifyFrameStep && pat) {
					scheduler.notifyFrameStep(
						new FrameStepEvent({
							animationId: anim.id,
							scopeId,
							baseSurfaceId,
							pattern: pat,
							patternIndex: idx,
							totalPatterns: anim.patterns.length,
							offsetX: stepOffset?.x ?? 0,
							offsetY: stepOffset?.y ?? 0,
							elapsedMs: 0,
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
				if (options.isSharedIndex && anim.patterns.length > 0) {
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
		if (isCurrent() && gc?.sendShioriEvent && anim.id != null) {
			await gc
				.sendShioriEvent("OnAnimationComplete", [
					String(scopeId),
					String(anim.id),
				])
				.catch(() => null);
		}
	}
}
