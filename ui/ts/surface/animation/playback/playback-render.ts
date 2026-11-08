/**
 * @file playback-render.js
 * @brief SERIKO アニメーションフレーム描画処理モジュール
 */

import { patternSurfaceFile } from "../../bind-menu.js";
import { getAnimationOffset } from "../animation-options.js";
import { createPlaceholderCanvas } from "../scheduler-events.js";

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
 * 単一アニメーションフレームのサーフィス描画
 * @param {unknown} target
 * @param {unknown} patOrBaseSurfaceId
 * @param {unknown} baseSurfaceIdOrScopeId
 * @param {Record<string, unknown> | undefined} scopeIdOrAnimOptions
 * @param {unknown} animationOptionsParam
 */
export function renderAnimationFrame(
	this: unknown,
	target: unknown,
	patOrBaseSurfaceId: unknown,
	baseSurfaceIdOrScopeId: undefined,
	scopeIdOrAnimOptions: Record<string, unknown> | undefined,
	animationOptionsParam = {},
) {
	let instance: unknown,
		pat: unknown,
		baseSurfaceId: unknown,
		scopeId: unknown,
		animationOptions: unknown;
	if (isInstance(target)) {
		instance = target;
		pat = patOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrAnimOptions;
		animationOptions = animationOptionsParam;
	} else {
		instance = this;
		pat = target;
		baseSurfaceId = patOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		animationOptions = scopeIdOrAnimOptions || {};
	}

	const inst = instance as Record<string, unknown>;
	const p = pat as Record<string, unknown>;
	const opts = animationOptions as Record<string, unknown>;
	const sId = scopeId as number;
	const bSurfId = baseSurfaceId as string | number;

	const manager = inst.manager as Record<string, unknown> | undefined;
	if (!manager) return;

	const compositeCanvas = manager.compositeCanvas as unknown;
	if (!compositeCanvas) return;

	const surfaceId = p.surfaceId !== undefined ? p.surfaceId : bSurfId;
	const surfaceFile = patternSurfaceFile(p);

	const getAnimOffset = inst.getAnimationOffset as
		| ((pat: unknown, sid: number) => { x: number; y: number })
		| undefined;
	const offset = getAnimOffset
		? getAnimOffset(p, sId)
		: getAnimationOffset(inst, p, sId);

	if (p.type === "async") {
		createPlaceholderCanvas(surfaceFile || String(surfaceId), 100, 100);
	} else {
		const renderSurfaceLayer = manager.renderSurfaceLayer as
			| ((...args: unknown[]) => void)
			| undefined;
		renderSurfaceLayer?.(
			surfaceId,
			surfaceFile,
			offset.x,
			offset.y,
			opts,
		);
	}
}
