/**
 * @file index.js
 * @description Slot-12 Androidタッチ & オーバーレイ制御 モジュールエントリポイント
 * Contract: AndroidBridge, TouchGestureEvent, TOUCH_GESTURE_TYPES, TouchGestureRecognizer
 */

export {
	ANDROID_EVENTS,
	AndroidBridge,
} from "./android-bridge.js";
export {
	TOUCH_GESTURE_TYPES,
	TouchGestureEvent,
} from "./touch-gesture-event.js";

export {
	getTouchAngle,
	getTouchCenter,
	getTouchDistance,
	TouchGestureRecognizer,
} from "./touch-gesture-recognizer.js";
