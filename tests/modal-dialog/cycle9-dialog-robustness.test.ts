import { beforeEach, describe, expect, it } from "vitest";
import { ModalDialogController } from "../../ui/ts/ui/renderers/modal-dialog-controller.js";
import {
	createMockElement,
	resetCreatedElements,
	setupMockDom,
} from "./helpers.js";

describe("ModalDialogController Robustness (Cycle 9)", () => {
	let app: Record<string, unknown>;
	let controller: ModalDialogController;
	let sentEvents: Array<{ name: string; args: unknown[] }>;

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
				sendTeachInput: (val) => {
					sentEvents.push({ name: "sendTeachInput", args: [val] });
				},
				clearTeachHistory: () => {
					sentEvents.push({ name: "clearTeachHistory", args: [] });
				},
			},
		};

		controller = new ModalDialogController({ app });
	});

	it("handles openTeachBox with timeout and cancel notification", async () => {
		const form = controller.openTeachBox([
			"--text=DefaultTeach",
			"--timeout=50",
			"--reference=Ref1",
		]);

		expect(form).toBeDefined();
		expect(controller.activeBoxes.has("teachbox")).toBe(true);

		// Allow timeout to fire
		await new Promise((resolve) => setTimeout(resolve, 80));

		expect(controller.activeBoxes.has("teachbox")).toBe(false);
		const cancelEv = sentEvents.find((e) => e.name === "OnTeachInputCancel");
		expect(cancelEv).toBeDefined();
		expect(cancelEv.args[1]).toBe("timeout");
		expect(cancelEv.args[2]).toBe("Ref1");
	});

	it("handles closeTeachBox with cancel notification", () => {
		controller.openTeachBox(["--text=TeachCloseTest"]);
		expect(controller.activeBoxes.has("teachbox")).toBe(true);

		controller.closeTeachBox(true);
		expect(controller.activeBoxes.has("teachbox")).toBe(false);

		const cancelEv = sentEvents.find((e) => e.name === "OnTeachInputCancel");
		expect(cancelEv).toBeDefined();
		expect(cancelEv.args[1]).toBe("close");
	});

	it("handles openCommunicateBox with timeout, references, and cancel notification", async () => {
		const form = controller.openCommunicateBox([
			"--text=HelloGhost",
			"--timeout=60",
			"--reference=RefA",
			"--reference=RefB",
		]);

		expect(form).toBeDefined();
		expect(controller.activeBoxes.has("communicatebox")).toBe(true);

		await new Promise((resolve) => setTimeout(resolve, 90));

		expect(controller.activeBoxes.has("communicatebox")).toBe(false);
		const cancelEv = sentEvents.find(
			(e) => e.name === "OnCommunicateInputCancel",
		);
		expect(cancelEv).toBeDefined();
		expect(cancelEv.args[1]).toBe("timeout");
		expect(cancelEv.args[2]).toBe("RefA");
		expect(cancelEv.args[3]).toBe("RefB");
	});

	it("handles closeCommunicateBox with notifyCancel parameter", () => {
		controller.openCommunicateBox(["--text=CommCloseTest"]);
		expect(controller.activeBoxes.has("communicatebox")).toBe(true);

		controller.closeCommunicateBox(true);
		expect(controller.activeBoxes.has("communicatebox")).toBe(false);

		const cancelEv = sentEvents.find(
			(e) => e.name === "OnCommunicateInputCancel",
		);
		expect(cancelEv).toBeDefined();
		expect(cancelEv.args[1]).toBe("close");
	});

	it("handles closeDialog with specific target ID and __SYSTEM_ALL_DIALOG__", () => {
		controller.openTextAreaBox(["CustomDlg"]);
		expect(controller.activeBoxes.has("textareabox:CustomDlg")).toBe(true);

		controller.closeDialog("CustomDlg", true);
		expect(controller.activeBoxes.has("textareabox:CustomDlg")).toBe(false);

		const cancelEv = sentEvents.find((e) => e.name === "OnSystemDialogCancel");
		expect(cancelEv).toBeDefined();
		expect(cancelEv.args[0]).toBe("CustomDlg");

		// Open two dialogs and close all
		sentEvents = [];
		controller.openInputBox(["Dlg1"]);
		controller.openTextAreaBox(["Dlg2"]);

		controller.closeDialog("__SYSTEM_ALL_DIALOG__", true);
		expect(controller.activeBoxes.size).toBe(0);

		const cancelAll = sentEvents.find((e) => e.name === "OnSystemDialogCancel");
		expect(cancelAll).toBeDefined();
		expect(cancelAll.args[0]).toBe("__SYSTEM_ALL_DIALOG__");
	});
});
