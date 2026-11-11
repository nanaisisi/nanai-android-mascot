import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyAssetProperties } from "../ui/ts/core/actions/balloon-descript/assets.js";
import { BalloonThemeManager } from "../ui/ts/core/actions/balloon-theme.js";
import { MENU_CAPTION_DEFINITIONS } from "../ui/ts/ui/renderers/menu-caption-renderer.js";

describe("Balloon Skin & Typography Cycle 6 Features (Slot-10)", () => {
	it("sets writing mode property correctly for vertical: 1 and resets properly", () => {
		const cssVars = {};
		const mockRoot = {
			style: {
				setProperty(k, v) {
					cssVars[k] = v;
				},
				removeProperty(k) {
					delete cssVars[k];
				},
			},
		};

		// 1. Horizontal by default / vertical: 0
		applyAssetProperties(mockRoot, { vertical: "0" }, {});
		assert.equal(cssVars["--balloon-writing-mode"], "horizontal-tb");

		// 2. Vertical: 1
		applyAssetProperties(mockRoot, { vertical: "1" }, {});
		assert.equal(cssVars["--balloon-writing-mode"], "vertical-rl");

		// 3. Vertical: true
		applyAssetProperties(mockRoot, { vertical: "true" }, {});
		assert.equal(cssVars["--balloon-writing-mode"], "vertical-rl");

		// 4. Reset descript cleans up writing-mode
		const mgr = new BalloonThemeManager();
		globalThis.document = {
			documentElement: mockRoot,
			body: { className: "", style: {} },
			querySelector() {
				return null;
			},
		};
		mgr.resetDescript();
		assert.equal(cssVars["--balloon-writing-mode"], undefined);
	});

	it("includes extended balloon caption definitions in MENU_CAPTION_DEFINITIONS", () => {
		const expectedResources = [
			"enableballoonmovebutton.caption",
			"balloonhistorybutton.caption",
			"rateofuseballoonbutton.caption",
			"debugballoonbutton.caption",
		];

		for (const res of expectedResources) {
			const found = MENU_CAPTION_DEFINITIONS.find((d) => d.resource === res);
			assert.ok(found, `Expected definition for resource: ${res}`);
			assert.ok(found.id, `Expected ID for ${res}`);
			assert.ok(found.fallback, `Expected fallback text for ${res}`);
		}
	});
});
