import assert from "node:assert/strict";
import { test } from "vitest";
import { parseSurfacesTxt } from "../../ui/ts/surface/surface-parser.js";

test("SERIKO/1 pattern uses the legacy 10 ms unit", () => {
	const { animations } = parseSurfacesTxt(
		`surface0\n{\n1interval,never\n1pattern0,101,70,overlay,200,100\n}`,
	);
	assert.deepEqual(animations["0"][0], {
		id: 1,
		interval: "never",
		patterns: [{ surface: "101", wait: 700, type: "overlay", x: 200, y: 100 }],
	});
});

test("SERIKO/2 pattern parses method, surface, wait and coordinates in UKADOC order", () => {
	const { animations } = parseSurfacesTxt(`surface0
{
animation10.interval,talk,2
animation10.pattern1,overlay,201,700,200,120
animation10.pattern0,overlay,200,0,200,120
animation10.pattern2,overlay,-1,0,0,0
}`);
	assert.deepEqual(animations["0"][0].patterns, [
		{ surface: "200", wait: 0, type: "overlay", x: 200, y: 120 },
		{ surface: "201", wait: 700, type: "overlay", x: 200, y: 120 },
		{ surface: "-1", wait: 0, type: "overlay", x: 0, y: 0 },
	]);
});

test("parseSurfacesTxt extracts animation options (exclusive, background, shared-index)", () => {
	const { animations } = parseSurfacesTxt(`surface0
{
animation5.interval,always
animation5.option,exclusive+background,(1,2)
animation5.pattern0,overlay,500,0,0,0
}`);
	assert.equal(animations["0"][0].id, 5);
	assert.deepEqual(animations["0"][0].options, ["exclusive+background,(1,2)"]);
});

test("parseSurfacesTxt extracts animation name", () => {
	const { animations } = parseSurfacesTxt(`surface0
{
animation12.interval,rarely
animation12.name,blink_smile
animation12.pattern0,overlay,100,50,0,0
}`);
	assert.equal(animations["0"][0].id, 12);
	assert.equal(animations["0"][0].name, "blink_smile");
});

test("parseSurfacesTxt extracts start, stop, alternativestart, parallelstart pattern control methods", () => {
	const parsed = parseSurfacesTxt(`surface0
{
animation0.interval,runonce
animation0.pattern0,start,10
animation0.pattern1,alternativestart,(20,21)
animation0.pattern2,parallelstart,(30,31)
animation0.pattern3,stop,10
}`);

	const patterns = parsed.animations["0"][0].patterns;
	assert.equal(patterns[0].type, "start");
	assert.equal(patterns[0].targetParam, "10");
	assert.equal(patterns[1].type, "alternativestart");
	assert.equal(patterns[1].targetParam, "(20,21)");
	assert.equal(patterns[2].type, "parallelstart");
	assert.equal(patterns[2].targetParam, "(30,31)");
	assert.equal(patterns[3].type, "stop");
	assert.equal(patterns[3].targetParam, "10");
});
