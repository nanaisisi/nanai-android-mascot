/**
 * @file playback-events.js
 * @brief SERIKO 発話・スクリプト終了イベントトリガー制御モジュール
 */

import { playAnimationPatterns } from "./playback-control.js";

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

export function onTalkStart(target = 0, scopeIdParam = 0) {
	let instance, scopeId;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	instance._spokenCount[scopeId] = 0;
	instance._talkStarted[scopeId] = true;
	if (instance.triggerAnimations) {
		instance.triggerAnimations(scopeId, "starttalk");
	}
}

export function onTalkEnd(target = 0, scopeIdParam = 0) {
	let instance, scopeId;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (instance._talkStarted[scopeId]) {
		if (instance.triggerAnimations) {
			instance.triggerAnimations(scopeId, "endtalk");
		}
	}
	instance._talkStarted[scopeId] = false;
}

export function onScriptEnd(target = 0, scopeIdParam = 0) {
	let instance, scopeId;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (instance.triggerAnimations) {
		instance.triggerAnimations(scopeId, "yen-e");
	}
}

export function onCharSpoken(target = 0, scopeIdParam = 0) {
	let instance, scopeId;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (!instance._talkStarted[scopeId]) {
		if (instance.onTalkStart) {
			instance.onTalkStart(scopeId);
		} else {
			onTalkStart(instance, scopeId);
		}
	}

	instance._spokenCount[scopeId] = (instance._spokenCount[scopeId] || 0) + 1;
	const anims = instance.animationsForTrigger
		? instance.animationsForTrigger(scopeId, "talk")
		: [];

	for (const { anim, sid, param } of anims) {
		const n = Math.max(param || 1, 1);
		if (instance._spokenCount[scopeId] % n === 0) {
			const playFn = instance.playAnimationPatterns
				? (...args) => instance.playAnimationPatterns(...args)
				: (...args) => playAnimationPatterns(instance, ...args);
			playFn(anim, sid, scopeId)?.catch?.(() => {});
		}
	}
}
