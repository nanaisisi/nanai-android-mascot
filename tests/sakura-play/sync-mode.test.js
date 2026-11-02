import assert from "node:assert/strict";
import { test } from "vitest";
import { createEl } from "./helpers.js";

const { playScript } = await import("../../ui/js/ghost/sakura-play.js");

test("playScript handles synchronized mode (\\_s) to mirror output across sakura and kero balloons", async () => {
	const sakuraText = createEl("div");
	const keroText = createEl("div");
	const spokenScopes = [];

	const player = {
		playbackId: 20,
		isSyncMode: false,
		parse: async () => [
			{ type: "scope", value: 0 },
			{ type: "sync_toggle", value: true },
			{ type: "char", value: "共" },
			{ type: "newline", half: false },
			{ type: "char", value: "同" },
			{ type: "sync_toggle", value: false },
			{ type: "char", value: "独" },
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
			},
			surfaceManager: {
				onCharSpoken(scope) {
					spokenScopes.push(scope);
				},
				onTalkEnd() {},
				onScriptEnd() {},
			},
			ghostController: {
				updateSurface() {},
				sendShioriEvent: async () => {},
			},
		},
	};

	await playScript(player, "\\_s共同\\_s独");

	// sakuraText receives: "共", newline, "同", "独"
	assert.equal(sakuraText.textContent, "共同独");
	// keroText receives mirrored: "共", newline, "同"
	assert.equal(keroText.textContent, "共同");
	// Both scopes 0 and 1 receive talk triggers during sync mode
	assert.equal(spokenScopes.includes(0), true);
	assert.equal(spokenScopes.includes(1), true);
});
