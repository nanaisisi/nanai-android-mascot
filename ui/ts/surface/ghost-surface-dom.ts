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

export interface CollisionOverlayController {
	app?: {
		surfaceManager?: SurfaceManagerInterface;
		[key: string]: unknown;
	};
	currentSurfaces?: Map<number, string>;
	[key: string]: unknown;
}

export interface GhostSurfaceControllerInterface
	extends CollisionOverlayController {
	loadSurfaceAsset: (
		cmd: string,
		ghostPath: string,
		shell: string,
		resolveId: string | number,
	) => Promise<string>;
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

	renderCollisionOverlayForScope(
		controller,
		scopeId,
		surfaceId,
		placeholder || img?.parentElement || null,
	);
	return transparentSrc;
}

function resolveSurfaceIdForScope(
	sm: Record<string, unknown> | undefined,
	scopeId: number,
	surfaceId?: number | string | null,
): number | string {
	if (surfaceId !== undefined && surfaceId !== null && surfaceId !== "") {
		return surfaceId;
	}
	if (typeof sm?.currentSurfaceIdFor === "function") {
		const resolved = (
			sm.currentSurfaceIdFor as (s: number) => number | string | undefined
		)(scopeId);
		if (resolved !== undefined && resolved !== null && resolved !== "") {
			return resolved;
		}
	}
	const charSurfaceIds = sm?.charSurfaceIds as
		| Record<number, number | string>
		| undefined;
	if (charSurfaceIds?.[scopeId] !== undefined) {
		return charSurfaceIds[scopeId];
	}
	return scopeId === 1
		? ((sm?.keroSurfaceId as number | string | undefined) ?? 10)
		: ((sm?.currentSurfaceId as number | string | undefined) ?? 0);
}

export function renderCollisionOverlayForScope(
	controller: CollisionOverlayController,
	scopeId: number,
	surfaceId?: number | string | null,
	ghostDisplayEl: HTMLElement | null = null,
) {
	const app = controller.app as Record<string, unknown> | undefined;
	const settings = (app?.settings as Record<string, unknown>) || {};
	const colInput =
		typeof document !== "undefined" &&
		typeof document.getElementById === "function"
			? (document.getElementById(
					"dev-check-collision",
				) as HTMLInputElement | null)
			: null;
	const showCollisions = Boolean(
		settings.showCollisionArea || app?.showCollisionArea || colInput?.checked,
	);

	const sm = app?.surfaceManager as Record<string, unknown> | undefined;
	const resolvedSurfaceId = resolveSurfaceIdForScope(sm, scopeId, surfaceId);
	const sid = String(resolvedSurfaceId);
	const collisionsMap = sm?.collisions as Record<string, unknown[]> | undefined;
	const baseColList = Array.isArray(collisionsMap?.[sid])
		? collisionsMap[sid]
		: Array.isArray(collisionsMap?.default)
			? collisionsMap.default
			: [];
	const animationsMap = sm?.animations as Record<string, unknown> | undefined;
	const animEntriesRaw = animationsMap?.[sid];
	const animEntries = Array.isArray(animEntriesRaw)
		? animEntriesRaw
		: animEntriesRaw && typeof animEntriesRaw === "object"
			? Object.values(animEntriesRaw)
			: [];
	const animColList: unknown[] = [];
	for (const anim of animEntries) {
		if (
			anim &&
			typeof anim === "object" &&
			Array.isArray((anim as { collisions?: unknown[] }).collisions)
		) {
			animColList.push(...(anim as { collisions: unknown[] }).collisions);
		}
	}
	const colList =
		animColList.length > 0 ? [...baseColList, ...animColList] : baseColList;

	if (isTauriAvailable()) {
		try {
			void Promise.resolve(
				emit(`update-subchar-collisions-${scopeId}`, {
					visible: showCollisions,
					surfaceId: resolvedSurfaceId,
					collisions: showCollisions ? colList : [],
				}),
			).catch(() => {});
		} catch (_e) {}
	}

	if (typeof document === "undefined") return;

	const container =
		ghostDisplayEl ||
		(typeof document.getElementById === "function"
			? document.getElementById(
					scopeId === 1 ? "kero-display" : "ghost-display",
				)
			: null) ||
		(typeof document.querySelector === "function"
			? document.querySelector(`.ghost-display[data-scope="${scopeId}"]`)
			: null);

	if (!container) return;

	let canvas = (
		typeof container.querySelector === "function"
			? container.querySelector(".collision-overlay-canvas")
			: null
	) as HTMLCanvasElement | null;

	if (!showCollisions) {
		if (canvas?.style) canvas.style.display = "none";
		return;
	}

	if (!canvas && typeof document.createElement === "function") {
		canvas = document.createElement("canvas");
		canvas.className = "collision-overlay-canvas";
		container.appendChild(canvas);
	}

	if (!canvas) return;

	const img = (
		typeof container.querySelector === "function"
			? container.querySelector("img")
			: null
	) as HTMLImageElement | null;
	const baseW = Number(sm?.baseWidth) || 200;
	const baseH = Number(sm?.baseHeight) || 400;
	const w = Math.max(
		baseW,
		img?.naturalWidth || img?.width || container.clientWidth || 200,
	);
	const h = Math.max(
		baseH,
		img?.naturalHeight || img?.height || container.clientHeight || 400,
	);

	canvas.width = w;
	canvas.height = h;
	if (canvas.style) canvas.style.display = "block";

	if (sm && typeof sm.renderCollisionOverlayCanvas === "function") {
		(
			sm.renderCollisionOverlayCanvas as (
				c: HTMLCanvasElement,
				sid: number | string,
				s: number,
			) => void
		)(canvas, resolvedSurfaceId, scopeId);
	}
}

export function renderAllCollisionOverlays(
	controller: CollisionOverlayController,
) {
	const app = controller.app as Record<string, unknown> | undefined;
	const sm = app?.surfaceManager as Record<string, unknown> | undefined;
	const scopes = new Set<number>([0, 1]);

	if (controller.currentSurfaces instanceof Map) {
		for (const scope of controller.currentSurfaces.keys()) {
			if (typeof scope === "number" && Number.isFinite(scope)) {
				scopes.add(scope);
			}
		}
	}

	const charSurfaceIds = sm?.charSurfaceIds as
		| Record<string, unknown>
		| undefined;
	if (charSurfaceIds && typeof charSurfaceIds === "object") {
		for (const key of Object.keys(charSurfaceIds)) {
			const parsed = Number(key);
			if (Number.isInteger(parsed) && parsed >= 0) {
				scopes.add(parsed);
			}
		}
	}

	for (const scopeId of scopes) {
		const resolvedSurfaceId = resolveSurfaceIdForScope(sm, scopeId);
		renderCollisionOverlayForScope(
			controller,
			scopeId,
			resolvedSurfaceId,
			null,
		);
	}
}
