import { beforeEach, describe, expect, it } from "vitest";
import { ModalDialogController } from "../../ui/js/ui/renderers/modal-dialog-controller.js";
import {
	createMockElement,
	resetCreatedElements,
	setupMockDom,
} from "./helpers.js";

describe("ModalDialogController System Dialogs (Cycle 5)", () => {
	let app;
	let controller;
	let sentEvents;

	beforeEach(() => {
		setupMockDom();
		resetCreatedElements();
		sentEvents = [];
		const mockBalloon = createMockElement("div");

		app = {
			elements: {
				balloonText: mockBalloon,
				keroBalloonText: createMockElement("div"),
			},
			ghostController: {
				sendShioriEvent: async (name, args) => {
					sentEvents.push({ name, args });
				},
			},
		};

		controller = new ModalDialogController({ app });
	});

	it("opens color dialog, parses initial RGB, and submits RGB string", async () => {
		const form = await controller.openSystemDialog("color", [
			"--id=TestColor",
			"--title=Color Picker",
			"--color=255 128 0",
		]);

		expect(form).toBeDefined();
		expect(form.className).toContain("balloon-color-dialog");

		const colorInput = form.children.find((c) => c.type === "color");
		expect(colorInput).toBeDefined();
		expect(colorInput.value).toBe("#ff8000");

		// Change color and submit
		colorInput.value = "#00ff80";
		const okBtn = form.children.find((c) => c.textContent === "OK");
		okBtn.click();

		expect(sentEvents.length).toBe(1);
		expect(sentEvents[0].name).toBe("OnSystemDialog");
		expect(sentEvents[0].args[0]).toBe("color");
		expect(sentEvents[0].args[1]).toBe("TestColor");
		expect(sentEvents[0].args[2]).toBe("0,255,128");
	});

	it("cancels color dialog and sends OnSystemDialogCancel", async () => {
		const form = await controller.openSystemDialog("color", [
			"--id=TestColorCancel",
			"--color=#ff0000",
		]);

		const cancelBtn = form.children.find((c) => c.textContent === "Cancel");
		cancelBtn.click();

		expect(sentEvents.length).toBe(1);
		expect(sentEvents[0].name).toBe("OnSystemDialogCancel");
		expect(sentEvents[0].args[0]).toBe("color");
		expect(sentEvents[0].args[1]).toBe("TestColorCancel");
	});

	it("handles open/save/folder file input fallback", async () => {
		const fileInput = await controller.openSystemDialog("open", [
			"--id=TestOpenFile",
			"--filter=テキスト|*.txt;*.dic|すべて|*.*",
		]);

		expect(fileInput).toBeDefined();
		expect(fileInput.tagName).toBe("INPUT");
		expect(fileInput.type).toBe("file");
		expect(fileInput.accept).toContain(".txt,.dic");

		// Simulate file selection
		fileInput.files = [{ name: "sample.txt", path: "/path/to/sample.txt" }];
		await fileInput._listeners.change();

		expect(sentEvents.length).toBe(1);
		expect(sentEvents[0].name).toBe("OnSystemDialog");
		expect(sentEvents[0].args[0]).toBe("open");
		expect(sentEvents[0].args[1]).toBe("TestOpenFile");
		expect(sentEvents[0].args[2]).toBe("/path/to/sample.txt");
	});

	it("handles On-prefixed event name for system dialogs", async () => {
		const form = await controller.openSystemDialog("color", [
			"--id=OnCustomColor",
			"--color=0,0,255",
		]);

		const colorInput = form.children.find((c) => c.type === "color");
		colorInput.value = "#0000ff";
		const okBtn = form.children.find((c) => c.textContent === "OK");
		okBtn.click();

		expect(sentEvents.length).toBe(1);
		expect(sentEvents[0].name).toBe("OnCustomColor");
		expect(sentEvents[0].args[0]).toBe("color");
		expect(sentEvents[0].args[2]).toBe("0,0,255");
	});
});
