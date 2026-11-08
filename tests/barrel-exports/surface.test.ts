import assert from "node:assert/strict";
import { describe, it } from "vitest";
import * as animationPlaybackFacade from "../../ui/js/surface/animation/animation-playback.js";
import * as surfaceFacade from "../../ui/js/surface/surface.js";
import * as surfaceCompositorFacade from "../../ui/js/surface/surface-compositor.js";

describe("Surface Barrel and Facade Re-exports Coverage", () => {
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
});
