import { rgbFromComponents } from "../utils.js";

export function applySpecialFontProperties(root, props) {
	const cursorBg =
		rgbFromComponents(props, "cursor.font.color") || props["cursor.font.color"];
	if (cursorBg) {
		root.style.setProperty("--balloon-highlight-bg", cursorBg);
	}
	const cursorText =
		rgbFromComponents(props, "cursor.color.font") || props["cursor.color.font"];
	if (cursorText) {
		root.style.setProperty("--balloon-highlight-text", cursorText);
	}

	const numFontName = props["number.font.name"];
	if (numFontName) {
		root.style.setProperty(
			"--balloon-number-font-family",
			`"${numFontName}", sans-serif`,
		);
	}
	const numFontHeight = parseInt(props["number.font.height"], 10);
	if (!Number.isNaN(numFontHeight)) {
		root.style.setProperty("--balloon-number-font-size", `${numFontHeight}px`);
	}
	const numColor =
		rgbFromComponents(props, "number.font.color") ||
		props["number.font.color.r"] ||
		props["number.font.color.g"] ||
		props["number.font.color.b"]
			? rgbFromComponents(props, "number.font.color")
			: null;
	if (numColor) root.style.setProperty("--balloon-number-color", numColor);

	const sstpFontName = props["sstpmessage.font.name"];
	if (sstpFontName) {
		root.style.setProperty(
			"--balloon-sstp-font-family",
			`"${sstpFontName}", sans-serif`,
		);
	}
	const sstpFontHeight = parseInt(props["sstpmessage.font.height"], 10);
	if (!Number.isNaN(sstpFontHeight)) {
		root.style.setProperty("--balloon-sstp-font-size", `${sstpFontHeight}px`);
	}
	const sstpColor =
		rgbFromComponents(props, "sstpmessage.font.color") ||
		props["sstpmessage.font.color.r"] ||
		props["sstpmessage.font.color.g"] ||
		props["sstpmessage.font.color.b"]
			? rgbFromComponents(props, "sstpmessage.font.color")
			: null;
	if (sstpColor) root.style.setProperty("--balloon-sstp-font-color", sstpColor);

	const disableFont = props["disable.font"];
	if (disableFont) {
		root.style.setProperty("--balloon-disable-font", disableFont);
	}
}
