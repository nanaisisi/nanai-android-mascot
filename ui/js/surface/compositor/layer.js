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
	} else if (method === "blend-multiply" || method === "multiply") {
		ctx.globalCompositeOperation = "multiply";
	} else if (method === "blend-screen" || method === "screen") {
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
	} else if (method === "asis" || method === "base") {
		ctx.globalCompositeOperation = "source-over";
	}

	ctx.drawImage(img, x, y);
	ctx.globalCompositeOperation = savedOp;
}

/**
 * 1レイヤー画像を読み込んでキャンバスに描画する（replace は下地クリア付き）
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
	const layerSrc = await resolveImagePath(fileName);
	if (!layerSrc) return;

	await new Promise((imgResolve) => {
		const partImg = new Image();
		partImg.crossOrigin = "anonymous";
		partImg.onload = () => {
			const savedOp = ctx.globalCompositeOperation;
			const method = (type || "overlay").toLowerCase();

			if (
				method === "replace" ||
				method === "overlayfast" ||
				method === "fast"
			) {
				ctx.clearRect(
					x,
					y,
					partImg.naturalWidth || partImg.width,
					partImg.naturalHeight || partImg.height,
				);
			} else if (method === "blend-multiply" || method === "multiply") {
				ctx.globalCompositeOperation = "multiply";
			} else if (method === "blend-screen" || method === "screen") {
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
				// 下の絵と同一色の部分を透過して重ねる (UKADOC準拠)
				try {
					const pWidth = partImg.naturalWidth || partImg.width;
					const pHeight = partImg.naturalHeight || partImg.height;
					if (pWidth > 0 && pHeight > 0 && typeof document !== "undefined") {
						const tempCanvas = document.createElement("canvas");
						tempCanvas.width = pWidth;
						tempCanvas.height = pHeight;
						const tempCtx = tempCanvas.getContext("2d", {
							willReadFrequently: true,
						});
						if (tempCtx && typeof ctx.getImageData === "function") {
							tempCtx.drawImage(partImg, 0, 0);
							const overlayData = tempCtx.getImageData(0, 0, pWidth, pHeight);
							const dstData = ctx.getImageData(x, y, pWidth, pHeight);

							const oData = overlayData.data;
							const dData = dstData.data;
							const len = oData.length;

							for (let i = 0; i < len; i += 4) {
								if (oData[i + 3] === 0) continue;
								if (
									oData[i] === dData[i] &&
									oData[i + 1] === dData[i + 1] &&
									oData[i + 2] === dData[i + 2]
								) {
									oData[i + 3] = 0;
								}
							}
							tempCtx.putImageData(overlayData, 0, 0);
							ctx.drawImage(tempCanvas, x, y);
							ctx.globalCompositeOperation = savedOp;
							imgResolve();
							return;
						}
					}
				} catch (_err) {
					// フォールバック
				}
			} else if (method === "asis" || method === "base") {
				ctx.globalCompositeOperation = "source-over";
			}

			ctx.drawImage(partImg, x, y);
			ctx.globalCompositeOperation = savedOp;
			imgResolve();
		};
		partImg.onerror = () => imgResolve();
		partImg.src = layerSrc;
	});
}
