import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import(
	"../../ui/ts/ghost/sakura-script.js"
);
const { parseSakuraScript } = await import(
	"../../ui/ts/ghost/sakura-tokenizer.js"
);

test("E2E dialogue lifecycle: SSP dialogs (inputbox, teachbox, communicatebox) and \\x[noclear] flow", async () => {
	vi.useFakeTimers();

	const events: {
		type: string;
		scope?: any;
		eventName?: any;
		args?: any;
		val?: any;
	}[] = [];
	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_ghost_ssp",
		elements: {
			balloonDisplay: sakuraDisplay,
			keroBalloonDisplay: keroDisplay,
			balloonText: sakuraText,
			keroBalloonText: keroText,
			sakuraSlot: createMockElement("div"),
			keroSlot: createMockElement("div"),
		},
		surfaceManager: {
			onCharSpoken() {},
			onTalkEnd() {},
			onScriptEnd(scope: any) {
				events.push({ type: "script_end", scope });
			},
		},
		ghostController: {
			updateSurface() {},
			sendShioriEvent: async (eventName: any, args: any) => {
				events.push({ type: "shiori_event", eventName, args });
			},
			sendTeachInput: async (val: any) => {
				events.push({ type: "teach_input", val });
			},
		},
	};

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script) => parseSakuraScript(script);

	// 1. Test \x[noclear] preserves balloon content across click/resume
	const pauseScript = "\\0Part 1\\x[noclear]Part 2\\e";
	const pausePromise = player.play(pauseScript);

	// Advance until pause is reached
	await vi.advanceTimersByTimeAsync(500);

	// Simulate user click to resolve pause
	player.resolvePause?.();
	await vi.runAllTimersAsync();
	await pausePromise;

	// Both Part 1 and Part 2 should be in textContent because noclear kept Part 1
	assert.ok(
		sakuraText.textContent.includes("Part 1") &&
			sakuraText.textContent.includes("Part 2"),
		"\\x[noclear] must retain previous text across pauses",
	);

	// 2. Test \![open,inputbox] E2E
	const inputScript = "\\0\\![open,inputbox,InputName,--text=DefaultValue]\\e";
	const inputPromise = player.play(inputScript);
	await vi.runAllTimersAsync();
	await inputPromise;

	// Verify input box form was inserted
	const inputForm = sakuraText.childNodes.find((n) =>
		n.className?.includes("balloon-inputbox-form"),
	);
	assert.ok(inputForm, "InputBox form should be rendered into balloon text");

	const inputEl = inputForm.childNodes.find((c) => c.tagName === "INPUT");
	const submitBtn = inputForm.childNodes.find((c) => c.tagName === "BUTTON");
	assert.ok(inputEl && submitBtn);
	assert.equal(inputEl.value, "DefaultValue");

	// Change input value and click submit
	inputEl.value = "NewUserValue";
	submitBtn.click();
	await vi.runAllTimersAsync();

	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnUserInput" &&
				e.args[0] === "InputName" &&
				e.args[1] === "NewUserValue",
		),
		"Submitting InputBox should send OnUserInput with id and new value",
	);

	// 3. Test \![open,communicatebox] E2E
	const commScript =
		"\\0\\![open,communicatebox,--text=HelloGhost,--reference=extra_ref]\\e";
	const commPromise = player.play(commScript);
	await vi.runAllTimersAsync();
	await commPromise;

	const commForm = sakuraText.childNodes.find((n) =>
		n.className?.includes("balloon-communicatebox-form"),
	);
	assert.ok(
		commForm,
		"CommunicateBox form should be rendered into balloon text",
	);

	const commInput = commForm.childNodes.find((c) => c.tagName === "INPUT");
	const commSubmit = commForm.childNodes.find((c) => c.tagName === "BUTTON");
	assert.ok(commInput && commSubmit);
	assert.equal(commInput.value, "HelloGhost");

	commSubmit.click();
	await vi.runAllTimersAsync();

	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnCommunicate" &&
				e.args[0] === "user" &&
				e.args[1] === "HelloGhost" &&
				e.args[2] === "extra_ref",
		),
		"Submitting CommunicateBox should send OnCommunicate with user, value, and extra reference",
	);

	// 4. Test \![open,teachbox] E2E
	const teachScript = "\\0\\![open,teachbox,teachbox,--text=TeachMe]\\e";
	const teachPromise = player.play(teachScript);
	await vi.runAllTimersAsync();
	await teachPromise;

	assert.ok(
		events.some(
			(e) => e.type === "shiori_event" && e.eventName === "OnTeachStart",
		),
		"Opening TeachBox should fire OnTeachStart",
	);

	const teachForm = sakuraText.childNodes.find(
		(n) =>
			n.className?.includes("balloon-inputbox-form") &&
			!n.className?.includes("balloon-communicatebox-form"),
	);
	assert.ok(teachForm, "TeachBox form should be rendered");

	const teachInput = teachForm.childNodes.find((c) => c.tagName === "INPUT");
	const teachSubmit = teachForm.childNodes.find((c) => c.tagName === "BUTTON");
	assert.ok(teachInput && teachSubmit);
	assert.equal(teachInput.value, "TeachMe");

	teachSubmit.click();
	await vi.runAllTimersAsync();

	assert.ok(
		events.some((e) => e.type === "teach_input" && e.val === "TeachMe"),
		"Submitting TeachBox should invoke sendTeachInput",
	);

	vi.useRealTimers();
});
