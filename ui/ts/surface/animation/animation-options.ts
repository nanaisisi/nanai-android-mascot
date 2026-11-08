/**
 * @file animation-options.js
 * @brief SERIKO アニメーションオプション解析・排他制御・検索・操作ユーティリティ
 */

import { surfaceAnimationTimers } from "../surface-animation-timers.js";

/**
 * SERIKO アニメーションオプション文字列のパース (\![anim,option,ID,...])
 * @param {string|string[]|Record<string, any>|null} [optionParam=null]
 */
export function parseAnimationOptions(optionParam: any = null) {
	if (
		optionParam &&
		typeof optionParam === "object" &&
		!Array.isArray(optionParam)
	) {
		return optionParam;
	}

	const optionsList = Array.isArray(optionParam)
		? optionParam
		: optionParam && typeof optionParam === "string"
			? [optionParam]
			: [];

	const optionStr = optionsList.join(" ").toLowerCase();

	const isExclusive =
		optionStr.includes("exclusive") || optionStr.includes("alternation");
	let exclusiveGroup: string | null = null;
	const matchGroup = optionStr.match(/exclusive[:=]([a-zA-Z0-9_+-]+)/i);
	if (matchGroup) {
		exclusiveGroup = matchGroup[1] ?? null;
	} else if (isExclusive) {
		exclusiveGroup = "default";
	}

	let exclusiveTargets: Set<number> | null = null;
	const matchTargets = optionStr.match(/exclusive=([0-9+]+)/i);
	if (matchTargets?.[1]) {
		exclusiveTargets = new Set(
			matchTargets[1].split("+").map((id) => Number.parseInt(id, 10)),
		);
	}

	return {
		isExclusive,
		exclusiveGroup,
		exclusiveTargets,
		isAsync: optionStr.includes("async"),
		isOverlay: optionStr.includes("overlay"),
		isBackground: optionStr.includes("background"),
		isSharedIndex:
			optionStr.includes("sharedindex") || optionStr.includes("shared-index"),
	};
}

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
 * 排他グループによるブロック判定
 * @param {unknown} target
 * @param {number} [target=0]
 * @param {number} [scopeIdOrAnimId=0]
 * @param {unknown} [animIdParam]
 * @returns {boolean}
 */
export function isBlockedByExclusive(
	this: unknown,
	target: any = 0,
	scopeIdOrAnimId: any = 0,
	animIdParam: any = undefined,
) {
	let instance: any, scopeId: any, animId: any;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animId = animIdParam;
	} else if (isInstance(this)) {
		instance = this;
		scopeId = target ?? 0;
		animId = scopeIdOrAnimId;
	} else {
		return false;
	}

	const lock = instance._exclusiveLocks?.get(scopeId);
	if (!lock) return false;
	const targetId = Number.parseInt(String(animId), 10);
	if (lock.targets) {
		return lock.targets.has(targetId);
	}
	return String(lock.animId) !== String(animId);
}

/**
 * アニメーション定義を検索（IDまたはname文字列による）
 * @param {unknown} target
 * @param {number|string} [animIdOrNameOrScopeId]
 * @param {number} [scopeIdParam=0]
 * @returns {object|null}
 */
export function findAnimation(
	this: unknown,
	target: any = 0,
	animIdOrNameOrScopeId: any = 0,
	scopeIdParam: any = 0,
) {
	let instance: any, animIdOrName: any, scopeId: any;
	if (isInstance(target)) {
		instance = target;
		animIdOrName = animIdOrNameOrScopeId;
		scopeId = scopeIdParam ?? 0;
	} else if (isInstance(this)) {
		instance = this;
		animIdOrName = target;
		scopeId = animIdOrNameOrScopeId ?? 0;
	} else {
		return null;
	}

	if (!instance?.manager) return null;
	const currentSurfaceIdFor = instance.manager.currentSurfaceIdFor;
	const sid = String(
		currentSurfaceIdFor
			? currentSurfaceIdFor.call(instance.manager, scopeId)
			: 0,
	);
	const animList =
		instance.manager.animations?.[sid] ||
		instance.manager.animations?.default ||
		[];
	const targetStr = String(animIdOrName).trim().toLowerCase();
	const targetNum = Number.parseInt(targetStr, 10);
	return (
		animList.find((a: { id: number; name: unknown }) => {
			if (!Number.isNaN(targetNum) && a.id === targetNum) return true;
			if (String(a.id).toLowerCase() === targetStr) return true;
			if (a.name && String(a.name).trim().toLowerCase() === targetStr)
				return true;
			return false;
		}) || null
	);
}

/**
 * 指定アニメーションが再生中かどうか判定
 * @param {unknown} target
 * @param {number} [scopeIdOrAnimId=0]
 * @param {number|string} [animIdOrNameParam]
 * @returns {boolean}
 */
export function isAnimationRunning(
	this: unknown,
	target: any = 0,
	scopeIdOrAnimId: any = 0,
	animIdOrNameParam: any = undefined,
) {
	let instance: any, scopeId: any, animIdOrName: any;
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
 * @param {unknown} target
 * @param {number} [scopeIdOrAnimId=0]
 * @param {number|string} [animIdOrNameParam]
 */
export function stopAnimation(
	this: unknown,
	target: any = 0,
	scopeIdOrAnimId: any = 0,
	animIdOrNameParam: any = undefined,
) {
	let instance: any, scopeId: any, animIdOrName: any;
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
 * @param {unknown} target
 * @param {number} [scopeIdOrAnimId=0]
 * @param {number|string} [animIdOrNameOrX]
 * @param {number} [xOrY=0]
 * @param {number} [yParam=0]
 */
export function setAnimationOffset(
	this: unknown,
	target: any = 0,
	scopeIdOrAnimId: any = 0,
	animIdOrNameOrX: any = 0,
	xOrY = 0,
	yParam = 0,
) {
	let instance: any, scopeId: any, animIdOrName: any, x: any, y: any;
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
 * @param {unknown} target
 * @param {number} [scopeIdOrAnimId=0]
 * @param {number|string} [animIdOrNameParam]
 * @returns {{ x: number, y: number }}
 */
export function getAnimationOffset(
	this: unknown,
	target: any = 0,
	scopeIdOrAnimId: any = 0,
	animIdOrNameParam: any = undefined,
) {
	let instance: any, scopeId: any, animIdOrName: any;
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
	target: any = 0,
	scopeIdOrAnimId: any = 0,
	animIdOrNameParam: any = undefined,
) {
	let instance: any, scopeId: any, animIdOrName: any;
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
	target: any = 0,
	scopeIdOrAnimId: any = 0,
	animIdOrNameParam: any = undefined,
) {
	let instance: any, scopeId: any, animIdOrName: any;
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
	target: any = 0,
	scopeIdOrAnimId: any = 0,
	animIdOrNameParam: any = undefined,
) {
	let instance: any, scopeId: any, animIdOrName: any;
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
	target: any = 0,
	scopeIdParam: any = 0,
) {
	let instance: any, scopeId: any;
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
 * @param {unknown} target
 * @param {number} [scopeIdParam=0]
 * @returns {number}
 */
export function getActiveAnimationCount(
	this: unknown,
	target: any = 0,
	scopeIdParam: any = 0,
) {
	let instance: any, scopeId: any;
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
 * @param {unknown} target
 * @param {number} [scopeIdParam=0]
 * @returns {object[]}
 */
export function getActiveAnimations(
	this: unknown,
	target: any = 0,
	scopeIdParam: any = 0,
) {
	let instance: any, scopeId: any;
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
 * @param {unknown} target
 * @param {number} [scopeIdParam=0]
 * @returns {import('../surface-parser.js').CollisionArea[]}
 */
export function getActiveCollisions(
	this: unknown,
	target: any = 0,
	scopeIdParam: any = 0,
) {
	let instance: any, scopeId: any;
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
