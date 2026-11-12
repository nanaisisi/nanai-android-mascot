import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyValidRectProperties as directValidRect } from "../../ui/ts/core/actions/balloon-descript/layout/rect.js";
import { createMockRoot } from "./helpers.js";

describe("balloon-descript-layout rect submodule", () => {
	it("rect module applies validrect, 9-slice variables, and wordwrappoint", () => {
		const root = createMockRoot();
		let padding = "";
		let maxWidth = "";
		let maxHeight = "";

		const originalDoc = globalThis.document;
		globalThis.document = {
			querySelector(sel: string) {
				if (sel === ".balloon") {
					return {
						style: {
							set padding(v: string) {
								padding = v;
							},
						},
					};
				}
				if (sel === ".balloon-text") {
					return {
						style: {
							set maxWidth(v: string) {
								maxWidth = v;
							},
							set maxHeight(v: string) {
								maxHeight = v;
							},
						},
					};
				}
				return null;
			},
		} as unknown as Document;

		try {
			directValidRect(root, {
				"validrect.left": "10",
				"validrect.top": "20",
				"validrect.right": "30",
				"validrect.bottom": "40",
				"border.repeat": "stretch",
				"wordwrappoint.x": "400",
				"wordwrappoint.y": "250",
			});

			assert.equal(padding, "20px 30px 40px 10px");
			assert.equal(maxWidth, "400px");
			assert.equal(maxHeight, "250px");
			assert.equal(
				root.vars["--balloon-border-image-slice"],
				"16 16 16 16 fill",
			);
			assert.equal(
				root.vars["--balloon-border-image-width"],
				"16px 16px 16px 16px",
			);
			assert.equal(root.vars["--balloon-border-image-repeat"], "stretch");
		} finally {
			globalThis.document = originalDoc;
		}
	});

	it("rect module handles wordwrappoint <= threshold, invalid numbers, and missing balloon element", () => {
		const root = createMockRoot();
		const originalDoc = globalThis.document;
		globalThis.document = { querySelector: () => null } as unknown as Document;
		try {
			directValidRect(root, {
				"wordwrappoint.x": "30",
				"wordwrappoint.y": "10",
			});
			directValidRect(root, {
				"wordwrappoint.x": "invalid",
				"wordwrappoint.y": "invalid",
			});
			assert.ok(true);
		} finally {
			globalThis.document = originalDoc;
		}
	});
});
