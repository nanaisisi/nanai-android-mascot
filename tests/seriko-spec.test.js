import assert from "node:assert/strict";
import { test } from "vitest";
import { SurfaceAnimationManager } from "../ui/js/surface/surface-animation-manager.js";
import { parseSurfacesTxt } from "../ui/js/surface/surface-parser.js";

function animationFixture() {
	const frames = [];
	const manager = {
		currentSurfaceIdFor: () => 0,
		resolveSurfaceNumber: (id) => id,
		app: {
			ghostController: {
				updateSurface: async (...args) => {
					frames.push(args);
				},
			},
		},
	};
	return { animation: new SurfaceAnimationManager(manager), frames };
}

test("pattern wait elapses before its frame is drawn", async () => {
	const { animation, frames } = animationFixture();
	const playing = animation.playAnimationPatterns(
		{ id: 1, patterns: [{ surface: 101, wait: 100 }] },
		0,
		0,
	);
	await new Promise((resolve) => setTimeout(resolve, 20));
	assert.equal(frames.length, 0);
	await playing;
	assert.equal(frames.length, 2); // pattern and base restore
});

test("surface -1 ends this animation without drawing later patterns", async () => {
	const { animation, frames } = animationFixture();
	await animation.playAnimationPatterns(
		{
			id: 1,
			patterns: [
				{ surface: 101, wait: 0 },
				{ surface: -1, wait: 0 },
				{ surface: 102, wait: 0 },
			],
		},
		0,
		0,
	);
	assert.equal(frames.length, 2);
	assert.deepEqual(frames[1], [0, 0, []]);
});

test("surface -2 stops other running animations in the same scope", async () => {
	const { animation, frames } = animationFixture();
	const blink = animation.playAnimationPatterns(
		{
			id: 1,
			patterns: [
				{ surface: 101, wait: 0 },
				{ surface: 102, wait: 80 },
			],
		},
		0,
		0,
	);
	await new Promise((resolve) => setTimeout(resolve, 10));
	await animation.playAnimationPatterns(
		{ id: 2, patterns: [{ surface: -2, wait: 0 }] },
		0,
		0,
	);
	await blink;
	assert.equal(
		frames.some(([, , layers]) => layers?.[0]?.file?.includes("102")),
		false,
	);
});

function intervalFixture(animations, surfaceId = 0) {
	const played = [];
	const manager = {
		animations: { [surfaceId]: animations },
		currentSurfaceIdFor: () => surfaceId,
	};
	const animation = new SurfaceAnimationManager(manager);
	animation.playAnimationPatterns = (anim) => {
		played.push(anim.id);
		return Promise.resolve();
	};
	return { animation, played };
}

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
