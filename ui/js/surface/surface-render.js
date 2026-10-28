/**
 * @file surface-render.js
 * @brief サーフィスの描画・合成、当たり判定、着せ替え管理を統合するメイン mixin モジュール
 */
import {
	composeSurfaceElements,
	drawLayer,
	processChromaKey,
} from "./surface-compositor.js";
import { surfaceCollisionMethods } from "./surface-collision.js";
import { surfaceDressupMethods } from "./surface-dressup.js";

export const surfaceRenderMethods = {
	...surfaceCollisionMethods,
	...surfaceDressupMethods,

	/**
	 * SERIKO フレーム差分レイヤーをベース合成済みキャンバス上に描画する
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {HTMLCanvasElement} baseCanvas
	 * @param {Array<{ file: string, x?: number, y?: number, type?: string }>} frameLayers
	 * @param {Function} resolveImagePath
	 * @returns {Promise<string|null>} 合成後のDataURL (PNG)
	 */
	async composeFrameOnBase(baseCanvas, frameLayers, resolveImagePath) {
		if (!baseCanvas || !frameLayers?.length) return null;
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
		const ms = (globalThis.performance?.now?.() ?? Date.now()) - t0;
		this._frameComposeStats ??= { frames: 0, totalMs: 0, slowestMs: 0 };
		const stats = this._frameComposeStats;
		stats.frames += 1;
		stats.totalMs += ms;
		stats.slowestMs = Math.max(stats.slowestMs, ms);
		return src;
	},

	/**
	 * element / bind レイヤーおよび SERIKO アニメーションフレームを合成します。
	 * @this {import('./surface-manager.js').SurfaceManager}
	 * @param {number|string} surfaceId
	 * @param {string} baseImgSrc
	 * @param {Function} resolveImagePath
	 * @param {number} [scopeId]
	 * @param {Array<{ file: string, x: number, y: number, type: string }>|null} [frameLayers]
	 * @returns {Promise<string>}
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
	 * PNAアルファマスク合成およびクロマキー透過処理
	 * @this {import('./surface-manager.js').SurfaceManager}
	 */
	processChromaKey(imageSrc, pnaSrc = null) {
		return processChromaKey(imageSrc, pnaSrc, this.chromaKeyCache);
	},
};
