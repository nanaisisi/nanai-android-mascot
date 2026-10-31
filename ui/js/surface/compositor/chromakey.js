/**
 * 伺か標準仕様のPNAアルファマスク合成およびクロマキー（緑透過 #00FF00 / 左上ピクセル色）透過処理
 * @param {string} imageSrc - 画像URLまたはDataURL
 * @param {string|null} [pnaSrc] - PNAアルファマスク画像のURLまたはDataURL
 * @param {Map<string, string>} [cache] - キャッシュMap
 * @returns {Promise<string>} - 透過合成後のDataURL (PNG)
 */
export function processChromaKey(imageSrc, pnaSrc = null, cache = null) {
	if (!imageSrc) return Promise.resolve(imageSrc);
	const cacheKey = pnaSrc ? `${imageSrc}__pna__${pnaSrc}` : imageSrc;
	if (cache?.has(cacheKey)) {
		return Promise.resolve(cache.get(cacheKey));
	}

	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			const onBaseLoaded = (pnaImg = null) => {
				try {
					const canvas = document.createElement("canvas");
					const width = img.naturalWidth || img.width;
					const height = img.naturalHeight || img.height;
					canvas.width = width;
					canvas.height = height;

					const ctx = canvas.getContext("2d", { willReadFrequently: true });
					if (!ctx) {
						cache?.set(cacheKey, imageSrc);
						resolve(imageSrc);
						return;
					}

					ctx.drawImage(img, 0, 0);
					const imgData = ctx.getImageData(0, 0, width, height);
					const data = imgData.data;

					if (pnaImg) {
						// PNA アルファマスク合成 (UKADOC準拠)
						const pnaCanvas = document.createElement("canvas");
						pnaCanvas.width = width;
						pnaCanvas.height = height;
						const pnaCtx = pnaCanvas.getContext("2d", {
							willReadFrequently: true,
						});
						if (pnaCtx) {
							pnaCtx.drawImage(pnaImg, 0, 0, width, height);
							const pnaData = pnaCtx.getImageData(0, 0, width, height).data;
							const len = data.length;
							for (let i = 0; i < len; i += 4) {
								// PNA の輝度 (白=255不透明, 黒=0透過) をアルファ値に適用
								data[i + 3] = pnaData[i];
							}
							ctx.putImageData(imgData, 0, 0);
							const resultUrl = canvas.toDataURL("image/png");
							cache?.set(cacheKey, resultUrl);
							resolve(resultUrl);
							return;
						}
					}

					// 左上1ピクセル (0, 0) の色を取得（伺かの伝統的な透過色仕様）
					const cornerR = data[0];
					const cornerG = data[1];
					const cornerB = data[2];
					const cornerA = data[3];

					// 左上が透過でなく、純緑(#00FF00)または特定背景色の場合にクロマキー判定
					const isCornerPureGreen =
						cornerR === 0 && cornerG >= 250 && cornerB === 0 && cornerA === 255;
					const isCornerTarget =
						isCornerPureGreen ||
						(cornerA === 255 &&
							cornerR === 0 &&
							cornerG === 255 &&
							cornerB === 0);

					let modified = false;
					const data32 = new Uint32Array(data.buffer);
					const len32 = data32.length;

					// Pre-calculate target color for fast matching
					// Uint32Array format is ABGR in little-endian architectures (most common)
					const isLittleEndian =
						new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;

					let corner32 = 0;

					if (isLittleEndian) {
						corner32 = (cornerA << 24) | (cornerB << 16) | (cornerG << 8) | cornerR;
					} else {
						corner32 = (cornerR << 24) | (cornerG << 16) | (cornerB << 8) | cornerA;
					}

					if (isLittleEndian) {
						for (let i = 0; i < len32; i++) {
							const pixel = data32[i];

							// Fast exit if alpha is 0
							if ((pixel & 0xff000000) === 0) continue;

							const r = pixel & 0xff;
							const g = (pixel >> 8) & 0xff;
							const b = (pixel >> 16) & 0xff;

							// 純緑 (#00FF00) 判定 (許容差あり: R <= 35, G >= 220, B <= 35)
							const isGreen = r <= 35 && g >= 220 && b <= 35;
							// または左上ピクセルと完全一致
							const isMatchCorner = isCornerTarget && pixel === corner32;

							if (isGreen || isMatchCorner) {
								// アルファ値を 0（完全透明）に設定
								data32[i] = pixel & 0x00ffffff;
								modified = true;
							}
						}
					} else {
						for (let i = 0; i < len32; i++) {
							const pixel = data32[i];

							if ((pixel & 0x000000ff) === 0) continue;

							const r = (pixel >> 24) & 0xff;
							const g = (pixel >> 16) & 0xff;
							const b = (pixel >> 8) & 0xff;

							const isGreen = r <= 35 && g >= 220 && b <= 35;
							const isMatchCorner = isCornerTarget && pixel === corner32;

							if (isGreen || isMatchCorner) {
								data32[i] = pixel & 0xffffff00;
								modified = true;
							}
						}
					}

					if (modified) {
						ctx.putImageData(imgData, 0, 0);
						const resultUrl = canvas.toDataURL("image/png");
						cache?.set(cacheKey, resultUrl);
						resolve(resultUrl);
					} else {
						cache?.set(cacheKey, imageSrc);
						resolve(imageSrc);
					}
				} catch (_err) {
					resolve(imageSrc);
				}
			};

			if (pnaSrc) {
				const pnaImg = new Image();
				pnaImg.crossOrigin = "anonymous";
				pnaImg.onload = () => onBaseLoaded(pnaImg);
				pnaImg.onerror = () => onBaseLoaded(null);
				pnaImg.src = pnaSrc;
			} else {
				onBaseLoaded(null);
			}
		};
		img.onerror = () => resolve(imageSrc);
		img.src = imageSrc;
	});
}
