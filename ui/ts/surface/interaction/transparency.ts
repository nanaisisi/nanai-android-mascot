export function resolveContainedImageRect(
	rect: { left: number; top: number; width: number; height: number },
	naturalWidth: number,
	naturalHeight: number,
): { left: number; top: number; width: number; height: number } {
	if (
		naturalWidth <= 0 ||
		naturalHeight <= 0 ||
		rect.width <= 0 ||
		rect.height <= 0
	) {
		return rect;
	}
	const scale = Math.min(
		rect.width / naturalWidth,
		rect.height / naturalHeight,
	);
	const width = naturalWidth * scale;
	const height = naturalHeight * scale;
	return {
		left: rect.left + (rect.width - width) / 2,
		top: rect.top + (rect.height - height) / 2,
		width,
		height,
	};
}

/**
 * 画像の指定座標が透明ピクセルか判定するユーティリティ
 * クリックスルーおよび透明領域タップ無視の補助に使用
 *
 * @param {HTMLElement | null} img
 * @param {number} clientX
 * @param {number} clientY
 * @returns {boolean}
 */
export function isPixelTransparent(
	img: HTMLElement | null,
	clientX: number,
	clientY: number,
): boolean {
	if (img?.tagName !== "IMG") return false;
	try {
		const htmlImg = img as HTMLImageElement;
		const rawRect = htmlImg.getBoundingClientRect();
		if (rawRect.width === 0 || rawRect.height === 0) return true;

		const rect = resolveContainedImageRect(
			rawRect,
			htmlImg.naturalWidth,
			htmlImg.naturalHeight,
		);

		// 画像の実際の表示サイズと解像度に合わせてスケール
		const scaleX = htmlImg.naturalWidth / rect.width;
		const scaleY = htmlImg.naturalHeight / rect.height;
		const x = Math.floor((clientX - rect.left) * scaleX);
		const y = Math.floor((clientY - rect.top) * scaleY);

		if (
			x < 0 ||
			y < 0 ||
			x >= htmlImg.naturalWidth ||
			y >= htmlImg.naturalHeight
		) {
			return true;
		}

		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;
		const ctx = canvas.getContext("2d", { willReadFrequently: true });
		if (!ctx) return false;

		// 対象の1ピクセルだけを描画
		ctx.drawImage(htmlImg, x, y, 1, 1, 0, 0, 1, 1);
		const data = ctx.getImageData(0, 0, 1, 1).data;
		return data[3] === 0; // alpha が 0 なら透明
	} catch (e) {
		console.warn("Pixel transparency check failed:", e);
		return false; // エラー時は不透明扱い（ドラッグ許可）
	}
}
