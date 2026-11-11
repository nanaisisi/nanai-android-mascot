/**
 * @file index.js
 * @description Slot-12 Androidタッチ & オーバーレイ制御 モジュールエントリポイント
 * Contract: AndroidBridge, TouchGestureEvent, TOUCH_GESTURE_TYPES, TouchGestureRecognizer
 */

export {
	ANDROID_EVENTS,
	ANDROID_LIFECYCLE_STATES,
	AndroidBridge,
	applyPlatformUiClasses,
	BackButtonManager,
	BridgeEventEmitter,
	DockManager,
	detectPlatformMode,
	OverlayManager,
	type PlatformMode,
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
