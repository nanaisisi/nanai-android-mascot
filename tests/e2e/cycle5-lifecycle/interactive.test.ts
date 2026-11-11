import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockApp, createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import(
	"../../../ui/js/ghost/sakura-script.js"
);
const { parseSakuraScript } = await import(
	"../../../ui/js/ghost/sakura-tokenizer.js"
);

test("Cycle 5: Interactive Choice & Anchor Hover Debounce E2E", async () => {
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

	events.length = 0;
	const choiceScript =
		"\\0Hover test:\\q[Button 1,id_btn1]\\_a[anchor_link]Anchor 1\\_a\\e";
	await player.play(choiceScript);

	const choiceBtn = sakuraText.childNodes.find((c: unknown) =>
		c.className?.includes("balloon-choice-btn"),
	);
	assert.ok(choiceBtn, "Choice button must exist in balloon");

	// Mouseenter -> advance 200ms -> should NOT fire OnChoiceHover yet (debounce is 500ms)
	choiceBtn.mouseenter();
	await new Promise((r) => setTimeout(r, 200));
	assert.equal(
		events.some((e) => e.eventName === "OnChoiceHover"),
		false,
		"OnChoiceHover must not fire before 500ms debounce threshold",
	);

	// Advance remaining 350ms -> should fire OnChoiceHover
	await new Promise((r) => setTimeout(r, 350));
	assert.ok(
		events.some(
			(e) => e.eventName === "OnChoiceHover" && e.args[0] === "Button 1",
		),
		"OnChoiceHover should fire after 500ms debounce",
	);

	// Rapid mouseenter then immediate mouseleave -> timer cancelled
	events.length = 0;
	choiceBtn.mouseenter();
	await new Promise((r) => setTimeout(r, 100));
	choiceBtn.mouseleave();
	await new Promise((r) => setTimeout(r, 500));
	assert.equal(
		events.some((e) => e.eventName === "OnChoiceHover"),
		false,
		"OnChoiceHover should be cancelled on rapid mouseleave",
	);

	// Anchor hover test
	events.length = 0;
	const anchorLink = sakuraText.childNodes.find((c: unknown) =>
		c.className?.includes("balloon-anchor"),
	);
	assert.ok(anchorLink, "Anchor link must exist in balloon");

	anchorLink.mouseenter();
	await new Promise((r) => setTimeout(r, 200));
	assert.equal(
		events.some((e) => e.eventName === "OnAnchorHover"),
		false,
		"OnAnchorHover must not fire before debounce completes",
	);
	await new Promise((r) => setTimeout(r, 350));
	assert.ok(
		events.some(
			(e) => e.eventName === "OnAnchorHover" && e.args[0] === "Anchor 1",
		),
		"OnAnchorHover should fire after 500ms debounce",
	);
});
