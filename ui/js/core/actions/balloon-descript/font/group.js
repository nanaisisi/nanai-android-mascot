import { rgbFromComponents } from "../utils.js";

export function applyGroupProperties(root, props, prefix, cssPrefix) {
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
}
