import { describe, expect, it, vi } from "vitest";
import {
	handleSetOtherSurfaceChangeCommand,
	handleSetSerikoTalkCommand,
} from "../ui/ts/ghost/command-handler/system/surface.js";
import { shioriNotifyMethods } from "../ui/ts/ghost/shiori-notify.js";
import { _applyAnimationFrame } from "../ui/ts/surface/animation/playback/playback-apply.js";
import { onCharSpoken } from "../ui/ts/surface/animation/playback/playback-events.js";
import { SurfaceAnimationManager } from "../ui/ts/surface/surface-animation-manager.js";

describe("SERIKO and Surface Change Event Coordination (Slot-08 Cycle 8)", () => {
	it("notifies OnSurfaceChange with correct references", async () => {
		const sendShioriNotify = vi.fn().mockResolvedValue(null);
		const context = {
			sendShioriNotify,
			notifySurfaceChange: shioriNotifyMethods.notifySurfaceChange,
		};

		await context.notifySurfaceChange(0, 0, 10, 300, 400);
		expect(sendShioriNotify).toHaveBeenCalledWith("OnSurfaceChange", [
			"0",
			"10",
			"0,0,300,400",
		]);

		await context.notifySurfaceChange(1, 0, 11, 200, 250);
		expect(sendShioriNotify).toHaveBeenCalledWith("OnSurfaceChange", [
			"0",
			"11",
			"1,11,200,250",
		]);
	});

	it("notifies OnOtherSurfaceChange with object or string rect", async () => {
		const sendShioriNotify = vi.fn().mockResolvedValue(null);
		const context = {
			sendShioriNotify,
			notifyOtherSurfaceChange: shioriNotifyMethods.notifyOtherSurfaceChange,
		};

		await context.notifyOtherSurfaceChange("Taromaru", "Taro", 0, 1, 0, {
			left: 10,
			top: 20,
			right: 110,
			bottom: 220,
		});
		expect(sendShioriNotify).toHaveBeenCalledWith("OnOtherSurfaceChange", [
			"Taromaru",
			"Taro",
			"0",
			"1",
			"0",
			"10,20,110,220",
		]);

		await context.notifyOtherSurfaceChange(
			"Taromaru",
			"Taro",
			1,
			11,
			10,
			"0,0,50,50",
		);
		expect(sendShioriNotify).toHaveBeenCalledWith("OnOtherSurfaceChange", [
			"Taromaru",
			"Taro",
			"1",
			"11",
			"10",
			"0,0,50,50",
		]);
	});

	it("handles setserikotalk and setothersurfacechange commands", async () => {
		const setSerikoTalkEnabled = vi.fn();
		const handler = {
			player: { currentScope: 0 },
			app: {
				surfaceAnimationManager: { setSerikoTalkEnabled },
				ghostController: { otherSurfaceChangeEnabled: false },
			},
		};

		await handleSetSerikoTalkCommand(handler, ["!", "set", "false"]);
		expect(setSerikoTalkEnabled).toHaveBeenCalledWith(0, false);

		await handleSetSerikoTalkCommand(handler, ["!", "set", "true"]);
		expect(setSerikoTalkEnabled).toHaveBeenCalledWith(0, true);

		await handleSetOtherSurfaceChangeCommand(handler, ["!", "set", "true"]);
		expect(handler.app.ghostController.otherSurfaceChangeEnabled).toBe(true);

		await handleSetOtherSurfaceChangeCommand(handler, ["!", "set", "false"]);
		expect(handler.app.ghostController.otherSurfaceChangeEnabled).toBe(false);
	});

	it("suppresses lip-sync when seriko talk is disabled", () => {

		const mockManager: unknown = {

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const _mockManager: any = {
,
			animationsForTrigger: vi
				.fn()
				.mockReturnValue([id: 1, patterns: [] , sid: "0", param: 1 ,
				]),
			playAnimationPatterns: vi.fn(),
			isSerikoTalkEnabled: vi.fn().mockReturnValue(false),
			_spokenCount: ,
			_talkStarted: ,
		};

		onCharSpoken(mockManager, 0);
		expect(mockManager.playAnimationPatterns).not.toHaveBeenCalled();

		mockManager.isSerikoTalkEnabled.mockReturnValue(true);
		onCharSpoken(mockManager, 0);
		expect(mockManager.playAnimationPatterns).toHaveBeenCalled();
	});

	it("handles scaling draw method in _applyAnimationFrame", async () => {
		const _setScale = vi.fn();
		const _notifyFrameStep = vi.fn();

		const instance: unknown = {

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const _instance: any = {
,
				currentSurfaceIdFor: vi.fn().mockReturnValue(0),
				animations: "0": [id: 1 ] ,
				setScale,,
			isAnimationPaused: vi.fn().mockReturnValue(false),
			scheduler: _notifyFrameStep ,
		};

		const pat = { type: "scaling", x: 150, y: 150 };
		const result = await _applyAnimationFrame(
			instance,
			pat,
			{ id: 1 },
			0,
			0,
			"0__0__1",
			() => true,
		);

		expect(result).toBe(true);
		expect(setScale).toHaveBeenCalledWith(150, 150, 0);
		expect(notifyFrameStep).toHaveBeenCalledWith(
			expect.objectContaining({
				offsetX: 150,
				offsetY: 150,
			}),
		);
	});

	it("manages scaling and serikotalk state in SurfaceAnimationManager", () => {

		const _sam = new SurfaceAnimationManager({} as unknown);

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const sam = new SurfaceAnimationManager({} as any);

		expect(sam.isSerikoTalkEnabled(0)).toBe(true);
		expect(sam.getBaseScalingOffset(0)).toEqual({ scaleX: 100, scaleY: 100 });

		sam.setSerikoTalkEnabled(0, false);
		expect(sam.isSerikoTalkEnabled(0)).toBe(false);

		sam.setBaseScalingOffset(0, 120, 130);
		expect(sam.getBaseScalingOffset(0)).toEqual({ scaleX: 120, scaleY: 130 });

		sam.stopAnimations(0);
		expect(sam.getBaseScalingOffset(0)).toEqual({ scaleX: 100, scaleY: 100 });
	});
});
