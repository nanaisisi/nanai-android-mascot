/**
 * @file playback-apply.js
 * @brief SERIKO アニメーションフレーム適用・反映処理モジュール
 */

import { FrameStepEvent } from "../scheduler-events.js";

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
 * @returns {boolean}
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
): boolean {
	let instance: any,
		pat: any,
		_anim: any,
		baseSurfaceId: any,
		scopeId: any,
		_key: any,
		isCurrent: any,
		options: any;
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

	const inst = instance || {};
	const p = pat || {};
	const sId = (scopeId ?? 0) as number;
	const bSurfId = baseSurfaceId as string | number;
	const isCurr = isCurrent as (() => boolean) | undefined;
	const opts = options || {};

	if (isCurr && !isCurr()) return false;

	const manager = inst.manager;

	// 特殊制御パターンの処理
	const surfaceId = p.surfaceId !== undefined ? p.surfaceId : (p.surface !== undefined ? p.surface : bSurfId);
	const surfaceNum = typeof surfaceId === "number" ? surfaceId : Number.parseInt(String(surfaceId), 10);

	if (surfaceNum === -1 || p.surface === -1 || p.surfaceId === -1) {
		// surface -1: このアニメーションの再生を終了しベース表示に戻す
		return false;
	}

	if (surfaceNum === -2 || p.surface === -2 || p.surfaceId === -2) {
		// surface -2: 同一スコープの他の再生中アニメーションを停止
		if (inst._runningAnimations) {
			for (const key of inst._runningAnimations.keys()) {
				if (key.startsWith(`${sId}__`)) {
					inst._stoppedAnimations?.add(key);
				}
			}
		}
		return true;
	}

	if (p.type === "start" || p.type === "stop") {
		if (p.type === "start" && p.targetId != null) {
			const anim = inst.findAnimation ? inst.findAnimation(p.targetId, sId) : null;
			if (anim) {
				inst.playAnimationPatterns?.(anim, bSurfId, sId);
			}
		} else if (p.type === "stop" && p.targetId != null) {
			inst.stopAnimation?.(sId, p.targetId);
		}
		return true;
	}

	if (p.type === "sound" || p.soundFile) {
		const soundPath = p.soundFile || p.file;
		if (soundPath) {
			const gc = manager?.app?.ghostController;
			gc?.playSound?.(soundPath);
		}
		return true;
	}

	if (p.type === "scaling" || p.scaleX != null || p.scaleY != null || p.scale != null) {
		const scaleX = p.scaleX ?? p.scale ?? (p.x !== undefined ? p.x : 100);
		const scaleY = p.scaleY ?? p.scale ?? (p.y !== undefined ? p.y : 100);
		const setScale = inst.setScale || manager?.setScale;
		if (setScale) {
			setScale.call(inst, scaleX, scaleY, sId);
		}
		const scheduler = inst.scheduler || manager?.scheduler;
		if (scheduler?.notifyFrameStep) {
			scheduler.notifyFrameStep(
				new FrameStepEvent({
					animationId: p.animationId || 0,
					scopeId: sId,
					baseSurfaceId: bSurfId,
					pattern: p,
					offsetX: scaleX,
					offsetY: scaleY,
					isFinished: true,
				}),
			);
		}
		return true;
	}

	if (p.type === "move" || p.moveX != null || p.moveY != null) {
		if (inst._baseMoveOffsets) {
			inst._baseMoveOffsets.set(sId, { x: p.moveX || 0, y: p.moveY || 0 });
		}
		return true;
	}

	const renderAnimationFrameFn = inst.renderAnimationFrame;

	if (renderAnimationFrameFn) {
		renderAnimationFrameFn.call(inst, p, bSurfId, sId, opts);
	} else if (manager) {
		const renderSurfaceLayer = manager.renderSurfaceLayer;
		if (renderSurfaceLayer) {
			renderSurfaceLayer.call(manager, surfaceId, p.file, p.x || 0, p.y || 0, opts);
		}
	}
	return true;
}
