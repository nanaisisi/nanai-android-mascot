/**
 * @file timer.js
 * @brief スクリプトタイマー管理・Notify/TimerRaise コマンドハンドラ
 */

/**
 * タイマー実行管理マップ (timerKey -> { id, type: 'interval' | 'timeout' })
 */
const activeScriptTimers = new Map();

/**
 * タイマーをすべてクリア
 */
export function clearAllScriptTimers() {
	for (const timer of activeScriptTimers.values()) {
		if (timer.type === "interval") {
			clearInterval(timer.id);
		} else {
			clearTimeout(timer.id);
		}
	}
	activeScriptTimers.clear();
}

/**
 * \![notify,イベント名,r0,r1,...]
 * [bang-notify-r0-r1-r2.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleNotifyCommand(handler, args) {
	const eventName = args[1];
	if (!eventName) return;
	const references = args.slice(2);
	try {
		// notifyは戻り値のスクリプトを反映・再生しない
		if (handler.app.ghostController?.sendShioriNotify) {
			await handler.app.ghostController.sendShioriNotify(eventName, references);
		} else if (handler.app.ghostController?.sendShioriEvent) {
			await handler.app.ghostController.sendShioriEvent(eventName, references);
		}
	} catch (err) {
		console.warn(`Notify event failed (${eventName}):`, err);
	}
}

/**
 * \![timerraise,時間,繰り返すか否か,イベント名,r0,r1,...]
 * [bang-timerraise-r0-r1-r2.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleTimerRaiseCommand(handler, args) {
	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const eventName = args[3];
	const references = args.slice(4);

	if (!eventName) return;

	// 同一イベント名のタイマーが既存にあればキャンセル
	if (activeScriptTimers.has(eventName)) {
		const existing = activeScriptTimers.get(eventName);
		if (existing.type === "interval") {
			clearInterval(existing.id);
		} else {
			clearTimeout(existing.id);
		}
		activeScriptTimers.delete(eventName);
	}

	// 時間が0以下の場合はキャンセル専用
	if (delayMs <= 0) {
		return;
	}

	const fireEvent = async () => {
		try {
			await handler.app.ghostController?.sendShioriEvent?.(
				eventName,
				references,
			);
		} catch (e) {
			console.warn(`timerraise event failed (${eventName}):`, e);
		}
	};

	if (repeatFlag === 0) {
		// 0: 繰り返し実行
		const intervalId = setInterval(fireEvent, delayMs);
		activeScriptTimers.set(eventName, { id: intervalId, type: "interval" });
	} else {
		// 1以上: 一回のみ実行
		const timeoutId = setTimeout(async () => {
			activeScriptTimers.delete(eventName);
			await fireEvent();
		}, delayMs);
		activeScriptTimers.set(eventName, { id: timeoutId, type: "timeout" });
	}
}

/**
 * \![timerraiseother,時間,繰り返すか否か,ゴースト名,イベント名,r0,r1,...]
 * [bang-timerraiseother-r0-r1-r2.md], [bang-timernotifyother-r0-r1-r2.md]
 * @param {import('../../sakura-command-handler.js').SakuraCommandHandler} handler
 * @param {string[]} args
 */
export async function handleTimerRaiseOtherCommand(handler, args) {
	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const ghostName = args[3];
	const eventName = args[4];
	const references = args.slice(5);

	if (!ghostName || !eventName) return;
	const timerKey = `other:${ghostName}:${eventName}`;

	if (activeScriptTimers.has(timerKey)) {
		const existing = activeScriptTimers.get(timerKey);
		if (existing.type === "interval") {
			clearInterval(existing.id);
		} else {
			clearTimeout(existing.id);
		}
		activeScriptTimers.delete(timerKey);
	}

	if (delayMs <= 0) return;

	const isNotify = (args[0] ?? "").toLowerCase().includes("notify");
	const fireEvent = async () => {
		try {
			const gc = handler.app.ghostController;
			if (isNotify) {
				if (gc?.sendNotifyOther) {
					await gc.sendNotifyOther(ghostName, eventName, references);
				} else if (gc?.sendShioriNotify) {
					await gc.sendShioriNotify("OnNotifyOther", [
						ghostName,
						eventName,
						...references,
					]);
				}
			} else {
				if (gc?.sendRaiseOther) {
					await gc.sendRaiseOther(ghostName, eventName, references);
				} else if (gc?.sendShioriEvent) {
					await gc.sendShioriEvent("OnRaiseOther", [
						ghostName,
						eventName,
						...references,
					]);
				}
			}
		} catch (e) {
			console.warn(`timer raise other failed (${ghostName}:${eventName}):`, e);
		}
	};

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
