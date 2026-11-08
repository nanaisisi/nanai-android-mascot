import assert from "node:assert/strict";
import { test } from "vitest";
import { testApplyBalloonDescript } from "./all-properties/descript-test.js";
import { mockProps } from "./all-properties/mock-props.js";
import { testNullCheck } from "./all-properties/null-check.js";
import { testRgbFromComponents } from "./all-properties/rgb-color.js";
import { setupBalloonDescriptMockEnvironment } from "./helpers.js";

const { cssVars } = setupBalloonDescriptMockEnvironment();

const { balloonDescriptActions } = await import(
	"../../ui/js/core/actions/balloon-descript.js"
);

test("balloonDescriptActions covers rgbFromComponents and applyBalloonDescript for all UKADOC properties", () => {
	testRgbFromComponents(balloonDescriptActions);
	testNullCheck(balloonDescriptActions);
	testApplyBalloonDescript(balloonDescriptActions, mockProps, cssVars);
	assert.ok(true);
});
