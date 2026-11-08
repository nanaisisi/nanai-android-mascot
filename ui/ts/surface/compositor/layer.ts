export async function loadLayerImage(
	fileName: string,
	resolveImagePath: (file: string) => Promise<string | null>,
): Promise<HTMLImageElement | null> {
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

export function drawImageLayer(
	ctx: CanvasRenderingContext2D,
	img: HTMLImageElement,
	x: number,
	y: number,
	type: string = "overlay",
) {
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
	} else if (method === "blend-dither" || method === "dither") {
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
					const oData = overlayImgData.data;
					const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
					for (let py = 0; py < pHeight; py++) {
						const ty = y + py;
						for (let px = 0; px < pWidth; px++) {
							const tx = x + px;
							const idx = (py * pWidth + px) * 4;
							const sa = oData[idx + 3];
							const bayerVal = bayer[((ty & 3) << 2) | (tx & 3)];
							const threshold = (((bayerVal * 2 + 1) * 255) / 32) | 0;
							if (sa > threshold) {
								oData[idx + 3] = 255;
							} else {
								oData[idx + 3] = 0;
							}
						}
					}
					tempCtx.putImageData(overlayImgData, 0, 0);
					ctx.drawImage(tempCanvas, x, y);
					ctx.globalCompositeOperation = savedOp;
					return;
				}
			}
		} catch (_err) {}
	} else if (method === "interpolate") {
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
		} catch (_err) {}
	} else if (method === "reduce") {
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
		} catch (_err) {}
	} else if (method === "asis" || method === "base") {
		ctx.globalCompositeOperation = "source-over";
	}

	ctx.drawImage(img, x, y);
	ctx.globalCompositeOperation = savedOp;
}

export async function drawLayer(
	ctx: CanvasRenderingContext2D,
	fileName: string,
	resolveImagePath: (file: string) => Promise<string | null>,
	x: number,
	y: number,
	type: string = "overlay",
): Promise<void> {
	if (!fileName) return;
	const img = await loadLayerImage(fileName, resolveImagePath);
	if (img) {
		drawImageLayer(ctx, img, x, y, type);
	}
}
