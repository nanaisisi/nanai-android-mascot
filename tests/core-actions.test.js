import assert from "node:assert/strict";
import { test } from "vitest";

import { balloonActions } from "../ui/js/core/actions/balloon-actions.js";
import { balloonDescriptActions } from "../ui/js/core/actions/balloon-descript.js";
import { balloonThemeActions } from "../ui/js/core/actions/balloon-theme.js";
import { ghostActions } from "../ui/js/core/actions/ghost-actions.js";
import { networkActions } from "../ui/js/core/actions/network-actions.js";

test("balloonActions test", () => {
	assert.ok(balloonActions.applyBalloonDescript);
	assert.ok(balloonActions.setBalloonTheme);
});

test("balloonDescriptActions test", () => {
	const setPropertyCalls = [];
	globalThis.document = {
		documentElement: {
			style: {
				setProperty(k, v) {
					setPropertyCalls.push([k, v]);
				},
				removeProperty() {},
			},
		},
		querySelector: () => ({ style: {} }),
	};
	const props = {
		"font.color.r": "100",
		"font.color.g": "150",
		"font.color.b": "200",
		dpi: "96",
		"font.name": "Arial",
		"font.height": "12",
		"font.bold": "0",
		"font.italic": "false",
		"font.underline": "0",
		"font.strike": "false",
		"validrect.left": "5",
		"validrect.top": "5",
		"validrect.right": "100",
		"validrect.bottom": "50",
		"wordwrappoint.x": "300",
		"origin.x": "2",
		"origin.y": "2",
		"arrow.filename": "",
	};

	const rgb = balloonDescriptActions.rgbFromComponents(props, "font.color");
	assert.equal(rgb, "rgb(100, 150, 200)");

	const nullRgb = balloonDescriptActions.rgbFromComponents({}, "font.color");
	assert.equal(nullRgb, null);

	balloonDescriptActions.elements = {
		balloonDisplay: {
			style: {
				setProperty(k, v) {
					setPropertyCalls.push([k, v]);
				},
			},
		},
	};
	balloonDescriptActions.applyBalloonDescript(props);
	assert.ok(setPropertyCalls.length > 0);
});

test("balloonThemeActions test", () => {
	globalThis.document = {
		documentElement: {
			style: {
				setProperty() {},
				removeProperty() {},
			},
			setAttribute() {},
		},
		body: { className: "" },
		querySelector: () => ({ style: {} }),
	};
	globalThis.localStorage = {
		setItem() {},
		getItem() {
			return null;
		},
	};

	balloonThemeActions.elements = {
		balloonDisplay: {
			setAttribute() {},
			style: {},
		},
	};
	balloonThemeActions.showBalloon = () => {};
	balloonThemeActions.hideBalloon = () => {};

	balloonThemeActions.cycleBalloonTheme();
	balloonThemeActions.applyBalloonScaleAction("balloon-scale-100");
	balloonThemeActions.resetBalloonDescript();
});

test("ghostActions test", () => {
	const modalContent = {
		innerHTML: "",
		querySelector: () => ({ addEventListener() {} }),
	};
	const modalOverlay = { style: {} };
	ghostActions.ghostController = {
		currentGhost: {
			name: "TestGhost",
			version: "1.0",
			sakura_name: "Sakura",
			kero_name: "Kero",
			shiori: "yaya",
			craftman: "Author",
			craftman_url: "http://example.com",
			path: "/ghost/path",
		},
		ghosts: [{ name: "TestGhost" }, { name: "OtherGhost" }],
		selectGhost() {},
		sendShioriEvent() {},
	};
	ghostActions.modalManager = {
		content: modalContent,
		overlay: modalOverlay,
		showWindowIfNeeded() {},
		hide() {},
	};
	ghostActions.elements = {
		ghostDisplay: { style: {} },
	};
	ghostActions.showBalloon = () => {};
	ghostActions.hideBalloon = () => {};
	ghostActions.hideMenu = () => {};

	ghostActions.showGhostInformation();
	assert.ok(modalContent.innerHTML.includes("TestGhost"));

	ghostActions.recordRecentGhost("TestGhost");
	ghostActions.switchToNextGhost();
	ghostActions.applyShellScaleAction("scale-100");
	ghostActions.minimizeApp();
});

test("networkActions test", () => {
	assert.ok(networkActions);
});
