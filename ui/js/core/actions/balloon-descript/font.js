/**
 * @file font.js
 * @brief バルーンフォント・カラー・装飾の設定反映
 */
import { rgbFromComponents } from "./utils.js";

export function applyFontProperties(root, props, _instance) {
	if (props["font.name"]) {
		root.style.setProperty(
			"--balloon-font-family",
			`"${props["font.name"]}", Meiryo, sans-serif`,
		);
	}

	if (props["font.height"]) {
		const fh = parseInt(props["font.height"], 10);
		if (!Number.isNaN(fh) && fh > 0) {
			root.style.setProperty("--balloon-font-size", `${fh}px`);
		}
	}

	if (
		props["font.bold"] === "1" ||
		props["font.bold"]?.toLowerCase() === "true"
	) {
		root.style.setProperty("--balloon-font-weight", "bold");
	}
	if (
		props["font.italic"] === "1" ||
		props["font.italic"]?.toLowerCase() === "true"
	) {
		root.style.setProperty("--balloon-font-style", "italic");
	}
	const decorations = [];
	if (
		props["font.underline"] === "1" ||
		props["font.underline"]?.toLowerCase() === "true"
	)
		decorations.push("underline");
	if (
		props["font.strike"] === "1" ||
		props["font.strike"]?.toLowerCase() === "true"
	)
		decorations.push("line-through");
	if (decorations.length > 0) {
		root.style.setProperty("--balloon-text-decoration", decorations.join(" "));
	}

	const anchorCol =
		rgbFromComponents(props, "anchor.font.color") || props["anchor.font.color"];
	if (anchorCol) root.style.setProperty("--balloon-anchor-color", anchorCol);

	const anchorVisited =
		rgbFromComponents(props, "anchor.visited.font.color") ||
		props["anchor.visited.font.color"];
	if (anchorVisited)
		root.style.setProperty("--balloon-anchor-visited-color", anchorVisited);

	const anchorNotSelect =
		rgbFromComponents(props, "anchor.notselect.font.color") ||
		props["anchor.notselect.font.color"];
	if (anchorNotSelect)
		root.style.setProperty("--balloon-anchor-notselect-color", anchorNotSelect);

	const fontColor = rgbFromComponents(props, "font.color");
	if (props["font.color"]) {
		root.style.setProperty("--balloon-text-color", props["font.color"]);
	} else if (fontColor) {
		root.style.setProperty("--balloon-text-color", fontColor);
	}

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
	if (numFontName)
		root.style.setProperty(
			"--balloon-number-font-family",
			`"${numFontName}", sans-serif`,
		);
	const numFontHeight = parseInt(props["number.font.height"], 10);
	if (!Number.isNaN(numFontHeight))
		root.style.setProperty("--balloon-number-font-size", `${numFontHeight}px`);
	const numColor = rgbFromComponents(props, "number.font.color");
	if (numColor) root.style.setProperty("--balloon-number-color", numColor);

	const disableFont = props["disable.font"];
	if (disableFont) {
		root.style.setProperty("--balloon-disable-font", disableFont);
	}
}
