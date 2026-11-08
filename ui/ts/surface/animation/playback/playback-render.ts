/**
 * @file playback-render.js
 * @brief SERIKO アニメーションフレーム描画処理モジュール
 */

import { patternSurfaceFile } from "../../bind-menu.js";
import { getAnimationOffset } from "../animation-options.js";
import { createPlaceholderCanvas } from "../scheduler-events.js";

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

/**
 * 単一アニメーションフレームのサーフィス描画
 * @param {any} target
 * @param {any} patOrBaseSurfaceId
 * @param {any} baseSurfaceIdOrScopeId
 * @param {any} [scopeIdOrAnimOptions]
 * @param {any} [animationOptionsParam={}]
 * @returns {Promise<any>|boolean}
 */
export function renderAnimationFrame(
	target,
	patOrBaseSurfaceId,
	baseSurfaceIdOrScopeId,
	scopeIdOrAnimOptions,
	animationOptionsParam = {},
) {
	// biome-ignore lint/suspicious/noImplicitAnyLet: automated fix
	let instance, pat, baseSurfaceId, scopeId, animationOptions;
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

	if (baseSurfaceId === -1 || baseSurfaceId === "-1") return false;
	const resolved = instance.manager.resolveSurfaceNumber(pat.surface, scopeId);
	const file = pat.placeholder === true ? null : patternSurfaceFile(resolved);
	const gc = instance.manager.app?.ghostController;
	if (!gc) return false;

	const patType = (pat.type || "overlay").toLowerCase();
	const options = pat.options ? [...pat.options] : [];
	if (animationOptions.isBackground) {
		options.push("background");
	}

	const offset = instance.getAnimationOffset
		? instance.getAnimationOffset(
				scopeId,
				pat.animId ?? pat.animationId ?? animationOptions.animId ?? 0,
			)
		: getAnimationOffset(
				instance,
				scopeId,
				pat.animId ?? pat.animationId ?? animationOptions.animId ?? 0,
			);
	const finalX = (pat.x ?? 0) + (offset.x || 0);
	const finalY = (pat.y ?? 0) + (offset.y || 0);

	// ダミーのプレースホルダー画像バッファ（カラー矩形Canvas）フォールバック
	if (!file && resolved !== -1 && resolved !== "-1") {
		const dummyCanvas = createPlaceholderCanvas(
			200,
			400,
			"rgba(255,100,100,0.5)",
		);
		return Promise.resolve(
			gc.updateSurface(baseSurfaceId, scopeId, [
				{
					file: dummyCanvas.toDataURL("image/png"),
					x: finalX,
					y: finalY,
					type: patType,
					options,
				},
			]),
		);
	}

	if (file) {
		return Promise.resolve(
			gc.updateSurface(baseSurfaceId, scopeId, [
				{
					file,
					x: finalX,
					y: finalY,
					type: patType,
					options,
				},
			]),
		);
	}
	return false;
}
