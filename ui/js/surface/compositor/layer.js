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
			}

			ctx.drawImage(partImg, x, y);
			ctx.globalCompositeOperation = savedOp;
			imgResolve();
		};
		partImg.onerror = () => imgResolve();
		partImg.src = layerSrc;
	});
}
