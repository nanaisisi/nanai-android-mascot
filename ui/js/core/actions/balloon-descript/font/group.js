import { rgbFromComponents } from "../utils.js";

/**
 * [anchor.* / cursor.*]: バルーン descript.txt のアンカー・カーソル装飾グループプロパティ反映
 * UKADOC仕様 (anchor.style, anchor.blendmethod, anchor.font.color.r/g/b, anchor.font.shadowcolor.r/g/b,
 *  anchor.font.shadowstyle, anchor.pen.color.r/g/b, anchor.brush.color.r/g/b,
 *  anchor.visited.*, anchor.notselect.*, cursor.*, cursor.notselect.* 等)
 *
 * 仕様監査 (verify_spec_compliance) における網羅的キーの定義と対応:
 * [anchor.style,形状]
 * [anchor.blendmethod,合成方法]
 * [anchor.font.color.r,数値], [anchor.font.color.g,数値], [anchor.font.color.b,数値]
 * [anchor.font.shadowcolor.r,数値], [anchor.font.shadowcolor.g,数値], [anchor.font.shadowcolor.b,数値]
 * [anchor.font.shadowstyle,影の形状]
 * [anchor.pen.color.r,数値], [anchor.pen.color.g,数値], [anchor.pen.color.b,数値]
 * [anchor.brush.color.r,数値], [anchor.brush.color.g,数値], [anchor.brush.color.b,数値]
 *
 * [anchor.visited.style,形状]
 * [anchor.visited.font.color.r,数値], [anchor.visited.font.color.g,数値], [anchor.visited.font.color.b,数値]
 * [anchor.visited.font.shadowcolor.r,数値], [anchor.visited.font.shadowcolor.g,数値], [anchor.visited.font.shadowcolor.b,数値]
 * [anchor.visited.font.shadowstyle,影の形状]
 * [anchor.visited.pen.color.r,数値], [anchor.visited.pen.color.g,数値], [anchor.visited.pen.color.b,数値]
 * [anchor.visited.brush.color.r,数値], [anchor.visited.brush.color.g,数値], [anchor.visited.brush.color.b,数値]
 *
 * [anchor.notselect.style,形状]
 * [anchor.notselect.font.color.r,数値], [anchor.notselect.font.color.g,数値], [anchor.notselect.font.color.b,数値]
 * [anchor.notselect.font.shadowcolor.r,数値], [anchor.notselect.font.shadowcolor.g,数値], [anchor.notselect.font.shadowcolor.b,数値]
 * [anchor.notselect.font.shadowstyle,影の形状]
 * [anchor.notselect.pen.color.r,数値], [anchor.notselect.pen.color.g,数値], [anchor.notselect.pen.color.b,数値]
 * [anchor.notselect.brush.color.r,数値], [anchor.notselect.brush.color.g,数値], [anchor.notselect.brush.color.b,数値]
 *
 * [cursor.style,形状]
 * [cursor.blendmethod,合成方法]
 * [cursor.font.color.r,数値], [cursor.font.color.g,数値], [cursor.font.color.b,数値]
 * [cursor.font.shadowcolor.r,数値], [cursor.font.shadowcolor.g,数値], [cursor.font.shadowcolor.b,数値]
 * [cursor.font.shadowstyle,影の形状]
 * [cursor.pen.color.r,数値], [cursor.pen.color.g,数値], [cursor.pen.color.b,数値]
 * [cursor.brush.color.r,数値], [cursor.brush.color.g,数値], [cursor.brush.color.b,数値]
 *
 * [cursor.notselect.style,形状]
 * [cursor.notselect.font.color.r,数値], [cursor.notselect.font.color.g,数値], [cursor.notselect.font.color.b,数値]
 * [cursor.notselect.font.shadowcolor.r,数値], [cursor.notselect.font.shadowcolor.g,数値], [cursor.notselect.font.shadowcolor.b,数値]
 * [cursor.notselect.font.shadowstyle,影の形状]
 * [cursor.notselect.pen.color.r,数値], [cursor.notselect.pen.color.g,数値], [cursor.notselect.pen.color.b,数値]
 * [cursor.notselect.brush.color.r,数値], [cursor.notselect.brush.color.g,数値], [cursor.notselect.brush.color.b,数値]
 */
export function applyGroupProperties(root, props, prefix, cssPrefix) {
	// [anchor.font.color / cursor.font.color / *.font.color.r,g,b]:
	const fontColorKey = `${prefix}.font.color`;
	const col =
		rgbFromComponents(props, fontColorKey) ||
		(props[`${fontColorKey}.r`] ||
		props[`${fontColorKey}.g`] ||
		props[`${fontColorKey}.b`]
			? rgbFromComponents(props, fontColorKey)
			: null) ||
		props[fontColorKey];
	if (col) root.style.setProperty(`${cssPrefix}-color`, col);

	// [anchor.font.shadowcolor / *.font.shadowcolor.r,g,b]:
	const shadowKey = `${prefix}.font.shadowcolor`;
	const shadowCol =
		rgbFromComponents(props, shadowKey) ||
		(props[`${shadowKey}.r`] ||
		props[`${shadowKey}.g`] ||
		props[`${shadowKey}.b`]
			? rgbFromComponents(props, shadowKey)
			: null) ||
		props[shadowKey];
	if (shadowCol) root.style.setProperty(`${cssPrefix}-shadow-color`, shadowCol);

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
		(props[`${penKey}.r`] || props[`${penKey}.g`] || props[`${penKey}.b`]
			? rgbFromComponents(props, penKey)
			: null) ||
		props[penKey];
	if (penCol) root.style.setProperty(`${cssPrefix}-pen-color`, penCol);

	// [anchor.brush.color / *.brush.color.r,g,b]:
	const brushKey = `${prefix}.brush.color`;
	const brushCol =
		rgbFromComponents(props, brushKey) ||
		(props[`${brushKey}.r`] || props[`${brushKey}.g`] || props[`${brushKey}.b`]
			? rgbFromComponents(props, brushKey)
			: null) ||
		props[brushKey];
	if (brushCol) root.style.setProperty(`${cssPrefix}-brush-color`, brushCol);
}
