import assert from "node:assert/strict";
import { test } from "vitest";
import { createEl } from "../helpers.js";

const { playScript } = await import("../../../ui/js/ghost/sakura-play.js");

test("anchor click triggers OnAnchorSelectEx first, then falls back to OnAnchorSelect", async () => {
	const shioriEvents: unknown[] = [];
	const sakuraText = createEl("div");

	const app: Record<string, unknown> = {
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
			sendShioriEvent: async (event: string, args: unknown[]) => {
				if (event === "OnTranslate") return { script: null };
				shioriEvents.push({ event, args });
				return null;
			},
		},
	};

	const player: Record<string, unknown> = {
		playbackId: 60,
		parse: async () => [
			{ type: "scope", value: 0 },
			{ type: "anchor_begin", id: "web_link", args: ["https://example.com"] },
			{ type: "char", value: "公式サイト" },
			{ type: "anchor_end" },
		],
		sleep: () => Promise.resolve(),
		waitForClickOrTimeout: () => Promise.resolve(),
		scheduleSurfaceRestore: () => {},
		app,
	};

	await playScript(
		player as unknown,
		"\\0\\_a[web_link,https://example.com]公式サイト\\_a\\e",
	);

	const anchorSpan = sakuraText.children.find(
		(c: unknown) => c.className === "balloon-anchor",
	);
	assert.ok(anchorSpan);

	await anchorSpan._listeners.click({ stopPropagation() {} });

	assert.equal(shioriEvents.length, 2);
	// 1. OnAnchorSelectEx
	assert.equal((shioriEvents[0] as unknown).event, "OnAnchorSelectEx");
	assert.deepEqual((shioriEvents[0] as unknown).args, [
		"公式サイト",
		"web_link",
		"https://example.com",
	]);

	// 2. Fallback to OnAnchorSelect
	assert.equal((shioriEvents[1] as unknown).event, "OnAnchorSelect");
	assert.deepEqual((shioriEvents[1] as unknown).args, [
		"web_link",
		"https://example.com",
	]);
});
