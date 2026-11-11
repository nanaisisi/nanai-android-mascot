import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { SakuraCommandHandler } from "../../ui/ts/ghost/sakura-command-handler.js";
import { createMockApp, setupMockDom } from "./helpers.js";

setupMockDom();

describe("SakuraCommandHandler - Box Commands", () => {
	it("handles open and close interactions for inputbox, teachbox, and communicatebox", () => {
		const eventsSent = [];
		const mockApp = createMockApp(eventsSent);
		const player = { currentScope: 0, app: mockApp };
		const handler = new SakuraCommandHandler(player);

		// 8. open inputbox with OnID, --timeout, --text, --placeholder
		handler.runCommand([
			"open",
			"inputbox",
			"OnInputTest",
			"--timeout=100",
			"--text=default",
			"--placeholder=place",
		]);
		assert.ok(mockApp.elements.balloonText.child);
		// Test submit via click
		const form = mockApp.elements.balloonText.child;
		const submitBtn = form.children.find((c) => c.tagName === "BUTTON");
		submitBtn.click();
		assert.ok(eventsSent.some((e) => e.ev === "OnInputTest"));

		// 9. open inputbox with generic ID ("UserInput")
		eventsSent.length = 0;
		handler.runCommand(["open", "inputbox", "OnUserInput", "200", "defText"]);
		const form2 = mockApp.elements.balloonText.child;
		const input2 = form2.children.find((c) => c.tagName === "INPUT");
		input2._listeners?.keydown?.({ key: "Enter", stopPropagation() {} });
		assert.ok(eventsSent.some((e) => e.ev === "OnUserInput"));

		// 10. open teachbox and close teachbox
		eventsSent.length = 0;
		handler.openTeachBox(["teachbox", "--text=teachDefault"]);
		assert.ok(handler.teachForm);
		const teachForm = handler.teachForm;
		const teachSubmit = teachForm.children.find((c) => c.tagName === "BUTTON");
		teachSubmit.click();
		assert.ok(eventsSent.some((e) => e.ev === "TeachInput"));

		// Test teachbox escape/cancel
		handler.openTeachBox([]);
		const teachInput = handler.teachForm.children.find(
			(c) => c.tagName === "INPUT",
		);
		teachInput._listeners?.keydown?.({ key: "Escape", stopPropagation() {} });
		assert.ok(eventsSent.some((e) => e.ev === "OnTeachInputCancel"));

		// Test closeTeachBox explicitly
		handler.openTeachBox([]);
		assert.ok(handler.teachForm);
		handler.runCommand(["close", "teachbox"]);
		assert.equal(handler.teachForm, null);

		// 11. open communicatebox and close communicatebox
		eventsSent.length = 0;
		handler.runCommand([
			"open",
			"communicatebox",
			"helloWorld",
			"--timeout=150",
			"--placeholder=SaySomething",
		]);
		assert.ok(handler.communicateForm);
		const commForm = handler.communicateForm;
		const commSubmit = commForm.children.find((c) => c.tagName === "BUTTON");
		commSubmit.click();
		assert.ok(eventsSent.some((e) => e.ev === "OnCommunicate"));

		// communicatebox escape/cancel
		eventsSent.length = 0;
		handler.openCommunicateBox([]);
		const commInput = handler.communicateForm.children.find(
			(c) => c.tagName === "INPUT",
		);
		commInput._listeners?.keydown?.({ key: "Escape", stopPropagation() {} });
		assert.ok(eventsSent.some((e) => e.ev === "OnCommunicateInputCancel"));

		// close communicatebox command
		handler.openCommunicateBox([]);
		assert.ok(handler.communicateForm);
		handler.runCommand(["close", "communicatebox"]);
		assert.equal(handler.communicateForm, null);
	});
});
