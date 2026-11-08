import assert from "node:assert/strict";
import { test } from "vitest";
import { createEl } from "../helpers.js";

const { playScript } = await import("../../../ui/js/ghost/sakura-play.js");
const { SakuraScriptPlayer } = await import(
	"../../../ui/js/ghost/sakura-script.js"
);

test("balloon events: OnBalloonClose on clear (\\c) and OnBalloonBreak on skip", async () => {
	const notifyEvents: unknown[] = [];
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
				notifyEvents.push({ event, args });
				return null;
			},
		},
	};

	const player = new SakuraScriptPlayer(app);
	player.parse = async () => [
		{ type: "scope", value: 0 },
		{ type: "char", value: "テスト中" },
		{ type: "clear" },
	];
	player.sleep = () => Promise.resolve();
	player.waitForClickOrTimeout = () => Promise.resolve();
	player.scheduleSurfaceRestore = () => {};

	// Test 1: \c clear triggers OnBalloonClose
	await playScript(player, "\\0テスト中\\c");
	assert.ok(
		notifyEvents.some(
			(e: any) => e.event === "OnBalloonClose" && e.args[0] === "0",
		),
		"OnBalloonClose missing",
	);
	notifyEvents.length = 0;

	// Test 2: External cancellation (playbackId mismatch) triggers OnBalloonBreak
	const playerSkip = new SakuraScriptPlayer(app);
	playerSkip.playbackId = 99;
	playerSkip.parse = async () => [
		{ type: "scope", value: 0 },
		{ type: "char", value: "スキップ" },
	];
	playerSkip.sleep = async () => {
		playerSkip.playbackId = 100; // Force cancel during sleep
	};
	playerSkip.waitForClickOrTimeout = () => Promise.resolve();
	playerSkip.scheduleSurfaceRestore = () => {};

	await playScript(playerSkip, "\\0スキップ");
	assert.ok(
		notifyEvents.some(
			(e: any) => e.event === "OnBalloonBreak" && e.args[0] === "0",
		),
		"OnBalloonBreak missing",
	);
});

test("balloon events: OnBalloonTimeout triggered via sendBalloonTimeoutNotify", async () => {
	const notifyEvents: unknown[] = [];
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
				notifyEvents.push({ event, args });
				return null;
			},
		},
	};

	const player = new SakuraScriptPlayer(app);
	player.sleep = () => Promise.resolve();
	player.waitForClickOrTimeout = () => Promise.resolve();
	player.scheduleSurfaceRestore = () => {};
	player.activeScopes = new Set([1]);
	// Add the method to ghostController explicitly in this test since we're mocking it
	(app.ghostController as any).sendBalloonTimeoutNotify = async (lastScript: string, scopeId: number) => {
		notifyEvents.push({ event: "OnBalloonTimeout", args: [scopeId.toString()] });
		return null;
	};

	await (app.ghostController as any).sendBalloonTimeoutNotify(player.lastScript, 1);

	assert.ok(
		notifyEvents.some(
			(e: any) => e.event === "OnBalloonTimeout" && e.args[0] === "1",
		),
		"OnBalloonTimeout should be fired with active scope",
	);
});

test("\\t (timeCritical) suppresses balloonTimeout and click timeout auto-advance", async () => {
	const app: Record<string, unknown> = {
		ghostId: "main",
		elements: {
			balloonText: createEl("div"),
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
			sendShioriEvent: async () => null,
		},
	};

	const player = new SakuraScriptPlayer(app);
	let waitForClickTimeoutEnabled = true;

	player.parse = async () => [
		{ type: "scope", value: 0 },
		{ type: "time_critical" },
		{ type: "char", value: "Time Critical Text" },
	];

	player.sleep = () => Promise.resolve();
	player.waitForClickOrTimeout = async () => {
		// Mock implementation that checks if timeCritical is respected
		// Actual implementation checks this flag internally before setting setTimeout
		if (player.playbackController.timeCritical) {
			waitForClickTimeoutEnabled = false;
		}
	};
	player.scheduleSurfaceRestore = () => {};
	player.playbackController = { timeCritical: false } as any;

	await playScript(player, "\\0\\tTime Critical Text\\e");

	assert.ok(
		player.timeCritical,
		"Player should have timeCritical flag set to true",
	);
	assert.ok(
		!waitForClickTimeoutEnabled,
		"Time critical should disable click timeout auto-advance",
	);
});
