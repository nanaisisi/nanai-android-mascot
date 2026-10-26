import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { composeSurfaceElements, processChromaKey } from "./surface-compositor.js";
import { expandSurfaceRange, parseSurfacesTxt } from "./surface-parser.js";

/**
 * Nanai Android Mascot - surfaces.txt パーサー & 当たり判定（Collision）マネージャー
 */

export class SurfaceManager {
	/**
	 * @param {import('../../main.js').NanaiAndroidMascotApp} app
	 */
	constructor(app) {
		/** @type {import('../../main.js').NanaiAndroidMascotApp} */
		this.app = app;
		/** @type {Record<number|string, import('./surface-parser.js').CollisionArea[]>} */
		this.collisions = {};
		/** @type {Record<number|string, import('./surface-parser.js').SurfaceElement[]>} */
		this.elements = {};
		/** @type {Record<number|string, import('./surface-parser.js').SurfaceAnimation[]>} */
		this.animations = {};
		/** @type {Record<number, any[]>} */
		this.activeAnimationTimers = {};
		/** @type {number} */
		this.baseWidth = 200;
		/** @type {number} */
		this.baseHeight = 400;
		/** @type {number} */
		this.currentSurfaceId = 0;
		/** @type {Map<string, string>} */
		this.chromaKeyCache = new Map();
		/** @type {Map<string, boolean>} 着せ替えパーツのON/OFF状態 (key: scope_category_part) */
		this.dressupState = new Map();
	}

	/**
	 * ゴーストの surfaces.txt を読み込んでパース
	 * @param {string} ghostPath
	 * @param {string} shellName
	 */
	async loadSurfacesTxt(ghostPath, shellName = "master") {
		try {
			let content = "";
			// shell/master などのパス形式に対応
			const basePath = ghostPath.includes("/shell/")
				? ghostPath
				: `${ghostPath}/shell/${shellName}`;
			const surfacesPath = `${basePath}/surfaces.txt`;

			if (isTauriAvailable()) {
				try {
					content = await invoke("open_file", { path: surfacesPath });
				} catch (_e) {
					console.warn(`Tauri open_file 失敗、fetchを試行: ${surfacesPath}`);
					const res = await fetch(surfacesPath);
					if (res.ok) content = await res.text();
				}
			} else {
				const res = await fetch(surfacesPath);
				if (res.ok) content = await res.text();
			}

			if (content) {
				console.log(`📜 surfaces.txt 読み込み成功 (${surfacesPath})`);
				this.parseSurfacesTxt(content);
			}
		} catch (err) {
			console.warn("surfaces.txt 読み込みスキップ (デフォルト設定を使用):", err);
		}
	}

	/**
	 * surfaces.txt のテキスト内容をパースして当たり判定を登録
	 */
	parseSurfacesTxt(text) {
		const parsed = parseSurfacesTxt(text);
		this.collisions = parsed.collisions;
		this.elements = parsed.elements;
		this.animations = parsed.animations;

		console.log(
			`🎯 当たり判定・合成要素登録完了: ${Object.keys(this.collisions).length} サーフィス登録済み`,
		);
	}

	expandSurfaceRange(rangeStr) {
		return expandSurfaceRange(rangeStr);
	}

	setSurfaceId(surfaceId, scopeId = 0) {
		this.currentSurfaceId = surfaceId;
		this.stopAnimations(scopeId);
		this.startAnimations(surfaceId, scopeId);
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
	}

	/**
	 * 指定サーフィスのアニメーション定義（SERIKO）を開始
	 */
	startAnimations(surfaceId, scopeId = 0) {
		const sid = String(surfaceId);
		const animList = this.animations[sid] || this.animations.default || [];
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
				if (String(this.currentSurfaceId) === String(surfaceId)) {
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
				if (String(this.currentSurfaceId) === String(surfaceId)) {
					await this.playAnimationPatterns(anim, surfaceId, scopeId);
				}
			}, sec * 1000);
			this.activeAnimationTimers[scopeId].push(timer);
			return;
		}

		// always: ループ再生
		if (intervalStr === "always") {
			const loop = async () => {
				if (String(this.currentSurfaceId) === String(surfaceId)) {
					await this.playAnimationPatterns(anim, surfaceId, scopeId);
					if (String(this.currentSurfaceId) === String(surfaceId)) {
						const timer = setTimeout(loop, 50);
						this.activeAnimationTimers[scopeId].push(timer);
					}
				}
			};
			loop();
			return;
		}

		// sometimes(毎秒1/2), rarely(毎秒1/4), random,N(毎秒1/N)
		// UKADOC仕様: 「そのサーフェスである間毎秒(1/N)の確率で再生」
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
			if (String(this.currentSurfaceId) === String(surfaceId)) {
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
		const gc = this.app?.ghostController;
		if (!gc) return;

		for (const pat of anim.patterns) {
			if (String(this.currentSurfaceId) !== String(baseSurfaceId)) break;

			const patSurface = String(pat.surface).trim();
			if (patSurface === "-1") {
				await gc.updateSurface(baseSurfaceId, scopeId);
			} else {
				await gc.updateSurface(patSurface, scopeId);
			}

			const waitMs = Math.max(pat.wait || 100, 30);
			await new Promise((r) => setTimeout(r, waitMs));
		}

		if (String(this.currentSurfaceId) === String(baseSurfaceId)) {
			await gc.updateSurface(baseSurfaceId, scopeId);
		}
	}

	/**
	 * さくらスクリプト \i[ID] による明示的なアニメーション再生
	 */
	async playAnimationById(animId, scopeId = 0, waitForComplete = false) {
		const sid = String(this.currentSurfaceId);
		const animList = this.animations[sid] || this.animations.default || [];
		const anim = animList.find((a) => a.id === animId || String(a.id) === String(animId));
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
		const sid = String(this.currentSurfaceId);
		const animList = this.animations[sid] || this.animations.default || [];
		const talkAnim = animList.find((a) => (a.interval || "").startsWith("talk"));
		if (!talkAnim) return;

		if (!this._spokenCount) this._spokenCount = {};
		this._spokenCount[scopeId] = (this._spokenCount[scopeId] || 0) + 1;

		const n = Number.parseInt(talkAnim.interval.split(",")[1], 10) || 1;
		if (this._spokenCount[scopeId] % n === 0) {
			this.playAnimationPatterns(talkAnim, sid, scopeId).catch(() => {});
		}
	}

	/**
	 * マウス・タッチ座標から当たり部位（head, bust等）を判定
	 */
	detectCollision(clickX, clickY, targetRect, surfaceId = null) {
		const sid = surfaceId !== null ? String(surfaceId) : String(this.currentSurfaceId);

		// 表示要素内での相対座標 (0.0 〜 1.0)
		const relX = (clickX - targetRect.left) / targetRect.width;
		const relY = (clickY - targetRect.top) / targetRect.height;

		// 元のテクスチャ解像度座標系へ逆変換
		const canvasX = Math.round(relX * this.baseWidth);
		const canvasY = Math.round(relY * this.baseHeight);

		const colList = this.collisions[sid] || this.collisions.default || [];

		// 定義の逆順（手前のもの優先）で判定
		for (let i = colList.length - 1; i >= 0; i--) {
			const col = colList[i];
			if (
				canvasX >= col.x1 &&
				canvasX <= col.x2 &&
				canvasY >= col.y1 &&
				canvasY <= col.y2
			) {
				return {
					name: col.name,
					canvasX,
					canvasY,
				};
			}
		}

		return {
			name: "",
			canvasX,
			canvasY,
		};
	}

	/**
	 * 伺か標準仕様のPNAアルファマスク合成およびクロマキー（緑透過 #00FF00 / 左上ピクセル色）透過処理
	 * @param {string} imageSrc - 画像URLまたはDataURL
	 * @param {string|null} [pnaSrc] - PNAアルファマスク画像のURLまたはDataURL
	 * @returns {Promise<string>} - 透過合成後のDataURL (PNG)
	 */
	processChromaKey(imageSrc, pnaSrc = null) {
		return processChromaKey(imageSrc, pnaSrc, this.chromaKeyCache);
	}

	/**
	 * 着せ替えパーツの装着/解除 (\![bind,category,part,status] UKADOC準拠)
	 */
	async bindDressup(category, part = "", statusVal = "", scopeId = 0, notifyEvent = true) {
		const key = `${scopeId}__${category}__${part}`;
		let newStatus = true;

		if (statusVal === "1" || statusVal === "true") {
			newStatus = true;
		} else if (statusVal === "0" || statusVal === "false") {
			newStatus = false;
		} else {
			// 省略または空欄時はトグル
			const current = this.dressupState.get(key) ?? false;
			newStatus = !current;
		}

		this.dressupState.set(key, newStatus);
		console.log(
			`👗 着せ替え更新: scope=${scopeId}, category=${category}, part=${part}, state=${newStatus}`,
		);

		// サーフィス再描画（着せ替え状態の反映）
		await this.app.ghostController.updateSurface(this.currentSurfaceId, scopeId);

		// SHIORI イベント通知 (OnDressupChanged)
		if (notifyEvent) {
			try {
				await this.app.ghostController.sendShioriEvent("OnDressupChanged", [
					category,
					part,
					newStatus ? 1 : 0,
					scopeId,
				]);
			} catch (_err) {
				// イベント送信エラーは無視
			}
		}
	}

	/**
	 * element0〜elementN で定義されたレイヤー画像をベース画像上に合成 (UKADOC準拠)
	 * @param {number|string} surfaceId
	 * @param {string} baseImgSrc
	 * @param {Function} resolveImagePath - ファイル名から画像URL/DataURLを解決する関数
	 * @returns {Promise<string>} - 合成後のDataURL (PNG)
	 */
	composeSurfaceElements(surfaceId, baseImgSrc, resolveImagePath) {
		const sid = String(surfaceId);
		const elementList = this.elements[sid] || this.elements.default || [];
		return composeSurfaceElements(elementList, baseImgSrc, resolveImagePath);
	}
}

// 外部エクスポート
export { parseSurfacesTxt, expandSurfaceRange } from "./surface-parser.js";
export { processChromaKey, composeSurfaceElements } from "./surface-compositor.js";
