/**
 * @file surface-animation-manager.js
 * @brief SERIKO アニメーションおよび発話口パク管理クラス
 *
 * SERIKO アニメーションのスケジュール管理（always, periodic, sometimes, rarely, random, starttalk, endtalk, yen-e, bind 等）、
 * 一時停止（`\![anim,pause,ID]` / `resume`）、停止（`-1`, `-2`）、およびフレーム合成描画を統括します。
 * 実行スケジュールの計算は Rust コア連携（`animation-parser.js`）に委譲しつつ、
 * Tauri 未検出環境（Web/Mock）では従来の逐次待機でフォールバックします。
 */

import {
	buildAnimationTimeline,
	parseInterval,
	resolvePatternWait,
} from "./animation-parser.js";
import { patternSurfaceFile } from "./bind-menu.js";

// 後方互換性および外部インポートのための再エクスポート (Re-export)
export { buildAnimationTimeline, parseInterval, resolvePatternWait };

export class SurfaceAnimationManager {
	/**
	 * @param {import('./surface.js').SurfaceManager} manager - 所属する SurfaceManager インスタンス
	 */
	constructor(manager) {
		this.manager = manager;
		/** @type {Record<number, any[]>} スコープ毎のアクティブなタイマー（setTimeout / setInterval）リスト */
		this.activeAnimationTimers = {};
		/** @type {Record<number, number>} スコープ毎の発話文字数カウンタ（talk,N 口パク用） */
		this._spokenCount = {};
		/** @type {Record<number, boolean>} スコープ毎のトーク開始状態フラグ */
		this._talkStarted = {};
		/** @type {Map<string, boolean>} `\![anim,pause,ID]` で一時停止中のアニメーション (key: scopeId__animId) */
		this.pausedAnimations = new Map();
		/** @type {Map<string, Promise<void>>} 再生中のアニメーションマップ（多重起動・競合防止用） */
		this._runningAnimations = new Map();
		/** @type {Set<string>} 停止シグナル（-2等）により中断されたアニメーションのキー集合 */
		this._stoppedAnimations = new Set();
	}

	/**
	 * 指定スコープのアクティブなアニメーションタイマーをすべて停止し、状態をクリアします。
	 * @param {number} [scopeId=0] - 対象スコープ ID
	 */
	stopAnimations(scopeId = 0) {
		const timers = this.activeAnimationTimers[scopeId] || [];
		timers.forEach((t) => {
			clearTimeout(t);
			clearInterval(t);
		});
		this.activeAnimationTimers[scopeId] = [];
		// サーフィス変更 (\s) 時は \![anim,pause] 状態も自動解除
		this.clearPausedAnimations(scopeId);
	}

	/**
	 * `\![anim,pause,ID]` (SSP準拠): 指定アニメーションを一時停止（サーフィス変更まで有効）
	 * @param {number} [scopeId=0] - 対象スコープ ID
	 * @param {number|string} animId - アニメーション ID
	 */
	pauseAnimation(scopeId = 0, animId) {
		this.pausedAnimations.set(`${scopeId}__${animId}`, true);
	}

	/**
	 * `\![anim,resume,ID]` (SSP準拠): 一時停止を解除
	 * @param {number} [scopeId=0] - 対象スコープ ID
	 * @param {number|string} animId - アニメーション ID
	 */
	resumeAnimation(scopeId = 0, animId) {
		this.pausedAnimations.delete(`${scopeId}__${animId}`);
	}

	/**
	 * 指定アニメーションが現在一時停止中かどうかを判定
	 * @param {number} [scopeId=0] - 対象スコープ ID
	 * @param {number|string} animId - アニメーション ID
	 * @returns {boolean} 一時停止中なら true
	 */
	isAnimationPaused(scopeId = 0, animId) {
		return this.pausedAnimations.get(`${scopeId}__${animId}`) === true;
	}

	/**
	 * サーフィス変更 (\s) 時に、スコープ内の一時停止状態をすべてクリアします。
	 * @param {number} [scopeId=0] - 対象スコープ ID
	 */
	clearPausedAnimations(scopeId = 0) {
		for (const key of [...this.pausedAnimations.keys()]) {
			if (key.startsWith(`${scopeId}__`)) {
				this.pausedAnimations.delete(key);
			}
		}
	}

	/**
	 * 指定サーフィスの定義された SERIKO アニメーション群を開始します。
	 * @param {number|string} surfaceId - サーフィス番号またはエイリアス
	 * @param {number} [scopeId=0] - 対象スコープ ID
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
	 * アニメーションの interval 指定に応じたタイマーおよび周期スケジュールを登録します (UKADOC準拠)。
	 * @param {object} anim - アニメーション定義オブジェクト
	 * @param {number|string} surfaceId - 紐付くサーフィス ID
	 * @param {number} scopeId - スコープ ID
	 */
	scheduleAnimation(anim, surfaceId, scopeId) {
		const { kinds, param } = parseInterval(anim.interval);
		const isCurrent = () =>
			String(this.manager.currentSurfaceIdFor(scopeId)) === String(surfaceId);
		const play = () => this.playAnimationPatterns(anim, surfaceId, scopeId);

		// bind 単独は着せ替えレイヤーとして静止合成するためタイマー不要。bind+X は装着中のみ動く。
		if (kinds.has("bind")) {
			if (kinds.size === 1) return;
			if (!this.manager.isBindAnimationActive?.(scopeId, anim.id, surfaceId)) {
				return;
			}
		}

		// runonce: サーフィス切り替え直後に1回のみ実行
		if (kinds.has("runonce")) {
			const timer = setTimeout(async () => {
				if (isCurrent()) await play();
			}, 30);
			this.activeAnimationTimers[scopeId].push(timer);
		}

		// periodic,秒: 指定秒数間隔で定期再生
		if (kinds.has("periodic")) {
			const sec = Math.max(param || 4, 0.5);
			const timer = setInterval(async () => {
				if (isCurrent()) await play();
			}, sec * 1000);
			this.activeAnimationTimers[scopeId].push(timer);
		}

		// always: ループ再生
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

		// sometimes(毎秒1/2), rarely(毎秒1/4), random,N(毎秒1/N) の確率判定
		let probability = null;
		if (kinds.has("sometimes")) probability = 0.5;
		if (kinds.has("rarely")) probability = 0.25;
		if (kinds.has("random")) probability = 1 / (param > 0 ? param : 2);
		if (probability == null) return; // talk/starttalk/endtalk/yen-e/never はトリガー経由

		const timer = setInterval(async () => {
			if (isCurrent() && Math.random() <= probability) await play();
		}, 1000);
		this.activeAnimationTimers[scopeId].push(timer);
	}

	/**
	 * 現在サーフィスのうち、指定インターバル種別を含むアニメーション定義を抽出します。
	 * @param {number} scopeId - スコープ ID
	 * @param {string} kind - トリガー種類（"starttalk", "endtalk", "yen-e", "talk" 等）
	 * @returns {Array<object>} マッチしたアニメーション情報リスト
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
	 * starttalk / endtalk / yen-e などの単発トリガーイベントを非同期実行します。
	 * @param {number} scopeId - スコープ ID
	 * @param {string} kind - トリガー種類
	 */
	triggerAnimations(scopeId, kind) {
		for (const { anim, sid } of this.animationsForTrigger(scopeId, kind)) {
			this.playAnimationPatterns(anim, sid, scopeId).catch(() => {});
		}
	}

	/**
	 * アニメーションパターンの順次実行を制御します（多重起動防止ガード付き）。
	 * @param {object} anim - アニメーション定義
	 * @param {number|string} baseSurfaceId - 基準サーフィス ID
	 * @param {number} scopeId - スコープ ID
	 * @returns {Promise<void>} 再生完了 Promise
	 */
	playAnimationPatterns(anim, baseSurfaceId, scopeId) {
		const key = `${scopeId}__${baseSurfaceId}__${anim?.id ?? anim?.interval ?? ""}`;
		const running = this._runningAnimations.get(key);
		const { kinds } = parseInterval(anim.interval);
		// talk などは二重起動を防ぐ。ただし runonce / yen-e / endtalk は新規再生をスケジュール許可
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

	/**
	 * アニメーションパターンの内部実行ロジック（Rust タイムライン または 逐次フォールバック）
	 * @private
	 */
	async _playAnimationPatterns(anim, baseSurfaceId, scopeId, key) {
		if (!anim.patterns?.length) return;
		const gc = this.manager.app?.ghostController;
		if (!gc) return;
		const isCurrent = () =>
			!this._stoppedAnimations.has(key) &&
			String(this.manager.currentSurfaceIdFor(scopeId)) ===
				String(baseSurfaceId);

		// Rust コアで計算されたタイムラインの取得を試行
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
			// レガシーフォールバック（Web/Mock・Rust 不可時）: 逐次待機で再生
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

		// 再生完了後、ベースサーフィス状態へクリーンアップ
		if (
			String(this.manager.currentSurfaceIdFor(scopeId)) ===
			String(baseSurfaceId)
		) {
			await gc.updateSurface(baseSurfaceId, scopeId, []);
		}
	}

	/**
	 * Rust 計算済みタイムラインのフレームを順次描画します。
	 * @private
	 */
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

	/**
	 * 1フレームの共通処理（一時停止ゲート、-1/-2 停止シグナル処理、差分描画）
	 * @private
	 * @returns {Promise<boolean>} 続行する場合は true
	 */
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

		// \![anim,pause,ID] の一時停止チェック（resumeされるまでウェイト）
		if (anim?.id != null && this.isAnimationPaused(scopeId, anim.id)) {
			while (this.isAnimationPaused(scopeId, anim.id)) {
				if (!isCurrent()) return false;
				await new Promise((r) => setTimeout(r, 120));
			}
			if (!isCurrent()) return false;
		}

		const patSurface = String(pat.surface).trim();
		// -1: このアニメーションを停止
		if (patSurface === "-1") return false;
		// -2: 同一スコープの他アニメーションをすべて停止
		if (patSurface === "-2") {
			for (const otherKey of this._runningAnimations.keys()) {
				if (otherKey !== key && otherKey.startsWith(`${scopeId}__`)) {
					this._stoppedAnimations.add(otherKey);
				}
			}
			return true;
		}

		// SERIKO 合成描画の実行
		const framePromise = this.renderAnimationFrame(pat, baseSurfaceId, scopeId);
		if (framePromise) {
			await framePromise;
		} else {
			await gc.updateSurface(patSurface, scopeId, null);
		}
		return true;
	}

	/**
	 * レガシー逐次待機の1コマ再生（フォールバック用）
	 * @private
	 */
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

	/**
	 * SERIKO パターンを「ベースサーフィス + 差分レイヤー」として 1 フレーム描画します。
	 * (UKADOC 準拠: pattern.surface / pattern.x / pattern.y / pattern method)
	 * @param {object} pat - パターン定義
	 * @param {number|string} baseSurfaceId - 基準サーフィス ID
	 * @param {number} scopeId - スコープ ID
	 * @returns {Promise<unknown>|false} 描画完了 Promise または false（フォールバック用）
	 */
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

	/**
	 * さくらスクリプト `\i[ID]` による明示的なアニメーション再生を行います。
	 * @param {number|string} animId - 再生するアニメーション ID
	 * @param {number} [scopeId=0] - 対象スコープ ID
	 * @param {boolean} [waitForComplete=false] - 再生完了まで待機するかどうか
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
	 * トーク開始時のイベントトリガー (interval starttalk)
	 * @param {number} [scopeId=0] - スコープ ID
	 */
	onTalkStart(scopeId = 0) {
		this._spokenCount[scopeId] = 0;
		this._talkStarted[scopeId] = true;
		this.triggerAnimations(scopeId, "starttalk");
	}

	/**
	 * トーク終了時のイベントトリガー (interval endtalk)
	 * @param {number} [scopeId=0] - スコープ ID
	 */
	onTalkEnd(scopeId = 0) {
		if (this._talkStarted[scopeId]) {
			this.triggerAnimations(scopeId, "endtalk");
		}
		this._talkStarted[scopeId] = false;
	}

	/**
	 * スクリプト終了時のイベントトリガー (interval \e)
	 * @param {number} [scopeId=0] - スコープ ID
	 */
	onScriptEnd(scopeId = 0) {
		this.triggerAnimations(scopeId, "yen-e");
	}

	/**
	 * 発話文字送り時の口パク連動トリガー (interval talk,N 準拠)
	 * @param {number} [scopeId=0] - スコープ ID
	 */
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
