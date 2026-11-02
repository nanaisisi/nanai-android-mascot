/**
 * @file constants.js
 * @description Slot-12 Android プラットフォームブリッジ用イベントおよびライフサイクル定数定義
 * Contract: ANDROID_EVENTS, ANDROID_LIFECYCLE_STATES
 */

/**
 * AndroidBridge イベント定数
 */
export const ANDROID_EVENTS = {
	PAUSE: "nas:android:pause",
	RESUME: "nas:android:resume",
	STOP: "nas:android:stop",
	OVERLAY_MODE_CHANGED: "nas:android:overlay-mode-changed",
	STATE_CHANGED: "nas:android:state-changed",
	OVERLAY_TRANSPARENCY_CHANGED: "nas:android:overlay-transparency-changed",
	CLICK_THROUGH_CHANGED: "nas:android:click-through-changed",
	TRIM_MEMORY: "nas:android:trim-memory",
	BACK_BUTTON: "nas:android:back-button",
	DOCK_CHANGED: "nas:android:dock-changed",
};

/**
 * ライフサイクル状態定数
 */
export const ANDROID_LIFECYCLE_STATES = {
	ACTIVE: "active",
	PAUSED: "paused",
	STOPPED: "stopped",
};
