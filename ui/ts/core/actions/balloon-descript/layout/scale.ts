/**
 * @file scale.js
 * @brief バルーンのDPIおよび拡大率（ユーザースケール・DPIスケール）の設定反映 (UKADOC準拠)
 */

export function applyDpiAndScaleProperties(
	root: HTMLElement,
	props: Record<string, string>,
	instance: { balloonDpiScale?: number; balloonUserScale?: unknown },
) {
	// [descript.txt（Balloonの）]: props
	// [dpi,推奨DPI]: props["dpi"]
	const parsedDpi = parseInt(props.dpi, 10);
	const balloonDpi = !Number.isNaN(parsedDpi) && parsedDpi > 0 ? parsedDpi : 96;
	const dpiScale = +(96 / balloonDpi).toFixed(4);
	instance.balloonDpiScale = dpiScale;
	root.style.setProperty("--balloon-dpi", String(balloonDpi));
	root.style.setProperty("--balloon-dpi-scale", String(dpiScale));

	const rawUserScale =
		typeof instance.balloonUserScale === "number"
			? instance.balloonUserScale
			: Number(instance.balloonUserScale);
	const userScale =
		Number.isFinite(rawUserScale) && rawUserScale > 0 ? rawUserScale : 1;
	const finalScale = +(userScale * dpiScale).toFixed(4);
	const balloonScaleEl = document.querySelector(
		".balloon",
	) as HTMLElement | null;
	if (balloonScaleEl) {
		balloonScaleEl.style.transform =
			finalScale !== 1 ? `scale(${finalScale})` : "";
		balloonScaleEl.style.transformOrigin = "top left";
	}
}
