import { assert, describe, it } from "vitest";
import {
	calculateWindowSnap,
	formatSnapTooltipText,
} from "../../../ui/ts/surface/interaction/drag/snap.js";

describe("Window Snapping & SSP Tooltip", () => {
	it("snaps to desktop boundary", () => {
		const res = calculateWindowSnap(
			5,
			5,
			200,
			300,
			[],
			{ width: 1920, height: 1080 },
			false,
			12,
		);
		assert.equal(res.x, 0);
		assert.equal(res.y, 0);
		assert.equal(res.snapXType, "Desktop");
		assert.equal(res.snapYType, "Desktop");
	});

	it("snaps to other character window", () => {
		const res = calculateWindowSnap(
			205,
			100,
			200,
			300,
			[{ x: 0, y: 100, width: 200, height: 300 }],
			{ width: 1920, height: 1080 },
			false,
			12,
		);
		assert.equal(res.x, 200);
		assert.equal(res.snapXType, "Character");
	});

	it("disables snapping when Ctrl key is pressed", () => {
		const res = calculateWindowSnap(
			5,
			5,
			200,
			300,
			[],
			{ width: 1920, height: 1080 },
			true,
			12,
		);
		assert.equal(res.x, 5);
		assert.equal(res.y, 5);
		assert.equal(res.snapXType, "None");
	});

	it("formats SSP snap tooltip text correctly", () => {
		const text = formatSnapTooltipText(1363, 842, "Character", "None");
		assert.include(text, "1363,842 (Snap X:Character)");
		assert.include(text, "Press Ctrl to disable");
	});
});
