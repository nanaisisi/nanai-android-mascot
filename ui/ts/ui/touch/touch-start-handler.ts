import {
	getTouchAngle,
	getTouchCenter,
	getTouchDistance,
} from "./touch-helpers.js";
import { startLongPressTimer } from "./touch-tap-handler.js";

export function handleTouchStartEvent(recognizer: any, e: any) {
	const touches = e.touches;
	recognizer._clearLongPressTimer();

	if (touches.length === 1) {
		// シングルタッチの開始
		const t = touches[0];
		const now = Date.now();
		recognizer._startX = t.clientX;
		recognizer._startY = t.clientY;
		recognizer._startTime = now;
		recognizer._lastX = t.clientX;
		recognizer._lastY = t.clientY;
		recognizer._lastTime = now;
		recognizer._vx = 0;
		recognizer._vy = 0;
		recognizer._hasMoved = false;
		recognizer._isDragging = false;
		recognizer._accumulatedStroke = 0;
		recognizer._strokeTriggered = false;
		recognizer._longPressTriggered = false;
		recognizer._isPinching = false;

		startLongPressTimer(recognizer, e);
	} else if (touches.length === 2) {
		// 2本指タッチ（ピンチ/回転/2本指タップ）の開始
		recognizer._clearLongPressTimer();
		recognizer._isPinching = true;
		recognizer._isDragging = false;
		const t1 = touches[0];
		const t2 = touches[1];
		recognizer._initialPinchDist = getTouchDistance(t1, t2);
		recognizer._initialAngle = getTouchAngle(t1, t2);
		recognizer._lastPinchScale = 1.0;

		recognizer._twoFingerStartTime = Date.now();
		recognizer._twoFingerMoved = false;
		recognizer._twoFingerCenter = getTouchCenter(t1, t2);
	} else if (touches.length > 2) {
		recognizer._clearLongPressTimer();
		recognizer._twoFingerMoved = true;
	}
}
