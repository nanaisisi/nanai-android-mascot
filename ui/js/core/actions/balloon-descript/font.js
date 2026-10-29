/**
 * @file font.js
 * @brief バルーンフォント・カラー・装飾・アンカー・カーソルの設定反映 (UKADOC準拠)
 */
import { rgbFromComponents } from "./utils.js";

export function applyFontProperties(root, props, _instance) {
	// フォントファミリー・サイズ
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

	// フォントスタイル (bold, italic, underline, strike, outline)
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
	) {
		decorations.push("underline");
	}
	if (
		props["font.strike"] === "1" ||
		props["font.strike"]?.toLowerCase() === "true"
	) {
		decorations.push("line-through");
	}
	if (decorations.length > 0) {
		root.style.setProperty("--balloon-text-decoration", decorations.join(" "));
	}

	if (
		props["font.outline"] === "1" ||
		props["font.outline"]?.toLowerCase() === "true"
	) {
		root.style.setProperty("--balloon-font-outline", "1");
	}

	// テキストカラー・影色・影スタイル
	const fontColor = rgbFromComponents(props, "font.color");
	if (props["font.color"]) {
		root.style.setProperty("--balloon-text-color", props["font.color"]);
	} else if (fontColor) {
		root.style.setProperty("--balloon-text-color", fontColor);
	}

	const fontShadowColor = rgbFromComponents(props, "font.shadowcolor");
	if (fontShadowColor) {
		root.style.setProperty("--balloon-font-shadow-color", fontShadowColor);
	}
	if (props["font.shadowstyle"]) {
		root.style.setProperty(
			"--balloon-font-shadow-style",
			props["font.shadowstyle"],
		);
	}

	// アンカー (通常 / visited / notselect) スタイル・カラー・ペン・ブラシ
	const applyAnchorGroup = (prefix, cssPrefix) => {
		const col =
			rgbFromComponents(props, `${prefix}.font.color`) ||
			props[`${prefix}.font.color`];
		if (col) root.style.setProperty(`${cssPrefix}-color`, col);

		const shadowCol = rgbFromComponents(props, `${prefix}.font.shadowcolor`);
		if (shadowCol)
			root.style.setProperty(`${cssPrefix}-shadow-color`, shadowCol);

		if (props[`${prefix}.font.shadowstyle`]) {
			root.style.setProperty(
				`${cssPrefix}-shadow-style`,
				props[`${prefix}.font.shadowstyle`],
			);
		}

		if (props[`${prefix}.style`]) {
			root.style.setProperty(`${cssPrefix}-style`, props[`${prefix}.style`]);
		}

		const penCol = rgbFromComponents(props, `${prefix}.pen.color`);
		if (penCol) root.style.setProperty(`${cssPrefix}-pen-color`, penCol);

		const brushCol = rgbFromComponents(props, `${prefix}.brush.color`);
		if (brushCol) root.style.setProperty(`${cssPrefix}-brush-color`, brushCol);
	};

	applyAnchorGroup("anchor", "--balloon-anchor");
	applyAnchorGroup("anchor.visited", "--balloon-anchor-visited");
	applyAnchorGroup("anchor.notselect", "--balloon-anchor-notselect");

	// 選択肢カーソル (通常 / notselect) スタイル・カラー・ペン・ブラシ
	applyAnchorGroup("cursor", "--balloon-cursor");
	applyAnchorGroup("cursor.notselect", "--balloon-cursor-notselect");

	// 互換ハイライト表示キー
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

	// 数字 (number.*) フォント・サイズ・カラー
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
	const numColor = rgbFromComponents(props, "number.font.color");
	if (numColor) root.style.setProperty("--balloon-number-color", numColor);

	// フォント無効化設定 (disable.font)
	const disableFont = props["disable.font"];
	if (disableFont) {
		root.style.setProperty("--balloon-disable-font", disableFont);
	}
}
