import assert from "node:assert/strict";
import { beforeEach, describe, it, vi } from "vitest";

globalThis.window = globalThis;

import {
	BalloonThemeManager,
	balloonThemeActions,
} from "../ui/js/core/actions/balloon-theme.js";
import * as tauriHelper from "../ui/js/core/tauri-helper.js";

describe("BalloonThemeManager & balloonThemeActions (Slot-10)", () => {
	let cssVars = {};
	let docAttrs = {};
	let mockEl = null;

	beforeEach(() => {
		cssVars = {};
		docAttrs = {};
		mockEl = {
			style: {
				transform: "",
				transformOrigin: "",
				padding: "",
				maxWidth: "",
				borderImage: "",
				setProperty(k, v) {
					cssVars[k] = v;
				},
				removeProperty(k) {
					delete cssVars[k];
				},
			},
			setAttribute(k, v) {
				docAttrs[k] = v;
			},
		};

		globalThis.document = {
			documentElement: {
				setAttribute(k, v) {
					docAttrs[k] = v;
				},
				getAttribute(k) {
					return docAttrs[k];
				},
				style: {
					setProperty(k, v) {
						cssVars[k] = v;
					},
					removeProperty(k) {
						delete cssVars[k];
					},
				},
			},
			body: {
				className: "",
				style: {},
			},
			querySelector(sel) {
				if (sel === ".balloon") return mockEl;
				return null;
			},
		};

		globalThis.localStorage = {
			_data: {},
			getItem(k) {
				return this._data[k] || null;
			},
			setItem(k, v) {
				this._data[k] = String(v);
			},
			removeItem(k) {
				delete this._data[k];
			},
		};
	});

	it("initializes BalloonThemeManager with default or app properties", () => {
		const mgr = new BalloonThemeManager();
		assert.equal(mgr.currentTheme, "default");
		assert.equal(mgr.userScale, 1);
		assert.equal(mgr.dpiScale, 1);

		const customApp = {
			currentBalloonTheme: "dark",
			balloonUserScale: 1.5,
			balloonDpiScale: 1.25,
			availableBalloons: [{ dir_name: "custom_skin", name: "Custom Skin" }],
		};
		const mgrCustom = new BalloonThemeManager(customApp);
		assert.equal(mgrCustom.currentTheme, "dark");
		assert.equal(mgrCustom.userScale, 1.5);
		assert.equal(mgrCustom.dpiScale, 1.25);
		assert.equal(mgrCustom.availableBalloons.length, 1);
	});

	it("computes 9-slice border-image tokens correctly based on validrect", () => {
		const mgr = new BalloonThemeManager();
		const nineSlice = mgr.computeNineSlice(
			{
				"validrect.left": "20",
				"validrect.top": "24",
				"validrect.right": "20",
				"validrect.bottom": "28",
			},
			"assets/balloon/test.png",
		);

		assert.equal(nineSlice.source, "assets/balloon/test.png");
		assert.equal(nineSlice.slice, "24 20 28 20 fill");
		assert.equal(nineSlice.width, "24px 20px 28px 20px");
		assert.equal(nineSlice.repeat, "repeat");
		assert.ok(nineSlice.cssBorderImage.includes("url("));

		// Fallback when values are missing or NaN
		const fallback = mgr.computeNineSlice({});
		assert.equal(fallback.slice, "16 16 16 16 fill");
		assert.equal(fallback.width, "16px 16px 16px 16px");

		// Test cache hit and cache clearing
		const cached = mgr.computeNineSlice(
			{
				"validrect.left": "20",
				"validrect.top": "24",
				"validrect.right": "20",
				"validrect.bottom": "28",
			},
			"assets/balloon/test.png",
		);
		assert.strictEqual(cached, nineSlice);

		mgr.clearNineSliceCache();
		assert.strictEqual(mgr._nineSliceCache.size, 0);

		const afterClear = mgr.computeNineSlice(
			{
				"validrect.left": "20",
				"validrect.top": "24",
				"validrect.right": "20",
				"validrect.bottom": "28",
			},
			"assets/balloon/test.png",
		);
		assert.notStrictEqual(afterClear, nineSlice);
		assert.deepStrictEqual(afterClear, nineSlice);
	});

	it("cycles balloon themes correctly with default and custom lists", () => {
		let shownMessage = "";
		const mockApp = {
			currentBalloonTheme: "nam_default_plus",
			showBalloon(msg) {
				shownMessage = msg;
			},
			hideBalloon() {},
		};
		const mgr = new BalloonThemeManager(mockApp);

		const next1 = mgr.cycleTheme();
		assert.equal(next1, "nam_default_plus_overhead");
		assert.equal(mgr.currentTheme, "nam_default_plus_overhead");
		assert.equal(mockApp.currentBalloonTheme, "nam_default_plus_overhead");
		assert.ok(shownMessage.includes("NAMデフォルト+(頭上)"));

		// Custom list
		mgr.availableBalloons = [
			{ dir_name: "themeA", name: "Theme Alpha" },
			{ dir_name: "themeB", name: "Theme Beta" },
		];
		mgr.currentTheme = "themeA";
		const nextCustom = mgr.cycleTheme();
		assert.equal(nextCustom, "themeB");
		assert.ok(shownMessage.includes("Theme Beta"));
	});

	it("applies balloon scale with numeric and action inputs and dispatches OnBalloonScaling", () => {
		let scalingEvent = null;
		let scalingNotifyArgs = null;
		const mockApp = {
			balloonUserScale: 1,
			balloonDpiScale: 1,
			ghostController: {
				sendShioriEvent(event, args) {
					scalingEvent = { event, args };
				},
				sendBalloonScalingNotify(afterX, beforeX, afterY, beforeY) {
					scalingNotifyArgs = { afterX, beforeX, afterY, beforeY };
				},
			},
			showBalloon() {},
			hideBalloon() {},
		};
		const mgr = new BalloonThemeManager(mockApp);

		const res1 = mgr.applyScale("balloon-scale-150");
		assert.equal(res1.scale, 1.5);
		assert.equal(res1.percent, 150);
		assert.equal(cssVars["--balloon-user-scale"], "1.5");
		assert.equal(mockEl.style.transform, "scale(1.5)");
		assert.deepEqual(scalingNotifyArgs, {
			afterX: 150,
			beforeX: 100,
			afterY: 150,
			beforeY: 100,
		});

		// Fallback to sendShioriEvent if sendBalloonScalingNotify is not available
		delete mockApp.ghostController.sendBalloonScalingNotify;
		const res2 = mgr.applyScale(2);
		assert.equal(res2.scale, 2);
		assert.equal(res2.percent, 200);
		assert.deepEqual(scalingEvent, {
			event: "OnBalloonScaling",
			args: ["200", "150", "200", "150"],
		});
	});

	it("resets descript properties properly", () => {
		const mockApp = {
			balloonDpiScale: 1.25,
			balloonUserScale: 1.5,
			elements: { balloonDisplay: { style: {} } },
		};
		const mgr = new BalloonThemeManager(mockApp);
		cssVars["--balloon-font-family"] = "Arial";
		cssVars["--balloon-border-image-slice"] = "16 16 16 16 fill";

		mgr.resetDescript();
		assert.equal(cssVars["--balloon-font-family"], undefined);
		assert.equal(cssVars["--balloon-border-image-slice"], undefined);
		assert.equal(mockApp.balloonDpiScale, 1);
		assert.equal(mgr.dpiScale, 1);
	});

	it("delegates balloonThemeActions to BalloonThemeManager preserving backward compatibility", async () => {
		const app = {
			...balloonThemeActions,
			currentBalloonTheme: "nam_default_plus",
			balloonUserScale: 1,
			balloonDpiScale: 1,
			availableBalloons: [],
			showBalloon() {},
			hideBalloon() {},
		};

		app.cycleBalloonTheme();
		assert.equal(app.currentBalloonTheme, "nam_default_plus_overhead");
		assert.ok(app.balloonThemeManager instanceof BalloonThemeManager);

		app.applyBalloonScaleAction("balloon-scale-125");
		assert.equal(app.balloonUserScale, 1.25);

		await app.scanBalloons();
		assert.ok(app.balloonThemeManager instanceof BalloonThemeManager);

		app.resetBalloonDescript();
		assert.equal(app.balloonDpiScale, 1);
	});

	it("listens to request-balloon-scale-change when Tauri is available", async () => {
		let listenHandler = null;
		vi.spyOn(tauriHelper, "isTauriAvailable").mockReturnValue(true);
		vi.spyOn(tauriHelper, "listen").mockImplementation(
			async (eventName, handler) => {
				if (eventName === "request-balloon-scale-change") {
					listenHandler = handler;
				}
				return () => {};
			},
		);
		vi.spyOn(tauriHelper, "emit").mockResolvedValue();

		const mockApp = { balloonUserScale: 1, showBalloon() {}, hideBalloon() {} };
		new BalloonThemeManager(mockApp);
		await Promise.resolve();
		assert.ok(listenHandler);

		await listenHandler({ payload: { userScale: 1.75 } });
		await listenHandler({ payload: { userScale: "invalid" } });
		await listenHandler({ payload: { userScale: 0 } });

		vi.restoreAllMocks();
	});

	it("handles scanBalloons error catch block gracefully", async () => {
		vi.spyOn(tauriHelper, "isTauriAvailable").mockReturnValue(true);
		vi.spyOn(tauriHelper, "invoke").mockRejectedValue(new Error("scan fail"));

		const mgr = new BalloonThemeManager();
		const result = await mgr.scanBalloons();
		assert.deepEqual(result, []);

		vi.restoreAllMocks();
	});
});
