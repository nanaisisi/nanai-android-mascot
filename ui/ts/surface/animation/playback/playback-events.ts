/**
 * @file playback-events.js
 * @brief SERIKO 発話・スクリプト終了イベントトリガー制御モジュール
 */

import { playAnimationPatterns } from "./playback-control.js";

function isInstance(obj: number | null) {
	return (
		obj !== null &&
		typeof obj === "object" &&
		("manager" in obj ||
			"_runningAnimations" in obj ||
			"_exclusiveLocks" in obj ||
			"activeAnimationTimers" in obj)
	);
}

export function onTalkStart(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: unknown, scopeId: unknown;
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

export function onTalkEnd(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: unknown, scopeId: unknown;
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

export function onScriptEnd(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: unknown, scopeId: unknown;
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

export function onCharSpoken(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: unknown, scopeId: unknown;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (instance.isSerikoTalkEnabled && !instance.isSerikoTalkEnabled(scopeId)) {
		return;
	}

	instance._spokenCount[scopeId] = (instance._spokenCount[scopeId] || 0) + 1;
	const count = instance._spokenCount[scopeId];

	const anims = instance.findAnimationsForEvent
		? instance.findAnimationsForEvent(scopeId, "talk")
		: [];

	for (const anim of anims) {
		if (anim.option?.talkwait) {
			const waitVal = parseInt(anim.option.talkwait, 10);
			if (!Number.isNaN(waitVal) && count === waitVal) {
				const sidNum = Number(scopeId);
				const baseSurfaceId = instance.manager.currentSurfaceIdFor(sidNum);
				playAnimationPatterns.call(instance, anim, baseSurfaceId, sidNum);
			}
		}
	}
}
