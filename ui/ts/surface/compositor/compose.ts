import { drawImageLayer, loadLayerImage } from "./layer.js";

export function composeSurfaceElements(

	elementList: unknown[],
	baseImgSrc: string,
	resolveImagePath: (file: string) => Promise<string | null>,
	bindLayers: unknown[] = [],
	{ returnCanvas = false } = {},
): Promise<unknown> {


	elementList: any[],
	baseImgSrc: string,
	resolveImagePath: (file: string) => Promise<string | null>,

	bindLayers: any[] = [],returnCanvas = false = ,

): Promise<any>

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

				const allElements = [...(elementList || []), ...(bindLayers || [])];
				const loadPromises = allElements.map((el) =>
					el.file
						? loadLayerImage(el.file, resolveImagePath)
						: Promise.resolve(null),
				);

				const loadedImages = await Promise.all(loadPromises);

				for (let i = 0; i < allElements.length; i++) {
					const element = allElements[i];
					const img = loadedImages[i];
					if (!img || !element.file) continue;

					drawImageLayer(ctx, img, element.x, element.y, element.type);
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
