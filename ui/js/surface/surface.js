import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import {
	composeSurfaceElements,
	processChromaKey,
} from "./surface-compositor.js";
import { expandSurfaceRange, parseSurfacesTxt } from "./surface-parser.js";
import { SurfaceAnimationManager } from "./surface-animation-manager.js";

// 外部エクスポート
export {
	composeSurfaceElements,
	processChromaKey,
} from "./surface-compositor.js";
export { expandSurfaceRange, parseSurfacesTxt } from "./surface-parser.js";

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

		this.animationManager = new SurfaceAnimationManager(this);
	}

	get activeAnimationTimers() {
		return this.animationManager.activeAnimationTimers;
	}

	/**
	 * ゴーストの surfaces.txt を読み込んでパース
	 * @param {string} ghostPath
	 * @param {string} shellName
	 */
	async loadSurfacesTxt(ghostPath, shellName = "master") {
		try {
			let content = "";
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
			console.warn(
				"surfaces.txt 読み込みスキップ (デフォルト設定を使用):",
				err,
			);
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
		this.animationManager.stopAnimations(scopeId);
		this.animationManager.startAnimations(surfaceId, scopeId);
	}

	stopAnimations(scopeId = 0) {
		this.animationManager.stopAnimations(scopeId);
	}

	startAnimations(surfaceId, scopeId = 0) {
		this.animationManager.startAnimations(surfaceId, scopeId);
	}

	playAnimationPatterns(anim, baseSurfaceId, scopeId) {
		return this.animationManager.playAnimationPatterns(
			anim,
			baseSurfaceId,
			scopeId,
		);
	}

	playAnimationById(animId, scopeId = 0, waitForComplete = false) {
		return this.animationManager.playAnimationById(
			animId,
			scopeId,
			waitForComplete,
		);
	}

	onCharSpoken(scopeId = 0) {
		this.animationManager.onCharSpoken(scopeId);
	}

	/**
	 * マウス・タッチ座標から当たり部位（head, bust等）を判定
	 */
	detectCollision(clickX, clickY, targetRect, surfaceId = null) {
		const sid =
			surfaceId !== null ? String(surfaceId) : String(this.currentSurfaceId);

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
	async bindDressup(
		category,
		part = "",
		statusVal = "",
		scopeId = 0,
		notifyEvent = true,
	) {
		const key = `${scopeId}__${category}__${part}`;
		let newStatus = true;

		if (statusVal === "1" || statusVal === "true") {
			newStatus = true;
		} else if (statusVal === "0" || statusVal === "false") {
			newStatus = false;
		} else {
			const current = this.dressupState.get(key) ?? false;
			newStatus = !current;
		}

		this.dressupState.set(key, newStatus);
		console.log(
			`👗 着せ替え更新: scope=${scopeId}, category=${category}, part=${part}, state=${newStatus}`,
		);

		await this.app.ghostController.updateSurface(
			this.currentSurfaceId,
			scopeId,
		);

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
