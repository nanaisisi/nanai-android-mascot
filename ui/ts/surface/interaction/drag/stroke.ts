import { STROKE_THRESHOLD } from "./constants.js";

/**
 * 撫で（Stroke）判定の状態管理トラッカー
 *
 * @param {object} options
 * @param {number} [options.threshold=STROKE_THRESHOLD] 撫でと認識する移動積算距離 (px)
 * @param {(clientX: number, clientY: number) => void} [options.onStroke] 撫で発火コールバック
 * @returns {{
 *   addDistance: (stepDist: number, clientX: number, clientY: number) => boolean,
 *   isTriggered: () => boolean,
 *   getDistance: () => number,
 *   reset: () => void
 * }}
 */
export function createStrokeTracker(options = {}) {
	const threshold = options.threshold ?? STROKE_THRESHOLD;
	const onStroke = options.onStroke;

	let strokeDistance = 0;
	let strokeTriggered = false;

	const addDistance = (stepDist, clientX, clientY) => {
		if (strokeTriggered) return true;
		strokeDistance += stepDist;
		if (strokeDistance >= threshold) {
			strokeTriggered = true;
			onStroke?.(clientX, clientY);
			return true;
		}
		return false;
	};

	const reset = () => {
		strokeDistance = 0;
		strokeTriggered = false;
	};

	return {
		addDistance,
		isTriggered: () => strokeTriggered,
		getDistance: () => strokeDistance,
		reset,
	};
}
