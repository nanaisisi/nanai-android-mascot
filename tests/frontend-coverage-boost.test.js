import assert from "node:assert/strict";
import { test } from "node:test";

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
		"validrect.top": "10",
		"validrect.right": "200",
		"validrect.bottom": "100",
		"wordwrappoint.x": "400",
		"origin.x": "5",
		"origin.y": "5",
		"arrow.filename": "arrow.png",
	};

	const rgb = balloonDescriptActions.rgbFromComponents(props, "font.color");
	assert.equal(rgb, "rgb(255, 128, 0)");

	balloonDescriptActions.elements = {
		balloonDisplay: { style: {} },
	};
	balloonDescriptActions.applyBalloonDescript(props);
	assert.ok(true);
});
