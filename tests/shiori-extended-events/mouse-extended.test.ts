import { beforeEach, describe, expect, it } from "vitest";
import {
	createMockAppEvents,
	createMockShioriController,
	type MockShioriController,
} from "./helpers.js";

describe("app-events mouse extended methods", () => {
	let mockController: MockShioriController;
	let mockAppEvents: ReturnType<typeof createMockAppEvents>;
	const dummyRect = { left: 0, top: 0, width: 200, height: 300 };

	beforeEach(() => {
		mockController = createMockShioriController();
		mockAppEvents = createMockAppEvents(mockController);
	});

	it("dispatches onGhostMouseEnter and onGhostMouseLeave for parts and windows", () => {
		mockAppEvents.onGhostMouseEnter(120, 85, dummyRect, 0, false);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
			"OnMouseEnter",
			[120, 85, 0, 0, "head", 0, "mouse"],
		);

		mockAppEvents.onGhostMouseEnter(120, 85, dummyRect, 1, true);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
			"OnMouseEnterAll",
			[120, 85, 0, 1, "head", 0, "mouse"],
		);

		mockAppEvents.onGhostMouseLeave(120, 85, dummyRect, 0, false);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
			"OnMouseLeave",
			[120, 85, 0, 0, "head", 0, "mouse"],
		);

		mockAppEvents.onGhostMouseLeave(120, 85, dummyRect, 0, true);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
			"OnMouseLeaveAll",
			[120, 85, 0, 0, "head", 0, "mouse"],
		);
	});

	it("dispatches onGhostMouseEx for OnMouseDownEx and OnMouseUpEx", () => {
		mockAppEvents.onGhostMouseEx(
			"down",
			120,
			85,
			dummyRect,
			"middle",
			"mouse",
			0,
		);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
			"OnMouseDownEx",
			[120, 85, 0, 0, "head", "middle", "mouse"],
		);

		mockAppEvents.onGhostMouseEx(
			"up",
			120,
			85,
			dummyRect,
			"xbutton1",
			"touch",
			1,
		);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith("OnMouseUpEx", [
			120,
			85,
			0,
			1,
			"head",
			"xbutton1",
			"touch",
		]);
	});

	it("dispatches onGhostMouseClickEx for single and double click", () => {
		mockAppEvents.onGhostMouseClickEx(
			120,
			85,
			dummyRect,
			"middle",
			"mouse",
			0,
			false,
		);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
			"OnMouseClickEx",
			[120, 85, 0, 0, "head", "middle", "mouse"],
		);

		mockAppEvents.onGhostMouseClickEx(
			120,
			85,
			dummyRect,
			"xbutton2",
			"mouse",
			1,
			true,
		);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
			"OnMouseDoubleClickEx",
			[120, 85, 0, 1, "head", "xbutton2", "mouse"],
		);
	});

	it("dispatches onGhostMultipleClick for standard and extended multiple clicks", () => {
		mockAppEvents.onGhostMultipleClick(
			120,
			85,
			dummyRect,
			4,
			0,
			"mouse",
			0,
			false,
		);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
			"OnMouseMultipleClick",
			[120, 85, 0, 0, "head", 0, "mouse", 4],
		);

		mockAppEvents.onGhostMultipleClick(
			120,
			85,
			dummyRect,
			3,
			"middle",
			"touch",
			1,
			true,
		);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
			"OnMouseMultipleClickEx",
			[120, 85, 0, 1, "head", "middle", "touch", 3],
		);
	});

	it("dispatches onGhostGesture with start/end coordinates and direction", () => {
		mockAppEvents.onGhostGesture(
			100,
			150,
			"bust",
			200,
			50,
			"head",
			"right_up",
			0,
		);
		expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
			"OnMouseGesture",
			[0, "200\x0150", "head", "100\x01150", "bust", "right_up"],
		);
	});

	it("suppresses events during timeCritical playback", () => {
		mockAppEvents.sakuraPlayer.timeCritical = true;
		mockAppEvents.sakuraPlayer.isPlaying = true;

		mockAppEvents.onGhostMouseEnter(120, 85, dummyRect, 0);
		mockAppEvents.onGhostMouseLeave(120, 85, dummyRect, 0);
		mockAppEvents.onGhostMouseEx("down", 120, 85, dummyRect);
		mockAppEvents.onGhostMouseClickEx(120, 85, dummyRect);
		mockAppEvents.onGhostMultipleClick(120, 85, dummyRect);
		mockAppEvents.onGhostGesture(10, 10, "", 20, 20, "", "up");

		expect(mockController.sendShioriEvent).not.toHaveBeenCalled();
	});
});
