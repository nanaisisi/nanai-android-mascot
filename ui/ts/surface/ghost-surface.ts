// @ts-nocheck
/**
 * @file ghost-surface.js
 * @brief サーフィスおよびキャラクター表示メソッド (GhostController mixin)
 */
import { AppConfig } from "../core/config.js";
import {
	applyAnimatedElementsCursor,
	type CursorAssetData,
	stopAnimatedCursor,
} from "../core/cursor-animator.js";
import {
	convertFileSrc,
	invoke,
	isSinglePageUi,
	isTauriAvailable,
} from "../core/tauri-helper.js";
import { showBalloonContextMenu } from "../ui/balloon-context-menu.js";
import {
	updateCurrentGhostDisplay,
	updateGhostCharacter,
} from "./ghost-surface-char.js";
import { applySurfaceImageToDom } from "./ghost-surface-dom.js";
import { ghostSurfaceLoaderMethods } from "./ghost-surface-loader.js";
import { notifySurfaceChangeEvents } from "./ghost-surface-notify.js";

export {
	updateCurrentGhostDisplay,
	updateGhostCharacter,
} from "./ghost-surface-char.js";
export { applySurfaceImageToDom } from "./ghost-surface-dom.js";
export { notifySurfaceChangeEvents } from "./ghost-surface-notify.js";

const byId = (id) => document.getElementById(id);

/** サーフェス/キャラクター表示メソッド (GhostController に mixin) */
export const ghostSurfaceMethods = {
	...ghostSurfaceLoaderMethods,

	/**
	 * サーフィス表示を更新
	 * @this {import('../ghost/ghost.js').GhostController}
	 * @param {number|string} surfaceId
	 * @param {number} [scopeId]
	 * @param {Array<{ file: string, x: number, y: number, type: string }>|null} [extraLayers]
	 */
	async updateSurface(surfaceId, scopeId = 0, extraLayers = null) {
		const ghostName =
			this.currentGhost?.name || AppConfig.paths.fallbackGhostName;
		const ghostPath =
			this.currentGhost?.path ||
			`${AppConfig.paths.defaultGhostDir}/${ghostName}`;
		const shell = this.currentShell || AppConfig.paths.fallbackShellName;

		// WASM (descript準拠) またはサーフェス定義から所属スコープIDを解決
		const parsedSurfaceNum = parseInt(String(surfaceId), 10);
		if (!Number.isNaN(parsedSurfaceNum) && scopeId === 0) {
			const inferredScope = this.app?.wasmBridge?.resolveScopeForSurface
				? this.app.wasmBridge.resolveScopeForSurface(parsedSurfaceNum)
				: parsedSurfaceNum < 100
					? 0
					: Math.floor(parsedSurfaceNum / 100);
			if (inferredScope > 0) {
				scopeId = inferredScope;
				console.log(
					`🔍 [Surface/WASM] サーフィス番号 ${surfaceId} から descript 準拠でスコープ ${scopeId} を解決しました`,
				);
			}
		}

		console.log(
			`🖼️ [Surface] updateSurface 呼び出し: scope=${scopeId}, surface=${surfaceId}, ghost=${ghostName}, shell=${shell}, tauri=${isTauriAvailable()}`,
		);

		const getScopeTarget = (sId) => {
			if (sId === 0) {
				return {
					selector: "#sakura-placeholder img",
					placeholder: byId("sakura-placeholder"),
					container: byId("ghost-display"),
					slot: byId("ghost-container"),
					fallbackSurface: 0,
					isMain: true,
				};
			}
			if (sId === 1) {
				return {
					selector: "#kero-placeholder img",
					placeholder: byId("kero-placeholder"),
					container: byId("kero-display"),
					slot: byId("kero-slot"),
					fallbackSurface: 10,
					isMain: false,
				};
			}

			// 3キャラ目以降 (sId >= 2): 必要に応じて動的DOMスロット枠を作成
			let slotEl = byId(`char-slot-${sId}`);
			let containerEl = byId(`char-display-${sId}`);
			let placeholderEl = byId(`char-placeholder-${sId}`);

			if (
				!slotEl &&
				typeof document !== "undefined" &&
				typeof document.createElement === "function"
			) {
				const mainDisplay =
					document.querySelector(".main-display") ||
					document.querySelector(".container");
				if (mainDisplay) {
					slotEl = document.createElement("div");
					slotEl.id = `char-slot-${sId}`;
					slotEl.className = `character-slot char-slot-${sId}`;
					slotEl.style.display = "none";

					const balloonDisp = document.createElement("div");
					balloonDisp.id = `char-balloon-display-${sId}`;
					balloonDisp.className = `balloon-display char-balloon-${sId}`;
					balloonDisp.style.display = "none";
					balloonDisp.innerHTML = `<div class="balloon"><div class="balloon-text" id="char-balloon-text-${sId}"></div></div>`;
					balloonDisp.addEventListener(
						"contextmenu",
						(e: MouseEvent) => {
							e.preventDefault();
							e.stopPropagation();
							void showBalloonContextMenu({
								x: e.clientX || 100,
								y: e.clientY || 100,
								screenX: e.screenX,
								screenY: e.screenY,
								scopeId: sId,
								app: this.app,
							});
						},
						true,
					);
					slotEl.appendChild(balloonDisp);

					containerEl = document.createElement("div");
					containerEl.id = `char-display-${sId}`;
					containerEl.className = `ghost-display char-display-${sId}`;

					const charDiv = document.createElement("div");
					charDiv.className = "ghost-character";
					charDiv.id = `char-character-${sId}`;

					placeholderEl = document.createElement("span");
					placeholderEl.id = `char-placeholder-${sId}`;
					placeholderEl.className = "character-placeholder";

					charDiv.appendChild(placeholderEl);
					containerEl.appendChild(charDiv);
					slotEl.appendChild(containerEl);

					mainDisplay.appendChild(slotEl);

					try {
						this.app?.setupGhostInteractions?.(containerEl, sId);
					} catch (_e) {}
				}
			}

			return {
				selector: `#char-placeholder-${sId} img`,
				placeholder: placeholderEl || byId(`char-placeholder-${sId}`),
				container: containerEl || byId(`char-display-${sId}`),
				slot: slotEl || byId(`char-slot-${sId}`),
				fallbackSurface: sId * 10,
				isMain: false,
			};
		};

		const target = getScopeTarget(scopeId);
		const { selector, placeholder, container, slot, fallbackSurface, isMain } =
			target;

		const isAnimationFrame = Array.isArray(extraLayers);
		this._surfaceSeq ??= {};
		this._surfaceSeq[scopeId] = (this._surfaceSeq[scopeId] ?? 0) + 1;
		const seq = this._surfaceSeq[scopeId];
		const isStale = () => this._surfaceSeq[scopeId] !== seq;

		if (!isAnimationFrame) {
			surfaceId =
				this.app?.surfaceManager?.resolveSurfaceNumber?.(surfaceId, scopeId) ??
				surfaceId;

			if (surfaceId === -1 || surfaceId === "-1") {
				if (slot) slot.style.display = "none";
				if (container) container.style.visibility = "hidden";
				// ウィンドウ自体は隠さず、画像要素のみ非表示にする
				return;
			}

			this.app?.surfaceManager?.setSurfaceId?.(surfaceId, scopeId);
		} else if (surfaceId === -1 || surfaceId === "-1") {
			return;
		}

		const useMultiWindow = isTauriAvailable() && !isSinglePageUi();
		if (useMultiWindow) {
			if (slot) slot.style.display = "none";
			if (container) container.style.display = "none";
			// 既存のウィンドウが開いていない初回等の初期化時のみshow_subchar_windowを先行要求
			// 通常のサーフィス変更や再読み込み時は、画像デコード後に実サイズと共にshow_subchar_windowが呼ばれるため、
			// ここでサイズなしのshow_subchar_windowを呼ぶことによる一瞬のデフォルトサイズ縮小・チラつきを防ぐ
			const isExistingSurface = Boolean(this.currentSurfaces?.has(scopeId));
			if (!isAnimationFrame && (!isExistingSurface || scopeId >= 1)) {
				await invoke("show_subchar_window", { scopeId }).catch(() => {});
			}
		} else {
			if (slot && slot.style.display === "none") slot.style.display = "flex";
			if (container && container.style.display === "none")
				container.style.display = "flex";
			if (isMain) {
				if (container) container.style.visibility = "visible";
			}
		}

		const img = document.querySelector(selector);
		const domContext = {
			scopeId,
			surfaceId,
			ghostPath,
			shell,
			extraLayers,
			isStale,
			img,
			placeholder,
		};

		const applyImageSrc = (src, fallbackSrc = null, pnaSrc = null) =>
			applySurfaceImageToDom(this, src, fallbackSrc, pnaSrc, domContext);

		if (isTauriAvailable()) {
			const load = (id) =>
				this.loadSurfaceAsset("load_surface_image", ghostPath, shell, id);
			const loadPna = (id) =>
				this.loadSurfaceAsset("load_surface_pna", ghostPath, shell, id).catch(
					() => null,
				);

			let tauriResult = null;
			try {
				const [dataUrl, pnaUrl] = await Promise.all([
					load(surfaceId),
					loadPna(surfaceId),
				]);
				console.log(
					`✨ [Surface] Tauri サーフィスアセットロード成功: scope=${scopeId}, surface=${surfaceId}, hasData=${Boolean(dataUrl)}`,
				);
				tauriResult = await applyImageSrc(dataUrl, null, pnaUrl);
			} catch (err) {
				console.warn(
					`⚠️ [Surface] load_surface_image 失敗 (scope=${scopeId}, surface=${surfaceId})、フォールバック(${fallbackSurface})へ移行:`,
					err,
				);
				try {
					const fallbackUrl = await load(fallbackSurface);
					tauriResult = await applyImageSrc(fallbackUrl);
				} catch (_err) {
					console.error(
						`❌ [Surface] サーフィスフォールバックも失敗 (scope=${scopeId}, fallback=${fallbackSurface}):`,
						_err,
					);
					if (img) img.style.display = "none";
					if (!isMain && slot) slot.style.display = "none";
					return null;
				}
			}

			if (!useMultiWindow) {
				await notifySurfaceChangeEvents(
					this,
					scopeId,
					surfaceId,
					img,
					isAnimationFrame,
				);
				if (this.currentGhost) {
					this.currentGhost.currentSurface = surfaceId;
				}
			}
			return tauriResult;
		}

		const imgUrl = convertFileSrc(
			`${ghostPath}/shell/${shell}/surface${surfaceId}.png`,
		);
		console.log(
			`🌐 [Surface] Web非Tauri環境 サーフィスURL生成: scope=${scopeId}, url=${imgUrl}`,
		);
		const pnaUrl = convertFileSrc(
			`${ghostPath}/shell/${shell}/surface${surfaceId}.pna`,
		);
		const fallbackSvgUrl = convertFileSrc(
			`${ghostPath}/shell/${shell}/surface${fallbackSurface}.svg`,
		);
		const result = await applyImageSrc(imgUrl, fallbackSvgUrl, pnaUrl);

		// サーフィス切り替え完了時、UKADOC OnSurfaceChange / OnOtherSurfaceChange を通知
		await notifySurfaceChangeEvents(
			this,
			scopeId,
			surfaceId,
			img,
			isAnimationFrame,
		);

		if (this.currentGhost) {
			this.currentGhost.currentSurface = surfaceId;
		}

		return result;
	},

	async updateGhostCharacter(ghostName) {
		return updateGhostCharacter(this, ghostName);
	},

	updateCurrentGhostDisplay() {
		return updateCurrentGhostDisplay(this);
	},

	applyGhostCursor() {
		if (
			typeof document === "undefined" ||
			typeof document.querySelectorAll !== "function"
		)
			return;
		const cursors = this.currentGhost?.assets?.cursors;
		const slots = document.querySelectorAll<HTMLElement>(".character-slot");
		if (!Array.isArray(cursors) || cursors.length === 0) {
			stopAnimatedCursor("ghost-slot-cursor");
			for (const slot of slots) {
				slot.style.cursor = "";
			}
			return;
		}
		if (globalThis.__TAURI__) {
			void invoke<CursorAssetData | null>("load_cursor_asset", {
				baseKind: "path",
				file: cursors[0],
			})
				.then((asset) => {
					if (asset && Array.isArray(asset.frames) && asset.frames.length > 0) {
						applyAnimatedElementsCursor(
							"ghost-slot-cursor",
							slots,
							asset.frames,
						);
						return;
					}
					const fallback = `url("${convertFileSrc(cursors[0])}"), auto`;
					for (const slot of slots) {
						slot.style.cursor = fallback;
					}
				})
				.catch(() => {
					const fallback = `url("${convertFileSrc(cursors[0])}"), auto`;
					for (const slot of slots) {
						slot.style.cursor = fallback;
					}
				});
			return;
		}
		const cursorValue = `url("${convertFileSrc(cursors[0])}"), auto`;
		for (const slot of slots) {
			slot.style.cursor = cursorValue;
		}
	},
};
