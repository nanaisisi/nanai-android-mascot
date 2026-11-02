import assert from "node:assert/strict";
import { describe, it } from "vitest";
import * as commandHandlerBarrel from "../ui/js/ghost/command-handler/index.js";
import * as commandHandlerSystemFacade from "../ui/js/ghost/command-handler/system.js";
import * as sakuraParserFacade from "../ui/js/ghost/sakura-parser.js";
import * as animationPlaybackFacade from "../ui/js/surface/animation/animation-playback.js";
import * as surfaceFacade from "../ui/js/surface/surface.js";
import * as surfaceCompositorFacade from "../ui/js/surface/surface-compositor.js";
import * as advancedInputsFacade from "../ui/js/ui/renderers/inputs/advanced-inputs.js";
import * as modalDialogInputsFacade from "../ui/js/ui/renderers/modal-dialog-inputs.js";
import * as touchBridgeIndexFacade from "../ui/js/ui/touch/bridge/index.js";
import * as touchIndexFacade from "../ui/js/ui/touch/index.js";

describe("Barrel and Facade Re-exports Coverage", () => {
	it("ui/js/surface/surface.js re-exports expected symbols", () => {
		assert.equal(typeof surfaceFacade.collisionContains, "function");
		assert.equal(typeof surfaceFacade.getShellManifest, "function");
		assert.equal(typeof surfaceFacade.manifestToSurfaceData, "function");
		assert.equal(typeof surfaceFacade.composeSurfaceElements, "function");
		assert.equal(typeof surfaceFacade.processChromaKey, "function");
		assert.equal(typeof surfaceFacade.SurfaceManager, "function");
		assert.equal(typeof surfaceFacade.expandSurfaceRange, "function");
		assert.equal(typeof surfaceFacade.parseSurfacesTxt, "function");
	});

	it("ui/js/surface/surface-compositor.js re-exports expected symbols", () => {
		assert.equal(typeof surfaceCompositorFacade.processChromaKey, "function");
		assert.equal(
			typeof surfaceCompositorFacade.composeSurfaceElements,
			"function",
		);
		assert.equal(typeof surfaceCompositorFacade.compositeElements, "function");
		assert.equal(typeof surfaceCompositorFacade.SurfaceFrameBuffer, "function");
		assert.equal(typeof surfaceCompositorFacade.drawImageLayer, "function");
		assert.equal(typeof surfaceCompositorFacade.drawLayer, "function");
		assert.equal(typeof surfaceCompositorFacade.loadLayerImage, "function");
	});

	it("ui/js/ghost/sakura-parser.js re-exports expected symbols", () => {
		assert.equal(typeof sakuraParserFacade.collectAstTokens, "function");
		assert.equal(
			typeof sakuraParserFacade.collectAstTokensByLifetime,
			"function",
		);
		assert.equal(typeof sakuraParserFacade.getSakuraTokenLifetime, "function");
		assert.equal(typeof sakuraParserFacade.tokensToAst, "function");
		assert.equal(typeof sakuraParserFacade.traverseAst, "function");
		assert.equal(typeof sakuraParserFacade.parseSakuraScriptAsync, "function");
		assert.equal(typeof sakuraParserFacade.rustCommandsToTokens, "function");
		assert.equal(typeof sakuraParserFacade.parseSakuraScript, "function");
	});

	it("ui/js/ghost/command-handler/index.js re-exports expected symbols", () => {
		assert.equal(typeof commandHandlerBarrel.openCommunicateBox, "function");
		assert.equal(typeof commandHandlerBarrel.closeCommunicateBox, "function");
		assert.equal(
			typeof commandHandlerBarrel.initDefaultCommandHandlers,
			"function",
		);
		assert.equal(typeof commandHandlerBarrel.expandSakuraScriptEnv, "function");
		assert.equal(
			typeof commandHandlerBarrel.registerCommandHandler,
			"function",
		);
		assert.equal(typeof commandHandlerBarrel.getCommandHandler, "function");
	});

	it("ui/js/ghost/command-handler/system.js re-exports expected symbols", () => {
		assert.equal(
			typeof commandHandlerSystemFacade.handleExecuteResetBalloonPos,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleExecuteResetWindowPos,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetAlignmentOnDesktop,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetTaskTrayIcon,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetTrayBalloon,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleReloadShiori,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetShioriDebugMode,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetAlphaCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetPositionCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetPropertyCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleSetScalingCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleBiffCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleExecuteSntpCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleOpenSystemTarget,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.clearAllScriptTimers,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleNotifyCommand,
			"function",
		);
		assert.equal(
			typeof commandHandlerSystemFacade.handleTimerRaiseCommand,
			"function",
		);
	});

	it("ui/js/surface/animation/animation-playback.js re-exports expected symbols", () => {
		assert.equal(
			typeof animationPlaybackFacade._applyAnimationFrame,
			"function",
		);
		assert.equal(
			typeof animationPlaybackFacade._playAnimationPatterns,
			"function",
		);
		assert.equal(typeof animationPlaybackFacade._playOnePat, "function");
		assert.equal(
			typeof animationPlaybackFacade._playTimelineFrames,
			"function",
		);
		assert.equal(
			typeof animationPlaybackFacade.renderAnimationFrame,
			"function",
		);
		assert.equal(typeof animationPlaybackFacade.playAnimationById, "function");
		assert.equal(
			typeof animationPlaybackFacade.playAnimationPatterns,
			"function",
		);
		assert.equal(typeof animationPlaybackFacade.waitForAnimation, "function");
		assert.equal(typeof animationPlaybackFacade.onCharSpoken, "function");
		assert.equal(typeof animationPlaybackFacade.onScriptEnd, "function");
		assert.equal(typeof animationPlaybackFacade.onTalkEnd, "function");
		assert.equal(typeof animationPlaybackFacade.onTalkStart, "function");
	});

	it("ui/js/ui/renderers/modal-dialog-inputs.js re-exports expected symbols", () => {
		assert.equal(typeof modalDialogInputsFacade.attachAutocomplete, "function");
		assert.equal(typeof modalDialogInputsFacade.parseBoxOptions, "function");
		assert.equal(typeof modalDialogInputsFacade.openInputBox, "function");
		assert.equal(typeof modalDialogInputsFacade.openPasswordInput, "function");
		assert.equal(typeof modalDialogInputsFacade.closeInputBox, "function");
		assert.equal(typeof modalDialogInputsFacade.openTextAreaBox, "function");
		assert.equal(typeof modalDialogInputsFacade.closeTextAreaBox, "function");
		assert.equal(typeof modalDialogInputsFacade.openSliderInput, "function");
		assert.equal(typeof modalDialogInputsFacade.openDateInput, "function");
		assert.equal(typeof modalDialogInputsFacade.openTimeInput, "function");
		assert.equal(typeof modalDialogInputsFacade.openIpInput, "function");
	});

	it("ui/js/ui/renderers/inputs/advanced-inputs.js re-exports expected symbols", () => {
		assert.equal(typeof advancedInputsFacade.openSliderInput, "function");
		assert.equal(typeof advancedInputsFacade.openDateInput, "function");
		assert.equal(typeof advancedInputsFacade.openTimeInput, "function");
		assert.equal(typeof advancedInputsFacade.openIpInput, "function");
	});

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
