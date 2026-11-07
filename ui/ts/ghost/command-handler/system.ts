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
	handleReloadBalloon,
	handleReloadDescript,
	handleReloadGhost,
	handleReloadShell,
	handleReloadShiori,
	handleReloadSurface,
	handleSetShioriDebugMode,
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
	handleNotifyCommand,
	handleTimerRaiseCommand,
	handleTimerRaiseOtherCommand,
} from "./system/timer.js";
