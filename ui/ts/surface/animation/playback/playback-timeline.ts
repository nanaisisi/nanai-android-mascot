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
 * @param {unknown} target
 * @param {unknown} timelineOrAnim
 * @param {unknown} animOrBaseSurfaceId
 * @param {unknown} baseSurfaceIdOrScopeId
 * @param {unknown} scopeIdOrKey
 * @param {Record<string, unknown> | undefined} [keyOrOptions]
 * @param {unknown} [optionsParam={}]
 * @returns {Promise<void>}
 */
export async function _playTimelineFrames(
	this: unknown,
	target: unknown,
	timelineOrAnim: unknown,
	animOrBaseSurfaceId: undefined,
	baseSurfaceIdOrScopeId: undefined,
	scopeIdOrKey: undefined,
	keyOrOptions: Record<string, unknown> | undefined,
	_optionsParam = {},
) {
	let instance: unknown,
		timeline: unknown,
		baseSurfaceId: unknown,
		scopeId: unknown,
		key: unknown,
		options: unknown;
	if (isInstance(target)) {
		instance = target;
		timeline = timelineOrAnim;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
		options = keyOrOptions;
	} else {
		instance = this;
		timeline = target;
		baseSurfaceId = timelineOrAnim;
		scopeId = animOrBaseSurfaceId;
		key = baseSurfaceIdOrScopeId;
		options = scopeIdOrKey || {};
	}

	const inst = instance as Record<string, unknown>;
	const tl = timeline as Record<string, unknown>;
	const sId = scopeId as number;
	const bSurfId = baseSurfaceId as string | number;
	const stoppedAnimations = inst._stoppedAnimations as Set<unknown> | undefined;
	const resolveWaitFn = inst.resolvePatternWait as
		| ((w: unknown) => number)
		| undefined;
	const activeTimers = inst.activeAnimationTimers as
		| Map<unknown, unknown>
		| undefined;

	for (const frame of (tl.frames as Array<Record<string, unknown>> | undefined) ||
		[]) {
		if (stoppedAnimations?.has(key)) break;

		const waitMs = resolveWaitFn
			? resolveWaitFn(frame.wait)
			: resolvePatternWait(frame.wait);

		if (waitMs > 0) {
			await new Promise<void>((resolve) => {
				const timerId = setTimeout(resolve, waitMs);
				activeTimers?.set(timerId, timerId);
			});
		}

		if (stoppedAnimations?.has(key)) break;

		_applyAnimationFrame.call(inst, frame, bSurfId, sId, options);
	}
}

/**
 * 単一パターンの再生
 * @param {unknown} target
 * @param {unknown} patOrAnim
 * @param {unknown} animOrBaseSurfaceId
 * @param {unknown} baseSurfaceIdOrScopeId
 * @param {unknown} scopeIdOrKey
 * @param {unknown} keyOrIsCurrent
 * @param {Record<string, unknown> | undefined} [isCurrentOrOptions]
 * @param {unknown} [optionsParam={}]
 * @returns {Promise<boolean>}
 */
export async function _playOnePat(
	this: unknown,
	target: unknown,
	patOrAnim: unknown,
	animOrBaseSurfaceId: undefined,
	baseSurfaceIdOrScopeId: undefined,
	scopeIdOrKey: undefined,
	keyOrIsCurrent: undefined,
	isCurrentOrOptions: Record<string, unknown> | undefined,
	_optionsParam = {},
) {
	let instance: unknown,
		pat: unknown,
		baseSurfaceId: unknown,
		scopeId: unknown,
		key: unknown,
		isCurrent: unknown,
		options: unknown;
	if (isInstance(target)) {
		instance = target;
		pat = patOrAnim;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
		isCurrent = keyOrIsCurrent;
		options = isCurrentOrOptions;
	} else {
		instance = this;
		pat = target;
		baseSurfaceId = patOrAnim;
		scopeId = animOrBaseSurfaceId;
		key = baseSurfaceIdOrScopeId;
		isCurrent = scopeIdOrKey;
		options = keyOrIsCurrent || {};
	}

	const inst = instance as Record<string, unknown>;
	const p = pat as Record<string, unknown>;
	const sId = scopeId as number;
	const bSurfId = baseSurfaceId as string | number;
	const stoppedAnimations = inst._stoppedAnimations as Set<unknown> | undefined;
	const resolveWaitFn = inst.resolvePatternWait as
		| ((w: unknown) => number)
		| undefined;

	if (stoppedAnimations?.has(key)) return false;

	const waitMs = resolveWaitFn
		? resolveWaitFn(p.wait)
		: resolvePatternWait(p.wait);

	if (waitMs > 0) {
		await new Promise<void>((resolve) => {
			setTimeout(resolve, waitMs);
		});
	}

	if (stoppedAnimations?.has(key)) return false;

	_applyAnimationFrame.call(inst, p, bSurfId, sId, options);

	return true;
}
