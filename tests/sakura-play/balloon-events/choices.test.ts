import assert from "node:assert/strict";
import { test } from "vitest";
import { createEl } from "../helpers.js";

const { playScript } = await import("../../../ui/js/ghost/sakura-play.js");
const { SakuraScriptPlayer } = await import(
	"../../../ui/js/ghost/sakura-script.js"
);

test("choice click triggers OnChoiceSelectEx first, then falls back to OnChoiceSelect if no script", async () => {
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

	const choiceBtn = sakuraText.children.find(
		(c: unknown) => c.tagName === "BUTTON",
	);
	assert.ok(choiceBtn);

	// Simulate user click
	choiceBtn._listeners.click({ stopPropagation() {} });
	await new Promise((r) => setTimeout(r, 20));

	assert.equal(shioriEvents.length, 2);
	// 1. OnChoiceSelectEx with Reference0: text, Reference1: ID, Reference2..N: args
	assert.equal((shioriEvents[0] as any).event, "OnChoiceSelectEx");
	assert.deepEqual((shioriEvents[0] as any).args, [
		"選択肢1",
		"opt1",
		"paramA",
		"paramB",
	]);

	// 2. Fallback to OnChoiceSelect
	assert.equal((shioriEvents[1] as any).event, "OnChoiceSelect");
	assert.deepEqual((shioriEvents[1] as any).args, ["opt1", "選択肢1"]);
});

test("choice click does not trigger OnChoiceSelect if OnChoiceSelectEx returns response script", async () => {
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

	const choiceBtn = sakuraText.children.find(
		(c: unknown) => c.tagName === "BUTTON",
	);
	assert.ok(choiceBtn);

	choiceBtn._listeners.click({ stopPropagation() {} });
	await new Promise((r) => setTimeout(r, 20));

	assert.equal(shioriEvents.length, 1);
	assert.equal((shioriEvents[0] as any).event, "OnChoiceSelectEx");
});
