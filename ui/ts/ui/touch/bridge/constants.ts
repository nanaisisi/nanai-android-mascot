/**
 * @file constants.js
 * @description Slot-12 Android プラットフォームブリッジ用イベントおよびライフサイクル定数定義
 * Contract: ANDROID_EVENTS, ANDROID_LIFECYCLE_STATES
 */

/**
 * AndroidBridge イベント定数
 */
export const ANDROID_EVENTS = {
	PAUSE: "nam:android:pause",
	RESUME: "nam:android:resume",
	STOP: "nam:android:stop",
	OVERLAY_MODE_CHANGED: "nam:android:overlay-mode-changed",
	STATE_CHANGED: "nam:android:state-changed",
	OVERLAY_TRANSPARENCY_CHANGED: "nam:android:overlay-transparency-changed",
	CLICK_THROUGH_CHANGED: "nam:android:click-through-changed",
	TRIM_MEMORY: "nam:android:trim-memory",
	BACK_BUTTON: "nam:android:back-button",
	DOCK_CHANGED: "nam:android:dock-changed",
	DOCK_OPTIONS_CHANGED: "nam:android:dock-options-changed",
	PLATFORM_MODE_DETECTED: "nam:android:platform-mode-detected",
};

/**
 * ライフサイクル状態定数
 */
export const ANDROID_LIFECYCLE_STATES = {
	ACTIVE: "active",
	PAUSED: "paused",
	STOPPED: "stopped",
};
