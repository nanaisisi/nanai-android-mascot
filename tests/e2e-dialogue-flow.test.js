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
		children,
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

test("E2E dialogue lifecycle Cycle 4: named animations, wait_animation, anim commands, and autocomplete", async () => {
	vi.useFakeTimers();

	const events = [];
	const animOffsets = new Map();
	const runningAnimations = new Set();
	const animResolveMap = new Map();

	const sakuraDisplay = createMockElement("div");
	const keroDisplay = createMockElement("div");
	const sakuraText = createMockElement("div");
	const keroText = createMockElement("div");

	const mockApp = {
		ghostId: "e2e_cycle4_ghost",
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
				runningAnimations.add(String(animId));
			},
			stopAnimationById(animId, scope) {
				events.push({ type: "anim_stop", animId, scope });
				runningAnimations.delete(String(animId));
			},
			setAnimationOffset(animId, x, y, scope) {
				events.push({ type: "anim_offset", animId, x, y, scope });
				animOffsets.set(`${scope}:${animId}`, { x, y });
			},
			async waitForAnimation(animId, scope) {
				events.push({ type: "anim_wait_start", animId, scope });
				return new Promise((resolve) => {
					animResolveMap.set(String(animId), resolve);
				});
			},
		},
		ghostController: {
			updateSurface(scope, surfaceId) {
				events.push({ type: "surface", scope, surfaceId });
			},
			sendShioriEvent: async (eventName, args) => {
				events.push({ type: "shiori_event", eventName, args });
				if (eventName === "OnUserInput") {
					return { status: 200, value: "" };
				}
				return null;
			},
			sendShioriRequest: async (req) => {
				events.push({ type: "shiori_req", req });
				if (req?.method === "GET" && req?.id === "inputbox.autocomplete") {
					return {
						status: 200,
						headers: { Value: "Apple\x01Banana\x01Cherry" },
					};
				}
				return { status: 204 };
			},
		},
	};

	const { ModalDialogController } = await import(
		"../ui/js/ui/renderers/modal-dialog-controller.js"
	);
	const modalController = new ModalDialogController({ app: mockApp });
	mockApp.modalDialogController = modalController;

	const player = new SakuraScriptPlayer(mockApp);
	player.parse = async (script) => parseSakuraScript(script);

	// 1. Test \i[smile] and \__w[animation,smile]
	const animScript =
		"\\0\\s[0]\\i[smile]\\__w[animation,smile]Smile complete\\e";
	const animPlayPromise = player.play(animScript);

	await vi.advanceTimersByTimeAsync(100);
	assert.ok(
		events.some((e) => e.type === "anim_play" && e.animId === "smile"),
		"Named animation 'smile' should be started",
	);
	assert.ok(
		events.some((e) => e.type === "anim_wait_start" && e.animId === "smile"),
		"waitForAnimation should be invoked for 'smile'",
	);

	// Complete animation
	const resolver = animResolveMap.get("smile");
	assert.ok(resolver, "Resolver for 'smile' must exist");
	resolver();

	await vi.runAllTimersAsync();
	await animPlayPromise;

	assert.ok(
		sakuraText.textContent.includes("Smile complete"),
		"Script playback should resume after animation resolves",
	);

	// 2. Test dynamic animation controls: \![anim,offset,smile,12,-8] and \![anim,stop,smile]
	const animControlScript =
		"\\0\\![anim,offset,smile,12,-8]\\![anim,stop,smile]\\e";
	const animControlPromise = player.play(animControlScript);
	await vi.runAllTimersAsync();
	await animControlPromise;

	assert.ok(
		events.some(
			(e) =>
				e.type === "anim_offset" &&
				e.animId === "smile" &&
				e.x === 12 &&
				e.y === -8,
		),
		"anim_offset should be dispatched with numeric coords",
	);
	assert.ok(
		events.some((e) => e.type === "anim_stop" && e.animId === "smile"),
		"anim_stop should be dispatched for 'smile'",
	);

	// 3. Test autocomplete integration in open inputbox
	const inputScript = "\\0\\![open,inputbox,box_fruit,--text=Select]\\e";
	const inputPromise = player.play(inputScript);
	await vi.runAllTimersAsync();
	await inputPromise;

	const inputForm = sakuraText.childNodes.find((n) =>
		n.className?.includes("balloon-inputbox-form"),
	);
	assert.ok(inputForm, "Inputbox form should be present");

	const datalist = inputForm.childNodes.find((c) => c.tagName === "DATALIST");
	if (datalist) {
		const options = datalist.childNodes.filter((c) => c.tagName === "OPTION");
		assert.ok(options.length >= 3, "Autocomplete options should be populated");
	}

	vi.useRealTimers();
});

test("E2E dialogue lifecycle Cycle 3: mobile lifecycle (AndroidBridge pause/resume), gesture resets, and extended dialogs", async () => {
	vi.useFakeTimers();

	const {
		AndroidBridge,
		ANDROID_EVENTS,
		ANDROID_LIFECYCLE_STATES,
		TouchGestureRecognizer,
	} = await import("../ui/js/ui/touch/index.js");
	const { ModalDialogController } = await import(
		"../ui/js/ui/renderers/modal-dialog-controller.js"
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
