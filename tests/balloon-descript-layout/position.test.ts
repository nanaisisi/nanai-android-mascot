import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { applyPositionProperties as directPosition } from "../../ui/js/core/actions/balloon-descript/layout/position.js";
import { createMockRoot } from "./helpers.js";

describe("balloon-descript-layout position submodule", () => {
	it("position module applies origin, number, sstpmessage, and windowposition", () => {
		const root = createMockRoot();
		const instance: {
			elements?: {
				balloonDisplay?: {
					style: Record<string, string>;
				};
			};
			windowPositionLimit?: boolean;
		} = {
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

		assert.equal(root.vars["--balloon-origin-x"], "15px");
		assert.equal(root.vars["--balloon-origin-y"], "-25px");
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

	it("position module handles partial origin and missing balloonDisplay element", () => {
		const root = createMockRoot();
		directPosition(root, { "origin.x": "10" }, { elements: {} });
		directPosition(
			root,
			{ "origin.y": "20" },
			{
				elements: { balloonDisplay: { style: {} } },
			},
		);
		assert.ok(true);
	});
});
