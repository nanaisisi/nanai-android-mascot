import assert from "node:assert/strict";
import { test } from "vitest";
import { intervalFixture } from "./helpers.js";

test("talk,N runs every talk animation independently", () => {
	const { animation, played } = intervalFixture([
		{ id: 1, interval: "talk,1", patterns: [] },
		{ id: 2, interval: "talk,2", patterns: [] },
	]);
	animation.onCharSpoken(0);
	animation.onCharSpoken(0);
	assert.deepEqual(played, [1, 1, 2]);
});

test("yen-e, starttalk and endtalk animations fire on their script triggers", () => {
	const { animation, played } = intervalFixture([
		{ id: 1, interval: "yen-e", patterns: [] },
		{ id: 2, interval: "starttalk", patterns: [] },
		{ id: 3, interval: "endtalk", patterns: [] },
	]);
	animation.onTalkEnd(0); // starttalk 未発動の endtalk は無視
	animation.onCharSpoken(0);
	animation.onCharSpoken(0);
	animation.onTalkEnd(0);
	animation.onScriptEnd(0);
	assert.deepEqual(played, [2, 3, 1]);
});

test("combined runonce+random interval is not treated as sometimes", async () => {
	const { animation, played } = intervalFixture([
		{ id: 7, interval: "runonce+random,5", patterns: [] },
		{ id: 8, interval: "bind+always", patterns: [] },
	]);
	animation.startAnimations(0, 0);
	await new Promise((resolve) => setTimeout(resolve, 60));
	animation.stopAnimations(0);
	assert.deepEqual(played, [7]);
});
