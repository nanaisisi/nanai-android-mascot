/**
 * @file layout.js
 * @brief バルーンレイアウト・DPI・領域・位置・数字・SSTPメッセージ・9スライス設定反映 (UKADOC準拠)
 * // [descript.txt（Balloonの）]: Balloon descript.txt レイアウト・領域・座標バインディング
 */
import { applyAlignmentProperties } from "./layout/alignment.js";
import { applyCommunicateBoxProperties } from "./layout/communicate-box.js";
import { applyPositionProperties } from "./layout/position.js";
import { applyValidRectProperties } from "./layout/rect.js";
import { applyDpiAndScaleProperties } from "./layout/scale.js";

export {
	applyAlignmentProperties,
	applyCommunicateBoxProperties,
	applyDpiAndScaleProperties,
	applyPositionProperties,
	applyValidRectProperties,
};

export function applyLayoutProperties(
	root: HTMLElement,
	props: Record<string, string>,
	instance: {
		rgbFromComponents?: (
			props: Record<string, string>,
			base: string,
		) => string | null;
		applyBalloonDescript?: (props?: unknown) => void;
		balloonDpiScale?: number;
		balloonUserScale?: unknown;
		currentBalloonTheme?: unknown;
		elements?: { balloonDisplay: HTMLElement | null };
		scopeId?: number;
		currentScopeId?: number;
		balloonDontMove?: boolean;
		balloonSyncScale?: boolean;
		balloonAlignment?: string;
		windowPositionLimit?: boolean;
	},
) {
	applyDpiAndScaleProperties(root, props, instance);
	applyCommunicateBoxProperties(props);
	applyValidRectProperties(root, props);
	applyPositionProperties(root, props, instance);
	applyAlignmentProperties(root, props, instance);
}
