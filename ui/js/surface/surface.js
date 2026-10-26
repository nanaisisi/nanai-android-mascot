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
	parseSurfacesTextWithRust,
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
		/** @type {Map<number, number|string>} スコープ (0=さくら / 1=うにゅ) 毎の現在サーフィスID */
		this.currentSurfaceIds = new Map([
			[0, 0],
			[1, 10],
		]);
		/** @type {Map<string, string>} */
		this.chromaKeyCache = new Map();
		/** @type {Map<string, boolean>} 着せ替えパーツのON/OFF状態 (key: scope_category_part) */
		this.dressupState = new Map();
		/** @type {Record<string, number[]>|null} surface.alias ブロックのエイリアス（Rust マニフェスト由来） */
		this.aliases = null;
		/** @type {Record<string, number[]>|null} kero.surface.alias / char1.surface.alias のエイリアス */
		this.keroAliases = null;
		/** @type {Record<string, any>|null} Rust `shell_manifest` の生マニフェスト */
		this.shellManifest = null;

		this.animationManager = new SurfaceAnimationManager(this);
	}

	get activeAnimationTimers() {
		return this.animationManager.activeAnimationTimers;
	}

	/**
	 * スコープ 0（さくら）の現在サーフィスID（互換アクセサ）
	 * @returns {number|string}
	 */
	get currentSurfaceId() {
		return this.currentSurfaceIds.get(0) ?? 0;
	}

	/**
	 * スコープ毎の現在サーフィスIDを取得 (UKADOC準拠: \0 / \1 独立)
	 * @param {number} [scopeId]
	 * @returns {number|string}
	 */
	currentSurfaceIdFor(scopeId = 0) {
		return this.currentSurfaceIds.get(scopeId) ?? (scopeId === 1 ? 10 : 0);
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
				await this.parseSurfacesTxt(content);
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
		this.keroAliases = data.keroAliases;
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
	async parseSurfacesTxt(text) {
		if (isTauriAvailable()) {
			const rustData = await parseSurfacesTextWithRust(text);
			if (rustData) {
				this.collisions = rustData.collisions;
				this.elements = rustData.elements;
				this.animations = rustData.animations;
				console.log(
					`🎯 当たり判定・合成要素登録完了 (Rust parse_surfaces_text): ${Object.keys(this.collisions).length} サーフィス登録済み`,
				);
				return;
			}
		}

		const parsed = parseSurfacesTxt(text);
		this.collisions = parsed.collisions;
		this.elements = parsed.elements;
		this.animations = parsed.animations;

		console.log(
			`🎯 当たり判定・合成要素登録完了 (JS fallback): ${Object.keys(this.collisions).length} サーフィス登録済み`,
		);
	}

	expandSurfaceRange(rangeStr) {
		return expandSurfaceRange(rangeStr);
	}

	/**
	 * サーフィスエイリアス名（surface.alias ブロック）をサーフィス番号へ解決する
	 * (UKADOC準拠: 複数番号が設定されている場合はランダム抽選)
	 *
	 * 数値または未登録の名前はそのまま返す。
	 * @param {number|string|null|undefined} surfaceId
	 * @param {number} [scopeId] - 0 (さくら / 共通) または 1 (うにゅ)
	 * @returns {number|string} 解決済みサーフィス番号（文字列）または元の値
	 */
	resolveSurfaceNumber(surfaceId, scopeId = 0) {
		const name = String(surfaceId ?? "").trim();
		if (name === "" || /^-?\d+$/.test(name)) {
			return surfaceId;
		}
		const map = scopeId === 1 ? this.keroAliases : this.aliases;
		let list = Array.isArray(map?.[name]) ? map[name] : null;
		if (!list && map) {
			// 大文字小文字を無視した探索（Rust alias_numbers と同等の挙動）
			const entry = Object.entries(map).find(
				([key]) => key.toLowerCase() === name.toLowerCase(),
			);
			list = Array.isArray(entry?.[1]) ? entry[1] : null;
		}
		if (!list || list.length === 0) {
			return surfaceId;
		}
		return String(list[Math.floor(Math.random() * list.length)]);
	}

	setSurfaceId(surfaceId, scopeId = 0) {
		// スコープ毎に独立追跡 (\0 と \1 のサーフィスを混同しない)
		this.currentSurfaceIds.set(scopeId, surfaceId);
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

	/**
	 * `\![anim,pause,ID]` (SSP): サーフィスアニメーションの一時停止
	 * @param {number|string} animId
	 * @param {number} [scopeId]
	 */
	pauseAnimationById(animId, scopeId = 0) {
		this.animationManager.pauseAnimation(scopeId, animId);
	}

	/**
	 * `\![anim,resume,ID]` (SSP): アニメーションの一時停止解除
	 * @param {number|string} animId
	 * @param {number} [scopeId]
	 */
	resumeAnimationById(animId, scopeId = 0) {
		this.animationManager.resumeAnimation(scopeId, animId);
	}

	onCharSpoken(scopeId = 0) {
		this.animationManager.onCharSpoken(scopeId);
	}

	/**
	 * マウス・タッチ座標から当たり部位（head, bust等）を判定
	 */
	detectCollision(clickX, clickY, targetRect, surfaceId = null, scopeId = 0) {
		const sid =
			surfaceId !== null
				? String(surfaceId)
				: String(this.currentSurfaceIdFor(scopeId));

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
			this.currentSurfaceIdFor(scopeId),
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
		const sid = String(surfaceId ?? this.currentSurfaceIdFor(scopeId));
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
					// pattern surface は番号のほかエイリアス名も受理 (UKADOC準拠)
					const file = patternSurfaceFile(
						this.resolveSurfaceNumber(pattern.surface, scopeId),
					);
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
