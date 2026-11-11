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
	setupWindowGestures(null as any, {});
});
