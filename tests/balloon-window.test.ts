/**
 * @file balloon-window.test.ts
 * @brief BalloonWindow モジュールの統合・イベント連携テスト
 */

import assert from "node:assert/strict";
import { test } from "vitest";
import { setupBalloonMockEnvironment } from "./balloon-window/mock-balloon-env.js";

test("balloon-window covers interactive elements, theme/manifest loading, and Tauri scale/drag events", async () => {
	const env = setupBalloonMockEnvironment();

	const {
		updateBalloonWindowScale,
		setupInteractiveElements,
		setupWindowGestures,
	} = await import("../ui/js/ghost/balloon-window.js");
	const { updateBalloonWindowScale: updateScaleDirect } = await import(
		"../ui/js/ghost/balloon-window/scale.js"
	);
	const { setupInteractiveElements: setupInteractiveDirect } = await import(
		"../ui/js/ghost/balloon-window/interactive.js"
	);
	const { loadBalloonSkinImages, applyBalloonDescript } = await import(
		"../ui/js/ghost/balloon-window/theme.js"
	);
	const { setupWindowGestures: setupGesturesDirect } = await import(
		"../ui/js/ghost/balloon-window/gesture.js"
	);

	// Trigger DOMContentLoaded listener
	env.docListeners.DOMContentLoaded?.();

	const balloonBox = env.getEl("balloon-box");
	const balloonText = env.getEl("balloon-text");

	// 1. Test click & mousedown/mouseup on balloonBox
	balloonBox.click();
	balloonBox.mousedown();
	balloonBox.mouseup();

	// 2. Test update-balloon-content-0 listener
	if (env.listenHandlers["update-balloon-content-0"]) {
		await env.listenHandlers["update-balloon-content-0"]({
			payload: {
				html: '<button class="balloon-choice-btn" data-choice-id="choice1">Choice1</button><a class="balloon-anchor" data-anchor-id="anchor1">Anchor1</a>',
				theme: "ivory",
			},
		});
	}

	// Trigger choice and anchor clicks inside balloonText
	const choices = balloonText.querySelectorAll(".balloon-choice-btn");
	choices[0]?.click();

	const anchors = balloonText.querySelectorAll(".balloon-anchor");
	anchors[0]?.click();

	// 3. Test balloon-theme-changed listener
	if (env.listenHandlers["balloon-theme-changed"]) {
		await env.listenHandlers["balloon-theme-changed"]({
			payload: { theme: "dark" },
		});
	}

	// 4. Test balloon-scale-changed listener
	if (env.listenHandlers["balloon-scale-changed"]) {
		await env.listenHandlers["balloon-scale-changed"]({
			payload: { userScale: 1.5 },
		});
	}

	// 5. Test touch events
	balloonBox._listeners?.touchstart?.({
		touches: [{ clientX: 50, clientY: 50 }],
	});
	balloonBox._listeners?.touchstart?.({
		touches: [{ clientX: 50, clientY: 50 }],
	});
	balloonBox._listeners?.touchstart?.({
		touches: [
			{ clientX: 50, clientY: 50 },
			{ clientX: 150, clientY: 50 },
		],
	});
	balloonBox._listeners?.touchmove?.({
		touches: [
			{ clientX: 20, clientY: 50 },
			{ clientX: 180, clientY: 50 },
		],
	});
	balloonBox._listeners?.touchend?.({
		touches: [],
	});

	// 6. Test submodules directly
	const mockBox = { style: { transform: "", transformOrigin: "" } };
	const scaleResult = updateBalloonWindowScale(mockBox, 1.25, 0.8);
	assert.strictEqual(scaleResult, 1);
	const scaleResult2 = updateScaleDirect(mockBox, 1.5, 1.0);
	assert.strictEqual(scaleResult2, 1.5);
	assert.strictEqual(mockBox.style.transform, "scale(1.5)");
	updateScaleDirect(null, 1.0, 1.0);

	setupInteractiveElements(null, 0);
	const choiceBtn = {
		getAttribute: () => "choice_direct",
		textContent: "Direct Choice",
		addEventListener(_t: unknown, cb: unknown) {
			this._cb = cb;
		},
	};
	const anchorLink = {
		getAttribute: () => "anchor_direct",
		addEventListener(_t: unknown, cb: unknown) {
			this._cb = cb;
		},
	};
	const mockText = {
		querySelectorAll: (selector: string) => {
			if (selector === ".balloon-choice-btn") return [choiceBtn];
			if (selector === ".balloon-anchor") return [anchorLink];
			return [];
		},
	};
	setupInteractiveDirect(mockText, 1);
	choiceBtn._cb?.({ stopPropagation() {} });
	anchorLink._cb?.({ stopPropagation() {} });

	const loadedBg = await loadBalloonSkinImages("ivory", 0);
	assert.ok(loadedBg);
	const loadedKero = await loadBalloonSkinImages("ivory", 1);
	assert.ok(loadedKero);
	const loadedChar = await loadBalloonSkinImages("ivory", 2);
	assert.ok(loadedChar);

	let callbackDpi = 0;
	let callbackDontMove = null;
	const themeRes = await applyBalloonDescript({
		theme: "ivory",
		scopeId: 0,
		currentUserScale: 1.0,
		onDpiScaleChange: (dpi: number) => {
			callbackDpi = dpi;
		},
		onDontMoveChange: (dontMove: unknown) => {
			callbackDontMove = dontMove;
		},
	});
	assert.ok(themeRes);
	assert.strictEqual(callbackDpi, 0.8);
	assert.strictEqual(callbackDontMove, true);

	let userScaleState = 1.0;
	const mockGestureBox = {
		style: { transform: "", transformOrigin: "" },
		listeners: {},
		addEventListener(ev: string | number, cb: unknown) {
			this.listeners[ev] = cb;
		},
	};
	setupGesturesDirect(mockGestureBox, {
		scopeId: 0,
		getIsBalloonDontMove: () => false,
		getUserScale: () => userScaleState,
		getDpiScale: () => 1.0,
		onUserScaleChange: (s: number) => {
			userScaleState = s;
		},
	});
	mockGestureBox.listeners.click();
	mockGestureBox.listeners.mousedown({ button: 0 });
	mockGestureBox.listeners.mouseup();
	mockGestureBox.listeners.touchstart({
		touches: [{ clientX: 10, clientY: 10 }],
	});
	mockGestureBox.listeners.touchstart({
		touches: [{ clientX: 10, clientY: 10 }],
	});
	assert.strictEqual(userScaleState, 1.25);
	const requestScaleEvent = env.emittedEvents.find(
		(e) =>
			e.event === "request-balloon-scale-change" &&
			e.payload?.userScale === 1.25,
	);
	assert.ok(requestScaleEvent);

	mockGestureBox.listeners.touchstart({
		touches: [
			{ clientX: 10, clientY: 10 },
			{ clientX: 110, clientY: 10 },
		],
	});
	mockGestureBox.listeners.touchmove({
		touches: [
			{ clientX: 10, clientY: 10 },
			{ clientX: 160, clientY: 10 },
		],
	});
	mockGestureBox.listeners.touchend({ touches: [] });
	const pinchRequestEvent = env.emittedEvents.find(
		(e) =>
			e.event === "request-balloon-scale-change" && e.payload?.userScale > 1.25,
	);
	assert.ok(pinchRequestEvent);
	setupWindowGestures(null, {});

	delete globalThis.__TAURI__;
	delete globalThis.__TAURI_INTERNALS__;
	env.docListeners.DOMContentLoaded?.();
	const nonTauriThemeRes = await applyBalloonDescript({
		theme: "ivory",
		scopeId: 0,
		currentUserScale: 1.0,
	});
	assert.strictEqual(nonTauriThemeRes, null);

	assert.ok(true);
});
