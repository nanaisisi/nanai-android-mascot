/**
 * @file wait.js
 * @brief SakuraPlaybackController 向けウェイト・倍率・即時表示制御ロジック
 */

/**
 * ウェイト倍率の設定
 * @param {number} ratio
 */
export function setWaitMultiplier(ratio) {
	const valid = typeof ratio === "number" && !Number.isNaN(ratio) && ratio >= 0;
	this.waitMultiplier = valid ? ratio : 1.0;
	this.charWaitMs = null;
	this.emit("playback:wait-multiplier", {
		waitMultiplier: this.waitMultiplier,
	});
}

/**
 * 現在のウェイト倍率を取得
 * @returns {number}
 */
export function getWaitMultiplier() {
	return this.waitMultiplier;
}

/**
 * バルーンウェイト設定 (\![set,balloonwait,倍率])
 * 仕様:
 * - 数値のみ: 0〜100 (1で等倍、0で即時表示、小数可)
 * - %指定: 0%〜10000% (100%で等倍)
 * - ms指定: 0ms〜10000ms (1文字あたりの待機時間をミリ秒絶対指定)
 * - 省略または "1": デフォルトに戻す
 * @param {string|number} [param]
 */
export function setBalloonWait(param) {
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

/**
 * バルーンウェイトをデフォルトにリセット
 */
export function resetBalloonWait() {
	this.waitMultiplier = 1.0;
	this.charWaitMs = null;
	this.emit("playback:balloon-wait", {
		waitMultiplier: 1.0,
		charWaitMs: null,
	});
}

/**
 * 与えられたベースウェイト(ms)に倍率または絶対値を適用した実効ウェイトを算出
 * @param {number} baseMs
 * @param {boolean} [isCharWait=false]
 * @returns {number}
 */
export function calculateWait(baseMs, isCharWait = false) {
	if (this.isQuickMode) return 0;
	if (isCharWait && this.charWaitMs !== null) {
		return Math.round(this.charWaitMs);
	}
	const ms = Math.max(0, Number(baseMs) || 0);
	return Math.round(ms * this.waitMultiplier);
}

/**
 * 即時表示モード (\\_q) の切り替え
 * @param {boolean} [enable]
 */
export function setQuickMode(enable) {
	const prev = this.isQuickMode;
	this.isQuickMode = typeof enable === "boolean" ? enable : !this.isQuickMode;
	this.emit("playback:quick-mode", { enabled: this.isQuickMode, prev });
}
