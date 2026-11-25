import { describe, expect, it } from "vitest";
import {
	getAlignmentToDesktop,
	getSerikoDpi,
	getSerikoDpiScale,
	getSerikoStickyWindows,
	getSerikoZOrder,
	isSerikoCrossfadeDisabled,
} from "../ui/ts/surface/shell-manifest.js";
import { SurfaceManager } from "../ui/ts/surface/surface-manager.js";

describe("seriko shell descript helpers", () => {
	it("getSerikoDpi returns 96 when unset or invalid, and parses positive integers", () => {
		expect(getSerikoDpi(null)).toBe(96);
		expect(getSerikoDpi(undefined)).toBe(96);
		expect(getSerikoDpi({ descript: { properties: {} } })).toBe(96);
		expect(
			getSerikoDpi({ descript: { properties: { "seriko.dpi": "144" } } }),
		).toBe(144);
		expect(
			getSerikoDpi({ descript: { properties: { "seriko.dpi": " 192 " } } }),
		).toBe(192);
		expect(
			getSerikoDpi({ descript: { properties: { "seriko.dpi": "0" } } }),
		).toBe(96);
		expect(
			getSerikoDpi({ descript: { properties: { "seriko.dpi": "-96" } } }),
		).toBe(96);
		expect(
			getSerikoDpi({ descript: { properties: { "seriko.dpi": "abc" } } }),
		).toBe(96);
	});

	it("getSerikoDpiScale computes 96 / dpi", () => {
		expect(getSerikoDpiScale(null)).toBe(1);
		expect(
			getSerikoDpiScale({ descript: { properties: { "seriko.dpi": "192" } } }),
		).toBe(0.5);
		expect(
			getSerikoDpiScale({ descript: { properties: { "seriko.dpi": "144" } } }),
		).toBeCloseTo(96 / 144);
	});

	it("isSerikoCrossfadeDisabled detects 1 or true case-insensitively", () => {
		expect(
			isSerikoCrossfadeDisabled({
				descript: { properties: { "seriko.force_disable_crossfade": "1" } },
			}),
		).toBe(true);
		expect(
			isSerikoCrossfadeDisabled({
				descript: { properties: { "seriko.force_disable_crossfade": "true" } },
			}),
		).toBe(true);
		expect(
			isSerikoCrossfadeDisabled({
				descript: { properties: { "seriko.force_disable_crossfade": "TRUE" } },
			}),
		).toBe(true);
		expect(
			isSerikoCrossfadeDisabled({
				descript: { properties: { "seriko.force_disable_crossfade": "0" } },
			}),
		).toBe(false);
		expect(
			isSerikoCrossfadeDisabled({
				descript: { properties: { "seriko.force_disable_crossfade": "false" } },
			}),
		).toBe(false);
		expect(isSerikoCrossfadeDisabled(null)).toBe(false);
	});

	it("getSerikoZOrder parses unique non-negative scope IDs", () => {
		expect(
			getSerikoZOrder({
				descript: { properties: { "seriko.zorder": "1, 0, 2, 1" } },
			}),
		).toEqual([1, 0, 2]);
		expect(
			getSerikoZOrder({
				descript: { properties: { "seriko.zorder": "abc, -1, 3" } },
			}),
		).toEqual([3]);
		expect(getSerikoZOrder(null)).toEqual([]);
	});

	it("getSerikoStickyWindows parses unique non-negative scope IDs", () => {
		expect(
			getSerikoStickyWindows({
				descript: { properties: { "seriko.sticky-window": "0,1" } },
			}),
		).toEqual([0, 1]);
		expect(
			getSerikoStickyWindows({
				descript: { properties: { "seriko.sticky-window": "2, 0, 2" } },
			}),
		).toEqual([2, 0]);
		expect(getSerikoStickyWindows(null)).toEqual([]);
	});

	it("getAlignmentToDesktop resolves per-scope keys and falls back to seriko.alignmenttodesktop", () => {
		const manifest = {
			descript: {
				properties: {
					"sakura.seriko.alignmenttodesktop": "bottom",
					"kero.seriko.alignmenttodesktop": "top",
					"char2.seriko.alignmenttodesktop": "free",
					"seriko.alignmenttodesktop": "left",
				},
			},
		};
		expect(getAlignmentToDesktop(manifest, 0)).toBe("bottom");
		expect(getAlignmentToDesktop(manifest, 1)).toBe("top");
		expect(getAlignmentToDesktop(manifest, 2)).toBe("free");
		expect(getAlignmentToDesktop(manifest, 3)).toBe("left");
		expect(getAlignmentToDesktop(null, 0)).toBeUndefined();
	});

	it("SurfaceManager exposes seriko.* shell descript helpers from shellManifest", () => {
		const sm = new SurfaceManager();
		sm.shellManifest = {
			directory: "shell/master",
			descript: {
				properties: {
					"seriko.dpi": "144",
					"seriko.force_disable_crossfade": "1",
					"seriko.zorder": "1, 0",
					"seriko.sticky-window": "0, 1",
					"sakura.seriko.alignmenttodesktop": "bottom",
					"seriko.alignmenttodesktop": "free",
				},
			},
		};

		expect(sm.getSerikoDpi()).toBe(144);
		expect(sm.getSerikoDpiScale()).toBeCloseTo(96 / 144);
		expect(sm.isSerikoCrossfadeDisabled()).toBe(true);
		expect(sm.getSerikoZOrder()).toEqual([1, 0]);
		expect(sm.getSerikoStickyWindows()).toEqual([0, 1]);
		expect(sm.getAlignmentToDesktop(0)).toBe("bottom");
		expect(sm.getAlignmentToDesktop(1)).toBe("free");
	});
});
