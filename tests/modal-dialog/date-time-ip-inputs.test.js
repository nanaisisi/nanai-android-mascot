import assert from "node:assert/strict";
import { test } from "vitest";
import { setupMockDom } from "./helpers.js";

setupMockDom();

const { ModalDialogController } = await import(
	"../../ui/js/ui/renderers/modal-dialog-controller.js"
);

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
