/**
 * Surface Compositor facade (powered by Pure Rust / WASM surface compositor)
 */
import {
	type SurfaceCompositionPlan,
	type SurfaceElement,
	wasmBridge,
} from "../core/wasm-bridge.js";

export interface ChromaKeyOptions {
	useSelfAlpha?: boolean;
	paintTransparentRegionBlack?: boolean;
}

export interface ComposedLayerInput {
	file: string;
	x?: number;
	y?: number;
	type?: string;
}

export function loadLayerImage(src: string): Promise<HTMLImageElement | null> {
	if (!src || typeof document === "undefined" || typeof Image === "undefined") {
		return Promise.resolve(null);
	}
	return new Promise((resolve) => {
		const img = new Image();
		if (!src.startsWith("data:")) {
			img.crossOrigin = "anonymous";
		}
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = src;
	});
}

export function drawComposedLayer(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	layer: ComposedLayerInput,
): void {
	const x = Number(layer.x ?? 0);
	const y = Number(layer.y ?? 0);
	const method = String(layer.type ?? "overlay").toLowerCase();

	if (method === "replace") {
		const w = img.naturalWidth || img.width || 0;
		const h = img.naturalHeight || img.height || 0;
		if (w > 0 && h > 0) {
			ctx.clearRect(x, y, w, h);
		}
		ctx.globalCompositeOperation = "source-over";
	} else if (method === "add" || method === "addition") {
		ctx.globalCompositeOperation = "lighter";
	} else if (method === "multiply" || method === "blend-multiply") {
		ctx.globalCompositeOperation = "multiply";
	} else if (method === "screen" || method === "blend-screen") {
		ctx.globalCompositeOperation = "screen";
	} else if (method === "reduce") {
		ctx.globalCompositeOperation = "destination-in";
	} else {
		ctx.globalCompositeOperation = "source-over";
	}

	ctx.drawImage(img, x, y);
	ctx.globalCompositeOperation = "source-over";
}

export async function processChromaKey(
	imageSrc: string,
	pnaSrc: string | null = null,
	cache?: Map<string, string>,
	options: ChromaKeyOptions = {},
): Promise<string> {
	if (!imageSrc || typeof imageSrc !== "string") {
		return imageSrc || "";
	}

	const useSelfAlpha = Boolean(options?.useSelfAlpha);
	const paintBlack = Boolean(options?.paintTransparentRegionBlack);
	const cacheKey = `${imageSrc}_${pnaSrc || ""}_${useSelfAlpha}_${paintBlack}`;

	const cached = cache?.get(cacheKey);
	if (cached !== undefined) {
		return cached;
	}

	if (
		typeof document === "undefined" ||
		typeof document.createElement !== "function"
	) {
		return imageSrc;
	}

	try {
		const [img, pnaImg] = await Promise.all([
			loadLayerImage(imageSrc),
			pnaSrc ? loadLayerImage(pnaSrc) : Promise.resolve(null),
		]);

		if (!img) {
			return imageSrc;
		}

		const width = img.naturalWidth || img.width || 1;
		const height = img.naturalHeight || img.height || 1;

		const canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) return imageSrc;

		ctx.drawImage(img, 0, 0, width, height);
		const imgData = ctx.getImageData(0, 0, width, height);
		const data = imgData.data;

		// PNA アルファデータの読み込み
		let pnaData: Uint8ClampedArray | null = null;
		if (pnaImg) {
			const pnaCanvas = document.createElement("canvas");
			pnaCanvas.width = width;
			pnaCanvas.height = height;
			const pnaCtx = pnaCanvas.getContext("2d", { willReadFrequently: true });
			if (pnaCtx) {
				pnaCtx.drawImage(pnaImg, 0, 0, width, height);
				pnaData = pnaCtx.getImageData(0, 0, width, height).data;
			}
		}

		// WASMによる高速クロマキー & PNA合成
		const pnaBytes = pnaData ? new Uint8Array(pnaData.buffer) : null;
		const bytes = new Uint8Array(data.buffer);
		const wasmSuccess = wasmBridge.processChromaKey(
			bytes,
			width,
			height,
			pnaBytes,
			useSelfAlpha,
			paintBlack,
		);

		if (!wasmSuccess) {
			if (!useSelfAlpha) {
				// 左上 (0,0) ピクセルの背景色を取得
				const targetR = data[0];
				const targetG = data[1];
				const targetB = data[2];

				// 右上 (width-1, 0) ピクセルの背景色を取得
				const trIdx = (width - 1) * 4;
				const trR = data[trIdx];
				const trG = data[trIdx + 1];
				const trB = data[trIdx + 2];

				for (let i = 0; i < data.length; i += 4) {
					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];

					const isMatchTopLeft =
						r === targetR && g === targetG && b === targetB;
					const isMatchTopRight = r === trR && g === trG && b === trB;
					const isGreenBg = g > 130 && g > r * 1.15 && g > b * 1.15;

					if (isMatchTopLeft || isMatchTopRight || isGreenBg) {
						if (paintBlack) {
							data[i] = 0;
							data[i + 1] = 0;
							data[i + 2] = 0;
						} else {
							data[i + 3] = 0;
						}
					}
				}
			}

			// PNA アルファチャネルの合成
			if (pnaData) {
				for (let i = 0; i < data.length; i += 4) {
					const alpha = pnaData[i];
					data[i + 3] = alpha;
				}
			}
		}

		ctx.putImageData(imgData, 0, 0);
		const processedUrl = canvas.toDataURL("image/png");

		if (cache) {
			cache.set(cacheKey, processedUrl);
		}

		return processedUrl;
	} catch (err) {
		console.warn("⚠️ [Surface Compositor] processChromaKey エラー:", err);
		return imageSrc;
	}
}

export function computeSurfaceCompositionPlan(
	surfaceId: number,
	elements: SurfaceElement[] | unknown[],
	activeBinds: number[] = [],
): SurfaceCompositionPlan | null {
	return wasmBridge.computeSurfaceCompositionPlan(
		surfaceId,
		elements,
		activeBinds,
	);
}

export const composeSurfaceElements = computeSurfaceCompositionPlan;
