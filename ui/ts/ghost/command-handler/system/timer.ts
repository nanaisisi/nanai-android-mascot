/**
 * @file timer.ts
 * @brief スクリプトタイマー管理・Notify/TimerRaise コマンドハンドラ (サブモジュールの再エクスポート)
 */

export { handleTimerRaiseOtherCommand } from "./timer/other.js";
export { handleTimerPluginCommand } from "./timer/plugin.js";
export {
	handleNotifyCommand,
	handleTimerNotifyCommand,
	handleTimerRaiseCommand,
} from "./timer/raise.js";
export {
	clearAllScriptTimers,
	getActiveScriptTimersCount,
} from "./timer/registry.js";
