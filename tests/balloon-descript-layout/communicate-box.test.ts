import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyCommunicateBoxProperties as directCommunicateBox } from "../../ui/js/core/actions/balloon-descript/layout/communicate-box.js";

describe("balloon-descript-layout communicate-box submodule", () => {
	it("communicate-box module updates communicate box styles", () => {
		const styles: Record<string, string> = {};
		const customProps: Record<string, string> = {};
		const originalDoc = globalThis.document;
		globalThis.document = {
			querySelector(sel: string) {
				if (sel === ".communicate-box") {
					return {
						style: {
							set width(v: string) {
								styles.width = v;
							},
							set height(v: string) {
								styles.height = v;
							},
							set left(v: string) {
								styles.left = v;
							},
							set top(v: string) {
								styles.top = v;
							},
							set fontFamily(v: string) {
								styles.fontFamily = v;
							},
							set fontSize(v: string) {
								styles.fontSize = v;
							},
							set color(v: string) {
								styles.color = v;
							},
							set backgroundColor(v: string) {
								styles.backgroundColor = v;
							},
							setProperty(k: string, v: string) {
								customProps[k] = v;
							},
						},
					};
				}
				return null;
			},
		} as unknown as Document;

		try {
			directCommunicateBox({
				"communicatebox.width": "320",
				"communicatebox.height": "48",
				"communicatebox.x": "12",
				"communicatebox.y": "24",
				"communicatebox.font.name": "Sans",
				"communicatebox.font.height": "16",
				"communicatebox.font.color": "#112233",
				"communicatebox.background.color.r": "255",
				"communicatebox.background.color.g": "255",
				"communicatebox.background.color.b": "255",
				"communicatebox.placeholder.color": "#888888",
			});

			assert.equal(styles.width, "320px");
			assert.equal(styles.height, "48px");
			assert.equal(styles.left, "12px");
			assert.equal(styles.top, "24px");
			assert.equal(styles.fontFamily, '"Sans", sans-serif');
			assert.equal(styles.fontSize, "16px");
			assert.equal(styles.color, "#112233");
			assert.equal(styles.backgroundColor, "rgb(255, 255, 255)");
			assert.equal(
				customProps["--communicatebox-placeholder-color"],
				"#888888",
			);
		} finally {
			globalThis.document = originalDoc;
		}
	});

	it("communicate-box module handles missing element and empty props", () => {
		const originalDoc = globalThis.document;
		globalThis.document = { querySelector: () => null } as unknown as Document;
		try {
			directCommunicateBox({ "communicatebox.width": "100" });
			assert.ok(true);
		} finally {
			globalThis.document = originalDoc;
		}
	});
});
