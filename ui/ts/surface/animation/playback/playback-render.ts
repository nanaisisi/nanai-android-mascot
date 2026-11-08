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
 * @returns {boolean}
 */
export function renderAnimationFrame(
	this: unknown,
	target: unknown,
	patOrBaseSurfaceId: unknown,
	baseSurfaceIdOrScopeId: undefined,
	scopeIdOrAnimOptions: Record<string, unknown> | undefined,
	animationOptionsParam = {},
): boolean {
	let instance: any,
		pat: any,
		baseSurfaceId: any,
		scopeId: any,
		animationOptions: any;
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

	const inst = instance || {};
	const p = pat || {};
	const opts = animationOptions || {};
	const sId = scopeId as number;
	const bSurfId = baseSurfaceId as string | number;

	if (bSurfId === -1 || Number(bSurfId) === -1) {
		return false;
	}

	const manager = inst.manager;
	if (!manager) return false;

	const compositeCanvas = manager.compositeCanvas;
	if (!compositeCanvas) return false;

	const surfaceId =
		p.surfaceId !== undefined
			? p.surfaceId
			: p.surface !== undefined
				? p.surface
				: bSurfId;
	if (surfaceId === -1 || Number(surfaceId) === -1) {
		return false;
	}

	const surfaceFile = patternSurfaceFile(p);

	const getAnimOffset = inst.getAnimationOffset;
	const offset = getAnimOffset
		? getAnimOffset.call(inst, p, sId)
		: getAnimationOffset(inst, p, sId);

	if (p.type === "async") {
		createPlaceholderCanvas(surfaceFile || String(surfaceId), 100, 100);
	} else {
		const renderSurfaceLayer = manager.renderSurfaceLayer;
		if (renderSurfaceLayer) {
			renderSurfaceLayer.call(
				manager,
				surfaceId,
				surfaceFile,
				(p.x || 0) + (offset?.x || 0),
				(p.y || 0) + (offset?.y || 0),
				opts,
			);
		}
	}
	return true;
}
