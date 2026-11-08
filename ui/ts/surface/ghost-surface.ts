// @ts-nocheck
/**
 * @file ghost-surface.js
 * @brief サーフィスおよびキャラクター表示メソッド (GhostController mixin)
 */
import { AppConfig } from "../core/config.js";
import {
	convertFileSrc,
	invoke,
	isTauriAvailable,
} from "../core/tauri-helper.js";
import { applySurfaceImageToDom } from "./ghost-surface-dom.js";
import { ghostSurfaceLoaderMethods } from "./ghost-surface-loader.js";
import {
	updateCurrentGhostDisplay,
	updateGhostCharacter,
} from "./ghost-surface-char.js";
import { notifySurfaceChangeEvents } from "./ghost-surface-notify.js";

export { applySurfaceImageToDom } from "./ghost-surface-dom.js";
export { updateCurrentGhostDisplay, updateGhostCharacter } from "./ghost-surface-char.js";
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
			return {
				selector: `#char-placeholder-${sId} img`,
				placeholder: byId(`char-placeholder-${sId}`),
				container: byId(`char-display-${sId}`),
				slot: byId(`char-slot-${sId}`),
				fallbackSurface: 0,
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
				if (isTauriAvailable()) {
					invoke("hide_subchar_window", { scopeId }).catch(() => {});
				}
				return;
			}

			this.app?.surfaceManager?.setSurfaceId?.(surfaceId, scopeId);
		} else if (surfaceId === -1 || surfaceId === "-1") {
			return;
		}

		if (isTauriAvailable()) {
			if (slot) slot.style.display = "none";
			if (container) container.style.display = "none";
			if (!isAnimationFrame) {
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

			return await Promise.all([load(surfaceId), loadPna(surfaceId)])
				.then(([dataUrl, pnaUrl]) => applyImageSrc(dataUrl, null, pnaUrl))
				.catch(async (err) => {
					console.warn("load_surface_image 失敗、フォールバック:", err);
					try {
						const fallbackUrl = await load(fallbackSurface);
						return await applyImageSrc(fallbackUrl);
					} catch (_err) {
						if (img) img.style.display = "none";
						if (!isMain && slot) slot.style.display = "none";
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
		const result = await applyImageSrc(imgUrl, fallbackSvgUrl, pnaUrl);

		// サーフィス切り替え完了時、UKADOC OnSurfaceChange / OnOtherSurfaceChange を通知
		await notifySurfaceChangeEvents(this, scopeId, surfaceId, img, isAnimationFrame);

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
};
