/**
 * @file animation-options-parser.ts
 * @brief SERIKO アニメーションオプション文字列パースおよびインスタンス・排他判定ユーティリティ
 */

import type { FrameStepEvent } from "./scheduler-events.js";

export function parseAnimationOptions(optionParam: unknown = null) {
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

export interface AnimationInstance {
	manager?: {
		compositeCanvas?: unknown;
		renderSurfaceLayer?: (...args: unknown[]) => unknown;
		resolveSurfaceNumber?: (surfaceId: unknown, scopeId: unknown) => number;
		currentSurfaceIdFor?: (scopeId: unknown) => number | string;
		animations?: Record<
			string,
			Array<{
				id: number;
				name?: unknown;
				interval?: unknown;
				[key: string]: unknown;
			}>
		>;
		app?: { ghostController?: unknown; [key: string]: unknown };
		scheduler?: {
			notifyFrameStep?: (event: FrameStepEvent) => void;
			[key: string]: unknown;
		};
		[key: string]: unknown;
	};
	_runningAnimations?: unknown;
	_stoppedAnimations?: Set<string>;
	_spokenCount?: Record<number, number>;
	_talkStarted?: Record<number, boolean>;
	isSerikoTalkEnabled?: boolean | ((scopeId: unknown) => boolean);
	triggerAnimations?: (...args: unknown[]) => unknown;
	animationsForTrigger?: (...args: unknown[]) => Array<{
		anim?: unknown;
		sid?: unknown;
		param?: unknown;
		[key: string]: unknown;
	}>;
	resolvePatternWait?: (wait: unknown) => number;
	activeAnimationTimers?: Map<unknown, unknown>;
	_applyAnimationFrame?: (...args: unknown[]) => unknown;
	_animationOffsets?: Map<string, { x: unknown; y: unknown }>;
	getAnimationOffset?: (...args: unknown[]) => unknown;
	parseAnimationOptions?: (...args: unknown[]) => unknown;
	findAnimation?: (...args: unknown[]) => unknown;
	playAnimationPatterns?: (...args: unknown[]) => unknown;
	stopAnimation?: (...args: unknown[]) => unknown;
	setScale?: (...args: unknown[]) => unknown;
	renderAnimationFrame?: (...args: unknown[]) => unknown;
	isBlockedByExclusive?: (...args: unknown[]) => unknown;
	_playAnimationPatterns?: (...args: unknown[]) => unknown;
	scheduler?: {
		notifyFrameStep?: (event: FrameStepEvent) => void;
		[key: string]: unknown;
	};
	_baseMoveOffsets?: Map<number, { x: number; y: number }>;
	_sharedIndices?: Map<unknown, unknown>;
	_exclusiveLocks?: Map<unknown, { targets?: Set<number>; animId?: unknown }>;
	[key: string]: unknown;
}

export function isInstance(obj: unknown): obj is AnimationInstance {
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
 */
export function isBlockedByExclusive(
	this: unknown,
	target: unknown = 0,
	scopeIdOrAnimId: unknown = 0,
	animIdParam: unknown = undefined,
) {
	let instance: AnimationInstance | null = null;
	let scopeId: unknown = 0;
	let animId: unknown;

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
 */
export function findAnimation(
	this: unknown,
	target: unknown = 0,
	animIdOrNameOrScopeId: unknown = 0,
	scopeIdParam: unknown = 0,
) {
	let instance: AnimationInstance | null = null;
	let animIdOrName: unknown = 0;
	let scopeId: unknown = 0;

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
		animList.find((a) => {
			if (!Number.isNaN(targetNum) && a.id === targetNum) return true;
			if (String(a.id).toLowerCase() === targetStr) return true;
			if (a.name && String(a.name).trim().toLowerCase() === targetStr)
				return true;
			return false;
		}) || null
	);
}
