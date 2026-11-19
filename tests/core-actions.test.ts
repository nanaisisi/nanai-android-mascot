import assert from "node:assert/strict";
import { test } from "vitest";

import { balloonActions } from "../ui/ts/core/actions/balloon-actions.js";
import { balloonDescriptActions } from "../ui/ts/core/actions/balloon-descript.js";
import { balloonThemeActions } from "../ui/ts/core/actions/balloon-theme.js";
import { ghostActions } from "../ui/ts/core/actions/ghost-actions.js";
import { networkActions } from "../ui/ts/core/actions/network-actions.js";

test("balloonActions test", () => {
	assert.ok(balloonActions.applyBalloonDescript);
	assert.ok(balloonActions.setBalloonTheme);
});

test("balloonDescriptActions test", () => {
	const setPropertyCalls: Array<[string, string]> = [];
	globalThis.document = {
		documentElement: {
			style: {
				setProperty(k: string, v: string) {
					setPropertyCalls.push([k, v]);
				},
				removeProperty() {
					return "";
				},
			},
		},
		querySelector: () => ({ style: {} }),
	} as unknown as Document;
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

	const descriptHost =
		balloonDescriptActions as typeof balloonDescriptActions & {
			elements?: {
				balloonDisplay: {
					style: { setProperty: (k: string, v: string) => void };
				};
			};
		};
	descriptHost.elements = {
		balloonDisplay: {
			style: {
				setProperty(k: string, v: string) {
					setPropertyCalls.push([k, v]);
				},
			},
		},
	};
	balloonDescriptActions.applyBalloonDescript(props);
	assert.ok(setPropertyCalls.length > 0);
});

test("balloonThemeActions test", async () => {
	globalThis.document = {
		documentElement: {
			style: {
				setProperty() {},
				removeProperty() {
					return "";
				},
			},
			setAttribute() {},
		},
		body: { className: "" },
		querySelector: () => ({ style: {} }),
	} as unknown as Document;
	globalThis.localStorage = {
		setItem() {},
		getItem() {
			return null;
		},
	} as unknown as Storage;

	const themeHost = balloonThemeActions as typeof balloonThemeActions & {
		elements?: {
			balloonDisplay: {
				setAttribute: () => void;
				style: Record<string, string>;
			};
		};
		showBalloon?: () => void;
		hideBalloon?: () => void;
	};
	themeHost.elements = {
		balloonDisplay: {
			setAttribute() {},
			style: {},
		},
	};
	themeHost.showBalloon = () => {};
	themeHost.hideBalloon = () => {};

	// 1. Calling when balloonThemeManager is null
	delete (balloonThemeActions as unknown as Record<string, unknown>)
		.balloonThemeManager;
	balloonThemeActions.cycleBalloonTheme();

	delete (balloonThemeActions as unknown as Record<string, unknown>)
		.balloonThemeManager;
	balloonThemeActions.applyBalloonScaleAction("balloon-scale-100");

	delete (balloonThemeActions as unknown as Record<string, unknown>)
		.balloonThemeManager;
	await balloonThemeActions.setBalloonTheme("ivory");

	delete (balloonThemeActions as unknown as Record<string, unknown>)
		.balloonThemeManager;
	await balloonThemeActions.scanBalloons();

	delete (balloonThemeActions as unknown as Record<string, unknown>)
		.balloonThemeManager;
	balloonThemeActions.resetBalloonDescript();

	// 2. Calling when balloonThemeManager is already instantiated
	balloonThemeActions.cycleBalloonTheme();
	balloonThemeActions.applyBalloonScaleAction("balloon-scale-100");
	await balloonThemeActions.setBalloonTheme("ivory");
	await balloonThemeActions.scanBalloons();
	balloonThemeActions.resetBalloonDescript();

	assert.ok(true);
});

test("ghostActions test", () => {
	const modalContent = {
		innerHTML: "",
		querySelector: () => ({ addEventListener() {} }),
	};
	const modalOverlay = { style: {} };
	const ghostHost = ghostActions as typeof ghostActions & {
		ghostController?: Record<string, unknown>;
		modalManager?: Record<string, unknown>;
		elements?: Record<string, unknown>;
		showBalloon?: () => void;
		hideBalloon?: () => void;
		hideMenu?: () => void;
	};
	ghostHost.ghostController = {
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
	ghostHost.modalManager = {
		content: modalContent,
		overlay: modalOverlay,
		showWindowIfNeeded() {},
		hide() {},
	};
	ghostHost.elements = {
		ghostDisplay: { style: {} },
	};
	ghostHost.showBalloon = () => {};
	ghostHost.hideBalloon = () => {};
	ghostHost.hideMenu = () => {};

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
