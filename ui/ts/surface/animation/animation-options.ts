/**
 * @file animation-options.js
 * @brief SERIKO アニメーションオプション解析・排他制御・検索・操作ユーティリティ
 */

import { surfaceAnimationTimers } from "../surface-animation-timers.js";
import { findAnimation, isInstance } from "./animation-options-parser.js";

export {
	findAnimation,
	isBlockedByExclusive,
	isInstance,
	parseAnimationOptions,
} from "./animation-options-parser.js";

/**
 * 指定アニメーションが再生中かどうか判定
 */
export function isAnimationRunning(
	this: unknown,
	target: unknown = 0,
	scopeIdOrAnimId: unknown = 0,
	animIdOrNameParam: unknown = undefined,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	} else {
		return false;
	}

	if (!instance._runningAnimations) return false;
	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	const prefix = `${scopeId}__`;
	for (const [key] of instance._runningAnimations.entries()) {
		if (key.startsWith(prefix)) {
			const parts = key.split("__");
			if (parts[2] === String(id) && !instance._stoppedAnimations?.has(key)) {
				return true;
			}
		}
	}
	return false;
}

/**
 * 特定のアニメーションのみ停止 (\![anim,stop,ID] / \![anim,clear,ID])
 */
export function stopAnimation(
	this: unknown,
	target: unknown = 0,
	scopeIdOrAnimId: unknown = 0,
	animIdOrNameParam: unknown = undefined,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	} else {
		return;
	}

	if (!instance._runningAnimations) return;
	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	const prefix = `${scopeId}__`;
	for (const key of instance._runningAnimations.keys()) {
		if (key.startsWith(prefix)) {
			const parts = key.split("__");
			if (parts[2] === String(id)) {
				instance._stoppedAnimations?.add(key);
			}
		}
	}
}

/**
 * アニメーションの動的オフセット設定 (\![anim,offset,ID,x,y])
 */
export function setAnimationOffset(
	this: unknown,
	target: unknown = 0,
	scopeIdOrAnimId: unknown = 0,
	animIdOrNameOrX: unknown = 0,
	xOrY = 0,
	yParam = 0,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown, x: unknown, y: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameOrX;
		x = xOrY ?? 0;
		y = yParam ?? 0;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
		x = animIdOrNameOrX ?? 0;
		y = xOrY ?? 0;
	} else {
		return;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	instance._animationOffsets?.set(`${scopeId}__${id}`, { x, y });
}

/**
 * アニメーションの動的オフセット取得
 */
export function getAnimationOffset(
	this: unknown,
	target: unknown = 0,
	scopeIdOrAnimId: unknown = 0,
	animIdOrNameParam: unknown = undefined,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	} else {
		return { x: 0, y: 0 };
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	return instance._animationOffsets?.get(`${scopeId}__${id}`) || { x: 0, y: 0 };
}

export function pauseAnimation(
	this: unknown,
	target: unknown = 0,
	scopeIdOrAnimId: unknown = 0,
	animIdOrNameParam: unknown = undefined,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	} else {
		return;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	surfaceAnimationTimers.pauseAnimation.call(instance, scopeId, id);
}

export function resumeAnimation(
	this: unknown,
	target: unknown = 0,
	scopeIdOrAnimId: unknown = 0,
	animIdOrNameParam: unknown = undefined,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	} else {
		return;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	surfaceAnimationTimers.resumeAnimation.call(instance, scopeId, id);
}

export function isAnimationPaused(
	this: unknown,
	target: unknown = 0,
	scopeIdOrAnimId: unknown = 0,
	animIdOrNameParam: unknown = undefined,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	} else {
		return false;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	return surfaceAnimationTimers.isAnimationPaused.call(instance, scopeId, id);
}

export function clearPausedAnimations(
	this: unknown,
	target: unknown = 0,
	scopeIdParam: unknown = 0,
) {
	let instance: unknown, scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
	} else {
		return;
	}

	surfaceAnimationTimers.clearPausedAnimations.call(instance, scopeId);
}

/**
 * スコープ内で現在再生中のアクティブアニメーション数を取得
 */
export function getActiveAnimationCount(
	this: unknown,
	target: unknown = 0,
	scopeIdParam: unknown = 0,
) {
	let instance: unknown, scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
	} else {
		return 0;
	}

	if (!instance._runningAnimations) return 0;
	const prefix = `${scopeId}__`;
	let count = 0;
	for (const key of instance._runningAnimations.keys()) {
		if (key.startsWith(prefix) && !instance._stoppedAnimations?.has(key)) {
			count++;
		}
	}
	return count;
}

/**
 * スコープ内で現在再生中のアクティブアニメーション定義リストを取得
 */
export function getActiveAnimations(
	this: unknown,
	target: unknown = 0,
	scopeIdParam: unknown = 0,
) {
	let instance: unknown, scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
	} else {
		return [];
	}

	if (!instance._runningAnimations) return [];
	const prefix = `${scopeId}__`;
	const activeList = [];
	for (const key of instance._runningAnimations.keys()) {
		if (key.startsWith(prefix) && !instance._stoppedAnimations?.has(key)) {
			const parts = key.split("__");
			const animId = parts[2];
			const anim = findAnimation(instance, animId, scopeId);
			if (anim) {
				activeList.push(anim);
			}
		}
	}
	return activeList;
}

/**
 * スコープ内で現在再生中のアニメーションに紐づくアクティブな当たり判定領域リストを取得
 */
export function getActiveCollisions(
	this: unknown,
	target: unknown = 0,
	scopeIdParam: unknown = 0,
) {
	let instance: unknown, scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
	} else {
		return [];
	}

	const activeAnims = getActiveAnimations(instance, scopeId);
	const activeCols = [];
	for (const anim of activeAnims) {
		if (Array.isArray(anim.collisions)) {
			activeCols.push(...anim.collisions);
		}
	}
	return activeCols;
}
