import assert from "node:assert/strict";
import { test, vi } from "vitest";

function createMockElement(tag) {
	const children = [];
	return {
		tagName: String(tag || "").toUpperCase(),
		textContent: "",
		innerHTML: "",
		style: {},
		dataset: {},
		childNodes: children,
		get lastChild() {
			return children[children.length - 1] || null;
		},
		appendChild(node) {
			node.parentNode = this;
			children.push(node);
			if (typeof node === "string") {
				this.textContent += node;
			} else if (node?.textContent) {
				this.textContent += node.textContent;
			}
		},
		removeChild(node) {
			const idx = children.indexOf(node);
			if (idx !== -1) {
				children.splice(idx, 1);
			}
		},
		remove() {
			if (this.parentNode) {
				this.parentNode.removeChild(this);
			}
		},
		setAttribute(name, val) {
			this[name] = val;
		},
		addEventListener(type, cb) {
			this._listeners = this._listeners || {};
			this._listeners[type] = cb;
		},
		removeEventListener(_type, _cb) {},
		click() {
			this._listeners?.click?.({ stopPropagation() {} });
		},
		mouseenter() {
			this._listeners?.mouseenter?.();
		},
		mouseleave() {
			this._listeners?.mouseleave?.();
		},
		focus() {},
		blur() {},
	};
}

globalThis.window = globalThis;
globalThis.document = {
	createElement: createMockElement,
	addEventListener(_type, _cb) {},
	removeEventListener(_type, _cb) {},
};

const { SakuraScriptPlayer } = await import("../ui/js/ghost/sakura-script.js");
const { parseSakuraScript } = await import(
	"../ui/js/ghost/sakura-tokenizer.js"
);

test("E2E dialogue lifecycle: boot -> speech -> choice select -> surface change -> script end", async () => {
	vi.useFakeTimers();

	const events = [];
	const surfaceHistory = [];

	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_ghost",
		currentBalloonTheme: "default",
		elements: {
			balloonDisplay: sakuraDisplay,
			keroBalloonDisplay: keroDisplay,
			balloonText: sakuraText,
			keroBalloonText: keroText,
			sakuraSlot: createMockElement("div"),
			keroSlot: createMockElement("div"),
		},
		surfaceManager: {
			onCharSpoken(_scope) {},
			onTalkEnd(_scope) {},
			onScriptEnd(_scope) {
				events.push({ type: "script_end", scope: _scope });
			},
			playAnimationById: async (animId, scope, wait) => {
				events.push({ type: "play_anim", animId, scope, wait });
			},
		},
		ghostController: {
			updateSurface(surfaceId, scope) {
				surfaceHistory.push({ surfaceId, scope });
			},
			sendShioriEvent: async (eventName, args) => {
				events.push({ type: "shiori_event", eventName, args });
			},
			closeGhost: async () => {
				events.push({ type: "close_ghost" });
			},
		},
	};

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script) => parseSakuraScript(script);

	// Multi-scope script with choice, inline pause, surface changes, and end
	const fullDialogueScript =
		"\\0\\s[0]Hello master!\\w9\\1\\s[10]Kero here.\\w9\\0\\s[1]Choose an option:\\q[Option A,id_a]\\q[Option B,id_b]\\e";

	const playPromise = player.play(fullDialogueScript);

	// Let the script advance through timers
	await vi.runAllTimersAsync();
	await playPromise;

	// Verify surface updates
	assert.ok(
		surfaceHistory.some((s) => s.scope === 0 && s.surfaceId === 0),
		"Scope 0 surface 0 should be set",
	);
	assert.ok(
		surfaceHistory.some((s) => s.scope === 1 && s.surfaceId === 10),
		"Scope 1 surface 10 should be set",
	);
	assert.ok(
		surfaceHistory.some((s) => s.scope === 0 && s.surfaceId === 1),
		"Scope 0 surface 1 should be set",
	);

	// Verify script end triggered
	assert.ok(
		events.some((e) => e.type === "script_end"),
		"Script end event should be emitted",
	);

	// Trigger choice selection
	await player.onChoiceSelected("id_a", "Option A");
	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnChoiceSelect" &&
				e.args[0] === "id_a",
		),
		"OnChoiceSelect should be dispatched to SHIORI",
	);

	vi.useRealTimers();
});

test("E2E dialogue lifecycle: SSP dialogs (inputbox, teachbox, communicatebox) and \\x[noclear] flow", async () => {
	vi.useFakeTimers();

	const events = [];
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
			onScriptEnd(scope) {
				events.push({ type: "script_end", scope });
			},
		},
		ghostController: {
			updateSurface() {},
			sendShioriEvent: async (eventName, args) => {
				events.push({ type: "shiori_event", eventName, args });
			},
			sendTeachInput: async (val) => {
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
