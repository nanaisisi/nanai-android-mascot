import assert from "node:assert/strict";
import { test } from "vitest";

globalThis.window = globalThis;
const cssVars = {};
globalThis.document = {
	documentElement: {
		style: {
			setProperty(k, v) {
				cssVars[k] = v;
			},
			removeProperty(k) {
				delete cssVars[k];
			},
		},
	},
	querySelector(_sel) {
		return {
			style: {},
			setProperty(k, v) {
				this.style[k] = v;
			},
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
		"validrect.top": "12",
		"validrect.right": "14",
		"validrect.bottom": "16",
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
		"anchor.blendmethod": "overlay",
		"anchor.pen.color.r": "10",
		"anchor.pen.color.g": "20",
		"anchor.pen.color.b": "30",
		"anchor.brush.color.r": "40",
		"anchor.brush.color.g": "50",
		"anchor.brush.color.b": "60",
		"cursor.blendmethod": "multiply",
		"cursor.pen.color.r": "70",
		"cursor.pen.color.g": "80",
		"cursor.pen.color.b": "90",
		"cursor.brush.color.r": "100",
		"cursor.brush.color.g": "110",
		"cursor.brush.color.b": "120",
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
		mousecursor: "mousecursor.cur",
		"mousecursor.arrow": "cursor.cur",
		"arrow0.x": "5",
		"arrow0.y": "5",
		vertical: "1",
		"onlinemarker.interval": "5000",
		paint_transparent_region_black: "1",
		use_self_alpha: "true",
		use_input_alpha: "1",
		overlay_outside_balloon: "1",
		"anchor.font.shadowcolor.r": "11",
		"anchor.font.shadowcolor.g": "22",
		"anchor.font.shadowcolor.b": "33",
		"anchor.font.shadowstyle": "underline",
		"anchor.visited.font.shadowcolor.r": "44",
		"anchor.visited.font.shadowcolor.g": "55",
		"anchor.visited.font.shadowcolor.b": "66",
		"anchor.visited.font.shadowstyle": "outline",
		"anchor.visited.pen.color.r": "15",
		"anchor.visited.pen.color.g": "25",
		"anchor.visited.pen.color.b": "35",
		"anchor.visited.brush.color.r": "45",
		"anchor.visited.brush.color.g": "55",
		"anchor.visited.brush.color.b": "65",
		"anchor.notselect.font.shadowcolor.r": "77",
		"anchor.notselect.font.shadowcolor.g": "88",
		"anchor.notselect.font.shadowcolor.b": "99",
		"anchor.notselect.font.shadowstyle": "square",
		"anchor.notselect.pen.color.r": "12",
		"anchor.notselect.pen.color.g": "24",
		"anchor.notselect.pen.color.b": "36",
		"anchor.notselect.brush.color.r": "48",
		"anchor.notselect.brush.color.g": "60",
		"anchor.notselect.brush.color.b": "72",
		"cursor.font.shadowcolor.r": "101",
		"cursor.font.shadowcolor.g": "102",
		"cursor.font.shadowcolor.b": "103",
		"cursor.font.shadowstyle": "outline",
		"cursor.notselect.font.shadowcolor.r": "104",
		"cursor.notselect.font.shadowcolor.g": "105",
		"cursor.notselect.font.shadowcolor.b": "106",
		"cursor.notselect.font.shadowstyle": "none",
		"cursor.notselect.pen.color.r": "17",
		"cursor.notselect.pen.color.g": "27",
		"cursor.notselect.pen.color.b": "37",
		"cursor.notselect.brush.color.r": "47",
		"cursor.notselect.brush.color.g": "57",
		"cursor.notselect.brush.color.b": "67",
		"balloon.dontmove": "1",
		"balloon.syncscale": "true",
		"sakura.balloon.alignment": "left,bottom",
		"sakura.balloon.offsetx": "25",
		"sakura.balloon.offsety": "-15",
	};

	balloonDescriptActions.applyBalloonDescript.call(mockInstance, props);

	assert.equal(cssVars["--balloon-dpi"], "120");
	assert.equal(
		cssVars["--balloon-font-family"],
		'"Meiryo", Meiryo, sans-serif',
	);
	assert.equal(cssVars["--balloon-font-size"], "14px");
	assert.equal(cssVars["--balloon-font-outline"], "1");
	assert.equal(cssVars["--balloon-font-shadow-color"], "rgb(200, 200, 200)");
	assert.equal(cssVars["--balloon-font-shadowstyle"], "outline");
	assert.equal(cssVars["--balloon-anchor-style"], "square+underline");
	assert.equal(cssVars["--balloon-anchor-visited-style"], "underline");
	assert.equal(cssVars["--balloon-anchor-notselect-style"], "none");
	assert.equal(cssVars["--balloon-cursor-style"], "square");
	assert.equal(cssVars["--balloon-anchor-blendmethod"], "overlay");
	assert.equal(cssVars["--balloon-anchor-pen-color"], "rgb(10, 20, 30)");
	assert.equal(cssVars["--balloon-anchor-brush-color"], "rgb(40, 50, 60)");
	assert.equal(cssVars["--balloon-anchor-shadow-color"], "rgb(11, 22, 33)");
	assert.equal(cssVars["--balloon-anchor-shadow-style"], "underline");
	assert.equal(
		cssVars["--balloon-anchor-visited-shadow-color"],
		"rgb(44, 55, 66)",
	);
	assert.equal(cssVars["--balloon-anchor-visited-shadow-style"], "outline");
	assert.equal(
		cssVars["--balloon-anchor-visited-pen-color"],
		"rgb(15, 25, 35)",
	);
	assert.equal(
		cssVars["--balloon-anchor-visited-brush-color"],
		"rgb(45, 55, 65)",
	);
	assert.equal(
		cssVars["--balloon-anchor-notselect-shadow-color"],
		"rgb(77, 88, 99)",
	);
	assert.equal(cssVars["--balloon-anchor-notselect-shadow-style"], "square");
	assert.equal(
		cssVars["--balloon-anchor-notselect-pen-color"],
		"rgb(12, 24, 36)",
	);
	assert.equal(
		cssVars["--balloon-anchor-notselect-brush-color"],
		"rgb(48, 60, 72)",
	);

	assert.equal(cssVars["--balloon-cursor-blendmethod"], "multiply");
	assert.equal(cssVars["--balloon-cursor-pen-color"], "rgb(70, 80, 90)");
	assert.equal(cssVars["--balloon-cursor-brush-color"], "rgb(100, 110, 120)");
	assert.equal(cssVars["--balloon-cursor-shadow-color"], "rgb(101, 102, 103)");
	assert.equal(cssVars["--balloon-cursor-shadow-style"], "outline");
	assert.equal(
		cssVars["--balloon-cursor-notselect-shadow-color"],
		"rgb(104, 105, 106)",
	);
	assert.equal(cssVars["--balloon-cursor-notselect-shadow-style"], "none");
	assert.equal(
		cssVars["--balloon-cursor-notselect-pen-color"],
		"rgb(17, 27, 37)",
	);
	assert.equal(
		cssVars["--balloon-cursor-notselect-brush-color"],
		"rgb(47, 57, 67)",
	);

	assert.equal(cssVars["--balloon-number-x"], "10px");
	assert.equal(cssVars["--balloon-sstpmarker-x"], "15px");
	assert.equal(cssVars["--balloon-sstpmessage-x"], "30px");
	assert.equal(cssVars["--balloon-writing-mode"], "vertical-rl");
	assert.equal(cssVars["--balloon-paint-black"], "1");
	assert.equal(cssVars["--balloon-dontmove"], "1");
	assert.equal(cssVars["--balloon-syncscale"], "1");
	assert.equal(cssVars["--balloon-alignment"], "left,bottom");
	assert.equal(cssVars["--balloon-offset-x"], "25px");
	assert.equal(cssVars["--balloon-offset-y"], "-15px");
	assert.equal(mockInstance.balloonDontMove, true);
	assert.equal(mockInstance.balloonSyncScale, true);
	assert.equal(mockInstance.balloonAlignment, "left,bottom");

	// 9-slice tokens validation
	assert.equal(cssVars["--balloon-border-image-slice"], "12 14 16 10 fill");
	assert.equal(cssVars["--balloon-border-image-width"], "12px 14px 16px 10px");
	assert.equal(cssVars["--balloon-border-image-repeat"], "repeat");

	delete globalThis.__TAURI__;
	assert.ok(true);
});

test("balloonDescriptActions applyAssetProperties handles non-Tauri environment (fallback path)", () => {
	delete globalThis.__TAURI__;
	const mockInstance = {
		currentBalloonTheme: "default",
		elements: { balloonDisplay: { style: {} } },
	};
	const props = {
		mousecursor: "test.cur",
	};
	balloonDescriptActions.applyBalloonDescript.call(mockInstance, props);
	assert.equal(
		cssVars["--balloon-cursor-default"],
		'url("assets/balloon/default/test.cur"), auto',
	);
});

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
