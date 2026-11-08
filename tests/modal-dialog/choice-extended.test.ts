import { describe, expect, it } from "vitest";
import { ModalDialogController } from "../../ui/js/ui/renderers/modal-dialog-controller.js";
import {
	createMockElement,
	resetCreatedElements,
	setupMockDom,
} from "./helpers.js";

describe("ModalDialogController Choice & Extended Events (Slot-11 Cycle 8)", () => {
	let _app: unknown;
	let _controller: unknown;
	let _sentEvents: unknown[];

	let app: any;

	let controller: any;

	let sentEvents: any[];

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

	it("creates choice button and dispatches OnChoiceSelectEx followed by OnChoiceSelect", () => {
		const btn = controller.createChoiceButton({
			id: "choice_1",
			text: "Option One",
		});

		expect(btn).toBeDefined();
		expect(btn.getAttribute("data-choice-id")).toBe("choice_1");
		expect(btn.textContent).toBe("Option One");

		btn.click();

		expect(sentEvents.length).toBe(2);
		expect(sentEvents[0].name).toBe("OnChoiceSelectEx");
		expect(sentEvents[0].args).toEqual(["Option One", "choice_1"]);
		expect(sentEvents[1].name).toBe("OnChoiceSelect");
		expect(sentEvents[1].args).toEqual(["choice_1", "Option One"]);
	});
});
