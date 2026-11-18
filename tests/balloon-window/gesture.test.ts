/**
 * @file gesture.test.ts
 * @brief BalloonWindow ジェスチャー・ドラッグ・ピンチズーム操作単体テスト
 */

import assert from "node:assert/strict";
import { test } from "vitest";
import {
	BALLOON_RESET_HINT_TEXT,
	formatBalloonOffsetText,
	renderBalloonCoordPopup,
	setupWindowGestures,
} from "../../ui/ts/ghost/balloon-window/gesture.js";
import { setupBalloonMockEnvironment } from "./mock-balloon-env.js";

test("setupWindowGestures handles click, drag, double-tap zoom, and pinch gestures", () => {
	const { emittedEvents } = setupBalloonMockEnvironment();

	let userScaleState = 1.0;
	const mockGestureBox: unknown = {
		style: { transform: "", transformOrigin: "" },
		listeners: {} as Record<string, (e?: unknown) => void>,
		addEventListener(ev: string, cb: (e?: unknown) => void) {
			this.listeners[ev] = cb;
		},
	};

	setupWindowGestures(mockGestureBox, {
		scopeId: 0,
		getIsBalloonDontMove: () => false,
		getUserScale: () => userScaleState,
		getDpiScale: () => 1.0,
		onUserScaleChange: (s: number) => {
			userScaleState = s;
		},
	});

	// Click & Mouse events
	mockGestureBox.listeners.click();
	mockGestureBox.listeners.mousedown({ button: 0 });
	mockGestureBox.listeners.mouseup();

	// Touch double tap triggers 1.25 scale
	mockGestureBox.listeners.touchstart({
		touches: [{ clientX: 10, clientY: 10 }],
	});
	mockGestureBox.listeners.touchstart({
		touches: [{ clientX: 10, clientY: 10 }],
	});
	assert.strictEqual(userScaleState, 1.25);

	const requestScaleEvent = emittedEvents.find(
		(e: unknown) =>
			e.event === "request-balloon-scale-change" &&
			e.payload?.userScale === 1.25,
	);
	assert.ok(requestScaleEvent);

	// Touch pinch zoom
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

	const pinchRequestEvent = emittedEvents.find(
		(e: unknown) =>
			e.event === "request-balloon-scale-change" && e.payload?.userScale > 1.25,
	);
	assert.ok(pinchRequestEvent);

	// Null safety
	setupWindowGestures(null as unknown, {});
});

test("setupWindowGestures invokes show_balloon_context_menu on contextmenu and deduplicates same event", async () => {
	const env = setupBalloonMockEnvironment();
	const invoked: Array<{ cmd: string; args: unknown }> = [];
	const internals = (
		globalThis as unknown as {
			__TAURI_INTERNALS__: {
				invoke: (cmd: string, args: unknown) => Promise<unknown>;
			};
		}
	).__TAURI_INTERNALS__;
	const origInvoke = internals.invoke;
	internals.invoke = async (cmd: string, args: unknown) => {
		invoked.push({ cmd, args });
		return origInvoke(cmd, args);
	};

	try {
		const mockGestureBox: {
			style: { transform: string; transformOrigin: string };
			listeners: Record<string, (e?: unknown) => unknown>;
			addEventListener: (ev: string, cb: (e?: unknown) => unknown) => void;
		} = {
			style: { transform: "", transformOrigin: "" },
			listeners: {},
			addEventListener(ev: string, cb: (e?: unknown) => unknown) {
				this.listeners[ev] = cb;
			},
		};

		setupWindowGestures(mockGestureBox as unknown as HTMLElement, {
			scopeId: 1,
			getIsBalloonDontMove: () => false,
			getUserScale: () => 1.0,
			getDpiScale: () => 1.0,
			onUserScaleChange: () => {},
		});

		let prevented = false;
		let stopped = false;
		const eventObj = {
			clientX: 40,
			clientY: 60,
			screenX: 340,
			screenY: 260,
			target: { tagName: "DIV" },
			preventDefault() {
				prevented = true;
			},
			stopPropagation() {
				stopped = true;
			},
		};

		// Trigger both document and box listeners with the same event -> invokes only once
		(env.docListeners.contextmenu as unknown as (e: unknown) => void)?.(
			eventObj,
		);
		mockGestureBox.listeners.contextmenu(eventObj);

		await Promise.resolve();

		assert.strictEqual(prevented, true);
		assert.strictEqual(stopped, true);
		const menuCalls = invoked.filter(
			(entry) => entry.cmd === "show_balloon_context_menu",
		);
		assert.strictEqual(menuCalls.length, 1);
		assert.deepStrictEqual(menuCalls[0].args, {
			params: { scope_id: 1, x: 340, y: 260 },
			scope_id: 1,
			x: 340,
			y: 260,
		});

		// Input elements should not trigger balloon context menu
		mockGestureBox.listeners.contextmenu({
			target: { tagName: "INPUT" },
			preventDefault() {},
			stopPropagation() {},
		});
		await Promise.resolve();
		assert.strictEqual(
			invoked.filter((entry) => entry.cmd === "show_balloon_context_menu")
				.length,
			1,
		);
	} finally {
		internals.invoke = origInvoke;
	}
});

test("setupWindowGestures renders 2-line #coord-popup with character-relative offset during drag and hides on release", async () => {
	assert.strictEqual(formatBalloonOffsetText(-84.4, 79.6), "Offset: -84,80");
	assert.strictEqual(BALLOON_RESET_HINT_TEXT, "Reset: Ctrl+Shift+F10");

	const env = setupBalloonMockEnvironment();
	const internals = (
		globalThis as unknown as {
			__TAURI_INTERNALS__: {
				invoke: (cmd: string, args?: unknown) => Promise<unknown>;
			};
		}
	).__TAURI_INTERNALS__;
	const origInvoke = internals.invoke;
	const docAny = globalThis.document as unknown as {
		createElement: (tag: string) => unknown;
		getElementById: (id: string) => unknown;
	};
	const origCreateElement = docAny.createElement;
	const origGetElementById = docAny.getElementById;

	let balloonPos = { x: 100, y: 200 };
	const charPos = { x: 184, y: 120 };
	const savedCalls: unknown[] = [];

	const createMockNode = () => {
		const node = {
			className: "",
			textContent: "",
			innerHTML: "UNTOUCHED",
			style: { display: "none" } as Record<string, string>,
			children: [] as Array<{ className: string; textContent: string }>,
			replaceChildren(
				...nodes: Array<{ className: string; textContent: string }>
			) {
				node.children = nodes;
			},
			appendChild(child: { className: string; textContent: string }) {
				node.children.push(child);
			},
		};
		return node;
	};
	const coordPopupEl = createMockNode();

	docAny.createElement = (tag: string) => {
		if (tag === "div") {
			return { className: "", textContent: "", style: {} };
		}
		return origCreateElement(tag);
	};
	docAny.getElementById = (id: string) => {
		if (id === "coord-popup") return coordPopupEl;
		return origGetElementById(id);
	};

	internals.invoke = async (cmd: string, args: unknown) => {
		if (cmd === "plugin:window|get_all_windows") {
			return ["balloon_window_0", "subchar_window_0"];
		}
		if (cmd === "plugin:window|outer_position") {
			const label = (args as { label?: string })?.label;
			if (label === "subchar_window_0") return { ...charPos };
			return { ...balloonPos };
		}
		if (cmd === "save_balloon_offset_from_position") {
			savedCalls.push(args);
			return;
		}
		return origInvoke(cmd, args);
	};

	try {
		// Direct safe DOM rendering test
		renderBalloonCoordPopup(
			coordPopupEl as unknown as HTMLElement,
			-84.2,
			80.4,
		);
		assert.strictEqual(coordPopupEl.style.display, "block");
		assert.strictEqual(coordPopupEl.innerHTML, "UNTOUCHED");
		assert.strictEqual(coordPopupEl.children.length, 2);
		assert.strictEqual(coordPopupEl.children[0].className, "coord-popup-line");
		assert.strictEqual(coordPopupEl.children[0].textContent, "Offset: -84,80");
		assert.strictEqual(coordPopupEl.children[1].className, "coord-popup-hint");
		assert.strictEqual(
			coordPopupEl.children[1].textContent,
			"Reset: Ctrl+Shift+F10",
		);

		coordPopupEl.style.display = "none";
		const mockGestureBox = {
			style: { transform: "", transformOrigin: "" },
			listeners: {} as Record<string, (e?: unknown) => void>,
			addEventListener(ev: string, cb: (e?: unknown) => void) {
				this.listeners[ev] = cb;
			},
		};

		setupWindowGestures(mockGestureBox as unknown as HTMLElement, {
			scopeId: 0,
			getIsBalloonDontMove: () => false,
			getUserScale: () => 1.0,
			getDpiScale: () => 1.0,
			onUserScaleChange: () => {},
		});

		// Drag start displays Offset: -84,80 + Reset: Ctrl+Shift+F10
		mockGestureBox.listeners.mousedown({ button: 0 });
		await new Promise((r) => setTimeout(r, 20));
		assert.strictEqual(coordPopupEl.style.display, "block");
		assert.strictEqual(coordPopupEl.children[0].textContent, "Offset: -84,80");
		assert.strictEqual(
			coordPopupEl.children[1].textContent,
			"Reset: Ctrl+Shift+F10",
		);

		// Dragging balloon moves live offset
		balloonPos = { x: 150, y: 245 };
		(env.docListeners.mousemove as unknown as (() => void) | undefined)?.();
		await new Promise((r) => setTimeout(r, 20));
		assert.strictEqual(coordPopupEl.children[0].textContent, "Offset: -34,125");

		// Release hides popup and saves offset once
		mockGestureBox.listeners.mouseup();
		assert.strictEqual(coordPopupEl.style.display, "none");
		assert.deepStrictEqual(savedCalls, [{ scopeId: 0 }]);

		// Touch drag also updates & hides popup
		balloonPos = { x: 84, y: 140 };
		mockGestureBox.listeners.touchstart({
			touches: [{ clientX: 10, clientY: 10 }],
		});
		await new Promise((r) => setTimeout(r, 20));
		assert.strictEqual(coordPopupEl.style.display, "block");
		assert.strictEqual(coordPopupEl.children[0].textContent, "Offset: -100,20");
		mockGestureBox.listeners.touchend({ touches: [] });
		assert.strictEqual(coordPopupEl.style.display, "none");
		assert.strictEqual(savedCalls.length, 2);
	} finally {
		internals.invoke = origInvoke;
		docAny.createElement = origCreateElement;
		docAny.getElementById = origGetElementById;
	}
});
