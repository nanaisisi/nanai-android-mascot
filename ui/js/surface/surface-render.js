import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import {
	bindAnimationIds,
	bindGroupsForScope,
	dressupKey,
	patternSurfaceFile,
} from "./bind-menu.js";
import { collisionContains, methodToString } from "./shell-manifest.js";
import {
	composeSurfaceElements,
	processChromaKey,
} from "./surface-compositor.js";

/**
 * 当たり判定・着せ替え・合成系メソッド (SurfaceManager に mixin)
 */
export const surfaceRenderMethods = {
	/**
	 * サーフィスエイリアス名（surface.alias ブロック）をサーフィス番号へ解決する
	 * (UKADOC準拠: 複数番号が設定されている場合はランダム抽選)
	 *
	 * 数値または未登録の名前はそのまま返す。
	 * @this {import('./surface-manager.js').SurfaceManager}
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
	},

	/**
	 * マウス・タッチ座標から当たり部位（head, bust等）を判定
	 * @this {import('./surface-manager.js').SurfaceManager}
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
	},

	/**
	 * 着せ替えパーツの装着/解除 (\![bind,category,part,status] UKADOC準拠)
	 * @this {import('./surface-manager.js').SurfaceManager}
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
	},

	/**
	 * 現在装着中の着せ替え (bindgroup) に対応する SERIKO bind アニメーションの
	 * レイヤー（pattern 画像 + オフセット）を取得 (UKADOC準拠)
	 *
	 * bindgroup 番号 = interval,bind の SHEIKO アニメーションID。
	 * 装着パーツ（dressupState true）のアニメーションパターンを
	 * 常時表示レイヤーとして合成に回す。
	 * @this {import('./surface-manager.js').SurfaceManager}
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
	},

	/**
	 * 装着中 bindgroup（dressupState true）に対応する bind アニメーションID列
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {number} [scopeId]
	 * @returns {number[]}
	 */
	activeBindAnimationIds(scopeId = 0) {
		if (!this.shellManifest) return [];
		return bindGroupsForScope(this.shellManifest, scopeId)
			.filter((group) =>
				this.dressupState.get(dressupKey(scopeId, group.category, group.part)),
			)
			.flatMap((group) => bindAnimationIds(group.number, group.add_ids))
			.sort((a, b) => a - b);
	},

	/**
	 * Rust コアの合成計画（element + 装着 bind pattern）を取得する
	 *
	 * 切替時（サーフィス / 着せ替え / シェルの変更）のみ IPC し、
	 * planCache（surface + bind 状態キー）でヒット時は IPC なし。
	 * 失敗時は null（JS 収集レイヤーのレガシー合成へフォールバック）。
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {number|string} surfaceId
	 * @param {number} [scopeId]
	 * @returns {Promise<{ layers: Element[] , planHash: string }|null>}
	 */
	async getCompositionPlan(surfaceId, scopeId = 0) {
		if (!this.shellManifest || !isTauriAvailable()) return null;
		const sid = Number(surfaceId);
		if (!Number.isFinite(sid) || sid < 0) return null;
		const gc = this.app?.ghostController;
		const ghostName = gc?.currentGhost?.name;
		if (!ghostName) return null;

		const key = `${scopeId}__${sid}__${this.activeBindAnimationIds(scopeId).join(",")}`;
		if (this.planCache.has(key)) {
			return this.planCache.get(key);
		}
		try {
			const plan = await invoke("surface_composition_plan", {
				ghostName,
				shellName: gc?.currentShell || "master",
				surfaceId: sid,
				binds: this.activeBindAnimationIds(scopeId),
			});
			if (!plan || !Array.isArray(plan.layers)) return null;
			this.planCache.set(key, plan);
			console.info(
				`🧩 合成計画取得 (Rust): surface=${sid}, layers=${plan.layers.length}, hash=${plan.planHash}`,
			);
			return plan;
		} catch (_err) {
			return null;
		}
	},

	/**
	 * Rust 合成計画をレガシー描画レイヤー列へ変換する
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {{ layers: Record<string, any>[] }|null} plan
	 * @param {number} [scopeId] - pattern surface エイリアス解決のスコープ
	 * @returns {{ elements: Array<{ file: string, x: number, y: number, type: string }>, bindLayers: Array<{ file: string, x: number, y: number, type: string }> }|null}
	 */
	planToRenderLayers(plan, scopeId = 0) {
		if (!plan?.layers?.length) return null;
		const elements = [];
		const bindLayers = [];
		let hasElement = false;
		for (const layer of plan.layers) {
			const raw = layer.Element ?? layer.Pattern;
			if (!raw) continue;
			const type = methodToString(raw.method) || "overlay";
			if (layer.Element) {
				hasElement = true;
				if (raw.file) {
					elements.push({
						file: raw.file,
						x: raw.x ?? 0,
						y: raw.y ?? 0,
						type,
					});
				}
			} else {
				const file = patternSurfaceFile(
					this.resolveSurfaceNumber(raw.surface, scopeId),
				);
				if (file) {
					bindLayers.push({ file, x: raw.x ?? 0, y: raw.y ?? 0, type });
				}
			}
		}
		// element 定義が一つも無いシェル（bind のみ）はレガシー要素へフォールバック
		if (!hasElement) return null;
		return { elements, bindLayers };
	},

	/**
	 * element0〜elementN で定義されたレイヤー画像 + 装着中の着せ替え bind レイヤー +
	 * SERIKO アニメーションフレーム差分レイヤーをベース画像上に合成 (UKADOC準拠)
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {number|string} surfaceId
	 * @param {string} baseImgSrc
	 * @param {Function} resolveImagePath - ファイル名から画像URL/DataURLを解決する関数
	 * @param {number} [scopeId] - 着せ替え状態を参照するスコープ（scope 0 = さくら / 1 = うにゅ）
	 * @param {Array<{ file: string, x: number, y: number, type: string }>|null} [frameLayers]
	 *     - SERIKO アニメ 1 フレームの差分レイヤー（bind レイヤーの上に重ねる）
	 * @returns {Promise<string>} - 合成後のDataURL (PNG)
	 */
	async composeSurfaceElements(
		surfaceId,
		baseImgSrc,
		resolveImagePath,
		scopeId = 0,
		frameLayers = null,
	) {
		const sid = String(surfaceId);
		let elementList = this.elements[sid] || this.elements.default || [];
		let bindLayers =
			scopeId === 0 || scopeId === 1 ? this.activeBindLayers(scopeId, sid) : [];

		// Rust 合成計画（切替時のみ 1 IPC・キャッシュ済み）へ一本化
		// 失敗時（Web/Mock 等）は JS 収集レイヤーのレガシー合成へフォールバック
		try {
			const plan = await this.getCompositionPlan(sid, scopeId);
			const converted = this.planToRenderLayers(plan, scopeId);
			if (converted) {
				elementList = converted.elements;
				bindLayers = converted.bindLayers;
			}
		} catch (_err) {
			// レガシー経路を維持
		}

		const layers = frameLayers?.length
			? [...bindLayers, ...frameLayers]
			: bindLayers;
		return composeSurfaceElements(
			elementList,
			baseImgSrc,
			resolveImagePath,
			layers,
		);
	},

	/**
	 * 伺か標準仕様のPNAアルファマスク合成およびクロマキー（緑透過 #00FF00 / 左上ピクセル色）透過処理
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {string} imageSrc - 画像URLまたはDataURL
	 * @param {string|null} [pnaSrc] - PNAアルファマスク画像のURLまたはDataURL
	 * @returns {Promise<string>} - 透過合成後のDataURL (PNG)
	 */
	processChromaKey(imageSrc, pnaSrc = null) {
		return processChromaKey(imageSrc, pnaSrc, this.chromaKeyCache);
	},
};
