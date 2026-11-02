import assert from "node:assert/strict";
import { test, vi } from "vitest";

globalThis.window = globalThis;

let createdElements = [];
globalThis.document = {
	createElement(tag) {
		const el = {
			tagName: tag.toUpperCase(),
			className: "",
			style: {},
			value: "",
			placeholder: "",
			maxLength: 0,
			min: "",
			max: "",
			rows: 0,
			type: "",
			textContent: "",
			children: [],
			dataset: {},
			appendChild(child) {
				this.children.push(child);
			},
			remove() {
				this.removed = true;
			},
			setAttribute(name, val) {
				this[name] = val;
			},
			getAttribute(name) {
				return this[name];
			},
			addEventListener(type, cb) {
				this._listeners = this._listeners || {};
				this._listeners[type] = cb;
			},
			click() {
				this._listeners?.click?.({ stopPropagation() {} });
			},
			focus() {
				this.focused = true;
			},
		};
		createdElements.push(el);
		return el;
	},
};

const { ModalDialogController } = await import(
	"../ui/js/ui/renderers/modal-dialog-controller.js"
);

test("ModalDialogController covers inputbox, teachbox, communicatebox, and choices", async () => {
	vi.useFakeTimers();
	createdElements = [];

	const events = [];
	const mockApp = {
		ghostController: {
			sendShioriEvent: async (ev, args) => {
				events.push({ ev, args });
			},
			sendTeachInput: (val) => {
				events.push({ ev: "TeachInput", val });
			},
			clearTeachHistory: () => {
				events.push({ ev: "clearTeachHistory" });
			},
		},
		elements: {
			balloonText: {
				appendChild(child) {
					this.child = child;
				},
			},
			keroBalloonText: {
				appendChild(child) {
					this.child = child;
				},
			},
		},
	};

	const controller = new ModalDialogController({ app: mockApp });

	// 1. inputbox - open, submit via OK button
	events.length = 0;
	controller.openInputBox([
		"OnMyInput",
		"--text=hello",
		"--placeholder=type here",
		"--limit=20",
		"--reference=ref1",
		"--option=noclose,noclear",
	]);
	assert.ok(mockApp.elements.balloonText.child);
	const inputForm = mockApp.elements.balloonText.child;
	const inputEl = inputForm.children.find((c) => c.tagName === "INPUT");
	assert.equal(inputEl.value, "hello");
	assert.equal(inputEl.placeholder, "type here");
	assert.equal(inputEl.maxLength, 20);

	const okBtn = inputForm.children.find((c) => c.tagName === "BUTTON");
	okBtn.click();
	await vi.runAllTimersAsync();
	assert.ok(events.some((e) => e.ev === "OnMyInput" && e.args[0] === "hello"));

	// 2. inputbox - Enter key with default UserInput and timeout
	events.length = 0;
	controller.openInputBox(["MyId", "5000", "defaultVal"]);
	const inputForm2 = mockApp.elements.balloonText.child;
	const inputEl2 = inputForm2.children.find((c) => c.tagName === "INPUT");
	inputEl2.value = "typedVal";
	inputEl2._listeners?.keydown?.({ key: "Enter", stopPropagation() {} });
	await vi.runAllTimersAsync();
	assert.ok(
		events.some((e) => e.ev === "OnUserInput" && e.args[1] === "typedVal"),
	);

	// 3. inputbox - Escape key cancels
	events.length = 0;
	controller.openInputBox(["MyId2", "--timeout=1000"]);
	const inputForm3 = mockApp.elements.balloonText.child;
	const inputEl3 = inputForm3.children.find((c) => c.tagName === "INPUT");
	inputEl3._listeners?.keydown?.({ key: "Escape", stopPropagation() {} });
	await vi.runAllTimersAsync();
	assert.ok(events.some((e) => e.ev === "OnUserInputCancel"));

	// 4. inputbox - Timeout triggers cancel
	events.length = 0;
	controller.openInputBox(["MyId3", "--timeout=300"]);
	await vi.advanceTimersByTimeAsync(350);
	assert.ok(events.some((e) => e.ev === "OnUserInputCancel"));

	// 5. inputbox - closeInputBox explicitly
	controller.openInputBox(["MyId4"]);
	assert.equal(controller.activeBoxes.has("inputbox:MyId4"), true);
	controller.closeInputBox("MyId4");
	assert.equal(controller.activeBoxes.has("inputbox:MyId4"), false);

	// 6. teachbox - open, submit, and escape cancel
	events.length = 0;
	controller.openTeachBox(["teachbox", "--text=learnThis"], {
		notifyStart: true,
		scope: 1,
	});
	assert.ok(events.some((e) => e.ev === "OnTeachStart"));
	assert.ok(mockApp.elements.keroBalloonText.child);

	const teachForm = mockApp.elements.keroBalloonText.child;
	const teachBtn = teachForm.children.find((c) => c.tagName === "BUTTON");
	teachBtn.click();
	await vi.runAllTimersAsync();
	assert.ok(events.some((e) => e.ev === "TeachInput" && e.val === "learnThis"));

	// teachbox escape
	events.length = 0;
	controller.openTeachBox([], { notifyStart: false });
	const teachForm2 = mockApp.elements.balloonText.child;
	const teachInput2 = teachForm2.children.find((c) => c.tagName === "INPUT");
	teachInput2._listeners?.keydown?.({ key: "Escape", stopPropagation() {} });
	await vi.runAllTimersAsync();
	assert.ok(events.some((e) => e.ev === "OnTeachInputCancel"));
	assert.ok(events.some((e) => e.ev === "clearTeachHistory"));

	controller.closeTeachBox();

	// 7. communicatebox - open, submit via OK, Escape cancel, and timeout
	events.length = 0;
	controller.openCommunicateBox([
		"helloGhost",
		"--placeholder=Ask me",
		"--limit=50",
		"--reference=extra",
	]);
	const commForm = mockApp.elements.balloonText.child;
	const commBtn = commForm.children.find((c) => c.tagName === "BUTTON");
	commBtn.click();
	await vi.runAllTimersAsync();
	assert.ok(
		events.some((e) => e.ev === "OnCommunicate" && e.args[0] === "user"),
	);

	// communicatebox timeout & cancel
	events.length = 0;
	controller.openCommunicateBox(["--timeout=200"]);
	await vi.advanceTimersByTimeAsync(250);
	assert.ok(events.some((e) => e.ev === "OnCommunicateInputCancel"));

	// communicatebox closeCommunicateBox with notifyCancel=true
	events.length = 0;
	controller.openCommunicateBox([]);
	controller.closeCommunicateBox(true);
	assert.ok(events.some((e) => e.ev === "OnCommunicateInputCancel"));

	// 8. Choices & choice timeout
	events.length = 0;
	let customSelected = null;
	const choiceBtn = controller.createChoiceButton({
		id: "c1",
		text: "Option 1",
		onSelect: (id, text) => {
			customSelected = { id, text };
		},
	});
	choiceBtn.click();
	assert.deepEqual(customSelected, { id: "c1", text: "Option 1" });

	// Choice button fallback to app.ghostController
	const choiceBtn2 = controller.createChoiceButton({
		id: "c2",
		text: "Option 2",
	});
	choiceBtn2.click();
	assert.ok(
		events.some((e) => e.ev === "OnChoiceSelect" && e.args[0] === "c2"),
	);

	// Choice timeout
	events.length = 0;
	controller.setChoiceTimeout(400);
	await vi.advanceTimersByTimeAsync(450);
	assert.ok(events.some((e) => e.ev === "OnChoiceTimeout"));

	// closeAll
	controller.openInputBox(["b1"]);
	controller.openTeachBox([]);
	controller.openCommunicateBox([]);
	controller.setChoiceTimeout(500);
	controller.closeAll();
	assert.equal(controller.activeBoxes.size, 0);
	assert.equal(controller.choiceTimeoutTimer, null);

	vi.useRealTimers();
});

test("ModalDialogController handles dateinput, timeinput, and ipinput (Cycle 4)", async () => {
	const events = [];
	const mockGhostController = {
		async sendShioriEvent(ev, args) {
			events.push({ ev, args });
			return "OK";
		},
	};

	const mockApp = {
		ghostController: mockGhostController,
		elements: {
			balloonText: {
				appendChild(child) {
					this.child = child;
				},
			},
			keroBalloonText: {
				appendChild(child) {
					this.child = child;
				},
			},
		},
	};
	const controller = new ModalDialogController({ app: mockApp });

	// 1. dateinput with positional parameters
	events.length = 0;
	const dateForm = controller.openDateInput([
		"DateTest",
		"0",
		"2026",
		"11",
		"02",
		"--reference=customDateRef",
	]);
	assert.ok(dateForm);
	const dateInput = dateForm.children.find((c) => c.tagName === "INPUT");
	assert.equal(dateInput.value, "2026-11-02");

	// Submit dateinput
	const dateBtn = dateForm.children.find((c) => c.tagName === "BUTTON");
	dateBtn.click();
	await new Promise((r) => setTimeout(r, 10));

	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInput" &&
				e.args[0] === "DateTest" &&
				e.args[1] === "2026,11,2" &&
				e.args[3] === "customDateRef",
		),
	);

	// 2. timeinput with --text option
	events.length = 0;
	const timeForm = controller.openTimeInput([
		"TimeTest",
		"--text=14,30,45",
		"--reference=timeRef",
	]);
	assert.ok(timeForm);
	const timeInput = timeForm.children.find((c) => c.tagName === "INPUT");
	assert.equal(timeInput.value, "14:30:45");

	// Submit timeinput
	const timeBtn = timeForm.children.find((c) => c.tagName === "BUTTON");
	timeBtn.click();
	await new Promise((r) => setTimeout(r, 10));

	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInput" &&
				e.args[0] === "TimeTest" &&
				e.args[1] === "14,30,45" &&
				e.args[3] === "timeRef",
		),
	);

	// 3. ipinput with positional octets and cancel via Escape
	events.length = 0;
	const ipForm = controller.openIpInput([
		"IpTest",
		"0",
		"192",
		"168",
		"1",
		"100",
		"--reference=ipRef",
	]);
	assert.ok(ipForm);
	const ipInputs = ipForm.children.filter((c) => c.tagName === "INPUT");
	assert.equal(ipInputs.length, 4);
	assert.equal(ipInputs[0].value, "192");
	assert.equal(ipInputs[1].value, "168");
	assert.equal(ipInputs[2].value, "1");
	assert.equal(ipInputs[3].value, "100");

	// Submit ipinput
	const ipBtn = ipForm.children.find((c) => c.tagName === "BUTTON");
	ipBtn.click();
	await new Promise((r) => setTimeout(r, 10));

	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInput" &&
				e.args[0] === "IpTest" &&
				e.args[1] === "192,168,1,100" &&
				e.args[3] === "ipRef",
		),
	);

	// Cancel ipinput
	events.length = 0;
	controller.openIpInput(["IpCancelTest", "0", "10", "0", "0", "1"]);
	controller.closeInputBox("IpCancelTest");
	// programmatic close does not send OnUserInputCancel unless cancelled by user or timeout
	assert.equal(controller.activeBoxes.has("inputbox:IpCancelTest"), false);
});

test("ModalDialogController Cycle 3: inputbox.autocomplete, datalist creation, and mobile focus", async () => {
	vi.useFakeTimers();
	createdElements = [];

	const events = [];
	const mockApp = {
		ghostController: {
			sendShioriEvent: async (ev, args) => {
				events.push({ ev, args });
				if (ev === "inputbox.autocomplete") {
					const boxType = args[0];
					if (boxType === "inputbox") {
						return "apple\u0001banana\u0001cherry";
					}
					if (boxType === "teachbox") {
						return "wordA\\1wordB";
					}
					if (boxType === "communicatebox") {
						return "hello\u0001goodbye";
					}
				}
				return null;
			},
		},
		elements: {
			balloonText: {
				appendChild(child) {
					this.child = child;
				},
			},
			keroBalloonText: {
				appendChild(child) {
					this.child = child;
				},
			},
		},
	};

	const controller = new ModalDialogController({ app: mockApp });

	// 1. inputbox - autocomplete integration
	events.length = 0;
	controller.openInputBox(["AutoCompleteBox", "1000", "test"]);
	await vi.runAllTimersAsync();

	// inputbox.autocomplete event should be sent with ["inputbox", "AutoCompleteBox"]
	assert.ok(
		events.some(
			(e) =>
				e.ev === "inputbox.autocomplete" &&
				e.args[0] === "inputbox" &&
				e.args[1] === "AutoCompleteBox",
		),
	);

	const form = mockApp.elements.balloonText.child;
	const inputEl = form.children.find((c) => c.tagName === "INPUT");
	const listId = inputEl.getAttribute("list");
	assert.ok(listId?.startsWith("dl-inputbox-"));

	const dataListEl = form.children.find((c) => c.tagName === "DATALIST");
	assert.ok(dataListEl);
	assert.equal(dataListEl.children.length, 3);
	assert.equal(dataListEl.children[0].value, "apple");
	assert.equal(dataListEl.children[1].value, "banana");
	assert.equal(dataListEl.children[2].value, "cherry");

	// Mobile focus trigger scrollIntoView
	let scrolled = false;
	form.scrollIntoView = () => {
		scrolled = true;
	};
	inputEl._listeners?.focus?.();
	assert.equal(scrolled, true);

	// Cleaning up inputbox also removes datalist
	controller.closeInputBox("AutoCompleteBox");
	assert.equal(controller.activeBoxes.has("inputbox:AutoCompleteBox"), false);

	// 2. teachbox - autocomplete integration
	events.length = 0;
	controller.openTeachBox([]);
	await vi.runAllTimersAsync();

	assert.ok(
		events.some(
			(e) => e.ev === "inputbox.autocomplete" && e.args[0] === "teachbox",
		),
	);

	const teachForm = mockApp.elements.balloonText.child;
	const teachInput = teachForm.children.find((c) => c.tagName === "INPUT");
	assert.ok(teachInput.getAttribute("list")?.startsWith("dl-teachbox-"));

	const teachDl = teachForm.children.find((c) => c.tagName === "DATALIST");
	assert.ok(teachDl);
	assert.equal(teachDl.children.length, 2);
	assert.equal(teachDl.children[0].value, "wordA");
	assert.equal(teachDl.children[1].value, "wordB");

	controller.closeTeachBox();

	// 3. communicatebox - autocomplete integration
	events.length = 0;
	controller.openCommunicateBox([]);
	await vi.runAllTimersAsync();

	assert.ok(
		events.some(
			(e) => e.ev === "inputbox.autocomplete" && e.args[0] === "communicatebox",
		),
	);

	const commForm = mockApp.elements.balloonText.child;
	const commInput = commForm.children.find((c) => c.tagName === "INPUT");
	assert.ok(commInput.getAttribute("list")?.startsWith("dl-communicatebox-"));

	controller.closeCommunicateBox();

	// 4. passwordinput should not attach autocomplete
	events.length = 0;
	controller.openPasswordInput(["SecretPw"]);
	await vi.runAllTimersAsync();
	assert.equal(
		events.some((e) => e.ev === "inputbox.autocomplete"),
		false,
	);
	controller.closeInputBox("SecretPw");

	vi.useRealTimers();
});

test("ModalDialogController Cycle 2: passwordinput, textareabox, sliderinput, and closeDialog", async () => {
	vi.useFakeTimers();
	createdElements = [];

	const events = [];
	const mockApp = {
		ghostController: {
			sendShioriEvent: async (ev, args) => {
				events.push({ ev, args });
			},
		},
		elements: {
			balloonText: {
				appendChild(child) {
					this.child = child;
				},
			},
			keroBalloonText: {
				appendChild(child) {
					this.child = child;
				},
			},
		},
	};

	const controller = new ModalDialogController({ app: mockApp });

	// 1. PasswordInput: check type="password", placeholder, submit, and escape
	events.length = 0;
	controller.openPasswordInput([
		"PwId",
		"--text=secret",
		"--placeholder=enter pw",
		"--reference=refPw",
	]);
	const pwForm = mockApp.elements.balloonText.child;
	const pwInput = pwForm.children.find((c) => c.tagName === "INPUT");
	assert.equal(pwInput.type, "password");
	assert.equal(pwInput.value, "secret");
	assert.equal(pwInput.placeholder, "enter pw");

	const pwOkBtn = pwForm.children.find((c) => c.tagName === "BUTTON");
	pwOkBtn.click();
	await vi.runAllTimersAsync();
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInput" &&
				e.args[0] === "PwId" &&
				e.args[1] === "secret" &&
				e.args[3] === "refPw",
		),
	);

	// 2. TextAreaBox: check \1 newline conversion, Ctrl+Enter submit, Enter newline, and timeout
	events.length = 0;
	controller.openTextAreaBox([
		"OnTextAreaTest",
		"--text=line1\\1line2",
		"--placeholder=desc\\1note",
		"--limit=100",
		"--timeout=1000",
	]);
	const taForm = mockApp.elements.balloonText.child;
	const taInput = taForm.children.find((c) => c.tagName === "TEXTAREA");
	assert.equal(taInput.value, "line1\nline2");
	assert.equal(taInput.placeholder, "desc\nnote");
	assert.equal(taInput.maxLength, 100);

	// Ctrl+Enter submit
	taInput.value = "first line\nsecond line";
	taInput._listeners?.keydown?.({
		key: "Enter",
		ctrlKey: true,
		stopPropagation() {},
	});
	await vi.runAllTimersAsync();
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnTextAreaTest" &&
				e.args[0] === "first line\u0001second line",
		),
	);

	// TextAreaBox timeout with standard OnTextAreaInputCancel
	events.length = 0;
	controller.openTextAreaBox(["MyArea", "--timeout=500"]);
	await vi.advanceTimersByTimeAsync(600);
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnTextAreaInputCancel" &&
				e.args[0] === "MyArea" &&
				e.args[1] === "timeout",
		),
	);

	// 3. SliderInput: check min, max, current value, slider input event, and OnUserInput args
	events.length = 0;
	controller.openSliderInput([
		"Slider1",
		"1000",
		"50",
		"10",
		"90",
		"--reference=sliderRef",
	]);
	const sliderForm = mockApp.elements.balloonText.child;
	const sliderInput = sliderForm.children.find((c) => c.tagName === "INPUT");
	const valSpan = sliderForm.children.find((c) => c.tagName === "SPAN");
	assert.equal(sliderInput.type, "range");
	assert.equal(sliderInput.min, "10");
	assert.equal(sliderInput.max, "90");
	assert.equal(sliderInput.value, "50");
	assert.equal(valSpan.textContent, "50");

	// slider change
	sliderInput.value = "75";
	sliderInput._listeners?.input?.();
	assert.equal(valSpan.textContent, "75");

	// submit OK
	const sliderOkBtn = sliderForm.children.find((c) => c.tagName === "BUTTON");
	sliderOkBtn.click();
	await vi.runAllTimersAsync();
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInput" &&
				e.args[0] === "Slider1" &&
				e.args[1] === "75" &&
				e.args[2] === "10,90" &&
				e.args[3] === "sliderRef",
		),
	);

	// 4. Close logic: closeInputBox(__SYSTEM_ALL_INPUT__), closeTextAreaBox, closeDialog
	controller.openInputBox(["InputA"]);
	controller.openPasswordInput(["InputB"]);
	controller.openTextAreaBox(["AreaA"]);
	assert.ok(controller.activeBoxes.size >= 3);

	// closeTextAreaBox for specific ID
	controller.closeTextAreaBox("AreaA");
	assert.equal(controller.activeBoxes.has("textareabox:AreaA"), false);

	// closeInputBox with __SYSTEM_ALL_INPUT__ closes inputbox & passwordinput but preserves others
	controller.openTextAreaBox(["AreaB"]);
	controller.closeInputBox("__SYSTEM_ALL_INPUT__");
	assert.equal(controller.activeBoxes.has("inputbox:InputA"), false);
	assert.equal(controller.activeBoxes.has("inputbox:InputB"), false);
	assert.equal(controller.activeBoxes.has("textareabox:AreaB"), true);

	// closeDialog with specific ID
	events.length = 0;
	controller.closeDialog("AreaB", true);
	assert.equal(controller.activeBoxes.has("textareabox:AreaB"), false);
	assert.ok(
		events.some(
			(e) => e.ev === "OnSystemDialogCancel" && e.args[0] === "AreaB",
		),
	);

	// closeDialog with __SYSTEM_ALL_DIALOG__
	events.length = 0;
	controller.openInputBox(["Diag1"]);
	controller.openTextAreaBox(["Diag2"]);
	controller.closeDialog("__SYSTEM_ALL_DIALOG__", true);
	assert.equal(controller.activeBoxes.size, 0);
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnSystemDialogCancel" &&
				e.args[0] === "__SYSTEM_ALL_DIALOG__",
		),
	);

	vi.useRealTimers();
});
