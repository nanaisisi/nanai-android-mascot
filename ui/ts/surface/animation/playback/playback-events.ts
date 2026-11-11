/**
 * @file playback-events.ts
 * @brief SERIKO 発話・スクリプト終了イベントトリガー制御モジュール
 */

import {
	type AnimationInstance,
	isInstance,
} from "../animation-options-parser.js";
import { playAnimationPatterns } from "./playback-control.js";

function triggerAnimationsFallback(
	instance: AnimationInstance,
	scopeId: number,
	kind: string,
) {
	const manager = instance.manager;
	const sid = String(
		manager?.currentSurfaceIdFor ? manager.currentSurfaceIdFor(scopeId) : 0,
	);
	const animList =
		manager?.animations?.[sid] || manager?.animations?.default || [];

	for (const item of animList) {
		const anim = item as { interval?: unknown; [key: string]: unknown };
		const interval = String(anim.interval || "").toLowerCase();
		if (interval.includes(kind)) {
			const playFn =
				(instance.playAnimationPatterns as (...args: unknown[]) => unknown) ||
				playAnimationPatterns;
			playFn.call(instance, anim, sid, scopeId);
		}
	}
}

export function onTalkStart(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: AnimationInstance | null = null;
	let scopeId = 0;
	if (isInstance(target)) {
		instance = target;
		scopeId = Number(scopeIdOrZero(scopeIdParam));
	} else {
		instance = this as AnimationInstance;
		scopeId = Number(scopeIdOrZero(target));
	}

	if (!instance) return;
	instance._spokenCount = instance._spokenCount || {};
	instance._talkStarted = instance._talkStarted || {};

	instance._spokenCount[scopeId] = 0;
	instance._talkStarted[scopeId] = true;
	if (instance.triggerAnimations) {
		(instance.triggerAnimations as (...args: unknown[]) => unknown)(
			scopeId,
			"starttalk",
		);
	} else if (instance.manager) {
		triggerAnimationsFallback(instance, scopeId, "starttalk");
	}
}

function scopeIdOrZero(val: unknown): number {
	const num = Number(val);
	return Number.isNaN(num) ? 0 : num;
}

export function onTalkEnd(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: AnimationInstance | null = null;
	let scopeId = 0;
	if (isInstance(target)) {
		instance = target;
		scopeId = Number(scopeIdOrZero(scopeIdParam));
	} else {
		instance = this as AnimationInstance;
		scopeId = Number(scopeIdOrZero(target));
	}

	if (!instance) return;
	instance._talkStarted = instance._talkStarted || {};

	if (instance._talkStarted[scopeId]) {
		if (instance.triggerAnimations) {
			(instance.triggerAnimations as (...args: unknown[]) => unknown)(
				scopeId,
				"endtalk",
			);
		} else if (instance.manager) {
			triggerAnimationsFallback(instance, scopeId, "endtalk");
		}
	}
	instance._talkStarted[scopeId] = false;
}

export function onScriptEnd(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: AnimationInstance | null = null;
	let scopeId = 0;
	if (isInstance(target)) {
		instance = target;
		scopeId = Number(scopeIdOrZero(scopeIdParam));
	} else {
		instance = this as AnimationInstance;
		scopeId = Number(scopeIdOrZero(target));
	}

	if (!instance) return;
	if (instance.triggerAnimations) {
		(instance.triggerAnimations as (...args: unknown[]) => unknown)(
			scopeId,
			"yen-e",
		);
	} else if (instance.manager) {
		triggerAnimationsFallback(instance, scopeId, "yen-e");
	}
}

export function onCharSpoken(this: unknown, target = 0, scopeIdParam = 0) {
	let instance: AnimationInstance | null = null;
	let scopeId = 0;
	if (isInstance(target)) {
		instance = target;
		scopeId = Number(scopeIdOrZero(scopeIdParam));
	} else {
		instance = this as AnimationInstance;
		scopeId = Number(scopeIdOrZero(target));
	}

	if (!instance) return;
	if (instance.isSerikoTalkEnabled) {
		const enabled =
			typeof instance.isSerikoTalkEnabled === "function"
				? instance.isSerikoTalkEnabled(scopeId)
				: Boolean(instance.isSerikoTalkEnabled);
		if (!enabled) return;
	}

	instance._talkStarted = instance._talkStarted || {};
	if (!instance._talkStarted[scopeId]) {
		onTalkStart.call(instance, target, scopeIdParam);
	}

	instance._spokenCount = instance._spokenCount || {};
	instance._spokenCount[scopeId] = (instance._spokenCount[scopeId] || 0) + 1;
	const count = instance._spokenCount[scopeId] || 0;

	if (instance.animationsForTrigger) {
		const anims = (
			instance.animationsForTrigger as (...args: unknown[]) => Array<{
				anim?: unknown;
				sid?: unknown;
				param?: unknown;
				[key: string]: unknown;
			}>
		)(scopeId, "talk");
		for (const item of anims) {
			const anim = (item.anim || item) as {
				interval?: unknown;
				[key: string]: unknown;
			};
			const sid = item.sid || 0;
			const param =
				item.param != null ? Number.parseInt(String(item.param), 10) : 1;
			const interval = String(anim.interval || "").toLowerCase();
			const parts = interval.split(",");
			const n =
				!Number.isNaN(param) && param > 0
					? param
					: parts[1]
						? Number.parseInt(parts[1], 10)
						: 1;
			if (!Number.isNaN(n) && n > 0 && count % n === 0) {
				const playFn =
					(instance.playAnimationPatterns as (...args: unknown[]) => unknown) ||
					playAnimationPatterns;
				playFn.call(instance, anim, sid, scopeId);
			}
		}
		return;
	}

	const manager = instance.manager;
	const sid = String(
		manager?.currentSurfaceIdFor ? manager.currentSurfaceIdFor(scopeId) : 0,
	);
	const animList =
		manager?.animations?.[sid] || manager?.animations?.default || [];

	for (const item of animList) {
		const anim = item as { interval?: unknown; [key: string]: unknown };
		const interval = String(anim.interval || "").toLowerCase();
		if (interval.includes("talk")) {
			const parts = interval.split(",");
			const n = parts[1] ? Number.parseInt(parts[1], 10) : 1;
			if (!Number.isNaN(n) && n > 0 && count % n === 0) {
				const playFn =
					(instance.playAnimationPatterns as (...args: unknown[]) => unknown) ||
					playAnimationPatterns;
				playFn.call(instance, anim, sid, scopeId);
			}
		}
	}
}
