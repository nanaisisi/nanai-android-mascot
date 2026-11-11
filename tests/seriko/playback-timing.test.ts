import assert from "node:assert/strict";
import { test } from "vitest";
import { createPlaceholderCanvas } from "../../ui/ts/surface/surface-animation-manager.js";
import { animationFixture } from "./helpers.js";

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
