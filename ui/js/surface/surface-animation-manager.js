/**
 * SERIKOアニメーションおよび発話口パク管理
 *
 * pattern 列の実行スケジュール（適用時刻・周期長）の計算は
 * Rust コア（`crates/ui::animation` / Tauri コマンド `animation_timeline`）に一本化し、
 * フロントエンドはタイムラインに従った描画のみを行う。
 * Tauri 未検出（Web/Mock）の場合は従来の逐次待機でフォールバックする。
 */
import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { patternSurfaceFile } from "./bind-menu.js";

/**
 * pattern 列から Rust（`crates/ui::animation`）で実行スケジュールを計算する
 * `frames[i]` は `frames[i-1]` との差分待ち時間（累積 at_ms）で描画する。
 * 失敗時は null（レガシーの逐次待機へフォールバック）
 * @param {Array<{index?: number, wait?: number|string}>} patterns
 * @returns {Promise<{ frames: number[], totalMs: number }|null>}
 */
export async function buildAnimationTimeline(patterns) {
	if (!patterns?.length || !isTauriAvailable()) return null;
	try {
		const timeline = await invoke("animation_timeline", {
			patterns: patterns.map((pat, index) => ({
				index: pat.index ?? index,
				waitMs: resolvePatternWait(pat.wait, pat.waitMax),
			})),
		});
		const frames = (timeline?.frames ?? []).map((f) => f.atMs ?? f.at_ms ?? 0);
		return {
			frames,
			totalMs: timeline?.totalMs ?? timeline?.total_ms ?? 0,
		};
	} catch (_err) {
		return null;
	}
}

/**
 * pattern のウェイト（ミリ秒）。SSP の「最小-最大」指定は範囲内でランダムに選ぶ。
 * @param {number|string|undefined} wait
 * @param {number|string|null|undefined} [waitMax] - 上限（Rust パースの `wait_max`）
 * @returns {number}
 */
export function resolvePatternWait(wait, waitMax = null) {
	const toNumber = (value) => {
		const match = String(value ?? "")
			.trim()
			.match(/^(\d+)(?:-(\d+))?$/);
		if (!match) return null;
		const min = Number(match[1]);
		const max = match[2] == null ? min : Number(match[2]);
		return { min: Math.min(min, max), span: Math.abs(max - min) };
	};
	const low = toNumber(wait);
	if (low == null) return 0;
	const high = toNumber(waitMax);
	if (high != null) {
		const min = low.min;
		const span = Math.max(high.min + high.span - min, 0);
		return min + Math.floor(Math.random() * (span + 1));
	}
	return low.min + Math.floor(Math.random() * (low.span + 1));
}

/**
 * animation*.interval を UKADOC の組み合わせ指定（SSP: `+` 区切り）として解釈する。
 * パラメータは末尾にのみ書ける（例: `bind+random,5`）。
 * @param {string|undefined} interval
 * @returns {{ kinds: Set<string>, param: number|null }}
 */
export function parseInterval(interval) {
	const value = String(interval || "sometimes")
		.trim()
		.toLowerCase();
	const comma = value.indexOf(",");
	const head = comma < 0 ? value : value.slice(0, comma);
	const raw = comma < 0 ? "" : value.slice(comma + 1).trim();
	const param = raw === "" ? null : Number.parseFloat(raw);
	const kinds = new Set(
		head
			.split("+")
			.map((kind) => kind.trim())
			.map((kind) => (kind === "\\e" || kind === "/e" ? "yen-e" : kind))
			.filter(Boolean),
	);
	return { kinds, param: Number.isFinite(param) ? param : null };
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
		const { kinds, param } = parseInterval(anim.interval);
		const isCurrent = () =>
			String(this.manager.currentSurfaceIdFor(scopeId)) === String(surfaceId);
		const play = () => this.playAnimationPatterns(anim, surfaceId, scopeId);

		// bind 単独は着せ替えレイヤーとして静止合成する。bind+X は装着中のみ X として動く。
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

		// sometimes(毎秒1/2), rarely(毎秒1/4), random,N(毎秒1/N)
		let probability = null;
		if (kinds.has("sometimes")) probability = 0.5;
		if (kinds.has("rarely")) probability = 0.25;
		if (kinds.has("random")) probability = 1 / (param > 0 ? param : 2);
		if (probability == null) return; // talk/starttalk/endtalk/yen-e/never は別トリガー

		// 毎秒チェックして確率抽選
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
			// 単発トリガーは同期的に開始
			this.playAnimationPatterns(anim, sid, scopeId).catch(() => {});
		}
	}

	/**
	 * アニメーションパターンの順次実行
	 */
	playAnimationPatterns(anim, baseSurfaceId, scopeId) {
		// starttalk / talk は発話開始・文字送りから複数回呼ばれるが、完了まで待つ仕様
		// 同じ ID のアニメーションが二重に走るのを防ぐ
		const key = `${scopeId}__${baseSurfaceId}__${anim?.id ?? anim?.interval ?? ""}`;
		// talk などは二重起動を防ぐ。ただし、スクリプト終了など単発系 (runonce/yen-e/endtalk) は
		// 前回のアニメーションが終わっていなくても、新しい再生をスケジュールする
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

		// 実行スケジュール（適用時刻列）を Rust コアで計算
		// `wait_max` 由来のランダム化は抽選済みの waitMs を Rust へ渡す
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
			// レガシー（Web/Mock・Rust 不可時）: 逐次待機で再生
			for (const pat of anim.patterns) {
				const cont = await this._playOnePat(
					pat,
					anim,
					baseSurfaceId,
					scopeId,
					key,
					isCurrent,
				);
				// -1（このアニメーションの停止）などで後続フレームを中断する
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

	/**
	 * Rust 計算済みタイムラインのフレームを順次描画
	 */
	async _playTimelineFrames(timeline, anim, baseSurfaceId, scopeId, key) {
		if (!anim.patterns?.length || !timeline?.frames?.length) return;
		const isCurrent = () =>
			!this._stoppedAnimations.has(key) &&
			String(this.manager.currentSurfaceIdFor(scopeId)) ===
				String(baseSurfaceId);

		// タイムライン順（index 順）に並べた pattern に対し、
		// at_ms の差分だけ待機してからフレームを適用する
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
			// -1（このアニメーションの停止）などで後続フレームを中断する
			if (!cont) return;
		}
	}

	/**
	 * 1フレームの共通処理（一時停止ゲート・-1/-2 停止・差分描画）
	 * @returns {boolean} 後続フレームの再生を続行するか
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

		// \![anim,pause,ID] の一時停止ゲート（\![anim,resume,ID] で再開）
		if (anim?.id != null && this.isAnimationPaused(scopeId, anim.id)) {
			while (this.isAnimationPaused(scopeId, anim.id)) {
				if (!isCurrent()) return false;
				await new Promise((r) => setTimeout(r, 120));
			}
			if (!isCurrent()) return false;
		}

		const patSurface = String(pat.surface).trim();
		// -1: このアニメーションを停止、-2: 同一スコープの他アニメーションを停止
		if (patSurface === "-1") return false;
		if (patSurface === "-2") {
			for (const otherKey of this._runningAnimations.keys()) {
				if (otherKey !== key && otherKey.startsWith(`${scopeId}__`)) {
					this._stoppedAnimations.add(otherKey);
				}
			}
			return true;
		}

		// SERIKO 合成: ベースサーフィス上に差分パターンを重ねて表示
		// (UKADOC 準拠: pattern.x/y オフセット、method overlay/replace)
		// 合成不可（サーフィス未定義）時は旧方式の全面差し替えへフォールバック
		// フレーム描画の完了を待ってから次へ進む（未完了の合成が積み上がらないように）
		const framePromise = this.renderAnimationFrame(pat, baseSurfaceId, scopeId);
		if (framePromise) {
			await framePromise;
		} else {
			await gc.updateSurface(patSurface, scopeId, null);
		}
		return true;
	}

	/**
	 * レガシー逐次待機の1コマ再生（Web/Mock 向けフォールバック）
	 * @returns {Promise<boolean>} 後続フレームの再生を続行するか
	 */
	async _playOnePat(pat, anim, baseSurfaceId, scopeId, key, isCurrent) {
		// UKADOC: ウェイトは「そのコマを描画するまで」の待ち時間（ミリ秒）
		const waitMs = resolvePatternWait(pat.wait);
		if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs));
		// 待機後にサーフィス変更・停止（-2）が起きていれば描画しない
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
	 * SERIKO パターンを「ベースサーフィス + 差分レイヤー」として 1 フレーム描画
	 * (UKADOC 準拠: pattern.surface / pattern.x / pattern.y / pattern[K],method)
	 * 現在のサーフィス番号・アニメーションスケジュールには干渉しない。
	 * @param {{ surface: number|string, x?: number, y?: number, type?: string }} pat
	 * @param {number|string} baseSurfaceId
	 * @param {number} scopeId
	 * @returns {Promise<unknown>|false} 描画完了 Promise（false なら全面差し替えフォールバック）
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
	 * トーク開始時のトリガー (interval starttalk)
	 */
	onTalkStart(scopeId = 0) {
		this._spokenCount[scopeId] = 0;
		this._talkStarted[scopeId] = true;
		this.triggerAnimations(scopeId, "starttalk");
	}

	/**
	 * トーク終了時のトリガー (interval endtalk)
	 */
	onTalkEnd(scopeId = 0) {
		if (this._talkStarted[scopeId]) {
			this.triggerAnimations(scopeId, "endtalk");
		}
		this._talkStarted[scopeId] = false;
	}

	/**
	 * スクリプト終了時のトリガー (interval \e)
	 */
	onScriptEnd(scopeId = 0) {
		this.triggerAnimations(scopeId, "yen-e");
	}

	/**
	 * 発話（文字送り）時の口パク連動 (interval talk,N 準拠)
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
