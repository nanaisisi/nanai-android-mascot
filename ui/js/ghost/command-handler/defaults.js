/**
 * @file defaults.js
 * @brief 標準さくらスクリプトコマンドハンドラ初期登録
 */

import { closeCommunicateBox, openCommunicateBox } from "./communicatebox.js";
import { handleOpenDialogCommand } from "./dialog.js";
import {
	handleCallCommand,
	handleChangeCommand,
	handleRaiseCommand,
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
	handleExecuteResetBalloonPos,
	handleExecuteResetWindowPos,
	handleExecuteSntpCommand,
	handleNotifyCommand,
	handleOpenSystemTarget,
	handleReloadShiori,
	handleSetAlignmentOnDesktop,
	handleSetAlphaCommand,
	handleSetPositionCommand,
	handleSetPropertyCommand,
	handleSetScalingCommand,
	handleSetShioriDebugMode,
	handleSetTaskTrayIcon,
	handleSetTrayBalloon,
	handleTimerRaiseCommand,
} from "./system.js";
import { closeTeachBox, openTeachBox } from "./teachbox.js";
import { handleWindowState, setAlignmentToDesktop } from "./window.js";

/**
 * 標準コマンド群を CommandHandlerMap へ初期登録
 */
export function initDefaultCommandHandlers() {
	if (CommandHandlerMap.size > 0) return;

	registerCommandHandler("open:inputbox", async (handler, args) => {
		openInputBox(handler, args.slice(2));
	});

	registerCommandHandler("open:passwordinput", async (handler, args) => {
		openPasswordInput(handler, args.slice(2));
	});

	registerCommandHandler("open:textareabox", async (handler, args) => {
		openTextAreaBox(handler, args.slice(2));
	});

	registerCommandHandler("open:sliderinput", async (handler, args) => {
		openSliderInput(handler, args.slice(2));
	});

	registerCommandHandler("open:dateinput", async (handler, args) => {
		openDateInput(handler, args.slice(2));
	});

	registerCommandHandler("open:timeinput", async (handler, args) => {
		openTimeInput(handler, args.slice(2));
	});

	registerCommandHandler("open:ipinput", async (handler, args) => {
		openIpInput(handler, args.slice(2));
	});

	registerCommandHandler("open:dialog", handleOpenDialogCommand);

	registerCommandHandler("close:inputbox", async (handler, args) => {
		closeInputBox(handler, args[2]);
	});

	registerCommandHandler("close:textareabox", async (handler, args) => {
		closeTextAreaBox(handler, args[2]);
	});

	registerCommandHandler("close:dateinput", async (handler, args) => {
		closeInputBox(handler, args[2]);
	});

	registerCommandHandler("close:timeinput", async (handler, args) => {
		closeInputBox(handler, args[2]);
	});

	registerCommandHandler("close:ipinput", async (handler, args) => {
		closeInputBox(handler, args[2]);
	});

	registerCommandHandler("close:dialog", async (handler, args) => {
		closeDialog(handler, args[2]);
	});

	registerCommandHandler("open:teachbox", async (handler, args) => {
		openTeachBox(handler, args.slice(2));
	});

	registerCommandHandler("close:teachbox", async (handler) => {
		closeTeachBox(handler);
	});

	registerCommandHandler("open:communicatebox", async (handler, args) => {
		openCommunicateBox(handler, args.slice(2));
	});

	registerCommandHandler("close:communicatebox", async (handler) => {
		closeCommunicateBox(handler, false);
	});

	registerCommandHandler("open:dressupexplorer", async (handler) => {
		handler.app.toggleMenu?.();
	});

	registerCommandHandler("jump", async (handler, args) => {
		const target = args[1] ?? "";
		await handleJumpCommand(handler, target, args.slice(2));
	});

	registerCommandHandler("raise", handleRaiseCommand);
	registerCommandHandler("notify", handleNotifyCommand);
	registerCommandHandler("timerraise", handleTimerRaiseCommand);
	registerCommandHandler("timernotify", handleTimerRaiseCommand);

	registerCommandHandler("raiseplugin", handlePluginEvent);
	registerCommandHandler("notifyplugin", handlePluginEvent);
	registerCommandHandler("timerraiseplugin", handlePluginEvent);
	registerCommandHandler("timernotifyplugin", handlePluginEvent);

	registerCommandHandler("bind", async (handler, args) => {
		await handleBindCommand(handler, args, true);
	});

	registerCommandHandler("bind-noevent", async (handler, args) => {
		await handleBindCommand(handler, args, false);
	});

	registerCommandHandler("anim", handleAnimCommand);

	registerCommandHandler("set:choicetimeout", handleSetChoiceTimeout);
	registerCommandHandler("set:balloontimeout", handleSetBalloonTimeout);
	registerCommandHandler("set:balloonwait", handleSetBalloonWait);
	registerCommandHandler("set:syncobject", handleSetSyncObject);
	registerCommandHandler("reset:syncobject", handleResetSyncObject);
	registerCommandHandler("wait:syncobject", handleWaitSyncObject);
	registerCommandHandler("quicksection", handleQuickSection);

	registerCommandHandler("set:alignmenttodesktop", async (handler, args) => {
		await setAlignmentToDesktop(handler, args[2]);
	});

	registerCommandHandler("set:alignmentondesktop", handleSetAlignmentOnDesktop);
	registerCommandHandler("set:property", handleSetPropertyCommand);
	registerCommandHandler("set:scaling", handleSetScalingCommand);
	registerCommandHandler("set:alpha", handleSetAlphaCommand);
	registerCommandHandler("set:position", handleSetPositionCommand);
	registerCommandHandler("set:shioridebugmode", handleSetShioriDebugMode);
	registerCommandHandler("reload:shiori", handleReloadShiori);

	registerCommandHandler("execute:resetwindowpos", handleExecuteResetWindowPos);
	registerCommandHandler(
		"execute:resetballoonpos",
		handleExecuteResetBalloonPos,
	);

	registerCommandHandler("set:tasktrayicon", handleSetTaskTrayIcon);
	registerCommandHandler("set:trayballoon", handleSetTrayBalloon);

	registerCommandHandler("biff", handleBiffCommand);
	registerCommandHandler("executesntp", handleExecuteSntpCommand);

	registerCommandHandler("open:explorer", handleOpenSystemTarget);
	registerCommandHandler("open:shellexplorer", handleOpenSystemTarget);
	registerCommandHandler("open:balloonexplorer", handleOpenSystemTarget);
	registerCommandHandler("open:ghostexplorer", handleOpenSystemTarget);
	registerCommandHandler("open:file", handleOpenSystemTarget);
	registerCommandHandler("open:browser", handleOpenSystemTarget);
	registerCommandHandler("open:configurationdialog", handleOpenSystemTarget);
	registerCommandHandler("open:developer", handleOpenSystemTarget);
	registerCommandHandler("open:readme", handleOpenSystemTarget);
	registerCommandHandler("open:history", handleOpenSystemTarget);

	registerCommandHandler("windowstate", async (_handler, args) => {
		const state = args[1];
		if (state) {
			await handleWindowState(state);
		}
	});

	registerCommandHandler("change", handleChangeCommand);
	registerCommandHandler("call", handleCallCommand);

	registerCommandHandler("setwallpaper", handleSetWallpaper);
	registerCommandHandler("savewallpaper", handleSaveWallpaper);
	registerCommandHandler("restorewallpaper", handleRestoreWallpaper);

	registerCommandHandler("cancel", handleCancelNetworkService);
	registerCommandHandler("close", handleCloseNetworkService);

	registerCommandHandler("archiveexec", handleArchiveExec);
	registerCommandHandler("downloadexec", handleDownloadExec);
	registerCommandHandler("uploadexec", handleUploadExec);
	registerCommandHandler("mailcheckexec", handleMailCheckExec);
	registerCommandHandler("mailexec", handleMailExec);
	registerCommandHandler("fileexec", handleFileExec);
	registerCommandHandler("sethttptimeout", handleSetHttpTimeout);
	registerCommandHandler("setproxy", handleSetProxy);

	registerCommandHandler("update", handleUpdate);
	registerCommandHandler("updatebymyself", handleUpdateByMyself);
}
