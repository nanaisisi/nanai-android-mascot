import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyAlignmentProperties as directAlignment } from "../../ui/js/core/actions/balloon-descript/layout/alignment.js";
import { createMockRoot } from "./helpers.js";

describe("balloon-descript-layout alignment submodule", () => {
	it("alignment module applies dontmove, syncscale, alignment, and offset", () => {
		const root = createMockRoot();
		const instance: {
			balloonDontMove?: boolean;
			balloonSyncScale?: boolean;
			balloonAlignment?: string;
		} = {};

		directAlignment(
			root,
			{
				"kero.balloon.dontmove": "true",
				"sakura.balloon.syncscale": "1",
				"balloon.alignment": "top,right",
				"sakura.balloon.offsetx": "32",
				"sakura.balloon.offsety": "-18",
			},
			instance,
		);

		assert.equal(instance.balloonDontMove, true);
		assert.equal(instance.balloonSyncScale, true);
		assert.equal(instance.balloonAlignment, "top,right");
		assert.equal(root.vars["--balloon-dontmove"], "1");
		assert.equal(root.vars["--balloon-syncscale"], "1");
		assert.equal(root.vars["--balloon-alignment"], "top,right");
		assert.equal(root.vars["--balloon-offset-x"], "32px");
		assert.equal(root.vars["--balloon-offset-y"], "-18px");
	});
});
