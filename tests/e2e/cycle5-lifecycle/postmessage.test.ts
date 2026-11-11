import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockApp, createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import(
	"../../../ui/ts/ghost/sakura-script.js"
);
const { parseSakuraScript } = await import(
	"../../../ui/ts/ghost/sakura-tokenizer.js"
);

test("Cycle 5: PostMessage (\\m[umsg,wparam,lparam]) Tokenization and Playback", async () => {
	const events: unknown[] = [];
	const runningAnimations = new Set<number>();
	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = createMockApp(
		events,
		runningAnimations,
		sakuraDisplay,
		keroDisplay,
		sakuraText,
		keroText,
	);

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script: string) => parseSakuraScript(script);
	player.sleep = () => Promise.resolve();

	const postMsgScript = "\\0\\m[1024,10,20]PostMessage executed\\e";
	const tokens = await player.parse(postMsgScript);
	const postMsgToken = tokens.find((t: unknown) => t.type === "post_message");
	assert.ok(postMsgToken, "Token type post_message should be parsed");
	assert.equal(postMsgToken.umsg, "1024");
	assert.equal(postMsgToken.wparam, "10");
	assert.equal(postMsgToken.lparam, "20");

	// Playback should tolerate post_message without error
	await player.play(postMsgScript);
	assert.ok(sakuraText.textContent?.includes("PostMessage executed"));
});
