/**
 * @file scale.js
 * @brief バルーンのDPIおよび拡大率（ユーザースケール・DPIスケール）の設定反映 (UKADOC準拠)
 */

export function applyDpiAndScaleProperties(root, props, instance) {
	// [descript.txt（Balloonの）]: props
	// [dpi,推奨DPI]: props["dpi"]
	const parsedDpi = parseInt(props.dpi, 10);
	const balloonDpi = !Number.isNaN(parsedDpi) && parsedDpi > 0 ? parsedDpi : 96;
	const dpiScale = +(96 / balloonDpi).toFixed(4);
	instance.balloonDpiScale = dpiScale;
	root.style.setProperty("--balloon-dpi", String(balloonDpi));
	root.style.setProperty("--balloon-dpi-scale", String(dpiScale));

	const userScale = instance.balloonUserScale || 1;
	const finalScale = +(userScale * dpiScale).toFixed(4);
	const balloonScaleEl = document.querySelector(".balloon");
	if (balloonScaleEl) {
		balloonScaleEl.style.transform =
			finalScale !== 1 ? `scale(${finalScale})` : "";
		balloonScaleEl.style.transformOrigin = "bottom left";
	}
}
