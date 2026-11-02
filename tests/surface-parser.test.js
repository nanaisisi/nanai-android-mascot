import assert from "node:assert/strict";
import { test } from "vitest";

const { expandSurfaceRange, parseSurfacesTxt } = await import(
	"../ui/js/surface/surface-parser.js"
);

test("surface-parser covers expandSurfaceRange and parseSurfacesTxt", () => {
	// 1. expandSurfaceRange
	const range = expandSurfaceRange("0-2,5");
	assert.deepEqual(range, ["0", "1", "2", "5"]);

	// 2. parseSurfacesTxt with various directives
	const sampleTxt = `
		// Comment
		surface0-1
		{
			collisionex0,head,rect,10,10,50,50
			collisionex1,circle,c1,20,20,10,10
			collision0,0,0,40,40,bust
			element0,overlay,surface0.png,0,0
			animation0.interval,always
			animation0.pattern0,overlay,6,85,0,0
		}

		surface2
		{
			0pattern0,6,85,overlay,0,0
		}
	`;

	const parsed = parseSurfacesTxt(sampleTxt);
	assert.ok(parsed.collisions["0"]);
	assert.ok(parsed.elements["0"]);
	assert.ok(parsed.animations["0"]);
	assert.ok(parsed.collisions["2"]);
});

test("surface-parser correctly resolves multiple animations and patterns using ID indexing", () => {
	const sampleTxt = `
		surface10
		{
			animation1.interval,sometimes
			animation1.option,exclusive
			animation1.pattern0,overlay,100,50,0,0
			animation1.pattern1,overlay,101,60,10,10
			animation2.interval,rarely
			animation2.pattern0,replace,200,80,0,0
		}
	`;

	const parsed = parseSurfacesTxt(sampleTxt);
	const anims = parsed.animations["10"];
	assert.equal(anims.length, 2);

	const anim1 = anims.find((a) => a.id === 1);
	assert.ok(anim1);
	assert.equal(anim1.interval, "sometimes");
	assert.deepEqual(anim1.options, ["exclusive"]);
	assert.equal(anim1.patterns.length, 2);
	assert.equal(anim1.patterns[0].surface, "100");
	assert.equal(anim1.patterns[1].surface, "101");

	const anim2 = anims.find((a) => a.id === 2);
	assert.ok(anim2);
	assert.equal(anim2.interval, "rarely");
	assert.equal(anim2.patterns.length, 1);
	assert.equal(anim2.patterns[0].surface, "200");
});
