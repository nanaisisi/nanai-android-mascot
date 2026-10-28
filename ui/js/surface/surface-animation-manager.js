/**
 * SERIKOアニメーションおよび発話口パク管理
 */

import {
	buildAnimationTimeline,
	parseInterval,
	resolvePatternWait,
} from "./animation-parser.js";
import { patternSurfaceFile } from "./bind-menu.js";

// Re-export helper functions for backwards compatibility
export { buildAnimationTimeline, parseInterval, resolvePatternWait };

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
		/** @type {Map<string, boolean>} `\![anim,pause,ID]` で一時停止中のアニメーション (key: scopeId__animId) */
		this.pausedAnimations = new Map();
		/** @type {Map<string, Promise<void>>} 再生中のアニメーション（多重起動防止） */
		this._runningAnimations = new Map();
		this._stoppedAnimations = new Set();
	}

	/**
	 * 指定スコープのアクティブなアニメーションタイマーをすべて停止
	 */
	stopAnimations(scopeId = 0) {
		const timers = this.activeAnimationTimers[scopeId] || [];
		timers.forEach((t) => {
			clearTimeout(t);
			clearInterval(t);
		});
		this.activeAnimationTimers[scopeId] = [];
		this.clearPausedAnimations(scopeId);
	}

	/**
	 * `\![anim,pause,ID]` (SSP): アニメーションの一時停止 (サーフィス変更まで有効)
	 * @param {number} scopeId
	 * @param {number|string} animId
	 */
	pauseAnimation(scopeId = 0, animId) {
		this.pausedAnimations.set(`${scopeId}__${animId}`, true);
	}

	/**
	 * `\![anim,resume,ID]` (SSP): 一時停止の解除
	 * @param {number} scopeId
	 * @param {number|string} animId
	 */
	resumeAnimation(scopeId = 0, animId) {
		this.pausedAnimations.delete(`${scopeId}__${animId}`);
	}

	/**
	 * 指定スコープのアニメーションが一時停止中か
	 * @param {number} scopeId
	 * @param {number|string} animId
	 */
	isAnimationPaused(scopeId = 0, animId) {
		return this.pausedAnimations.get(`${scopeId}__${animId}`) === true;
	}

	/**
	 * スコープ全体の一時停止状態をクリア（サーフィス変更 (\s) 時）
	 * @param {number} scopeId
	 */
	clearPausedAnimations(scopeId = 0) {
		for (const key of [...this.pausedAnimations.keys()]) {
			if (key.startsWith(`${scopeId}__`)) {
				this.pausedAnimations.delete(key);
			}
		}
	}

	/**
	 * 指定サーフィスのアニメーション定義（SERIKO）を開始
	 */
	startAnimations(surfaceId, scopeId = 0) {
		const sid = String(surfaceId);
		const animList =
			this.manager.animations[sid] || this.manager.animations.default || [];
		if (!animList.length) return;

		if (!this.activeAnimationTimers[scopeId]) {
			this.activeAnimationTimers[scopeId] = [];
		}

		animList.forEach((anim) => {
			this.scheduleAnimation(anim, surfaceId, scopeId);
		});
	}

	/**
	 * アニメーションの interval 指定に応じたタイマースケジュール (UKADOC準拠)
	 */
	scheduleAnimation(anim, surfaceId, scopeId) {
		const { kinds, param } = parseInterval(anim.interval);
		const isCurrent = () =>
			String(this.manager.currentSurfaceIdFor(scopeId)) === String(surfaceId);
		const play = () => this.playAnimationPatterns(anim, surfaceId, scopeId);

		if (kinds.has("bind")) {
			if (kinds.size === 1) return;
			if (!this.manager.isBindAnimationActive?.(scopeId, anim.id, surfaceId)) {
				return;
			}
		}

		if (kinds.has("runonce")) {
			const timer = setTimeout(async () => {
				if (isCurrent()) await play();
			}, 30);
			this.activeAnimationTimers[scopeId].push(timer);
		}

		if (kinds.has("periodic")) {
			const sec = Math.max(param || 4, 0.5);
			const timer = setInterval(async () => {
				if (isCurrent()) await play();
			}, sec * 1000);
			this.activeAnimationTimers[scopeId].push(timer);
		}

		if (kinds.has("always")) {
			const loop = async () => {
				if (!isCurrent()) return;
				await play();
				if (isCurrent()) {
					const timer = setTimeout(loop, 50);
					this.activeAnimationTimers[scopeId].push(timer);
				}
			};
			loop();
		}

		let probability = null;
		if (kinds.has("sometimes")) probability = 0.5;
		if (kinds.has("rarely")) probability = 0.25;
		if (kinds.has("random")) probability = 1 / (param > 0 ? param : 2);
		if (probability == null) return;

		const timer = setInterval(async () => {
			if (isCurrent() && Math.random() <= probability) await play();
		}, 1000);
		this.activeAnimationTimers[scopeId].push(timer);
	}

	/**
	 * 現在サーフィスのうち、指定インターバル種別を含むアニメーション
	 * @param {number} scopeId
	 * @param {string} kind
	 */
	animationsForTrigger(scopeId, kind) {
		const sid = String(this.manager.currentSurfaceIdFor(scopeId));
		const animList =
			this.manager.animations[sid] || this.manager.animations.default || [];
		return animList
			.map((anim) => ({ anim, sid, ...parseInterval(anim.interval) }))
			.filter(
				({ anim, kinds }) =>
					kinds.has(kind) &&
					(!kinds.has("bind") ||
						this.manager.isBindAnimationActive?.(scopeId, anim.id, sid)),
			);
	}

	/**
	 * starttalk / endtalk / yen-e などの単発トリガーを実行
	 * @param {number} scopeId
	 * @param {string} kind
	 */
	triggerAnimations(scopeId, kind) {
		for (const { anim, sid } of this.animationsForTrigger(scopeId, kind)) {
			this.playAnimationPatterns(anim, sid, scopeId).catch(() => {});
		}
	}

	/**
	 * アニメーションパターンの順次実行
	 */
	playAnimationPatterns(anim, baseSurfaceId, scopeId) {
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

		const timeline = await buildAnimationTimeline(anim.patterns);
		if (timeline) {
			await this._playTimelineFrames(
				timeline,
				anim,
				baseSurfaceId,
				scopeId,
				key,
			);
		} else {
			for (const pat of anim.patterns) {
				const cont = await this._playOnePat(
					pat,
					anim,
					baseSurfaceId,
					scopeId,
					key,
					isCurrent,
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
	}

	async _playTimelineFrames(timeline, anim, baseSurfaceId, scopeId, key) {
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

		const framePromise = this.renderAnimationFrame(pat, baseSurfaceId, scopeId);
		if (framePromise) {
			await framePromise;
		} else {
			await gc.updateSurface(patSurface, scopeId, null);
		}
		return true;
	}

	async _playOnePat(pat, anim, baseSurfaceId, scopeId, key, isCurrent) {
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
		);
	}

	renderAnimationFrame(pat, baseSurfaceId, scopeId) {
		if (baseSurfaceId === -1 || baseSurfaceId === "-1") return false;
		const resolved = this.manager.resolveSurfaceNumber(pat.surface, scopeId);
		const file = patternSurfaceFile(resolved);
		if (!file) return false;
		const gc = this.manager.app?.ghostController;
		if (!gc) return false;
		return Promise.resolve(
			gc.updateSurface(baseSurfaceId, scopeId, [
				{
					file,
					x: pat.x ?? 0,
					y: pat.y ?? 0,
					type: pat.type ?? "overlay",
				},
			]),
		);
	}

	async playAnimationById(animId, scopeId = 0, waitForComplete = false) {
		const sid = String(this.manager.currentSurfaceIdFor(scopeId));
		const animList =
			this.manager.animations[sid] || this.manager.animations.default || [];
		const anim = animList.find(
			(a) => a.id === animId || String(a.id) === String(animId),
		);
		if (!anim) return;

		const playPromise = this.playAnimationPatterns(anim, sid, scopeId);
		if (waitForComplete) {
			await playPromise;
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
