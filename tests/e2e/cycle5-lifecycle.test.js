import assert from "node:assert/strict";
import { test } from "vitest";
import { createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import(
	"../../ui/js/ghost/sakura-script.js"
);
const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);
const { ModalDialogController } = await import(
	"../../ui/js/ui/renderers/modal-dialog-controller.js"
);
const { AndroidBridge, ANDROID_EVENTS, TouchGestureRecognizer } = await import(
	"../../ui/js/ui/touch/index.js"
);

test("E2E dialogue lifecycle Cycle 5: date/time/ip input dialogs, dock/snap touch coordination, SERIKO pattern controls, hover debounce, and PostMessage", async () => {
	const events = [];
	const runningAnimations = new Set();
	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_cycle5_ghost",
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
			playAnimationById(animId, scope, wait) {
				events.push({ type: "anim_play", animId, scope, wait });
				runningAnimations.add(Number(animId));
			},
			stopAnimationById(animId, scope) {
				events.push({ type: "anim_stop", animId, scope });
				runningAnimations.delete(Number(animId));
			},
			isAnimationRunning(animId) {
				return runningAnimations.has(Number(animId));
			},
		},
		ghostController: {
			updateSurface() {},
			sendShioriEvent: async (eventName, args) => {
				events.push({ type: "shiori_event", eventName, args });
				return { status: 200, value: "" };
			},
		},
	};

	const modalController = new ModalDialogController({ app: mockApp });
	mockApp.modalDialogController = modalController;

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script) => parseSakuraScript(script);
	// Speed up playback sleep during test
	player.sleep = () => Promise.resolve();

	// ----------------------------------------------------
	// 1. Extended Modal Input Dialogs (\![open,dateinput], timeinput, ipinput) E2E
	// ----------------------------------------------------

	// DateInput
	events.length = 0;
	const dateScript =
		"\\0\\![open,dateinput,DateID,0,2026,11,3,--reference=ref_date]\\e";
	await player.play(dateScript);

	assert.ok(
		modalController.activeBoxes.has("inputbox:DateID"),
		"dateinput should be registered in ModalDialogController",
	);
	const dateForm = sakuraText.childNodes.find((c) =>
		c.className?.includes("balloon-inputbox-form"),
	);
	assert.ok(dateForm, "DateInput form element must be appended");
	const dateInputEl = dateForm.children.find((c) => c.tagName === "INPUT");
	assert.equal(dateInputEl.value, "2026-11-03");

	// Submit DateInput
	const dateSubmitBtn = dateForm.children.find((c) => c.tagName === "BUTTON");
	dateSubmitBtn.click();
	await new Promise((r) => setTimeout(r, 10));

	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnUserInput" &&
				e.args[0] === "DateID" &&
				e.args[1] === "2026,11,3" &&
				e.args[3] === "ref_date",
		),
		"DateInput should submit OnUserInput with date CSV and reference",
	);

	// TimeInput
	events.length = 0;
	const timeScript =
		"\\0\\![open,timeinput,TimeID,0,12,30,45,--reference=ref_time]\\e";
	await player.play(timeScript);

	assert.ok(
		modalController.activeBoxes.has("inputbox:TimeID"),
		"timeinput should be registered in ModalDialogController",
	);
	const timeForm = sakuraText.childNodes.find((c) =>
		c.className?.includes("balloon-inputbox-form"),
	);
	const timeInputEl = timeForm.children.find((c) => c.tagName === "INPUT");
	assert.equal(timeInputEl.value, "12:30:45");

	// Submit TimeInput
	const timeSubmitBtn = timeForm.children.find((c) => c.tagName === "BUTTON");
	timeSubmitBtn.click();
	await new Promise((r) => setTimeout(r, 10));

	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnUserInput" &&
				e.args[0] === "TimeID" &&
				e.args[1] === "12,30,45" &&
				e.args[3] === "ref_time",
		),
		"TimeInput should submit OnUserInput with time CSV",
	);

	// IpInput
	events.length = 0;
	const ipScript =
		"\\0\\![open,ipinput,IpID,0,192,168,0,1,--reference=ref_ip]\\e";
	await player.play(ipScript);

	assert.ok(
		modalController.activeBoxes.has("inputbox:IpID"),
		"ipinput should be registered in ModalDialogController",
	);
	const ipForm = sakuraText.childNodes.find((c) =>
		c.className?.includes("balloon-inputbox-form"),
	);
	const ipInputEls = ipForm.children.filter((c) => c.tagName === "INPUT");
	assert.equal(ipInputEls.length, 4);
	assert.equal(ipInputEls[0].value, "192");
	assert.equal(ipInputEls[3].value, "1");

	// Submit IpInput via form Enter keydown
	ipForm._listeners?.keydown?.({ key: "Enter", stopPropagation() {} });
	await new Promise((r) => setTimeout(r, 10));

	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnUserInput" &&
				e.args[0] === "IpID" &&
				e.args[1] === "192,168,0,1" &&
				e.args[3] === "ref_ip",
		),
		"IpInput should submit OnUserInput with 4-octet IP and reference",
	);

	// Close dialogs with \![close,dialog,ID]
	events.length = 0;
	modalController.openDateInput(["CloseDateID", "--option=noclose"]);
	assert.ok(modalController.activeBoxes.has("inputbox:CloseDateID"));
	await player.play("\\0\\![close,dialog,CloseDateID]\\e");
	assert.equal(
		modalController.activeBoxes.has("inputbox:CloseDateID"),
		false,
		"closeDialog should close CloseDateID",
	);

	// ----------------------------------------------------
	// 2. Touch Snap Gesture & Mobile Dock Coordination E2E
	// ----------------------------------------------------
	const listeners = {};
	const touchContainer = {
		...createMockElement("div"),
		listeners,
		addEventListener(type, fn) {
			if (!listeners[type]) listeners[type] = [];
			listeners[type].push(fn);
		},
		removeEventListener(type, fn) {
			if (!listeners[type]) return;
			listeners[type] = listeners[type].filter((f) => f !== fn);
		},
		dispatchEvent(event, type) {
			const eventType = type || event.type;
			const fns = listeners[eventType] || [];
			for (const fn of fns) fn(event);
		},
	};

	const recognizer = new TouchGestureRecognizer(touchContainer, {
		screenWidth: 360,
		snapThreshold: 50,
	});
	const bridge = new AndroidBridge({ gestureRecognizer: recognizer });

	let dockReported = null;
	bridge.on(ANDROID_EVENTS.DOCK_CHANGED, ({ dockState }) => {
		dockReported = dockState;
	});

	// Trigger touch swipe near right screen edge (x=330, threshold=50, screenWidth=360)
	touchContainer.dispatchEvent(
		{
			type: "touchstart",
			touches: [{ clientX: 200, clientY: 300 }],
		},
		"touchstart",
	);
	touchContainer.dispatchEvent(
		{
			type: "touchmove",
			touches: [{ clientX: 330, clientY: 300 }],
		},
		"touchmove",
	);
	touchContainer.dispatchEvent(
		{
			type: "touchend",
			touches: [],
			changedTouches: [{ clientX: 330, clientY: 300 }],
		},
		"touchend",
	);

	assert.equal(recognizer.getDockState(), "right");
	assert.equal(dockReported, "right");
	assert.equal(bridge.getDockMode(), "right");

	// Dialogue stream execution during docked state
	const dockDialogueScript = "\\0\\s[0]Docked speech smoothly plays.\\w9\\e";
	await player.play(dockDialogueScript);

	assert.ok(
		sakuraText.textContent.includes("Docked speech smoothly plays."),
		"Dialogue should play without disruption in docked state",
	);

	// Undock via dock API
	bridge.setDockMode("none");
	assert.equal(bridge.getDockMode(), "none");
	assert.equal(recognizer.getDockState(), "none");

	// ----------------------------------------------------
	// 3. PostMessage (\m[umsg,wparam,lparam]) Tokenization and Playback
	// ----------------------------------------------------
	const postMsgScript = "\\0\\m[1024,10,20]PostMessage executed\\e";
	const tokens = await player.parse(postMsgScript);
	const postMsgToken = tokens.find((t) => t.type === "post_message");
	assert.ok(postMsgToken, "Token type post_message should be parsed");
	assert.equal(postMsgToken.umsg, "1024");
	assert.equal(postMsgToken.wparam, "10");
	assert.equal(postMsgToken.lparam, "20");

	// Playback should tolerate post_message without error
	await player.play(postMsgScript);
	assert.ok(sakuraText.textContent.includes("PostMessage executed"));

	// ----------------------------------------------------
	// 4. Interactive Choice & Anchor Hover Debounce E2E
	// ----------------------------------------------------
	events.length = 0;
	const choiceScript =
		"\\0Hover test:\\q[Button 1,id_btn1]\\_a[anchor_link]Anchor 1\\_a\\e";
	await player.play(choiceScript);

	const choiceBtn = sakuraText.childNodes.find((c) =>
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
	const anchorLink = sakuraText.childNodes.find((c) =>
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

	bridge.destroy();
	recognizer.destroy();
});
