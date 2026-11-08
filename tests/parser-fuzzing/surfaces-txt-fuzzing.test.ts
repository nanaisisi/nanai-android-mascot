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

	// Cycle 8 surfaces.txt polygon and animation collision parsing assertions
	const polyAnimTxt = `
surface0
{
collisionex0,WingPoly,polygon,0,0,100,0,100,50,0,50
animation10.interval,sometimes
animation10.collision0,10,10,60,60,AnimBust
animation10.collisionex1,AnimWing,polygon,20,20,80,20,80,70,20,70
animation10.collisionex2,AnimRect,rect,5,5,25,25
}
`;
	const polyAnimParsed = parseSurfacesTxt(polyAnimTxt);
	assert.ok(polyAnimParsed.collisions["0"]?.length === 1);
	const polyCol = polyAnimParsed.collisions["0"][0];
	assert.equal(polyCol.name, "wingpoly");
	assert.equal(polyCol.shape, "polygon");
	assert.equal(polyCol.vertices.length, 4);
	assert.equal(polyCol.minX, 0);
	assert.equal(polyCol.maxX, 100);

	assert.ok(polyAnimParsed.animations["0"]?.length === 1);
	const animObj = polyAnimParsed.animations["0"][0];
	assert.equal(animObj.id, 10);
	assert.equal(animObj.collisions.length, 3);
	assert.equal(animObj.collisions[0].name, "animbust");
	assert.equal(animObj.collisions[0].shape, "rect");
	assert.equal(animObj.collisions[1].name, "animwing");
	assert.equal(animObj.collisions[1].shape, "polygon");
	assert.equal(animObj.collisions[1].vertices.length, 4);
	assert.equal(animObj.collisions[2].name, "animrect");
	assert.equal(animObj.collisions[2].shape, "rect");
	assert.equal(animObj.collisions[2].x1, 5);
	assert.equal(animObj.collisions[2].x2, 25);

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

	// Cycle 9 surfaces.txt extensions: surface[0], scoped surface blocks, name, icon.rect, 7-part collision
	const cycle9Txt = `
surface[0]
{
name,DefaultFace
icon.rect,10,20,50,40
collision,5,0,0,100,100,LegacyBody
}

sakura.surface1
{
name,SakuraSmile
collision,0,0,50,50,Head
}

kero.surface[10]
{
name,KeroNormal
collision,10,10,60,60,KeroBody
}
`;
	const cycle9Parsed = parseSurfacesTxt(cycle9Txt);
	assert.equal(cycle9Parsed.names["0"], "DefaultFace");
	assert.deepEqual(cycle9Parsed.iconRects["0"], [10, 20, 50, 40]);
	assert.equal(cycle9Parsed.collisions["0"]?.[0]?.id, 5);
	assert.equal(cycle9Parsed.collisions["0"]?.[0]?.name, "legacybody");

	assert.equal(cycle9Parsed.names["1"], "SakuraSmile");
	assert.equal(cycle9Parsed.collisions["1"]?.[0]?.name, "head");

	assert.equal(cycle9Parsed.names["10"], "KeroNormal");
	assert.equal(cycle9Parsed.collisions["10"]?.[0]?.name, "kerobody");

	// Cycle 10 multi-character alias blocks parsing: surface.alias, kero.surface.alias, char2.surface.alias
	const cycle10Txt = `
surface.alias
{
common_smile,[0,1]
}

kero.surface.alias
{
kero_smile,[10]
}

char2.surface.alias
{
sub_smile,[20,21]
}
`;
	const cycle10Parsed = parseSurfacesTxt(cycle10Txt);
	assert.deepEqual(cycle10Parsed.aliases.common_smile, [0, 1]);
	assert.deepEqual(cycle10Parsed.keroAliases.kero_smile, [10]);
	assert.deepEqual(cycle10Parsed.charAliases[2]?.sub_smile, [20, 21]);
});
