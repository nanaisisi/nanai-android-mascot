/**
 * @file notifications.ts
 * @brief SakuraPlaybackController 向け再生イベント通知ヘルパー
 */

export function notifyWait(this: any, durationMs: number) {
	this.emit("playback:wait", { durationMs, isQuickMode: this.isQuickMode });
}

export function notifyPause(this: any, noClear: boolean) {
	this.emit("playback:pause", { noClear });
}

export function notifyClear(this: any, mode: "all" | "char" | "line", count: number) {
	this.emit("playback:clear", { mode, count });
}

export function notifyChar(this: any, char: string, scope: number) {
	this.emit("playback:char", { char, scope, isQuickMode: this.isQuickMode });
}

export function notifyScope(this: any, scope: number) {
	this.emit("playback:scope", { scope });
}
