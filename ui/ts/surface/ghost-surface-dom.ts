// @ts-nocheck
import {
	convertFileSrc,
	emit,
	isTauriAvailable,
} from "../core/tauri-helper.js";

export interface SurfaceManagerInterface {
	processChromaKey?: (src: string, pnaSrc: string | null) => Promise<string>;
	composeSurfaceElements?: (
		surfaceId: number | string,
		transparentSrc: string,
		resolveLayerImage: (fileName: string) => Promise<string | null>,
		scopeId: number,
		extraLayers: unknown,
	) => Promise<string>;
	elements?: Record<string, unknown[]>;
	[key: string]: unknown;
}

export interface GhostSurfaceControllerInterface {
	app?: {
		surfaceManager?: SurfaceManagerInterface;
		[key: string]: unknown;
	};
	loadSurfaceAsset: (
		cmd: string,
		ghostPath: string,
		shell: string,
		resolveId: string | number,
	) => Promise<string>;
	currentSurfaces?: Map<number, string>;
	[key: string]: unknown;
}

export async function applySurfaceImageToDom(
	controller: GhostSurfaceControllerInterface,
	src: string,
	fallbackSrc: string | null,
	pnaSrc: string | null,
	context: {
		scopeId: number;
		surfaceId: number | string;
		ghostPath: string;
		shell: string;
		extraLayers: unknown;
		isStale: () => boolean;
		img: HTMLImageElement | null;
		placeholder: HTMLElement | null;
	},
) {
	const {
		scopeId,
		surfaceId,
		ghostPath,
		shell,
		extraLayers,
		isStale,
		img,
		placeholder,
	} = context;

	let transparentSrc = src;
	if (src && controller.app?.surfaceManager?.processChromaKey) {
		try {
			transparentSrc = await controller.app.surfaceManager.processChromaKey(
				src,
				pnaSrc,
			);
		} catch (_e) {
			transparentSrc = src;
		}
	}

	if (
		transparentSrc &&
		controller.app?.surfaceManager?.composeSurfaceElements
	) {
		try {
			const resolveLayerImage = async (fileName: string) => {
				if (fileName.startsWith("data:")) {
					return fileName;
				}
				const resolveId =
					fileName.replace(/\.[^/.]+$/, "").replace(/^surface/i, "") || "0";
				const pnaFileName = fileName.replace(/\.[^/.]+$/, ".pna");
				let layerSrc = null;
				let layerPnaSrc = null;

				if (isTauriAvailable()) {
					layerSrc = await controller
						.loadSurfaceAsset("load_surface_image", ghostPath, shell, resolveId)
						.catch(() => null);
					if (!layerSrc) return null;
					layerPnaSrc = await controller
						.loadSurfaceAsset("load_surface_pna", ghostPath, shell, resolveId)
						.catch(() => null);
				} else {
					layerSrc = convertFileSrc(`${ghostPath}/shell/${shell}/${fileName}`);
					layerPnaSrc = convertFileSrc(
						`${ghostPath}/shell/${shell}/${pnaFileName}`,
					);
				}

				if (!layerSrc || !controller.app?.surfaceManager?.processChromaKey) {
					return layerSrc;
				}
				try {
					let chromaProcessed =
						await controller.app.surfaceManager.processChromaKey(
							layerSrc,
							layerPnaSrc,
						);
					const layerElements =
						controller.app.surfaceManager.elements?.[String(resolveId)];
					if (
						Array.isArray(layerElements) &&
						layerElements.length > 0 &&
						String(resolveId) !== String(surfaceId) &&
						controller.app.surfaceManager.composeSurfaceElements
					) {
						chromaProcessed =
							await controller.app.surfaceManager.composeSurfaceElements(
								resolveId,
								chromaProcessed,
								resolveLayerImage,
								scopeId,
								null,
							);
					}
					return chromaProcessed;
				} catch (_e) {
					return layerSrc;
				}
			};

			transparentSrc =
				await controller.app.surfaceManager.composeSurfaceElements(
					surfaceId,
					transparentSrc,
					resolveLayerImage,
					scopeId,
					extraLayers,
				);
		} catch (_e) {}
	}

	if (isStale()) return null;

	if (controller.currentSurfaces) {
		controller.currentSurfaces.set(scopeId, transparentSrc);
	}

	if (isTauriAvailable()) {
		try {
			emit(`update-subchar-image-${scopeId}`, { src: transparentSrc });
		} catch (_e) {}
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
		if (img.decode) {
			await img.decode().catch(() => {});
		}
	} else if (placeholder) {
		const errorAttr = fallbackSrc
			? `onerror="this.onerror=null; this.src='${fallbackSrc}';"`
			: "";
		placeholder.innerHTML = `<img src="${transparentSrc}" 
                               alt="scope${scopeId}" 
                               ${errorAttr}
                               style="width: 100%; height: 100%; object-fit: contain; pointer-events: auto;">`;
	}
	return transparentSrc;
}
