import { rgbFromComponents } from "../utils.js";

/**
 * [anchor.* / cursor.*]: バルーン descript.txt のアンカー・カーソル装飾グループプロパティ反映
 * UKADOC仕様 (anchor.style, anchor.blendmethod, anchor.font.color.r/g/b, anchor.font.shadowcolor.r/g/b,
 *  anchor.font.shadowstyle, anchor.pen.color.r/g/b, anchor.brush.color.r/g/b,
 *  anchor.visited.*, anchor.notselect.*, cursor.*, cursor.notselect.* 等)
 */
export function applyGroupProperties(root, props, prefix, cssPrefix) {
	// [anchor.font.color / cursor.font.color / *.font.color.r,g,b]:
	const fontColorKey = `${prefix}.font.color`;
	const col =
		rgbFromComponents(props, fontColorKey) ||
		props[`${fontColorKey}.r`] ||
		props[`${fontColorKey}.g`] ||
		props[`${fontColorKey}.b`]
			? rgbFromComponents(props, fontColorKey)
			: props[fontColorKey];
	if (col) root.style.setProperty(`${cssPrefix}-color`, col);

	// [anchor.font.shadowcolor / *.font.shadowcolor.r,g,b]:
	const shadowKey = `${prefix}.font.shadowcolor`;
	const shadowCol =
		rgbFromComponents(props, shadowKey) ||
		props[`${shadowKey}.r`] ||
		props[`${shadowKey}.g`] ||
		props[`${shadowKey}.b`]
			? rgbFromComponents(props, shadowKey)
			: null;
	if (shadowCol) {
		root.style.setProperty(`${cssPrefix}-shadow-color`, shadowCol);
	}

	// [anchor.font.shadowstyle / cursor.font.shadowstyle / *.font.shadowstyle]:
	const shadowStyleVal =
		props[`${prefix}.font.shadowstyle`] || props[`${prefix}.shadowstyle`];
	if (shadowStyleVal) {
		root.style.setProperty(`${cssPrefix}-shadow-style`, shadowStyleVal);
	}

	// [anchor.style / cursor.style / *.style]:
	const styleVal = props[`${prefix}.style`];
	if (styleVal) {
		root.style.setProperty(`${cssPrefix}-style`, styleVal);
	}

	// [anchor.blendmethod / cursor.blendmethod / *.blendmethod]:
	const blendVal = props[`${prefix}.blendmethod`];
	if (blendVal) {
		root.style.setProperty(`${cssPrefix}-blendmethod`, blendVal);
	}

	// [anchor.pen.color / *.pen.color.r,g,b]:
	const penKey = `${prefix}.pen.color`;
	const penCol =
		rgbFromComponents(props, penKey) ||
		props[`${penKey}.r`] ||
		props[`${penKey}.g`] ||
		props[`${penKey}.b`]
			? rgbFromComponents(props, penKey)
			: null;
	if (penCol) root.style.setProperty(`${cssPrefix}-pen-color`, penCol);

	// [anchor.brush.color / *.brush.color.r,g,b]:
	const brushKey = `${prefix}.brush.color`;
	const brushCol =
		rgbFromComponents(props, brushKey) ||
		props[`${brushKey}.r`] ||
		props[`${brushKey}.g`] ||
		props[`${brushKey}.b`]
			? rgbFromComponents(props, brushKey)
			: null;
	if (brushCol) root.style.setProperty(`${cssPrefix}-brush-color`, brushCol);
}
