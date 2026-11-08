import {
	handleCallCommand,
	handleChangeCommand,
	handleEmbedCommand,
	handleNotifyOtherCommand,
	handleRaiseCommand,
	handleRaiseOtherCommand,
	handleVanishByMyself,
} from "../ghost.js";
import { handleJumpCommand } from "../jump.js";
import {
	handleQuickSection,
	handleResetSyncObject,
	handleSetBalloonTimeout,
	handleSetBalloonWait,
	handleSetChoiceTimeout,
	handleSetSyncObject,
	handleWaitSyncObject,
} from "../playback.js";
import { registerCommandHandler } from "../registry.js";
import { handleAnimCommand, handleBindCommand } from "../surface.js";

export function registerGhostCommandHandlers() {
	registerCommandHandler("jump", async (handler, args) => {
		await handleJumpCommand(handler, args[1], args.slice(2));
	});

	registerCommandHandler("raise", async (handler, args) => {
		await handleRaiseCommand(handler, args);
	});

	registerCommandHandler("raiseother", async (handler, args) => {
		await handleRaiseOtherCommand(handler, args);
	});

	registerCommandHandler("notifyother", async (handler, args) => {
		await handleNotifyOtherCommand(handler, args);
	});

	registerCommandHandler("embed", async (handler, args) => {
		await handleEmbedCommand(handler, args);
	});

	registerCommandHandler("change", async (handler, args) => {
		await handleChangeCommand(handler, args);
	});

	registerCommandHandler("call", async (handler, args) => {
		await handleCallCommand(handler, args);
	});

	registerCommandHandler("vanishbymyself", async (handler, args) => {
		await handleVanishByMyself(handler, args);
	});

	registerCommandHandler("bind", async (handler, args) => {
		await handleBindCommand(handler, args, true);
	});

	registerCommandHandler("bind-noevent", async (handler, args) => {
		await handleBindCommand(handler, args, false);
	});

	registerCommandHandler("open:dressupexplorer", async (handler, _args) => {
		handler.app.toggleMenu?.();
	});

	registerCommandHandler("anim", async (handler, args) => {
		await handleAnimCommand(handler, args);
	});

	registerCommandHandler("setchoicetimeout", async (handler, args) => {
		handleSetChoiceTimeout(handler, args);
	});
	registerCommandHandler("set:choicetimeout", async (handler, args) => {
		handleSetChoiceTimeout(handler, args);
	});

	registerCommandHandler("setballoontimeout", async (handler, args) => {
		handleSetBalloonTimeout(handler, args);
	});
	registerCommandHandler("set:balloontimeout", async (handler, args) => {
		handleSetBalloonTimeout(handler, args);
	});

	registerCommandHandler("setballoonwait", async (handler, args) => {
		handleSetBalloonWait(handler, args);
	});
	registerCommandHandler("set:balloonwait", async (handler, args) => {
		handleSetBalloonWait(handler, args);
	});

	registerCommandHandler("setsyncobject", async (handler, args) => {
		handleSetSyncObject(handler, args);
	});
	registerCommandHandler("set:syncobject", async (handler, args) => {
		handleSetSyncObject(handler, args);
	});

	registerCommandHandler("resetsyncobject", async (handler, args) => {
		handleResetSyncObject(handler, args);
	});
	registerCommandHandler("reset:syncobject", async (handler, args) => {
		handleResetSyncObject(handler, args);
	});

	registerCommandHandler("waitsyncobject", async (handler, args) => {
		await handleWaitSyncObject(handler, args);
	});
	registerCommandHandler("wait:syncobject", async (handler, args) => {
		await handleWaitSyncObject(handler, args);
	});

	registerCommandHandler("quicksection", async (handler, args) => {
		handleQuickSection(handler, args);
	});
}

