/**
 * @file playback-timeline.ts
 * @brief SERIKO アニメーションタイムライン再生・待機処理モジュール
 */

import { resolvePatternWait } from "../../animation-parser.js";
import {
	type AnimationInstance,
	isInstance,
} from "../animation-options-parser.js";
import { _applyAnimationFrame } from "./playback-apply.js";

interface AnimationTimeline {
	frames?: Array<
		number | { pattern?: unknown; wait?: unknown; [key: string]: unknown }
	>;
	patterns?: Array<{
		index?: number;
		wait?: unknown;
		[key: string]: unknown;
	}>;
	[key: string]: unknown;
}

interface AnimationDefinition {
	patterns?: Array<{
		index?: number;
		wait?: unknown;
		[key: string]: unknown;
	}>;
	[key: string]: unknown;
}

/**
 * 構築済みタイムラインに沿って各フレームを再生
 */
export async function _playTimelineFrames(
	this: unknown,
	target: unknown,
	timelineOrAnim: unknown,
	animOrBaseSurfaceId?: unknown,
	baseSurfaceIdOrScopeId?: unknown,
	scopeIdOrKey?: unknown,
	keyOrOptions?: unknown,
	optionsParam?: unknown,
) {
	let instance: AnimationInstance | null = null;
	let timeline: AnimationTimeline | null = null;
	let _anim: AnimationDefinition | null = null;
	let baseSurfaceId: unknown = 0;
	let scopeId: unknown = 0;
	let key: unknown = "";
	let options: unknown = {};

	if (isInstance(target)) {
		instance = target;
		timeline = timelineOrAnim as AnimationTimeline;
		_anim = animOrBaseSurfaceId as AnimationDefinition;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyOrOptions;
		options = optionsParam || {};
	} else {
		instance = this as AnimationInstance;
		timeline = target as AnimationTimeline;
		_anim = timelineOrAnim as AnimationDefinition;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
		options = keyOrOptions || {};
	}

	const inst = instance || {};
	const tl = timeline || {};
	const sId = (scopeId ?? 0) as number;
	const bSurfId = baseSurfaceId as string | number;
	const stoppedAnimations = inst._stoppedAnimations;
	const resolveWaitFn = inst.resolvePatternWait;
	const activeTimers = inst.activeAnimationTimers;
	const applyFn = inst._applyAnimationFrame || _applyAnimationFrame;

	if (!tl.frames?.length) return;

	let prevAt = 0;
	for (let i = 0; i < tl.frames.length; i++) {
		if (stoppedAnimations?.has(key as string)) break;

		const frameItem = tl.frames[i];
		const pat =
			typeof frameItem === "object" && frameItem !== null
				? (frameItem as { pattern?: unknown; wait?: unknown }).pattern ||
					frameItem
				: _anim?.patterns
					? _anim.patterns.find((p) => p.index === i) ||
						_anim.patterns[i] ||
						frameItem
					: frameItem;

		let waitMs = 0;
		if (typeof frameItem === "number") {
			waitMs = Math.max(frameItem - prevAt, 0);
			prevAt = frameItem;
		} else {
			const waitVal =
				(frameItem as { wait?: unknown })?.wait ||
				(pat as { wait?: unknown })?.wait;
			waitMs = resolveWaitFn
				? resolveWaitFn(waitVal)
				: resolvePatternWait(waitVal);
		}

		if (waitMs > 0) {
			await new Promise<void>((resolve) => {
				const timerId = setTimeout(resolve, waitMs);
				activeTimers?.set(timerId, timerId);
			});
		}

		if (stoppedAnimations?.has(key as string)) break;

		const result = await applyFn.call(
			inst,
			pat,
			_anim,
			bSurfId,
			sId,
			key,
			() => !stoppedAnimations?.has(key as string),
			options,
		);
		if (result === false) break;
	}
}

/**
 * 単一パターンの再生
 */
export async function _playOnePat(
	this: unknown,
	target: unknown,
	patOrAnim: unknown,
	animOrBaseSurfaceId?: unknown,
	baseSurfaceIdOrScopeId?: unknown,
	scopeIdOrKey?: unknown,
	keyOrIsCurrent?: unknown,
	isCurrentOrOptions?: unknown,
	optionsParam?: unknown,
) {
	let instance: AnimationInstance | null = null;
	let pat: unknown = null;
	let _anim: AnimationDefinition | null = null;
	let baseSurfaceId: unknown = 0;
	let scopeId: unknown = 0;
	let key: unknown = "";
	let isCurrent: (() => boolean) | undefined;
	let options: unknown = {};

	if (isInstance(target)) {
		instance = target;
		pat = patOrAnim;
		_anim = animOrBaseSurfaceId as AnimationDefinition;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyOrIsCurrent;
		isCurrent =
			typeof isCurrentOrOptions === "function"
				? (isCurrentOrOptions as () => boolean)
				: typeof keyOrIsCurrent === "function"
					? (keyOrIsCurrent as () => boolean)
					: undefined;
		options = optionsParam || {};
	} else {
		instance = this as AnimationInstance;
		pat = target;
		_anim = patOrAnim as AnimationDefinition;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
		isCurrent =
			typeof keyOrIsCurrent === "function"
				? (keyOrIsCurrent as () => boolean)
				: typeof isCurrentOrOptions === "function"
					? (isCurrentOrOptions as () => boolean)
					: undefined;
		options = isCurrentOrOptions || {};
	}

	const inst = instance || {};
	const p = (pat || {}) as { wait?: unknown; [key: string]: unknown };
	const sId = (scopeId ?? 0) as number;
	const bSurfId = baseSurfaceId as string | number;
	const stoppedAnimations = inst._stoppedAnimations;
	const resolveWaitFn = inst.resolvePatternWait;
	const applyFn = inst._applyAnimationFrame || _applyAnimationFrame;

	if (typeof isCurrent === "function" && !isCurrent()) return false;
	if (stoppedAnimations?.has(key as string)) return false;

	const waitMs = resolveWaitFn
		? resolveWaitFn(p.wait)
		: resolvePatternWait(p.wait);

	if (waitMs > 0) {
		await new Promise<void>((resolve) => {
			setTimeout(resolve, waitMs);
		});
	}

	if (typeof isCurrent === "function" && !isCurrent()) return false;
	if (stoppedAnimations?.has(key as string)) return false;

	const result = await applyFn.call(
		inst,
		p,
		_anim,
		bSurfId,
		sId,
		key,
		isCurrent,
		options,
	);

	return result !== false;
}
