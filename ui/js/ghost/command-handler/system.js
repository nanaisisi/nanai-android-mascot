/**
 * @file system.js
 * @brief SSP拡張システム制御コマンドハンドラ群 (Slot-06)
 * [bang-set-alignmentondesktop-bottom-top.md], [bang-set-tasktrayicon-.ico-duration-eq-runcount-eq.md],
 * [bang-set-trayballoon.md], [bang-biff.md], [bang-executesntp.md], [bang-open-explorer.md] 等
 *
 * 各サブモジュール (timer, desktop, target, surface, shiori) の統合ファサード
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
	handleSetPositionCommand,
	handleSetPropertyCommand,
	handleSetScalingCommand,
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
