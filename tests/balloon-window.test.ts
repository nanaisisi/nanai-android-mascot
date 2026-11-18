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
	} = await import("../ui/ts/ghost/balloon-window.js");
	const { updateBalloonWindowScale: updateScaleDirect } = await import(
		"../ui/ts/ghost/balloon-window/scale.js"
	);
	const { setupInteractiveElements: setupInteractiveDirect } = await import(
		"../ui/ts/ghost/balloon-window/interactive.js"
	);
	const { loadBalloonSkinImages, applyBalloonDescript } = await import(
		"../ui/ts/ghost/balloon-window/theme.js"
	);
	const { setupWindowGestures: setupGesturesDirect } = await import(
		"../ui/ts/ghost/balloon-window/gesture.js"
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

type MockStyle = {
	setProperty: (name: string, val: string) => void;
	getPropertyValue: (name: string) => string;
	removeProperty: (name: string) => void;
	[key: string]: unknown;
};

function createAttrMockElement() {
	const attrs: Record<string, string> = {};
	const listeners: Record<string, ((e: unknown) => void)[]> = {};
	const styleStorage: Record<string, string> = {};
	const style = new Proxy(styleStorage, {
		get(target, prop: string) {
			if (prop === "setProperty") {
				return (name: string, val: string) => {
					target[name] = val;
				};
			}
			if (prop === "getPropertyValue") {
				return (name: string) => target[name] ?? "";
			}
			if (prop === "removeProperty") {
				return (name: string) => {
					delete target[name];
				};
			}
			return target[prop] ?? "";
		},
		set(target, prop: string, val: string) {
			target[prop] = val;
			return true;
		},
	}) as unknown as MockStyle;

	return {
		attrs,
		listeners,
		dataset: {} as Record<string, string>,
		innerHTML: "",
		textContent: "",
		scrollTop: 0,
		clientHeight: 0,
		scrollHeight: 0,
		style,
		setAttribute(name: string, value: string) {
			attrs[name] = value;
		},
		getAttribute(name: string) {
			return attrs[name] ?? null;
		},
		removeAttribute(name: string) {
			delete attrs[name];
		},
		addEventListener(type: string, cb: (e: unknown) => void) {
			if (!listeners[type]) listeners[type] = [];
			listeners[type].push(cb);
		},
		dispatch(type: string, event: Record<string, unknown> = {}) {
			for (const cb of listeners[type] || []) {
				cb(event);
			}
		},
		querySelectorAll: () => [],
	};
}

function enhanceMockElement(el: Record<string, unknown>) {
	const attrs: Record<string, string> = {};
	const enhanced = el as Record<string, unknown> & {
		attrs: Record<string, string>;
		dataset: Record<string, string>;
		setAttribute: (name: string, value: string) => void;
		getAttribute: (name: string) => string | null;
		removeAttribute: (name: string) => void;
	};
	enhanced.attrs = attrs;
	enhanced.dataset = {};
	enhanced.setAttribute = (name: string, value: string) => {
		attrs[name] = value;
	};
	enhanced.getAttribute = (name: string) => attrs[name] ?? null;
	enhanced.removeAttribute = (name: string) => {
		delete attrs[name];
	};
	return enhanced;
}

test("setupBalloonScroll handles wheel scroll, arrow clicks, and arrow visibility updates", async () => {
	setupBalloonMockEnvironment();
	const { setupBalloonScroll, updateBalloonScrollArrows } = await import(
		"../ui/ts/ghost/balloon-window.js"
	);

	const arrowUp = createAttrMockElement();
	const arrowDown = createAttrMockElement();
	const balloonText = createAttrMockElement();
	balloonText.scrollTop = 0;
	balloonText.clientHeight = 100;
	balloonText.scrollHeight = 150;

	const balloonBox = createAttrMockElement() as ReturnType<
		typeof createAttrMockElement
	> & {
		querySelector: (sel: string) => unknown;
	};
	balloonBox.querySelector = (sel: string) => {
		if (sel === ".balloon-scroll-arrow-up") return arrowUp;
		if (sel === ".balloon-scroll-arrow-down") return arrowDown;
		return null;
	};

	setupBalloonScroll(
		balloonBox as unknown as HTMLElement,
		balloonText as unknown as HTMLElement,
	);

	// Initial state: at top, can scroll down only
	assert.strictEqual(arrowUp.getAttribute("data-visible"), null);
	assert.strictEqual(arrowDown.getAttribute("data-visible"), "true");
	assert.strictEqual(arrowUp.getAttribute("data-has-image"), null);

	// Wheel down on balloonText
	let wheelPrevented = false;
	let wheelStopped = false;
	balloonText.dispatch("wheel", {
		deltaY: 120,
		preventDefault: () => {
			wheelPrevented = true;
		},
		stopPropagation: () => {
			wheelStopped = true;
		},
	});
	assert.strictEqual(wheelPrevented, true);
	assert.strictEqual(wheelStopped, true);
	assert.strictEqual(balloonText.scrollTop, 28);
	assert.strictEqual(arrowUp.getAttribute("data-visible"), "true");
	assert.strictEqual(arrowDown.getAttribute("data-visible"), "true");

	// Wheel up on balloonBox
	let boxWheelPrevented = false;
	let boxWheelStopped = false;
	balloonBox.dispatch("wheel", {
		deltaY: -100,
		preventDefault: () => {
			boxWheelPrevented = true;
		},
		stopPropagation: () => {
			boxWheelStopped = true;
		},
	});
	assert.strictEqual(boxWheelPrevented, true);
	assert.strictEqual(boxWheelStopped, true);
	assert.strictEqual(balloonText.scrollTop, 0);
	assert.strictEqual(arrowUp.getAttribute("data-visible"), null);
	assert.strictEqual(arrowDown.getAttribute("data-visible"), "true");

	// Arrow mousedown & click stopPropagation + step scroll
	let downMouseStopped = false;
	arrowDown.dispatch("mousedown", {
		stopPropagation: () => {
			downMouseStopped = true;
		},
	});
	assert.strictEqual(downMouseStopped, true);

	let downClickStopped = false;
	arrowDown.dispatch("click", {
		stopPropagation: () => {
			downClickStopped = true;
		},
	});
	assert.strictEqual(downClickStopped, true);
	assert.strictEqual(balloonText.scrollTop, 36);
	assert.strictEqual(arrowUp.getAttribute("data-visible"), "true");
	assert.strictEqual(arrowDown.getAttribute("data-visible"), "true");

	// Second down click reaches bottom (maxScroll = 150 - 100 = 50)
	arrowDown.dispatch("click", { stopPropagation() {} });
	assert.strictEqual(balloonText.scrollTop, 50);
	assert.strictEqual(arrowUp.getAttribute("data-visible"), "true");
	assert.strictEqual(arrowDown.getAttribute("data-visible"), null);

	// Up click scrolls back up by 36 -> 14
	let upClickStopped = false;
	arrowUp.dispatch("click", {
		stopPropagation: () => {
			upClickStopped = true;
		},
	});
	assert.strictEqual(upClickStopped, true);
	assert.strictEqual(balloonText.scrollTop, 14);
	assert.strictEqual(arrowUp.getAttribute("data-visible"), "true");
	assert.strictEqual(arrowDown.getAttribute("data-visible"), "true");

	// Native scroll event updates arrows and image flag
	balloonBox.style.setProperty(
		"--balloon-arrow0-image",
		'url("data:image/png;base64,arrow0")',
	);
	balloonText.scrollTop = 0;
	balloonText.dispatch("scroll");
	assert.strictEqual(arrowUp.getAttribute("data-visible"), null);
	assert.strictEqual(arrowDown.getAttribute("data-visible"), "true");
	assert.strictEqual(arrowUp.getAttribute("data-has-image"), "true");

	// Non-overflowing text hides both arrows
	balloonText.scrollHeight = 100;
	updateBalloonScrollArrows(
		balloonBox as unknown as HTMLElement,
		balloonText as unknown as HTMLElement,
	);
	assert.strictEqual(arrowUp.getAttribute("data-visible"), null);
	assert.strictEqual(arrowDown.getAttribute("data-visible"), null);
});

test("balloon-window updates scroll on content, invokes resize_balloon_window on theme and scale, and supports negative layout/arrow coords", async () => {
	const env = setupBalloonMockEnvironment();
	const internals = (
		globalThis as unknown as {
			__TAURI_INTERNALS__: {
				invoke: (cmd: string, args?: unknown) => Promise<unknown>;
				transformCallback: (cb: unknown) => unknown;
			};
		}
	).__TAURI_INTERNALS__;
	const originalInvoke = internals.invoke;
	const originalTransformCallback = internals.transformCallback;
	const callbacks = new Map<unknown, (ev: unknown) => void>();
	const capturedListeners: Record<string, (ev: unknown) => void> = {};
	const resizeCalls: Record<string, unknown>[] = [];
	const hideCalls: Record<string, unknown>[] = [];
	let blockImages = false;

	internals.transformCallback = (cb: unknown) => {
		const id = originalTransformCallback(cb);
		if (typeof cb === "function") {
			callbacks.set(id, cb as (ev: unknown) => void);
		}
		return id;
	};
	internals.invoke = async (cmd: string, args?: unknown) => {
		if (cmd === "plugin:event|listen") {
			const payload = args as { event?: string; handler?: unknown };
			if (payload?.event && callbacks.has(payload.handler)) {
				const fn = callbacks.get(payload.handler);
				if (fn) capturedListeners[payload.event] = fn;
			}
			return payload?.handler ?? 1;
		}
		if (cmd === "resize_balloon_window") {
			resizeCalls.push((args as Record<string, unknown>) ?? {});
			return;
		}
		if (cmd === "hide_balloon_window") {
			hideCalls.push((args as Record<string, unknown>) ?? {});
			return;
		}
		if (blockImages && cmd === "load_balloon_image") {
			return null;
		}
		return await originalInvoke(cmd, args);
	};

	try {
		const balloonBox = enhanceMockElement(
			env.getEl("balloon-box") as Record<string, unknown>,
		);
		const balloonText = enhanceMockElement(
			env.getEl("balloon-text") as Record<string, unknown>,
		);
		const arrowUp = enhanceMockElement(
			env.getEl("balloon-arrow-up") as Record<string, unknown>,
		);
		const arrowDown = enhanceMockElement(
			env.getEl("balloon-arrow-down") as Record<string, unknown>,
		);
		balloonText.scrollTop = 0;
		balloonText.clientHeight = 100;
		balloonText.scrollHeight = 320;

		const { initBalloonWindow } = await import(
			"../ui/ts/ghost/balloon-window.js"
		);
		const { applyBalloonDescript } = await import(
			"../ui/ts/ghost/balloon-window/theme.js"
		);
		const { applyValidRectProperties } = await import(
			"../ui/ts/core/actions/balloon-descript/layout/rect.js"
		);
		const { applyAssetProperties } = await import(
			"../ui/ts/core/actions/balloon-descript/assets.js"
		);

		initBalloonWindow();
		// Allow initial async applyBalloonDescript and listen() registrations to settle
		await new Promise((r) => setTimeout(r, 30));

		// Content update scrolls targetText (not balloonBox) and refreshes arrows
		const contentListener = capturedListeners["update-balloon-content-0"];
		assert.ok(contentListener);
		await contentListener({
			payload: { html: "<p>Line 1</p><p>Line 2</p>" },
		});
		assert.strictEqual(balloonText.innerHTML, "<p>Line 1</p><p>Line 2</p>");
		assert.strictEqual(balloonText.scrollTop, 320);
		assert.strictEqual(balloonBox.scrollTop, undefined);
		assert.strictEqual(arrowUp.getAttribute("data-visible"), "true");
		assert.strictEqual(arrowDown.getAttribute("data-visible"), null);

		// Blank/whitespace content clears text, hides balloonBox & arrows, and invokes hide_balloon_window
		hideCalls.length = 0;
		await contentListener({
			payload: { html: "   \n <br>  " },
		});
		assert.strictEqual(balloonText.innerHTML, "");
		assert.strictEqual(
			(balloonBox.style as Record<string, string>).display,
			"none",
		);
		assert.strictEqual(arrowUp.getAttribute("data-visible"), null);
		assert.strictEqual(arrowDown.getAttribute("data-visible"), null);
		assert.deepStrictEqual(hideCalls, [
			{
				params: { scope_id: 0 },
				scope_id: 0,
				scopeId: 0,
			},
		]);

		// Subsequent non-blank content restores display
		await contentListener({
			payload: { html: "<p>Visible again</p>" },
		});
		assert.strictEqual(
			(balloonBox.style as Record<string, string>).display,
			"",
		);
		assert.strictEqual(balloonText.innerHTML, "<p>Visible again</p>");

		// applyBalloonDescript invokes resize_balloon_window with scaled image dims + 16px
		resizeCalls.length = 0;
		await applyBalloonDescript({
			theme: "ivory",
			scopeId: 0,
			currentUserScale: 1.0,
		});
		assert.ok(resizeCalls.length >= 1);
		const lastThemeResize = resizeCalls[resizeCalls.length - 1];
		// mock Image = 100x100, dpi = 120 -> dpiScale = 0.8 -> Math.ceil(100 * 0.8 + 16) = 96
		assert.deepStrictEqual(lastThemeResize, {
			params: { scope_id: 0, width: 96, height: 96 },
			scope_id: 0,
			scopeId: 0,
			width: 96,
			height: 96,
		});
		assert.strictEqual(
			(balloonBox.style as Record<string, string>).padding,
			"10px 10px 10px 10px",
		);
		assert.strictEqual(
			(balloonText.style as Record<string, string>).maxWidth,
			"calc(100% - 50px)",
		);

		// Scale change re-invokes resize_balloon_window using stored base dims
		resizeCalls.length = 0;
		(balloonBox.dataset as Record<string, string>).baseWidth = "200";
		(balloonBox.dataset as Record<string, string>).baseHeight = "150";
		const scaleListener = capturedListeners["balloon-scale-changed"];
		assert.ok(scaleListener);
		await scaleListener({
			payload: { userScale: 1.5 },
		});
		assert.strictEqual(resizeCalls.length, 1);
		// userScale 1.5 * dpiScale 0.8 = 1.2 -> 200*1.2+16=256, 150*1.2+16=196
		assert.deepStrictEqual(resizeCalls[0], {
			params: { scope_id: 0, width: 256, height: 196 },
			scope_id: 0,
			scopeId: 0,
			width: 256,
			height: 196,
		});

		// Missing bgImage falls back to 280x140 scaled + 16px
		resizeCalls.length = 0;
		blockImages = true;
		await applyBalloonDescript({
			theme: "nsm",
			scopeId: 0,
			currentUserScale: 1.0,
		});
		assert.strictEqual(resizeCalls.length, 1);
		assert.deepStrictEqual(resizeCalls[0], {
			params: { scope_id: 0, width: 240, height: 128 },
			scope_id: 0,
			scopeId: 0,
			width: 240,
			height: 128,
		});

		// Verify rect.ts negative wordwrappoint.x & assets.ts UKADOC arrow0/arrow1 edge CSS vars
		const mockRoot = createAttrMockElement();
		applyValidRectProperties(mockRoot as unknown as HTMLElement, {
			"wordwrappoint.x": "-42",
		});
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-max-width"),
			"calc(100% - 42px)",
		);
		assert.strictEqual(
			(balloonText.style as Record<string, string>).maxWidth,
			"calc(100% - 42px)",
		);

		applyAssetProperties(
			mockRoot as unknown as HTMLElement,
			{
				"arrow0.x": "0",
				"arrow0.y": "12",
				"arrow1.x": "-18",
				"arrow1.y": "-24",
			},
			{},
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow0-x"),
			"0px",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow0-left"),
			"0px",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow0-right"),
			"auto",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow0-y"),
			"12px",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow0-top"),
			"12px",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow0-bottom"),
			"auto",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow1-x"),
			"-18px",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow1-right"),
			"18px",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow1-left"),
			"auto",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow1-y"),
			"-24px",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow1-bottom"),
			"24px",
		);
		assert.strictEqual(
			mockRoot.style.getPropertyValue("--balloon-arrow1-top"),
			"auto",
		);
	} finally {
		internals.invoke = originalInvoke;
		internals.transformCallback = originalTransformCallback;
	}
});
