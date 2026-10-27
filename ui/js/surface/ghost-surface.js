import { AppConfig } from "../core/config.js";
import {
	convertFileSrc,
	emit,
	invoke,
	isTauriAvailable,
} from "../core/tauri-helper.js";

const byId = (id) => document.getElementById(id);

/** サーフェス/キャラクター表示メソッド (GhostController に mixin) */
export const ghostSurfaceMethods = {
	/**
	 * サーフィス表示を更新
	 * @this {import('../ghost/ghost.js').GhostController}
	 * @param {number|string} surfaceId
	 * @param {number} [scopeId]
	 * @param {Array<{ file: string, x: number, y: number, type: string }>|null} [extraLayers]
	 *     SERIKO アニメーションの 1 フレーム差分レイヤー。
	 *     指定時はベースサーフィス上に当該レイヤーを合成して表示し、
	 *     サーフィス番号・アニメーションスケジュールには干渉しない。
	 * @returns {Promise<string|null>} 合成/解決された画像URL
	 */
	async updateSurface(surfaceId, scopeId = 0, extraLayers = null) {
		const ghostName =
			this.currentGhost?.name || AppConfig.paths.fallbackGhostName;
		const ghostPath =
			this.currentGhost?.path ||
			`${AppConfig.paths.defaultGhostDir}/${ghostName}`;
		const shell = this.currentShell || AppConfig.paths.fallbackShellName;
		const isSubchar = scopeId >= 1;
		const selector = isSubchar
			? "#kero-placeholder img"
			: "#sakura-placeholder img";
		const placeholder = byId(
			isSubchar ? "kero-placeholder" : "sakura-placeholder",
		);
		const container = byId(isSubchar ? "kero-display" : "ghost-display");
		const slot = byId(isSubchar ? "kero-slot" : "ghost-container");
		// アニメフレーム合成モード: ベースサーフィスは既に解決済みのため
		// エイリアス解決・\s 相当の状態変更・アニメ再スケジューリングを行わない
		const isAnimationFrame = Array.isArray(extraLayers);
		// スコープ毎の更新世代。遅れて完了した古い更新で新しい表示を上書きしない
		this._surfaceSeq ??= {};
		this._surfaceSeq[scopeId] = (this._surfaceSeq[scopeId] ?? 0) + 1;
		const seq = this._surfaceSeq[scopeId];
		const isStale = () => this._surfaceSeq[scopeId] !== seq;

		if (!isAnimationFrame) {
			// サーフィスエイリアス (surface.alias ブロック) を番号へ解決 (UKADOC準拠)
			surfaceId =
				this.app?.surfaceManager?.resolveSurfaceNumber?.(surfaceId, scopeId) ??
				surfaceId;

			if (surfaceId === -1 || surfaceId === "-1") {
				if (slot) slot.style.display = "none";
				if (container) container.style.visibility = "hidden";
				if (isTauriAvailable()) {
					invoke("hide_subchar_window", { scopeId }).catch(() => {});
				}
				return;
			}

			// サーフィスIDを SurfaceManager に常に通知（当たり判定とアニメーションのため）
			// スコープ毎に独立管理 (\0 と \1 のサーフィスを混同しない)
			this.app?.surfaceManager?.setSurfaceId(surfaceId, scopeId);
		} else if (surfaceId === -1 || surfaceId === "-1") {
			return;
		}

		if (isTauriAvailable()) {
			// デスクトップ(Tauri)環境では、スコープ0(メイン)・スコープ1以降(サブ)問わず
			// 独立した透過キャラクターウィンドウで描画・移動を行う
			if (slot) slot.style.display = "none";
			if (container) container.style.display = "none";
			// アニメーションフレームは表示中のウィンドウへの差分描画なので再表示しない
			if (!isAnimationFrame) {
				await invoke("show_subchar_window", { scopeId }).catch(() => {});
			}
		} else {
			// Webブラウザ / Android等のシングルコンテナ環境ではメインウィンドウ内で描画
			if (slot && slot.style.display === "none") slot.style.display = "flex";
			if (container && container.style.display === "none")
				container.style.display = "flex";
			if (!isSubchar) {
				if (container) container.style.visibility = "visible";
			}
		}

		const fallbackSurface = isSubchar ? 10 : 0;
		const img = document.querySelector(selector);

		const applyImageSrc = async (src, fallbackSrc = null, pnaSrc = null) => {
			// 伺かの伝統的な PNA アルファマスク合成または緑背景（#00FF00 / 左上色）クロマキー透過処理
			let transparentSrc = src;
			if (src && this.app?.surfaceManager?.processChromaKey) {
				try {
					transparentSrc = await this.app.surfaceManager.processChromaKey(
						src,
						pnaSrc,
					);
				} catch (_e) {
					transparentSrc = src;
				}
			}

			// element0〜N の多重パーツ合成処理 (+ 装着中の着せ替え bind レイヤー)
			if (transparentSrc && this.app?.surfaceManager?.composeSurfaceElements) {
				try {
					const resolveLayerImage = async (fileName) => {
						const resolveId =
							fileName.replace(/\.[^/.]+$/, "").replace(/^surface/i, "") || "0";
						const pnaFileName = fileName.replace(/\.[^/.]+$/, ".pna");
						let layerSrc = null;
						let layerPnaSrc = null;

						if (isTauriAvailable()) {
							layerSrc = await this.loadSurfaceAsset(
								"load_surface_image",
								ghostPath,
								shell,
								resolveId,
							).catch(() => null);
							if (!layerSrc) return null;
							layerPnaSrc = await this.loadSurfaceAsset(
								"load_surface_pna",
								ghostPath,
								shell,
								resolveId,
							).catch(() => null);
						} else {
							layerSrc = convertFileSrc(
								`${ghostPath}/shell/${shell}/${fileName}`,
							);
							layerPnaSrc = convertFileSrc(
								`${ghostPath}/shell/${shell}/${pnaFileName}`,
							);
						}

						if (!layerSrc || !this.app?.surfaceManager?.processChromaKey) {
							return layerSrc;
						}
						try {
							return await this.app.surfaceManager.processChromaKey(
								layerSrc,
								layerPnaSrc,
							);
						} catch (_e) {
							return layerSrc;
						}
					};

					transparentSrc = await this.app.surfaceManager.composeSurfaceElements(
						surfaceId,
						transparentSrc,
						resolveLayerImage,
						scopeId,
						extraLayers,
					);
				} catch (_e) {
					// 合成エラー時はベース画像をそのまま使用
				}
			}

			if (isStale()) return null;

			if (this.currentSurfaces) {
				this.currentSurfaces.set(scopeId, transparentSrc);
			}

			if (isTauriAvailable()) {
				emit(`update-subchar-image-${scopeId}`, { src: transparentSrc });
			}

			if (img) {
				img.style.display = "block";
				if (fallbackSrc) {
					img.onerror = () => {
						img.onerror = null;
						img.src = fallbackSrc;
					};
				} else {
					img.onerror = null;
				}
				img.src = transparentSrc;
			} else if (placeholder) {
				const errorAttr = fallbackSrc
					? `onerror="this.onerror=null; this.src='${fallbackSrc}';"`
					: "";
				placeholder.innerHTML = `<img src="${transparentSrc}" 
                                       alt="scope${scopeId}" 
                                       ${errorAttr}
                                       style="width: 100%; height: 100%; object-fit: contain; pointer-events: auto;">`;
			}
		};

		if (isTauriAvailable()) {
			const load = (id) =>
				this.loadSurfaceAsset("load_surface_image", ghostPath, shell, id);
			const loadPna = (id) =>
				this.loadSurfaceAsset("load_surface_pna", ghostPath, shell, id).catch(
					() => null,
				);

			return await Promise.all([load(surfaceId), loadPna(surfaceId)])
				.then(([dataUrl, pnaUrl]) => applyImageSrc(dataUrl, null, pnaUrl))
				.catch(async (err) => {
					console.warn("load_surface_image 失敗、フォールバック:", err);
					try {
						const fallbackUrl = await load(fallbackSurface);
						return await applyImageSrc(fallbackUrl);
					} catch (_err) {
						if (img) img.style.display = "none";
						if (isSubchar && slot) slot.style.display = "none";
						return null;
					}
				});
		}

		const imgUrl = convertFileSrc(
			`${ghostPath}/shell/${shell}/surface${surfaceId}.png`,
		);
		const pnaUrl = convertFileSrc(
			`${ghostPath}/shell/${shell}/surface${surfaceId}.pna`,
		);
		const fallbackSvgUrl = convertFileSrc(
			`${ghostPath}/shell/${shell}/surface${fallbackSurface}.svg`,
		);
		return await applyImageSrc(imgUrl, fallbackSvgUrl, pnaUrl);
	},

	/**
	 * サーフィス画像 / PNA の読み込み（ゴースト・シェル・ID 単位でキャッシュ）
	 * アニメーションの毎フレームで同じファイルを Rust から読み直さないようにする
	 * @this {import('../ghost/ghost.js').GhostController}
	 * @param {"load_surface_image"|"load_surface_pna"} cmd
	 * @param {string} ghostPath
	 * @param {string} shellName
	 * @param {number|string} surfaceId
	 * @returns {Promise<string>}
	 */
	loadSurfaceAsset(cmd, ghostPath, shellName, surfaceId) {
		this._surfaceAssetCache ??= new Map();
		const key = `${cmd}|${ghostPath}|${shellName}|${surfaceId}`;
		let pending = this._surfaceAssetCache.get(key);
		if (!pending) {
			pending = invoke(cmd, {
				ghostPath,
				shellName,
				surfaceId: String(surfaceId),
			});
			this._surfaceAssetCache.set(key, pending);
			// ゴースト内で使った画像だけを保持し、長時間稼働でも無制限に増やさない
			if (this._surfaceAssetCache.size > 64) {
				this._surfaceAssetCache.delete(
					this._surfaceAssetCache.keys().next().value,
				);
			}
		}
		return pending;
	},

	/** ゴースト・シェル切り替え時などに画像キャッシュを破棄 */
	clearSurfaceAssetCache() {
		this._surfaceAssetCache?.clear();
		this.app?.surfaceManager?.chromaKeyCache?.clear();
	},

	async updateGhostCharacter(ghostName) {
		const sakuraPlaceholder =
			byId("sakura-placeholder") ||
			document.querySelector(".character-placeholder");
		const keroPlaceholder = byId("kero-placeholder");
		const keroSlot = byId("kero-slot");
		if (!sakuraPlaceholder) return;

		if (!ghostName) {
			sakuraPlaceholder.innerHTML = "";
			if (keroPlaceholder) keroPlaceholder.innerHTML = "";
			if (keroSlot) keroSlot.style.display = "none";
			return;
		}
		sakuraPlaceholder.title = ghostName;
		// メインキャラの初期化時にサブキャラ枠がメイン画面背後に残らないよう初期非表示
		if (keroSlot) keroSlot.style.display = "none";
		if (keroPlaceholder) keroPlaceholder.innerHTML = "";

		// 0: メインキャラクター (sakura) の初期サーフェス \s0 表示
		const promises = [this.updateSurface(0, 0)];

		// ゴースト側に kero.name 等のサブキャラ設定が存在する場合のみ、またはスクリプトからの明示呼び出し時にサブウィンドウで表示
		const hasKero = Boolean(this.currentGhost?.kero_name);
		if (hasKero) {
			promises.push(this.updateSurface(10, 1));
		} else if (isTauriAvailable()) {
			invoke("hide_subchar_window", { scopeId: 1 }).catch(() => {});
		}
		await Promise.all(promises);
	},

	updateCurrentGhostDisplay() {
		const el = byId("current-ghost");
		if (el) {
			el.textContent = this.currentGhost ? this.currentGhost.name : "未選択";
		}
	},
};
