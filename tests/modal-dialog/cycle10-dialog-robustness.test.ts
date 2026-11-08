import { beforeEach, describe, expect, it } from "vitest";
import { parseBoxOptions } from "../../ui/ts/ui/renderers/inputs/input-helpers.js";
import { ModalDialogController } from "../../ui/ts/ui/renderers/modal-dialog-controller.js";
import {
	createMockElement,
	resetCreatedElements,
	setupMockDom,
} from "./helpers.js";

describe("ModalDialogController & Inputs Robustness (Cycle 10)", () => {
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

	it("parses combined options cleanly in parseBoxOptions", () => {
		const parsed = parseBoxOptions([
			"TestBox",
			"--timeout=3000",
			"--text=Initial",
			"--option=noclose,noclear",
			"--reference=Ref1",
			"--reference=Ref2",
		]);

		expect(parsed.id).toBe("TestBox");
		expect(parsed.timeoutMs).toBe(3000);
		expect(parsed.defaultText).toBe("Initial");
		expect(parsed.noClose).toBe(true);
		expect(parsed.noClear).toBe(true);
		expect(parsed.references).toEqual(["Ref1", "Ref2"]);

		// Test alternate delimiter in --option=
		const parsedSemi = parseBoxOptions(["Box2", "--option=noclose;noclear"]);
		expect(parsedSemi.noClose).toBe(true);
		expect(parsedSemi.noClear).toBe(true);
	});

	it("handles closeDialog gracefully when cleanup throws", () => {
		controller.activeBoxes.set("bad-box", {
			id: "BadBox",
			type: "custom",
			form: createMockElement("div") as unknown as HTMLElement,
			cleanup: () => {
				throw new Error("Cleanup failed");
			},
		});

		expect(() => controller.closeDialog("BadBox", true)).not.toThrow();
		expect(controller.activeBoxes.has("bad-box")).toBe(false);
		const cancelEv = sentEvents.find((e) => e.name === "OnSystemDialogCancel");
		expect(cancelEv).toBeDefined();
		expect(cancelEv.args[0]).toBe("BadBox");
	});

	it("handles closeAll gracefully with throwing cleanups and choice timers", () => {
		controller.activeBoxes.set("bad-box1", {
			id: "BadBox1",
			form: createMockElement("div") as unknown as HTMLElement,
			cleanup: () => {
				throw new Error("Cleanup error");
			},
		});
		controller.setChoiceTimeout(10000, () => {});
		expect(controller.choiceTimeoutTimer).not.toBeNull();

		expect(() => controller.closeAll()).not.toThrow();
		expect(controller.activeBoxes.size).toBe(0);
		expect(controller.choiceTimeoutTimer).toBeNull();
	});

	it("handles closeTeachBox and closeCommunicateBox with faulty cleanup callbacks", () => {
		controller.activeBoxes.set("teachbox", {
			type: "teachbox",
			form: createMockElement("div") as unknown as HTMLElement,
			cleanup: () => {
				throw new Error("Teach cleanup error");
			},
		});
		expect(() => controller.closeTeachBox(true)).not.toThrow();
		expect(controller.activeBoxes.has("teachbox")).toBe(false);

		controller.activeBoxes.set("communicatebox", {
			type: "communicatebox",
			form: createMockElement("div") as unknown as HTMLElement,
			cleanup: () => {
				throw new Error("Comm cleanup error");
			},
		});
		expect(() => controller.closeCommunicateBox(true)).not.toThrow();
		expect(controller.activeBoxes.has("communicatebox")).toBe(false);
	});
});
