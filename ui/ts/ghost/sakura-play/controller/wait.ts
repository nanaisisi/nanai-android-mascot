/**
 * @file wait.ts
 * @brief SakuraPlaybackController 向けウェイト・倍率・即時表示制御ロジック
 */

<<<<<<< HEAD
export function setWaitMultiplier(this: unknown, _ratio: number) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _setWaitMultiplier(this: any, ratio: number) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const valid = typeof ratio === "number" && !Number.isNaN(ratio) && ratio >= 0;
	this.waitMultiplier = valid ? ratio : 1.0;
	this.charWaitMs = null;
	this.emit("playback:wait-multiplier", {
		waitMultiplier: this.waitMultiplier,
	});
}

<<<<<<< HEAD
export function _getWaitMultiplier(this: unknown): number {
	return this.waitMultiplier;
}

export function _setBalloonWait(
	this: unknown,
	_param: string | number | undefined,
) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _getWaitMultiplier(this: any): number {
	return this.waitMultiplier;
}

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _setBalloonWait(this: any, param: string | number | undefined) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	if (param === undefined || param === null || param === "" || param === "1") {
		this.resetBalloonWait();
		return;
	}

	const str = String(param).trim().toLowerCase();
	if (str.endsWith("ms")) {
		const ms = Number.parseFloat(str.slice(0, -2));
		if (!Number.isNaN(ms) && ms >= 0) {
			this.charWaitMs = Math.min(10000, ms);
			this.waitMultiplier = 1.0;
		}
	} else if (str.endsWith("%")) {
		const pct = Number.parseFloat(str.slice(0, -1));
		if (!Number.isNaN(pct) && pct >= 0) {
			this.charWaitMs = null;
			this.waitMultiplier = Math.min(100, pct / 100);
		}
	} else {
		const num = Number.parseFloat(str);
		if (!Number.isNaN(num) && num >= 0) {
			this.charWaitMs = null;
			this.waitMultiplier = Math.min(100, num);
		}
	}

	this.emit("playback:balloon-wait", {
		waitMultiplier: this.waitMultiplier,
		charWaitMs: this.charWaitMs,
	});
}

<<<<<<< HEAD
export function _resetBalloonWait(this: unknown) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _resetBalloonWait(this: any) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	this.waitMultiplier = 1.0;
	this.charWaitMs = null;
	this.emit("playback:balloon-wait", {
		waitMultiplier: 1.0,
		charWaitMs: null,
	});
}

export function calculateWait(
<<<<<<< HEAD
	this: unknown,
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	this: any,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	baseMs: number,
	isCharWait: boolean = false,
): number {
	if (this.isQuickMode) return 0;
	if (isCharWait && this.charWaitMs !== null) {
		return Math.round(this.charWaitMs);
	}
	const ms = Math.max(0, Number(baseMs) || 0);
	return Math.round(ms * this.waitMultiplier);
}

<<<<<<< HEAD
export function _setQuickMode(this: unknown, _enable?: boolean) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export function _setQuickMode(this: any, enable?: boolean) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
	const prev = this.isQuickMode;
	this.isQuickMode = typeof enable === "boolean" ? enable : !this.isQuickMode;
	this.emit("playback:quick-mode", { enabled: this.isQuickMode, prev });
}
