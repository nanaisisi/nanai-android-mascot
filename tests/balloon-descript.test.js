import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
const cssVars = {};
globalThis.document = {
	documentElement: {
		style: {
			setProperty(k, v) { cssVars[k] = v; },
			removeProperty(k) { delete cssVars[k]; },
		},
	},
	querySelector(sel) {
		return {
			style: {},
			setProperty(k, v) { this.style[k] = v; },
		};
	},
};

const { balloonDescriptActions } = await import(
	"../ui/js/core/actions/balloon-descript.js"
);

test("balloonDescriptActions covers rgbFromComponents and applyBalloonDescript for all UKADOC properties", () => {
	// 1. rgbFromComponents
	const rgb = balloonDescriptActions.rgbFromComponents(
		{ "font.color.r": "255", "font.color.g": "128", "font.color.b": "0" },
		"font.color",
	);
	assert.equal(rgb, "rgb(255, 128, 0)");

	const invalidRgb = balloonDescriptActions.rgbFromComponents({}, "font.color");
	assert.equal(invalidRgb, null);

	// 2. applyBalloonDescript null check
	balloonDescriptActions.applyBalloonDescript(null);

	// 3. applyBalloonDescript full properties test
	const mockInstance = {
		currentBalloonTheme: "ivory",
		balloonUserScale: 1.2,
		elements: { balloonDisplay: { style: {} } },
	};

	globalThis.__TAURI__ = {
		core: {
			convertFileSrc: (p) => `tauri://${p}`,
		},
	};

	const props = {
		dpi: "120",
		"communicatebox.width": "200",
		"communicatebox.height": "30",
		"communicatebox.x": "10",
		"communicatebox.y": "10",
		"communicatebox.font.name": "MS Gothic",
		"communicatebox.font.height": "12",
		"communicatebox.font.color.r": "0",
		"communicatebox.font.color.g": "0",
		"communicatebox.font.color.b": "0",
		"validrect.left": "10",
		"validrect.top": "10",
		"validrect.right": "10",
		"validrect.bottom": "10",
		"wordwrappoint.x": "300",
		"wordwrappoint.y": "150",
		"origin.x": "5",
		"origin.y": "10",
		"windowposition.x": "100",
		"windowposition.y": "200",
		"windowposition.limit": "1",
		"font.name": "Meiryo",
		"font.height": "14",
		"font.bold": "1",
		"font.italic": "true",
		"font.underline": "1",
		"font.strike": "1",
		"font.outline": "1",
		"font.color.r": "50",
		"font.color.g": "50",
		"font.color.b": "50",
		"font.shadowcolor.r": "200",
		"font.shadowcolor.g": "200",
		"font.shadowcolor.b": "200",
		"font.shadowstyle": "outline",
		"anchor.style": "square+underline",
		"anchor.font.color.r": "0",
		"anchor.font.color.g": "0",
		"anchor.font.color.b": "255",
		"anchor.visited.style": "underline",
		"anchor.visited.font.color.r": "128",
		"anchor.visited.font.color.g": "0",
		"anchor.visited.font.color.b": "128",
		"anchor.notselect.style": "none",
		"anchor.notselect.font.color.r": "100",
		"anchor.notselect.font.color.g": "100",
		"anchor.notselect.font.color.b": "100",
		"cursor.style": "square",
		"cursor.font.color.r": "255",
		"cursor.font.color.g": "0",
		"cursor.font.color.b": "0",
		"cursor.notselect.style": "none",
		"cursor.notselect.font.color.r": "80",
		"cursor.notselect.font.color.g": "80",
		"cursor.notselect.font.color.b": "80",
		"number.x": "10",
		"number.y": "20",
		"number.xr": "-10",
		"number.yb": "-20",
		"number.font.name": "Arial",
		"number.font.height": "12",
		"number.font.color.r": "10",
		"number.font.color.g": "10",
		"number.font.color.b": "10",
		"sstpmarker.x": "15",
		"sstpmarker.y": "25",
		"sstpmessage.x": "30",
		"sstpmessage.y": "40",
		"sstpmessage.xr": "-30",
		"sstpmessage.yb": "-40",
		"arrow.filename": "arrow.png",
		"clickwaitmarker.filename": "marker.png",
		"mousecursor.arrow": "cursor.cur",
		"arrow0.x": "5",
		"arrow0.y": "5",
		vertical: "1",
		"onlinemarker.interval": "5000",
		paint_transparent_region_black: "1",
		use_self_alpha: "true",
		use_input_alpha: "1",
		overlay_outside_balloon: "1",
	};

	balloonDescriptActions.applyBalloonDescript.call(mockInstance, props);

	assert.equal(cssVars["--balloon-dpi"], "120");
	assert.equal(cssVars["--balloon-font-family"], '"Meiryo", Meiryo, sans-serif');
	assert.equal(cssVars["--balloon-font-size"], "14px");
	assert.equal(cssVars["--balloon-font-outline"], "1");
	assert.equal(cssVars["--balloon-font-shadow-color"], "rgb(200, 200, 200)");
	assert.equal(cssVars["--balloon-font-shadow-style"], "outline");
	assert.equal(cssVars["--balloon-anchor-style"], "square+underline");
	assert.equal(cssVars["--balloon-anchor-visited-style"], "underline");
	assert.equal(cssVars["--balloon-anchor-notselect-style"], "none");
	assert.equal(cssVars["--balloon-cursor-style"], "square");
	assert.equal(cssVars["--balloon-number-x"], "10px");
	assert.equal(cssVars["--balloon-sstpmarker-x"], "15px");
	assert.equal(cssVars["--balloon-sstpmessage-x"], "30px");
	assert.equal(cssVars["--balloon-writing-mode"], "vertical-rl");
	assert.equal(cssVars["--balloon-paint-black"], "1");

	delete globalThis.__TAURI__;
	assert.ok(true);
});
