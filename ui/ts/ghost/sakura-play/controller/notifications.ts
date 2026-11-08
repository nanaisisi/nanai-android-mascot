/**
 * @file notifications.ts
 * @brief SakuraPlaybackController 向け再生イベント通知ヘルパー
 */


export function notifyWait(this: unknown, durationMs: number) {
	this.emit("playback:wait", { durationMs, isQuickMode: this.isQuickMode });
}

export function notifyPause(this: unknown, _noClear: boolean) {


export function _notifyWait(this: any, durationMs: number) {
	this.emit("playback:wait", { durationMs, isQuickMode: this.isQuickMode });
}


export function _notifyPause(this: any, noClear: boolean) {

	this.emit("playback:pause", noClear );
}

export function notifyClear(

	this: unknown,


	this: any,

	mode: "all" | "char" | "line",
	count: number,
)
	this.emit("playback:clear", mode, count );


export function _notifyChar(this: unknown, char: string, scope: number) {
	this.emit("playback:char", { char, scope, isQuickMode: this.isQuickMode });
}

export function _notifyScope(this: unknown, _scope: number) {


export function _notifyChar(this: any, char: string, scope: number) {
	this.emit("playback:char", { char, scope, isQuickMode: this.isQuickMode });
}


export function _notifyScope(this: any, scope: number) {

	this.emit("playback:scope", scope );
}
