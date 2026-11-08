import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyGroupProperties } from "../ui/ts/core/actions/balloon-descript/font/group.js";
import {
	BalloonThemeManager,
	computeNineSliceLayout,
} from "../ui/ts/core/actions/balloon-theme.js";

describe("Balloon Skin & Typography Cycle 10 Enhancements (Slot-10)", () => {
	describe("Scope-aware 9-slice caching and management", () => {
		it("computes distinct cache keys for different scopeId values", () => {
			const cache = new Map();
			const props = {
				"validrect.left": "10",
				"validrect.top": "14",
				"validrect.right": "10",
				"validrect.bottom": "14",
				"border.repeat": "stretch",
			};

			const scope0 = computeNineSliceLayout(cache, props, "balloons0.png", 0);
			const scope1 = computeNineSliceLayout(cache, props, "balloonk0.png", 1);
			const scope2 = computeNineSliceLayout(cache, props, "balloonp2.png", 2);

			assert.ok(scope0);
			assert.ok(scope1);
			assert.ok(scope2);
			assert.equal(scope0.scopeId, 0);
			assert.equal(scope1.scopeId, 1);
			assert.equal(scope2.scopeId, 2);

			// scope 0 uses backward-compatible key
			assert.equal(scope0.cacheKey, "14_10_14_10_stretch_balloons0.png");
			// scope 1 and 2 use scope-prefixed keys
			assert.equal(scope1.cacheKey, "scope1_14_10_14_10_stretch_balloonk0.png");
			assert.equal(scope2.cacheKey, "scope2_14_10_14_10_stretch_balloonp2.png");

			assert.equal(cache.size, 3);
		});

		it("allows selective clearing of 9-slice cache by scopeId", () => {
			const mgr = new BalloonThemeManager();
			mgr.computeNineSlice(
				{
					"validrect.left": "8",
					"validrect.top": "8",
					"validrect.right": "8",
					"validrect.bottom": "8",
				},
				"balloons0.png",
				0,
			);
			mgr.computeNineSlice(
				{
					"validrect.left": "12",
					"validrect.top": "12",
					"validrect.right": "12",
					"validrect.bottom": "12",
				},
				"balloonk0.png",
				1,
			);
			mgr.computeNineSlice(
				{
					"validrect.left": "16",
					"validrect.top": "16",
					"validrect.right": "16",
					"validrect.bottom": "16",
				},
				"balloonp2.png",
				2,
			);

			assert.equal(mgr.nineSliceCacheSize, 3);

			// Clear only scope 1 entries
			mgr.clearNineSliceCache(1);
			assert.equal(mgr.nineSliceCacheSize, 2);
			assert.equal(
				mgr.hasNineSliceCache("scope1_12_12_12_12_repeat_balloonk0.png"),
				false,
			);
			assert.ok(mgr.getNineSliceCache("8_8_8_8_repeat_balloons0.png"));
			assert.ok(
				mgr.getNineSliceCache("scope2_16_16_16_16_repeat_balloonp2.png"),
			);

			// Clear all
			mgr.clearNineSliceCache();
			assert.equal(mgr.nineSliceCacheSize, 0);
		});
	});

	describe("Anchor and cursor style decoration derivation (font/group.ts)", () => {
		it("derives underline decoration tokens for underline style", () => {
			const cssVars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty(k: string, v: string) {
						cssVars[k] = v;
					},
				},
			};

			applyGroupProperties(
				mockRoot,
				{
					"anchor.style": "underline",
					"anchor.font.color": "10, 20, 30",
				},
				"anchor",
				"--balloon-anchor",
			);

			assert.equal(cssVars["--balloon-anchor-style"], "underline");
			assert.equal(cssVars["--balloon-anchor-text-decoration"], "underline");
			assert.equal(cssVars["--balloon-anchor-box-style"], "none");
			assert.equal(cssVars["--balloon-anchor-color"], "rgb(10, 20, 30)");
		});

		it("derives box style tokens for square / box style", () => {
			const cssVars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty(k: string, v: string) {
						cssVars[k] = v;
					},
				},
			};

			applyGroupProperties(
				mockRoot,
				{
					"cursor.style": "square",
					"cursor.pen.color": "50, 100, 150",
				},
				"cursor",
				"--balloon-cursor",
			);

			assert.equal(cssVars["--balloon-cursor-style"], "square");
			assert.equal(cssVars["--balloon-cursor-text-decoration"], "none");
			assert.equal(cssVars["--balloon-cursor-box-style"], "solid");
			assert.equal(cssVars["--balloon-cursor-pen-color"], "rgb(50, 100, 150)");
		});

		it("derives none decoration tokens when style is none or 0", () => {
			const cssVars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty(k: string, v: string) {
						cssVars[k] = v;
					},
				},
			};

			applyGroupProperties(
				mockRoot,
				{
					"anchor.style": "none",
				},
				"anchor",
				"--balloon-anchor",
			);

			assert.equal(cssVars["--balloon-anchor-style"], "none");
			assert.equal(cssVars["--balloon-anchor-text-decoration"], "none");
			assert.equal(cssVars["--balloon-anchor-box-style"], "none");
		});

		it("derives fill decoration tokens for fill style", () => {
			const cssVars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty(k: string, v: string) {
						cssVars[k] = v;
					},
				},
			};

			applyGroupProperties(
				mockRoot,
				{
					"cursor.style": "fill",
					"cursor.brush.color": "200, 220, 240",
				},
				"cursor",
				"--balloon-cursor",
			);

			assert.equal(cssVars["--balloon-cursor-style"], "fill");
			assert.equal(cssVars["--balloon-cursor-text-decoration"], "none");
			assert.equal(cssVars["--balloon-cursor-box-style"], "fill");
			assert.equal(
				cssVars["--balloon-cursor-brush-color"],
				"rgb(200, 220, 240)",
			);
		});
	});
});
