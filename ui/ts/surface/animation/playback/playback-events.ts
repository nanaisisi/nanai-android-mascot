/**
 * @file playback-events.js
 * @brief SERIKO 発話・スクリプト終了イベントトリガー制御モジュール
 */

import { playAnimationPatterns } from "./playback-control.js";

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

export function onTalkStart(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: any, scopeId: any;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (!instance) return;
	instance._spokenCount = instance._spokenCount || {};
	instance._talkStarted = instance._talkStarted || {};

	instance._spokenCount[scopeId] = 0;
	instance._talkStarted[scopeId] = true;
	if (instance.triggerAnimations) {
		instance.triggerAnimations(scopeId, "starttalk");
	}
}

export function onTalkEnd(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: any, scopeId: any;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (!instance) return;
	instance._talkStarted = instance._talkStarted || {};

	if (instance._talkStarted[scopeId]) {
		if (instance.triggerAnimations) {
			instance.triggerAnimations(scopeId, "endtalk");
		}
	}
	instance._talkStarted[scopeId] = false;
}

export function onScriptEnd(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: any, scopeId: any;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (!instance) return;
	if (instance.triggerAnimations) {
		instance.triggerAnimations(scopeId, "yen-e");
	}
}

export function onCharSpoken(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: any, scopeId: any;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (!instance) return;
	if (instance.isSerikoTalkEnabled) {
		const enabled =
			typeof instance.isSerikoTalkEnabled === "function"
				? instance.isSerikoTalkEnabled(scopeId)
				: Boolean(instance.isSerikoTalkEnabled);
		if (!enabled) return;
	}

	instance._spokenCount = instance._spokenCount || {};
	instance._spokenCount[scopeId] = (instance._spokenCount[scopeId] || 0) + 1;
	const count = instance._spokenCount[scopeId];

	if (instance.animationsForTrigger) {
		const anims = instance.animationsForTrigger(scopeId, "talk");
		for (const item of anims) {
			const anim = item.anim || item;
			const sid = item.sid || 0;
			const playFn = instance.playAnimationPatterns || playAnimationPatterns;
			playFn.call(instance, anim, sid, scopeId);
		}
		return;
	}

	if (instance.findAnimationsForEvent) {
		const anims = instance.findAnimationsForEvent(scopeId, "talk");
		for (const anim of anims) {
			const sid = String(
				instance.manager?.currentSurfaceIdFor
					? instance.manager.currentSurfaceIdFor(scopeId)
					: 0,
			);
			const playFn = instance.playAnimationPatterns || playAnimationPatterns;
			playFn.call(instance, anim, sid, scopeId);
		}
		return;
	}

	const manager = instance.manager;
	const sid = String(
		manager?.currentSurfaceIdFor ? manager.currentSurfaceIdFor(scopeId) : 0,
	);
	const animList =
		manager?.animations?.[sid] || manager?.animations?.default || [];

	for (const anim of animList) {
		const interval = String(anim.interval || "").toLowerCase();
		if (interval.includes("talk")) {
			const parts = interval.split(",");
			const n = parts[1] ? Number.parseInt(parts[1], 10) : 1;
			if (!Number.isNaN(n) && n > 0 && count % n === 0) {
				const playFn = instance.playAnimationPatterns || playAnimationPatterns;
				playFn.call(instance, anim, sid, scopeId);
			}
		}
	}
}
