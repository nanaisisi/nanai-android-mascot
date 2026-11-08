/**
 * @file surface-render.ts
 * @brief サーフィスの描画・合成、当たり判定、着せ替え管理を統合するメイン mixin モジュール
 */

import { drawImageLayer, loadLayerImage } from "./compositor/layer.js";
import { surfaceCollisionMethods } from "./surface-collision.js";
import {
	composeSurfaceElements,
	processChromaKey,
} from "./surface-compositor.js";
import { surfaceDressupMethods } from "./surface-dressup.js";

export const surfaceRenderMethods = {
	...surfaceCollisionMethods,
	...surfaceDressupMethods,

	async composeFrameOnBase(
		this: any,
		baseCanvas: HTMLCanvasElement,
		frameLayers: any[],
		resolveImagePath: (file: string) => Promise<string | null>,
	): Promise<string | null> {
		if (!baseCanvas || !frameLayers?.length) return null;
		const t0 = (globalThis.performance?.now?.() ?? Date.now()) as number;
		const canvas = document.createElement("canvas");
		canvas.width = baseCanvas.width;
		canvas.height = baseCanvas.height;
		const ctx = canvas.getContext("2d");
		if (!ctx) return null;
		ctx.drawImage(baseCanvas, 0, 0);

		const loadPromises = frameLayers.map((layer) =>
			layer.file
				? loadLayerImage(layer.file, resolveImagePath)
				: Promise.resolve(null),
		);
		const loadedImages = await Promise.all(loadPromises);

		for (let i = 0; i < frameLayers.length; i++) {
			const layer = frameLayers[i];
			const img = loadedImages[i];
			if (img && layer.file) {
				drawImageLayer(
					ctx,
					img,
					layer.x ?? 0,
					layer.y ?? 0,
					layer.type ?? "overlay",
				);
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
		this: any,
		surfaceId: number | string,
		baseImgSrc: string,
		resolveImagePath: (file: string) => Promise<string | null>,
		scopeId: number = 0,
		frameLayers: any[] | null = null,
	): Promise<string> {
		const sid = String(surfaceId);
		const isFrame = Array.isArray(frameLayers);
		const cacheKey = this.planCacheKey(sid, scopeId);

		if (isFrame && this.baseCanvasCache.has(cacheKey)) {
			const fast = await this.composeFrameOnBase(
				this.baseCanvasCache.get(cacheKey),
				frameLayers,
				resolveImagePath,
			);
			if (fast) return fast;
		}

		try {
			const plan = await this.getCompositionPlan(sid, scopeId);
			const layers = this.planToRenderLayers(plan, scopeId);
			if (layers) {
				if (!isFrame) {
					const result: any = await composeSurfaceElements(
						layers.elements,
						baseImgSrc,
						resolveImagePath,
						layers.bindLayers,
						{ returnCanvas: true },
					);
					if (result?.canvas) this.baseCanvasCache.set(cacheKey, result.canvas);
					return result?.src ?? baseImgSrc;
				}
				const withFrames = layers.bindLayers.concat(frameLayers);
				return composeSurfaceElements(
					layers.elements,
					baseImgSrc,
					resolveImagePath,
					withFrames,
				);
			}
		} catch (_err) {}

		const elementList = this.elements[sid] || this.elements.default || [];
		const bindLayers =
			!isFrame && (scopeId === 0 || scopeId === 1)
				? this.activeBindLayers(scopeId, sid)
				: [];
		const layers = frameLayers?.length
			? [...bindLayers, ...frameLayers]
			: bindLayers;
		const result: any = await composeSurfaceElements(
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

	processChromaKey(this: any, imageSrc: string, pnaSrc: string | null = null) {
		const useSelfAlpha =
			this.shellManifest?.descript?.properties?.["seriko.use_self_alpha"] ===
				"1" ||
			this.shellManifest?.descript?.properties?.[
				"seriko.use_self_alpha"
			]?.toLowerCase() === "true";
		const paintTransparentRegionBlack =
			this.shellManifest?.descript?.properties?.[
				"seriko.paint_transparent_region_black"
			] === "1" ||
			this.shellManifest?.descript?.properties?.[
				"seriko.paint_transparent_region_black"
			]?.toLowerCase() === "true";
		return processChromaKey(imageSrc, pnaSrc, this.chromaKeyCache, {
			useSelfAlpha,
			paintTransparentRegionBlack,
		});
	},
};
