/**
 * @file balloon-descript.js
 * @brief バルーンの descript.txt プロパティ（DPI, フォント, 描画領域, マウスカーソル等）の動的反映処理
 */
import { rgbFromComponents } from "./balloon-descript/utils.js";
import { applyFontProperties } from "./balloon-descript/font.js";
import { applyLayoutProperties } from "./balloon-descript/layout.js";
import { applyAssetProperties } from "./balloon-descript/assets.js";

export const balloonDescriptActions = {
	rgbFromComponents,

	/**
	 * @param {Record<string, string>} props
	 */
	applyBalloonDescript(props = {}) {
		if (!props) return;
		const root = document.documentElement;

		applyLayoutProperties(root, props, this);
		applyFontProperties(root, props, this);
		applyAssetProperties(root, props, this);
	},
};
