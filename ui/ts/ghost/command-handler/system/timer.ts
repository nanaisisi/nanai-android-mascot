/**
 * @file timer.ts
 * @brief スクリプトタイマー管理・Notify/TimerRaise コマンドハンドラ
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

export async function handleNotifyCommand(handler: unknown, args: string[]) {
	const eventName = args[1];
	if (!eventName) return;
	const references = args.slice(2);
	try {
		const h = handler as Record<string, unknown>;
		const app = h.app as Record<string, unknown> | undefined;
		const gc = app?.ghostController as Record<string, unknown> | undefined;
		const sendNotify = gc?.sendShioriNotify as
			| ((event: string, refs: string[]) => Promise<unknown>)
			| undefined;
		const sendEvent = gc?.sendShioriEvent as
			| ((event: string, refs: string[]) => Promise<unknown>)
			| undefined;
		if (sendNotify) {
			await sendNotify(eventName, references);
		} else if (sendEvent) {
			await sendEvent(eventName, references);
		}
	} catch (err) {
		console.warn(`Notify event failed (${eventName}):`, err);
	}
}

export async function handleTimerRaiseCommand(
	handler: unknown,
	args: string[],
) {
	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const eventName = args[3];
	const references = args.slice(4);

	if (!eventName) return;

	const timerKey = `raise:${eventName}`;
	if (activeScriptTimers.has(timerKey)) {
		const existing = activeScriptTimers.get(timerKey);
		if (existing) {
			if (existing.type === "interval") {
				clearInterval(existing.id as number);
			} else {
				clearTimeout(existing.id as number);
			}
			activeScriptTimers.delete(timerKey);
		}
	}

	if (delayMs <= 0) {
		return;
	}

	const fireEvent = async () => {
		try {
			const h = handler as Record<string, unknown>;
			const app = h.app as Record<string, unknown> | undefined;
			const gc = app?.ghostController as Record<string, unknown> | undefined;
			const sendEvent = gc?.sendShioriEvent as
				| ((event: string, refs: string[]) => Promise<unknown>)
				| undefined;
			if (sendEvent) {
				await sendEvent(eventName, references);
			}
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

export async function handleTimerNotifyCommand(
	handler: unknown,
	args: string[],
) {
	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const eventName = args[3];
	const references = args.slice(4);

	if (!eventName) return;

	const timerKey = `notify:${eventName}`;
	if (activeScriptTimers.has(timerKey)) {
		const existing = activeScriptTimers.get(timerKey);
		if (existing) {
			if (existing.type === "interval") {
				clearInterval(existing.id as number);
			} else {
				clearTimeout(existing.id as number);
			}
			activeScriptTimers.delete(timerKey);
		}
	}

	if (delayMs <= 0) {
		return;
	}

	const fireEvent = async () => {
		try {
			const h = handler as Record<string, unknown>;
			const app = h.app as Record<string, unknown> | undefined;
			const gc = app?.ghostController as Record<string, unknown> | undefined;
			const sendNotify = gc?.sendShioriNotify as
				| ((event: string, refs: string[]) => Promise<unknown>)
				| undefined;
			const sendEvent = gc?.sendShioriEvent as
				| ((event: string, refs: string[]) => Promise<unknown>)
				| undefined;
			if (sendNotify) {
				await sendNotify(eventName, references);
			} else if (sendEvent) {
				await sendEvent(eventName, references);
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
	handler: unknown,
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
		const existing = activeScriptTimers.get(timerKey);
		if (existing) {
			if (existing.type === "interval") {
				clearInterval(existing.id as number);
			} else {
				clearTimeout(existing.id as number);
			}
			activeScriptTimers.delete(timerKey);
		}
	}

	if (delayMs <= 0) return;

	const fireEvent = async () => {
		try {
			const h = handler as Record<string, unknown>;
			const app = h.app as Record<string, unknown> | undefined;
			const gc = app?.ghostController as Record<string, unknown> | undefined;
			if (isNotify) {
				const sendNotifyOther = gc?.sendNotifyOther as
					| ((ghost: string, event: string, refs: string[]) => Promise<unknown>)
					| undefined;
				const sendShioriNotify = gc?.sendShioriNotify as
					| ((event: string, refs: string[]) => Promise<unknown>)
					| undefined;
				if (sendNotifyOther) {
					await sendNotifyOther(ghostName, eventName, references);
				} else if (sendShioriNotify) {
					await sendShioriNotify("OnNotifyOther", [
						ghostName,
						eventName,
						...references,
					]);
				}
			} else {
				const sendRaiseOther = gc?.sendRaiseOther as
					| ((ghost: string, event: string, refs: string[]) => Promise<unknown>)
					| undefined;
				const sendShioriEvent = gc?.sendShioriEvent as
					| ((event: string, refs: string[]) => Promise<unknown>)
					| undefined;
				if (sendRaiseOther) {
					await sendRaiseOther(ghostName, eventName, references);
				} else if (sendShioriEvent) {
					await sendShioriEvent("OnRaiseOther", [
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

export async function handleTimerPluginCommand(
	handler: unknown,
	args: string[],
) {
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
		const existing = activeScriptTimers.get(timerKey);
		if (existing) {
			if (existing.type === "interval") {
				clearInterval(existing.id as number);
			} else {
				clearTimeout(existing.id as number);
			}
			activeScriptTimers.delete(timerKey);
		}
	}

	if (delayMs <= 0) return;

	const fireEvent = async () => {
		try {
			const h = handler as Record<string, unknown>;
			const app = h.app as Record<string, unknown> | undefined;
			const gc = app?.ghostController as Record<string, unknown> | undefined;
			const sendPluginEvent = gc?.sendPluginEvent as
				| ((
						plugin: string,
						event: string,
						refs: string[],
						notify: boolean,
				  ) => Promise<unknown>)
				| undefined;
			if (sendPluginEvent) {
				await sendPluginEvent(pluginId, eventName, references, isNotify);
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
