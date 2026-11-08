/**
 * 伺か標準仕様のPNAアルファマスク合成およびクロマキー（緑透過 #00FF00 / 左上ピクセル色）透過処理
 */
export function processChromaKey(
	imageSrc: string,
	pnaSrc: string | null = null,
	cache: Map<string, string> | null = null,
<<<<<<< HEAD
	options: Record<string, unknown> = {},
): Promise<string> {
	if (!imageSrc) return Promise.resolve(imageSrc);
	if (cache?.has(imageSrc)) {
		return Promise.resolve(cache.get(imageSrc) ?? imageSrc);
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	options: any = {},
): Promise<string> {
	if (!imageSrc) return Promise.resolve(imageSrc);
	if (cache?.has(imageSrc)) {
		// biome-ignore lint/style/noNonNullAssertion: automated fix
		return Promise.resolve(cache.get(imageSrc)!);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	}
	const useSelfAlpha = Boolean(options?.useSelfAlpha);
	const paintTransparentRegionBlack = Boolean(
		options?.paintTransparentRegionBlack ??
			options?.paint_transparent_region_black,
	);
	const cacheKey = `${imageSrc}__pna__${pnaSrc || "none"}__selfalpha__${useSelfAlpha}__black__${paintTransparentRegionBlack}`;
	if (cache?.has(cacheKey)) {
<<<<<<< HEAD
		return Promise.resolve(cache.get(cacheKey) ?? imageSrc);
=======
		// biome-ignore lint/style/noNonNullAssertion: automated fix
		return Promise.resolve(cache.get(cacheKey)!);
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	}

	return new Promise((resolve) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => {
			const onBaseLoaded = (pnaImg: HTMLImageElement | null = null) => {
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
						const pnaCanvas = document.createElement("canvas");
						pnaCanvas.width = width;
						pnaCanvas.height = height;
						const pnaCtx = pnaCanvas.getContext("2d", {
							willReadFrequently: true,
						});
						if (pnaCtx) {
							pnaCtx.drawImage(pnaImg, 0, 0, width, height);
							const pnaData = pnaCtx.getImageData(0, 0, width, height).data;

							const data32 = new Uint32Array(data.buffer);
							const pnaData32 = new Uint32Array(pnaData.buffer);
							const len32 = data32.length;
							const isLittleEndian =
								new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] ===
								0x44;

							if (isLittleEndian) {
								for (let i = 0; i < len32; i++) {
									const pnaR = pnaData32[i] & 0xff;
									data32[i] = (data32[i] & 0x00ffffff) | (pnaR << 24);
								}
							} else {
								for (let i = 0; i < len32; i++) {
									const pnaR = (pnaData32[i] >>> 24) & 0xff;
									data32[i] = (data32[i] & 0xffffff00) | pnaR;
								}
							}

							// seriko.paint_transparent_region_black: PNA適用後に左上色と合致する不透明/半透明ピクセルを黒に塗りつぶす
							if (paintTransparentRegionBlack) {
								const cornerR = data[0];
								const cornerG = data[1];
								const cornerB = data[2];
								const isCornerTarget =
									(cornerR === 0 && cornerG >= 250 && cornerB === 0) ||
									(cornerR === 0 && cornerG === 255 && cornerB === 0);

								if (isLittleEndian) {
									const cornerRgb = (cornerB << 16) | (cornerG << 8) | cornerR;
									for (let i = 0; i < len32; i++) {
										const pixel = data32[i];
										const alpha = (pixel >>> 24) & 0xff;
										if (alpha === 0) continue;
										const rgb = pixel & 0x00ffffff;
										const r = pixel & 0xff;
										const g = (pixel >> 8) & 0xff;
										const b = (pixel >> 16) & 0xff;
										const isGreen = r <= 35 && g >= 220 && b <= 35;
										if ((isCornerTarget && rgb === cornerRgb) || isGreen) {
											// RGBを黒(0,0,0)にしてアルファは保持
											data32[i] = (alpha << 24) >>> 0;
										}
									}
								} else {
									const cornerRgb =
										(cornerR << 24) | (cornerG << 16) | (cornerB << 8);
									for (let i = 0; i < len32; i++) {
										const pixel = data32[i];
										const alpha = pixel & 0xff;
										if (alpha === 0) continue;
										const rgb = pixel & 0xffffff00;
										const r = (pixel >> 24) & 0xff;
										const g = (pixel >> 16) & 0xff;
										const b = (pixel >> 8) & 0xff;
										const isGreen = r <= 35 && g >= 220 && b <= 35;
										if ((isCornerTarget && rgb === cornerRgb) || isGreen) {
											data32[i] = alpha;
										}
									}
								}
							}

							ctx.putImageData(imgData, 0, 0);
							const resultUrl = canvas.toDataURL("image/png");
							cache?.set(cacheKey, resultUrl);
							resolve(resultUrl);
							return;
						}
					}

					if (useSelfAlpha) {
						cache?.set(cacheKey, imageSrc);
						resolve(imageSrc);
						return;
					}

					const cornerR = data[0];
					const cornerG = data[1];
					const cornerB = data[2];
					const cornerA = data[3];

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

					const isLittleEndian =
						new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;

					let corner32 = 0;

					if (isLittleEndian) {
						corner32 =
							(cornerA << 24) | (cornerB << 16) | (cornerG << 8) | cornerR;
					} else {
						corner32 =
							(cornerR << 24) | (cornerG << 16) | (cornerB << 8) | cornerA;
					}

					if (isLittleEndian) {
						for (let i = 0; i < len32; i++) {
							const pixel = data32[i];

							if ((pixel & 0xff000000) === 0) continue;

							const r = pixel & 0xff;
							const g = (pixel >> 8) & 0xff;
							const b = (pixel >> 16) & 0xff;

							const isGreen = r <= 35 && g >= 220 && b <= 35;
							const isMatchCorner = isCornerTarget && pixel === corner32;

							if (isGreen || isMatchCorner) {
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
