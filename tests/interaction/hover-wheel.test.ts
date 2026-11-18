import assert from "node:assert/strict";
import { describe, test, vi } from "vitest";
import { setupHoverAndWheel as directSetupHoverAndWheel } from "../../ui/ts/surface/interaction/hover-wheel.js";
import {
	InteractionManager,
	setupHoverAndWheel,
} from "../../ui/ts/surface/interaction.js";
import { setupInteractionDomGlobals } from "./helpers.js";

setupInteractionDomGlobals();

function createMockElement() {
	const listeners: Record<string, (e?: unknown) => void> = {};
	const rect = {
		left: 0,
		top: 0,
		width: 100,
		height: 100,
	} as DOMRect;
	const el = /** @type {any} */ ({
		classList: {
			contains: () => false,
			add() {},
			remove() {},
		},
		style: {},
		querySelector: () => null,
		getBoundingClientRect: () => rect,
		addEventListener: (t: string, cb: (e?: unknown) => void) => {
			listeners[t] = cb;
		},
		removeEventListener: (t: string, cb: (e?: unknown) => void) => {
			if (listeners[t] === cb) delete listeners[t];
		},
	}) as unknown as HTMLElement;

	return { el, listeners, rect };
}

describe("hover-wheel interaction submodule", () => {
	test("setupHoverAndWheel manages wheel, hover timer, cancellation and cleanup", () => {
		vi.useFakeTimers();

		const events: Array<{ type: string; delta?: number }> = [];
		const { el: mockEl, listeners } = createMockElement();

		let interacting = false;
		const cleanup = setupHoverAndWheel(
			mockEl,
			{
				onGhostWheel: (_x, _y, _rect, delta) =>
					events.push({ type: "wheel", delta }),
				onGhostHover: (_x, _y, _rect) => events.push({ type: "hover" }),
			},
			() => interacting,
			200,
		);

		// Wheel event
		listeners.wheel?.({ deltaY: 50, clientX: 10, clientY: 10 });
		assert.equal(events.length, 1);
		assert.equal(events[0].type, "wheel");
		assert.equal(events[0].delta, 50);

		// Hover event triggered after timeout
		listeners.mousemove?.({ clientX: 15, clientY: 15 });
		vi.advanceTimersByTime(100);
		assert.equal(events.length, 1);
		vi.advanceTimersByTime(110);
		assert.equal(events.length, 2);
		assert.equal(events[1].type, "hover");

		// Mouseleave clears hover timer
		listeners.mousemove?.({ clientX: 20, clientY: 20 });
		listeners.mouseleave?.();
		vi.advanceTimersByTime(250);
		assert.equal(events.length, 2); // No new hover event

		// Suppressed if interacting
		interacting = true;
		listeners.mousemove?.({ clientX: 30, clientY: 30 });
		vi.advanceTimersByTime(250);
		assert.equal(events.length, 2);

		// Direct export setup & cleanup
		cleanup();
		assert.equal(listeners.wheel, undefined);
		assert.equal(listeners.mousemove, undefined);
		assert.equal(listeners.mouseenter, undefined);
		assert.equal(listeners.mouseleave, undefined);

		// Null target
		const nullCleanup = directSetupHoverAndWheel(
			null as unknown as HTMLElement,
		);
		assert.doesNotThrow(() => nullCleanup());

		vi.useRealTimers();
	});

	test("handles mouseenter, mouseleave, hover-time stroke (40px threshold), and cleanup", () => {
		const { el: mockEl, listeners } = createMockElement();
		const enterEvents: Array<{
			x: number;
			y: number;
			isWindow: boolean;
		}> = [];
		const leaveEvents: Array<{
			x: number;
			y: number;
			isWindow: boolean;
		}> = [];
		const strokeEvents: Array<{ x: number; y: number }> = [];

		let interacting = false;
		const cleanup = setupHoverAndWheel(
			mockEl,
			{
				onGhostMouseEnter: (x, y, _rect, isWindow) =>
					enterEvents.push({ x, y, isWindow }),
				onGhostMouseLeave: (x, y, _rect, isWindow) =>
					leaveEvents.push({ x, y, isWindow }),
				onGhostStroke: (x, y) => strokeEvents.push({ x, y }),
			},
			() => interacting,
		);

		listeners.mouseenter?.({ clientX: 10, clientY: 20 });
		assert.deepEqual(enterEvents, [{ x: 10, y: 20, isWindow: false }]);

		// Travel 25px -> below 40px threshold
		listeners.mousemove?.({ clientX: 35, clientY: 20 });
		assert.equal(strokeEvents.length, 0);

		// Travel +20px (total 45px >= 40px) -> fires stroke and resets accumulator
		listeners.mousemove?.({ clientX: 55, clientY: 20 });
		assert.deepEqual(strokeEvents, [{ x: 55, y: 20 }]);

		// Travel +25px -> below threshold after reset
		listeners.mousemove?.({ clientX: 80, clientY: 20 });
		assert.equal(strokeEvents.length, 1);

		// mouseleave fires onGhostMouseLeave and resets stroke accumulator
		listeners.mouseleave?.({ clientX: 90, clientY: 20 });
		assert.deepEqual(leaveEvents, [{ x: 90, y: 20, isWindow: false }]);

		listeners.mousemove?.({ clientX: 10, clientY: 10 });
		listeners.mousemove?.({ clientX: 35, clientY: 10 });
		assert.equal(strokeEvents.length, 1);

		// Suppressed while interacting
		interacting = true;
		listeners.mousemove?.({ clientX: 95, clientY: 10 });
		assert.equal(strokeEvents.length, 1);

		cleanup();
		assert.equal(listeners.mouseenter, undefined);
		assert.equal(listeners.mouseleave, undefined);
		assert.equal(listeners.mousemove, undefined);
		assert.equal(listeners.wheel, undefined);
	});

	test("InteractionManager.setupDragging forwards onGhostMouseEnter, onGhostMouseLeave, and onGhostStroke to hover-wheel", () => {
		const { el: mockEl, listeners } = createMockElement();
		const origAdd = globalThis.addEventListener;
		const origRemove = globalThis.removeEventListener;
		const origGetElementById = globalThis.document?.getElementById;
		globalThis.addEventListener =
			(() => {}) as typeof globalThis.addEventListener;
		globalThis.removeEventListener =
			(() => {}) as typeof globalThis.removeEventListener;
		if (globalThis.document) {
			(
				globalThis.document as unknown as {
					getElementById?: (id: string) => unknown;
				}
			).getElementById = () => null;
		}

		try {
			const manager = new InteractionManager({});
			const strokes: Array<{ x: number; y: number }> = [];
			const enters: Array<{ x: number; y: number; isWindow: boolean }> = [];
			const leaves: Array<{ x: number; y: number; isWindow: boolean }> = [];

			manager.setupDragging(
				mockEl,
				() => {},
				(x: number, y: number) => strokes.push({ x, y }),
				{
					onGhostMouseEnter: (x, y, _rect, isWindow) =>
						enters.push({ x, y, isWindow }),
					onGhostMouseLeave: (x, y, _rect, isWindow) =>
						leaves.push({ x, y, isWindow }),
				},
			);

			listeners.mouseenter?.({ clientX: 5, clientY: 5 });
			listeners.mousemove?.({ clientX: 50, clientY: 5 });
			listeners.mouseleave?.({ clientX: 60, clientY: 5 });

			assert.deepEqual(enters, [{ x: 5, y: 5, isWindow: false }]);
			assert.deepEqual(strokes, [{ x: 50, y: 5 }]);
			assert.deepEqual(leaves, [{ x: 60, y: 5, isWindow: false }]);
		} finally {
			globalThis.addEventListener = origAdd;
			globalThis.removeEventListener = origRemove;
			if (globalThis.document) {
				if (origGetElementById) {
					globalThis.document.getElementById = origGetElementById;
				} else {
					delete (
						globalThis.document as unknown as { getElementById?: unknown }
					).getElementById;
				}
			}
		}
	});
});
