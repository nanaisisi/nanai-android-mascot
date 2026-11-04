import { describe, expect, it, vi } from "vitest";
import {
	handleCallCommand,
	handleChangeCommand,
	handleRaiseCommand,
} from "../ui/js/ghost/command-handler/ghost.js";
import {
	handleArchiveExec,
	handleCancelNetworkService,
	handleCloseNetworkService,
	handleDownloadExec,
	handleFileExec,
	handleMailCheckExec,
	handleMailExec,
	handleRestoreWallpaper,
	handleSaveWallpaper,
	handleSetHttpTimeout,
	handleSetProxy,
	handleSetWallpaper,
	handleUpdate,
	handleUpdateByMyself,
	handleUploadExec,
} from "../ui/js/ghost/command-handler/media.js";
import {
	handleQuickSection,
	handleSetBalloonTimeout,
	handleSetBalloonWait,
	handleSetChoiceTimeout,
} from "../ui/js/ghost/command-handler/playback.js";
import { handlePluginEvent } from "../ui/js/ghost/command-handler/plugin.js";
import {
	handleAnimCommand,
	handleBindCommand,
} from "../ui/js/ghost/command-handler/surface.js";

describe("command-handler/surface.js", () => {
	it("handles bind and bind-noevent commands", async () => {
		const bindSpy = vi.fn();
		const handler = {
			app: { surfaceManager: { bindDressup: bindSpy } },
			player: { currentScope: 0 },
		};

		await handleBindCommand(handler, ["bind", "head", "ribbon", "1"], true);
		expect(bindSpy).toHaveBeenCalledWith("head", "ribbon", "1", 0, true);

		await handleBindCommand(
			handler,
			["bind-noevent", "head", "ribbon", "0"],
			false,
		);
		expect(bindSpy).toHaveBeenCalledWith("head", "ribbon", "0", 0, false);
	});

	it("handles anim commands (pause, resume, stop, clear, offset)", async () => {
		const pauseSpy = vi.fn();
		const resumeSpy = vi.fn();
		const stopSpy = vi.fn();
		const offsetSpy = vi.fn();

		const handler = {
			app: {
				surfaceManager: {
					pauseAnimationById: pauseSpy,
					resumeAnimationById: resumeSpy,
					stopAnimationById: stopSpy,
					setAnimationOffset: offsetSpy,
				},
			},
			player: { currentScope: 1 },
		};

		await handleAnimCommand(handler, ["anim", "pause", "10"]);
		expect(pauseSpy).toHaveBeenCalledWith(10, 1);

		await handleAnimCommand(handler, ["anim", "pouse", "10"]);
		expect(pauseSpy).toHaveBeenCalledWith(10, 1);

		await handleAnimCommand(handler, ["anim", "resume", "10"]);
		expect(resumeSpy).toHaveBeenCalledWith(10, 1);

		await handleAnimCommand(handler, ["anim", "stop", "10"]);
		expect(stopSpy).toHaveBeenCalledWith(10, 1);

		await handleAnimCommand(handler, ["anim", "clear", "10"]);
		expect(stopSpy).toHaveBeenCalledWith(10, 1);

		await handleAnimCommand(handler, ["anim", "offset", "10", "25", "35"]);
		expect(offsetSpy).toHaveBeenCalledWith(10, 25, 35, 1);

		// Non-numeric ID string
		await handleAnimCommand(handler, ["anim", "pause", "blink"]);
		expect(pauseSpy).toHaveBeenCalledWith("blink", 1);
	});
});

describe("command-handler/ghost.js", () => {
	it("handles raise, change, and call commands", async () => {
		const sendShioriEventSpy = vi.fn();
		const switchGhostSpy = vi.fn();
		const callGhostSpy = vi.fn();

		const handler = {
			app: {
				ghostController: {
					sendShioriEvent: sendShioriEventSpy,
					switchGhost: switchGhostSpy,
					callGhost: callGhostSpy,
				},
			},
		};

		await handleRaiseCommand(handler, [
			"raise",
			"OnCustomEvent",
			"arg0",
			"arg1",
		]);
		expect(sendShioriEventSpy).toHaveBeenCalledWith("OnCustomEvent", [
			"arg0",
			"arg1",
		]);

		await handleChangeCommand(handler, ["change", "ghost", "OtherGhost"]);
		expect(switchGhostSpy).toHaveBeenCalledWith("OtherGhost");

		await handleCallCommand(handler, ["call", "ghost", "OtherGhost"]);
		expect(callGhostSpy).toHaveBeenCalledWith("OtherGhost");

		// Ignore empty arguments
		await handleRaiseCommand(handler, ["raise"]);
		await handleChangeCommand(handler, ["change", "shell", "OtherShell"]);
		await handleCallCommand(handler, ["call", "balloon", "OtherBalloon"]);
	});
});

describe("command-handler/playback.js", () => {
	it("handles set:choicetimeout, set:balloontimeout, set:balloonwait, quicksection", async () => {
		const setBalloonWaitSpy = vi.fn();
		const setQuickModeSpy = vi.fn();

		const handler = {
			player: {
				choiceTimeout: 0,
				balloonTimeout: 0,
				playbackController: {
					setBalloonWait: setBalloonWaitSpy,
					setQuickMode: setQuickModeSpy,
				},
			},
		};

		await handleSetChoiceTimeout(handler, ["set", "choicetimeout", "4000"]);
		expect(handler.player.choiceTimeout).toBe(4000);

		await handleSetChoiceTimeout(handler, ["set", "choicetimeout", "invalid"]);
		expect(handler.player.choiceTimeout).toBe(0);

		await handleSetBalloonTimeout(handler, ["set", "balloontimeout", "3000"]);
		expect(handler.player.balloonTimeout).toBe(3000);

		await handleSetBalloonTimeout(handler, [
			"set",
			"balloontimeout",
			"invalid",
		]);
		expect(handler.player.balloonTimeout).toBe(0);

		await handleSetBalloonWait(handler, ["set", "balloonwait", "150%"]);
		expect(setBalloonWaitSpy).toHaveBeenCalledWith("150%");

		await handleQuickSection(handler, ["quicksection", "1"]);
		expect(setQuickModeSpy).toHaveBeenCalledWith(true);

		await handleQuickSection(handler, ["quicksection", "0"]);
		expect(setQuickModeSpy).toHaveBeenCalledWith(false);
	});
});

describe("command-handler/media.js", () => {
	it("handles media, update, and service commands without error", async () => {
		const checkEmailSpy = vi.fn();
		const updateSpy = vi.fn();

		const handler = {
			app: {
				networkActions: { checkEmail: checkEmailSpy },
				startNetworkUpdate: updateSpy,
			},
		};

		await handleSetWallpaper(handler, ["setwallpaper", "bg.png", "center"]);
		await handleSaveWallpaper(handler, ["savewallpaper"]);
		await handleRestoreWallpaper(handler, ["restorewallpaper"]);
		await handleCancelNetworkService(handler, ["cancel", "http", "req1"]);
		await handleCloseNetworkService(handler, ["close", "http", "req1"]);
		await handleArchiveExec(handler, ["archiveexec", "createnar", "out.nar"]);
		await handleDownloadExec(handler, [
			"downloadexec",
			"https://example.com/file",
			"/tmp/file",
		]);
		await handleUploadExec(handler, [
			"uploadexec",
			"https://example.com/upload",
			"/tmp/file",
		]);
		await handleMailCheckExec(handler, ["mailcheckexec", "primary"]);
		expect(checkEmailSpy).toHaveBeenCalledWith("primary");
		await handleMailExec(handler, ["mailexec", "send", "user@example.com"]);
		await handleFileExec(handler, ["fileexec", "copy", "src.txt", "dst.txt"]);
		await handleSetHttpTimeout(handler, ["sethttptimeout", "30"]);
		await handleSetProxy(handler, ["setproxy", "localhost", "8080"]);
		await handleUpdate(handler);
		expect(updateSpy).toHaveBeenCalled();
		await handleUpdateByMyself(handler);
		expect(updateSpy).toHaveBeenCalledTimes(2);

		const events = [];
		const soundHandler = {
			app: {
				ghostController: {
					sendShioriEvent: vi.fn(async (name, refs) => {
						events.push({ name, refs });
					}),
				},
			},
		};
		const { handleSoundEventNotify } = await import(
			"../ui/js/ghost/command-handler/media.js"
		);
		await handleSoundEventNotify(soundHandler, "stop", ["sound1"]);
		await handleSoundEventNotify(soundHandler, "loop", ["sound2"]);
		await handleSoundEventNotify(soundHandler, "error", ["err"]);
		await handleSoundEventNotify(soundHandler, "playex", ["file.mp3"]);

		expect(events.map((e) => e.name)).toEqual([
			"OnSoundStop",
			"OnSoundLoop",
			"OnSoundError",
			"OnMusicPlayEx",
		]);
	});
});

describe("command-handler/plugin.js", () => {
	it("handles plugin events safely when tauri is not available", async () => {
		const handler = {};
		await handlePluginEvent(handler, [
			"raiseplugin",
			"PluginA",
			"OnTest",
			"ref1",
		]);
		await handlePluginEvent(handler, [
			"timerraiseplugin",
			"1000",
			"1",
			"PluginA",
			"OnTest",
			"ref1",
		]);
	});
});
