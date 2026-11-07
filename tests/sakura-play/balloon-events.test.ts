import assert from "node:assert/strict";
import { test } from "vitest";
import { createEl } from "./helpers.js";

const { playScript } = await import("../../ui/js/ghost/sakura-play.js");
const { SakuraScriptPlayer } = await import(
	"../../ui/js/ghost/sakura-script.js"
);

test("choice click triggers OnChoiceSelectEx first, then falls back to OnChoiceSelect if no script", async () => {
	const shioriEvents: any[] = [];
	const sakuraText = createEl("div");

	const app: any = {
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
			sendShioriEvent: async (event: string, args: any[]) => {
				if (event === "OnTranslate") return { script: null };
				shioriEvents.push({ event, args });
				// Return no content (empty/falsy) to simulate fallback
				return null;
			},
		},
	};

	const player = new SakuraScriptPlayer(app);
	player.parse = async () => [
		{ type: "scope", value: 0 },
		{
			type: "choice",
			id: "opt1",
			text: "選択肢1",
			args: ["paramA", "paramB"],
		},
	];
	player.sleep = () => Promise.resolve();
	player.waitForClickOrTimeout = () => Promise.resolve();
	player.scheduleSurfaceRestore = () => {};

	await playScript(player, "\\0\\q[選択肢1,opt1,paramA,paramB]\\e");

	const choiceBtn = sakuraText.children.find((c) => c.tagName === "BUTTON");
	assert.ok(choiceBtn);

	// Simulate user click
	choiceBtn._listeners.click({ stopPropagation() {} });
	await new Promise((r) => setTimeout(r, 20));

	assert.equal(shioriEvents.length, 2);
	// 1. OnChoiceSelectEx with Reference0: text, Reference1: ID, Reference2..N: args
	assert.equal(shioriEvents[0].event, "OnChoiceSelectEx");
	assert.deepEqual(shioriEvents[0].args, [
		"選択肢1",
		"opt1",
		"paramA",
		"paramB",
	]);

	// 2. Fallback to OnChoiceSelect
	assert.equal(shioriEvents[1].event, "OnChoiceSelect");
	assert.deepEqual(shioriEvents[1].args, ["opt1", "選択肢1"]);
});

test("choice click does not trigger OnChoiceSelect if OnChoiceSelectEx returns response script", async () => {
	const shioriEvents: any[] = [];
	const sakuraText = createEl("div");

	const app: any = {
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
			sendShioriEvent: async (event: string, args: any[]) => {
				if (event === "OnTranslate") return { script: null };
				shioriEvents.push({ event, args });
				if (event === "OnChoiceSelectEx") {
					return { script: "\\0了解しました。\\e" };
				}
				return null;
			},
		},
	};

	const player = new SakuraScriptPlayer(app);
	player.parse = async () => [
		{ type: "scope", value: 0 },
		{
			type: "choice",
			id: "opt2",
			text: "選択肢2",
		},
	];
	player.sleep = () => Promise.resolve();
	player.waitForClickOrTimeout = () => Promise.resolve();
	player.scheduleSurfaceRestore = () => {};

	await playScript(player, "\\0\\q[選択肢2,opt2]\\e");

	const choiceBtn = sakuraText.children.find((c) => c.tagName === "BUTTON");
	assert.ok(choiceBtn);

	choiceBtn._listeners.click({ stopPropagation() {} });
	await new Promise((r) => setTimeout(r, 20));

	assert.equal(shioriEvents.length, 1);
	assert.equal(shioriEvents[0].event, "OnChoiceSelectEx");
});

test("anchor click triggers OnAnchorSelectEx first, then falls back to OnAnchorSelect", async () => {
	const shioriEvents: any[] = [];
	const sakuraText = createEl("div");

	const app: any = {
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
			sendShioriEvent: async (event: string, args: any[]) => {
				if (event === "OnTranslate") return { script: null };
				shioriEvents.push({ event, args });
				return null;
			},
		},
	};

	const player: any = {
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
		player,
		"\\0\\_a[web_link,https://example.com]公式サイト\\_a\\e",
	);

	const anchorSpan = sakuraText.children.find(
		(c) => c.className === "balloon-anchor",
	);
	assert.ok(anchorSpan);

	await anchorSpan._listeners.click({ stopPropagation() {} });

	assert.equal(shioriEvents.length, 2);
	// 1. OnAnchorSelectEx
	assert.equal(shioriEvents[0].event, "OnAnchorSelectEx");
	assert.deepEqual(shioriEvents[0].args, [
		"公式サイト",
		"web_link",
		"https://example.com",
	]);

	// 2. Fallback to OnAnchorSelect
	assert.equal(shioriEvents[1].event, "OnAnchorSelect");
	assert.deepEqual(shioriEvents[1].args, ["web_link", "https://example.com"]);
});

test("balloon events: OnBalloonClose on clear (\\c) and OnBalloonBreak on skip", async () => {
	const notifyEvents: any[] = [];
	const sakuraText = createEl("div");

	const app: any = {
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
			sendBalloonCloseNotify: async (lastScript: string) => {
				notifyEvents.push({ event: "OnBalloonClose", script: lastScript });
			},
			sendBalloonBreakNotify: async (
				script: string,
				scopeId: number,
				position: number,
			) => {
				notifyEvents.push({
					event: "OnBalloonBreak",
					script,
					scopeId,
					position,
				});
			},
		},
	};

	const player = new SakuraScriptPlayer(app);
	player.parse = async () => [
		{ type: "scope", value: 0 },
		{ type: "char", value: "A" },
		{ type: "clear", mode: "all" },
	];
	player.sleep = () => Promise.resolve();
	player.waitForClickOrTimeout = () => Promise.resolve();
	player.scheduleSurfaceRestore = () => {};

	// 1. Play script with clear token
	await playScript(player, "\\0A\\c\\e");
	assert.ok(notifyEvents.some((e) => e.event === "OnBalloonClose"));

	// 2. Test skip triggering OnBalloonBreak
	player.isPlaying = true;
	player.currentScope = 1;
	(player as any).currentProgressIndex = 5;
	player.lastScript = "\\1テスト会話";
	player.skip();

	const breakEvent = notifyEvents.find((e) => e.event === "OnBalloonBreak");
	assert.ok(breakEvent);
	assert.equal(breakEvent.script, "\\1テスト会話");
	assert.equal(breakEvent.scopeId, 1);
	assert.equal(breakEvent.position, 5);
});
