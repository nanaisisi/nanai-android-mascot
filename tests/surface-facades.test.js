import assert from "node:assert/strict";
import { describe, it } from "vitest";

import * as animationPlayback from "../ui/js/surface/animation/animation-playback.js";
import * as surfaceFacade from "../ui/js/surface/surface.js";
import * as surfaceCompositor from "../ui/js/surface/surface-compositor.js";
import * as surfaceParser from "../ui/js/surface/surface-parser.js";

describe("surface facade exports and integration", () => {
	it("ui/js/surface/surface.js exports core surface APIs", () => {
		assert.equal(typeof surfaceFacade.collisionContains, "function");
		assert.equal(typeof surfaceFacade.getShellManifest, "function");
		assert.equal(typeof surfaceFacade.manifestToSurfaceData, "function");
		assert.equal(typeof surfaceFacade.composeSurfaceElements, "function");
		assert.equal(typeof surfaceFacade.processChromaKey, "function");
		assert.equal(typeof surfaceFacade.SurfaceManager, "function");
		assert.equal(typeof surfaceFacade.expandSurfaceRange, "function");
		assert.equal(typeof surfaceFacade.parseSurfacesTxt, "function");

		// Functional test through facade
		const range = surfaceFacade.expandSurfaceRange("0-2");
		assert.deepEqual(range, ["0", "1", "2"]);

		const sm = new surfaceFacade.SurfaceManager({
			invokeTauri: async () => {},
		});
		assert.ok(sm);
		assert.equal(typeof sm.resolveSurfaceNumber, "function");
	});

	it("ui/js/surface/surface-compositor.js exports compositor methods and classes", () => {
		assert.equal(typeof surfaceCompositor.processChromaKey, "function");
		assert.equal(typeof surfaceCompositor.composeSurfaceElements, "function");
		assert.equal(typeof surfaceCompositor.compositeElements, "function");
		assert.equal(typeof surfaceCompositor.SurfaceFrameBuffer, "function");
		assert.equal(typeof surfaceCompositor.drawImageLayer, "function");
		assert.equal(typeof surfaceCompositor.drawLayer, "function");
		assert.equal(typeof surfaceCompositor.loadLayerImage, "function");

		const buffer = new surfaceCompositor.SurfaceFrameBuffer(10, 10);
		assert.equal(buffer.width, 10);
		assert.equal(buffer.height, 10);
	});

	it("ui/js/surface/surface-parser.js exports parser methods", () => {
		assert.equal(typeof surfaceParser.expandSurfaceRange, "function");
		assert.equal(typeof surfaceParser.handleBalloonOffset, "function");
		assert.equal(typeof surfaceParser.handlePoint, "function");
		assert.equal(typeof surfaceParser.parseSurfacesTxt, "function");

		// Test parseSurfacesTxt through surfaceParser
		const parsed = surfaceParser.parseSurfacesTxt(
			"surface0\n{\nelement0,overlay,base.png,0,0\n}\n",
		);
		assert.ok(parsed.elements["0"]);
		assert.equal(parsed.elements["0"].length, 1);
		assert.equal(parsed.elements["0"][0].file, "base.png");

		// Test handleBalloonOffset and handlePoint directly
		const offsets = {};
		surfaceParser.handleBalloonOffset("balloon.offsetx,15", ["0"], offsets);
		surfaceParser.handleBalloonOffset("balloon.offsety,25", ["0"], offsets);
		assert.equal(offsets["0"]["*"].x, 15);
		assert.equal(offsets["0"]["*"].y, 25);

		const points = {};
		surfaceParser.handlePoint("point.centerx,100", ["0"], points);
		assert.equal(points["0"].center_x, 100);
	});

	it("ui/js/surface/animation/animation-playback.js exports playback control and event handlers", () => {
		assert.equal(typeof animationPlayback.playAnimationById, "function");
		assert.equal(typeof animationPlayback.playAnimationPatterns, "function");
		assert.equal(typeof animationPlayback.waitForAnimation, "function");
		assert.equal(typeof animationPlayback.onCharSpoken, "function");
		assert.equal(typeof animationPlayback.onScriptEnd, "function");
		assert.equal(typeof animationPlayback.onTalkEnd, "function");
		assert.equal(typeof animationPlayback.onTalkStart, "function");
		assert.equal(typeof animationPlayback._applyAnimationFrame, "function");
		assert.equal(typeof animationPlayback._playAnimationPatterns, "function");
		assert.equal(typeof animationPlayback._playOnePat, "function");
		assert.equal(typeof animationPlayback._playTimelineFrames, "function");
		assert.equal(typeof animationPlayback.renderAnimationFrame, "function");
	});
});
