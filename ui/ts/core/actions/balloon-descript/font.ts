/**
 * @file font.js
 * @brief バルーンフォント・カラー・装飾・アンカー・カーソル・SSTPメッセージの設定反映 (UKADOC準拠)
 */
import { applyBaseFontProperties } from "./font/base.js";
import { applyGroupProperties } from "./font/group.js";
import { applySpecialFontProperties } from "./font/special.js";

export function applyFontProperties(
	root: unknown,
	props: object,
	_instance: {
		rgbFromComponents?: (
			props: Record<string, unknown>,
			base: string,
		) => string | null;
		applyBalloonDescript?: (props?: unknown) => void;
		balloonDpiScale?: number;
		balloonUserScale?: unknown;
		currentBalloonTheme?: unknown;
		elements?: { balloonDisplay: HTMLElement | null };
	},
) {
	applyBaseFontProperties(root, props);

	applyGroupProperties(root, props, "anchor", "--balloon-anchor");
	applyGroupProperties(
		root,
		props,
		"anchor.visited",
		"--balloon-anchor-visited",
	);
	applyGroupProperties(
		root,
		props,
		"anchor.notselect",
		"--balloon-anchor-notselect",
	);

	applyGroupProperties(root, props, "cursor", "--balloon-cursor");
	applyGroupProperties(
		root,
		props,
		"cursor.notselect",
		"--balloon-cursor-notselect",
	);

	applySpecialFontProperties(root, props);
}
