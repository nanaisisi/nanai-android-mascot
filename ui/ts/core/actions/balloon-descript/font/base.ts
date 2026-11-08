import { rgbFromComponents } from "../utils.js";

export function applyBaseFontProperties(
	root: unknown,
	props: Record<string, unknown>,
) {
	const el = root as HTMLElement;
	if (props.id) el.style.setProperty("--balloon-id", String(props.id));

	if (props["font.name"]) {
		el.style.setProperty(
			"--balloon-font-family",
			`"${props["font.name"]}", Meiryo, sans-serif`,
		);
	}

	if (props["font.height"]) {
		const fh = parseInt(String(props["font.height"]), 10);
		if (!Number.isNaN(fh) && fh > 0) {
			el.style.setProperty("--balloon-font-size", `${fh}px`);
		}
	} else if (props["font.size"]) {
		const fs = parseInt(String(props["font.size"]), 10);
		if (!Number.isNaN(fs) && fs > 0) {
			// SSP 規格: pt 換算 (9pt = 12px 相当: pt * 96 / 72)
			const pxSize = Math.round((fs * 96) / 72);
			el.style.setProperty("--balloon-font-size", `${pxSize}px`);
		}
	} else {
		// SSP 標準の初期フォントサイズ (9pt = 12px)
		el.style.setProperty("--balloon-font-size", "12px");
	}

	if (
		props["font.bold"] === "1" ||
		String(props["font.bold"])?.toLowerCase() === "true"
	) {
		el.style.setProperty("--balloon-font-weight", "bold");
	}

	if (
		props["font.italic"] === "1" ||
		String(props["font.italic"])?.toLowerCase() === "true"
	) {
		el.style.setProperty("--balloon-font-style", "italic");
	}

	const decorations: string[] = [];
	if (
		props["font.underline"] === "1" ||
		String(props["font.underline"])?.toLowerCase() === "true"
	) {
		decorations.push("underline");
	}

	if (
		props["font.strike"] === "1" ||
		String(props["font.strike"])?.toLowerCase() === "true"
	) {
		decorations.push("line-through");
	}
	if (decorations.length > 0) {
		el.style.setProperty("--balloon-text-decoration", decorations.join(" "));
	}

	const isOutline =
		props["font.outline"] === "1" ||
		String(props["font.outline"])?.toLowerCase() === "true";
	if (isOutline) {
		el.style.setProperty("--balloon-font-outline", "1");
		// CSS text-stroke / text-shadow によるアウトライン表現
		el.style.setProperty(
			"--balloon-text-stroke",
			"1px var(--balloon-font-shadow-color, #000000)",
		);
	}

	const fontColor = rgbFromComponents(props, "font.color");
	if (fontColor) {
		el.style.setProperty("--balloon-text-color", fontColor);
	} else if (props["font.color"]) {
		el.style.setProperty("--balloon-text-color", String(props["font.color"]));
	}

	const fontShadowColor = rgbFromComponents(props, "font.shadowcolor");
	if (fontShadowColor) {
		el.style.setProperty("--balloon-font-shadow-color", fontShadowColor);
	}

	if (props["font.shadowstyle"]) {
		const shadowStyle = String(props["font.shadowstyle"]).trim();
		el.style.setProperty("--balloon-font-shadow-style", shadowStyle);
		el.style.setProperty("--balloon-font-shadowstyle", shadowStyle);

		// UKADOC/SSP 影スタイルに応じた CSS text-shadow トークンの導出
		// "underline": 下部シャドウ, "outline": 全周シャドウ, "shadow": 右下シャドウ, "none": なし
		const sCol = fontShadowColor || "rgba(0, 0, 0, 0.4)";
		if (shadowStyle === "none" || shadowStyle === "0") {
			el.style.setProperty("--balloon-text-shadow", "none");
		} else if (shadowStyle === "outline") {
			el.style.setProperty(
				"--balloon-text-shadow",
				`1px 1px 0 ${sCol}, -1px -1px 0 ${sCol}, 1px -1px 0 ${sCol}, -1px 1px 0 ${sCol}`,
			);
		} else if (shadowStyle === "underline") {
			el.style.setProperty("--balloon-text-shadow", `0 1px 0 ${sCol}`);
		} else {
			// デフォルト/指定値: 右下1px
			el.style.setProperty("--balloon-text-shadow", `1px 1px 1px ${sCol}`);
		}
	} else if (fontShadowColor) {
		el.style.setProperty(
			"--balloon-text-shadow",
			`1px 1px 1px ${fontShadowColor}`,
		);
	}
}
