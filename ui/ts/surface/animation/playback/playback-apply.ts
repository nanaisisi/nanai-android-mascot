/**
 * @file playback-apply.js
 * @brief SERIKO アニメーションフレーム適用・反映処理モジュール
 */

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
 * SERIKO アニメーションフレーム適用（サーフィス・透過・レイヤー描画）
 * @param {unknown} target
 * @param {unknown} patOrAnim
 * @param {unknown} animOrBaseSurfaceId
 * @param {unknown} baseSurfaceIdOrScopeId
 * @param {unknown} scopeIdOrKey
 * @param {unknown} keyOrIsCurrent
 * @param {Record<string, unknown> | undefined} [isCurrentOrOptions]
 * @param {unknown} [optionsParam={}]
 */
export function _applyAnimationFrame(
	this: unknown,
	target: unknown,
	patOrAnim: unknown,
	animOrBaseSurfaceId: unknown,
	baseSurfaceIdOrScopeId: undefined,
	scopeIdOrKey: undefined,
	keyOrIsCurrent: undefined,
	isCurrentOrOptions: Record<string, unknown> | undefined,
	optionsParam = {},
) {
	let instance: unknown,
		pat: unknown,
		_anim: unknown,
		baseSurfaceId: unknown,
		scopeId: unknown,
		_key: unknown,
		isCurrent: unknown,
		options: unknown;
	if (isInstance(target)) {
		instance = target;
		pat = patOrAnim;
		_anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		_key = keyOrIsCurrent;
		isCurrent = isCurrentOrOptions;
		options = optionsParam;
	} else {
		instance = this;
		pat = target;
		_anim = patOrAnim;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		_key = scopeIdOrKey;
		isCurrent = keyOrIsCurrent;
		options = isCurrentOrOptions || {};
	}

	const inst = instance as Record<string, unknown>;
	const p = pat as Record<string, unknown>;
	const sId = scopeId as number;
	const bSurfId = baseSurfaceId as string | number;
	const isCurr = isCurrent as (() => boolean) | undefined;
	const opts = options as Record<string, unknown>;

	if (isCurr && !isCurr()) return;

	const manager = inst.manager as Record<string, unknown> | undefined;
	const renderAnimationFrameFn = inst.renderAnimationFrame as
		| ((...args: unknown[]) => void)
		| undefined;

	if (renderAnimationFrameFn) {
		renderAnimationFrameFn.call(inst, p, bSurfId, sId, opts);
	} else if (manager) {
		// デフォルト描画処理
		const surfaceId = p.surfaceId !== undefined ? p.surfaceId : bSurfId;
		const renderSurfaceLayer = manager.renderSurfaceLayer as
			| ((...args: unknown[]) => void)
			| undefined;
		if (renderSurfaceLayer) {
			renderSurfaceLayer(surfaceId, p.file, p.x || 0, p.y || 0, opts);
		}
	}
}
