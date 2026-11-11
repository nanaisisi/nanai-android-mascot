/**
 * @file balloon-descript.js
 * @brief バルーンの descript.txt プロパティ（DPI, フォント, 描画領域, マウスカーソル等）の動的反映処理
 */

import { applyAssetProperties } from "./balloon-descript/assets.js";
import { applyFontProperties } from "./balloon-descript/font.js";
import { applyLayoutProperties } from "./balloon-descript/layout.js";
import { rgbFromComponents } from "./balloon-descript/utils.js";

export const balloonDescriptActions = {
	rgbFromComponents,

	/**
	 * @param {Record<string, string>} props
	 */
	applyBalloonDescript(props: Record<string, string> = {}) {
		if (!props) return;
		const root = document.documentElement;

		applyLayoutProperties(
			root,
			props,
			this as Parameters<typeof applyLayoutProperties>[2],
		);
		applyFontProperties(
			root,
			props,
			this as Parameters<typeof applyFontProperties>[2],
		);
		applyAssetProperties(
			root,
			props,
			this as Parameters<typeof applyAssetProperties>[2],
		);
	},
};
