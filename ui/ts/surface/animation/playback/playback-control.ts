/**
 * @file playback-control.js
 * @brief SERIKO アニメーション再生制御・ID指定再生・待機モジュール
 */

import { parseInterval } from "../../animation-parser.js";
import { findAnimation, isBlockedByExclusive } from "../animation-options.js";
import { _playAnimationPatterns } from "./playback-frames.js";

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
 * アニメーションパターンの順次実行
 */
export function playAnimationPatterns(
	this: unknown,
	target: unknown,
	animOrBaseSurfaceId: unknown,
	baseSurfaceIdOrScopeId: unknown,
	scopeIdParam: unknown,
) {
	let instance: unknown,
		anim: unknown,
		baseSurfaceId: unknown,
		scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdParam;
	} else {
		instance = this;
		anim = target;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
	}

	if (!instance) return Promise.resolve();

	const isBlocked = instance.isBlockedByExclusive
		? instance.isBlockedByExclusive(scopeId, anim?.id)
		: isBlockedByExclusive(instance, scopeId, anim?.id);

	if (anim?.id != null && isBlocked) {
		return Promise.resolve();
	}

	const key = `${scopeId}__${baseSurfaceId}__${anim?.id ?? anim?.interval ?? ""}`;
	const running = instance._runningAnimations?.get(key);
	const intervalStr = String(anim?.interval ?? "");
	const { kinds } = parseInterval(intervalStr);
	if (
		running &&
		!kinds.has("runonce") &&
		!kinds.has("yen-e") &&
		!kinds.has("endtalk")
	) {
		return running;
	}
	const playFn = instance._playAnimationPatterns
		? instance._playAnimationPatterns.bind(instance)
		: _playAnimationPatterns.bind(instance);

	const playing = playFn(anim, baseSurfaceId, scopeId, key).finally(() => {
		instance._runningAnimations?.delete(key);
		instance._stoppedAnimations?.delete(key);
	});
	instance._runningAnimations?.set(key, playing);
	return playing;
}

export async function playAnimationById(
	this: unknown,
	target: unknown,
	animIdOrNameOrScopeId: unknown,
	scopeIdOrWaitForComplete: unknown = 0,
	waitForCompleteParam = false,
) {
	let instance: unknown,
		animIdOrName: unknown,
		scopeId: unknown,
		waitForComplete: unknown;
	if (isInstance(target)) {
		instance = target;
		animIdOrName = animIdOrNameOrScopeId;
		scopeId = scopeIdOrWaitForComplete ?? 0;
		waitForComplete = waitForCompleteParam;
	} else {
		instance = this;
		animIdOrName = target;
		scopeId = animIdOrNameOrScopeId ?? 0;
		waitForComplete = scopeIdOrWaitForComplete ?? false;
	}

	if (!instance) return;

	const sid = String(
		instance.manager?.currentSurfaceIdFor
			? instance.manager.currentSurfaceIdFor(scopeId)
			: 0,
	);
	const anim = instance.findAnimation
		? instance.findAnimation(animIdOrName, scopeId)
		: findAnimation(instance, animIdOrName, scopeId);
	if (!anim) return;

	const playFn = instance.playAnimationPatterns
		? instance.playAnimationPatterns.bind(instance)
		: playAnimationPatterns.bind(instance);

	const playPromise = playFn(anim, sid, scopeId);
	if (waitForComplete) {
		await playPromise;
	}
}

/**
 * アニメーション完了まで待機 (\__w[animation,ID])
 * @param {unknown} target
 * @param {number|string} [animIdOrNameOrScopeId]
 * @param {number} [scopeIdParam=0]
 * @param {number} [timeoutMs=30000]
 * @returns {Promise<void>}
 */
export async function waitForAnimation(
	this: unknown,
	target: unknown,
	animIdOrNameOrScopeId: unknown,
	scopeIdParam = 0,
	timeoutMs = 30000,
) {
	let instance: unknown, animIdOrName: unknown, scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		animIdOrName = animIdOrNameOrScopeId;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		animIdOrName = target;
		scopeId = animIdOrNameOrScopeId ?? 0;
	}

	if (!instance) return;

	const anim = instance.findAnimation
		? instance.findAnimation(animIdOrName, scopeId)
		: findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	const currentSurfaceId = instance.manager?.currentSurfaceIdFor
		? instance.manager.currentSurfaceIdFor(scopeId)
		: 0;
	const key = `${scopeId}__${currentSurfaceId}__${id}`;
	const running = instance._runningAnimations?.get(key);
	if (running) {
		await Promise.race([
			running,
			new Promise((resolve) => setTimeout(resolve, timeoutMs)),
		]);
	}
}
