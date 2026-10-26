/**
 * SERIKOアニメーションおよび発話口パク管理
 */
import { patternSurfaceFile } from "./bind-menu.js";

export class SurfaceAnimationManager {
	/**
	 * @param {import('./surface.js').SurfaceManager} manager
	 */
	constructor(manager) {
		this.manager = manager;
		/** @type {Record<number, any[]>} */
		this.activeAnimationTimers = {};
		this._spokenCount = {};
		/** @type {Map<string, boolean>} `\![anim,pause,ID]` で一時停止中のアニメーション (key: scopeId__animId) */
		this.pausedAnimations = new Map();
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
		// サーフィス変更 (\s) 時は \![anim,pause] 状態も解除
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
		const intervalStr = (anim.interval || "sometimes").toLowerCase();

		// runonce: サーフィス切り替え直後に1回のみ実行
		if (intervalStr === "runonce") {
			const timer = setTimeout(async () => {
				if (
					String(this.manager.currentSurfaceIdFor(scopeId)) ===
					String(surfaceId)
				) {
					await this.playAnimationPatterns(anim, surfaceId, scopeId);
				}
			}, 30);
			this.activeAnimationTimers[scopeId].push(timer);
			return;
		}

		// periodic,秒: 指定秒数間隔で定期再生
		if (intervalStr.startsWith("periodic")) {
			const parts = intervalStr.split(",");
			const sec = Math.max(Number.parseFloat(parts[1]) || 4, 0.5);
			const timer = setInterval(async () => {
				if (
					String(this.manager.currentSurfaceIdFor(scopeId)) ===
					String(surfaceId)
				) {
					await this.playAnimationPatterns(anim, surfaceId, scopeId);
				}
			}, sec * 1000);
			this.activeAnimationTimers[scopeId].push(timer);
			return;
		}

		// always: ループ再生
		if (intervalStr === "always") {
			const loop = async () => {
				if (
					String(this.manager.currentSurfaceIdFor(scopeId)) ===
					String(surfaceId)
				) {
					await this.playAnimationPatterns(anim, surfaceId, scopeId);
					if (
						String(this.manager.currentSurfaceIdFor(scopeId)) ===
						String(surfaceId)
					) {
						const timer = setTimeout(loop, 50);
						this.activeAnimationTimers[scopeId].push(timer);
					}
				}
			};
			loop();
			return;
		}

		// sometimes(毎秒1/2), rarely(毎秒1/4), random,N(毎秒1/N)
		let probability = 0.5; // sometimes
		if (intervalStr === "rarely") {
			probability = 0.25;
		} else if (intervalStr.startsWith("random")) {
			const n = Number.parseInt(intervalStr.split(",")[1], 10) || 2;
			probability = 1.0 / n;
		} else if (
			intervalStr.startsWith("talk") ||
			intervalStr === "never" ||
			intervalStr === "bind"
		) {
			return; // 発話時口パク、着せ替え、スクリプト直接呼出 (\i) は別トリガー
		}

		// 毎秒チェックして確率抽選
		const timer = setInterval(async () => {
			if (
				String(this.manager.currentSurfaceIdFor(scopeId)) === String(surfaceId)
			) {
				if (Math.random() <= probability) {
					await this.playAnimationPatterns(anim, surfaceId, scopeId);
				}
			}
		}, 1000);
		this.activeAnimationTimers[scopeId].push(timer);
	}

	/**
	 * アニメーションパターンの順次実行
	 */
	async playAnimationPatterns(anim, baseSurfaceId, scopeId) {
		if (!anim.patterns?.length) return;
		const gc = this.manager.app?.ghostController;
		if (!gc) return;

		for (const pat of anim.patterns) {
			if (
				String(this.manager.currentSurfaceIdFor(scopeId)) !==
				String(baseSurfaceId)
			)
				break;

			// \![anim,pause,ID] の一時停止ゲート（\![anim,resume,ID] で再開）
			if (anim?.id != null && this.isAnimationPaused(scopeId, anim.id)) {
				while (this.isAnimationPaused(scopeId, anim.id)) {
					if (
						String(this.manager.currentSurfaceIdFor(scopeId)) !==
						String(baseSurfaceId)
					)
						break;
					await new Promise((r) => setTimeout(r, 120));
				}
			}

			const patSurface = String(pat.surface).trim();
			// SERIKO 合成: ベースサーフィス上に差分パターンを重ねて表示
			// (UKADOC 準拠: pattern.x/y オフセット、method overlay/replace)
			// 合成不可（pattern -1 / サーフィス未定義）時は旧方式の全面差し替えへフォールバック
			if (
				patSurface === "-1" ||
				!this.renderAnimationFrame(pat, baseSurfaceId, scopeId)
			) {
				await gc.updateSurface(
					patSurface === "-1" ? baseSurfaceId : patSurface,
					scopeId,
				);
			}

			const waitMs = Math.max(pat.wait || 100, 30);
			await new Promise((r) => setTimeout(r, waitMs));
		}

		if (
			String(this.manager.currentSurfaceIdFor(scopeId)) ===
			String(baseSurfaceId)
		) {
			await gc.updateSurface(baseSurfaceId, scopeId);
		}
	}

	/**
	 * SERIKO パターンを「ベースサーフィス + 差分レイヤー」として 1 フレーム描画
	 * (UKADOC 準拠: pattern.surface / pattern.x / pattern.y / pattern[K],method)
	 * 現在のサーフィス番号・アニメーションスケジュールには干渉しない。
	 * @param {{ surface: number|string, x?: number, y?: number, type?: string }} pat
	 * @param {number|string} baseSurfaceId
	 * @param {number} scopeId
	 * @returns {boolean} 合成に成功したか（false なら全面差し替えフォールバック）
	 */
	renderAnimationFrame(pat, baseSurfaceId, scopeId) {
		if (baseSurfaceId === -1 || baseSurfaceId === "-1") return false;
		const resolved = this.manager.resolveSurfaceNumber(pat.surface, scopeId);
		const file = patternSurfaceFile(resolved);
		if (!file) return false;
		this.manager.app?.ghostController?.updateSurface(baseSurfaceId, scopeId, [
			{
				file,
				x: pat.x ?? 0,
				y: pat.y ?? 0,
				type: pat.type ?? "overlay",
			},
		]);
		return true;
	}

	/**
	 * さくらスクリプト \i[ID] による明示的なアニメーション再生
	 */
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

	/**
	 * 発話（文字送り）時の口パク連動 (interval talk,N 準拠)
	 */
	onCharSpoken(scopeId = 0) {
		const sid = String(this.manager.currentSurfaceIdFor(scopeId));
		const animList =
			this.manager.animations[sid] || this.manager.animations.default || [];
		const talkAnim = animList.find((a) =>
			(a.interval || "").startsWith("talk"),
		);
		if (!talkAnim) return;

		this._spokenCount[scopeId] = (this._spokenCount[scopeId] || 0) + 1;

		const n = Number.parseInt(talkAnim.interval.split(",")[1], 10) || 1;
		if (this._spokenCount[scopeId] % n === 0) {
			this.playAnimationPatterns(talkAnim, sid, scopeId).catch(() => {});
		}
	}
}
