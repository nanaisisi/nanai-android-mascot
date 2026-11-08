import type { BackButtonManager } from "./bridge/back-button.js";
import type { BridgeEventEmitter } from "./bridge/events.js";
import type { DockManager } from "./bridge/dock-manager.js";

export function destroyAndroidBridge(
	cleanups: Array<() => void>,
	emitter: BridgeEventEmitter,
	backButtonManager: BackButtonManager,
	dockManager: DockManager,
) {
	for (const cleanup of cleanups) {
		try {
			cleanup?.();
		} catch (err) {
			console.error("Error running cleanup in AndroidBridge:", err);
		}
	}
	emitter.clear();
	backButtonManager.clear();
	dockManager.destroy();
}
