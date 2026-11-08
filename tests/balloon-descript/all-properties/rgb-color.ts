import assert from "node:assert/strict";

export function testRgbFromComponents(balloonDescriptActions: any) {
	const rgb = balloonDescriptActions.rgbFromComponents(
		{ "font.color.r": "255", "font.color.g": "128", "font.color.b": "0" },
		"font.color",
	);
	assert.equal(rgb, "rgb(255, 128, 0)");

	const invalidRgb = balloonDescriptActions.rgbFromComponents({}, "font.color");
	assert.equal(invalidRgb, null);
}
