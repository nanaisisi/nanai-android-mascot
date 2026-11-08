/**
 * @file playback-timeline.js
 * @brief SERIKO アニメーションタイムライン再生・待機処理モジュール
 */

import { resolvePatternWait } from "../../animation-parser.js";
import { _applyAnimationFrame } from "./playback-apply.js";

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
 * 構築済みタイムラインに沿って各フレームを再生
 */
export async function _playTimelineFrames(
	this: unknown,
	target: any,
	timelineOrAnim: any,
	animOrBaseSurfaceId?: any,
	baseSurfaceIdOrScopeId?: any,
	scopeIdOrKey?: any,
	keyOrOptions?: any,
	optionsParam?: any,
) {
	let instance: any,
		timeline: any,
		_anim: any,
		baseSurfaceId: any,
		scopeId: any,
		key: any,
		options: any;
	if (isInstance(target)) {
		instance = target;
		timeline = timelineOrAnim;
		_anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyOrOptions;
		options = optionsParam || {};
	} else {
		instance = this;
		timeline = target;
		_anim = timelineOrAnim;
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

	for (let i = 0; i < tl.frames.length; i++) {
		if (stoppedAnimations?.has(key)) break;

		const frameItem = tl.frames[i];
		const pat =
			typeof frameItem === "object" && frameItem !== null
				? frameItem.pattern || frameItem
				: _anim?.patterns
					? _anim.patterns.find((p: any) => p.index === i) ||
						_anim.patterns[i] ||
						frameItem
					: frameItem;

		const waitMs = resolveWaitFn
			? resolveWaitFn(pat?.wait || frameItem?.wait)
			: resolvePatternWait(pat?.wait || frameItem?.wait);

		if (waitMs > 0) {
			await new Promise<void>((resolve) => {
				const timerId = setTimeout(resolve, waitMs);
				activeTimers?.set?.(timerId, timerId);
			});
		}

		if (stoppedAnimations?.has(key)) break;

		const result = await applyFn.call(
			inst,
			pat,
			_anim,
			bSurfId,
			sId,
			key,
			() => !stoppedAnimations?.has(key),
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
	target: any,
	patOrAnim: any,
	animOrBaseSurfaceId?: any,
	baseSurfaceIdOrScopeId?: any,
	scopeIdOrKey?: any,
	keyOrIsCurrent?: any,
	isCurrentOrOptions?: any,
	optionsParam?: any,
) {
	let instance: any,
		pat: any,
		_anim: any,
		baseSurfaceId: any,
		scopeId: any,
		key: any,
		isCurrent: any,
		options: any;
	if (isInstance(target)) {
		instance = target;
		pat = patOrAnim;
		_anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyOrIsCurrent;
		isCurrent =
			typeof isCurrentOrOptions === "function"
				? isCurrentOrOptions
				: typeof keyOrIsCurrent === "function"
					? keyOrIsCurrent
					: undefined;
		options = optionsParam || {};
	} else {
		instance = this;
		pat = target;
		_anim = patOrAnim;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
		isCurrent =
			typeof keyOrIsCurrent === "function"
				? keyOrIsCurrent
				: typeof isCurrentOrOptions === "function"
					? isCurrentOrOptions
					: undefined;
		options = isCurrentOrOptions || {};
	}

	const inst = instance || {};
	const p = pat || {};
	const sId = (scopeId ?? 0) as number;
	const bSurfId = baseSurfaceId as string | number;
	const stoppedAnimations = inst._stoppedAnimations;
	const resolveWaitFn = inst.resolvePatternWait;
	const applyFn = inst._applyAnimationFrame || _applyAnimationFrame;

	if (typeof isCurrent === "function" && !isCurrent()) return false;
	if (stoppedAnimations?.has(key)) return false;

	const waitMs = resolveWaitFn
		? resolveWaitFn(p.wait)
		: resolvePatternWait(p.wait);

	if (waitMs > 0) {
		await new Promise<void>((resolve) => {
			setTimeout(resolve, waitMs);
		});
	}

	if (typeof isCurrent === "function" && !isCurrent()) return false;
	if (stoppedAnimations?.has(key)) return false;

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
