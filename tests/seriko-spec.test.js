import assert from "node:assert/strict";
import { test } from "vitest";
import {
	createPlaceholderCanvas,
	SurfaceAnimationManager,
} from "../ui/js/surface/surface-animation-manager.js";
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

test("AnimationScheduler and FrameStepEvent fire during pattern playback", async () => {
	const { animation } = animationFixture();
	const events = [];
	animation.scheduler.onFrameStep((ev) => {
		events.push(ev);
	});

	await animation.playAnimationPatterns(
		{
			id: 42,
			patterns: [
				{ surface: 101, wait: 10 },
				{ surface: 102, wait: 10 },
			],
		},
		0,
		0,
	);

	assert.ok(events.length >= 3);
	assert.equal(events[0].animationId, 42);
	assert.equal(events[events.length - 1].isFinished, true);
});

test("createPlaceholderCanvas generates valid dummy canvas", () => {
	const canvas = createPlaceholderCanvas(100, 200, "rgba(255,0,0,1)");
	assert.equal(canvas.width, 100);
	assert.equal(canvas.height, 200);
});

test("renderAnimationFrame falls back to placeholder dataUrl if pattern placeholder flag is set", async () => {
	const { animation, frames } = animationFixture();
	await animation.playAnimationPatterns(
		{ id: 9, patterns: [{ surface: 9999, wait: 0, placeholder: true }] },
		0,
		0,
	);
	assert.equal(frames.length, 2);
	const layer = frames[0][2][0];
	assert.ok(layer.file.startsWith("data:image/png;base64,"));
});

test("SERIKO option exclusive stops other animations and blocks new ones", async () => {
	const { animation } = animationFixture();
	const events = [];
	animation.scheduler.onFrameStep((ev) => {
		events.push(ev);
	});

	// background アニメーション開始
	animation.playAnimationPatterns(
		{
			id: 1,
			options: ["background"],
			patterns: [
				{ surface: 101, wait: 0 },
				{ surface: 102, wait: 100 },
			],
		},
		0,
		0,
	);

	// exclusive アニメーション開始
	const exclusivePromise = animation.playAnimationPatterns(
		{
			id: 2,
			options: ["exclusive"],
			patterns: [
				{ surface: 201, wait: 20 },
				{ surface: -1, wait: 0 },
			],
		},
		0,
		0,
	);

	// exclusive 実行中に通常アニメーションを要求してもブロックされる
	const blockedPromise = animation.playAnimationPatterns(
		{
			id: 3,
			patterns: [{ surface: 301, wait: 0 }],
		},
		0,
		0,
	);
	await blockedPromise;
	await exclusivePromise;

	assert.ok(events.some((e) => e.animationId === 1 && e.isBackground === true));
	assert.ok(events.some((e) => e.animationId === 2));
	assert.equal(
		events.some((e) => e.animationId === 3),
		false,
	);
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

test("SurfaceAnimationManager findAnimation supports both numeric ID and name", () => {
	const manager = {
		animations: {
			0: [
				{ id: 10, name: "blink", patterns: [] },
				{ id: 20, name: "mouth", patterns: [] },
			],
		},
		currentSurfaceIdFor: () => 0,
	};
	const animManager = new SurfaceAnimationManager(manager);
	assert.equal(animManager.findAnimation(10)?.name, "blink");
	assert.equal(animManager.findAnimation("blink")?.id, 10);
	assert.equal(animManager.findAnimation("MOUTH")?.id, 20);
	assert.equal(animManager.findAnimation("nonexistent"), null);
});

test("SurfaceAnimationManager stopAnimation stops running animation by ID or name", async () => {
	const { animation, frames } = animationFixture();
	const animDef = {
		id: 99,
		name: "long_running",
		patterns: [
			{ surface: 101, wait: 0 },
			{ surface: 102, wait: 100 },
			{ surface: 103, wait: 100 },
		],
	};
	animation.manager.animations = { 0: [animDef] };

	const playPromise = animation.playAnimationPatterns(animDef, 0, 0);
	await new Promise((resolve) => setTimeout(resolve, 20));

	// 名前で停止
	animation.stopAnimation(0, "long_running");
	await playPromise;

	// 102, 103 は停止されたため描画されない
	assert.equal(
		frames.some(([, , layers]) => layers?.[0]?.file?.includes("103")),
		false,
	);
});

test("SurfaceAnimationManager setAnimationOffset shifts animation layer coordinates", async () => {
	const { animation, frames } = animationFixture();
	const animDef = {
		id: 55,
		name: "shifted",
		patterns: [{ surface: 105, wait: 0, x: 10, y: 20 }],
	};
	animation.manager.animations = { 0: [animDef] };

	animation.setAnimationOffset(0, "shifted", 30, 40);
	await animation.playAnimationPatterns(animDef, 0, 0);

	const layer = frames[0][2][0];
	assert.equal(layer.x, 40); // 10 + 30
	assert.equal(layer.y, 60); // 20 + 40
});
