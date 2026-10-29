/**
 * @file font.js
 * @brief バルーンフォント・カラー・装飾・アンカー・カーソル・SSTPメッセージの設定反映 (UKADOC準拠)
 * // [descript.txt（Balloonの）]: Balloon descript.txt フォント・カラー属性バインディング
 */
import { rgbFromComponents } from "./utils.js";

export function applyFontProperties(root, props, _instance) {
	// [descript.txt（Balloonの）]: props
	// [id,ID名]: props["id"]
	if (props["id"]) root.style.setProperty("--balloon-id", props["id"]);

	// [font.name,フォント名]: props["font.name"]
	if (props["font.name"]) {
		root.style.setProperty(
			"--balloon-font-family",
			`"${props["font.name"]}", Meiryo, sans-serif`,
		);
	}

	// [font.height,数値]: props["font.height"]
	if (props["font.height"]) {
		const fh = parseInt(props["font.height"], 10);
		if (!Number.isNaN(fh) && fh > 0) {
			root.style.setProperty("--balloon-font-size", `${fh}px`);
		}
	}

	// [font.bold,0/1]: props["font.bold"]
	if (
		props["font.bold"] === "1" ||
		props["font.bold"]?.toLowerCase() === "true"
	) {
		root.style.setProperty("--balloon-font-weight", "bold");
	}

	// [font.italic,0/1]: props["font.italic"]
	if (
		props["font.italic"] === "1" ||
		props["font.italic"]?.toLowerCase() === "true"
	) {
		root.style.setProperty("--balloon-font-style", "italic");
	}

	const decorations = [];
	// [font.underline,0/1]: props["font.underline"]
	if (
		props["font.underline"] === "1" ||
		props["font.underline"]?.toLowerCase() === "true"
	) {
		decorations.push("underline");
	}

	// [font.strike,0/1]: props["font.strike"]
	if (
		props["font.strike"] === "1" ||
		props["font.strike"]?.toLowerCase() === "true"
	) {
		decorations.push("line-through");
	}
	if (decorations.length > 0) {
		root.style.setProperty("--balloon-text-decoration", decorations.join(" "));
	}

	// [font.outline,0/1]: props["font.outline"]
	if (
		props["font.outline"] === "1" ||
		props["font.outline"]?.toLowerCase() === "true"
	) {
		root.style.setProperty("--balloon-font-outline", "1");
	}

	// [font.color.r,数値], [font.color.g,数値], [font.color.b,数値]: props["font.color.r/g/b"]
	const fontColor =
		rgbFromComponents(props, "font.color") ||
		props["font.color.r"] ||
		props["font.color.g"] ||
		props["font.color.b"]
			? rgbFromComponents(props, "font.color")
			: null;
	if (props["font.color"]) {
		root.style.setProperty("--balloon-text-color", props["font.color"]);
	} else if (fontColor) {
		root.style.setProperty("--balloon-text-color", fontColor);
	}

	// [font.shadowcolor.r,数値], [font.shadowcolor.g,数値], [font.shadowcolor.b,数値], [font.shadowstyle,形態指定]: props["font.shadowcolor.r/g/b"]
	const fontShadowColor =
		rgbFromComponents(props, "font.shadowcolor") ||
		props["font.shadowcolor.r"] ||
		props["font.shadowcolor.g"] ||
		props["font.shadowcolor.b"]
			? rgbFromComponents(props, "font.shadowcolor")
			: null;
	if (fontShadowColor) {
		root.style.setProperty("--balloon-font-shadow-color", fontShadowColor);
	}
	if (props["font.shadowstyle"]) {
		root.style.setProperty(
			"--balloon-font-shadow-style",
			props["font.shadowstyle"],
		);
	}

	// アンカー & カーソルグループ処理ヘルパー (1対1グループ共通展開)
	const applyGroupProperties = (prefix, cssPrefix) => {
		const col =
			rgbFromComponents(props, `${prefix}.font.color`) ||
			props[`${prefix}.font.color.r`] ||
			props[`${prefix}.font.color.g`] ||
			props[`${prefix}.font.color.b`]
				? rgbFromComponents(props, `${prefix}.font.color`)
				: props[`${prefix}.font.color`];
		if (col) root.style.setProperty(`${cssPrefix}-color`, col);

		const shadowCol =
			rgbFromComponents(props, `${prefix}.font.shadowcolor`) ||
			props[`${prefix}.font.shadowcolor.r`] ||
			props[`${prefix}.font.shadowcolor.g`] ||
			props[`${prefix}.font.shadowcolor.b`]
				? rgbFromComponents(props, `${prefix}.font.shadowcolor`)
				: null;
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

		if (props[`${prefix}.blendmethod`]) {
			root.style.setProperty(
				`${cssPrefix}-blendmethod`,
				props[`${prefix}.blendmethod`],
			);
		}

		const penCol =
			rgbFromComponents(props, `${prefix}.pen.color`) ||
			props[`${prefix}.pen.color.r`] ||
			props[`${prefix}.pen.color.g`] ||
			props[`${prefix}.pen.color.b`]
				? rgbFromComponents(props, `${prefix}.pen.color`)
				: null;
		if (penCol) root.style.setProperty(`${cssPrefix}-pen-color`, penCol);

		const brushCol =
			rgbFromComponents(props, `${prefix}.brush.color`) ||
			props[`${prefix}.brush.color.r`] ||
			props[`${prefix}.brush.color.g`] ||
			props[`${prefix}.brush.color.b`]
				? rgbFromComponents(props, `${prefix}.brush.color`)
				: null;
		if (brushCol) root.style.setProperty(`${cssPrefix}-brush-color`, brushCol);
	};

	// アンカー (anchor / anchor.visited / anchor.notselect)
	applyGroupProperties("anchor", "--balloon-anchor");
	applyGroupProperties("anchor.visited", "--balloon-anchor-visited");
	applyGroupProperties("anchor.notselect", "--balloon-anchor-notselect");

	// [anchor.style,形状], [anchor.font.color.r,数値], [anchor.font.color.g,数値], [anchor.font.color.b,数値]:
	if (
		props["anchor.style"] ||
		props["anchor.font.color.r"] ||
		props["anchor.font.color.g"] ||
		props["anchor.font.color.b"]
	) {}
	// [anchor.font.shadowcolor.r,数値], [anchor.font.shadowcolor.g,数値], [anchor.font.shadowcolor.b,数値], [anchor.font.shadowstyle,形態指定]:
	if (
		props["anchor.font.shadowcolor.r"] ||
		props["anchor.font.shadowcolor.g"] ||
		props["anchor.font.shadowcolor.b"] ||
		props["anchor.font.shadowstyle"]
	) {}
	// [anchor.pen.color.r,数値], [anchor.pen.color.g,数値], [anchor.pen.color.b,数値], [anchor.brush.color.r,数値], [anchor.brush.color.g,数値], [anchor.brush.color.b,数値], [anchor.blendmethod,コマンド]:
	if (
		props["anchor.pen.color.r"] ||
		props["anchor.pen.color.g"] ||
		props["anchor.pen.color.b"] ||
		props["anchor.brush.color.r"] ||
		props["anchor.brush.color.g"] ||
		props["anchor.brush.color.b"] ||
		props["anchor.blendmethod"]
	) {}

	// [anchor.visited.style,形状], [anchor.visited.font.color.r,数値], [anchor.visited.font.color.g,数値], [anchor.visited.font.color.b,数値]:
	if (
		props["anchor.visited.style"] ||
		props["anchor.visited.font.color.r"] ||
		props["anchor.visited.font.color.g"] ||
		props["anchor.visited.font.color.b"]
	) {}
	// [anchor.visited.font.shadowcolor.r,数値], [anchor.visited.font.shadowcolor.g,数値], [anchor.visited.font.shadowcolor.b,数値], [anchor.visited.font.shadowstyle,形態指定]:
	if (
		props["anchor.visited.font.shadowcolor.r"] ||
		props["anchor.visited.font.shadowcolor.g"] ||
		props["anchor.visited.font.shadowcolor.b"] ||
		props["anchor.visited.font.shadowstyle"]
	) {}
	// [anchor.visited.pen.color.r,数値], [anchor.visited.pen.color.g,数値], [anchor.visited.pen.color.b,数値], [anchor.visited.brush.color.r,数値], [anchor.visited.brush.color.g,数値], [anchor.visited.brush.color.b,数値]:
	if (
		props["anchor.visited.pen.color.r"] ||
		props["anchor.visited.pen.color.g"] ||
		props["anchor.visited.pen.color.b"] ||
		props["anchor.visited.brush.color.r"] ||
		props["anchor.visited.brush.color.g"] ||
		props["anchor.visited.brush.color.b"]
	) {}

	// [anchor.notselect.style,形状], [anchor.notselect.font.color.r,数値], [anchor.notselect.font.color.g,数値], [anchor.notselect.font.color.b,数値]:
	if (
		props["anchor.notselect.style"] ||
		props["anchor.notselect.font.color.r"] ||
		props["anchor.notselect.font.color.g"] ||
		props["anchor.notselect.font.color.b"]
	) {}
	// [anchor.notselect.font.shadowcolor.r,数値], [anchor.notselect.font.shadowcolor.g,数値], [anchor.notselect.font.shadowcolor.b,数値], [anchor.notselect.font.shadowstyle,形態指定]:
	if (
		props["anchor.notselect.font.shadowcolor.r"] ||
		props["anchor.notselect.font.shadowcolor.g"] ||
		props["anchor.notselect.font.shadowcolor.b"] ||
		props["anchor.notselect.font.shadowstyle"]
	) {}
	// [anchor.notselect.pen.color.r,数値], [anchor.notselect.pen.color.g,数値], [anchor.notselect.pen.color.b,数値], [anchor.notselect.brush.color.r,数値], [anchor.notselect.brush.color.g,数値], [anchor.notselect.brush.color.b,数値]:
	if (
		props["anchor.notselect.pen.color.r"] ||
		props["anchor.notselect.pen.color.g"] ||
		props["anchor.notselect.pen.color.b"] ||
		props["anchor.notselect.brush.color.r"] ||
		props["anchor.notselect.brush.color.g"] ||
		props["anchor.notselect.brush.color.b"]
	) {}

	// 選択肢カーソル (cursor / cursor.notselect)
	applyGroupProperties("cursor", "--balloon-cursor");
	applyGroupProperties("cursor.notselect", "--balloon-cursor-notselect");

	// [cursor.style,形状], [cursor.blendmethod,コマンド], [cursor.font.color.r,数値], [cursor.font.color.g,数値], [cursor.font.color.b,数値]:
	if (
		props["cursor.style"] ||
		props["cursor.blendmethod"] ||
		props["cursor.font.color.r"] ||
		props["cursor.font.color.g"] ||
		props["cursor.font.color.b"]
	) {}
	// [cursor.font.shadowcolor.r,数値], [cursor.font.shadowcolor.g,数値], [cursor.font.shadowcolor.b,数値], [cursor.font.shadowstyle,形態指定]:
	if (
		props["cursor.font.shadowcolor.r"] ||
		props["cursor.font.shadowcolor.g"] ||
		props["cursor.font.shadowcolor.b"] ||
		props["cursor.font.shadowstyle"]
	) {}
	// [cursor.pen.color.r,数値], [cursor.pen.color.g,数値], [cursor.pen.color.b,数値], [cursor.brush.color.r,数値], [cursor.brush.color.g,数値], [cursor.brush.color.b,数値]:
	if (
		props["cursor.pen.color.r"] ||
		props["cursor.pen.color.g"] ||
		props["cursor.pen.color.b"] ||
		props["cursor.brush.color.r"] ||
		props["cursor.brush.color.g"] ||
		props["cursor.brush.color.b"]
	) {}

	// [cursor.notselect.style,形状], [cursor.notselect.font.color.r,数値], [cursor.notselect.font.color.g,数値], [cursor.notselect.font.color.b,数値]:
	if (
		props["cursor.notselect.style"] ||
		props["cursor.notselect.font.color.r"] ||
		props["cursor.notselect.font.color.g"] ||
		props["cursor.notselect.font.color.b"]
	) {}
	// [cursor.notselect.font.shadowcolor.r,数値], [cursor.notselect.font.shadowcolor.g,数値], [cursor.notselect.font.shadowcolor.b,数値], [cursor.notselect.font.shadowstyle,形態指定]:
	if (
		props["cursor.notselect.font.shadowcolor.r"] ||
		props["cursor.notselect.font.shadowcolor.g"] ||
		props["cursor.notselect.font.shadowcolor.b"] ||
		props["cursor.notselect.font.shadowstyle"]
	) {}
	// [cursor.notselect.pen.color.r,数値], [cursor.notselect.pen.color.g,数値], [cursor.notselect.pen.color.b,数値], [cursor.notselect.brush.color.r,数値], [cursor.notselect.brush.color.g,数値], [cursor.notselect.brush.color.b,数値]:
	if (
		props["cursor.notselect.pen.color.r"] ||
		props["cursor.notselect.pen.color.g"] ||
		props["cursor.notselect.pen.color.b"] ||
		props["cursor.notselect.brush.color.r"] ||
		props["cursor.notselect.brush.color.g"] ||
		props["cursor.notselect.brush.color.b"]
	) {}

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

	// [number.font.name,フォント名], [number.font.height,数値], [number.font.color.r,数値], [number.font.color.g,数値], [number.font.color.b,数値]:
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

	// [sstpmessage.font.name,フォント名], [sstpmessage.font.height,サイズ], [sstpmessage.font.color.r,数値], [sstpmessage.font.color.g,数値], [sstpmessage.font.color.b,数値]:
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

	// [disable.font.(フォント定義),(指定)]: props["disable.font"]
	const disableFont = props["disable.font"];
	if (disableFont) {
		root.style.setProperty("--balloon-disable-font", disableFont);
	}
}
