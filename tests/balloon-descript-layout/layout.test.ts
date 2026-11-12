import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyAlignmentProperties as directAlignment } from "../../ui/ts/core/actions/balloon-descript/layout/alignment.js";
import { applyCommunicateBoxProperties as directCommunicateBox } from "../../ui/ts/core/actions/balloon-descript/layout/communicate-box.js";
import { applyPositionProperties as directPosition } from "../../ui/ts/core/actions/balloon-descript/layout/position.js";
import { applyValidRectProperties as directValidRect } from "../../ui/ts/core/actions/balloon-descript/layout/rect.js";
import { applyDpiAndScaleProperties as directScale } from "../../ui/ts/core/actions/balloon-descript/layout/scale.js";
import {
	applyAlignmentProperties,
	applyCommunicateBoxProperties,
	applyDpiAndScaleProperties,
	applyLayoutProperties,
	applyPositionProperties,
	applyValidRectProperties,
} from "../../ui/ts/core/actions/balloon-descript/layout.js";
import { createMockRoot } from "./helpers.js";

describe("balloon-descript-layout layout facade submodule", () => {
	it("applyLayoutProperties coordinates all submodules seamlessly", () => {
		const root = createMockRoot();
		const instance: {
			balloonUserScale?: number;
			balloonDpiScale?: number;
			elements?: { balloonDisplay: HTMLElement | null };
			balloonDontMove?: boolean;
		} = {
			balloonUserScale: 1.0,
			elements: {
				balloonDisplay: { style: {} } as HTMLElement,
			},
		};

		const originalDoc = globalThis.document;
		globalThis.document = {
			querySelector(_sel: string) {
				return {
					style: {},
					setProperty() {},
				};
			},
		} as unknown as Document;

		try {
			applyLayoutProperties(
				root,
				{
					dpi: "96",
					"validrect.left": "12",
					"validrect.top": "12",
					"validrect.right": "12",
					"validrect.bottom": "12",
					"balloon.dontmove": "0",
				},
				instance,
			);

			assert.equal(root.vars["--balloon-dpi"], "96");
			assert.equal(root.vars["--balloon-dpi-scale"], "1");
			assert.equal(
				root.vars["--balloon-border-image-slice"],
				"16 16 16 16 fill",
			);
			assert.equal(root.vars["--balloon-dontmove"], "0");
			assert.equal(instance.balloonDontMove, false);

			// Verify re-exported functions match the direct submodule exports
			assert.equal(applyAlignmentProperties, directAlignment);
			assert.equal(applyCommunicateBoxProperties, directCommunicateBox);
			assert.equal(applyDpiAndScaleProperties, directScale);
			assert.equal(applyPositionProperties, directPosition);
			assert.equal(applyValidRectProperties, directValidRect);
		} finally {
			globalThis.document = originalDoc;
		}
	});
});
