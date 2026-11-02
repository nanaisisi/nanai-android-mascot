/**
 * @file animation-playback.js
 * @brief SERIKO アニメーションパターン再生・タイムライン描画・発話口パク制御モジュール
 */

import {
	buildAnimationTimeline,
	parseInterval,
	resolvePatternWait,
} from "../animation-parser.js";
import { patternSurfaceFile } from "../bind-menu.js";
import {
	findAnimation,
	getAnimationOffset,
	isAnimationPaused,
	isBlockedByExclusive,
	parseAnimationOptions,
} from "./animation-options.js";
import { createPlaceholderCanvas, FrameStepEvent } from "./scheduler-events.js";

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
 * アニメーションパターンの順次実行
 */
export function playAnimationPatterns(
	target,
	animOrBaseSurfaceId,
	baseSurfaceIdOrScopeId,
	scopeIdParam,
) {
	let instance, anim, baseSurfaceId, scopeId;
	if (isInstance(target)) {
		instance = target;
		anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdParam;
	} else {
		instance = this;
		anim = target;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
	}

	const isBlocked = instance.isBlockedByExclusive
		? instance.isBlockedByExclusive(scopeId, anim?.id)
		: isBlockedByExclusive(instance, scopeId, anim?.id);

	if (anim?.id != null && isBlocked) {
		return Promise.resolve();
	}

	const key = `${scopeId}__${baseSurfaceId}__${anim?.id ?? anim?.interval ?? ""}`;
	const running = instance._runningAnimations.get(key);
	const { kinds } = parseInterval(anim.interval);
	if (
		running &&
		!kinds.has("runonce") &&
		!kinds.has("yen-e") &&
		!kinds.has("endtalk")
	) {
		return running;
	}
	const playFn = instance._playAnimationPatterns
		? (...args) => instance._playAnimationPatterns(...args)
		: (...args) => _playAnimationPatterns(instance, ...args);

	const playing = playFn(anim, baseSurfaceId, scopeId, key).finally(() => {
		instance._runningAnimations.delete(key);
		instance._stoppedAnimations.delete(key);
	});
	instance._runningAnimations.set(key, playing);
	return playing;
}

export async function _playAnimationPatterns(
	target,
	animOrBaseSurfaceId,
	baseSurfaceIdOrScopeId,
	scopeIdOrKey,
	keyParam,
) {
	let instance, anim, baseSurfaceId, scopeId, key;
	if (isInstance(target)) {
		instance = target;
		anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyParam;
	} else {
		instance = this;
		anim = target;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
	}

	if (!anim.patterns?.length) return;
	const gc = instance.manager.app?.ghostController;
	if (!gc) return;
	const isCurrent = () =>
		!instance._stoppedAnimations.has(key) &&
		String(instance.manager.currentSurfaceIdFor(scopeId)) ===
			String(baseSurfaceId);

	const parsedOpts = instance.parseAnimationOptions
		? instance.parseAnimationOptions(anim.options)
		: parseAnimationOptions(anim.options);

	const options = {
		...parsedOpts,
		animId: anim.id,
	};

	// exclusive オプション処理: 他のアニメーションを停止しロック取得
	if (options.isExclusive) {
		instance._exclusiveLocks.set(scopeId, {
			animId: anim.id,
			targets: options.exclusiveTargets,
		});
		for (const [otherKey] of instance._runningAnimations.entries()) {
			if (otherKey !== key && otherKey.startsWith(`${scopeId}__`)) {
				const otherId = otherKey.split("__")[2];
				if (
					!options.exclusiveTargets ||
					options.exclusiveTargets.has(Number.parseInt(otherId, 10))
				) {
					instance._stoppedAnimations.add(otherKey);
				}
			}
		}
	}

	// shared-index 保持判定
	const sharedKey = `${scopeId}__${anim.id}`;
	const startIndex = options.isSharedIndex
		? instance._sharedIndices.get(sharedKey) || 0
		: 0;

	const currentOffset = instance.getAnimationOffset
		? instance.getAnimationOffset(scopeId, anim.id)
		: getAnimationOffset(instance, scopeId, anim.id);

	instance.scheduler?.notifyFrameStep(
		new FrameStepEvent({
			scopeId,
			baseSurfaceId,
			animationId: anim?.id ?? 0,
			pattern: anim.patterns[startIndex] || anim.patterns[0],
			elapsedMs: 0,
			isFinished: false,
			isBackground: options.isBackground,
			offsetX: currentOffset.x,
			offsetY: currentOffset.y,
		}),
	);

	const patternsToPlay =
		startIndex > 0 && startIndex < anim.patterns.length
			? anim.patterns.slice(startIndex)
			: anim.patterns;

	const timeline = await buildAnimationTimeline(patternsToPlay);
	let finalPatternIndex = 0;
	if (timeline) {
		const playFramesFn = instance._playTimelineFrames
			? (...args) => instance._playTimelineFrames(...args)
			: (...args) => _playTimelineFrames(instance, ...args);
		await playFramesFn(timeline, anim, baseSurfaceId, scopeId, key, options);
	} else {
		for (let i = 0; i < patternsToPlay.length; i++) {
			const pat = patternsToPlay[i];
			finalPatternIndex = startIndex + i;
			if (options.isSharedIndex) {
				instance._sharedIndices.set(sharedKey, finalPatternIndex);
			}
			const playOneFn = instance._playOnePat
				? (...args) => instance._playOnePat(...args)
				: (...args) => _playOnePat(instance, ...args);
			const cont = await playOneFn(
				pat,
				anim,
				baseSurfaceId,
				scopeId,
				key,
				isCurrent,
				options,
			);
			if (!cont) break;
		}
	}

	if (
		String(instance.manager.currentSurfaceIdFor(scopeId)) ===
		String(baseSurfaceId)
	) {
		await gc.updateSurface(baseSurfaceId, scopeId, []);
	}

	if (options.isExclusive) {
		if (instance._exclusiveLocks.get(scopeId)?.animId === anim.id) {
			instance._exclusiveLocks.delete(scopeId);
		}
	}

	instance.scheduler?.notifyFrameStep(
		new FrameStepEvent({
			scopeId,
			baseSurfaceId,
			animationId: anim?.id ?? 0,
			pattern: anim.patterns[anim.patterns.length - 1],
			elapsedMs: Date.now(),
			isFinished: true,
			isBackground: options.isBackground,
			offsetX: currentOffset.x,
			offsetY: currentOffset.y,
		}),
	);
}

export async function _playTimelineFrames(
	target,
	timelineOrAnim,
	animOrBaseSurfaceId,
	baseSurfaceIdOrScopeId,
	scopeIdOrKey,
	keyOrOptions,
	optionsParam = {},
) {
	let instance, timeline, anim, baseSurfaceId, scopeId, key, options;
	if (isInstance(target)) {
		instance = target;
		timeline = timelineOrAnim;
		anim = animOrBaseSurfaceId;
		baseSurfaceId = baseSurfaceIdOrScopeId;
		scopeId = scopeIdOrKey;
		key = keyOrOptions;
		options = optionsParam;
	} else {
		instance = this;
		timeline = target;
		anim = timelineOrAnim;
		baseSurfaceId = animOrBaseSurfaceId;
		scopeId = baseSurfaceIdOrScopeId;
		key = scopeIdOrKey;
		options = keyOrOptions || {};
	}

	if (!anim.patterns?.length || !timeline?.frames?.length) return;
	const isCurrent = () =>
		!instance._stoppedAnimations.has(key) &&
		String(instance.manager.currentSurfaceIdFor(scopeId)) ===
			String(baseSurfaceId);

	const pending = anim.patterns
		.slice()
		.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
	let prevAt = 0;
	for (let i = 0; i < pending.length && i < timeline.frames.length; i++) {
		const pat = pending[i];
		const at = timeline.frames[i] ?? prevAt;
		const dwell = Math.max(at - prevAt, 0);
		if (dwell > 0) await new Promise((r) => setTimeout(r, dwell));
		if (!isCurrent()) return;
		prevAt = at;

		const applyFn = instance._applyAnimationFrame
			? (...args) => instance._applyAnimationFrame(...args)
			: (...args) => _applyAnimationFrame(instance, ...args);

		const cont = await applyFn(
			pat,
			anim,
			baseSurfaceId,
			scopeId,
			key,
			isCurrent,
			options,
		);
		if (!cont) return;
	}
}

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

	// start, stop, alternativestart, alternativestop, parallelstart, parallelstop 制御メソッド
	const parseTargetIds = (param) => {
		if (!param) return [];
		const cleaned = String(param)
			.replace(/^[([]|[)\]]$/g, "")
			.trim();
		return cleaned
			.split(/[,.+ ]+/)
			.map((s) => Number.parseInt(s.trim(), 10))
			.filter((n) => !Number.isNaN(n));
	};

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
				const picked =
					targetIds[Math.floor(Math.random() * targetIds.length)];
				playById(picked, scopeId).catch(() => {});
			}
		} else if (patType.startsWith("alternativestop")) {
			if (targetIds.length > 0) {
				const picked =
					targetIds[Math.floor(Math.random() * targetIds.length)];
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

export async function _playOnePat(
	target,
	patOrAnim,
	animOrBaseSurfaceId,
	baseSurfaceIdOrScopeId,
	scopeIdOrKey,
	keyOrIsCurrent,
	isCurrentOrOptions,
	optionsParam = {},
) {
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

	const waitMs = resolvePatternWait(pat.wait);
	if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
	if (!isCurrent()) return false;
	const applyFn = instance._applyAnimationFrame
		? (...args) => instance._applyAnimationFrame(...args)
		: (...args) => _applyAnimationFrame(instance, ...args);
	return await applyFn(
		pat,
		anim,
		baseSurfaceId,
		scopeId,
		key,
		isCurrent,
		options,
	);
}

export function renderAnimationFrame(
	target,
	patOrBaseSurfaceId,
	baseSurfaceIdOrScopeId,
	scopeIdOrAnimOptions,
	animationOptionsParam = {},
) {
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

export async function playAnimationById(
	target,
	animIdOrNameOrScopeId,
	scopeIdOrWaitForComplete = 0,
	waitForCompleteParam = false,
) {
	let instance, animIdOrName, scopeId, waitForComplete;
	if (isInstance(target)) {
		instance = target;
		animIdOrName = animIdOrNameOrScopeId;
		scopeId = scopeIdOrWaitForComplete ?? 0;
		waitForComplete = waitForCompleteParam;
	} else {
		instance = this;
		animIdOrName = target;
		scopeId = animIdOrNameOrScopeId ?? 0;
		waitForComplete = scopeIdOrWaitForComplete ?? false;
	}

	const sid = String(instance.manager.currentSurfaceIdFor(scopeId));
	const anim = instance.findAnimation
		? instance.findAnimation(animIdOrName, scopeId)
		: findAnimation(instance, animIdOrName, scopeId);
	if (!anim) return;

	const playFn = instance.playAnimationPatterns
		? (...args) => instance.playAnimationPatterns(...args)
		: (...args) => playAnimationPatterns(instance, ...args);

	const playPromise = playFn(anim, sid, scopeId);
	if (waitForComplete) {
		await playPromise;
	}
}

/**
 * アニメーション完了まで待機 (\__w[animation,ID])
 * @param {any} target
 * @param {number|string} [animIdOrNameOrScopeId]
 * @param {number} [scopeIdParam=0]
 * @returns {Promise<void>}
 */
export async function waitForAnimation(
	target,
	animIdOrNameOrScopeId,
	scopeIdParam = 0,
) {
	let instance, animIdOrName, scopeId;
	if (isInstance(target)) {
		instance = target;
		animIdOrName = animIdOrNameOrScopeId;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		animIdOrName = target;
		scopeId = animIdOrNameOrScopeId ?? 0;
	}

	const anim = instance.findAnimation
		? instance.findAnimation(animIdOrName, scopeId)
		: findAnimation(instance, animIdOrName, scopeId);
	const id = anim ? anim.id : animIdOrName;
	const sid = String(instance.manager.currentSurfaceIdFor(scopeId));
	const key = `${scopeId}__${sid}__${id}`;
	const promise = instance._runningAnimations.get(key);
	if (promise) {
		await promise;
	}
}

export function onTalkStart(target = 0, scopeIdParam = 0) {
	let instance, scopeId;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	instance._spokenCount[scopeId] = 0;
	instance._talkStarted[scopeId] = true;
	if (instance.triggerAnimations) {
		instance.triggerAnimations(scopeId, "starttalk");
	}
}

export function onTalkEnd(target = 0, scopeIdParam = 0) {
	let instance, scopeId;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (instance._talkStarted[scopeId]) {
		if (instance.triggerAnimations) {
			instance.triggerAnimations(scopeId, "endtalk");
		}
	}
	instance._talkStarted[scopeId] = false;
}

export function onScriptEnd(target = 0, scopeIdParam = 0) {
	let instance, scopeId;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (instance.triggerAnimations) {
		instance.triggerAnimations(scopeId, "yen-e");
	}
}

export function onCharSpoken(target = 0, scopeIdParam = 0) {
	let instance, scopeId;
	if (isInstance(target)) {
		instance = target;
		scopeId = scopeIdParam ?? 0;
	} else {
		instance = this;
		scopeId = target ?? 0;
	}

	if (!instance._talkStarted[scopeId]) {
		if (instance.onTalkStart) {
			instance.onTalkStart(scopeId);
		} else {
			onTalkStart(instance, scopeId);
		}
	}

	instance._spokenCount[scopeId] = (instance._spokenCount[scopeId] || 0) + 1;
	const anims = instance.animationsForTrigger
		? instance.animationsForTrigger(scopeId, "talk")
		: [];

	for (const { anim, sid, param } of anims) {
		const n = Math.max(param || 1, 1);
		if (instance._spokenCount[scopeId] % n === 0) {
			const playFn = instance.playAnimationPatterns
				? (...args) => instance.playAnimationPatterns(...args)
				: (...args) => playAnimationPatterns(instance, ...args);
			playFn(anim, sid, scopeId)?.catch?.(() => {});
		}
	}
}
