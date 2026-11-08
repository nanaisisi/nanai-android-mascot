import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyAssetProperties } from "../../ui/js/core/actions/balloon-descript/assets.js";
import { applyBaseFontProperties } from "../../ui/js/core/actions/balloon-descript/font/base.js";
import { applySpecialFontProperties } from "../../ui/js/core/actions/balloon-descript/font/special.js";

describe("core-coverage-boost: balloon-descript edge cases (font & assets)", () => {
	it("applyBaseFontProperties handles font.size pt-to-px, styles, decorations, outline, and shadow", () => {
		const styleMap = new Map();
		const mockRoot = {
			style: {
				setProperty: (k, v) => styleMap.set(k, v),
			},
		};

		const props = {
			id: "custom-balloon",
			"font.name": "Courier New",
			"font.size": "12", // pt
			"font.bold": "true",
			"font.italic": "1",
			"font.underline": "1",
			"font.strike": "true",
			"font.outline": "1",
			"font.color.r": "255",
			"font.color.g": "128",
			"font.color.b": "64",
			"font.shadowcolor.r": "10",
			"font.shadowcolor.g": "20",
			"font.shadowcolor.b": "30",
			"font.shadowstyle": "drop",
		};

		applyBaseFontProperties(mockRoot, props);

		assert.equal(styleMap.get("--balloon-id"), "custom-balloon");
		assert.equal(
			styleMap.get("--balloon-font-family"),
			'"Courier New", Meiryo, sans-serif',
		);
		assert.equal(styleMap.get("--balloon-font-size"), "16px"); // 12 * 96 / 72 = 16px
		assert.equal(styleMap.get("--balloon-font-weight"), "bold");
		assert.equal(styleMap.get("--balloon-font-style"), "italic");
		assert.equal(
			styleMap.get("--balloon-text-decoration"),
			"underline line-through",
		);
		assert.equal(styleMap.get("--balloon-font-outline"), "1");
		assert.equal(styleMap.get("--balloon-text-color"), "rgb(255, 128, 64)");
		assert.equal(
			styleMap.get("--balloon-font-shadow-color"),
			"rgb(10, 20, 30)",
		);
		assert.equal(styleMap.get("--balloon-font-shadow-style"), "drop");
	});

	it("applySpecialFontProperties handles number, sstp, and disable font properties", () => {
		const styleMap = new Map();
		const mockRoot = {
			style: {
				setProperty: (k, v) => styleMap.set(k, v),
			},
		};

		const props = {
			"cursor.font.color": "rgb(200, 200, 200)",
			"cursor.color.font": "rgb(10, 10, 10)",
			"number.font.name": "Impact",
			"number.font.height": "24",
			"number.font.color.r": "100",
			"number.font.color.g": "150",
			"number.font.color.b": "200",
			"sstpmessage.font.name": "Consolas",
			"sstpmessage.font.height": "14",
			"sstpmessage.font.color.r": "50",
			"sstpmessage.font.color.g": "60",
			"sstpmessage.font.color.b": "70",
			"disable.font": "gray",
		};

		applySpecialFontProperties(mockRoot, props);

		assert.equal(styleMap.get("--balloon-highlight-bg"), "rgb(200, 200, 200)");
		assert.equal(styleMap.get("--balloon-highlight-text"), "rgb(10, 10, 10)");
		assert.equal(
			styleMap.get("--balloon-number-font-family"),
			'"Impact", sans-serif',
		);
		assert.equal(styleMap.get("--balloon-number-font-size"), "24px");
		assert.equal(styleMap.get("--balloon-number-color"), "rgb(100, 150, 200)");
		assert.equal(
			styleMap.get("--balloon-sstp-font-family"),
			'"Consolas", sans-serif',
		);
		assert.equal(styleMap.get("--balloon-sstp-font-size"), "14px");
		assert.equal(styleMap.get("--balloon-sstp-font-color"), "rgb(50, 60, 70)");
		assert.equal(styleMap.get("--balloon-disable-font"), "gray");
	});

	it("applyAssetProperties handles markers, coordinates, alpha options, and vertical writing mode", () => {
		const styleMap = new Map();
		const mockRoot = {
			style: {
				setProperty: (k, v) => styleMap.set(k, v),
			},
		};
		const instance = { currentBalloonTheme: "test-theme" };

		const props = {
			readme: "readme.txt",
			"readme.charset": "UTF-8",
			"recommended.ghost": "Nanai",
			"recommended.ghost.path": "/path/nanai",
			"arrow.filename": "arrow_skin.png",
			"arrow0.x": "12",
			"arrow0.y": "34",
			"arrow1.x": "56",
			"arrow1.y": "78",
			"clickwaitmarker.filename": "clickwait.png",
			"clickwaitmarker.x": "5",
			"clickwaitmarker.y": "6",
			"sstpmarker.filename": "sstp.png",
			"sstpmarker.x": "7",
			"sstpmarker.y": "8",
			vertical: "1",
			"onlinemarker.interval": "500",
			"onlinemarker.x": "15",
			"onlinemarker.y": "25",
			"sstpmessage.x": "100",
			"sstpmessage.y": "200",
			paint_transparent_region_black: "1",
			use_self_alpha: "1",
			use_input_alpha: "1",
			overlay_outside_balloon: "1",
			cursor: "cursor.png",
			"mousecursor.arrow": "cur_arrow.png",
		};

		applyAssetProperties(mockRoot, props, instance);

		assert.equal(styleMap.get("--balloon-readme"), "readme.txt");
		assert.equal(styleMap.get("--balloon-readme-charset"), "UTF-8");
		assert.equal(styleMap.get("--balloon-recommended-ghost"), "Nanai");
		assert.equal(styleMap.get("--balloon-arrow0-x"), "12px");
		assert.equal(styleMap.get("--balloon-arrow0-y"), "34px");
		assert.equal(styleMap.get("--balloon-arrow1-x"), "56px");
		assert.equal(styleMap.get("--balloon-arrow1-y"), "78px");
		assert.equal(styleMap.get("--balloon-clickwait-x"), "5px");
		assert.equal(styleMap.get("--balloon-sstpmarker-x"), "7px");
		assert.equal(styleMap.get("--balloon-writing-mode"), "vertical-rl");
		assert.equal(instance.onlineMarkerInterval, 500);
		assert.equal(styleMap.get("--balloon-online-x"), "15px");
		assert.equal(styleMap.get("--balloon-sstpmessage-x"), "100px");
		assert.equal(styleMap.get("--balloon-paint-black"), "1");
		assert.equal(styleMap.get("--balloon-use-self-alpha"), "1");
		assert.equal(styleMap.get("--balloon-use-input-alpha"), "1");
		assert.equal(styleMap.get("--balloon-overlay-outside"), "1");
	});
});
