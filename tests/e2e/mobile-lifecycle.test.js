import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { createMockElement } from "./helpers.js";

const { SakuraScriptPlayer } = await import("../../ui/js/ghost/sakura-script.js");
const { parseSakuraScript } = await import(
	"../../ui/js/ghost/sakura-tokenizer.js"
);

test("E2E dialogue lifecycle Cycle 3: mobile lifecycle (AndroidBridge pause/resume), gesture resets, and extended dialogs", async () => {
	vi.useFakeTimers();

	const {
		AndroidBridge,
		ANDROID_EVENTS,
		ANDROID_LIFECYCLE_STATES,
		TouchGestureRecognizer,
	} = await import("../../ui/js/ui/touch/index.js");
	const { ModalDialogController } = await import(
		"../../ui/js/ui/renderers/modal-dialog-controller.js"
	);

	const events = [];
	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockDoc = {
		hidden: false,
		_listeners: {},
		addEventListener(type, handler) {
			this._listeners = this._listeners || {};
			this._listeners[type] = handler;
		},
		removeEventListener(type, handler) {
			if (this._listeners?.[type] === handler) {
				delete this._listeners[type];
			}
		},
		createElement: createMockElement,
	};
	const originalDoc = globalThis.document;
	globalThis.document = mockDoc;

	const mockApp = {
		ghostId: "e2e_mobile_ghost",
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
		},
	};

	const modalController = new ModalDialogController({ app: mockApp });
	mockApp.modalDialogController = modalController;

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script) => parseSakuraScript(script);

	// Setup Touch Recognizer & AndroidBridge integration
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
	const recognizer = new TouchGestureRecognizer(touchContainer);
	const bridge = new AndroidBridge({ gestureRecognizer: recognizer });

	// Listen to Android lifecycle state transitions
	bridge.on(ANDROID_EVENTS.STATE_CHANGED, ({ state }) => {
		events.push({ type: "android_lifecycle", state });
		if (state === ANDROID_LIFECYCLE_STATES.PAUSED) {
			player.playbackController?.pause();
		} else if (state === ANDROID_LIFECYCLE_STATES.ACTIVE) {
			player.playbackController?.resume();
		}
	});

	// 1. Long dialogue stream interrupted by Android app pause
	const mobileScript =
		"\\0Long dialogue playing\\w9\\w9\\w9and more speech before end\\e";
	const playPromise = player.play(mobileScript);

	// Advance dialogue halfway
	await vi.advanceTimersByTimeAsync(150);

	// Simulate pinch/touch in progress
	touchContainer.dispatchEvent(
		{
			type: "touchstart",
			touches: [
				{ clientX: 10, clientY: 10 },
				{ clientX: 30, clientY: 30 },
			],
		},
		"touchstart",
	);
	assert.equal(recognizer._isPinching, true, "Pinch gesture should be active");

	// Android enters background (PAUSE)
	mockDoc.hidden = true;
	mockDoc._listeners?.visibilitychange?.();

	assert.equal(
		recognizer._isPinching,
		false,
		"Recognizer must reset during Android backgrounding",
	);
	assert.ok(
		events.some(
			(e) =>
				e.type === "android_lifecycle" &&
				e.state === ANDROID_LIFECYCLE_STATES.PAUSED,
		),
		"Android lifecycle should emit PAUSED state",
	);

	// Resume Android app
	mockDoc.hidden = false;
	mockDoc._listeners?.visibilitychange?.();

	assert.ok(
		events.some(
			(e) =>
				e.type === "android_lifecycle" &&
				e.state === ANDROID_LIFECYCLE_STATES.ACTIVE,
		),
		"Android lifecycle should emit ACTIVE state",
	);

	// Finish playback
	await vi.runAllTimersAsync();
	await playPromise;

	// 2. Test extended dialog commands: passwordinput, textareabox, sliderinput, and targeted close
	// \![open,passwordinput]
	events.length = 0;
	const pwScript = "\\0\\![open,passwordinput,PwTest,--text=secret123]\\e";
	await player.play(pwScript);
	await vi.runAllTimersAsync();

	assert.ok(
		modalController.activeBoxes.has("inputbox:PwTest"),
		"Password input should be registered in ModalDialogController",
	);
	const pwForm = sakuraText.childNodes.find((c) =>
		c.className?.includes("balloon-inputbox-form"),
	);
	assert.ok(pwForm);
	const pwInput = pwForm.children.find((c) => c.tagName === "INPUT");
	assert.equal(pwInput.type, "password");
	assert.equal(pwInput.value, "secret123");

	// Close password input via \![close,inputbox,PwTest]
	const closePwScript = "\\0\\![close,inputbox,PwTest]\\e";
	await player.play(closePwScript);
	await vi.runAllTimersAsync();
	assert.equal(
		modalController.activeBoxes.has("inputbox:PwTest"),
		false,
		"Targeted closeInputBox should remove PwTest",
	);

	// \![open,textareabox] with \1 newline delimiter
	events.length = 0;
	const taScript = "\\0\\![open,textareabox,TaTest,--text=row1\\1row2]\\e";
	await player.play(taScript);
	await vi.advanceTimersByTimeAsync(100);

	assert.ok(
		modalController.activeBoxes.has("textareabox:TaTest"),
		"TextArea box should be registered",
	);
	const taForm = sakuraText.childNodes.find((c) =>
		c.className?.includes("balloon-inputbox-form"),
	);
	const taEl = taForm.children.find((c) => c.tagName === "TEXTAREA");
	assert.equal(taEl.value, "row1\nrow2");

	// Submit via Ctrl+Enter
	taEl.value = "saved row 1\nsaved row 2";
	taEl._listeners?.keydown?.({
		key: "Enter",
		ctrlKey: true,
		stopPropagation() {},
	});
	await vi.advanceTimersByTimeAsync(50);

	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnTextAreaInput" &&
				e.args[0] === "TaTest" &&
				e.args[1] === "saved row 1\u0001saved row 2",
		),
		"TextArea submission must serialize newlines to byte 1 \\1 and send OnTextAreaInput",
	);

	// \![open,sliderinput]
	events.length = 0;
	const sliderScript = "\\0\\![open,sliderinput,VolumeSlider,0,50,0,100]\\e";
	await player.play(sliderScript);
	await vi.advanceTimersByTimeAsync(100);

	assert.ok(
		modalController.activeBoxes.has("inputbox:VolumeSlider"),
		"Slider input should be registered",
	);
	const sliderForm = sakuraText.childNodes.find((c) =>
		c.className?.includes("balloon-inputbox-form"),
	);
	const sliderRange = sliderForm.children.find((c) => c.tagName === "INPUT");
	assert.equal(sliderRange.type, "range");
	assert.equal(sliderRange.min, "0");
	assert.equal(sliderRange.max, "100");
	assert.equal(sliderRange.value, "50");

	// Change slider value and submit
	sliderRange.value = "80";
	const sliderBtn = sliderForm.children.find((c) => c.tagName === "BUTTON");
	sliderBtn.click();
	await vi.runAllTimersAsync();

	assert.ok(
		events.some(
			(e) =>
				e.type === "shiori_event" &&
				e.eventName === "OnUserInput" &&
				e.args[0] === "VolumeSlider" &&
				e.args[1] === "80",
		),
		"Submitting slider input should fire OnUserInput with slider value",
	);

	// Restore
	globalThis.document = originalDoc;
	vi.useRealTimers();
});
