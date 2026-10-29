/**
 * @file layout.js
 * @brief バルーンレイアウト・DPI・領域・位置・数字・SSTPメッセージ設定反映 (UKADOC準拠)
 */
import { rgbFromComponents } from "./utils.js";

export function applyLayoutProperties(root, props, instance) {
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

	// コミュニケートボックス (communicatebox.*)
	const cbWidth = props["communicatebox.width"];
	const cbHeight = props["communicatebox.height"];
	const cbX = props["communicatebox.x"];
	const cbY = props["communicatebox.y"];
	const cbFontName = props["communicatebox.font.name"];
	const cbFontHeight = parseInt(props["communicatebox.font.height"], 10);
	const cbFontColor =
		rgbFromComponents(props, "communicatebox.font.color") ||
		props["communicatebox.font.color"];
	const cbBgColor =
		rgbFromComponents(props, "communicatebox.background.color") ||
		props["communicatebox.background.color"];
	const cbPlaceholder =
		rgbFromComponents(props, "communicatebox.placeholder.color") ||
		props["communicatebox.placeholder.color"];
	if (
		cbWidth ||
		cbHeight ||
		cbX ||
		cbY ||
		cbFontName ||
		!Number.isNaN(cbFontHeight) ||
		cbFontColor ||
		cbBgColor ||
		cbPlaceholder
	) {
		const cbEl = document.querySelector(".communicate-box");
		if (cbEl) {
			if (cbWidth) cbEl.style.width = `${cbWidth}px`;
			if (cbHeight) cbEl.style.height = `${cbHeight}px`;
			if (cbX) cbEl.style.left = `${cbX}px`;
			if (cbY) cbEl.style.top = `${cbY}px`;
			if (cbFontName) cbEl.style.fontFamily = `"${cbFontName}", sans-serif`;
			if (!Number.isNaN(cbFontHeight))
				cbEl.style.fontSize = `${cbFontHeight}px`;
			if (cbFontColor) cbEl.style.color = cbFontColor;
			if (cbBgColor) cbEl.style.backgroundColor = cbBgColor;
			if (cbPlaceholder)
				cbEl.style.setProperty(
					"--communicatebox-placeholder-color",
					cbPlaceholder,
				);
		}
	}

	// 有効表示領域 (validrect.*)
	const vl = parseInt(props["validrect.left"], 10);
	const vt = parseInt(props["validrect.top"], 10);
	const vr = parseInt(props["validrect.right"], 10);
	const vb = parseInt(props["validrect.bottom"], 10);
	if (
		!Number.isNaN(vl) &&
		!Number.isNaN(vt) &&
		!Number.isNaN(vr) &&
		!Number.isNaN(vb)
	) {
		const padTop = `${Math.max(8, vt)}px`;
		const padRight = `${Math.max(8, vr)}px`;
		const padBottom = `${Math.max(8, vb)}px`;
		const padLeft = `${Math.max(8, vl)}px`;
		const balloonEl = document.querySelector(".balloon");
		if (balloonEl) {
			balloonEl.style.padding = `${padTop} ${padRight} ${padBottom} ${padLeft}`;
		}
	}

	// 折り返し・境界位置 (wordwrappoint.x / y)
	if (props["wordwrappoint.x"]) {
		const ww = parseInt(props["wordwrappoint.x"], 10);
		if (!Number.isNaN(ww) && ww > 50) {
			const balloonEl = document.querySelector(".balloon");
			if (balloonEl) {
				balloonEl.style.maxWidth = `${ww}px`;
			}
		}
	}

	const wwY = parseInt(props["wordwrappoint.y"], 10);
	if (!Number.isNaN(wwY) && wwY > 20) {
		const balloonEl = document.querySelector(".balloon");
		if (balloonEl) {
			balloonEl.style.maxHeight = `${wwY}px`;
		}
	}

	// 表示原点オフセット (origin.x / y)
	const ox = parseInt(props["origin.x"], 10);
	const oy = parseInt(props["origin.y"], 10);
	if (!Number.isNaN(ox) || !Number.isNaN(oy)) {
		if (instance.elements?.balloonDisplay) {
			if (!Number.isNaN(ox))
				instance.elements.balloonDisplay.style.left = `calc(50% + ${ox}px)`;
			if (!Number.isNaN(oy))
				instance.elements.balloonDisplay.style.top = `calc(2rem + ${oy}px)`;
		}
	}

	// 数字位置 (number.x / y / xr / yb)
	const numX = parseInt(props["number.x"], 10);
	const numY = parseInt(props["number.y"], 10);
	const numXR = parseInt(props["number.xr"], 10);
	const numYB = parseInt(props["number.yb"], 10);
	if (!Number.isNaN(numX)) root.style.setProperty("--balloon-number-x", `${numX}px`);
	if (!Number.isNaN(numY)) root.style.setProperty("--balloon-number-y", `${numY}px`);
	if (!Number.isNaN(numXR)) root.style.setProperty("--balloon-number-xr", `${numXR}px`);
	if (!Number.isNaN(numYB)) root.style.setProperty("--balloon-number-yb", `${numYB}px`);

	// SSTPメッセージ位置 (sstpmessage.x / y / xr / yb)
	const sstpX = parseInt(props["sstpmessage.x"], 10);
	const sstpY = parseInt(props["sstpmessage.y"], 10);
	const sstpXR = parseInt(props["sstpmessage.xr"], 10);
	const sstpYB = parseInt(props["sstpmessage.yb"], 10);
	if (!Number.isNaN(sstpX)) root.style.setProperty("--balloon-sstpmessage-x", `${sstpX}px`);
	if (!Number.isNaN(sstpY)) root.style.setProperty("--balloon-sstpmessage-y", `${sstpY}px`);
	if (!Number.isNaN(sstpXR)) root.style.setProperty("--balloon-sstpmessage-xr", `${sstpXR}px`);
	if (!Number.isNaN(sstpYB)) root.style.setProperty("--balloon-sstpmessage-yb", `${sstpYB}px`);

	// ウィンドウ位置および画面外制限 (windowposition.x / y / limit)
	const wpX = parseInt(props["windowposition.x"], 10);
	const wpY = parseInt(props["windowposition.y"], 10);
	if (!Number.isNaN(wpX))
		root.style.setProperty("--balloon-windowpos-x", `${wpX}px`);
	if (!Number.isNaN(wpY))
		root.style.setProperty("--balloon-windowpos-y", `${wpY}px`);

	const winLimit =
		props["windowposition.limit"] === "1" ||
		props["windowposition.limit"]?.toLowerCase() === "true";
	instance.windowPositionLimit = winLimit;
}
