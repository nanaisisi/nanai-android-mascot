/**
 * @file system/timer/registry.ts
 * @brief スクリプトタイマーの登録簿と共通のスケジュール/キャンセル処理
 */

const activeScriptTimers = new Map<
	string,
	{ id: unknown; type: "interval" | "timeout" }
>();

export function clearAllScriptTimers() {
	for (const timer of activeScriptTimers.values()) {
		if (timer.type === "interval") {
			clearInterval(timer.id as number);
		} else {
			clearTimeout(timer.id as number);
		}
	}
	activeScriptTimers.clear();
}

export function getActiveScriptTimersCount(): number {
	return activeScriptTimers.size;
}

/** 同一キーで登録済みのタイマーがあれば停止して登録簿から外す */
export function cancelScriptTimer(timerKey: string) {
	const existing = activeScriptTimers.get(timerKey);
	if (!existing) return;
	if (existing.type === "interval") {
		clearInterval(existing.id as number);
	} else {
		clearTimeout(existing.id as number);
	}
	activeScriptTimers.delete(timerKey);
}

/**
 * タイマーを登録する。repeatFlag === 0 は繰り返し、それ以外は一度だけ発火する。
 */
export function scheduleScriptTimer(
	timerKey: string,
	delayMs: number,
	repeatFlag: number,
	fireEvent: () => Promise<void>,
) {
	if (repeatFlag === 0) {
		const intervalId = setInterval(fireEvent, delayMs);
		activeScriptTimers.set(timerKey, { id: intervalId, type: "interval" });
	} else {
		const timeoutId = setTimeout(async () => {
			activeScriptTimers.delete(timerKey);
			await fireEvent();
		}, delayMs);
		activeScriptTimers.set(timerKey, { id: timeoutId, type: "timeout" });
	}
}
