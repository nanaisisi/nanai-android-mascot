/**
 * @file playback-apply.ts
 * @brief SERIKO アニメーションフレーム適用・反映処理モジュール
 */

import { getAnimationOffset } from "../animation-options.js";
import {
	type AnimationInstance,
	isInstance,
} from "../animation-options-parser.js";
import { FrameStepEvent } from "../scheduler-events.js";

/**
 * SERIKO アニメーションフレーム適用（サーフィス・透過・レイヤー描画）
 */
export async function _applyAnimationFrame(
	this: unknown,
	target: unknown,
	patOrBaseSurfaceId: unknown,
	animOrBaseSurfaceId?: unknown,
	baseSurfaceIdOrScopeId?: unknown,
	scopeIdOrKey?: unknown,
	keyOrIsCurrent?: unknown,
	isCurrentOrOptions?: unknown,
	optionsParam: unknown = {},
): Promise<boolean> {
	let instance: AnimationInstance | null = null;
	let pat: unknown = null;
	let anim: unknown = null;
	let baseSurfaceId: unknown = 0;
	let scopeId: unknown = 0;
	let _key: unknown = "";
	let isCurrent: (() => boolean) | undefined;
	let options: unknown = {};

	if (isInstance(target)) {
		instance = target;
		pat = patOrBaseSurfaceId;
		anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		_key = keyOrIsCurrent;
		isCurrent =
			typeof isCurrentOrOptions === "function"
				? (isCurrentOrOptions as () => boolean)
				: typeof keyOrIsCurrent === "function"
					? (keyOrIsCurrent as () => boolean)
					: undefined;
		options =
			typeof optionsParam === "object" && optionsParam !== null
				? optionsParam
				: typeof isCurrentOrOptions === "object" && isCurrentOrOptions !== null
					? isCurrentOrOptions
					: {};
	} else {
		instance = this as AnimationInstance;
		pat = target;
		anim = patOrBaseSurfaceId;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		_key = scopeIdOrKey;
		isCurrent =
			typeof keyOrIsCurrent === "function"
				? (keyOrIsCurrent as () => boolean)
				: typeof isCurrentOrOptions === "function"
					? (isCurrentOrOptions as () => boolean)
					: undefined;
		options =
			typeof isCurrentOrOptions === "object" && isCurrentOrOptions !== null
				? isCurrentOrOptions
				: {};
	}

	const inst = instance || {};
	const p = (pat || {}) as {
		surfaceId?: number | string;
		surface?: number | string;
		type?: string;
		targetId?: unknown;
		animationId?: unknown;
		soundFile?: string;
		file?: string;
		scaleX?: number;
		scaleY?: number;
		scale?: number;
		x?: number;
		y?: number;
		offsetx?: number;
		offsety?: number;
		method?: string;
		[key: string]: unknown;
	};
	const a = (anim || {}) as {
		id?: number;
		name?: string;
		[key: string]: unknown;
	};
	const sId = (scopeId ?? 0) as number;
	const bSurfId = baseSurfaceId as string | number;
	const isCurr = isCurrent;
	const opts = options || {};

	if (isCurr && !isCurr()) return false;

	const manager = inst.manager;

	// 特殊制御パターンの処理
	const surfaceId =
		p.surfaceId !== undefined
			? p.surfaceId
			: p.surface !== undefined
				? p.surface
				: bSurfId;
	const surfaceNum =
		typeof surfaceId === "number"
			? surfaceId
			: Number.parseInt(String(surfaceId), 10);

	if (surfaceNum === -1 || p.surface === -1 || p.surfaceId === -1) {
		// surface -1: このアニメーションの再生を終了しベース表示に戻す
		return false;
	}

	if (surfaceNum === -2 || p.surface === -2 || p.surfaceId === -2) {
		// surface -2: 同一スコープの他の再生中アニメーションを停止
		const running = inst._runningAnimations as Map<string, unknown> | undefined;
		if (running) {
			for (const key of running.keys()) {
				if (key.startsWith(`${sId}__`)) {
					inst._stoppedAnimations?.add(key);
				}
			}
		}
		return true;
	}

	if (p.type === "start" || p.type === "stop") {
		if (p.type === "start" && p.targetId != null) {
			const targetAnim = inst.findAnimation
				? (inst.findAnimation as (...args: unknown[]) => unknown)(
						p.targetId,
						sId,
					)
				: null;
			if (targetAnim) {
				inst.playAnimationPatterns?.(targetAnim, bSurfId, sId);
			}
		} else if (p.type === "stop" && p.targetId != null) {
			inst.stopAnimation?.(sId, p.targetId);
		}
		return true;
	}

	if (p.type === "sound" || p.soundFile) {
		const soundPath = p.soundFile || p.file;
		if (soundPath) {
			const gc = (
				manager?.app as {
					ghostController?: {
						playSound?: (path: string) => void;
						[key: string]: unknown;
					};
				}
			)?.ghostController;
			gc?.playSound?.(soundPath);
		}
		return true;
	}

	if (
		p.type === "scaling" ||
		p.scaleX != null ||
		p.scaleY != null ||
		p.scale != null
	) {
		const scaleX = Number(
			p.scaleX ?? p.scale ?? (p.x !== undefined ? p.x : 100),
		);
		const scaleY = Number(
			p.scaleY ?? p.scale ?? (p.y !== undefined ? p.y : 100),
		);
		const setScale = inst.setScale || manager?.setScale;
		if (setScale) {
			(setScale as (...args: unknown[]) => unknown).call(
				inst,
				scaleX,
				scaleY,
				sId,
			);
		}
		const scheduler = inst.scheduler || manager?.scheduler;
		if (scheduler?.notifyFrameStep) {
			scheduler.notifyFrameStep(
				new FrameStepEvent({
					animationId: p.animationId || a?.id || 0,
					scopeId: sId,
					baseSurfaceId: bSurfId,
					pattern: p,
					elapsedMs: 0,
					offsetX: scaleX,
					offsetY: scaleY,
					isFinished: true,
				}),
			);
		}
		return true;
	}

	if (
		p.type === "move" ||
		p.moveX != null ||
		p.moveY != null ||
		p.offsetX != null
	) {
		const moveX = Number(p.moveX ?? p.offsetX ?? p.x ?? 0);
		const moveY = Number(p.moveY ?? p.offsetY ?? p.y ?? 0);
		if (inst._baseMoveOffsets) {
			inst._baseMoveOffsets.set(sId, { x: moveX, y: moveY });
		}
		const scheduler = inst.scheduler || manager?.scheduler;
		if (scheduler?.notifyFrameStep) {
			scheduler.notifyFrameStep(
				new FrameStepEvent({
					animationId: p.animationId || a?.id || 0,
					scopeId: sId,
					baseSurfaceId: bSurfId,
					pattern: p,
					elapsedMs: 0,
					offsetX: moveX,
					offsetY: moveY,
					isFinished: true,
				}),
			);
		}
		return true;
	}

	const animId = p.animationId || a?.id || 0;
	const animName = a?.name || p.name || animId;
	const getAnimOffset = inst.getAnimationOffset;
	const offset = getAnimOffset
		? ((getAnimOffset as (...args: unknown[]) => unknown).call(
				inst,
				sId,
				animName,
			) as { x?: number; y?: number } | undefined)
		: (getAnimationOffset(inst, sId, animName) as
				| { x?: number; y?: number }
				| undefined);

	const layerX = Number(p.x ?? p.offsetx ?? 0) + Number(offset?.x || 0);
	const layerY = Number(p.y ?? p.offsety ?? 0) + Number(offset?.y || 0);
	const resolvedSurfaceId = manager?.resolveSurfaceNumber
		? manager.resolveSurfaceNumber(surfaceId, sId)
		: surfaceId;
	const surfaceFile =
		p.file ||
		((p.placeholder as unknown) ||
		(opts as { placeholder?: unknown })?.placeholder
			? `data:image/png;base64,placeholder`
			: `surface${resolvedSurfaceId}.png`);
	const patType = String(p.type || p.method || "overlay").toLowerCase();

	const gc = (
		manager?.app as {
			ghostController?: {
				updateSurface?: (
					bSurfId: string | number,
					sId: number,
					layers: Array<{ file: string; x: number; y: number; type: string }>,
				) => Promise<unknown>;
				[key: string]: unknown;
			};
		}
	)?.ghostController;

	if (gc?.updateSurface) {
		await gc.updateSurface(bSurfId ?? surfaceId, sId, [
			{ file: surfaceFile, x: layerX, y: layerY, type: patType },
		]);
	}

	const renderAnimationFrameFn = inst.renderAnimationFrame;

	if (renderAnimationFrameFn) {
		(renderAnimationFrameFn as (...args: unknown[]) => unknown).call(
			inst,
			p,
			bSurfId,
			sId,
			opts,
		);
	} else if (manager?.renderSurfaceLayer) {
		manager.renderSurfaceLayer(surfaceId, surfaceFile, layerX, layerY, opts);
	}
	return true;
}
