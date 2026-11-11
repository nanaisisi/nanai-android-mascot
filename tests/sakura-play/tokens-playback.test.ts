import assert from "node:assert/strict";
import { test } from "vitest";
import { createEl, events } from "./helpers.js";

const { playScript } = await import("../../ui/ts/ghost/sakura-play.js");

test("playScript covers all tokens (scope, char, newline, clear, pause, anchor, quick, wait, surface, animation, choice, balloon, timeout, halt, offset, font)", async () => {
	events.length = 0;
	const sakuraText = createEl("div");
	const keroText = createEl("div");

	const player = {
		playbackId: 1,
		parse: async () => [
			{ type: "scope", value: 1 },
			{ type: "font", tag: "bold", param: "1" },
			{ type: "font", tag: "italic", param: "true" },
			{ type: "font", tag: "underline", param: "1" },
			{ type: "font", tag: "strike", param: "1" },
			{ type: "font", tag: "color", param: "#ff0000" },
			{ type: "font", tag: "height", param: "16px" },
			{ type: "char", value: "あ" },
			{ type: "newline", half: false },
			{ type: "newline", half: true },
			{ type: "anchor_begin", id: "a1", args: [] },
			{ type: "char", value: "い" },
			{ type: "anchor_end" },
			{ type: "quick_toggle", value: true },
			{ type: "clear" },
			{ type: "pause" },
			{ type: "wait", value: 10 },
			{ type: "surface", value: 0 },
			{ type: "animation", animId: 1, wait: 0 },
			{ type: "choice", id: "c1", text: "Option1" },
			{ type: "balloon", value: 0 },
			{ type: "balloon", value: -1 },
			{ type: "timeout" },
			{ type: "offset", x: "10", y: "@5" },
			{ type: "font", tag: "default" },
			{ type: "scope", value: 0 },
			{ type: "char", value: "う" },
			{ type: "clear", mode: "char", count: 1 },
			{ type: "char", value: "え" },
			{ type: "newline", half: false },
			{ type: "char", value: "お" },
			{ type: "clear", mode: "line", count: 1 },
			{ type: "choice_timeout", timeout: 100 },
			{ type: "balloon_timeout", timeout: 100 },
			{ type: "halt" },
		],
		sleep: () => Promise.resolve(),
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
				keroBalloonText: keroText,
				keroBalloonDisplay: createEl("div"),
				sakuraSlot: createEl("div"),
				keroSlot: createEl("div"),
			},
			surfaceManager: {
				onCharSpoken() {},
				onTalkEnd() {},
				onScriptEnd() {},
				playAnimationById: async () => {},
			},
			ghostController: {
				updateSurface() {},
				sendShioriEvent: async () => {},
				closeGhost: async () => {},
			},
		},
	};

	await playScript(player, "\\0あ\\e");
	assert.equal(player.timeCritical, true);
});
