import { assert, describe, it } from "vitest";
import {
	calculateWindowSnap,
	formatSnapTooltipText,
} from "../../../ui/ts/surface/interaction/drag/snap.js";

describe("Window Snapping & SSP Tooltip", () => {
	it("snaps to monitor boundary (Monitor)", () => {
		const res = calculateWindowSnap(
			5,
			5,
			200,
			300,
			[],
			{ width: 1920, height: 1080 },
			null,
			false,
			12,
		);
		assert.equal(res.x, 0);
		assert.equal(res.y, 0);
		assert.equal(res.snapXType, "Monitor");
		assert.equal(res.snapYType, "Monitor");
	});

	it("snaps to initial starting position (Initial)", () => {
		const res = calculateWindowSnap(
			105,
			205,
			200,
			300,
			[],
			{ width: 1920, height: 1080 },
			{ x: 100, y: 200 },
			false,
			12,
		);
		assert.equal(res.x, 100);
		assert.equal(res.y, 200);
		assert.equal(res.snapXType, "Initial");
		assert.equal(res.snapYType, "Initial");
	});

	it("snaps to other character window (Character)", () => {
		const res = calculateWindowSnap(
			205,
			100,
			200,
			300,
			[{ x: 0, y: 100, width: 200, height: 300 }],
			{ width: 1920, height: 1080 },
			null,
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
			null,
			true,
			12,
		);
		assert.equal(res.x, 5);
		assert.equal(res.y, 5);
		assert.equal(res.snapXType, "None");
	});

	it("formats SSP snap tooltip text correctly for Monitor and Character", () => {
		const textMon = formatSnapTooltipText(1363, 842, "Monitor", "None");
		assert.include(textMon, "1363,842 (Snap X:Monitor)");
		assert.include(textMon, "Press Ctrl to disable");

		const textChar = formatSnapTooltipText(1363, 842, "Character", "None");
		assert.include(textChar, "1363,842 (Snap X:Character)");
	});

	it("formats coordinates only when coordsOnly option is true", () => {
		const text = formatSnapTooltipText(1363, 842, "Character", "None", {
			coordsOnly: true,
		});
		assert.equal(text, "1363,842");
	});
});
