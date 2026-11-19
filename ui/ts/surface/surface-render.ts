/**
 * @file surface-render.ts
 * @brief サーフィスの描画・合成、当たり判定、着せ替え管理を統合するメイン mixin モジュール
 */

import type { SurfaceCompositionPlan } from "../core/wasm-bridge.js";
import type { RawShellManifest } from "./shell-manifest.js";
import {
	type SurfaceCollisionContext,
	surfaceCollisionMethods,
} from "./surface-collision.js";
import {
	type ComposedLayerInput,
	computeSurfaceCompositionPlan,
	drawComposedLayer,
	loadLayerImage,
	processChromaKey,
} from "./surface-compositor.js";

export interface FrameComposeStats {
	frames: number;
	totalMs: number;
	slowestMs: number;
}

export interface SurfaceRenderContext extends SurfaceCollisionContext {
	elements: Record<string, ComposedLayerInput[]>;
	baseWidth?: number;
	baseHeight?: number;
	baseCanvasCache: Map<string, HTMLCanvasElement>;
	chromaKeyCache?: Map<string, string>;
	shellManifest?: RawShellManifest | null;
	_frameComposeStats?: FrameComposeStats;
	planCacheKey?: (sid: string, scopeId: number) => string;
	activeBindLayers?: (scopeId: number, sid: string) => ComposedLayerInput[];
	getCompositionPlan?: (
		sid: string,
		scopeId: number,
	) => Promise<SurfaceCompositionPlan | null>;
	planToRenderLayers?: (
		plan: SurfaceCompositionPlan | null,
		scopeId: number,
	) => {
		elements: ComposedLayerInput[];
		bindLayers: ComposedLayerInput[];
	} | null;
	composeFrameOnBase?: (
		baseCanvas: HTMLCanvasElement,
		frameLayers: ComposedLayerInput[],
		resolveImagePath: (file: string) => Promise<string | null>,
	) => Promise<string | null>;
}

async function renderLayersToCanvas(
	baseImgSrc: string,
	layers: ComposedLayerInput[],
	resolveImagePath: (file: string) => Promise<string | null>,
	fallbackWidth = 200,
	fallbackHeight = 400,
): Promise<{ canvas: HTMLCanvasElement; src: string } | null> {
	if (
		typeof document === "undefined" ||
		typeof document.createElement !== "function" ||
		typeof Image === "undefined"
	) {
		return null;
	}
	const [baseImg, ...layerImgs] = await Promise.all([
		loadLayerImage(baseImgSrc),
		...layers.map((layer) =>
			layer.file
				? resolveImagePath(layer.file).then((resolved) =>
						resolved ? loadLayerImage(resolved) : null,
					)
				: Promise.resolve(null),
		),
	]);
	if (!baseImg) return null;

	const canvas = document.createElement("canvas");
	canvas.width = baseImg.naturalWidth || baseImg.width || fallbackWidth;
	canvas.height = baseImg.naturalHeight || baseImg.height || fallbackHeight;
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;

	ctx.drawImage(baseImg, 0, 0);
	for (let i = 0; i < layers.length; i++) {
		const img = layerImgs[i];
		if (img) {
			drawComposedLayer(ctx, img, layers[i]);
		}
	}
	return { canvas, src: canvas.toDataURL("image/png") };
}

export const surfaceRenderMethods = {
	...surfaceCollisionMethods,

	async composeFrameOnBase(
		this: SurfaceRenderContext,
		baseCanvas: HTMLCanvasElement,
		frameLayers: ComposedLayerInput[],
		resolveImagePath: (file: string) => Promise<string | null>,
	): Promise<string | null> {
		if (!baseCanvas || !frameLayers?.length) return null;
		const t0 = globalThis.performance?.now?.() ?? Date.now();
		const canvas = document.createElement("canvas");
		canvas.width = baseCanvas.width;
		canvas.height = baseCanvas.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;
		ctx.drawImage(baseCanvas, 0, 0);

		const loadPromises = frameLayers.map((layer) =>
			layer.file
				? resolveImagePath(layer.file).then((resolved) =>
						resolved ? loadLayerImage(resolved) : null,
					)
				: Promise.resolve(null),
		);
		const loadedImages = await Promise.all(loadPromises);

		for (let i = 0; i < frameLayers.length; i++) {
			const layer = frameLayers[i];
			const img = loadedImages[i];
			if (img && layer.file) {
				drawComposedLayer(ctx, img, layer);
			}
		}

		const src = canvas.toDataURL("image/png");
		const ms = (globalThis.performance?.now?.() ?? Date.now()) - t0;
		this._frameComposeStats ??= { frames: 0, totalMs: 0, slowestMs: 0 };
		const stats = this._frameComposeStats;
		stats.frames += 1;
		stats.totalMs += ms;
		stats.slowestMs = Math.max(stats.slowestMs, ms);
		return src;
	},

	async composeSurfaceElements(
		this: SurfaceRenderContext,
		surfaceId: number | string,
		baseImgSrc: string,
		resolveImagePath: (file: string) => Promise<string | null>,
		scopeId: number = 0,
		frameLayers: ComposedLayerInput[] | null = null,
	): Promise<string> {
		const sid = String(surfaceId);
		const isFrame = Array.isArray(frameLayers);
		const cacheKey = this.planCacheKey?.(sid, scopeId) ?? `${sid}:${scopeId}`;

		const cachedBase = this.baseCanvasCache.get(cacheKey);
		if (isFrame && cachedBase && frameLayers) {
			const composeFrame =
				this.composeFrameOnBase ?? surfaceRenderMethods.composeFrameOnBase;
			const fast = await composeFrame.call(
				this,
				cachedBase,
				frameLayers,
				resolveImagePath,
			);
			if (fast) return fast;
		}

		try {
			const plan = await this.getCompositionPlan?.(sid, scopeId);
			const layers = this.planToRenderLayers?.(plan ?? null, scopeId);
			if (layers) {
				const combined = isFrame
					? [...layers.elements, ...layers.bindLayers, ...(frameLayers ?? [])]
					: [...layers.elements, ...layers.bindLayers];
				const rendered = await renderLayersToCanvas(
					baseImgSrc,
					combined,
					resolveImagePath,
					this.baseWidth,
					this.baseHeight,
				);
				if (!isFrame && rendered?.canvas) {
					this.baseCanvasCache.set(cacheKey, rendered.canvas);
				}
				return rendered?.src ?? baseImgSrc;
			}
		} catch (_err) {}

		const elementList =
			this.elements[sid] || (scopeId === 0 ? this.elements.default : []) || [];
		const numericSid = Number(surfaceId);
		const plan = computeSurfaceCompositionPlan(
			Number.isFinite(numericSid) ? numericSid : 0,
			elementList,
			[],
		);
		const resolvedElements: ComposedLayerInput[] = plan?.layers
			? plan.layers.map((l) => ({
					file: l.file,
					x: l.x ?? 0,
					y: l.y ?? 0,
					type: String(l.method || "overlay").toLowerCase(),
				}))
			: elementList;
		const bindLayers =
			!isFrame && (scopeId === 0 || scopeId === 1)
				? (this.activeBindLayers?.(scopeId, sid) ?? [])
				: [];
		const layers = frameLayers?.length
			? [...resolvedElements, ...bindLayers, ...frameLayers]
			: [...resolvedElements, ...bindLayers];
		if (layers.length === 0) return baseImgSrc;

		const rendered = await renderLayersToCanvas(
			baseImgSrc,
			layers,
			resolveImagePath,
			this.baseWidth,
			this.baseHeight,
		);
		if (!isFrame && rendered?.canvas) {
			this.baseCanvasCache.set(cacheKey, rendered.canvas);
		}
		return rendered?.src ?? baseImgSrc;
	},

	processChromaKey(
		this: SurfaceRenderContext,
		imageSrc: string,
		pnaSrc: string | null = null,
	): Promise<string> {
		const props = this.shellManifest?.descript?.properties;
		const useSelfAlpha =
			props?.["seriko.use_self_alpha"] === "1" ||
			props?.["seriko.use_self_alpha"]?.toLowerCase() === "true";
		const paintTransparentRegionBlack =
			props?.["seriko.paint_transparent_region_black"] === "1" ||
			props?.["seriko.paint_transparent_region_black"]?.toLowerCase() ===
				"true";
		return processChromaKey(imageSrc, pnaSrc, this.chromaKeyCache, {
			useSelfAlpha,
			paintTransparentRegionBlack,
		});
	},
};
