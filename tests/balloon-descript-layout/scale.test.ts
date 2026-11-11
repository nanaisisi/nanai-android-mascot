import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyDpiAndScaleProperties as directScale } from "../../ui/ts/core/actions/balloon-descript/layout/scale.js";
import { applyDpiAndScaleProperties } from "../../ui/ts/core/actions/balloon-descript/layout.js";
import { createMockRoot } from "./helpers.js";

describe("balloon-descript-layout scale submodule", () => {
	it("scale module handles dpi and user scale with element transforms", () => {
		const root = createMockRoot();
		const instance: {
			balloonUserScale?: number;
			balloonDpiScale?: number;
		} = { balloonUserScale: 1.5 };
		let transform = "";
		let transformOrigin = "";

		const originalDoc = globalThis.document;
		globalThis.document = {
			querySelector(sel: string) {
				if (sel === ".balloon") {
					return {
						style: {
							set transform(v: string) {
								transform = v;
							},
							get transform() {
								return transform;
							},
							set transformOrigin(v: string) {
								transformOrigin = v;
							},
							get transformOrigin() {
								return transformOrigin;
							},
						},
					};
				}
				return null;
			},
		} as unknown as Document;

		try {
			applyDpiAndScaleProperties(root, { dpi: "192" }, instance);
			assert.equal(instance.balloonDpiScale, 0.5);
			assert.equal(root.vars["--balloon-dpi"], "192");
			assert.equal(root.vars["--balloon-dpi-scale"], "0.5");
			assert.equal(transform, "scale(0.75)");
			assert.equal(transformOrigin, "top left");

			// Fallback default DPI (96) and scale 1.0 (empty transform)
			const rootDefault = createMockRoot();
			const instanceDefault: {
				balloonUserScale?: number;
				balloonDpiScale?: number;
			} = { balloonUserScale: 1.0 };
			directScale(rootDefault, { dpi: "invalid" }, instanceDefault);
			assert.equal(instanceDefault.balloonDpiScale, 1);
			assert.equal(rootDefault.vars["--balloon-dpi"], "96");
			assert.equal(rootDefault.vars["--balloon-dpi-scale"], "1");
			assert.equal(transform, "");
		} finally {
			globalThis.document = originalDoc;
		}
	});
});
