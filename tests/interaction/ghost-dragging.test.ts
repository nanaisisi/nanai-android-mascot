import assert from "node:assert/strict";
import { describe, test } from "vitest";
import { setupGhostDragging as directSetupGhostDragging } from "../../ui/ts/surface/interaction/drag-handler.js";
import { setupGhostDragging } from "../../ui/ts/surface/interaction.js";
import { setupInteractionDomGlobals } from "./helpers.js";

setupInteractionDomGlobals();

describe("ghost-dragging interaction submodule", () => {
	test("setupGhostDragging handles null target and custom context", () => {
		const resNull = setupGhostDragging(null);
		assert.equal(resNull.isInteractingOrDragging(), false);
		assert.doesNotThrow(() => resNull.cleanup());

		const directNull = directSetupGhostDragging(null);
		assert.equal(directNull.isInteractingOrDragging(), false);

		// Custom context test
		let menuCalled = false;
		let followCoords = null;
		const listeners = {};
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
			addEventListener: (t, cb) => {
				listeners[t] = cb;
			},
			removeEventListener: (t, _cb) => {
				delete listeners[t];
			},
		});

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
});
