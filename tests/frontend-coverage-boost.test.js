import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
globalThis.document = {
	documentElement: { style: { setProperty() {} } },
	querySelector: () => ({ style: {} }),
};

const { balloonDescriptActions } = await import("../ui/js/core/actions/balloon-descript.js");

test("balloonDescriptActions rgbFromComponents and applyBalloonDescript", () => {
	const props = {
		"font.color.r": "255",
		"font.color.g": "128",
		"font.color.b": "0",
		dpi: "120",
		"font.name": "Meiryo",
		"font.height": "14",
		"font.bold": "1",
		"font.italic": "true",
		"font.underline": "1",
		"font.strike": "true",
		"validrect.left": "10",
		"validrect.right": "200",
		"validrect.bottom": "100",
		"wordwrappoint.x": "400",
		"origin.x": "5",
		"origin.y": "5",
		"arrow.filename": "arrow.png",
		"arrow0.x": "12",
		"arrow0.y": "24",
		"clickwaitmarker.x": "50",
		"clickwaitmarker.y": "60",
		vertical: "1",
		"windowposition.x": "100",
		"windowposition.y": "200",
	};

	const rgb = balloonDescriptActions.rgbFromComponents(props, "font.color");
	assert.equal(rgb, "rgb(255, 128, 0)");

	assert.equal(balloonDescriptActions.rgbFromComponents({ "font.color.g": "128", "font.color.b": "0" }, "font.color"), null);
	assert.equal(balloonDescriptActions.rgbFromComponents({ "font.color.r": "255", "font.color.b": "0" }, "font.color"), null);
	assert.equal(balloonDescriptActions.rgbFromComponents({ "font.color.r": "255", "font.color.g": "128" }, "font.color"), null);
	assert.equal(balloonDescriptActions.rgbFromComponents({ "font.color.r": "abc", "font.color.g": "128", "font.color.b": "0" }, "font.color"), null);
	assert.equal(balloonDescriptActions.rgbFromComponents({ "font.color.r": "255", "font.color.g": "abc", "font.color.b": "0" }, "font.color"), null);
	assert.equal(balloonDescriptActions.rgbFromComponents({ "font.color.r": "255", "font.color.g": "128", "font.color.b": "abc" }, "font.color"), null);

	balloonDescriptActions.elements = {
		balloonDisplay: { style: {} },
	};
	balloonDescriptActions.applyBalloonDescript(props);
	assert.ok(true);
});
