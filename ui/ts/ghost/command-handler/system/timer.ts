/**
 * @file timer.ts
 * @brief スクリプトタイマー管理・Notify/TimerRaise コマンドハンドラ
 */

const activeScriptTimers = new Map<
	string,
	{ id: any; type: "interval" | "timeout" }
>();

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

export async function handleNotifyCommand(handler: any, args: string[]) {
	const eventName = args[1];
	if (!eventName) return;
	const references = args.slice(2);
	try {
		if (handler.app.ghostController?.sendShioriNotify) {
			await handler.app.ghostController.sendShioriNotify(eventName, references);
		} else if (handler.app.ghostController?.sendShioriEvent) {
			await handler.app.ghostController.sendShioriEvent(eventName, references);
		}
	} catch (err) {
		console.warn(`Notify event failed (${eventName}):`, err);
	}
}

export async function handleTimerRaiseCommand(handler: any, args: string[]) {
	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const eventName = args[3];
	const references = args.slice(4);

	if (!eventName) return;

	const timerKey = `raise:${eventName}`;
	if (activeScriptTimers.has(timerKey)) {
		const existing = activeScriptTimers.get(timerKey)!;
		if (existing.type === "interval") {
			clearInterval(existing.id);
		} else {
			clearTimeout(existing.id);
		}
		activeScriptTimers.delete(timerKey);
	}

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

export async function handleTimerNotifyCommand(handler: any, args: string[]) {
	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const eventName = args[3];
	const references = args.slice(4);

	if (!eventName) return;

	const timerKey = `notify:${eventName}`;
	if (activeScriptTimers.has(timerKey)) {
		const existing = activeScriptTimers.get(timerKey)!;
		if (existing.type === "interval") {
			clearInterval(existing.id);
		} else {
			clearTimeout(existing.id);
		}
		activeScriptTimers.delete(timerKey);
	}

	if (delayMs <= 0) {
		return;
	}

	const fireEvent = async () => {
		try {
			if (handler.app.ghostController?.sendShioriNotify) {
				await handler.app.ghostController.sendShioriNotify(
					eventName,
					references,
				);
			} else if (handler.app.ghostController?.sendShioriEvent) {
				await handler.app.ghostController.sendShioriEvent(
					eventName,
					references,
				);
			}
		} catch (e) {
			console.warn(`timernotify event failed (${eventName}):`, e);
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

export async function handleTimerRaiseOtherCommand(
	handler: any,
	args: string[],
) {
	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const ghostName = args[3];
	const eventName = args[4];
	const references = args.slice(5);

	if (!ghostName || !eventName) return;
	const isNotify = (args[0] ?? "").toLowerCase().includes("notify");
	const timerKey = `other:${isNotify ? "notify" : "raise"}:${ghostName}:${eventName}`;

	if (activeScriptTimers.has(timerKey)) {
		const existing = activeScriptTimers.get(timerKey)!;
		if (existing.type === "interval") {
			clearInterval(existing.id);
		} else {
			clearTimeout(existing.id);
		}
		activeScriptTimers.delete(timerKey);
	}

	if (delayMs <= 0) return;

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

export async function handleTimerPluginCommand(handler: any, args: string[]) {
	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const pluginId = args[3];
	const eventName = args[4];
	const references = args.slice(5);

	if (!pluginId || !eventName) return;
	const rawCmd = (args[0] ?? "").toLowerCase();
	const isNotify = rawCmd.includes("notify");
	const timerKey = `plugin:${isNotify ? "notify" : "raise"}:${pluginId}:${eventName}`;

	if (activeScriptTimers.has(timerKey)) {
		const existing = activeScriptTimers.get(timerKey)!;
		if (existing.type === "interval") {
			clearInterval(existing.id);
		} else {
			clearTimeout(existing.id);
		}
		activeScriptTimers.delete(timerKey);
	}

	if (delayMs <= 0) return;

	const fireEvent = async () => {
		try {
			const gc = handler.app?.ghostController;
			if (gc?.sendPluginEvent) {
				await gc.sendPluginEvent(pluginId, eventName, references, isNotify);
			} else {
				const { invoke, isTauriAvailable } = await import(
					"../../../core/tauri-helper.js"
				);
				if (isTauriAvailable()) {
					await invoke("execute_plugin_event", {
						request: {
							pluginName: pluginId,
							eventId: eventName,
							references,
							isNotify,
						},
					});
				}
			}
		} catch (e) {
			console.warn(`timer plugin event failed (${pluginId}:${eventName}):`, e);
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

export function getActiveScriptTimersCount(): number {
	return activeScriptTimers.size;
}
