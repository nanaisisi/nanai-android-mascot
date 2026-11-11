/**
 * @file notifications.ts
 * @brief SakuraPlaybackController 向け再生イベント通知ヘルパー
 */

export interface PlaybackControllerContext {
	isQuickMode?: boolean;
	emit: (event: string, payload?: unknown) => void;
}

export function notifyWait(
	this: PlaybackControllerContext,
	durationMs: number,
) {
	this.emit("playback:wait", { durationMs, isQuickMode: this.isQuickMode });
}

export function notifyPause(this: PlaybackControllerContext, noClear: boolean) {
	this.emit("playback:pause", { noClear });
}

export function notifyClear(
	this: PlaybackControllerContext,
	mode: "all" | "char" | "line",
	count: number,
) {
	this.emit("playback:clear", { mode, count });
}

export function notifyChar(
	this: PlaybackControllerContext,
	char: string,
	scope: number,
) {
	this.emit("playback:char", { char, scope, isQuickMode: this.isQuickMode });
}

export function notifyScope(this: PlaybackControllerContext, scope: number) {
	this.emit("playback:scope", { scope });
}
