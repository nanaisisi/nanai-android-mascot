/**
 * @file playback-apply.js
 * @brief SERIKO アニメーションフレーム適用・制御処理モジュール
 */

import {
	getAnimationOffset,
	isAnimationPaused,
	stopAnimation,
} from "../animation-options.js";
import { FrameStepEvent } from "../scheduler-events.js";
import { playAnimationById } from "./playback-control.js";
import { renderAnimationFrame } from "./playback-render.js";

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
 * 制御メソッドのターゲットID文字列をパース
 * @param {any} param
 * @returns {number[]}
 */
function parseTargetIds(param) {
	if (!param) return [];
	const cleaned = String(param)
		.replace(/^[([]|[)\]]$/g, "")
		.trim();
	return cleaned
		.split(/[,.+ ]+/)
		.map((s) => Number.parseInt(s.trim(), 10))
		.filter((n) => !Number.isNaN(n));
}

/**
 * SERIKO アニメーションフレーム適用（一時停止確認、特殊サーフィス、制御メソッド、描画呼出）
 * @param {any} target
 * @param {any} patOrAnim
 * @param {any} animOrBaseSurfaceId
 * @param {any} baseSurfaceIdOrScopeId
 * @param {any} scopeIdOrKey
 * @param {any} keyOrIsCurrent
 * @param {any} [isCurrentOrOptions]
 * @param {any} [optionsParam={}]
 * @returns {Promise<boolean>}
 */
export async function _applyAnimationFrame(
	target,
	patOrAnim,
	animOrBaseSurfaceId,
	baseSurfaceIdOrScopeId,
	scopeIdOrKey,
	keyOrIsCurrent,
	isCurrentOrOptions,
	optionsParam = {},
) {
	// biome-ignore lint/suspicious/noImplicitAnyLet: automated fix
	let instance, pat, anim, baseSurfaceId, scopeId, key, isCurrent, options;
	if (isInstance(target)) {
		instance = target;
		pat = patOrAnim;
		anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyOrIsCurrent;
		isCurrent = isCurrentOrOptions;
		options = optionsParam;
	} else {
		instance = this;
		pat = target;
		anim = patOrAnim;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
		isCurrent = keyOrIsCurrent;
		options = isCurrentOrOptions || {};
	}

	const gc = instance.manager.app?.ghostController;
	if (!gc) return false;

	const checkPaused = () =>
		instance.isAnimationPaused
			? instance.isAnimationPaused(scopeId, anim.id)
			: isAnimationPaused(instance, scopeId, anim.id);

	if (anim?.id != null && checkPaused()) {
		while (checkPaused()) {
			if (!isCurrent()) return false;
			await new Promise((r) => setTimeout(r, 120));
		}
		if (!isCurrent()) return false;
	}

	const patSurface = String(pat.surface).trim();
	if (patSurface === "-1") return false;
	if (patSurface === "-2") {
		for (const otherKey of instance._runningAnimations.keys()) {
			if (otherKey !== key && otherKey.startsWith(`${scopeId}__`)) {
				instance._stoppedAnimations.add(otherKey);
			}
		}
		return true;
	}

	const patType = (pat.type || "overlay").toLowerCase();

	if (patType === "move") {
		// UKADOC: move メソッド - ベースレイヤの表示位置を指定座標分ずらす (瞬間移動)
		// サーフェスIDは無視され、(pat.x, pat.y) をベースオフセットとして適用
		const moveX = pat.x ?? 0;
		const moveY = pat.y ?? 0;
		if (instance.manager?.setBaseMoveOffset) {
			instance.manager.setBaseMoveOffset(scopeId, moveX, moveY);
		} else if (instance._baseMoveOffsets) {
			instance._baseMoveOffsets.set(scopeId, { x: moveX, y: moveY });
		}
		// 画面上のコンテナやプレースホルダーのトランスフォーム/マージンに反映
		if (gc?.setScopeMoveOffset) {
			gc.setScopeMoveOffset(scopeId, moveX, moveY);
		} else if (typeof document !== "undefined") {
			const selector =
				scopeId === 0
					? "ghost-display"
					: scopeId === 1
						? "kero-display"
						: `char-display-${scopeId}`;
			const el = document.getElementById(selector);
			if (el) {
				el.style.transform = `translate(${moveX}px, ${moveY}px)`;
			}
		}

		instance.scheduler?.notifyFrameStep(
			new FrameStepEvent({
				scopeId,
				baseSurfaceId,
				animationId: anim?.id ?? 0,
				pattern: pat,
				elapsedMs: Date.now(),
				isFinished: false,
				isBackground: options.isBackground,
				offsetX: moveX,
				offsetY: moveY,
			}),
		);
		return true;
	}

	if (patType === "scaling") {
		// UKADOC: scaling メソッド - キャラクターウインドウを指定した倍率(%)で拡大縮小表示
		// pat.x: 横倍率(%), pat.y: 縦倍率(%)
		const scaleX = pat.x ?? 100;
		const scaleY = pat.y ?? scaleX;
		if (instance.manager?.setScale) {
			instance.manager.setScale(scaleX, scaleY, scopeId);
		} else if (instance._baseScalingOffsets) {
			instance._baseScalingOffsets.set(scopeId, { scaleX, scaleY });
		}
		if (gc?.setScopeScale) {
			gc.setScopeScale(scopeId, scaleX, scaleY);
		} else if (typeof document !== "undefined") {
			const selector =
				scopeId === 0
					? "ghost-display"
					: scopeId === 1
						? "kero-display"
						: `char-display-${scopeId}`;
			const el = document.getElementById(selector);
			if (el) {
				el.style.transform = `scale(${scaleX / 100}, ${scaleY / 100})`;
			}
		}

		instance.scheduler?.notifyFrameStep(
			new FrameStepEvent({
				scopeId,
				baseSurfaceId,
				animationId: anim?.id ?? 0,
				pattern: pat,
				elapsedMs: Date.now(),
				isFinished: false,
				isBackground: options.isBackground,
				offsetX: scaleX,
				offsetY: scaleY,
			}),
		);
		return true;
	}

	// start, stop, alternativestart, alternativestop, parallelstart, parallelstop 制御メソッド
	if (
		patType.startsWith("start") ||
		patType.startsWith("stop") ||
		patType.startsWith("alternativestart") ||
		patType.startsWith("alternativestop") ||
		patType.startsWith("parallelstart") ||
		patType.startsWith("parallelstop")
	) {
		const targetRaw = pat.targetParam || patSurface;
		const targetIds = parseTargetIds(targetRaw);

		const playById = (...args) =>
			instance.playAnimationById
				? instance.playAnimationById(...args)
				: playAnimationById(instance, ...args);

		const stopAnim = (...args) =>
			instance.stopAnimation
				? instance.stopAnimation(...args)
				: stopAnimation(instance, ...args);

		if (patType.startsWith("alternativestart")) {
			if (targetIds.length > 0) {
				const picked = targetIds[Math.floor(Math.random() * targetIds.length)];
				playById(picked, scopeId).catch(() => {});
			}
		} else if (patType.startsWith("alternativestop")) {
			if (targetIds.length > 0) {
				const picked = targetIds[Math.floor(Math.random() * targetIds.length)];
				stopAnim(scopeId, picked);
			}
		} else if (patType.startsWith("parallelstart")) {
			for (const id of targetIds) {
				playById(id, scopeId).catch(() => {});
			}
		} else if (patType.startsWith("parallelstop")) {
			for (const id of targetIds) {
				stopAnim(scopeId, id);
			}
		} else if (patType.startsWith("start")) {
			if (targetIds.length > 0) {
				playById(targetIds[0], scopeId).catch(() => {});
			}
		} else if (patType.startsWith("stop")) {
			if (targetIds.length > 0) {
				stopAnim(scopeId, targetIds[0]);
			}
		}
		return true;
	}

	const renderFn = instance.renderAnimationFrame
		? (...args) => instance.renderAnimationFrame(...args)
		: (...args) => renderAnimationFrame(instance, ...args);

	const framePromise = renderFn(pat, baseSurfaceId, scopeId, options);
	if (framePromise) {
		await framePromise;
	} else if (patSurface && patSurface !== "-1" && patSurface !== "-2") {
		// 通常のサーフィス更新またはプレースホルダー描画
		await gc.updateSurface(patSurface, scopeId, null);
	}

	const currentOffset = instance.getAnimationOffset
		? instance.getAnimationOffset(scopeId, anim?.id ?? 0)
		: getAnimationOffset(instance, scopeId, anim?.id ?? 0);

	instance.scheduler?.notifyFrameStep(
		new FrameStepEvent({
			scopeId,
			baseSurfaceId,
			animationId: anim?.id ?? 0,
			pattern: pat,
			elapsedMs: Date.now(),
			isFinished: false,
			isBackground: options.isBackground,
			offsetX: currentOffset.x,
			offsetY: currentOffset.y,
		}),
	);
	return true;
}
