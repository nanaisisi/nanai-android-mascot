import assert from "node:assert/strict";
import { describe, test } from "vitest";
import { isPixelTransparent as directIsPixelTransparent } from "../../ui/js/surface/interaction/transparency.js";
import { isPixelTransparent } from "../../ui/js/surface/interaction.js";
import { setupInteractionDomGlobals } from "./helpers.js";

setupInteractionDomGlobals();

describe("transparency interaction submodule", () => {
	test("isPixelTransparent correctly detects transparent and opaque pixels, handling edge cases", () => {
		// Non-IMG element
		assert.equal(isPixelTransparent(null, 10, 10), false);
		assert.equal(
			isPixelTransparent(/** @type {any} */ ({ tagName: "DIV" }), 10, 10),
			false,
		);

		// Zero-size image
		const zeroImg = /** @type {any} */ ({
			tagName: "IMG",
			getBoundingClientRect: () => ({
				left: 0,
				top: 0,
				width: 0,
				height: 0,
			}),
			naturalWidth: 10,
			naturalHeight: 10,
		});
		assert.equal(isPixelTransparent(zeroImg, 5, 5), true);

		// Out of bounds image
		const normalImg = /** @type {any} */ ({
			tagName: "IMG",
			getBoundingClientRect: () => ({
				left: 10,
				top: 10,
				width: 100,
				height: 100,
			}),
			naturalWidth: 50,
			naturalHeight: 50,
		});
		// clientX < left
		assert.equal(isPixelTransparent(normalImg, 5, 20), true);
		// clientX >= right
		assert.equal(isPixelTransparent(normalImg, 120, 20), true);

		// Valid coordinates on mock canvas with non-transparent alpha
		assert.equal(isPixelTransparent(normalImg, 50, 50), false);

		// direct export test
		assert.equal(directIsPixelTransparent(normalImg, 50, 50), false);
	});
});
