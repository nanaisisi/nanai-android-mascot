import assert from "node:assert/strict";
import { test } from "vitest";

const { parseSurfacesTxt, expandSurfaceRange } = await import(
	"../../ui/js/surface/surface-parser.js"
);

test("surfaces.txt parser fuzzing and edge cases", () => {
	const edgeCases = [
		"",
		"   \r\n\t  ",
		"surface0\n{\n}\n",
		"surface0,1,2\n{\n}\n",
		"surface.append0\n{\n}\n",
		"surface0\n{\ncollision,0,10,20,30,40,Head\n}\n",
		"surface0\n{\ncollision0,0,10,20,30,40,Head\n}\n",
		"surface0\n{\ncollision,not,numbers,at,all,Head\n}\n",
		"surface0\n{\nelement0,overlay,surface0001.png,10,20\n}\n",
		"surface0\n{\nelement0,unknownblend,surface0001.png,not_x,not_y\n}\n",
		"surface0\n{\nanimation0.interval,sometimes\nanimation0.pattern0,overlay,100,50,0,0\n}\n",
		"surface0\n{\nanimation0.interval,run\n}\n",
		"descript\n{\nversion,1\n}\n",
		"// comment line\n# another comment\nsurface0\n{\n// inline comment\n}\n",
		"surface0 {\n", // unclosed brace
		"}\n", // stray closing brace
		"surface0-5\n{\n}\n",
		"surface10-5\n{\n}\n", // reverse range
		// Cycle 2 surfaces.txt extended edge cases (surfaces2 overlay patterns, collisionex)
		"surface.append0,1,2\n{\ncollisionex0,Head,rect,10,20,30,40\ncollisionex1,Bust,circle,50,50,20\ncollisionex2,Arm,ellipse,80,80,15,25\n}\n",
		"surface0\n{\nanimation0.interval,periodic,5\nanimation0.pattern0,replace,0,0,10,10\nanimation0.pattern1,add,1,50,15,15\nanimation0.pattern2,bind,2,100,0,0\n}\n",
		"charset,Shift_JIS\n// Multi-surface def\nsurface0,surface1\n{\n}\n",
	];

	for (const txt of edgeCases) {
		const parsed = parseSurfacesTxt(txt);
		assert.ok(parsed && typeof parsed === "object");
	}

	// expandSurfaceRange edge cases (returns string[] array)
	assert.deepEqual(expandSurfaceRange(""), []);
	assert.deepEqual(expandSurfaceRange("0"), ["0"]);
	assert.deepEqual(expandSurfaceRange("0-3"), ["0", "1", "2", "3"]);
	assert.deepEqual(expandSurfaceRange("3-0"), []);
	assert.deepEqual(expandSurfaceRange("abc"), ["abc"]);

	// SSP '!' exclusion specifications
	assert.deepEqual(expandSurfaceRange("1-10,!5"), [
		"1",
		"2",
		"3",
		"4",
		"6",
		"7",
		"8",
		"9",
		"10",
	]);
	assert.deepEqual(expandSurfaceRange("1-30,!15,!20-25"), [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12",
		"13",
		"14",
		"16",
		"17",
		"18",
		"19",
		"26",
		"27",
		"28",
		"29",
		"30",
	]);
	assert.deepEqual(expandSurfaceRange("1-10,!2-4,3"), [
		"1",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
	]);
});
