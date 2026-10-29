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
	}

	stopAnimations(scopeId = 0) {
		surfaceAnimationTimers.stopAnimations.call(this, scopeId);
	}

	pauseAnimation(scopeId = 0, animId) {
		surfaceAnimationTimers.pauseAnimation.call(this, scopeId, animId);
	}

	resumeAnimation(scopeId = 0, animId) {
		surfaceAnimationTimers.resumeAnimation.call(this, scopeId, animId);
	}

	isAnimationPaused(scopeId = 0, animId) {
		return surfaceAnimationTimers.isAnimationPaused.call(this, scopeId, animId);
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
