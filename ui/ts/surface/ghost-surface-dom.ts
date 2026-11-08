// @ts-nocheck
import { convertFileSrc, emit, isTauriAvailable } from "../core/tauri-helper.js";

export async function applySurfaceImageToDom(
	controller: any,
	src: string,
	fallbackSrc: string | null,
	pnaSrc: string | null,
	context: {
		scopeId: number;
		surfaceId: number | string;
		ghostPath: string;
		shell: string;
		extraLayers: any;
		isStale: () => boolean;
		img: any;
		placeholder: any;
	},
) {
	const { scopeId, surfaceId, ghostPath, shell, extraLayers, isStale, img, placeholder } =
		context;

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

	if (transparentSrc && controller.app?.surfaceManager?.composeSurfaceElements) {
		try {
			const resolveLayerImage = async (fileName: string) => {
				const resolveId =
					fileName.replace(/\.[^/.]+$/, "").replace(/^surface/i, "") || "0";
				const pnaFileName = fileName.replace(/\.[^/.]+$/, ".pna");
				let layerSrc = null;
				let layerPnaSrc = null;

				if (isTauriAvailable()) {
					layerSrc = await controller.loadSurfaceAsset(
						"load_surface_image",
						ghostPath,
						shell,
						resolveId,
					).catch(() => null);
					if (!layerSrc) return null;
					layerPnaSrc = await controller.loadSurfaceAsset(
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

				if (!layerSrc || !controller.app?.surfaceManager?.processChromaKey) {
					return layerSrc;
				}
				try {
					return await controller.app.surfaceManager.processChromaKey(
						layerSrc,
						layerPnaSrc,
					);
				} catch (_e) {
					return layerSrc;
				}
			};

			transparentSrc = await controller.app.surfaceManager.composeSurfaceElements(
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
		emit(`update-subchar-image-${scopeId}`, { src: transparentSrc });
		return transparentSrc;
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
