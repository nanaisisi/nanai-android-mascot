/**
 * @file surface-animation-manager.js
 * @brief SERIKO アニメーションおよび発話口パク管理クラス
 */

import {
	buildAnimationTimeline,
	parseInterval,
	resolvePatternWait,
} from "./animation-parser.js";
import { patternSurfaceFile } from "./bind-menu.js";
import { surfaceAnimationTimers } from "./surface-animation-timers.js";

// Re-export helper functions for backwards compatibility
export { buildAnimationTimeline, parseInterval, resolvePatternWait };

/**
 * SERIKO フレーム更新ステップイベント (Slot-08 外部インターフェース規約)
 */
export class FrameStepEvent {
	/**
	 * @param {object} params
	 * @param {number} params.scopeId
	 * @param {number|string} params.baseSurfaceId
	 * @param {number|string} params.animationId
	 * @param {object} params.pattern
	 * @param {number} params.elapsedMs
	 * @param {boolean} params.isFinished
	 */
	constructor({
		scopeId,
		baseSurfaceId,
		animationId,
		pattern,
		elapsedMs,
		isFinished,
		isBackground = false,
	}) {
		this.scopeId = scopeId;
		this.baseSurfaceId = baseSurfaceId;
		this.animationId = animationId;
		this.pattern = pattern;
		this.elapsedMs = elapsedMs;
		this.isFinished = isFinished;
		this.isBackground = isBackground;
	}
}

/**
 * SERIKO アニメーションスケジューラ (Slot-08 外部インターフェース規約)
 */
export class AnimationScheduler {
	/**
	 * @param {SurfaceAnimationManager} animationManager
	 */
	constructor(animationManager) {
		this.animationManager = animationManager;
		/** @type {Set<(event: FrameStepEvent) => void>} */
		this.listeners = new Set();
	}

	onFrameStep(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	notifyFrameStep(event) {
		for (const listener of this.listeners) {
			try {
				listener(event);
			} catch (err) {
				console.error("Error in AnimationScheduler frame listener:", err);
			}
		}
	}
}

/**
 * ダミープレースホルダーCanvas生成 (Slot-08 先行構築・画像バッファ未存在時フォールバック)
 * @param {number} width
 * @param {number} height
 * @param {string} color
 * @returns {HTMLCanvasElement}
 */
export function createPlaceholderCanvas(
	width = 200,
	height = 400,
	color = "rgba(0,0,0,0)",
) {
	if (typeof document === "undefined") {
		return {
			width,
			height,
			toDataURL: () => "data:image/png;base64,mockPlaceholder",
		};
	}
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (ctx) {
		ctx.fillStyle = color;
		ctx.fillRect(0, 0, width, height);
	}
	return canvas;
}

export class SurfaceAnimationManager {
	/**
	 * @param {import('./surface.js').SurfaceManager} manager
	 */
	constructor(manager) {
		this.manager = manager;
		/** @type {Record<number, any[]>} */
		this.activeAnimationTimers = {};
		this._spokenCount = {};
		this._talkStarted = {};
		/** @type {Map<string, boolean>} `\![anim,pause,ID]` で一時停止中のアニメーション */
		this.pausedAnimations = new Map();
		/** @type {Map<string, Promise<void>>} 再生中のアニメーション */
		this._runningAnimations = new Map();
		this._stoppedAnimations = new Set();
		/** @type {Map<number, { animId: number|string, targets: Set<number>|null }>} exclusive 排他ロック中のアニメーション (scopeId -> exclusive info) */
		this._exclusiveLocks = new Map();
		/** @type {Map<string, number>} shared-index 保持テーブル (`${scopeId}__${animId}` -> lastPatternIndex) */
		this._sharedIndices = new Map();
		/** @type {Map<string, { x: number, y: number }>} \![anim,offset,ID,x,y] による動的オフセット (`${scopeId}__${animId}`) */
		this._animationOffsets = new Map();
		/** @type {AnimationScheduler} Slot-08 外部インターフェース規約スケジューラ */
		this.scheduler = new AnimationScheduler(this);
	}

	/**
	 * animation*.option 文字列配列を解析
	 * @param {string[]|undefined} options
	 * @returns {{ isExclusive: boolean, exclusiveTargets: Set<number>|null, isBackground: boolean, isSharedIndex: boolean }}
	 */
	parseAnimationOptions(options = []) {
		let isExclusive = false;
		let exclusiveTargets = null;
		let isBackground = false;
		let isSharedIndex = false;

		for (const raw of options) {
			const str = String(raw).trim().toLowerCase();
			for (const part of str.split("+")) {
				const trimmed = part.trim();
				if (trimmed.startsWith("exclusive")) {
					isExclusive = true;
					const match = trimmed.match(/\(([\d,\s]+)\)/);
					if (match) {
						const targets = new Set(
							match[1]
								.split(",")
								.map((s) => Number.parseInt(s.trim(), 10))
								.filter((n) => !Number.isNaN(n)),
						);
						if (targets.size > 0) exclusiveTargets = targets;
					}
				} else if (trimmed.startsWith("background")) {
					isBackground = true;
				} else if (
					trimmed.startsWith("shared-index") ||
					trimmed.startsWith("shared_index")
				) {
					isSharedIndex = true;
				}
			}
		}

		return { isExclusive, exclusiveTargets, isBackground, isSharedIndex };
	}

	/**
	 * 指定アニメーションが現在排他ロックにより開始をブロックされているか
	 * @param {number} scopeId
	 * @param {number|string} animId
	 * @returns {boolean}
	 */
	isBlockedByExclusive(scopeId = 0, animId) {
		const lock = this._exclusiveLocks.get(scopeId);
		if (!lock) return false;
		const targetId = Number.parseInt(animId, 10);
		if (lock.targets) {
			return lock.targets.has(targetId);
		}
		return String(lock.animId) !== String(animId);
	}

	/**
	 * アニメーション定義を検索（IDまたはname文字列による）
	 * @param {number|string} animIdOrName
	 * @param {number} [scopeId]
	 * @returns {object|null}
	 */
	findAnimation(animIdOrName, scopeId = 0) {
		const sid = String(this.manager.currentSurfaceIdFor(scopeId));
		const animList =
			this.manager.animations?.[sid] || this.manager.animations?.default || [];
		const targetStr = String(animIdOrName).trim().toLowerCase();
		const targetNum = Number.parseInt(targetStr, 10);
		return (
			animList.find((a) => {
				if (!Number.isNaN(targetNum) && a.id === targetNum) return true;
				if (String(a.id).toLowerCase() === targetStr) return true;
				if (a.name && String(a.name).trim().toLowerCase() === targetStr)
					return true;
				return false;
			}) || null
		);
	}

	stopAnimations(scopeId = 0) {
		surfaceAnimationTimers.stopAnimations.call(this, scopeId);
		for (const key of [...this._animationOffsets.keys()]) {
			if (key.startsWith(`${scopeId}__`)) {
				this._animationOffsets.delete(key);
			}
		}
	}

	/**
	 * 特定のアニメーションのみ停止 (\![anim,stop,ID] / \![anim,clear,ID])
	 * @param {number} [scopeId]
	 * @param {number|string} animIdOrName
	 */
	stopAnimation(scopeId = 0, animIdOrName) {
		const anim = this.findAnimation(animIdOrName, scopeId);
		const id = anim ? anim.id : animIdOrName;
		const prefix = `${scopeId}__`;
		for (const key of this._runningAnimations.keys()) {
			if (key.startsWith(prefix)) {
				const parts = key.split("__");
				if (parts[2] === String(id)) {
					this._stoppedAnimations.add(key);
				}
			}
		}
	}

	/**
	 * アニメーションの動的オフセット設定 (\![anim,offset,ID,x,y])
	 * @param {number} scopeId
	 * @param {number|string} animIdOrName
	 * @param {number} x
	 * @param {number} y
	 */
	setAnimationOffset(scopeId = 0, animIdOrName, x = 0, y = 0) {
		const anim = this.findAnimation(animIdOrName, scopeId);
		const id = anim ? anim.id : animIdOrName;
		this._animationOffsets.set(`${scopeId}__${id}`, { x, y });
	}

	/**
	 * アニメーションの動的オフセット取得
	 * @param {number} scopeId
	 * @param {number|string} animIdOrName
	 * @returns {{ x: number, y: number }}
	 */
	getAnimationOffset(scopeId = 0, animIdOrName) {
		const anim = this.findAnimation(animIdOrName, scopeId);
		const id = anim ? anim.id : animIdOrName;
		return this._animationOffsets.get(`${scopeId}__${id}`) || { x: 0, y: 0 };
	}

	pauseAnimation(scopeId = 0, animIdOrName) {
		const anim = this.findAnimation(animIdOrName, scopeId);
		const id = anim ? anim.id : animIdOrName;
		surfaceAnimationTimers.pauseAnimation.call(this, scopeId, id);
	}

	resumeAnimation(scopeId = 0, animIdOrName) {
		const anim = this.findAnimation(animIdOrName, scopeId);
		const id = anim ? anim.id : animIdOrName;
		surfaceAnimationTimers.resumeAnimation.call(this, scopeId, id);
	}

	isAnimationPaused(scopeId = 0, animIdOrName) {
		const anim = this.findAnimation(animIdOrName, scopeId);
		const id = anim ? anim.id : animIdOrName;
		return surfaceAnimationTimers.isAnimationPaused.call(this, scopeId, id);
	}

	clearPausedAnimations(scopeId = 0) {
		surfaceAnimationTimers.clearPausedAnimations.call(this, scopeId);
	}

	startAnimations(surfaceId, scopeId = 0) {
		surfaceAnimationTimers.startAnimations.call(this, surfaceId, scopeId);
	}

	scheduleAnimation(anim, surfaceId, scopeId) {
		surfaceAnimationTimers.scheduleAnimation.call(
			this,
			anim,
			surfaceId,
			scopeId,
		);
	}

	animationsForTrigger(scopeId, kind) {
		return surfaceAnimationTimers.animationsForTrigger.call(
			this,
			scopeId,
			kind,
		);
	}

	triggerAnimations(scopeId, kind) {
		surfaceAnimationTimers.triggerAnimations.call(this, scopeId, kind);
	}

	/**
	 * アニメーションパターンの順次実行
	 */
	playAnimationPatterns(anim, baseSurfaceId, scopeId) {
		if (anim?.id != null && this.isBlockedByExclusive(scopeId, anim.id)) {
			return Promise.resolve();
		}

		const key = `${scopeId}__${baseSurfaceId}__${anim?.id ?? anim?.interval ?? ""}`;
		const running = this._runningAnimations.get(key);
		const { kinds } = parseInterval(anim.interval);
		if (
			running &&
			!kinds.has("runonce") &&
			!kinds.has("yen-e") &&
			!kinds.has("endtalk")
		) {
			return running;
		}
		const playing = this._playAnimationPatterns(
			anim,
			baseSurfaceId,
			scopeId,
			key,
		).finally(() => {
			this._runningAnimations.delete(key);
			this._stoppedAnimations.delete(key);
		});
		this._runningAnimations.set(key, playing);
		return playing;
	}

	async _playAnimationPatterns(anim, baseSurfaceId, scopeId, key) {
		if (!anim.patterns?.length) return;
		const gc = this.manager.app?.ghostController;
		if (!gc) return;
		const isCurrent = () =>
			!this._stoppedAnimations.has(key) &&
			String(this.manager.currentSurfaceIdFor(scopeId)) ===
				String(baseSurfaceId);

		const options = {
			...this.parseAnimationOptions(anim.options),
			animId: anim.id,
		};

		// exclusive オプション処理: 他のアニメーションを停止しロック取得
		if (options.isExclusive) {
			this._exclusiveLocks.set(scopeId, {
				animId: anim.id,
				targets: options.exclusiveTargets,
			});
			for (const [otherKey] of this._runningAnimations.entries()) {
				if (otherKey !== key && otherKey.startsWith(`${scopeId}__`)) {
					const otherId = otherKey.split("__")[2];
					if (
						!options.exclusiveTargets ||
						options.exclusiveTargets.has(Number.parseInt(otherId, 10))
					) {
						this._stoppedAnimations.add(otherKey);
					}
				}
			}
		}

		// shared-index 保持判定
		const sharedKey = `${scopeId}__${anim.id}`;
		const startIndex = options.isSharedIndex
			? this._sharedIndices.get(sharedKey) || 0
			: 0;

		const currentOffset = this.getAnimationOffset(scopeId, anim.id);

		this.scheduler?.notifyFrameStep(
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
			await this._playTimelineFrames(
				timeline,
				anim,
				baseSurfaceId,
				scopeId,
				key,
				options,
			);
		} else {
			for (let i = 0; i < patternsToPlay.length; i++) {
				const pat = patternsToPlay[i];
				finalPatternIndex = startIndex + i;
				if (options.isSharedIndex) {
					this._sharedIndices.set(sharedKey, finalPatternIndex);
				}
				const cont = await this._playOnePat(
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
			String(this.manager.currentSurfaceIdFor(scopeId)) ===
			String(baseSurfaceId)
		) {
			await gc.updateSurface(baseSurfaceId, scopeId, []);
		}

		if (options.isExclusive) {
			if (this._exclusiveLocks.get(scopeId)?.animId === anim.id) {
				this._exclusiveLocks.delete(scopeId);
			}
		}

		this.scheduler?.notifyFrameStep(
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

	async _playTimelineFrames(
		timeline,
		anim,
		baseSurfaceId,
		scopeId,
		key,
		options = {},
	) {
		if (!anim.patterns?.length || !timeline?.frames?.length) return;
		const isCurrent = () =>
			!this._stoppedAnimations.has(key) &&
			String(this.manager.currentSurfaceIdFor(scopeId)) ===
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

			const cont = await this._applyAnimationFrame(
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

	async _applyAnimationFrame(
		pat,
		anim,
		baseSurfaceId,
		scopeId,
		key,
		isCurrent,
		options = {},
	) {
		const gc = this.manager.app?.ghostController;
		if (!gc) return false;

		if (anim?.id != null && this.isAnimationPaused(scopeId, anim.id)) {
			while (this.isAnimationPaused(scopeId, anim.id)) {
				if (!isCurrent()) return false;
				await new Promise((r) => setTimeout(r, 120));
			}
			if (!isCurrent()) return false;
		}

		const patSurface = String(pat.surface).trim();
		if (patSurface === "-1") return false;
		if (patSurface === "-2") {
			for (const otherKey of this._runningAnimations.keys()) {
				if (otherKey !== key && otherKey.startsWith(`${scopeId}__`)) {
					this._stoppedAnimations.add(otherKey);
				}
			}
			return true;
		}

		const framePromise = this.renderAnimationFrame(
			pat,
			baseSurfaceId,
			scopeId,
			options,
		);
		if (framePromise) {
			await framePromise;
		} else if (patSurface && patSurface !== "-1" && patSurface !== "-2") {
			// 通常のサーフィス更新またはプレースホルダー描画
			await gc.updateSurface(patSurface, scopeId, null);
		}

		const currentOffset = this.getAnimationOffset(scopeId, anim?.id ?? 0);
		this.scheduler?.notifyFrameStep(
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

	async _playOnePat(
		pat,
		anim,
		baseSurfaceId,
		scopeId,
		key,
		isCurrent,
		options = {},
	) {
		const waitMs = resolvePatternWait(pat.wait);
		if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
		if (!isCurrent()) return false;
		return await this._applyAnimationFrame(
			pat,
			anim,
			baseSurfaceId,
			scopeId,
			key,
			isCurrent,
			options,
		);
	}

	renderAnimationFrame(pat, baseSurfaceId, scopeId, animationOptions = {}) {
		if (baseSurfaceId === -1 || baseSurfaceId === "-1") return false;
		const resolved = this.manager.resolveSurfaceNumber(pat.surface, scopeId);
		const file = pat.placeholder === true ? null : patternSurfaceFile(resolved);
		const gc = this.manager.app?.ghostController;
		if (!gc) return false;

		const patType = (pat.type || "overlay").toLowerCase();
		const options = pat.options ? [...pat.options] : [];
		if (animationOptions.isBackground) {
			options.push("background");
		}

		const offset = this.getAnimationOffset(
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

	async playAnimationById(animIdOrName, scopeId = 0, waitForComplete = false) {
		const sid = String(this.manager.currentSurfaceIdFor(scopeId));
		const anim = this.findAnimation(animIdOrName, scopeId);
		if (!anim) return;

		const playPromise = this.playAnimationPatterns(anim, sid, scopeId);
		if (waitForComplete) {
			await playPromise;
		}
	}

	/**
	 * アニメーション完了まで待機 (\__w[animation,ID])
	 * @param {number|string} animIdOrName
	 * @param {number} [scopeId]
	 * @returns {Promise<void>}
	 */
	async waitForAnimation(animIdOrName, scopeId = 0) {
		const anim = this.findAnimation(animIdOrName, scopeId);
		const id = anim ? anim.id : animIdOrName;
		const sid = String(this.manager.currentSurfaceIdFor(scopeId));
		const key = `${scopeId}__${sid}__${id}`;
		const promise = this._runningAnimations.get(key);
		if (promise) {
			await promise;
		}
	}

	onTalkStart(scopeId = 0) {
		this._spokenCount[scopeId] = 0;
		this._talkStarted[scopeId] = true;
		this.triggerAnimations(scopeId, "starttalk");
	}

	onTalkEnd(scopeId = 0) {
		if (this._talkStarted[scopeId]) {
			this.triggerAnimations(scopeId, "endtalk");
		}
		this._talkStarted[scopeId] = false;
	}

	onScriptEnd(scopeId = 0) {
		this.triggerAnimations(scopeId, "yen-e");
	}

	onCharSpoken(scopeId = 0) {
		if (!this._talkStarted[scopeId]) this.onTalkStart(scopeId);

		this._spokenCount[scopeId] = (this._spokenCount[scopeId] || 0) + 1;
		for (const { anim, sid, param } of this.animationsForTrigger(
			scopeId,
			"talk",
		)) {
			const n = Math.max(param || 1, 1);
			if (this._spokenCount[scopeId] % n === 0) {
				this.playAnimationPatterns(anim, sid, scopeId).catch(() => {});
			}
		}
	}
}
