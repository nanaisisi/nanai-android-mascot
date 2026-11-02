import assert from "node:assert/strict";
import { test, vi } from "vitest";
import { setupMockDom, resetCreatedElements } from "./helpers.js";

setupMockDom();

const { ModalDialogController } = await import(
	"../../ui/js/ui/renderers/modal-dialog-controller.js"
);

test("ModalDialogController Cycle 3: inputbox.autocomplete, datalist creation, and mobile focus", async () => {
	vi.useFakeTimers();
	resetCreatedElements();

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
