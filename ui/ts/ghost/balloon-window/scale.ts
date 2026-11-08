/**
 * バルーンウィンドウの倍率・DPIスケーリング計算モジュール
 */

/**
 * バルーンウィンドウの拡大率とDPIスケールをCSSカスタムプロパティおよび要素transformに反映
 * @param {HTMLElement | null} balloonBox
 * @param {number} currentUserScale
 * @param {number} currentDpiScale
 * @returns {number} 計算された最終倍率 (finalScale)
 */
export function updateBalloonWindowScale(
	balloonBox: HTMLElement | null,
	currentUserScale: number,
	currentDpiScale: number,
) {
	const root = document.documentElement;
	const finalScale = +(currentUserScale * currentDpiScale).toFixed(4);
	root.style.setProperty("--balloon-dpi-scale", String(currentDpiScale));
	root.style.setProperty("--balloon-user-scale", String(currentUserScale));
	if (balloonBox) {
		balloonBox.style.transform = finalScale !== 1 ? `scale(${finalScale})` : "";
		balloonBox.style.transformOrigin = "top left";
	}
	return finalScale;
}
