import {
	getCurrentWindowPosition,
	isTauriAvailable,
	moveCurrentWindowBy,
} from "../../../core/tauri-helper.js";
import { DRAG_PADDING } from "./constants.js";

/**
 * 値を指定範囲内にクランプする
 *
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clampPosition(val, min, max) {
	return Math.max(min, Math.min(max, val));
}

/**
 * 画面内パディングを考慮した要素の制限座標を計算
 *
 * @param {number} initialLeft
 * @param {number} initialTop
 * @param {number} deltaX
 * @param {number} deltaY
 * @param {number} [padding=DRAG_PADDING]
 * @param {number} [innerWidth=globalThis.innerWidth]
 * @param {number} [innerHeight=globalThis.innerHeight]
 * @returns {{ x: number, y: number }}
 */
export function calculateClampedCoordinates(
	initialLeft,
	initialTop,
	deltaX,
	deltaY,
	padding = DRAG_PADDING,
	innerWidth = globalThis.innerWidth,
	innerHeight = globalThis.innerHeight,
) {
	const rawX = initialLeft + deltaX;
	const rawY = initialTop + deltaY;

	const x = clampPosition(rawX, padding, innerWidth - padding);
	const y = clampPosition(rawY, padding, innerHeight - padding);

	return { x, y };
}

/**
 * デスクトップ環境におけるネイティブウィンドウドラッグ管理セッション
 *
 * @returns {{
 *   canStartNativeDrag: (eventType: string) => boolean,
 *   startNativeDrag: (isInteracting: () => boolean) => boolean,
 *   moveNativeWindow: (deltaX: number, deltaY: number) => void,
 *   hasStarted: () => boolean,
 *   reset: () => void
 * }}
 */
export function createNativeDragSession() {
	let nativeDragStarted = false;
	let nativeWindowOrigin = null;

	const canStartNativeDrag = (eventType) => {
		return (
			eventType === "mousedown" &&
			isTauriAvailable() &&
			!navigator.userAgent.includes("Android")
		);
	};

	const startNativeDrag = (isInteracting) => {
		nativeDragStarted = true;
		void getCurrentWindowPosition().then((position) => {
			if (!isInteracting || isInteracting()) {
				nativeWindowOrigin = position;
			}
		});
		return true;
	};

	const moveNativeWindow = (deltaX, deltaY) => {
		if (nativeDragStarted && nativeWindowOrigin) {
			void moveCurrentWindowBy(deltaX, deltaY, nativeWindowOrigin);
		}
	};

	const reset = () => {
		nativeDragStarted = false;
		nativeWindowOrigin = null;
	};

	return {
		canStartNativeDrag,
		startNativeDrag,
		moveNativeWindow,
		hasStarted: () => nativeDragStarted,
		reset,
	};
}
