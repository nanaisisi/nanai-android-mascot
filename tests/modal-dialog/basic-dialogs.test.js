import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { setupMockDom, resetCreatedElements } from "./helpers.js";

setupMockDom();

const { ModalDialogController } = await import(
	"../../ui/js/ui/renderers/modal-dialog-controller.js"
);

test("ModalDialogController covers inputbox, teachbox, communicatebox, and choices", async () => {
	vi.useFakeTimers();
	resetCreatedElements();

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
