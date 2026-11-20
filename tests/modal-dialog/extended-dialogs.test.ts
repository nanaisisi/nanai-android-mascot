import assert from "node:assert/strict";
import { test, vi } from "vitest";
import type { ModalDialogApp } from "../../ui/ts/ui/renderers/modal-dialog-ui.js";
import {
	asMockElement,
	type MockBalloonContainer,
	type MockDialogElement,
	resetCreatedElements,
	setupMockDom,
} from "./helpers.js";

setupMockDom();

const { ModalDialogController } = await import(
	"../../ui/ts/ui/renderers/modal-dialog-controller.js"
);

test("ModalDialogController Cycle 2: passwordinput, textareabox, sliderinput, and closeDialog", async () => {
	vi.useFakeTimers();
	resetCreatedElements();

	const events: Array<{ ev: string; args: unknown[] }> = [];
	const balloonText: MockBalloonContainer = {
		appendChild(child: MockDialogElement) {
			this.child = child;
		},
	};
	const keroBalloonText: MockBalloonContainer = {
		appendChild(child: MockDialogElement) {
			this.child = child;
		},
	};
	const elements: {
		balloonText: HTMLElement | null;
		keroBalloonText: HTMLElement | null;
	} = {
		balloonText: balloonText as unknown as HTMLElement,
		keroBalloonText: keroBalloonText as unknown as HTMLElement,
	};
	const mockApp: ModalDialogApp = {
		ghostController: {
			sendShioriEvent: async (ev: string, args: unknown[] = []) => {
				events.push({ ev, args });
			},
		},
		elements,
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
	const pwForm = balloonText.child as MockDialogElement;
	const pwInput = pwForm.children.find(
		(c) => c.tagName === "INPUT",
	) as MockDialogElement;
	assert.equal(pwInput.type, "password");
	assert.equal(pwInput.value, "secret");
	assert.equal(pwInput.placeholder, "enter pw");

	const pwOkBtn = pwForm.children.find(
		(c) => c.tagName === "BUTTON",
	) as MockDialogElement;
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

	// 2. TextAreaBox: check \1 and \u newline conversion, Ctrl+Enter submit, Enter newline, and timeout
	events.length = 0;
	controller.openTextAreaBox([
		"OnTextAreaTest",
		"--text=line1\\1line2\\uline3",
		"--placeholder=desc\\1note\\utip",
		"--limit=100",
		"--timeout=1000",
	]);
	const taForm = balloonText.child as MockDialogElement;
	const taInput = taForm.children.find(
		(c) => c.tagName === "TEXTAREA",
	) as MockDialogElement;
	assert.equal(taInput.value, "line1\nline2\nline3");
	assert.equal(taInput.placeholder, "desc\nnote\ntip");
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
	const sliderForm = balloonText.child as MockDialogElement;
	const sliderInput = sliderForm.children.find(
		(c) => c.tagName === "INPUT",
	) as MockDialogElement;
	const valSpan = sliderForm.children.find(
		(c) => c.tagName === "SPAN",
	) as MockDialogElement;
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
	const sliderOkBtn = sliderForm.children.find(
		(c) => c.tagName === "BUTTON",
	) as MockDialogElement;
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
	const sliderTextForm = asMockElement(
		controller.openSliderInput([
			"SliderText1",
			"--text=40,10,100",
			"--reference=sliderRef1",
			null, // non-string param
		]),
	);
	assert.ok(sliderTextForm);
	const sliderTextInput = sliderTextForm.children.find(
		(c) => c.tagName === "INPUT",
	) as MockDialogElement;
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
	const sliderFormCustom = asMockElement(
		controller.openSliderInput([
			"OnSliderCustom",
			"0",
			"50",
			"0",
			"100",
			"--option=noclose",
		]),
	);
	const sliderInputCustom = sliderFormCustom.children.find(
		(c) => c.tagName === "INPUT",
	) as MockDialogElement;
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
	const sliderFormFallback = asMockElement(
		controller.openSliderInput([
			"SliderFallback",
			"--text=invalid,invalid,invalid",
		]),
	);
	const sliderInputFallback = sliderFormFallback.children.find(
		(c) => c.tagName === "INPUT",
	) as MockDialogElement;
	assert.equal(sliderInputFallback.min, "0");
	assert.equal(sliderInputFallback.max, "100");

	// Fail balloon container
	const savedBalloon = elements.balloonText;
	elements.balloonText = null;
	assert.equal(controller.openSliderInput(["FailSlider"]), null);
	elements.balloonText = savedBalloon;

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
