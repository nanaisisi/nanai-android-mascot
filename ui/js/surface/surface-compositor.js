/**
 * 伺か標準仕様の画像合成・クロマキー透過・PNAアルファマスク処理
 */

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
						const pnaCtx = pnaCanvas.getContext("2d", { willReadFrequently: true });
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
						(cornerA === 255 && cornerR === 0 && cornerG === 255 && cornerB === 0);

					let modified = false;
					const len = data.length;

					for (let i = 0; i < len; i += 4) {
						const r = data[i];
						const g = data[i + 1];
						const b = data[i + 2];
						const a = data[i + 3];

						if (a === 0) continue;

						// 純緑 (#00FF00) 判定 (許容差あり: R <= 35, G >= 220, B <= 35)
						const isGreen = r <= 35 && g >= 220 && b <= 35;

						// または左上ピクセルと完全一致
						const isMatchCorner =
							isCornerTarget && r === cornerR && g === cornerG && b === cornerB;

						if (isGreen || isMatchCorner) {
							data[i + 3] = 0; // アルファ値を 0（完全透明）に設定
							modified = true;
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

/**
 * element0〜elementN で定義されたレイヤー画像をベース画像上に合成 (UKADOC準拠)
 * @param {import('./surface-parser.js').SurfaceElement[]} elementList
 * @param {string} baseImgSrc
 * @param {Function} resolveImagePath - ファイル名から画像URL/DataURLを解決する関数
 * @returns {Promise<string>} - 合成後のDataURL (PNG)
 */
export function composeSurfaceElements(elementList, baseImgSrc, resolveImagePath) {
	if (!elementList || elementList.length === 0) {
		return Promise.resolve(baseImgSrc);
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

				for (const elem of elementList) {
					if (!elem.file) continue;
					const elemSrc = await resolveImagePath(elem.file);
					if (!elemSrc) continue;

					await new Promise((imgResolve) => {
						const partImg = new Image();
						partImg.crossOrigin = "anonymous";
						partImg.onload = () => {
							if (elem.type === "replace") {
								ctx.clearRect(
									elem.x,
									elem.y,
									partImg.naturalWidth || partImg.width,
									partImg.naturalHeight || partImg.height,
								);
							}
							ctx.drawImage(partImg, elem.x, elem.y);
							imgResolve();
						};
						partImg.onerror = () => imgResolve();
						partImg.src = elemSrc;
					});
				}

				resolve(canvas.toDataURL("image/png"));
			} catch (_err) {
				resolve(baseImgSrc);
			}
		};
		baseImg.onerror = () => resolve(baseImgSrc);
		baseImg.src = baseImgSrc;
	});
}
