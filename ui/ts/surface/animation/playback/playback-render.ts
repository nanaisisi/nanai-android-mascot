/**
 * @file playback-render.ts
 * @brief SERIKO アニメーションフレーム描画処理モジュール
 */

import { patternSurfaceFile } from "../../bind-menu.js";
import { getAnimationOffset } from "../animation-options.js";
import {
	type AnimationInstance,
	isInstance,
} from "../animation-options-parser.js";
import { createPlaceholderCanvas } from "../scheduler-events.js";

/**
 * 単一アニメーションフレームのサーフィス描画
 */
export function renderAnimationFrame(
	this: unknown,
	target: unknown,
	patOrBaseSurfaceId: unknown,
	baseSurfaceIdOrScopeId: undefined,
	scopeIdOrAnimOptions: Record<string, unknown> | undefined,
	animationOptionsParam = {},
): boolean {
	let instance: AnimationInstance | null = null;
	let pat: unknown = null;
	let baseSurfaceId: unknown = 0;
	let scopeId: unknown = 0;
	let animationOptions: unknown = {};

	if (isInstance(target)) {
		instance = target;
		pat = patOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrAnimOptions;
		animationOptions = animationOptionsParam;
	} else {
		instance = this as AnimationInstance;
		pat = target;
		baseSurfaceId = patOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		animationOptions = scopeIdOrAnimOptions || {};
	}

	const inst = instance || {};
	const p = (pat || {}) as {
		surfaceId?: number | string;
		surface?: number | string;
		type?: string;
		x?: number;
		y?: number;
		[key: string]: unknown;
	};
	const opts = animationOptions || {};
	const sId = (scopeId ?? 0) as number;
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
		? ((getAnimOffset as (...args: unknown[]) => unknown).call(inst, p, sId) as
				| { x?: number; y?: number }
				| undefined)
		: (getAnimationOffset(inst, p, sId) as
				| { x?: number; y?: number }
				| undefined);

	if (p.type === "async") {
		createPlaceholderCanvas(100, 100, String(surfaceFile || surfaceId));
	} else {
		const renderSurfaceLayer = manager.renderSurfaceLayer;
		if (renderSurfaceLayer) {
			(renderSurfaceLayer as (...args: unknown[]) => unknown).call(
				manager,
				surfaceId,
				surfaceFile,
				Number(p.x || 0) + Number(offset?.x || 0),
				Number(p.y || 0) + Number(offset?.y || 0),
				opts,
			);
		}
	}
	return true;
}
