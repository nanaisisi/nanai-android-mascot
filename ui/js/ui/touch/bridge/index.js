/**
 * @file index.js
 * @description Slot-12 AndroidBridge 内部サブモジュール一覧バレルエクスポート
 */

export { BackButtonManager } from "./back-button.js";
export {
	ANDROID_EVENTS,
	ANDROID_LIFECYCLE_STATES,
} from "./constants.js";
export { DockManager } from "./dock.js";
export { BridgeEventEmitter } from "./events.js";
export { setupVisibilityListeners } from "./lifecycle.js";
export {
	isAndroidPlatform,
	isNativeAndroidPlatform,
	OverlayManager,
} from "./overlay.js";
