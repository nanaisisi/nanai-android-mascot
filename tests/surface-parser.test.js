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
