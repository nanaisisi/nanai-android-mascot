import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { resetCreatedElements, setupMockDom } from "./helpers.js";

setupMockDom();

const { ModalDialogController } = await import(
	"../../ui/js/ui/renderers/modal-dialog-controller.js"
);

test("ModalDialogController Cycle 2: passwordinput, textareabox, sliderinput, and closeDialog", async () => {
	vi.useFakeTimers();
	resetCreatedElements();

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

	// sliderinput with --text option, min/max/default, and Enter key submit
	events.length = 0;
	const sliderTextForm = controller.openSliderInput([
		"SliderText1",
		"--text=40,10,100",
		"--reference=sliderRef1",
		null, // non-string param
	]);
	assert.ok(sliderTextForm);
	const sliderTextInput = sliderTextForm.children.find(
		(c) => c.tagName === "INPUT",
	);
	assert.equal(sliderTextInput.value, "40");
	assert.equal(sliderTextInput.min, "10");
	assert.equal(sliderTextInput.max, "100");

	// Submit via Enter key
	events.length = 0;
	sliderTextInput._listeners?.keydown?.({ key: "Enter", stopPropagation() {} });
	await vi.runAllTimersAsync();
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInput" &&
				e.args[0] === "SliderText1" &&
				e.args[1] === "40" &&
				e.args[2] === "10,100" &&
				e.args[3] === "sliderRef1",
		),
	);

	// sliderinput with On... ID, --option=noclose, and Escape key cancel
	events.length = 0;
	const sliderFormCustom = controller.openSliderInput([
		"OnSliderCustom",
		"0",
		"50",
		"0",
		"100",
		"--option=noclose",
	]);
	const sliderInputCustom = sliderFormCustom.children.find(
		(c) => c.tagName === "INPUT",
	);
	// Escape cancel
	events.length = 0;
	sliderInputCustom._listeners?.keydown?.({
		key: "Escape",
		stopPropagation() {},
	});
	await vi.runAllTimersAsync();
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInputCancel" &&
				e.args[0] === "OnSliderCustom" &&
				e.args[1] === "close" &&
				e.args[2] === "0,100",
		),
	);

	// sliderinput timeout
	events.length = 0;
	controller.openSliderInput(["SliderTimeout", "--timeout=100"]);
	await vi.advanceTimersByTimeAsync(150);
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInputCancel" &&
				e.args[0] === "SliderTimeout" &&
				e.args[1] === "timeout",
		),
	);

	// sliderinput with fallback defaults (NaN inputs)
	const sliderFormFallback = controller.openSliderInput([
		"SliderFallback",
		"--text=invalid,invalid,invalid",
	]);
	const sliderInputFallback = sliderFormFallback.children.find(
		(c) => c.tagName === "INPUT",
	);
	assert.equal(sliderInputFallback.min, "0");
	assert.equal(sliderInputFallback.max, "100");

	// Fail balloon container
	const savedBalloon = mockApp.elements.balloonText;
	mockApp.elements.balloonText = null;
	assert.equal(controller.openSliderInput(["FailSlider"]), null);
	mockApp.elements.balloonText = savedBalloon;

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
