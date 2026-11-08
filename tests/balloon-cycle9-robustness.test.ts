import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyBaseFontProperties } from "../ui/ts/core/actions/balloon-descript/font/base.js";
import { applyAlignmentProperties } from "../ui/ts/core/actions/balloon-descript/layout/alignment.js";
import { rgbFromComponents } from "../ui/ts/core/actions/balloon-descript/utils.js";
import {
	BalloonThemeManager,
	MAX_BALLOON_SCALE,
	MIN_BALLOON_SCALE,
} from "../ui/ts/core/actions/balloon-theme.js";

describe("Balloon Skin & Typography Cycle 9 Robustness (Slot-10)", () => {
	describe("Color parsing and clamping (utils.ts)", () => {
		it("parses individual .r, .g, .b components with clamping", () => {
			const props = {
				"font.color.r": "300",
				"font.color.g": "-50",
				"font.color.b": "128",
			};
			const res = rgbFromComponents(props, "font.color");
			assert.equal(res, "rgb(255, 0, 128)");
		});

		it("parses comma-separated 'r, g, b' string in base property with clamping", () => {
			const props = {
				"font.shadowcolor": "256, -10, 50",
			};
			const res = rgbFromComponents(props, "font.shadowcolor");
			assert.equal(res, "rgb(255, 0, 50)");
		});

		it("parses 'rgb(r, g, b)' format with clamping", () => {
			const props = {
				"cursor.color": "rgb(999, 100, 200)",
			};
			const res = rgbFromComponents(props, "cursor.color");
			assert.equal(res, "rgb(255, 100, 200)");
		});

		it("returns null for malformed or missing color specifications", () => {
			assert.equal(rgbFromComponents({}, "font.color"), null);
			assert.equal(
				rgbFromComponents({ "font.color": "invalid" }, "font.color"),
				null,
			);
		});
	});

	describe("Font shadow & outline mapping (font/base.ts)", () => {
		it("maps outline font.shadowstyle to CSS text-shadow outline rules", () => {
			const cssVars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty(k: string, v: string) {
						cssVars[k] = v;
					},
				},
			};

			applyBaseFontProperties(mockRoot, {
				"font.shadowcolor": "100, 100, 100",
				"font.shadowstyle": "outline",
			});

			assert.equal(
				cssVars["--balloon-font-shadow-color"],
				"rgb(100, 100, 100)",
			);
			assert.ok(
				cssVars["--balloon-text-shadow"].includes(
					"1px 1px 0 rgb(100, 100, 100)",
				),
			);
			assert.ok(
				cssVars["--balloon-text-shadow"].includes(
					"-1px -1px 0 rgb(100, 100, 100)",
				),
			);
		});

		it("maps underline font.shadowstyle to CSS bottom shadow rules", () => {
			const cssVars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty(k: string, v: string) {
						cssVars[k] = v;
					},
				},
			};

			applyBaseFontProperties(mockRoot, {
				"font.shadowcolor": "0, 0, 0",
				"font.shadowstyle": "underline",
			});

			assert.equal(cssVars["--balloon-text-shadow"], "0 1px 0 rgb(0, 0, 0)");
		});

		it("maps font.outline to --balloon-font-outline and --balloon-text-stroke", () => {
			const cssVars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty(k: string, v: string) {
						cssVars[k] = v;
					},
				},
			};

			applyBaseFontProperties(mockRoot, {
				"font.outline": "1",
			});

			assert.equal(cssVars["--balloon-font-outline"], "1");
			assert.ok(cssVars["--balloon-text-stroke"].includes("1px var"));
		});
	});

	describe("Multi-character scope alignment and offsets (layout/alignment.ts)", () => {
		it("resolves char<ID>.balloon.* alignment and offset when scopeId matches", () => {
			const cssVars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty(k: string, v: string) {
						cssVars[k] = v;
					},
				},
			};
			const instanceContext = {
				scopeId: 2,
				balloonAlignment: "",
			};

			applyAlignmentProperties(
				mockRoot,
				{
					"char2.balloon.alignment": "overhead",
					"char2.balloon.offsetx": "55",
					"char2.balloon.offsety": "-120",
					"char2.balloon.dontmove": "1",
					"char2.balloon.syncscale": "1",
				},
				instanceContext,
			);

			assert.equal(instanceContext.balloonAlignment, "overhead");
			assert.equal(instanceContext.balloonDontMove, true);
			assert.equal(instanceContext.balloonSyncScale, true);
			assert.equal(cssVars["--balloon-valign"], "top");
			assert.equal(cssVars["--balloon-halign"], "center");
			assert.equal(cssVars["--balloon-offset-x"], "55px");
			assert.equal(cssVars["--balloon-offset-y"], "-120px");
		});

		it("maps left/right/bottom alignment correctly", () => {
			const cssVars: Record<string, string> = {};
			const mockRoot = {
				style: {
					setProperty(k: string, v: string) {
						cssVars[k] = v;
					},
				},
			};

			applyAlignmentProperties(
				mockRoot,
				{ "balloon.alignment": "left" },
				{ scopeId: 0 },
			);
			assert.equal(cssVars["--balloon-halign"], "left");

			applyAlignmentProperties(
				mockRoot,
				{ "balloon.alignment": "bottom" },
				{ scopeId: 0 },
			);
			assert.equal(cssVars["--balloon-valign"], "bottom");
			assert.equal(cssVars["--balloon-halign"], "center");
		});
	});

	describe("Scale clamping & 9-slice cache telemetry (balloon-theme.ts)", () => {
		it("clamps scales exceeding MIN or MAX bounds", () => {
			const mgr = new BalloonThemeManager();

			// 1. Extreme low scale
			const low = mgr.applyScale(0.01);
			assert.equal(low.scale, MIN_BALLOON_SCALE);

			// 2. Extreme high scale
			const high = mgr.applyScale(10.0);
			assert.equal(high.scale, MAX_BALLOON_SCALE);

			// 3. NaN or invalid input defaults to 1.0
			const invalid = mgr.applyScale("invalid");
			assert.equal(invalid.scale, 1.0);
		});

		it("tracks nineSliceCacheSize and hasNineSliceCache properly", () => {
			const mgr = new BalloonThemeManager();
			assert.equal(mgr.nineSliceCacheSize, 0);

			mgr.computeNineSlice({
				"validrect.left": "10",
				"validrect.top": "12",
				"validrect.right": "10",
				"validrect.bottom": "12",
				"border.repeat": "stretch",
				"balloon.image": "test.png",
			});

			assert.equal(mgr.nineSliceCacheSize, 1);
			assert.equal(mgr.hasNineSliceCache("12_10_12_10_stretch_test.png"), true);
			assert.equal(mgr.hasNineSliceCache("non_existent"), false);

			mgr.clearNineSliceCache();
			assert.equal(mgr.nineSliceCacheSize, 0);
		});
	});
});
