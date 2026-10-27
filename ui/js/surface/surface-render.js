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
	drawLayer,
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
	 * planCache / baseCanvasCache のキー（scope + surface + 装着 bind 列）
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {number|string} surfaceId
	 * @param {number} [scopeId]
	 * @returns {string}
	 */
	planCacheKey(surfaceId, scopeId = 0) {
		return `${scopeId}__${surfaceId}__${this.activeBindAnimationIds(scopeId).join(",")}`;
	},

	/**
	 * Rust 合成計画（element + 装着 bind pattern）を取得する
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

		const key = this.planCacheKey(sid, scopeId);
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
			// vite は warn/error のみ中継するため（検証済み。通常メッセージは無音でよい）
			console.debug(
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
	 * SERIKO フレーム差分レイヤーをベース合成済みキャンバス上に描画する
	 * （dataURL 全量再合成なし・ベース plan ImageBitmap + 差分 drawImage）
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {HTMLCanvasElement} baseCanvas
	 * @param {Array<{ file: string, x?: number, y?: number, type?: string }>} frameLayers
	 * @param {Function} resolveImagePath
	 * @returns {Promise<string|null>} 合成後のDataURL (PNG)
	 */
	async composeFrameOnBase(baseCanvas, frameLayers, resolveImagePath) {
		if (!baseCanvas || !frameLayers?.length) return null;
		// 計測コード（Phase B fps 実測・実施済み: avg ≈ 15ms / 60fps 相当を達成）
		const t0 = globalThis.performance?.now?.() ?? Date.now();
		const canvas = document.createElement("canvas");
		canvas.width = baseCanvas.width;
		canvas.height = baseCanvas.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;
		ctx.drawImage(baseCanvas, 0, 0);
		for (const layer of frameLayers) {
			await drawLayer(
				ctx,
				layer.file,
				resolveImagePath,
				layer.x ?? 0,
				layer.y ?? 0,
				layer.type ?? "overlay",
			);
		}
		const src = canvas.toDataURL("image/png");
		// 計測コード（Phase B fps 実測・実施済み。warn のみ vite 中継される統計）
		const ms = (globalThis.performance?.now?.() ?? Date.now()) - t0;
		this._frameComposeStats ??= { frames: 0, totalMs: 0, slowestMs: 0 };
		const stats = this._frameComposeStats;
		stats.frames += 1;
		stats.totalMs += ms;
		stats.slowestMs = Math.max(stats.slowestMs, ms);
		return src;
	},

	/**
	 * element0〜elementN で定義されたレイヤー画像 + 装着中の着せ替え bind レイヤー +
	 * SERIKO アニメーションフレーム差分レイヤーをベース画像上に合成 (UKADOC準拠)
	 *
	 * 切替時（frameLayers なし）は合成済みベース canvas を `baseCanvasCache`
	 * （planCache と同一キー）に保存し、以降の SERIKO フレームは
	 * その下地 + 差分レイヤーの drawImage のみで dataURL を作る
	 * （composition-plan-integration-spec Phase B）。
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
		const isFrame = Array.isArray(frameLayers);
		const cacheKey = this.planCacheKey(sid, scopeId);

		// SERIKO フレーム: ベース合成済みキャンバスがあれば差分のみ描画
		// （element / bind レイヤーの毎フレーム再合成を回避）
		if (isFrame && this.baseCanvasCache.has(cacheKey)) {
			const fast = await this.composeFrameOnBase(
				this.baseCanvasCache.get(cacheKey),
				frameLayers,
				resolveImagePath,
			);
			if (fast) return fast;
			// canvas が使えない環境はレガシー全量合成へフォールバック
		}

		// Rust 合成計画へ一本化（Phase C）:
		// レイヤー収集は Rust plan 導出のみ。shellManifest がない /
		// Rust 不可・計画が立てられない場合のみレガシー JS 収集へフォールバック
		try {
			const plan = await this.getCompositionPlan(sid, scopeId);
			const layers = this.planToRenderLayers(plan, scopeId);
			if (layers) {
				if (!isFrame) {
					// ベース合成（切替時の 1 回のみ）→ SERIKO 差分描画の下地としてキャッシュ
					const result = await composeSurfaceElements(
						layers.elements,
						baseImgSrc,
						resolveImagePath,
						layers.bindLayers,
						{ returnCanvas: true },
					);
					if (result?.canvas) this.baseCanvasCache.set(cacheKey, result.canvas);
					return result?.src ?? baseImgSrc;
				}
				// SERIKO フレーム（キャッシュ未成立時のみ・通常は通らない）
				const withFrames = layers.bindLayers.concat(frameLayers);
				return composeSurfaceElements(
					layers.elements,
					baseImgSrc,
					resolveImagePath,
					withFrames,
				);
			}
		} catch (_err) {
			// レガシー経路へフォールバック
		}

		// レガシーフォールバック（Web/Mock・Rust 不通時）: JS 収集レイヤーで合成
		const elementList = this.elements[sid] || this.elements.default || [];
		const bindLayers =
			!isFrame && (scopeId === 0 || scopeId === 1)
				? this.activeBindLayers(scopeId, sid)
				: [];
		const layers = frameLayers?.length
			? [...bindLayers, ...frameLayers]
			: bindLayers;
		const result = await composeSurfaceElements(
			elementList,
			baseImgSrc,
			resolveImagePath,
			layers,
			{ returnCanvas: !isFrame },
		);
		if (!isFrame && result?.canvas) {
			this.baseCanvasCache.set(cacheKey, result.canvas);
		}
		return result?.src ?? baseImgSrc;
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
