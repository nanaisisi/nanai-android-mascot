import { beforeEach, describe, expect, it, vi } from "vitest";
import { eventMethods } from "../ui/js/core/app-events.js";
import { shioriNotifyMethods } from "../ui/js/ghost/shiori-notify.js";

describe("SHIORI Extended Events & Notifications", () => {
	let mockController: any;
	let mockAppEvents: any;

	beforeEach(() => {
		mockController = {
			app: { ghostId: "test-ghost" },
			currentGhost: {
				name: "TestGhost",
				sakura_name: "TestSakura",
				kero_name: "TestKero",
				path: "/ghosts/test_ghost",
			},
			ghosts: [],
			shells: ["master"],
			balloons: ["default"],
			balloonPaths: ["assets/balloon/default"],
			sendShioriNotify: vi.fn().mockResolvedValue({ status: 200 }),
			sendShioriEvent: vi
				.fn()
				.mockResolvedValue({ status: 200, script: "\\0OK\\e" }),
		};

		mockAppEvents = {
			...eventMethods,
			sakuraPlayer: { timeCritical: false, isPlaying: false },
			ghostController: mockController,
			surfaceManager: {
				detectCollision: vi.fn().mockReturnValue({
					name: "head",
					canvasX: 120,
					canvasY: 85,
				}),
			},
		};
	});

	describe("shiori-notify HEADLINE & RSS protocols", () => {
		it("sends OnHeadlinesenseBegin with siteName and url", async () => {
			const notifyObj = {
				...shioriNotifyMethods,
				sendShioriNotify: mockController.sendShioriNotify,
			};

			await notifyObj.sendHeadlineSenseBegin(
				"Test Site",
				"https://example.com/rss",
			);
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnHeadlinesenseBegin",
				["Test Site", "https://example.com/rss"],
			);
		});

		it("sends OnHeadlinesense.OnFind with phase and content", async () => {
			const notifyObj = {
				...shioriNotifyMethods,
				sendShioriNotify: mockController.sendShioriNotify,
			};

			await notifyObj.sendHeadlineSenseOnFind(
				"Test Site",
				"https://example.com/rss",
				"first",
				"Headline content item",
			);
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnHeadlinesense.OnFind",
				[
					"Test Site",
					"https://example.com/rss",
					"first",
					"Headline content item",
				],
			);
		});

		it("sends OnHeadlinesenseComplete with reason", async () => {
			const notifyObj = {
				...shioriNotifyMethods,
				sendShioriNotify: mockController.sendShioriNotify,
			};

			await notifyObj.sendHeadlineSenseComplete("no update");
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnHeadlinesenseComplete",
				["no update"],
			);
		});

		it("sends OnHeadlinesenseFailure with reason", async () => {
			const notifyObj = {
				...shioriNotifyMethods,
				sendShioriNotify: mockController.sendShioriNotify,
			};

			await notifyObj.sendHeadlineSenseFailure("can't open");
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnHeadlinesenseFailure",
				["can't open"],
			);
		});

		it("sends OnRSSBegin, OnRSSComplete (no update & with entries), and OnRSSFailure", async () => {
			const notifyObj = {
				...shioriNotifyMethods,
				sendShioriNotify: mockController.sendShioriNotify,
			};

			await notifyObj.sendRssBegin("RSS Site", "https://example.com/feed.xml");
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnRSSBegin",
				["RSS Site", "https://example.com/feed.xml"],
			);

			await notifyObj.sendRssComplete("no update");
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnRSSComplete",
				["no update"],
			);

			await notifyObj.sendRssComplete("RSS Site", "https://example.com", [
				"Item 1\x01https://example.com/1",
				"Item 2\x01https://example.com/2",
			]);
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnRSSComplete",
				[
					"RSS Site",
					"https://example.com",
					"Item 1\x01https://example.com/1",
					"Item 2\x01https://example.com/2",
				],
			);

			await notifyObj.sendRssFailure("timeout");
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnRSSFailure",
				["timeout"],
			);
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
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnVanished",
				["VanishedGhost"],
			);

			await notifyObj.notifyUrlDropEvent("OnURLDropped", [
				"https://example.com",
			]);
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnURLDropped",
				["https://example.com"],
			);

			await notifyObj.notifyFileDropEvent("OnFileDrop", ["/path/to/file.txt"]);
			expect(mockController.sendShioriNotify).toHaveBeenCalledWith(
				"OnFileDrop",
				["/path/to/file.txt"],
			);

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

			await notifyObj.notifySpeechEvent("OnSpeechSynthesisStatus", [
				"speaking",
			]);
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

	describe("app-events mouse extended methods", () => {
		const dummyRect = { left: 0, top: 0, width: 200, height: 300 };

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
			expect(mockController.sendShioriEvent).toHaveBeenCalledWith(
				"OnMouseUpEx",
				[120, 85, 0, 1, "head", "xbutton1", "touch"],
			);
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
});
