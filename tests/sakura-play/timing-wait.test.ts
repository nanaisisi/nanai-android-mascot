import assert from "node:assert/strict";
import { test } from "vitest";
import { createEl } from "./helpers.js";

const { playScript, SakuraPlaybackController } = await import(
	"../../ui/ts/ghost/sakura-play.js"
);

test("playScript applies punctuation delay and waitMultiplier via playbackController", async () => {
	const sleptDurations = [];
	const sakuraText = createEl("div");

	const player = {
		playbackId: 10,
		parse: async () => [
			{ type: "scope", value: 0 },
			{ type: "char", value: "あ" }, // normal: 40ms
			{ type: "char", value: "。" }, // punctuation: 140ms
			{ type: "wait", value: 50 }, // wait: 50ms
		],
		sleep: (ms) => {
			sleptDurations.push(ms);
			return Promise.resolve();
		},
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: () => {},
		onChoiceTimeout: () => {},
		scheduleSurfaceRestore: () => {},
		app: {
			ghostId: "main",
			currentBalloonTheme: "ivory",
			elements: {
				balloonText: sakuraText,
				balloonDisplay: createEl("div"),
				keroBalloonText: createEl("div"),
				keroBalloonDisplay: createEl("div"),
			},
			surfaceManager: {
				onCharSpoken() {},
				onTalkEnd() {},
				onScriptEnd() {},
			},
			ghostController: {
				updateSurface() {},
				sendShioriEvent: async () => {},
			},
		},
	};

	const controller = new SakuraPlaybackController({ player });
	controller.setWaitMultiplier(2.0);

	await playScript(player, "\\0あ。\\w1\\e");

	// 40ms * 2.0 = 80ms, 140ms * 2.0 = 280ms, 50ms * 2.0 = 100ms
	assert.deepEqual(sleptDurations, [80, 280, 100]);
});

test("playScript resets balloonWait after playback finishes", async () => {
	const sakuraText = createEl("div");

	const player = {
		playbackId: 30,
		parse: async () => [
			{ type: "scope", value: 0 },
			{ type: "char", value: "A" },
		],
		sleep: () => Promise.resolve(),
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: () => {},
		onChoiceTimeout: () => {},
		scheduleSurfaceRestore: () => {},
		app: {
			ghostId: "main",
			elements: {
				balloonText: sakuraText,
				balloonDisplay: createEl("div"),
				keroBalloonText: createEl("div"),
				keroBalloonDisplay: createEl("div"),
			},
			surfaceManager: {
				onCharSpoken() {},
				onTalkEnd() {},
				onScriptEnd() {},
			},
			ghostController: {
				updateSurface() {},
				sendShioriEvent: async () => {},
			},
		},
	};

	const controller = new SakuraPlaybackController({ player });
	controller.setBalloonWait("200%");
	assert.equal(controller.getWaitMultiplier(), 2.0);

	await playScript(player, "\\0A\\e");

	// Controller should be reset back to 1.0 multiplier after script finishes
	assert.equal(controller.getWaitMultiplier(), 1.0);
});
