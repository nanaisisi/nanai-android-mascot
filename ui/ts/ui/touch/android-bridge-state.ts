/**
 * @file android-bridge-state.ts
 * @description Helper functions for AndroidBridge lifecycle and state management
 */

import type { DockManager } from "./bridge/dock-manager.js";
import {
	ANDROID_LIFECYCLE_STATES,
	detectPlatformMode,
	isAndroidPlatform,
	isNativeAndroidPlatform,
} from "./bridge/index.js";
import type { OverlayManager } from "./bridge/overlay.js";

export function checkIsThrottled(lifecycleState: string): boolean {
	return (
		lifecycleState === ANDROID_LIFECYCLE_STATES.PAUSED ||
		lifecycleState === ANDROID_LIFECYCLE_STATES.STOPPED
	);
}

export function getAndroidBridgeState(
	lifecycleState: string,
	overlayManager: OverlayManager,
	dockManager: DockManager,
) {
	return {
		isAndroid: isAndroidPlatform(),
		isNativeAndroid: isNativeAndroidPlatform(),
		platformMode: detectPlatformMode(),
		isOverlayEnabled: overlayManager.isOverlayEnabled,
		isForegroundServiceActive: overlayManager.isForegroundServiceActive,
		lifecycleState,
		overlayTransparency: overlayManager.overlayTransparency,
		isClickThrough: overlayManager.isClickThrough,
		isThrottled: checkIsThrottled(lifecycleState),
		dockState: dockManager.dockState,
		isDocked: dockManager.isDocked,
		hasAttachedElement: Boolean(dockManager.attachedElement),
	};
}
