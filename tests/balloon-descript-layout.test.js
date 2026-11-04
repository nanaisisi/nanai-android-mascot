import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyAlignmentProperties as directAlignment } from "../ui/js/core/actions/balloon-descript/layout/alignment.js";
import { applyCommunicateBoxProperties as directCommunicateBox } from "../ui/js/core/actions/balloon-descript/layout/communicate-box.js";
import { applyPositionProperties as directPosition } from "../ui/js/core/actions/balloon-descript/layout/position.js";
import { applyValidRectProperties as directValidRect } from "../ui/js/core/actions/balloon-descript/layout/rect.js";
import { applyDpiAndScaleProperties as directScale } from "../ui/js/core/actions/balloon-descript/layout/scale.js";
import {
	applyAlignmentProperties,
	applyCommunicateBoxProperties,
	applyDpiAndScaleProperties,
	applyLayoutProperties,
	applyPositionProperties,
	applyValidRectProperties,
} from "../ui/js/core/actions/balloon-descript/layout.js";

function createMockRoot() {
	const vars = {};
	return {
		style: {
			setProperty(k, v) {
				vars[k] = v;
			},
			removeProperty(k) {
				delete vars[k];
			},
			getPropertyValue(k) {
				return vars[k];
			},
		},
		vars,
	};
}

describe("balloon layout submodules", () => {
	it("scale module handles dpi and user scale with element transforms", () => {
		const root = createMockRoot();
		const instance = { balloonUserScale: 1.5 };
		let transform = "";
		let transformOrigin = "";

		const originalDoc = globalThis.document;
		globalThis.document = {
			querySelector(sel) {
				if (sel === ".balloon") {
					return {
						style: {
							set transform(v) {
								transform = v;
							},
							get transform() {
								return transform;
							},
							set transformOrigin(v) {
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
		};

		try {
			applyDpiAndScaleProperties(root, { dpi: "192" }, instance);
			assert.equal(instance.balloonDpiScale, 0.5);
			assert.equal(root.vars["--balloon-dpi"], "192");
			assert.equal(root.vars["--balloon-dpi-scale"], "0.5");
			assert.equal(transform, "scale(0.75)");
			assert.equal(transformOrigin, "bottom left");

			// Fallback default DPI (96) and scale 1.0 (empty transform)
			const rootDefault = createMockRoot();
			const instanceDefault = { balloonUserScale: 1.0 };
			directScale(rootDefault, { dpi: "invalid" }, instanceDefault);
			assert.equal(instanceDefault.balloonDpiScale, 1);
			assert.equal(rootDefault.vars["--balloon-dpi"], "96");
			assert.equal(rootDefault.vars["--balloon-dpi-scale"], "1");
			assert.equal(transform, "");
		} finally {
			globalThis.document = originalDoc;
		}
	});

	it("communicate-box module updates communicate box styles", () => {
		const styles = {};
		const customProps = {};
		const originalDoc = globalThis.document;
		globalThis.document = {
			querySelector(sel) {
				if (sel === ".communicate-box") {
					return {
						style: {
							set width(v) {
								styles.width = v;
							},
							set height(v) {
								styles.height = v;
							},
							set left(v) {
								styles.left = v;
							},
							set top(v) {
								styles.top = v;
							},
							set fontFamily(v) {
								styles.fontFamily = v;
							},
							set fontSize(v) {
								styles.fontSize = v;
							},
							set color(v) {
								styles.color = v;
							},
							set backgroundColor(v) {
								styles.backgroundColor = v;
							},
							setProperty(k, v) {
								customProps[k] = v;
							},
						},
					};
				}
				return null;
			},
		};

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

	it("rect module applies validrect, 9-slice variables, and wordwrappoint", () => {
		const root = createMockRoot();
		let padding = "";
		let maxWidth = "";
		let maxHeight = "";

		const originalDoc = globalThis.document;
		globalThis.document = {
			querySelector(sel) {
				if (sel === ".balloon") {
					return {
						style: {
							set padding(v) {
								padding = v;
							},
							set maxWidth(v) {
								maxWidth = v;
							},
							set maxHeight(v) {
								maxHeight = v;
							},
						},
					};
				}
				return null;
			},
		};

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
				"20 30 40 10 fill",
			);
			assert.equal(
				root.vars["--balloon-border-image-width"],
				"20px 30px 40px 10px",
			);
			assert.equal(root.vars["--balloon-border-image-repeat"], "stretch");
		} finally {
			globalThis.document = originalDoc;
		}
	});

	it("position module applies origin, number, sstpmessage, and windowposition", () => {
		const root = createMockRoot();
		const instance = {
			elements: {
				balloonDisplay: {
					style: {},
				},
			},
		};

		directPosition(
			root,
			{
				"origin.x": "15",
				"origin.y": "-25",
				"number.x": "8",
				"number.y": "16",
				"number.xr": "-8",
				"number.yb": "-16",
				"sstpmessage.x": "5",
				"sstpmessage.y": "10",
				"sstpmessage.xr": "-5",
				"sstpmessage.yb": "-10",
				"windowposition.x": "100",
				"windowposition.y": "200",
				"windowposition.limit": "true",
			},
			instance,
		);

		assert.equal(
			instance.elements.balloonDisplay.style.left,
			"calc(50% + 15px)",
		);
		assert.equal(
			instance.elements.balloonDisplay.style.top,
			"calc(2rem + -25px)",
		);
		assert.equal(root.vars["--balloon-number-x"], "8px");
		assert.equal(root.vars["--balloon-number-y"], "16px");
		assert.equal(root.vars["--balloon-number-xr"], "-8px");
		assert.equal(root.vars["--balloon-number-yb"], "-16px");
		assert.equal(root.vars["--balloon-sstpmessage-x"], "5px");
		assert.equal(root.vars["--balloon-sstpmessage-y"], "10px");
		assert.equal(root.vars["--balloon-sstpmessage-xr"], "-5px");
		assert.equal(root.vars["--balloon-sstpmessage-yb"], "-10px");
		assert.equal(root.vars["--balloon-windowpos-x"], "100px");
		assert.equal(root.vars["--balloon-windowpos-y"], "200px");
		assert.equal(instance.windowPositionLimit, true);
	});

	it("alignment module applies dontmove, syncscale, alignment, and offset", () => {
		const root = createMockRoot();
		const instance = {};

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

	it("applyLayoutProperties coordinates all submodules seamlessly", () => {
		const root = createMockRoot();
		const instance = {
			balloonUserScale: 1.0,
			elements: {
				balloonDisplay: { style: {} },
			},
		};

		const originalDoc = globalThis.document;
		globalThis.document = {
			querySelector(_sel) {
				return {
					style: {},
					setProperty() {},
				};
			},
		};

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
				"12 12 12 12 fill",
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

	it("communicate-box module handles missing element and empty props", () => {
		const originalDoc = globalThis.document;
		globalThis.document = { querySelector: () => null };
		try {
			directCommunicateBox({ "communicatebox.width": "100" });
			assert.ok(true);
		} finally {
			globalThis.document = originalDoc;
		}
	});

	it("position module handles partial origin and missing balloonDisplay element", () => {
		const root = createMockRoot();
		directPosition(root, { "origin.x": "10" }, { elements: {} });
		directPosition(root, { "origin.y": "20" }, { elements: { balloonDisplay: { style: {} } } });
		assert.ok(true);
	});

	it("rect module handles wordwrappoint <= threshold, invalid numbers, and missing balloon element", () => {
		const root = createMockRoot();
		const originalDoc = globalThis.document;
		globalThis.document = { querySelector: () => null };
		try {
			directValidRect(root, { "wordwrappoint.x": "30", "wordwrappoint.y": "10" });
			directValidRect(root, { "wordwrappoint.x": "invalid", "wordwrappoint.y": "invalid" });
			assert.ok(true);
		} finally {
			globalThis.document = originalDoc;
		}
	});
});
