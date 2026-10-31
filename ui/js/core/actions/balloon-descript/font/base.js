import { rgbFromComponents } from "../utils.js";

export function applyBaseFontProperties(root, props) {
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
}
