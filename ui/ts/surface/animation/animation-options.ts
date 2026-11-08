/**
 * @file animation-options.js
 * @brief SERIKO アニメーションオプション解析、排他制御、オフセットおよび一時停止状態管理モジュール
 */

import { surfaceAnimationTimers } from "../surface-animation-timers.js";

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
 * animation*.option 文字列配列を解析
 * @param {string[]|undefined} options
 * @returns {{ isExclusive: boolean, exclusiveTargets: Set<number>|null, isBackground: boolean, isSharedIndex: boolean }}
 */
export function parseAnimationOptions(options = []) {
	let isExclusive = false;
	let exclusiveTargets = null;
	let isBackground = false;
	let isSharedIndex = false;

	for (const raw of options) {
		const str = String(raw).trim().toLowerCase();
		for (const part of str.split("+")) {
			const trimmed = part.trim();
			if (trimmed.startsWith("exclusive")) {
				isExclusive = true;
				const match = trimmed.match(/\(([\d,\s]+)\)/);
				if (match) {
					const targets = new Set(
						match[1]
							.split(",")
							.map((s) => Number.parseInt(s.trim(), 10))
							.filter((n) => !Number.isNaN(n)),
					);
					if (targets.size > 0) exclusiveTargets = targets;
				}
			} else if (trimmed.startsWith("background")) {
				isBackground = true;
			} else if (
				trimmed.startsWith("shared-index") ||
				trimmed.startsWith("shared_index")
			) {
				isSharedIndex = true;
			}
		}
	}

	return { isExclusive, exclusiveTargets, isBackground, isSharedIndex };
}

/**
 * 指定アニメーションが現在排他ロックにより開始をブロックされているか
 * @param {any} target
 * @param {number} [scopeIdOrAnimId=0]
 * @param {number|string} [animIdParam]
 * @returns {boolean}
 */
export function isBlockedByExclusive(target = 0, scopeIdOrAnimId, animIdParam) {
	let instance: unknown, scopeId: unknown, animId: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animId = animIdParam;
	} else {
		instance = this;
		scopeId = target ?? 0;
		animId = scopeIdOrAnimId;
	}

	const lock = instance._exclusiveLocks.get(scopeId);
	if (!lock) return false;
	const targetId = Number.parseInt(animId, 10);
	if (lock.targets) {
		return lock.targets.has(targetId);
	}
	return String(lock.animId) !== String(animId);
}

/**
 * アニメーション定義を検索（IDまたはname文字列による）
 * @param {any} target
 * @param {number|string} [animIdOrNameOrScopeId]
 * @param {number} [scopeIdParam=0]
 * @returns {object|null}
 */
export function findAnimation(target, animIdOrNameOrScopeId, scopeIdParam = 0) {
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

	const sid = String(instance.manager.currentSurfaceIdFor(scopeId));
	const animList =
		instance.manager.animations?.[sid] ||
		instance.manager.animations?.default ||
		[];
	const targetStr = String(animIdOrName).trim().toLowerCase();
	const targetNum = Number.parseInt(targetStr, 10);
	return (
		animList.find((a) => {
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
 * @param {any} target
 * @param {number} [scopeIdOrAnimId=0]
 * @param {number|string} [animIdOrNameParam]
 * @returns {boolean}
 */
export function isAnimationRunning(
	target = 0,
	scopeIdOrAnimId,
	animIdOrNameParam,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	const prefix = `${scopeId}__`;
	for (const [key] of instance._runningAnimations.entries()) {
		if (key.startsWith(prefix)) {
			const parts = key.split("__");
			if (parts[2] === String(id) && !instance._stoppedAnimations.has(key)) {
				return true;
			}
		}
	}
	return false;
}

/**
 * 特定のアニメーションのみ停止 (\![anim,stop,ID] / \![anim,clear,ID])
 * @param {any} target
 * @param {number} [scopeIdOrAnimId=0]
 * @param {number|string} [animIdOrNameParam]
 */
export function stopAnimation(target = 0, scopeIdOrAnimId, animIdOrNameParam) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	const prefix = `${scopeId}__`;
	for (const key of instance._runningAnimations.keys()) {
		if (key.startsWith(prefix)) {
			const parts = key.split("__");
			if (parts[2] === String(id)) {
				instance._stoppedAnimations.add(key);
			}
		}
	}
}

/**
 * アニメーションの動的オフセット設定 (\![anim,offset,ID,x,y])
 * @param {any} target
 * @param {number} [scopeIdOrAnimId=0]
 * @param {number|string} [animIdOrNameOrX]
 * @param {number} [xOrY=0]
 * @param {number} [yParam=0]
 */
export function setAnimationOffset(
	target = 0,
	scopeIdOrAnimId,
	animIdOrNameOrX,
	xOrY = 0,
	yParam = 0,
) {
	let instance: unknown,
		scopeId: unknown,
		animIdOrName: unknown,
		x: unknown,
		y: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameOrX;
		x = xOrY ?? 0;
		y = yParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
		x = animIdOrNameOrX ?? 0;
		y = xOrY ?? 0;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	instance._animationOffsets.set(`${scopeId}__${id}`, { x, y });
}

/**
 * アニメーションの動的オフセット取得
 * @param {any} target
 * @param {number} [scopeIdOrAnimId=0]
 * @param {number|string} [animIdOrNameParam]
 * @returns {{ x: number, y: number }}
 */
export function getAnimationOffset(
	target = 0,
	scopeIdOrAnimId,
	animIdOrNameParam,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	return instance._animationOffsets.get(`${scopeId}__${id}`) || { x: 0, y: 0 };
}

export function pauseAnimation(target = 0, scopeIdOrAnimId, animIdOrNameParam) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	surfaceAnimationTimers.pauseAnimation.call(instance, scopeId, id);
}

export function resumeAnimation(
	target = 0,
	scopeIdOrAnimId,
	animIdOrNameParam,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	surfaceAnimationTimers.resumeAnimation.call(instance, scopeId, id);
}

export function isAnimationPaused(
	target = 0,
	scopeIdOrAnimId,
	animIdOrNameParam,
) {
	let instance: unknown, scopeId: unknown, animIdOrName: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdOrAnimId ?? 0;
		animIdOrName = animIdOrNameParam;
	} else {
		instance = this;
		scopeId = target ?? 0;
		animIdOrName = scopeIdOrAnimId;
	}

	const anim = findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	return surfaceAnimationTimers.isAnimationPaused.call(instance, scopeId, id);
}

export function clearPausedAnimations(target = 0, scopeIdParam = 0) {
	let instance: unknown, scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	surfaceAnimationTimers.clearPausedAnimations.call(instance, scopeId);
}

/**
 * スコープ内で現在再生中のアクティブアニメーション数を取得
 * @param {any} target
 * @param {number} [scopeIdParam=0]
 * @returns {number}
 */
export function getActiveAnimationCount(target = 0, scopeIdParam = 0) {
	let instance: unknown, scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	const prefix = `${scopeId}__`;
	let count = 0;
	for (const key of instance._runningAnimations.keys()) {
		if (key.startsWith(prefix) && !instance._stoppedAnimations.has(key)) {
			count++;
		}
	}
	return count;
}

/**
 * スコープ内で現在再生中のアクティブアニメーション定義リストを取得
 * @param {any} target
 * @param {number} [scopeIdParam=0]
 * @returns {object[]}
 */
export function getActiveAnimations(target = 0, scopeIdParam = 0) {
	let instance: unknown, scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	const prefix = `${scopeId}__`;
	const activeList = [];
	for (const key of instance._runningAnimations.keys()) {
		if (key.startsWith(prefix) && !instance._stoppedAnimations.has(key)) {
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
 * @param {any} target
 * @param {number} [scopeIdParam=0]
 * @returns {import('../surface-parser.js').CollisionArea[]}
 */
export function getActiveCollisions(target = 0, scopeIdParam = 0) {
	let instance: unknown, scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
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
