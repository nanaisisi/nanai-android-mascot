/**
 * @file defaults.ts
 * @brief 標準さくらスクリプトコマンドハンドラ初期登録
 */

import { closeCommunicateBox, openCommunicateBox } from "./communicatebox.js";
import { handleOpenDialogCommand } from "./dialog.js";
import {
	handleCallCommand,
	handleChangeCommand,
	handleEmbedCommand,
	handleNotifyOtherCommand,
	handleRaiseCommand,
	handleRaiseOtherCommand,
	handleVanishByMyself,
} from "./ghost.js";
import {
	closeDialog,
	closeInputBox,
	closeTextAreaBox,
	openDateInput,
	openInputBox,
	openIpInput,
	openPasswordInput,
	openSliderInput,
	openTextAreaBox,
	openTimeInput,
} from "./inputbox.js";
import { handleJumpCommand } from "./jump.js";
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
} from "./media.js";
import {
	handleQuickSection,
	handleResetSyncObject,
	handleSetBalloonTimeout,
	handleSetBalloonWait,
	handleSetChoiceTimeout,
	handleSetSyncObject,
	handleWaitSyncObject,
} from "./playback.js";
import { handlePluginEvent } from "./plugin.js";
import { CommandHandlerMap, registerCommandHandler } from "./registry.js";
import { handleAnimCommand, handleBindCommand } from "./surface.js";
import {
	handleBiffCommand,
	handleEnterMode,
	handleExecuteResetBalloonPos,
	handleExecuteResetWindowPos,
	handleExecuteSntpCommand,
	handleLeaveMode,
	handleNotifyCommand,
	handleOpenSystemTarget,
	handleReloadBalloon,
	handleReloadDescript,
	handleReloadGhost,
	handleReloadShell,
	handleReloadShiori,
	handleReloadSurface,
	handleSetAlignmentOnDesktop,
	handleSetAlphaCommand,
	handleSetPositionCommand,
	handleSetPropertyCommand,
	handleSetScalingCommand,
	handleSetShioriDebugMode,
	handleSetTaskTrayIcon,
	handleSetTrayBalloon,
	handleTimerRaiseCommand,
	handleTimerRaiseOtherCommand,
} from "./system.js";
import { closeTeachBox, openTeachBox } from "./teachbox.js";
import { handleWindowState, setAlignmentToDesktop } from "./window.js";

export function initDefaultCommandHandlers() {
	if (CommandHandlerMap.size > 0) return;

	registerCommandHandler("open:inputbox", async (handler, args) => {
		openInputBox(handler, args.slice(2));
	});

	registerCommandHandler("open:passwordinput", async (handler, args) => {
		openPasswordInput(handler, args.slice(2));
	});

	registerCommandHandler("open:textarea", async (handler, args) => {
		openTextAreaBox(handler, args.slice(2));
	});

	registerCommandHandler("open:slider", async (handler, args) => {
		openSliderInput(handler, args.slice(2));
	});

	registerCommandHandler("open:ipinput", async (handler, args) => {
		openIpInput(handler, args.slice(2));
	});

	registerCommandHandler("open:date", async (handler, args) => {
		openDateInput(handler, args.slice(2));
	});

	registerCommandHandler("open:time", async (handler, args) => {
		openTimeInput(handler, args.slice(2));
	});

	registerCommandHandler("open:teachbox", async (handler, args) => {
		openTeachBox(handler, args.slice(2));
	});

	registerCommandHandler("open:communicatebox", async (handler, args) => {
		openCommunicateBox(handler, args.slice(2));
	});

	registerCommandHandler("close:inputbox", async (handler, _args) => {
		closeInputBox(handler, true);
	});

	registerCommandHandler("close:textarea", async (handler, _args) => {
		closeTextAreaBox(handler, true);
	});

	registerCommandHandler("close:dialog", async (handler, _args) => {
		closeDialog(handler, true);
	});

	registerCommandHandler("close:teachbox", async (handler, _args) => {
		closeTeachBox(handler);
	});

	registerCommandHandler("close:communicatebox", async (handler, _args) => {
		closeCommunicateBox(handler, true);
	});

	registerCommandHandler("open:dialog", async (handler, args) => {
		await handleOpenDialogCommand(handler, args);
	});

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
		await handleBindCommand(handler, args);
	});

	registerCommandHandler("anim", async (handler, args) => {
		await handleAnimCommand(handler, args);
	});

	registerCommandHandler("update", async (handler, _args) => {
		await handleUpdate(handler);
	});

	registerCommandHandler("updatebymyself", async (handler, _args) => {
		await handleUpdateByMyself(handler);
	});

	registerCommandHandler("updateother", async (handler, _args) => {
		await handleUpdate(handler);
	});

	registerCommandHandler("mail", async (handler, args) => {
		await handleMailExec(handler, args);
	});

	registerCommandHandler("mailcheck", async (handler, args) => {
		await handleMailCheckExec(handler, args);
	});

	registerCommandHandler("file", async (handler, args) => {
		await handleFileExec(handler, args);
	});

	registerCommandHandler("download", async (handler, args) => {
		await handleDownloadExec(handler, args);
	});

	registerCommandHandler("upload", async (handler, args) => {
		await handleUploadExec(handler, args);
	});

	registerCommandHandler("archive", async (handler, args) => {
		await handleArchiveExec(handler, args);
	});

	registerCommandHandler("setproxy", async (handler, args) => {
		handleSetProxy(handler, args);
	});

	registerCommandHandler("sethttptimeout", async (handler, args) => {
		handleSetHttpTimeout(handler, args);
	});

	registerCommandHandler("savewallpaper", async (handler, args) => {
		await handleSaveWallpaper(handler, args);
	});

	registerCommandHandler("restorewallpaper", async (handler, args) => {
		await handleRestoreWallpaper(handler, args);
	});

	registerCommandHandler("setwallpaper", async (handler, args) => {
		await handleSetWallpaper(handler, args);
	});

	registerCommandHandler("cancelnetworkservice", async (handler, args) => {
		handleCancelNetworkService(handler, args);
	});

	registerCommandHandler("closenetworkservice", async (handler, args) => {
		handleCloseNetworkService(handler, args);
	});

	registerCommandHandler("setchoicetimeout", async (handler, args) => {
		handleSetChoiceTimeout(handler, args);
	});

	registerCommandHandler("setballoontimeout", async (handler, args) => {
		handleSetBalloonTimeout(handler, args);
	});

	registerCommandHandler("setballoonwait", async (handler, args) => {
		handleSetBalloonWait(handler, args);
	});

	registerCommandHandler("setsyncobject", async (handler, args) => {
		handleSetSyncObject(handler, args);
	});

	registerCommandHandler("resetsyncobject", async (handler, args) => {
		handleResetSyncObject(handler, args);
	});

	registerCommandHandler("waitsyncobject", async (handler, args) => {
		await handleWaitSyncObject(handler, args);
	});

	registerCommandHandler("quicksection", async (handler, args) => {
		handleQuickSection(handler, args);
	});

	registerCommandHandler("plugin", async (handler, args) => {
		await handlePluginEvent(handler, args);
	});

	registerCommandHandler("entermode", async (handler, args) => {
		handleEnterMode(handler, args);
	});

	registerCommandHandler("leavemode", async (handler, args) => {
		handleLeaveMode(handler, args);
	});

	registerCommandHandler("setposition", async (handler, args) => {
		handleSetPositionCommand(handler, args);
	});

	registerCommandHandler("setsensing", async (handler, args) => {
		handleSetScalingCommand(handler, args);
	});

	registerCommandHandler("setalpha", async (handler, args) => {
		handleSetAlphaCommand(handler, args);
	});

	registerCommandHandler("setproperty", async (handler, args) => {
		handleSetPropertyCommand(handler, args);
	});

	registerCommandHandler("opensystemtarget", async (handler, args) => {
		handleOpenSystemTarget(handler, args);
	});

	registerCommandHandler("reloadghost", async (handler, args) => {
		await handleReloadGhost(handler, args);
	});

	registerCommandHandler("reloadshell", async (handler, args) => {
		await handleReloadShell(handler, args);
	});

	registerCommandHandler("reloadballoon", async (handler, args) => {
		await handleReloadBalloon(handler, args);
	});

	registerCommandHandler("reloaddescript", async (handler, args) => {
		await handleReloadDescript(handler, args);
	});

	registerCommandHandler("reloadsurface", async (handler, args) => {
		await handleReloadSurface(handler, args);
	});

	registerCommandHandler("reloadshiori", async (handler, args) => {
		await handleReloadShiori(handler, args);
	});

	registerCommandHandler("executesntp", async (handler, args) => {
		await handleExecuteSntpCommand(handler, args);
	});

	registerCommandHandler("executeresetwindowpos", async (handler, args) => {
		handleExecuteResetWindowPos(handler, args);
	});

	registerCommandHandler("executeresetballoonpos", async (handler, args) => {
		handleExecuteResetBalloonPos(handler, args);
	});

	registerCommandHandler("biff", async (handler, args) => {
		await handleBiffCommand(handler, args);
	});

	registerCommandHandler("notify", async (handler, args) => {
		await handleNotifyCommand(handler, args);
	});

	registerCommandHandler("timerraise", async (handler, args) => {
		await handleTimerRaiseCommand(handler, args);
	});

	registerCommandHandler("timerraiseother", async (handler, args) => {
		await handleTimerRaiseOtherCommand(handler, args);
	});

	registerCommandHandler("setshioridebugmode", async (handler, args) => {
		handleSetShioriDebugMode(handler, args);
	});

	registerCommandHandler("settasktrayicon", async (handler, args) => {
		handleSetTaskTrayIcon(handler, args);
	});

	registerCommandHandler("settrayballoon", async (handler, args) => {
		handleSetTrayBalloon(handler, args);
	});

	registerCommandHandler("setalignmenttodesktop", async (handler, args) => {
		handleSetAlignmentOnDesktop(handler, args);
	});

	registerCommandHandler("windowstate", async (_handler, args) => {
		handleWindowState(args[1]);
	});

	registerCommandHandler("alignmenttodesktop", async (handler, args) => {
		setAlignmentToDesktop(handler, args);
	});
}
