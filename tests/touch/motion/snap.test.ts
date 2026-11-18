import { assert, describe, it } from "vitest";
import {
	calculateWindowSnap,
	formatSnapTooltipText,
	pickMonitorWorkArea,
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

	it("snaps to taskbar-excluded workArea with non-zero origin", () => {
		// e.g. left taskbar 60px, top taskbar 40px -> workArea = (60, 40, 1860, 1000)
		const topLeft = calculateWindowSnap(
			68,
			46,
			200,
			300,
			[],
			{ x: 60, y: 40, width: 1860, height: 1000 },
			null,
			false,
			12,
		);
		assert.equal(topLeft.x, 60);
		assert.equal(topLeft.y, 40);
		assert.equal(topLeft.snapXType, "Monitor");
		assert.equal(topLeft.snapYType, "Monitor");

		// Bottom-right edge of workArea (60+1860-200 = 1720, 40+1000-300 = 740)
		const bottomRight = calculateWindowSnap(
			1714,
			746,
			200,
			300,
			[],
			{ x: 60, y: 40, width: 1860, height: 1000 },
			null,
			false,
			12,
		);
		assert.equal(bottomRight.x, 1720);
		assert.equal(bottomRight.y, 740);
		assert.equal(bottomRight.snapXType, "Monitor");
		assert.equal(bottomRight.snapYType, "Monitor");
	});

	it("snaps to initial starting position (Initial) and supports independent X/Y snap", () => {
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

		const mixed = calculateWindowSnap(
			5,
			205,
			200,
			300,
			[],
			{ x: 0, y: 0, width: 1920, height: 1032 },
			{ x: 1640, y: 200 },
			false,
			12,
		);
		assert.equal(mixed.x, 0);
		assert.equal(mixed.y, 200);
		assert.equal(mixed.snapXType, "Monitor");
		assert.equal(mixed.snapYType, "Initial");
	});

	it("snaps to other character window edges (Character)", () => {
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
		assert.equal(res.y, 100);
		assert.equal(res.snapYType, "Character");

		// Bottom alignment and right-to-left attachment
		const leftOfOther = calculateWindowSnap(
			394,
			156,
			200,
			350,
			[{ x: 600, y: 200, width: 220, height: 300 }],
			{ width: 1920, height: 1080 },
			null,
			false,
			12,
		);
		assert.equal(leftOfOther.x, 400);
		assert.equal(leftOfOther.y, 150);
		assert.equal(leftOfOther.snapXType, "Character");
		assert.equal(leftOfOther.snapYType, "Character");
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
		assert.equal(res.snapYType, "None");
	});

	it("picks monitor workArea (excluding taskbar) for current or nearest monitor", () => {
		const monitors = [
			{
				position: { x: 0, y: 0 },
				size: { width: 1920, height: 1080 },
				workArea: {
					position: { x: 0, y: 0 },
					size: { width: 1920, height: 1032 },
				},
				scaleFactor: 1,
			},
			{
				position: { x: 1920, y: 0 },
				size: { width: 2560, height: 1440 },
				workArea: {
					position: { x: 1920, y: 48 },
					size: { width: 2560, height: 1392 },
				},
				scaleFactor: 1.5,
			},
		];

		const primary = pickMonitorWorkArea(monitors, 100, 100, 200, 360);
		assert.deepEqual(primary, {
			x: 0,
			y: 0,
			width: 1920,
			height: 1032,
			scaleFactor: 1,
		});

		const secondary = pickMonitorWorkArea(monitors, 2100, 200, 200, 360);
		assert.deepEqual(secondary, {
			x: 1920,
			y: 48,
			width: 2560,
			height: 1392,
			scaleFactor: 1.5,
		});

		// Offscreen shell picks nearest monitor cleanly
		const offscreenLeft = pickMonitorWorkArea(monitors, -300, 100, 200, 360);
		assert.equal(offscreenLeft.x, 0);
		assert.equal(offscreenLeft.height, 1032);
	});

	it("formats 2-line plain SSP snap tooltip text without HTML tags", () => {
		const textChar = formatSnapTooltipText(1363, 842, "Character", "None");
		assert.equal(
			textChar,
			"1363,842 (Snap X:Character)\nPress Ctrl to disable",
		);

		const textMon = formatSnapTooltipText(1363, 842, "None", "Monitor");
		assert.equal(textMon, "1363,842 (Snap Y:Monitor)\nPress Ctrl to disable");

		const textBoth = formatSnapTooltipText(1363, 842, "Monitor", "Initial");
		assert.equal(
			textBoth,
			"1363,842 (Snap X:Monitor, Snap Y:Initial)\nPress Ctrl to disable",
		);

		const textNone = formatSnapTooltipText(1363, 842, "None", "None");
		assert.equal(textNone, "1363,842\nPress Ctrl to disable");
		assert.notInclude(textChar, "<");
	});

	it("formats coordinates only when coordsOnly option is true", () => {
		const text = formatSnapTooltipText(1363, 842, "Character", "None", {
			coordsOnly: true,
		});
		assert.equal(text, "1363,842");
	});
});
