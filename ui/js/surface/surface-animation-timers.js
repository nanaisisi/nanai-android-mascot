/**
 * @file surface-animation-timers.js
 * @brief SERIKO アニメーションのタイマー登録・トリガー抽出・一時停止状態管理モジュール
 */
import { parseInterval } from "./animation-parser.js";

export const surfaceAnimationTimers = {
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
	},

	/**
	 * `\![anim,pause,ID]` (SSP): アニメーションの一時停止
	 */
	pauseAnimation(scopeId = 0, animId) {
		this.pausedAnimations.set(`${scopeId}__${animId}`, true);
	},

	/**
	 * `\![anim,resume,ID]` (SSP): 一時停止の解除
	 */
	resumeAnimation(scopeId = 0, animId) {
		this.pausedAnimations.delete(`${scopeId}__${animId}`);
	},

	/**
	 * アニメーションが一時停止中か
	 */
	isAnimationPaused(scopeId = 0, animId) {
		return this.pausedAnimations.get(`${scopeId}__${animId}`) === true;
	},

	/**
	 * スコープ全体の一時停止状態をクリア
	 */
	clearPausedAnimations(scopeId = 0) {
		for (const key of [...this.pausedAnimations.keys()]) {
			if (key.startsWith(`${scopeId}__`)) {
				this.pausedAnimations.delete(key);
			}
		}
	},

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
	},

	/**
	 * アニメーションの interval 指定に応じたタイマースケジュール
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
	},

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
	},

	triggerAnimations(scopeId, kind) {
		for (const { anim, sid } of this.animationsForTrigger(scopeId, kind)) {
			this.playAnimationPatterns(anim, sid, scopeId).catch(() => {});
		}
	},
};
