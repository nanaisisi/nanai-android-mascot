import assert from "node:assert/strict";
import { test } from "vitest";
import { setupBalloonDescriptMockEnvironment } from "./helpers.js";

const { cssVars } = setupBalloonDescriptMockEnvironment();

const { balloonDescriptActions } = await import(
	"../../ui/js/core/actions/balloon-descript.js"
);

test("applyBaseFontProperties covers default font size and component-based color/shadowcolor fallbacks", () => {
	const mockInstance = {
		currentBalloonTheme: "default",
		elements: { balloonDisplay: { style: {} } },
	};
	const props = {
		"font.color.r": "100",
		"font.color.g": "150",
		"font.color.b": "200",
		"font.shadowcolor.r": "10",
		"font.shadowcolor.g": "20",
		"font.shadowcolor.b": "30",
	};
	balloonDescriptActions.applyBalloonDescript.call(mockInstance, props);
	assert.equal(cssVars["--balloon-font-size"], "12px");
	assert.equal(cssVars["--balloon-text-color"], "rgb(100, 150, 200)");
	assert.equal(cssVars["--balloon-font-shadow-color"], "rgb(10, 20, 30)");
});

test("applyGroupProperties covers shadowstyle fallback, blendmethod, pen.color, brush.color, and missing branches", () => {
	const mockInstance = {
		currentBalloonTheme: "default",
		elements: { balloonDisplay: { style: {} } },
	};
	const props = {
		"anchor.shadowstyle": "underline",
		"anchor.blendmethod": "normal",
		"anchor.pen.color": "rgb(1, 2, 3)",
		"anchor.brush.color": "rgb(4, 5, 6)",
	};
	balloonDescriptActions.applyBalloonDescript.call(mockInstance, props);
	assert.equal(cssVars["--balloon-anchor-shadow-style"], "underline");
	assert.equal(cssVars["--balloon-anchor-blendmethod"], "normal");
	assert.equal(cssVars["--balloon-anchor-pen-color"], "rgb(1, 2, 3)");
	assert.equal(cssVars["--balloon-anchor-brush-color"], "rgb(4, 5, 6)");

	balloonDescriptActions.applyBalloonDescript.call(mockInstance, {});
	assert.ok(true);
});
