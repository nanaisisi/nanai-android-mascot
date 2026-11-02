/**
 * レイヤーの画像URLを解決し、Imageオブジェクトをロードする
 * @param {string} fileName
 * @param {Function} resolveImagePath
 * @returns {Promise<HTMLImageElement|null>}
 */
export async function loadLayerImage(fileName, resolveImagePath) {
	if (!fileName) return null;
	const layerSrc = await resolveImagePath(fileName);
	if (!layerSrc) return null;

	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => resolve(null);
		img.src = layerSrc;
	});
}

/**
 * 読み込み済みのImageオブジェクトをキャンバスに描画する
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLImageElement} img
 * @param {number} x
 * @param {number} y
 * @param {string} [type]
 */
export function drawImageLayer(ctx, img, x, y, type = "overlay") {
	if (!img) return;
	const savedOp = ctx.globalCompositeOperation;
	const method = (type || "overlay").toLowerCase();

	if (method === "replace" || method === "overlayfast" || method === "fast") {
		ctx.clearRect(
			x,
			y,
			img.naturalWidth || img.width,
			img.naturalHeight || img.height,
		);
	} else if (
		method === "overlaymultiply" ||
		method === "blend-multiply-fast" ||
		method === "blend-multiply" ||
		method === "multiply"
	) {
		ctx.globalCompositeOperation = "multiply";
	} else if (
		method === "overlayscreen" ||
		method === "blend-screen-fast" ||
		method === "blend-screen" ||
		method === "screen"
	) {
		ctx.globalCompositeOperation = "screen";
	} else if (method === "blend-overlay" || method === "blend-softlight") {
		ctx.globalCompositeOperation = "overlay";
	} else if (method === "blend-add" || method === "add") {
		ctx.globalCompositeOperation = "lighter";
	} else if (method === "blend-darken" || method === "darken") {
		ctx.globalCompositeOperation = "darken";
	} else if (method === "blend-lighten" || method === "lighten") {
		ctx.globalCompositeOperation = "lighten";
	} else if (method === "blend-color-dodge" || method === "color-dodge") {
		ctx.globalCompositeOperation = "color-dodge";
	} else if (method === "blend-color-burn" || method === "color-burn") {
		ctx.globalCompositeOperation = "color-burn";
	} else if (method === "blend-hard-light" || method === "hard-light") {
		ctx.globalCompositeOperation = "hard-light";
	} else if (method === "blend-soft-light" || method === "soft-light") {
		ctx.globalCompositeOperation = "soft-light";
	} else if (method === "blend-difference" || method === "difference") {
		ctx.globalCompositeOperation = "difference";
	} else if (method === "blend-exclusion" || method === "exclusion") {
		ctx.globalCompositeOperation = "exclusion";
	} else if (method === "blend-hue" || method === "hue") {
		ctx.globalCompositeOperation = "hue";
	} else if (method === "blend-saturation" || method === "saturation") {
		ctx.globalCompositeOperation = "saturation";
	} else if (method === "blend-color" || method === "color") {
		ctx.globalCompositeOperation = "color";
	} else if (method === "blend-luminosity" || method === "luminosity") {
		ctx.globalCompositeOperation = "luminosity";
	} else if (method === "interpolate") {
		// 下の絵と同一色の部分を透過して重ねる (UKADOC準拠: Uint32Array 高速処理)
		try {
			const pWidth = img.naturalWidth || img.width;
			const pHeight = img.naturalHeight || img.height;
			if (pWidth > 0 && pHeight > 0 && typeof document !== "undefined") {
				const tempCanvas = document.createElement("canvas");
				tempCanvas.width = pWidth;
				tempCanvas.height = pHeight;
				const tempCtx = tempCanvas.getContext("2d", {
					willReadFrequently: true,
				});
				if (tempCtx && typeof ctx.getImageData === "function") {
					tempCtx.drawImage(img, 0, 0);
					const overlayImgData = tempCtx.getImageData(0, 0, pWidth, pHeight);
					const dstImgData = ctx.getImageData(x, y, pWidth, pHeight);

					const o32 = new Uint32Array(overlayImgData.data.buffer);
					const d32 = new Uint32Array(dstImgData.data.buffer);
					const len32 = o32.length;

					for (let i = 0; i < len32; i++) {
						const op = o32[i];
						if ((op & 0xff000000) === 0) continue;
						if ((op & 0x00ffffff) === (d32[i] & 0x00ffffff)) {
							o32[i] = 0;
						}
					}

					tempCtx.putImageData(overlayImgData, 0, 0);
					ctx.drawImage(tempCanvas, x, y);
					ctx.globalCompositeOperation = savedOp;
					return;
				}
			}
		} catch (_err) {
			// フォールバック
		}
	} else if (method === "reduce") {
		// ベースレイヤと新規レイヤの不透明度（アルファ）を乗算合成 (UKADOC準拠)
		try {
			const pWidth = img.naturalWidth || img.width;
			const pHeight = img.naturalHeight || img.height;
			if (pWidth > 0 && pHeight > 0 && typeof document !== "undefined") {
				const tempCanvas = document.createElement("canvas");
				tempCanvas.width = pWidth;
				tempCanvas.height = pHeight;
				const tempCtx = tempCanvas.getContext("2d", {
					willReadFrequently: true,
				});
				if (tempCtx && typeof ctx.getImageData === "function") {
					tempCtx.drawImage(img, 0, 0);
					const overlayImgData = tempCtx.getImageData(0, 0, pWidth, pHeight);
					const dstImgData = ctx.getImageData(x, y, pWidth, pHeight);

					const oData = overlayImgData.data;
					const dData = dstImgData.data;
					const totalBytes = oData.length;

					for (let i = 3; i < totalBytes; i += 4) {
						const srcAlpha = oData[i];
						const dstAlpha = dData[i];
						dData[i] = Math.round((dstAlpha * srcAlpha) / 255);
					}

					ctx.putImageData(dstImgData, x, y);
					ctx.globalCompositeOperation = savedOp;
					return;
				}
			}
		} catch (_err) {
			// フォールバック
		}
	} else if (method === "asis" || method === "base") {
		ctx.globalCompositeOperation = "source-over";
	}

	ctx.drawImage(img, x, y);
	ctx.globalCompositeOperation = savedOp;
}

/**
 * 1レイヤー画像を読み込んでキャンバスに描画する（drawImageLayer への委譲ラッパー）
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} fileName
 * @param {Function} resolveImagePath
 * @param {number} x
 * @param {number} y
 * @param {string} [type]
 * @returns {Promise<void>}
 */
export async function drawLayer(
	ctx,
	fileName,
	resolveImagePath,
	x,
	y,
	type = "overlay",
) {
	if (!fileName) return;
	const img = await loadLayerImage(fileName, resolveImagePath);
	if (img) {
		drawImageLayer(ctx, img, x, y, type);
	}
}
