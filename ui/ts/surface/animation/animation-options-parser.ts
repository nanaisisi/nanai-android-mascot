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

export function isInstance(obj: unknown) {
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
