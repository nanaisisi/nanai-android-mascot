/**
 * @file touch-tap-handler.js
 * @description タップ、ダブルタップ、長押し、2本指タップ認識ハンドラ
 */

import { TOUCH_GESTURE_TYPES } from "./touch-gesture-event.js";

export interface TouchRecognizerTarget {
	_longPressTimer: unknown;
	_hasMoved: boolean;
	_strokeTriggered: boolean;
	_isPinching: boolean;
	_longPressTriggered: boolean;
	_startX: number;
	_startY: number;
	_lastX: number;
	_lastY: number;
	_lastTime: number;
	_startTime: number;
	_twoFingerStartTime: number;
	_twoFingerMoved: boolean;
	_twoFingerCenter: { x: number; y: number };
	_lastTapTime: number;
	_lastTapX: number;
	_lastTapY: number;
	options: {
		longPressDelay: number;
		twoFingerTapDelay: number;
		doubleTapDelay: number;
		doubleTapDistance: number;
	};
	emit: (event: string, payload: unknown) => void;
}

/**
 * シングルタッチ開始時の長押しタイマー設定
 * @param {TouchRecognizerTarget} recognizer
 * @param {unknown} e
 */
export function startLongPressTimer(recognizer: TouchRecognizerTarget, e: unknown) {
	clearLongPressTimer(recognizer);
	recognizer._longPressTimer = setTimeout(() => {
		if (
			!recognizer._hasMoved &&
			!recognizer._strokeTriggered &&
			!recognizer._isPinching
		) {
			recognizer._longPressTriggered = true;
			recognizer.emit(TOUCH_GESTURE_TYPES.LONG_PRESS, {
				centerX: recognizer._startX,
				centerY: recognizer._startY,
				originalEvent: e,
			});
		}
	}, recognizer.options.longPressDelay);
}

/**
 * 長押しタイマーの解除
 * @param {TouchRecognizerTarget} recognizer
 */
export function clearLongPressTimer(recognizer: TouchRecognizerTarget) {
	if (recognizer._longPressTimer) {
		clearTimeout(recognizer._longPressTimer as number);
		recognizer._longPressTimer = null;
	}
}

/**
 * 2本指タップ完了判定
 * @param {TouchRecognizerTarget} recognizer
 * @param {unknown} e
 * @returns {boolean} 2本指タップが発火したかどうか
 */
export function handleTwoFingerTapEnd(
	recognizer: TouchRecognizerTarget,
	e: { touches: Array<{ clientX: number; clientY: number }> },
) {
	if (recognizer._isPinching || recognizer._twoFingerStartTime > 0) {
		const elapsed = Date.now() - recognizer._twoFingerStartTime;
		if (
			!recognizer._twoFingerMoved &&
			recognizer._twoFingerStartTime > 0 &&
			elapsed <= recognizer.options.twoFingerTapDelay &&
			e.touches.length === 0
		) {
			recognizer._isPinching = false;
			recognizer._twoFingerStartTime = 0;
			recognizer.emit(TOUCH_GESTURE_TYPES.TWO_FINGER_TAP, {
				centerX: recognizer._twoFingerCenter.x,
				centerY: recognizer._twoFingerCenter.y,
				originalEvent: e,
			});
			return true;
		}

		if (e.touches.length < 2) {
			recognizer._isPinching = false;
			if (e.touches.length === 1) {
				// 1本指が残っている場合はドラッグ起点およびタイムスタンプを更新
				const t = e.touches[0];
				recognizer._startX = t.clientX;
				recognizer._startY = t.clientY;
				recognizer._lastX = t.clientX;
				recognizer._lastY = t.clientY;
				recognizer._lastTime = Date.now();
				recognizer._startTime = recognizer._lastTime;
				recognizer._hasMoved = false;
			}
		}
		return true;
	}
	return false;
}

/**
 * シングルタップ / ダブルタップ完了判定
 * @param {TouchRecognizerTarget} recognizer
 * @param {unknown} e
 */
export function handleTapOrDoubleTapEnd(
	recognizer: TouchRecognizerTarget,
	e: { changedTouches: Array<{ clientX: number; clientY: number }> },
) {
	if (
		!recognizer._hasMoved &&
		!recognizer._longPressTriggered &&
		!recognizer._strokeTriggered
	) {
		const touch = e.changedTouches?.[0];
		const tapX = touch ? touch.clientX : recognizer._startX;
		const tapY = touch ? touch.clientY : recognizer._startY;
		const now = Date.now();

		const elapsed = now - recognizer._lastTapTime;
		const distFromLastTap = Math.hypot(
			tapX - recognizer._lastTapX,
			tapY - recognizer._lastTapY,
		);

		if (
			elapsed > 0 &&
			elapsed <= recognizer.options.doubleTapDelay &&
			distFromLastTap <= recognizer.options.doubleTapDistance
		) {
			// ダブルタップ成立
			recognizer._lastTapTime = 0;
			recognizer._lastTapX = 0;
			recognizer._lastTapY = 0;
			recognizer.emit(TOUCH_GESTURE_TYPES.DOUBLE_TAP, {
				centerX: tapX,
				centerY: tapY,
				tapCount: 2,
				originalEvent: e,
			});
		} else {
			// 通常のシングルタップ
			recognizer._lastTapTime = now;
			recognizer._lastTapX = tapX;
			recognizer._lastTapY = tapY;
			recognizer.emit(TOUCH_GESTURE_TYPES.TAP, {
				centerX: tapX,
				centerY: tapY,
				tapCount: 1,
				originalEvent: e,
			});
		}
	}
}
