/**
 * Surface Compositor facade (powered by Pure Rust / WASM surface compositor)
 */
import { wasmBridge } from "../core/wasm-bridge.js";

interface ChromaKeyOptions {
	useSelfAlpha?: boolean;
	paintTransparentRegionBlack?: boolean;
}

function loadImageHelper(src: string): Promise<HTMLImageElement | null> {
	if (!src || typeof document === "undefined") return Promise.resolve(null);
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

	if (cache?.has(cacheKey)) {
		return cache.get(cacheKey)!;
	}

	if (
		typeof document === "undefined" ||
		typeof document.createElement !== "function"
	) {
		return imageSrc;
	}

	try {
		const [img, pnaImg] = await Promise.all([
			loadImageHelper(imageSrc),
			pnaSrc ? loadImageHelper(pnaSrc) : Promise.resolve(null),
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
	elements: unknown[],
	activeBinds: number[] = [],
) {
	return wasmBridge.computeSurfaceCompositionPlan(
		surfaceId,
		elements,
		activeBinds,
	);
}

export const composeSurfaceElements = computeSurfaceCompositionPlan;
