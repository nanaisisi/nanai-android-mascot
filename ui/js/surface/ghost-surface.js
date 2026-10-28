/**
 * @file ghost-surface.js
 * @brief サーフィスおよびキャラクター表示メソッド (GhostController mixin)
 */
import { AppConfig } from "../core/config.js";
import {
	convertFileSrc,
	emit,
	invoke,
	isTauriAvailable,
} from "../core/tauri-helper.js";
import { ghostSurfaceLoaderMethods } from "./ghost-surface-loader.js";

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
		const isSubchar = scopeId >= 1;
		const selector = isSubchar
			? "#kero-placeholder img"
			: "#sakura-placeholder img";
		const placeholder = byId(
			isSubchar ? "kero-placeholder" : "sakura-placeholder",
		);
		const container = byId(isSubchar ? "kero-display" : "ghost-display");
		const slot = byId(isSubchar ? "kero-slot" : "ghost-container");
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

			this.app?.surfaceManager?.setSurfaceId(surfaceId, scopeId);
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
			if (!isSubchar) {
				if (container) container.style.visibility = "visible";
			}
		}

		const fallbackSurface = isSubchar ? 10 : 0;
		const img = document.querySelector(selector);

		const applyImageSrc = async (src, fallbackSrc = null, pnaSrc = null) => {
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
				} catch (_e) {}
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
		if (keroSlot) keroSlot.style.display = "none";
		if (keroPlaceholder) keroPlaceholder.innerHTML = "";

		const promises = [this.updateSurface(0, 0)];

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
