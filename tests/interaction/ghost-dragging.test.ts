import assert from "node:assert/strict";
import { describe, test, vi } from "vitest";
import { handleGhostPointerUp } from "../../ui/ts/surface/interaction/drag/drag-pointer-up.js";
import { setupGhostDragging as directSetupGhostDragging } from "../../ui/ts/surface/interaction/drag-handler.js";
import { setupGhostDragging } from "../../ui/ts/surface/interaction.js";
import { setupInteractionDomGlobals } from "./helpers.js";

setupInteractionDomGlobals();

function createMockHarness(isTransparent = false) {
	const targetListeners: Record<string, (e?: unknown) => void> = {};
	const globalListeners: Record<string, Array<(e?: unknown) => void>> = {};
	const origAdd = globalThis.addEventListener;
	const origRemove = globalThis.removeEventListener;

	globalThis.addEventListener = ((
		type: string,
		cb: EventListenerOrEventListenerObject,
	) => {
		globalListeners[type] = globalListeners[type] || [];
		globalListeners[type].push(cb as (e?: unknown) => void);
	}) as typeof globalThis.addEventListener;
	globalThis.removeEventListener = ((
		type: string,
		cb: EventListenerOrEventListenerObject,
	) => {
		if (!globalListeners[type]) return;
		globalListeners[type] = globalListeners[type].filter((fn) => fn !== cb);
	}) as typeof globalThis.removeEventListener;

	const rect = { left: 10, top: 10, width: 100, height: 100 };
	const mockTarget = /** @type {any} */ ({
		querySelector: (sel: string) => (sel === "img" ? { tagName: "IMG" } : null),
		classList: {
			contains: () => false,
			add() {},
			remove() {},
		},
		style: {},
		getBoundingClientRect: () => rect,
		addEventListener: (t: string, cb: (e?: unknown) => void) => {
			targetListeners[t] = cb;
		},
		removeEventListener: (t: string, cb: (e?: unknown) => void) => {
			if (targetListeners[t] === cb) delete targetListeners[t];
		},
	}) as unknown as HTMLElement;

	const emitTarget = (type: string, e: unknown) => {
		targetListeners[type]?.(e);
	};
	const emitGlobal = (type: string, e: unknown) => {
		for (const cb of [...(globalListeners[type] || [])]) {
			cb(e);
		}
	};
	const restoreGlobals = () => {
		globalThis.addEventListener = origAdd;
		globalThis.removeEventListener = origRemove;
	};

	return {
		rect,
		mockTarget,
		emitTarget,
		emitGlobal,
		restoreGlobals,
		isPixelTransparent: () => isTransparent,
	};
}

describe("ghost-dragging interaction submodule", () => {
	test("setupGhostDragging handles null target and custom context", () => {
		const resNull = setupGhostDragging(
			null as unknown as HTMLElement,
			null,
			null,
		);
		assert.equal(resNull.isInteractingOrDragging(), false);
		assert.doesNotThrow(() => resNull.cleanup());

		const directNull = directSetupGhostDragging(
			null as unknown as HTMLElement,
			null,
			null,
		);
		assert.equal(directNull.isInteractingOrDragging(), false);

		// Custom context test
		let menuCalled = false;
		let followCoords: { x: number; y: number } | null = null;
		const listeners: Record<string, unknown> = {};
		const mockTarget = /** @type {any} */ ({
			querySelector: () => null,
			classList: {
				contains: () => false,
				add() {},
				remove() {},
			},
			style: {},
			getBoundingClientRect: () => ({
				left: 10,
				top: 10,
				width: 50,
				height: 50,
			}),
			addEventListener: (t: string, cb: unknown) => {
				listeners[t] = cb;
			},
			removeEventListener: (t: string, _cb: unknown) => {
				delete listeners[t];
			},
		}) as unknown as HTMLElement;

		const { isInteractingOrDragging, cleanup } = setupGhostDragging(
			mockTarget,
			() => {},
			() => {},
			{},
			{
				toggleMenu: () => {
					menuCalled = true;
				},
				updateFollowPosition: (x, y) => {
					followCoords = { x, y };
				},
				isPixelTransparent: () => false,
			},
		);

		assert.equal(isInteractingOrDragging(), false);
		assert.equal(menuCalled, false);
		assert.equal(followCoords, null);
		assert.doesNotThrow(() => cleanup());
	});

	test("handles single, double, and multi-click on left button (including Tauri native drag mode)", () => {
		vi.useFakeTimers();
		vi.setSystemTime(1000);
		const harness = createMockHarness(false);

		const clicks: Array<{
			x: number;
			y: number;
			clickType?: string;
		}> = [];
		const multiClicks: Array<{
			x: number;
			y: number;
			count: number;
			button: number | string;
			device: string;
			isEx: boolean;
		}> = [];

		const { cleanup } = setupGhostDragging(
			harness.mockTarget,
			(x: number, y: number, _rect: unknown, clickType?: string) => {
				clicks.push({ x, y, clickType });
			},
			() => {},
			{
				onGhostMultipleClick: (x, y, _rect, count, button, device, isEx) => {
					multiClicks.push({ x, y, count, button, device, isEx });
				},
			},
			{ isPixelTransparent: harness.isPixelTransparent },
		);

		try {
			const clickAt = (x: number, y: number) => {
				harness.emitTarget("mousedown", {
					type: "mousedown",
					button: 0,
					clientX: x,
					clientY: y,
				});
				harness.emitGlobal("mouseup", {
					button: 0,
					clientX: x,
					clientY: y,
				});
			};

			// 1st click -> single
			clickAt(50, 60);
			assert.deepEqual(clicks, [{ x: 50, y: 60, clickType: "single" }]);
			assert.equal(multiClicks.length, 0);

			// 2nd click within 350ms and <= 10px -> double
			vi.advanceTimersByTime(150);
			clickAt(54, 63);
			assert.deepEqual(clicks, [
				{ x: 50, y: 60, clickType: "single" },
				{ x: 54, y: 63, clickType: "double" },
			]);
			assert.equal(multiClicks.length, 0);

			// 3rd click -> multipleclick (count=3, isEx=false)
			vi.advanceTimersByTime(150);
			clickAt(55, 65);
			assert.equal(clicks.length, 2);
			assert.deepEqual(multiClicks, [
				{ x: 55, y: 65, count: 3, button: 0, device: "mouse", isEx: false },
			]);

			// 4th click -> multipleclick (count=4)
			vi.advanceTimersByTime(150);
			clickAt(55, 65);
			assert.equal(multiClicks.length, 2);
			assert.equal(multiClicks[1].count, 4);

			// After > 350ms -> resets to single
			vi.advanceTimersByTime(400);
			clickAt(55, 65);
			assert.equal(clicks.length, 3);
			assert.equal(clicks[2].clickType, "single");

			// Click > 10px away within 100ms -> resets to single
			vi.advanceTimersByTime(100);
			clickAt(80, 90);
			assert.equal(clicks.length, 4);
			assert.equal(clicks[3].clickType, "single");

			// Direct handleGhostPointerUp backward compatibility (without clickTracker arg)
			const directClicks: Array<string | undefined> = [];
			const handled = handleGhostPointerUp(
				{ button: 0, clientX: 12, clientY: 14 },
				{
					isInteracting: true,
					isDragging: false,
					startX: 12,
					startY: 14,
					hasMoved: false,
				},
				harness.mockTarget,
				{ cancel() {}, isTriggered: () => false },
				{ isTriggered: () => false },
				{ hasStarted: () => false },
				{},
				(_x: number, _y: number, _r: unknown, clickType?: string) => {
					directClicks.push(clickType);
				},
				undefined,
				undefined,
			);
			assert.equal(handled, true);
			assert.deepEqual(directClicks, ["single"]);

			// Tauri native drag mode (nativeDrag.hasStarted() === true, !hasMoved)
			(
				globalThis as unknown as { __TAURI_INTERNALS__?: unknown }
			).__TAURI_INTERNALS__ = {
				metadata: { currentWindow: { label: "main" } },
				invoke: async () => undefined,
				transformCallback: (cb: unknown) => cb,
			};
			try {
				vi.advanceTimersByTime(500);
				clickAt(25, 35);
				vi.advanceTimersByTime(100);
				clickAt(26, 36);
				vi.advanceTimersByTime(100);
				clickAt(26, 36);
				assert.equal(clicks[4]?.clickType, "single");
				assert.equal(clicks[5]?.clickType, "double");
				assert.equal(multiClicks[2]?.count, 3);
				assert.equal(multiClicks[2]?.isEx, false);
			} finally {
				delete (globalThis as unknown as { __TAURI_INTERNALS__?: unknown })
					.__TAURI_INTERNALS__;
			}
		} finally {
			cleanup();
			harness.restoreGlobals();
			vi.useRealTimers();
		}
	});

	test("handles extended mouse buttons (middle, xbutton1, xbutton2) and multi-clickEx", () => {
		vi.useFakeTimers();
		vi.setSystemTime(5000);
		const harness = createMockHarness(false);

		const exEvents: Array<{
			type: string;
			x: number;
			y: number;
			button: string | number;
			device: string;
		}> = [];
		const clickExEvents: Array<{
			x: number;
			y: number;
			button: string | number;
			device: string;
			isDouble: boolean;
		}> = [];
		const multiClicks: Array<{
			count: number;
			button: string | number;
			isEx: boolean;
		}> = [];

		const { cleanup } = setupGhostDragging(
			harness.mockTarget,
			() => {},
			() => {},
			{
				onGhostMouseEx: (type, x, y, _rect, button, device) => {
					exEvents.push({ type, x, y, button, device });
				},
				onGhostMouseClickEx: (x, y, _rect, button, device, isDouble) => {
					clickExEvents.push({ x, y, button, device, isDouble });
				},
				onGhostMultipleClick: (_x, _y, _rect, count, button, _device, isEx) => {
					multiClicks.push({ count, button, isEx });
				},
			},
			{ isPixelTransparent: harness.isPixelTransparent },
		);

		try {
			// Middle button single click (button === 1 -> "middle")
			harness.emitTarget("mousedown", {
				type: "mousedown",
				button: 1,
				clientX: 20,
				clientY: 30,
				cancelable: true,
				preventDefault() {},
			});
			harness.emitGlobal("mouseup", { button: 1, clientX: 20, clientY: 30 });
			assert.deepEqual(exEvents.slice(0, 2), [
				{ type: "down", x: 20, y: 30, button: "middle", device: "mouse" },
				{ type: "up", x: 20, y: 30, button: "middle", device: "mouse" },
			]);
			assert.deepEqual(clickExEvents[0], {
				x: 20,
				y: 30,
				button: "middle",
				device: "mouse",
				isDouble: false,
			});

			// xbutton1 (button === 3) triple click -> single, double, multipleclick(isEx=true)
			for (let i = 0; i < 3; i++) {
				vi.advanceTimersByTime(100);
				harness.emitTarget("mousedown", {
					type: "mousedown",
					button: 3,
					clientX: 40,
					clientY: 40,
				});
				harness.emitGlobal("mouseup", { button: 3, clientX: 40, clientY: 40 });
			}
			assert.equal(clickExEvents.length, 3);
			assert.deepEqual(clickExEvents[1], {
				x: 40,
				y: 40,
				button: "xbutton1",
				device: "mouse",
				isDouble: false,
			});
			assert.deepEqual(clickExEvents[2], {
				x: 40,
				y: 40,
				button: "xbutton1",
				device: "mouse",
				isDouble: true,
			});
			assert.deepEqual(multiClicks, [
				{ count: 3, button: "xbutton1", isEx: true },
			]);

			// xbutton2 (button === 4) dragged > DRAG_MIN_MOVE -> up without clickEx
			harness.emitTarget("mousedown", {
				type: "mousedown",
				button: 4,
				clientX: 50,
				clientY: 50,
			});
			harness.emitGlobal("mouseup", { button: 4, clientX: 70, clientY: 50 });
			assert.equal(exEvents[exEvents.length - 1].button, "xbutton2");
			assert.equal(exEvents[exEvents.length - 1].type, "up");
			assert.equal(clickExEvents.length, 3);
		} finally {
			cleanup();
			harness.restoreGlobals();
			vi.useRealTimers();
		}
	});

	test("detects 8-direction right-drag gestures and ignores transparent pixels or short drags", () => {
		const harness = createMockHarness(false);
		const gestures: Array<{
			startX: number;
			startY: number;
			endX: number;
			endY: number;
			direction: string;
		}> = [];

		const { cleanup } = setupGhostDragging(
			harness.mockTarget,
			() => {},
			() => {},
			{
				onGhostGesture: (startX, startY, endX, endY, direction) => {
					gestures.push({ startX, startY, endX, endY, direction });
				},
			},
			{ isPixelTransparent: harness.isPixelTransparent },
		);

		try {
			const cases: Array<[number, number, string]> = [
				[50, 0, "right"],
				[50, 50, "right_down"],
				[0, 50, "down"],
				[-50, 50, "left_down"],
				[-50, 0, "left"],
				[-50, -50, "left_up"],
				[0, -50, "up"],
				[50, -50, "right_up"],
			];

			for (const [dx, dy, expected] of cases) {
				harness.emitTarget("mousedown", {
					button: 2,
					clientX: 100,
					clientY: 100,
				});
				harness.emitGlobal("mouseup", {
					button: 2,
					clientX: 100 + dx,
					clientY: 100 + dy,
				});
				assert.equal(gestures[gestures.length - 1].direction, expected);
			}
			assert.equal(gestures.length, 8);

			// Short right-drag (<= 20px) does not fire gesture
			harness.emitTarget("mousedown", {
				button: 2,
				clientX: 100,
				clientY: 100,
			});
			harness.emitGlobal("mouseup", {
				button: 2,
				clientX: 115,
				clientY: 100,
			});
			assert.equal(gestures.length, 8);
		} finally {
			cleanup();
			harness.restoreGlobals();
		}

		// Transparent pixel suppresses extended button & right-drag gesture
		const transparentHarness = createMockHarness(true);
		let gestureCount = 0;
		let exCount = 0;
		const { cleanup: cleanupTransparent } = setupGhostDragging(
			transparentHarness.mockTarget,
			() => {},
			() => {},
			{
				onGhostGesture: () => {
					gestureCount++;
				},
				onGhostMouseEx: () => {
					exCount++;
				},
			},
			{ isPixelTransparent: transparentHarness.isPixelTransparent },
		);

		try {
			transparentHarness.emitTarget("mousedown", {
				button: 1,
				clientX: 10,
				clientY: 10,
			});
			transparentHarness.emitGlobal("mouseup", {
				button: 1,
				clientX: 10,
				clientY: 10,
			});
			transparentHarness.emitTarget("mousedown", {
				button: 2,
				clientX: 10,
				clientY: 10,
			});
			transparentHarness.emitGlobal("mouseup", {
				button: 2,
				clientX: 80,
				clientY: 10,
			});
			assert.equal(exCount, 0);
			assert.equal(gestureCount, 0);
		} finally {
			cleanupTransparent();
			transparentHarness.restoreGlobals();
		}
	});
});
