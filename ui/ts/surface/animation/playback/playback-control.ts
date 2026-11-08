/**
 * @file playback-control.js
 * @brief SERIKO アニメーション再生制御・ID指定再生・待機モジュール
 */

import { parseInterval } from "../../animation-parser.js";
import { findAnimation, isBlockedByExclusive } from "../animation-options.js";
import { _playAnimationPatterns } from "./playback-frames.js";

function isInstance(obj: null) {
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
	target: this,
	animOrBaseSurfaceId: unknown,
	baseSurfaceIdOrScopeId: undefined,
	scopeIdParam: undefined,
) {
	let instance, anim, baseSurfaceId, scopeId;
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

	const isBlocked = instance.isBlockedByExclusive
		? instance.isBlockedByExclusive(scopeId, anim?.id)
		: isBlockedByExclusive(instance, scopeId, anim?.id);

	if (anim?.id != null && isBlocked) {
		return Promise.resolve();
	}

	const key = `${scopeId}__${baseSurfaceId}__${anim?.id ?? anim?.interval ?? ""}`;
	const running = instance._runningAnimations.get(key);
	const { kinds } = parseInterval(anim.interval);
	if (
		running &&
		!kinds.has("runonce") &&
		!kinds.has("yen-e") &&
		!kinds.has("endtalk")
	) {
		return running;
	}
	const playFn = instance._playAnimationPatterns
		? (...args: unknown) => instance._playAnimationPatterns(...args)
		: (...args: unknown) => _playAnimationPatterns(instance, ...args);

	const playing = playFn(anim, baseSurfaceId, scopeId, key).finally(() => {
		instance._runningAnimations.delete(key);
		instance._stoppedAnimations.delete(key);
	});
	instance._runningAnimations.set(key, playing);
	return playing;
}

export async function playAnimationById(
	this: unknown,
	target: this | null,
	animIdOrNameOrScopeId: number,
	scopeIdOrWaitForComplete = 0,
	waitForCompleteParam = false,
) {
	let instance, animIdOrName, scopeId, waitForComplete;
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

	const sid = String(instance.manager.currentSurfaceIdFor(scopeId));
	const anim = instance.findAnimation
		? instance.findAnimation(animIdOrName, scopeId)
		: findAnimation(instance, animIdOrName, scopeId);
	if (!anim) return;

	const playFn = instance.playAnimationPatterns
		? (...args: unknown) => instance.playAnimationPatterns(...args)
		: (...args: unknown) => playAnimationPatterns(instance, ...args);

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
	target: this | null,
	animIdOrNameOrScopeId: number,
	scopeIdParam = 0,
	timeoutMs = 30000,
) {
	let instance, animIdOrName, scopeId;
	if (isInstance(target)) {
		instance = target;
		animIdOrName = animIdOrNameOrScopeId;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		animIdOrName = target;
		scopeId = animIdOrNameOrScopeId ?? 0;
	}

	const anim = instance.findAnimation
		? instance.findAnimation(animIdOrName, scopeId)
		: findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	const sid = String(instance.manager.currentSurfaceIdFor(scopeId));
	const key = `${scopeId}__${sid}__${id}`;
	const promise = instance._runningAnimations.get(key);
	if (promise) {
		if (timeoutMs > 0) {
			let timer: ReturnType<typeof setTimeout> | undefined;
			const timeoutPromise = new Promise((resolve) => {
				timer = setTimeout(resolve, timeoutMs);
			});
			try {
				await Promise.race([promise, timeoutPromise]);
			} finally {
				if (timer !== undefined) {
					clearTimeout(timer);
				}
			}
		} else {
			await promise;
		}
	}
}
