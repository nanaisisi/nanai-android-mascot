/**
 * @file system.ts
 * @brief SSP拡張システム制御コマンドハンドラ群 (Slot-06)
 */

export {
	handleExecuteResetBalloonPos,
	handleExecuteResetWindowPos,
	handleSetAlignmentOnDesktop,
	handleSetTaskTrayIcon,
	handleSetTrayBalloon,
	triggerTrayBalloonClick,
} from "./system/desktop.js";
export {
	handleLoadMakoto,
	handleReloadAigraph,
	handleReloadBalloon,
	handleReloadDescript,
	handleReloadGhost,
	handleReloadMakoto,
	handleReloadShell,
	handleReloadShiori,
	handleReloadSurface,
	handleSetShioriDebugMode,
	handleUnloadMakoto,
} from "./system/shiori.js";
export {
	handleEnterMode,
	handleGetPropertyCommand,
	handleKeyPressEvent,
	handleLeaveMode,
	handleSetAlphaCommand,
	handleSetOtherSurfaceChangeCommand,
	handleSetPositionCommand,
	handleSetPropertyCommand,
	handleSetScalingCommand,
	handleSetSerikoTalkCommand,
} from "./system/surface.js";
export {
	handleBiffCommand,
	handleExecuteSntpCommand,
	handleHourTimeSignal,
	handleOpenSystemTarget,
} from "./system/target.js";
export {
	clearAllScriptTimers,
	getActiveScriptTimersCount,
	handleNotifyCommand,
	handleTimerNotifyCommand,
	handleTimerPluginCommand,
	handleTimerRaiseCommand,
	handleTimerRaiseOtherCommand,
} from "./system/timer.js";
