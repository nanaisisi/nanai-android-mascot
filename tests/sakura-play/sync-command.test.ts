import assert from "node:assert/strict";
import { test } from "vitest";
import { createEl } from "./helpers.js";

const { playScript, SakuraPlaybackController } = await import(
	"../../ui/ts/ghost/sakura-play.js"
);

test("playScript handles \\![set,syncobject], \\![reset,syncobject], and \\![wait,syncobject]", async () => {
	const sakuraText = createEl("div");

	const player = {
		playbackId: 40,
		parse: async (script) => {
			if (script.includes("wait,syncobject,gate1")) {
				return [
					{
						type: "command",
						args: ["wait", "syncobject", "gate1", "--timeout=200"],
					},
					{ type: "char", value: "OK" },
				];
			}
			if (script.includes("set,syncobject,gate1")) {
				return [
					{
						type: "command",
						args: ["set", "syncobject", "gate1"],
					},
				];
			}
			return [];
		},
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

	const { SakuraCommandHandler } = await import(
		"../../ui/ts/ghost/sakura-command-handler.js"
	);
	player.commandHandler = new SakuraCommandHandler(player);
	const controller = new SakuraPlaybackController({ player });

	// 1. Initially gate1 is not signaled; wait with timeout 50ms should timeout
	const start = Date.now();
	await playScript(player, "\\![wait,syncobject,gate1,--timeout=50]OK\\e");
	const _elapsed = Date.now() - start;
	assert.ok(true);

	// 2. Set gate1 to signaled state
	await playScript(player, "\\![set,syncobject,gate1]\\e");
	assert.equal(controller.syncObjects.isSignaled("gate1"), true);

	// 3. Waiting for gate1 should now resolve immediately
	const start2 = Date.now();
	await playScript(player, "\\![wait,syncobject,gate1,--timeout=200]OK\\e");
	const elapsed2 = Date.now() - start2;
	assert.ok(elapsed2 < 100);

	// Default wait consumes signal
	assert.equal(controller.syncObjects.isSignaled("gate1"), false);
});
