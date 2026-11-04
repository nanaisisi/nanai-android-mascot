import { rgbFromComponents } from "../utils.js";

export function applyBaseFontProperties(root: any, props: Record<string, any>) {
	if (props.id) root.style.setProperty("--balloon-id", props.id);

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
	} else if (props["font.size"]) {
		const fs = parseInt(props["font.size"], 10);
		if (!Number.isNaN(fs) && fs > 0) {
			// SSP 規格: pt 換算 (9pt = 12px 相当: pt * 96 / 72)
			const pxSize = Math.round((fs * 96) / 72);
			root.style.setProperty("--balloon-font-size", `${pxSize}px`);
		}
	} else {
		// SSP 標準の初期フォントサイズ (9pt = 12px)
		root.style.setProperty("--balloon-font-size", "12px");
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

	const decorations: string[] = [];
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
		root.style.setProperty(
			"--balloon-font-shadowstyle",
			props["font.shadowstyle"],
		);
	}
}
