/**
 * @file communicate-box.js
 * @brief コミュニケートボックスのサイズ・座標・フォント・カラー設定反映 (UKADOC準拠)
 */
import { rgbFromComponents } from "../utils.js";

export function applyCommunicateBoxProperties(props: Record<string, string>) {
	// [communicatebox.width,サイズ], [communicatebox.height,サイズ], [communicatebox.x,座標], [communicatebox.y,座標]:
	// [communicatebox.font.name,フォント名], [communicatebox.font.color.r/g/b,数値], [communicatebox.background.color.r/g/b,数値], [communicatebox.placeholder.color.r/g/b,数値]:
	const cbWidth = props["communicatebox.width"];
	const cbHeight = props["communicatebox.height"];
	const cbX = props["communicatebox.x"];
	const cbY = props["communicatebox.y"];
	const cbFontName = props["communicatebox.font.name"];
	const cbFontHeight = parseInt(props["communicatebox.font.height"] || "", 10);
	const cbFontColor =
		rgbFromComponents(props, "communicatebox.font.color") ||
		props["communicatebox.font.color"] ||
		props["communicatebox.font.color.r"] ||
		props["communicatebox.font.color.g"] ||
		props["communicatebox.font.color.b"];
	const cbBgColor =
		rgbFromComponents(props, "communicatebox.background.color") ||
		props["communicatebox.background.color"] ||
		props["communicatebox.background.color.r"] ||
		props["communicatebox.background.color.g"] ||
		props["communicatebox.background.color.b"];
	const cbPlaceholder =
		rgbFromComponents(props, "communicatebox.placeholder.color") ||
		props["communicatebox.placeholder.color"] ||
		props["communicatebox.placeholder.color.r"] ||
		props["communicatebox.placeholder.color.g"] ||
		props["communicatebox.placeholder.color.b"];

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
		const cbEl = document.querySelector(
			".communicate-box",
		) as HTMLElement | null;
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
}
