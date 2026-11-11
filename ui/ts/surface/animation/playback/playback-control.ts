/**
 * @file playback-control.ts
 * @brief SERIKO アニメーション再生制御・ID指定再生・待機モジュール
 */

import { parseInterval } from "../../animation-parser.js";
import {
	type AnimationInstance,
	findAnimation,
	isBlockedByExclusive,
	isInstance,
} from "../animation-options.js";
import { _playAnimationPatterns } from "./playback-frames.js";

interface AnimationDefinition {
	id?: number;
	interval?: number | string;
	[key: string]: unknown;
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
): Promise<unknown> {
	let instance: AnimationInstance | null = null;
	let anim: AnimationDefinition | null = null;
	let baseSurfaceId: unknown = 0;
	let scopeId: unknown = 0;

	if (isInstance(target)) {
		instance = target;
		anim = animOrBaseSurfaceId as AnimationDefinition;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdParam;
	} else {
		instance = this as AnimationInstance;
		anim = target as AnimationDefinition;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
	}

	if (!instance) return Promise.resolve();

	const isBlocked = instance.isBlockedByExclusive
		? (instance.isBlockedByExclusive as (...args: unknown[]) => boolean)(
				scopeId,
				anim?.id,
			)
		: isBlockedByExclusive(instance, scopeId, anim?.id);

	if (anim?.id != null && isBlocked) {
		return Promise.resolve();
	}

	const runningAnims = instance._runningAnimations as
		| Map<string, Promise<unknown>>
		| undefined;
	const stoppedAnims = instance._stoppedAnimations as Set<string> | undefined;

	const key = `${scopeId}__${baseSurfaceId}__${anim?.id ?? anim?.interval ?? ""}`;
	const running = runningAnims?.get(key);
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
		? (instance._playAnimationPatterns as (
				...args: unknown[]
			) => Promise<unknown>)
		: _playAnimationPatterns;

	const playing = playFn(instance, anim, baseSurfaceId, scopeId, key).finally(
		() => {
			runningAnims?.delete(key);
			stoppedAnims?.delete(key);
		},
	);
	runningAnims?.set(key, playing);
	return playing;
}

export async function playAnimationById(
	this: unknown,
	target: unknown,
	animIdOrNameOrScopeId: unknown,
	scopeIdOrWaitForComplete: unknown = 0,
	waitForCompleteParam = false,
) {
	let instance: AnimationInstance | null = null;
	let animIdOrName: unknown = 0;
	let scopeId: unknown = 0;
	let waitForComplete = false;

	if (isInstance(target)) {
		instance = target;
		animIdOrName = animIdOrNameOrScopeId;
		scopeId = scopeIdOrWaitForComplete ?? 0;
		waitForComplete = Boolean(waitForCompleteParam);
	} else {
		instance = this as AnimationInstance;
		animIdOrName = target;
		scopeId = animIdOrNameOrScopeId ?? 0;
		waitForComplete = Boolean(scopeIdOrWaitForComplete);
	}

	if (!instance) return;

	const sid = String(
		instance.manager?.currentSurfaceIdFor
			? instance.manager.currentSurfaceIdFor(scopeId)
			: 0,
	);
	const anim = instance.findAnimation
		? (
				instance.findAnimation as (
					...args: unknown[]
				) => AnimationDefinition | null
			)(animIdOrName, scopeId)
		: findAnimation(instance, animIdOrName, scopeId);
	if (!anim) return;

	const playFn = instance.playAnimationPatterns
		? (instance.playAnimationPatterns as (
				...args: unknown[]
			) => Promise<unknown>)
		: playAnimationPatterns;

	const playPromise = playFn(instance, anim, sid, scopeId);
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
	let instance: AnimationInstance | null = null;
	let animIdOrName: unknown = 0;
	let scopeId: unknown = 0;

	if (isInstance(target)) {
		instance = target;
		animIdOrName = animIdOrNameOrScopeId;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this as AnimationInstance;
		animIdOrName = target;
		scopeId = animIdOrNameOrScopeId ?? 0;
	}

	if (!instance) return;

	const anim = instance.findAnimation
		? (
				instance.findAnimation as (
					...args: unknown[]
				) => AnimationDefinition | null
			)(animIdOrName, scopeId)
		: findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	const currentSurfaceId = instance.manager?.currentSurfaceIdFor
		? instance.manager.currentSurfaceIdFor(scopeId)
		: 0;
	const key = `${scopeId}__${currentSurfaceId}__${id}`;
	const runningAnims = instance._runningAnimations as
		| Map<string, Promise<unknown>>
		| undefined;
	const running = runningAnims?.get(key);
	if (running) {
		await Promise.race([
			running,
			new Promise((resolve) => setTimeout(resolve, Number(timeoutMs))),
		]);
	}
}
