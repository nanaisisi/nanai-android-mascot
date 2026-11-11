import assert from "node:assert/strict";
import { test } from "vitest";

const { BalloonThemeManager } = await import(
	"../../ui/ts/core/actions/balloon-theme.js"
);

test("BalloonThemeManager computeNineSlice snapshot calculation and CSS border properties", () => {
	const mgr = new BalloonThemeManager();

	// 1. Valid 9-slice calculation with custom borders
	const props = {
		"validrect.left": "15",
		"validrect.top": "20",
		"validrect.right": "85",
		"validrect.bottom": "80",
	};
	const slice = mgr.computeNineSlice(props, "http://mock/balloon-bg.png");

	assert.ok(slice);
	assert.equal(slice.source, "http://mock/balloon-bg.png");
	assert.equal(slice.slice, "20 85 80 15 fill");
	assert.equal(slice.width, "20px 85px 80px 15px");
	assert.equal(slice.repeat, "repeat");
	assert.equal(
		slice.cssBorderImage,
		'url("http://mock/balloon-bg.png") 20 85 80 15 fill / 20px 85px 80px 15px repeat',
	);

	// 2. Default fallback when no validrect is provided
	const defaultSlice = mgr.computeNineSlice({}, null);
	assert.ok(defaultSlice);
	assert.equal(defaultSlice.slice, "16 16 16 16 fill");
	assert.equal(defaultSlice.width, "16px 16px 16px 16px");
	assert.equal(defaultSlice.cssBorderImage, "");

	// 3. Fallback when invalid/negative coordinates are given
	const invalidProps = {
		"validrect.left": "invalid",
		"validrect.top": "-5",
		"border.repeat": "stretch",
	};
	const fallbackSlice = mgr.computeNineSlice(invalidProps, "bg.png");
	assert.equal(fallbackSlice.slice, "16 16 16 16 fill");
	assert.equal(fallbackSlice.repeat, "stretch");
	assert.equal(
		fallbackSlice.cssBorderImage,
		'url("bg.png") 16 16 16 16 fill / 16px 16px 16px 16px stretch',
	);
});
