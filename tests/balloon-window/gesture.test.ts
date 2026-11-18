/**
 * @file gesture.test.ts
 * @brief BalloonWindow ジェスチャー・ドラッグ・ピンチズーム操作単体テスト
 */

import assert from "node:assert/strict";
import { test } from "vitest";
import { setupWindowGestures } from "../../ui/ts/ghost/balloon-window/gesture.js";
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
