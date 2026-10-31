import { drawLayer } from "./layer.js";

/**
 * element0〜elementN で定義されたレイヤー画像 + 着せ替え bind レイヤーを
 * ベース画像上に合成 (UKADOC準拠)
 * @param {import('./surface-parser.js').SurfaceElement[]} elementList
 * @param {string} baseImgSrc
 * @param {Function} resolveImagePath - ファイル名から画像URL/DataURLを解決する関数
 * @param {Array<{ file: string, x: number, y: number, type: string }>} [bindLayers] - 装着中の着せ替えレイヤー（element 合成後に追加）
 * @param {{ returnCanvas?: boolean }} [options] - returnCanvas 時は `{ src, canvas }` を返す（SERIKO 差分描画の下地として再利用）
 * @returns {Promise<string|{ src: string, canvas: HTMLCanvasElement }>} - 合成後のDataURL (PNG)
 */
export function composeSurfaceElements(
	elementList,
	baseImgSrc,
	resolveImagePath,
	bindLayers = [],
	{ returnCanvas = false } = {},
) {
	if ((!elementList || elementList.length === 0) && bindLayers.length === 0) {
		return returnCanvas
			? (async () => {
					const img = new Image();
					const canvas = await new Promise((res) => {
						img.onload = () => {
							const c = document.createElement("canvas");
							c.width = img.naturalWidth || img.width;
							c.height = img.naturalHeight || img.height;
							c.getContext("2d")?.drawImage(img, 0, 0);
							res(c);
						};
						img.onerror = () => res(null);
						img.src = baseImgSrc;
					});
					return { src: baseImgSrc, canvas };
				})()
			: Promise.resolve(baseImgSrc);
	}

	return new Promise((resolve) => {
		const baseImg = new Image();
		baseImg.crossOrigin = "anonymous";
		baseImg.onload = async () => {
			try {
				const width = baseImg.naturalWidth || baseImg.width;
				const height = baseImg.naturalHeight || baseImg.height;
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (!ctx) return resolve(baseImgSrc);

				ctx.drawImage(baseImg, 0, 0);

				for (const element of elementList) {
					if (!element.file) continue;
					await drawLayer(
						ctx,
						element.file,
						resolveImagePath,
						element.x,
						element.y,
						element.type,
					);
				}

				for (const layer of bindLayers) {
					await drawLayer(
						ctx,
						layer.file,
						resolveImagePath,
						layer.x,
						layer.y,
						layer.type,
					);
				}

				const dataUrl = canvas.toDataURL("image/png");
				resolve(returnCanvas ? { src: dataUrl, canvas } : dataUrl);
			} catch (_err) {
				resolve(baseImgSrc);
			}
		};
		baseImg.onerror = () => resolve(baseImgSrc);
		baseImg.src = baseImgSrc;
	});
}
