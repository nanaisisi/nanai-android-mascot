import assert from "node:assert/strict";
import { test } from "vitest";
import { createEl } from "./helpers.js";

const { playScript } = await import("../../ui/ts/ghost/sakura-play.js");

test("playScript handles OnChoiceEnter, OnChoiceHover debounce and cancellation", async () => {
	const shioriEvents = [];
	const sakuraText = createEl("div");

	const player = {
		playbackId: 40,
		choiceTimeout: 0,
		parse: async () => [
			{ type: "scope", value: 0 },
			{
				type: "choice",
				id: "choice1",
				text: "選択肢1",
				args: ["arg1", "arg2"],
			},
		],
		sleep: () => Promise.resolve(),
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: () => {},
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
				sendShioriEvent: async (event, args) => {
					if (event === "OnTranslate") return { script: null };
					shioriEvents.push({ event, args });
				},
			},
		},
	};

	await playScript(player, "\\0\\q[選択肢1,choice1,arg1,arg2]\\e");

	const choiceBtn = sakuraText.children.find((c) => c.tagName === "BUTTON");
	assert.ok(choiceBtn);

	// Mouse enter triggers OnChoiceEnter immediately
	choiceBtn._listeners.mouseenter();
	assert.equal(shioriEvents.length, 1);
	assert.equal(shioriEvents[0].event, "OnChoiceEnter");
	assert.deepEqual(shioriEvents[0].args, [
		"選択肢1",
		"choice1",
		"arg1",
		"arg2",
	]);

	// Fast leave cancels hover timer before 500ms
	choiceBtn._listeners.mouseleave();
	assert.equal(shioriEvents.length, 2);
	assert.equal(shioriEvents[1].event, "OnChoiceEnter");
	assert.deepEqual(shioriEvents[1].args, []);

	await new Promise((r) => setTimeout(r, 550));
	// Still 2 events because mouseleave cancelled OnChoiceHover
	assert.equal(shioriEvents.length, 2);

	// Mouse enter and stay for 550ms triggers OnChoiceHover
	choiceBtn._listeners.mouseenter();
	assert.equal(shioriEvents.length, 3);
	await new Promise((r) => setTimeout(r, 550));
	assert.equal(shioriEvents.length, 4);
	assert.equal(shioriEvents[3].event, "OnChoiceHover");
	assert.deepEqual(shioriEvents[3].args, [
		"選択肢1",
		"choice1",
		"arg1",
		"arg2",
	]);
});

test("playScript handles OnAnchorEnter, OnAnchorHover debounce and cancellation", async () => {
	const shioriEvents = [];
	const sakuraText = createEl("div");

	const player = {
		playbackId: 50,
		parse: async () => [
			{ type: "scope", value: 0 },
			{ type: "anchor_begin", id: "anchor1", args: ["extra1"] },
			{ type: "char", value: "リンク" },
			{ type: "anchor_end" },
		],
		sleep: () => Promise.resolve(),
		waitForClickOrTimeout: () => Promise.resolve(),
		onChoiceSelected: () => {},
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
				sendShioriEvent: async (event, args) => {
					if (event === "OnTranslate") return { script: null };
					shioriEvents.push({ event, args });
				},
			},
		},
	};

	await playScript(player, "\\0\\_a[anchor1,extra1]リンク\\_a\\e");

	const anchorSpan = sakuraText.children.find(
		(c) => c.className === "balloon-anchor",
	);
	assert.ok(anchorSpan);

	// Mouse enter triggers OnAnchorEnter immediately
	anchorSpan._listeners.mouseenter();
	assert.equal(shioriEvents.length, 1);
	assert.equal(shioriEvents[0].event, "OnAnchorEnter");
	assert.deepEqual(shioriEvents[0].args, ["リンク", "anchor1", "extra1"]);

	// Staying for 550ms triggers OnAnchorHover
	await new Promise((r) => setTimeout(r, 550));
	assert.equal(shioriEvents.length, 2);
	assert.equal(shioriEvents[1].event, "OnAnchorHover");
	assert.deepEqual(shioriEvents[1].args, ["リンク", "anchor1", "extra1"]);

	// Mouse leave triggers OnAnchorEnter with empty args
	anchorSpan._listeners.mouseleave();
	assert.equal(shioriEvents.length, 3);
	assert.equal(shioriEvents[2].event, "OnAnchorEnter");
	assert.deepEqual(shioriEvents[2].args, []);
});
