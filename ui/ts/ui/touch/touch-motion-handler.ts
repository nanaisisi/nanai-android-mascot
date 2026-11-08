/**
 * @file touch-motion-handler.js
 * @description ドラッグ、撫で (Stroke)、ピンチ、回転、スワイプ、画面端スナップの認識ハンドラ
 */

import { TOUCH_GESTURE_TYPES } from "./touch-gesture-event.js";
import {
	getTouchAngle,
	getTouchCenter,
	getTouchDistance,
} from "./touch-helpers.js";

/**
 * シングルタッチ時の移動処理 (ドラッグ & 撫で認識)
 * @param {import("./touch-gesture-recognizer.js").TouchGestureRecognizer} recognizer
 * @param {TouchEvent} e
 */
export function processSingleTouchMove(recognizer, e) {
	if (recognizer._isPinching) return;

	const t = e.touches[0];
	const now = Date.now();
	const deltaX = t.clientX - recognizer._startX;
	const deltaY = t.clientY - recognizer._startY;
	const stepDist = Math.hypot(
		t.clientX - recognizer._lastX,
		t.clientY - recognizer._lastY,
	);

	const dt = Math.max(1, now - recognizer._lastTime);
	recognizer._vx = (t.clientX - recognizer._lastX) / dt;
	recognizer._vy = (t.clientY - recognizer._lastY) / dt;

	recognizer._lastX = t.clientX;
	recognizer._lastY = t.clientY;
	recognizer._lastTime = now;

	if (
		!recognizer._hasMoved &&
		Math.hypot(deltaX, deltaY) > recognizer.options.slopThreshold
	) {
		recognizer._hasMoved = true;
		recognizer._clearLongPressTimer();
	}

	if (recognizer._hasMoved && !recognizer._longPressTriggered) {
		// 撫で認識の判定
		recognizer._accumulatedStroke += stepDist;
		if (
			recognizer._accumulatedStroke >= recognizer.options.strokeThreshold &&
			!recognizer._strokeTriggered
		) {
			recognizer._strokeTriggered = true;
			recognizer.emit(TOUCH_GESTURE_TYPES.STROKE, {
				centerX: t.clientX,
				centerY: t.clientY,
				strokeDistance: recognizer._accumulatedStroke,
				originalEvent: e,
			});
		}

		// ドラッグイベントの発火
		if (!recognizer._isDragging) {
			recognizer._isDragging = true;
			recognizer.emit(TOUCH_GESTURE_TYPES.DRAG_START, {
				centerX: recognizer._startX,
				centerY: recognizer._startY,
				originalEvent: e,
			});
		}

		recognizer.emit(TOUCH_GESTURE_TYPES.DRAG, {
			deltaX,
			deltaY,
			centerX: t.clientX,
			centerY: t.clientY,
			velocityX: recognizer._vx,
			velocityY: recognizer._vy,
			strokeDistance: recognizer._accumulatedStroke,
			originalEvent: e,
		});
	}
}

/**
 * マルチタッチ時の移動処理 (ピンチ & 回転認識)
 * @param {import("./touch-gesture-recognizer.js").TouchGestureRecognizer} recognizer
 * @param {TouchEvent} e
 */
export function processMultiTouchMove(recognizer, e) {
	recognizer._clearLongPressTimer();
	if (!e?.touches || e.touches.length < 2) return;
	const t1 = e.touches[0];
	const t2 = e.touches[1];
	const currentDist = getTouchDistance(t1, t2);
	const currentAngle = getTouchAngle(t1, t2);
	const center = getTouchCenter(t1, t2);

	const initialDist = recognizer._initialPinchDist;
	const rawScale =
		Number.isFinite(initialDist) && initialDist > 0
			? currentDist / initialDist
			: 1.0;
	const safeRawScale = Number.isFinite(rawScale) ? rawScale : 1.0;
	const scale = Math.min(
		Math.max(safeRawScale, recognizer.options.minScale),
		recognizer.options.maxScale,
	);
	const rawRotation = currentAngle - recognizer._initialAngle;
	const rotation = Number.isFinite(rawRotation) ? rawRotation : 0;

	if (
		Math.abs(currentDist - recognizer._initialPinchDist) >
			recognizer.options.slopThreshold ||
		Math.abs(rotation) > 5
	) {
		recognizer._twoFingerMoved = true;
	}

	recognizer._lastPinchScale = scale;

	recognizer.emit(TOUCH_GESTURE_TYPES.PINCH, {
		scale,
		centerX: Number.isFinite(center.x) ? center.x : 0,
		centerY: Number.isFinite(center.y) ? center.y : 0,
		originalEvent: e,
	});

	if (Math.abs(rotation) > 5) {
		recognizer.emit(TOUCH_GESTURE_TYPES.ROTATE, {
			rotation,
			centerX: Number.isFinite(center.x) ? center.x : 0,
			centerY: Number.isFinite(center.y) ? center.y : 0,
			originalEvent: e,
		});
	}
}

/**
 * ドラッグ終了時のスワイプおよびスナップ判定
 * @param {import("./touch-gesture-recognizer.js").TouchGestureRecognizer} recognizer
 * @param {TouchEvent} e
 */
export function handleDragEndAndSnap(recognizer, e) {
	recognizer._isDragging = false;
	const lastTouch = e?.changedTouches?.[0];
	const endX = lastTouch?.clientX ?? recognizer._lastX ?? 0;
	const endY = lastTouch?.clientY ?? recognizer._lastY ?? 0;

	recognizer.emit(TOUCH_GESTURE_TYPES.DRAG_END, {
		centerX: endX,
		centerY: endY,
		originalEvent: e,
	});

	// スワイプ（フリック）判定
	const totalDeltaX = endX - recognizer._startX;
	const totalDeltaY = endY - recognizer._startY;
	const totalDist = Math.hypot(totalDeltaX, totalDeltaY);
	const totalTime = Math.max(1, Date.now() - recognizer._startTime);
	const velocity = totalDist / totalTime;

	let swipeDirection = null;
	if (
		totalDist >= recognizer.options.swipeMinDistance &&
		velocity >= recognizer.options.swipeMinVelocity
	) {
		if (Math.abs(totalDeltaX) > Math.abs(totalDeltaY)) {
			swipeDirection = totalDeltaX > 0 ? "right" : "left";
		} else {
			swipeDirection = totalDeltaY > 0 ? "down" : "up";
		}

		recognizer.emit(TOUCH_GESTURE_TYPES.SWIPE, {
			direction: swipeDirection,
			distance: totalDist,
			velocity,
			deltaX: totalDeltaX,
			deltaY: totalDeltaY,
			centerX: endX,
			centerY: endY,
			originalEvent: e,
		});
	}

	// 画面端スナップ（Docked State / Snap）の判定
	const screenW = recognizer.options.screenWidth;
	const snapThreshold = recognizer.options.snapThreshold;
	let snapEdge = null;

	if (
		endX <= snapThreshold ||
		(swipeDirection === "left" && endX < screenW / 2)
	) {
		snapEdge = "left";
	} else if (
		endX >= screenW - snapThreshold ||
		(swipeDirection === "right" && endX > screenW / 2)
	) {
		snapEdge = "right";
	}

	if (snapEdge) {
		recognizer._dockState = snapEdge;
		recognizer.emit(TOUCH_GESTURE_TYPES.SNAP, {
			dockState: snapEdge,
			centerX: endX,
			centerY: endY,
			originalEvent: e,
		});
	} else {
		recognizer._dockState = "none";
	}
}
