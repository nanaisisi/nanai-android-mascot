import assert from "node:assert/strict";
import { describe, it } from "vitest";
import * as touchBridgeIndexFacade from "../../ui/ts/ui/touch/bridge/index.js";
import * as touchIndexFacade from "../../ui/ts/ui/touch/index.js";

describe("Touch and Bridge Barrel and Facade Re-exports Coverage", () => {
	it("ui/js/ui/touch/index.js re-exports expected symbols", () => {
		assert.ok(touchIndexFacade.ANDROID_EVENTS);
		assert.ok(touchIndexFacade.ANDROID_LIFECYCLE_STATES);
		assert.equal(typeof touchIndexFacade.AndroidBridge, "function");
		assert.equal(typeof touchIndexFacade.BackButtonManager, "function");
		assert.equal(typeof touchIndexFacade.BridgeEventEmitter, "function");
		assert.equal(typeof touchIndexFacade.DockManager, "function");
		assert.equal(typeof touchIndexFacade.OverlayManager, "function");
		assert.ok(touchIndexFacade.TOUCH_GESTURE_TYPES);
		assert.equal(typeof touchIndexFacade.TouchGestureEvent, "function");
		assert.equal(typeof touchIndexFacade.getTouchAngle, "function");
		assert.equal(typeof touchIndexFacade.getTouchCenter, "function");
		assert.equal(typeof touchIndexFacade.getTouchDistance, "function");
		assert.equal(typeof touchIndexFacade.TouchGestureRecognizer, "function");
	});

	it("ui/js/ui/touch/bridge/index.js re-exports expected symbols", () => {
		assert.equal(typeof touchBridgeIndexFacade.BackButtonManager, "function");
		assert.ok(touchBridgeIndexFacade.ANDROID_EVENTS);
		assert.ok(touchBridgeIndexFacade.ANDROID_LIFECYCLE_STATES);
		assert.equal(typeof touchBridgeIndexFacade.DockManager, "function");
		assert.equal(typeof touchBridgeIndexFacade.BridgeEventEmitter, "function");
		assert.equal(
			typeof touchBridgeIndexFacade.setupVisibilityListeners,
			"function",
		);
		assert.equal(typeof touchBridgeIndexFacade.isAndroidPlatform, "function");
		assert.equal(
			typeof touchBridgeIndexFacade.isNativeAndroidPlatform,
			"function",
		);
		assert.equal(typeof touchBridgeIndexFacade.OverlayManager, "function");
	});
});
