/**
 * @file notifications.js
 * @brief SakuraPlaybackController 向け再生イベント通知ヘルパー
 */

/**
 * ウェイトイベント発火
 * @param {number} durationMs
 */
export function notifyWait(durationMs) {
	this.emit("playback:wait", { durationMs, isQuickMode: this.isQuickMode });
}

/**
 * クリック待ちイベント発火
 * @param {boolean} noClear
 */
export function notifyPause(noClear) {
	this.emit("playback:pause", { noClear });
}

/**
 * バルーンクリアイベント発火
 * @param {"all"|"char"|"line"} mode
 * @param {number} count
 */
export function notifyClear(mode, count) {
	this.emit("playback:clear", { mode, count });
}

/**
 * 1文字発話イベント発火
 * @param {string} char
 * @param {number} scope
 */
export function notifyChar(char, scope) {
	this.emit("playback:char", { char, scope, isQuickMode: this.isQuickMode });
}

/**
 * スコープ切り替えイベント発火
 * @param {number} scope
 */
export function notifyScope(scope) {
	this.emit("playback:scope", { scope });
}
