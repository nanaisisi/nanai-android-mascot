import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import {
	bindAnimationIds,
	bindGroupsForScope,
	dressupKey,
	patternSurfaceFile,
	seedDressupDefaults,
} from "./bind-menu.js";
import {
	collisionContains,
	getShellManifest,
	manifestToSurfaceData,
} from "./shell-manifest.js";
import { SurfaceAnimationManager } from "./surface-animation-manager.js";
import {
	composeSurfaceElements,
	processChromaKey,
} from "./surface-compositor.js";
import { expandSurfaceRange, parseSurfacesTxt } from "./surface-parser.js";

export {
	collisionContains,
	getShellManifest,
	manifestToSurfaceData,
} from "./shell-manifest.js";
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
		/** @type {Record<string, number[]>|null} surface.alias ブロックのエイリアス（Rust マニフェスト由来） */
		this.aliases = null;
		/** @type {Record<string, any>|null} Rust `shell_manifest` の生マニフェスト */
		this.shellManifest = null;

		this.animationManager = new SurfaceAnimationManager(this);
	}

	get activeAnimationTimers() {
		return this.animationManager.activeAnimationTimers;
	}

	/**
	 * ゴーストの surfaces.txt を読み込んでパース
	 *
	 * Tauri 環境では Rust 側パーサー（`shell_manifest` コマンド、ukadoc-spec 突合済）を
	 * 優先使用し、失敗時またはブラウザ環境では JS パーサーにフォールバックする。
	 * @param {string} ghostPath
	 * @param {string} shellName
	 */
	async loadSurfacesTxt(ghostPath, shellName = "master") {
		try {
			// ghostPath が `..../shell/<シェル名>` 形式なら分割する
			let basePath = ghostPath;
			let shell = shellName;
			const shellMatch = ghostPath.match(/[/\\]shell[/\\]([^/\\]+)$/);
			if (shellMatch) {
				basePath = ghostPath.slice(0, shellMatch.index);
				shell = shellMatch[1];
			}
			const ghostName = basePath.split(/[\\/]/).filter(Boolean).pop() || "";

			// 1) Rust パーサー経由（ukadoc-spec 突合済み）
			if (isTauriAvailable()) {
				const manifest = await getShellManifest(ghostName, shell);
				if (manifest) {
					console.log(
						`📜 shell_manifest 取得成功 (ghost=${ghostName}, shell=${shell})`,
					);
					this.applyShellManifest(manifest);
					return;
				}
				console.warn(
					"shell_manifest 取得失敗、テキストパースへフォールバック:",
				);
			}

			// 2) JS テキストパーサー（フォールバック / ブラウザ環境）
			let content = "";
			const surfacesPath = `${basePath}/shell/${shell}/surfaces.txt`;

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
	 * Rust `shell_manifest` のマニフェストを内部レコードへ適用する
	 */
	applyShellManifest(manifest) {
		const data = manifestToSurfaceData(manifest);
		this.collisions = data.collisions;
		this.elements = data.elements;
		this.animations = data.animations;
		this.aliases = data.aliases;
		this.shellManifest = manifest;

		// bindgroup[N].default,1（初期装着）を着せ替え状態へシード（既存キーは保持）
		const seeded = seedDressupDefaults(manifest, this.dressupState);
		if (seeded > 0) {
			console.log(`👗 bindgroup default 初期装着シード: ${seeded} パーツ`);
		}

		console.log(
			`🎯 当たり判定・合成要素登録完了 (Rust shell_manifest): ${Object.keys(this.collisions).length} サーフィス登録済み`,
		);
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
			if (collisionContains(col, canvasX, canvasY)) {
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
	 * 現在装着中の着せ替え (bindgroup) に対応する SERIKO bind アニメーションの
	 * レイヤー（pattern 画像 + オフセット）を取得 (UKADOC準拠)
	 *
	 * bindgroup 番号 = interval,bind の SHEIKO アニメーションID。
	 * 装着パーツ（dressupState true）のアニメーションパターンを
	 * 常時表示レイヤーとして合成に回す。
	 * @param {number} [scopeId]
	 * @param {number|string|null} [surfaceId]
	 * @returns {Array<{ file: string, x: number, y: number, type: string }>}
	 */
	activeBindLayers(scopeId = 0, surfaceId = null) {
		if (!this.shellManifest) return [];
		const sid = String(surfaceId ?? this.currentSurfaceId);
		const animList = this.animations[sid] ?? [];
		const animById = new Map(animList.map((a) => [String(a.id), a]));

		/** @type {Array<{ file: string, x: number, y: number, type: string }>} */
		const layers = [];
		for (const group of bindGroupsForScope(this.shellManifest, scopeId)) {
			if (
				!this.dressupState.get(dressupKey(scopeId, group.category, group.part))
			) {
				continue;
			}
			for (const animId of bindAnimationIds(group.number, group.add_ids)) {
				const anim = animById.get(String(animId));
				for (const pattern of anim?.patterns ?? []) {
					const file = patternSurfaceFile(pattern.surface);
					if (!file) continue;
					layers.push({
						file,
						x: pattern.x ?? 0,
						y: pattern.y ?? 0,
						type: pattern.type ?? "overlay",
					});
				}
			}
		}
		return layers;
	}

	/**
	 * element0〜elementN で定義されたレイヤー画像 + 装着中の着せ替え bind レイヤーを
	 * ベース画像上に合成 (UKADOC準拠)
	 * @param {number|string} surfaceId
	 * @param {string} baseImgSrc
	 * @param {Function} resolveImagePath - ファイル名から画像URL/DataURLを解決する関数
	 * @param {number} [scopeId] - 着せ替え状態を参照するスコープ（scope 0 = さくら / 1 = うにゅ）
	 * @returns {Promise<string>} - 合成後のDataURL (PNG)
	 */
	composeSurfaceElements(surfaceId, baseImgSrc, resolveImagePath, scopeId = 0) {
		const sid = String(surfaceId);
		const elementList = this.elements[sid] || this.elements.default || [];
		const bindLayers =
			scopeId === 0 || scopeId === 1 ? this.activeBindLayers(scopeId, sid) : [];
		return composeSurfaceElements(
			elementList,
			baseImgSrc,
			resolveImagePath,
			bindLayers,
		);
	}
}
