import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { resetCreatedElements, setupMockDom } from "./helpers.js";

setupMockDom();

const { ModalDialogController } = await import(
	"../../ui/js/ui/renderers/modal-dialog-controller.js"
);

test("ModalDialogController handles dateinput, timeinput, and ipinput comprehensively", async () => {
	vi.useFakeTimers();
	resetCreatedElements();

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

	// 1. dateinput with positional parameters, focus scroll, and button submit
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

	// Test focus event handler
	let scrolled = false;
	dateForm.scrollIntoView = () => {
		scrolled = true;
	};
	dateInput._listeners?.focus?.();
	assert.equal(scrolled, true);

	// Submit dateinput via click
	const dateBtn = dateForm.children.find((c) => c.tagName === "BUTTON");
	dateBtn.click();
	await vi.runAllTimersAsync();

	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInput" &&
				e.args[0] === "DateTest" &&
				e.args[1] === "2026,11,2" &&
				e.args[3] === "customDateRef",
		),
	);

	// 2. dateinput with --text option, --timeout, --option=noclose, and Escape cancel
	events.length = 0;
	const dateForm2 = controller.openDateInput([
		"OnDateCustomEvent",
		"--timeout=5000",
		"--text=2025,05,15",
		"--option=noclose",
		null, // non-string param check
	]);
	assert.ok(dateForm2);
	const dateInput2 = dateForm2.children.find((c) => c.tagName === "INPUT");
	assert.equal(dateInput2.value, "2025-05-15");

	// Test Enter key submit
	events.length = 0;
	dateInput2.value = "2025-5-15"; // non standard format
	dateInput2._listeners?.keydown?.({ key: "Enter", stopPropagation() {} });
	await vi.runAllTimersAsync();
	assert.ok(
		events.some(
			(e) => e.ev === "OnDateCustomEvent" && e.args[0] === "2025,5,15",
		),
	);

	// Test timeout and cancel on dateinput
	events.length = 0;
	const dateForm3 = controller.openDateInput([
		"DateTimeoutTest",
		"--timeout=300",
	]);
	const dateInput3 = dateForm3.children.find((c) => c.tagName === "INPUT");
	// Escape cancel
	dateInput3._listeners?.keydown?.({ key: "Escape", stopPropagation() {} });
	await vi.runAllTimersAsync();
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInputCancel" &&
				e.args[0] === "DateTimeoutTest" &&
				e.args[1] === "close",
		),
	);

	// Test timer timeout
	events.length = 0;
	controller.openDateInput(["DateTimeoutTest2", "--timeout=200"]);
	await vi.advanceTimersByTimeAsync(250);
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInputCancel" &&
				e.args[0] === "DateTimeoutTest2" &&
				e.args[1] === "timeout",
		),
	);

	// Dateinput cleanup method check
	const dateEntry = controller.activeBoxes.get("inputbox:DateTimeoutTest2");
	if (dateEntry) dateEntry.cleanup();

	// Test null balloon container returns null
	const savedBalloon = mockApp.elements.balloonText;
	mockApp.elements.balloonText = null;
	assert.equal(controller.openDateInput(["FailDate"]), null);
	assert.equal(controller.openTimeInput(["FailTime"]), null);
	mockApp.elements.balloonText = savedBalloon;

	// 3. timeinput with --text option, positional timeout & time, and Enter submit
	events.length = 0;
	const timeForm = controller.openTimeInput([
		"TimeTest",
		"--text=14,30,45",
		"--reference=timeRef",
	]);
	assert.ok(timeForm);
	const timeInput = timeForm.children.find((c) => c.tagName === "INPUT");
	assert.equal(timeInput.value, "14:30:45");

	// Test focus scroll
	let timeScrolled = false;
	timeForm.scrollIntoView = () => {
		timeScrolled = true;
	};
	timeInput._listeners?.focus?.();
	assert.equal(timeScrolled, true);

	// Submit timeinput via Enter key
	events.length = 0;
	timeInput._listeners?.keydown?.({ key: "Enter", stopPropagation() {} });
	await vi.runAllTimersAsync();

	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInput" &&
				e.args[0] === "TimeTest" &&
				e.args[1] === "14,30,45" &&
				e.args[3] === "timeRef",
		),
	);

	// timeinput with positional params, On... custom event, --option=noclose, and button click
	events.length = 0;
	const timeForm2 = controller.openTimeInput([
		"OnTimeCustom",
		"0",
		"9",
		"15",
		"30",
		"--option=noclose",
		null, // non-string param
	]);
	const timeInput2 = timeForm2.children.find((c) => c.tagName === "INPUT");
	assert.equal(timeInput2.value, "09:15:30");
	const timeBtn2 = timeForm2.children.find((c) => c.tagName === "BUTTON");
	timeBtn2.click();
	await vi.runAllTimersAsync();
	assert.ok(
		events.some((e) => e.ev === "OnTimeCustom" && e.args[0] === "9,15,30"),
	);

	// timeinput timeout & escape
	events.length = 0;
	const timeForm3 = controller.openTimeInput(["TimeEscape", "--timeout=100"]);
	const timeInput3 = timeForm3.children.find((c) => c.tagName === "INPUT");
	timeInput3._listeners?.keydown?.({ key: "Escape", stopPropagation() {} });
	await vi.runAllTimersAsync();
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInputCancel" &&
				e.args[0] === "TimeEscape" &&
				e.args[1] === "close",
		),
	);

	// timeinput timer trigger
	events.length = 0;
	controller.openTimeInput(["TimeTimeout", "--timeout=100"]);
	await vi.advanceTimersByTimeAsync(150);
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInputCancel" &&
				e.args[0] === "TimeTimeout" &&
				e.args[1] === "timeout",
		),
	);

	// 4. ipinput with positional octets, key navigation, and Enter submit
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

	// Test focus scroll on ipinput
	let ipScrolled = false;
	ipForm.scrollIntoView = () => {
		ipScrolled = true;
	};
	ipInputs[0]._listeners?.focus?.();
	assert.equal(ipScrolled, true);

	// Test dot navigation
	let nextFocused = false;
	ipInputs[1].focus = () => {
		nextFocused = true;
	};
	ipInputs[0]._listeners?.keydown?.({
		key: ".",
		preventDefault() {},
		stopPropagation() {},
	});
	assert.equal(nextFocused, true);

	// Test Backspace navigation
	let prevFocused = false;
	ipInputs[0].focus = () => {
		prevFocused = true;
	};
	ipInputs[1].value = "";
	ipInputs[1]._listeners?.keydown?.({
		key: "Backspace",
		stopPropagation() {},
	});
	assert.equal(prevFocused, true);

	// Enter submit on ipinput form
	events.length = 0;
	ipInputs[1].value = "168";
	ipForm._listeners?.keydown?.({ key: "Enter", stopPropagation() {} });
	await vi.runAllTimersAsync();
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInput" &&
				e.args[0] === "IpTest" &&
				e.args[1] === "192,168,1,100" &&
				e.args[3] === "ipRef",
		),
	);

	// ipinput with --text option, --timeout, --option=noclose, On... custom event
	events.length = 0;
	const ipForm2 = controller.openIpInput([
		"OnIpCustom",
		"--text=10.0.0.1",
		"--timeout=200",
		"--option=noclose",
		null, // non-string param
	]);
	assert.ok(ipForm2);
	const ipInputs2 = ipForm2.children.filter((c) => c.tagName === "INPUT");
	assert.equal(ipInputs2[0].value, "10");
	assert.equal(ipInputs2[3].value, "1");

	// Escape cancel
	ipForm2._listeners?.keydown?.({ key: "Escape", stopPropagation() {} });
	await vi.runAllTimersAsync();
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInputCancel" &&
				e.args[0] === "OnIpCustom" &&
				e.args[1] === "close",
		),
	);

	// ipinput timeout
	events.length = 0;
	controller.openIpInput(["IpTimerTest", "--timeout=100"]);
	await vi.advanceTimersByTimeAsync(150);
	assert.ok(
		events.some(
			(e) =>
				e.ev === "OnUserInputCancel" &&
				e.args[0] === "IpTimerTest" &&
				e.args[1] === "timeout",
		),
	);

	// Fail ipinput balloon
	mockApp.elements.balloonText = null;
	assert.equal(controller.openIpInput(["FailIp"]), null);
	mockApp.elements.balloonText = savedBalloon;

	vi.useRealTimers();
});
