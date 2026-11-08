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
	baseSurfaceIdOrScopeId: undefined,
	scopeIdParam: undefined,
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

	const inst = instance as Record<string, unknown>;
	const an = anim as Record<string, unknown>;
	const isBlockedFn = inst.isBlockedByExclusive as ((scope: unknown, id: unknown) => boolean) | undefined;
	const isBlocked = isBlockedFn
		? isBlockedFn(scopeId, an?.id)
		: isBlockedByExclusive(inst, scopeId, an?.id);

	if (an?.id != null && isBlocked) {
		return Promise.resolve();
	}

	const key = `${scopeId}__${baseSurfaceId}__${an?.id ?? an?.interval ?? ""}`;
	const runningAnimations = inst._runningAnimations as Map<string, Promise<unknown>> | undefined;
	const running = runningAnimations?.get(key);
	const intervalStr = String(an.interval ?? "");
	const { kinds } = parseInterval(intervalStr);
	if (
		running &&
		!kinds.has("runonce") &&
		!kinds.has("yen-e") &&
		!kinds.has("endtalk")
	) {
		return running;
	}
	const customPlay = inst._playAnimationPatterns as ((...args: unknown[]) => Promise<unknown>) | undefined;
	const playFn = customPlay
		? (...args: unknown[]) => customPlay(...args)
		: (...args: unknown[]) => _playAnimationPatterns(inst, ...args);

	const playing = playFn(anim, baseSurfaceId, scopeId, key).finally(() => {
		runningAnimations?.delete(key);
		const stoppedAnimations = inst._stoppedAnimations as Set<string> | undefined;
		stoppedAnimations?.delete(key);
	});
	runningAnimations?.set(key, playing);
	return playing;
}

export async function playAnimationById(
	this: unknown,
	target: unknown | null,
	animIdOrNameOrScopeId: number,
	scopeIdOrWaitForComplete = 0,
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

	const inst = instance as Record<string, unknown>;
	const manager = inst.manager as Record<string, unknown> | undefined;
	const currentSurfaceIdFor = manager?.currentSurfaceIdFor as ((sid: number) => unknown) | undefined;
	const sid = String(currentSurfaceIdFor ? currentSurfaceIdFor(scopeId as number) : 0);
	const findAnimationFn = inst.findAnimation as ((name: unknown, scope: unknown) => Record<string, unknown> | undefined) | undefined;
	const anim = findAnimationFn
		? findAnimationFn(animIdOrName, scopeId)
		: findAnimation(inst, animIdOrName, scopeId);
	if (!anim) return;

	const playPatterns = inst.playAnimationPatterns as ((...args: unknown[]) => Promise<unknown>) | undefined;
	const playFn = playPatterns
		? (...args: unknown[]) => playPatterns(...args)
		: (...args: unknown[]) => playAnimationPatterns(inst, ...args);

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
	target: unknown | null,
	animIdOrNameOrScopeId: number,
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

	const inst = instance as Record<string, unknown>;
	const manager = inst.manager as Record<string, unknown> | undefined;
	const currentSurfaceIdFor = manager?.currentSurfaceIdFor as ((sid: unknown) => unknown) | undefined;
	const findAnimationFn = inst.findAnimation as ((name: unknown, scope: unknown) => Record<string, unknown> | undefined) | undefined;
	const anim = findAnimationFn
		? findAnimationFn(animIdOrName, scopeId)
		: findAnimation(inst, animIdOrName, scopeId);
	const an = anim as Record<string, unknown> | undefined;
	const id = an ? an.id : animIdOrName;
	const key = `${scopeId}__${currentSurfaceIdFor ? currentSurfaceIdFor(scopeId) : 0}__${id}`;
	const runningAnimations = inst._runningAnimations as Map<string, Promise<unknown>> | undefined;
	const running = runningAnimations?.get(key);
	if (running) {
		await Promise.race([
			running,
			new Promise((resolve) => setTimeout(resolve, timeoutMs)),
		]);
	}
}
