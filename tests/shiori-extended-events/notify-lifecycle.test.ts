import { beforeEach, describe, expect, it } from "vitest";
import { shioriNotifyMethods } from "../../ui/ts/ghost/shiori-notify.js";
import {
	createMockShioriController,
	type MockShioriController,
} from "./helpers.js";

describe("shiori-notify UKADOC lifecycle, environment & communication protocols", () => {
	let mockController: MockShioriController;

	beforeEach(() => {
		mockController = createMockShioriController();
	});

	it("sends notifyMouseEvent with eventName and arbitrary references", async () => {
		const notifyObj = {
			...shioriNotifyMethods,
			sendShioriNotify: mockController.sendShioriNotify,
		};

		await notifyObj.notifyMouseEvent("OnMouseEnter", [
			10,
			20,
			0,
			0,
			"head",
			0,
			"mouse",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnMouseEnter",
			[10, 20, 0, 0, "head", 0, "mouse"],
		);
	});

	it("sends UKADOC lifecycle notifications (OnGhostChanging, OnGhostChanged, OnShellChanged, etc.)", async () => {
		const notifyObj = {
			...shioriNotifyMethods,
			sendShioriNotify: mockController.sendShioriNotify,
		};

		await notifyObj.notifyGhostLifecycle("OnGhostChanging", [
			"NextGhost",
			"manual",
			"PrevGhost",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnGhostChanging",
			["NextGhost", "manual", "PrevGhost"],
		);

		await notifyObj.notifyGhostLifecycle("OnGhostChanged", [
			"NextGhost",
			"manual",
			"PrevGhost",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnGhostChanged",
			["NextGhost", "manual", "PrevGhost"],
		);

		await notifyObj.notifyGhostLifecycle("OnShellChanged", [
			"master",
			"alt_shell",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnShellChanged",
			["master", "alt_shell"],
		);

		await notifyObj.notifyGhostLifecycle("OnCloseAll", []);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnCloseAll",
			[],
		);
	});

	it("sends vanish, url-drop, file-drop, and os-state notifications", async () => {
		const notifyObj = {
			...shioriNotifyMethods,
			sendShioriNotify: mockController.sendShioriNotify,
		};

		await notifyObj.notifyVanishEvent("OnVanished", ["VanishedGhost"]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith("OnVanished", [
			"VanishedGhost",
		]);

		await notifyObj.notifyUrlDropEvent("OnURLDropped", ["https://example.com"]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnURLDropped",
			["https://example.com"],
		);

		await notifyObj.notifyFileDropEvent("OnFileDrop", ["/path/to/file.txt"]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith("OnFileDrop", [
			"/path/to/file.txt",
		]);

		await notifyObj.notifyOsEnvironment("OnDisplayChange", [1920, 1080, 32]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnDisplayChange",
			[1920, 1080, 32],
		);

		await notifyObj.notifyOverlapEvent("OnOverlap", [0, 1]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnOverlap",
			[0, 1],
		);

		await notifyObj.notifySurfaceBalloonEvent("OnSurfaceChange", [0, 10]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnSurfaceChange",
			[0, 10],
		);

		await notifyObj.notifyChoiceAnchorEx("OnChoiceSelectEx", [
			"choice_0",
			"Label",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnChoiceSelectEx",
			["choice_0", "Label"],
		);

		await notifyObj.notifyTermsDialogEvent("OnGhostTermsAccept", [
			"license.txt",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnGhostTermsAccept",
			["license.txt"],
		);

		await notifyObj.notifyEventSendFailure("OnNotifyOtherFailure", [
			"TargetGhost",
			"timeout",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnNotifyOtherFailure",
			["TargetGhost", "timeout"],
		);

		await notifyObj.notifyGamepadEvent("OnGamepadConnected", [
			0,
			"XboxController",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnGamepadConnected",
			[0, "XboxController"],
		);

		await notifyObj.notifySelectRegionModeEvent("OnSelectModeBegin", []);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnSelectModeBegin",
			[],
		);

		await notifyObj.notifySpeechEvent("OnSpeechSynthesisStatus", ["speaking"]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnSpeechSynthesisStatus",
			["speaking"],
		);

		await notifyObj.notifyOtherEvent("OnAITalk", []);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnAITalk",
			[],
		);

		await notifyObj.notifyCommunicationEvent("OnExecuteHTTPComplete", [
			"200",
			"https://example.com/api",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnExecuteHTTPComplete",
			["200", "https://example.com/api"],
		);

		await notifyObj.notifyCommunicationEvent("OnExecuteWebSocketOpen", [
			"wss://example.com/socket",
		]);
		expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
			"OnExecuteWebSocketOpen",
			["wss://example.com/socket"],
		);
	});
});
