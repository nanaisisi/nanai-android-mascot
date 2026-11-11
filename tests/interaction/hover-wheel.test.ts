import assert from "node:assert/strict";
import { describe, test, vi } from "vitest";
import { setupHoverAndWheel as directSetupHoverAndWheel } from "../../ui/ts/surface/interaction/hover-wheel.js";
import { setupHoverAndWheel } from "../../ui/ts/surface/interaction.js";
import { setupInteractionDomGlobals } from "./helpers.js";

setupInteractionDomGlobals();

describe("hover-wheel interaction submodule", () => {
	test("setupHoverAndWheel manages wheel, hover timer, cancellation and cleanup", () => {
		vi.useFakeTimers();

		const events = [];
		const listeners = {};
		const mockEl = /** @type {any} */ ({
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				width: 100,
				height: 100,
			}),
			addEventListener: (t, cb) => {
				listeners[t] = cb;
			},
			removeEventListener: (t, cb) => {
				if (listeners[t] === cb) delete listeners[t];
			},
		});

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
		assert.equal(listeners.mouseleave, undefined);

		// Null target
		const nullCleanup = directSetupHoverAndWheel(null);
		assert.doesNotThrow(() => nullCleanup());

		vi.useRealTimers();
	});
});
