/**
 * @file notifications.ts
 * @brief SakuraPlaybackController 向け再生イベント通知ヘルパー
 */

<<<<<<< HEAD
export function notifyWait(this: unknown, durationMs: number) {
	this.emit("playback:wait", { durationMs, isQuickMode: this.isQuickMode });
}

export function notifyPause(this: unknown, noClear: boolean) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function notifyWait(this: any, durationMs: number) {
	this.emit("playback:wait", { durationMs, isQuickMode: this.isQuickMode });
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function notifyPause(this: any, noClear: boolean) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	this.emit("playback:pause", { noClear });
}

export function notifyClear(
<<<<<<< HEAD
	this: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	this: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	mode: "all" | "char" | "line",
	count: number,
) {
	this.emit("playback:clear", { mode, count });
}

<<<<<<< HEAD
export function notifyChar(this: unknown, char: string, scope: number) {
	this.emit("playback:char", { char, scope, isQuickMode: this.isQuickMode });
}

export function notifyScope(this: unknown, scope: number) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function notifyChar(this: any, char: string, scope: number) {
	this.emit("playback:char", { char, scope, isQuickMode: this.isQuickMode });
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function notifyScope(this: any, scope: number) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	this.emit("playback:scope", { scope });
}
