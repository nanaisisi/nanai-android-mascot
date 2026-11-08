/**
 * @file wait.ts
 * @brief SakuraPlaybackController 向けウェイト・倍率・即時表示制御ロジック
 */

export function setWaitMultiplier(this: unknown, ratio: number) {
	const valid = typeof ratio === "number" && !Number.isNaN(ratio) && ratio >= 0;
	this.waitMultiplier = valid ? ratio : 1.0;
	this.charWaitMs = null;
	this.emit("playback:wait-multiplier", {
		waitMultiplier: this.waitMultiplier,
	});
}

export function getWaitMultiplier(this: unknown): number {
	return this.waitMultiplier;
}

export function setBalloonWait(
	this: unknown,
	param: string | number | undefined,
) {
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

export function resetBalloonWait(this: unknown) {
	this.waitMultiplier = 1.0;
	this.charWaitMs = null;
	this.emit("playback:balloon-wait", {
		waitMultiplier: 1.0,
		charWaitMs: null,
	});
}

export function calculateWait(
	this: unknown,
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

export function setQuickMode(this: unknown, enable?: boolean) {
	const prev = this.isQuickMode;
	this.isQuickMode = typeof enable === "boolean" ? enable : !this.isQuickMode;
	this.emit("playback:quick-mode", { enabled: this.isQuickMode, prev });
}
