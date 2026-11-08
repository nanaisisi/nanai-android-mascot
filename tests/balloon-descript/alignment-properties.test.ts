import assert from "node:assert/strict";
import { test } from "vitest";
import { setupBalloonDescriptMockEnvironment } from "./helpers.js";

const { cssVars } = setupBalloonDescriptMockEnvironment();

const { balloonDescriptActions } = await import(
	"../../ui/js/core/actions/balloon-descript.js"
);

test("applyAlignmentProperties covers edge cases (empty/missing offsets, invalid numbers, kero/balloon fallback keys, and dontmove/syncscale variations)", () => {
	const mockInstance = {
		currentBalloonTheme: "default",
		elements: { balloonDisplay: { style: {} } },
		balloonDontMove: false,
		balloonSyncScale: false,
		balloonAlignment: "",
	};
	const props = {
		"balloon.dontmove": "true",
		"balloon.syncscale": "1",
		"kero.balloon.alignment": "right,top",
		"kero.balloon.offsetx": "",
		"kero.balloon.offsety": "invalid_num",
	};
	balloonDescriptActions.applyBalloonDescript.call(mockInstance, props);
	assert.equal(cssVars["--balloon-dontmove"], "1");
	assert.equal(cssVars["--balloon-syncscale"], "1");
	assert.equal(cssVars["--balloon-alignment"], "right,top");

	const props2 = {
		"balloon.offsetx": "50",
		"balloon.offsety": "-30",
		"sakura.balloon.dontmove": "false",
		"sakura.balloon.syncscale": "false",
	};
	balloonDescriptActions.applyBalloonDescript.call(mockInstance, props2);
	assert.equal(cssVars["--balloon-offset-x"], "50px");
	assert.equal(cssVars["--balloon-offset-y"], "-30px");
	assert.equal(cssVars["--balloon-dontmove"], "0");
	assert.equal(cssVars["--balloon-syncscale"], "0");
});
