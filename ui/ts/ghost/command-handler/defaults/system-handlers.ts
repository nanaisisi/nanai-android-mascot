import { handlePluginEvent } from "../plugin.js";
import { registerCommandHandler } from "../registry.js";
import {
	handleBiffCommand,
	handleEnterMode,
	handleExecuteResetBalloonPos,
	handleExecuteResetWindowPos,
	handleExecuteSntpCommand,
	handleGetPropertyCommand,
	handleLeaveMode,
	handleLoadMakoto,
	handleNotifyCommand,
	handleOpenSystemTarget,
	handleReloadAigraph,
	handleReloadBalloon,
	handleReloadDescript,
	handleReloadGhost,
	handleReloadMakoto,
	handleReloadShell,
	handleReloadShiori,
	handleReloadSurface,
	handleSetAlignmentOnDesktop,
	handleSetAlphaCommand,
	handleSetOtherSurfaceChangeCommand,
	handleSetPositionCommand,
	handleSetPropertyCommand,
	handleSetScalingCommand,
	handleSetSerikoTalkCommand,
	handleSetShioriDebugMode,
	handleSetTaskTrayIcon,
	handleSetTrayBalloon,
	handleTimerNotifyCommand,
	handleTimerPluginCommand,
	handleTimerRaiseCommand,
	handleTimerRaiseOtherCommand,
	handleUnloadMakoto,
} from "../system.js";
import { handleWindowState, setAlignmentToDesktop } from "../window.js";

export function registerSystemCommandHandlers() {
	registerCommandHandler("set:alignmenttodesktop", async (handler, args) => {
		handleSetAlignmentOnDesktop(handler, args);
	});
	registerCommandHandler("set:alignmentondesktop", async (handler, args) => {
		handleSetAlignmentOnDesktop(handler, args);
	});
	registerCommandHandler("set:tasktrayicon", async (handler, args) => {
		handleSetTaskTrayIcon(handler, args);
	});
	registerCommandHandler("set:trayballoon", async (handler, args) => {
		handleSetTrayBalloon(handler, args);
	});

	registerCommandHandler("plugin", async (handler, args) => {
		await handlePluginEvent(handler, args);
	});

	registerCommandHandler("entermode", async (handler, args) => {
		handleEnterMode(handler, args);
	});
	registerCommandHandler("enter:passivemode", async (handler, args) => {
		handleEnterMode(handler, args);
	});
	registerCommandHandler("enter:talkmode", async (handler, args) => {
		handleEnterMode(handler, args);
	});

	registerCommandHandler("leavemode", async (handler, args) => {
		handleLeaveMode(handler, args);
	});
	registerCommandHandler("leave:passivemode", async (handler, args) => {
		handleLeaveMode(handler, args);
	});
	registerCommandHandler("leave:talkmode", async (handler, args) => {
		handleLeaveMode(handler, args);
	});

	registerCommandHandler("setposition", async (handler, args) => {
		handleSetPositionCommand(handler, args);
	});
	registerCommandHandler("set:position", async (handler, args) => {
		handleSetPositionCommand(handler, args);
	});

	registerCommandHandler("setsensing", async (handler, args) => {
		handleSetScalingCommand(handler, args);
	});
	registerCommandHandler("set:scaling", async (handler, args) => {
		handleSetScalingCommand(handler, args);
	});

	registerCommandHandler("setalpha", async (handler, args) => {
		handleSetAlphaCommand(handler, args);
	});
	registerCommandHandler("set:alpha", async (handler, args) => {
		handleSetAlphaCommand(handler, args);
	});

	registerCommandHandler("setproperty", async (handler, args) => {
		handleSetPropertyCommand(handler, args);
	});
	registerCommandHandler("set:property", async (handler, args) => {
		handleSetPropertyCommand(handler, args);
	});

	registerCommandHandler("getproperty", async (handler, args) => {
		await handleGetPropertyCommand(handler, args);
	});
	registerCommandHandler("get:property", async (handler, args) => {
		await handleGetPropertyCommand(handler, args);
	});

	registerCommandHandler("setserikotalk", async (handler, args) => {
		handleSetSerikoTalkCommand(handler, args);
	});
	registerCommandHandler("set:serikotalk", async (handler, args) => {
		handleSetSerikoTalkCommand(handler, args);
	});

	registerCommandHandler("setothersurfacechange", async (handler, args) => {
		handleSetOtherSurfaceChangeCommand(handler, args);
	});
	registerCommandHandler("set:othersurfacechange", async (handler, args) => {
		handleSetOtherSurfaceChangeCommand(handler, args);
	});

	registerCommandHandler("opensystemtarget", async (handler, args) => {
		handleOpenSystemTarget(handler, args);
	});
	registerCommandHandler("open", async (handler, args) => {
		await handleOpenSystemTarget(handler, args);
	});

	registerCommandHandler("reloadghost", async (handler, args) => {
		await handleReloadGhost(handler, args);
	});
	registerCommandHandler("reload:ghost", async (handler, args) => {
		await handleReloadGhost(handler, args);
	});

	registerCommandHandler("reloadshell", async (handler, args) => {
		await handleReloadShell(handler, args);
	});
	registerCommandHandler("reload:shell", async (handler, args) => {
		await handleReloadShell(handler, args);
	});

	registerCommandHandler("reloadballoon", async (handler, args) => {
		await handleReloadBalloon(handler, args);
	});
	registerCommandHandler("reload:balloon", async (handler, args) => {
		await handleReloadBalloon(handler, args);
	});

	registerCommandHandler("reloaddescript", async (handler, args) => {
		await handleReloadDescript(handler, args);
	});
	registerCommandHandler("reload:descript", async (handler, args) => {
		await handleReloadDescript(handler, args);
	});

	registerCommandHandler("reloadsurface", async (handler, args) => {
		await handleReloadSurface(handler, args);
	});
	registerCommandHandler("reload:surface", async (handler, args) => {
		await handleReloadSurface(handler, args);
	});

	registerCommandHandler("reloadshiori", async (handler, args) => {
		await handleReloadShiori(handler, args);
	});
	registerCommandHandler("reload:shiori", async (handler, args) => {
		await handleReloadShiori(handler, args);
	});

	registerCommandHandler("executesntp", async (handler, args) => {
		await handleExecuteSntpCommand(handler, args);
	});

	registerCommandHandler("executeresetwindowpos", async (handler, args) => {
		handleExecuteResetWindowPos(handler, args);
	});
	registerCommandHandler("execute:resetwindowpos", async (handler, args) => {
		handleExecuteResetWindowPos(handler, args);
	});

	registerCommandHandler("executeresetballoonpos", async (handler, args) => {
		handleExecuteResetBalloonPos(handler, args);
	});
	registerCommandHandler("execute:resetballoonpos", async (handler, args) => {
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

	registerCommandHandler("timernotify", async (handler, args) => {
		await handleTimerNotifyCommand(handler, args);
	});

	registerCommandHandler("timerraiseother", async (handler, args) => {
		await handleTimerRaiseOtherCommand(handler, args);
	});

	registerCommandHandler("timernotifyother", async (handler, args) => {
		await handleTimerRaiseOtherCommand(handler, args);
	});

	registerCommandHandler("timerraiseplugin", async (handler, args) => {
		await handleTimerPluginCommand(handler, args);
	});

	registerCommandHandler("timernotifyplugin", async (handler, args) => {
		await handleTimerPluginCommand(handler, args);
	});

	registerCommandHandler("notifyplugin", async (handler, args) => {
		await handlePluginEvent(handler, args);
	});

	registerCommandHandler("raiseplugin", async (handler, args) => {
		await handlePluginEvent(handler, args);
	});

	registerCommandHandler("setshioridebugmode", async (handler, args) => {
		handleSetShioriDebugMode(handler, args);
	});
	registerCommandHandler("set:shioridebugmode", async (handler, args) => {
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

	registerCommandHandler("windowstate", async (handler, args) => {
		await handleWindowState(args[1], handler);
	});
	registerCommandHandler("set:windowstate", async (handler, args) => {
		await handleWindowState(args[2] ?? args[1], handler);
	});

	registerCommandHandler("alignmenttodesktop", async (handler, args) => {
		setAlignmentToDesktop(handler, args[1]);
	});

	registerCommandHandler("loadmakoto", async (handler, args) => {
		await handleLoadMakoto(handler, args);
	});
	registerCommandHandler("load:makoto", async (handler, args) => {
		await handleLoadMakoto(handler, args);
	});

	registerCommandHandler("unloadmakoto", async (handler, args) => {
		await handleUnloadMakoto(handler, args);
	});
	registerCommandHandler("unload:makoto", async (handler, args) => {
		await handleUnloadMakoto(handler, args);
	});

	registerCommandHandler("reloadmakoto", async (handler, args) => {
		await handleReloadMakoto(handler, args);
	});
	registerCommandHandler("reload:makoto", async (handler, args) => {
		await handleReloadMakoto(handler, args);
	});

	registerCommandHandler("reloadaigraph", async (handler, args) => {
		await handleReloadAigraph(handler, args);
	});
	registerCommandHandler("reload:aigraph", async (handler, args) => {
		await handleReloadAigraph(handler, args);
	});
}
