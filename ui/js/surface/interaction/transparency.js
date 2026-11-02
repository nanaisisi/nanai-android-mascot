/**
 * 画像の指定座標が透明ピクセルか判定するユーティリティ
 * クリックスルーおよび透明領域タップ無視の補助に使用
 *
 * @param {HTMLElement | null} img
 * @param {number} clientX
 * @param {number} clientY
 * @returns {boolean}
 */
export function isPixelTransparent(img, clientX, clientY) {
	if (img?.tagName !== "IMG") return false;
	try {
		const htmlImg = /** @type {HTMLImageElement} */ (img);
		const rect = htmlImg.getBoundingClientRect();
		if (rect.width === 0 || rect.height === 0) return true;

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
