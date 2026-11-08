/**
 * @file playback-timeline.js
 * @brief SERIKO アニメーションタイムライン再生・待機処理モジュール
 */

import { resolvePatternWait } from "../../animation-parser.js";
import { _applyAnimationFrame } from "./playback-apply.js";

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
 * 構築済みタイムラインに沿って各フレームを再生
 * @param {any} target
 * @param {any} timelineOrAnim
 * @param {any} animOrBaseSurfaceId
 * @param {any} baseSurfaceIdOrScopeId
 * @param {any} scopeIdOrKey
 * @param {any} [keyOrOptions]
 * @param {any} [optionsParam={}]
 * @returns {Promise<void>}
 */
export async function _playTimelineFrames(
	target,
	timelineOrAnim,
	animOrBaseSurfaceId,
	baseSurfaceIdOrScopeId,
	scopeIdOrKey,
	keyOrOptions,
	optionsParam = {},
) {
	let _instance: unknown,
		_timeline: unknown,
		_anim: unknown,
		_baseSurfaceId: unknown,
		_scopeId: unknown,
		_key: unknown,
		_options: unknown;

	let instance, timeline, anim, baseSurfaceId, scopeId, key, options;

	if (isInstance(target)) {
		instance = target;
		timeline = timelineOrAnim;
		anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyOrOptions;
		options = optionsParam;
	} else {
		instance = this;
		timeline = target;
		anim = timelineOrAnim;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
		options = keyOrOptions || {};
	}

	if (!anim.patterns?.length || !timeline?.frames?.length) return;
	const isCurrent = () =>
		!instance._stoppedAnimations.has(key) &&
		String(instance.manager.currentSurfaceIdFor(scopeId)) ===
			String(baseSurfaceId);

	const pending = anim.patterns
		.slice()
		.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
	let prevAt = 0;
	for (let i = 0; i < pending.length && i < timeline.frames.length; i++) {
		const pat = pending[i];
		const at = timeline.frames[i] ?? prevAt;
		const dwell = Math.max(at - prevAt, 0);
		if (dwell > 0) await new Promise((r) => setTimeout(r, dwell));
		if (!isCurrent()) return;
		prevAt = at;

		const applyFn = instance._applyAnimationFrame
			? (...args) => instance._applyAnimationFrame(...args)
			: (...args) => _applyAnimationFrame(instance, ...args);

		const cont = await applyFn(
			pat,
			anim,
			baseSurfaceId,
			scopeId,
			key,
			isCurrent,
			options,
		);
		if (!cont) return;
	}
}

/**
 * 単一パターンの待機時間解決とフレーム適用
 * @param {any} target
 * @param {any} patOrAnim
 * @param {any} animOrBaseSurfaceId
 * @param {any} baseSurfaceIdOrScopeId
 * @param {any} scopeIdOrKey
 * @param {any} keyOrIsCurrent
 * @param {any} [isCurrentOrOptions]
 * @param {any} [optionsParam={}]
 * @returns {Promise<boolean>}
 */
export async function _playOnePat(
	target,
	patOrAnim,
	animOrBaseSurfaceId,
	baseSurfaceIdOrScopeId,
	scopeIdOrKey,
	keyOrIsCurrent,
	isCurrentOrOptions,
	optionsParam = {},
) {
	let _instance: unknown,
		_pat: unknown,
		_anim: unknown,
		_baseSurfaceId: unknown,
		_scopeId: unknown,
		_key: unknown,
		_isCurrent: unknown,
		_options: unknown;

	let instance, pat, anim, baseSurfaceId, scopeId, key, isCurrent, options;

	if (isInstance(target)) {
		instance = target;
		pat = patOrAnim;
		anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyOrIsCurrent;
		isCurrent = isCurrentOrOptions;
		options = optionsParam;
	} else {
		instance = this;
		pat = target;
		anim = patOrAnim;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
		isCurrent = keyOrIsCurrent;
		options = isCurrentOrOptions || {};
	}

	const waitMs = resolvePatternWait(pat.wait);
	if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
	if (!isCurrent()) return false;
	const applyFn = instance._applyAnimationFrame
		? (...args) => instance._applyAnimationFrame(...args)
		: (...args) => _applyAnimationFrame(instance, ...args);
	return await applyFn(
		pat,
		anim,
		baseSurfaceId,
		scopeId,
		key,
		isCurrent,
		options,
	);
}
