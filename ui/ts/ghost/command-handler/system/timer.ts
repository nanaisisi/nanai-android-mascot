/**
 * @file timer.ts
 * @brief スクリプトタイマー管理・Notify/TimerRaise コマンドハンドラ
 */

const activeScriptTimers = new Map<
	string,

	{ id: unknown; type: "interval" | "timeout" }

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	{ id: any; type: "interval" | "timeout" }

>();

export function clearAllScriptTimers() {
	for (const timer of activeScriptTimers.values()) {
		if (timer.type === "interval") {
			clearInterval(timer.id as NodeJS.Timeout);
		} else {
			clearTimeout(timer.id as NodeJS.Timeout);
		}
	}
	activeScriptTimers.clear();
}


export async function handleNotifyCommand(_handler: unknown, _args: string[]) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleNotifyCommand(handler: any, args: string[]) {

	const eventName = args[1];
	if (!eventName) return;
	const references = args.slice(2);
	const h = handler as { app?: { ghostController?: Record<string, unknown> } };
	try {
		const gc = h.app?.ghostController;
		if (gc?.sendShioriNotify && typeof gc.sendShioriNotify === "function") {
			await gc.sendShioriNotify(eventName, references);
		} else if (
			gc?.sendShioriEvent &&
			typeof gc.sendShioriEvent === "function"
		) {
			await gc.sendShioriEvent(eventName, references);
		}
	} catch (err) {
		console.warn(`Notify event failed (${eventName}):`, err);
	}
}


export async function _handleTimerRaiseCommand(
	_handler: unknown,
	_args: string[],
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleTimerRaiseCommand(handler: any, args: string[]) {

	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const eventName = args[3];
	const references = args.slice(4);

	if (!eventName) return;

	const timerKey = `raise:${eventName}`;

	const existing = activeScriptTimers.get(timerKey);
	if (existing) {

	if (activeScriptTimers.has(timerKey)) {
		// biome-ignore lint/style/noNonNullAssertion: automated fix
		const existing = activeScriptTimers.get(timerKey)!;

		if (existing.type === "interval") {
			clearInterval(existing.id as NodeJS.Timeout);
		} else {
			clearTimeout(existing.id as NodeJS.Timeout);
		}
		activeScriptTimers.delete(timerKey);
	}

	if (delayMs <= 0) {
		return;
	}

	const h = handler as { app?: { ghostController?: Record<string, unknown> } };
	const fireEvent = async () => {
		try {
			const gc = h.app?.ghostController;
			if (gc?.sendShioriEvent && typeof gc.sendShioriEvent === "function") {
				await gc.sendShioriEvent(eventName, references);
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


export async function _handleTimerNotifyCommand(
	_handler: unknown,
	_args: string[],
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleTimerNotifyCommand(handler: any, args: string[]) {

	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const eventName = args[3];
	const references = args.slice(4);

	if (!eventName) return;

	const timerKey = `notify:${eventName}`;

	const existing = activeScriptTimers.get(timerKey);
	if (existing) {

	if (activeScriptTimers.has(timerKey)) {
		// biome-ignore lint/style/noNonNullAssertion: automated fix
		const existing = activeScriptTimers.get(timerKey)!;

		if (existing.type === "interval") {
			clearInterval(existing.id as NodeJS.Timeout);
		} else {
			clearTimeout(existing.id as NodeJS.Timeout);
		}
		activeScriptTimers.delete(timerKey);
	}

	if (delayMs <= 0) {
		return;
	}

	const h = handler as { app?: { ghostController?: Record<string, unknown> } };
	const fireEvent = async () => {
		try {
			const gc = h.app?.ghostController;
			if (gc?.sendShioriNotify && typeof gc.sendShioriNotify === "function") {
				await gc.sendShioriNotify(eventName, references);
			} else if (
				gc?.sendShioriEvent &&
				typeof gc.sendShioriEvent === "function"
			) {
				await gc.sendShioriEvent(eventName, references);
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

export async function _handleTimerRaiseOtherCommand(

	_handler: unknown,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
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


	const existing = activeScriptTimers.get(timerKey);
	if (existing) {

	if (activeScriptTimers.has(timerKey)) {
		// biome-ignore lint/style/noNonNullAssertion: automated fix
		const existing = activeScriptTimers.get(timerKey)!;

		if (existing.type === "interval") {
			clearInterval(existing.id as NodeJS.Timeout);
		} else {
			clearTimeout(existing.id as NodeJS.Timeout);
		}
		activeScriptTimers.delete(timerKey);
	}

	if (delayMs <= 0) return;

	const h = handler as { app?: { ghostController?: Record<string, unknown> } };
	const fireEvent = async () => {
		try {
			const gc = h.app?.ghostController as Record<string, unknown> | undefined;
			if (isNotify) {
				if (gc?.sendNotifyOther && typeof gc.sendNotifyOther === "function") {
					await (
						gc.sendNotifyOther as (...args: unknown[]) => Promise<unknown>
					)(ghostName, eventName, references);
				} else if (
					gc?.sendShioriNotify &&
					typeof gc.sendShioriNotify === "function"
				) {
					await gc.sendShioriNotify("OnNotifyOther", [
						ghostName,
						eventName,
						...references,
					]);
				}
			} else {
				if (gc?.sendRaiseOther && typeof gc.sendRaiseOther === "function") {
					await (gc.sendRaiseOther as (...args: unknown[]) => Promise<unknown>)(
						ghostName,
						eventName,
						references,
					);
				} else if (
					gc?.sendShioriEvent &&
					typeof gc.sendShioriEvent === "function"
				) {
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


export async function _handleTimerPluginCommand(
	_handler: unknown,
	_args: string[],
) {

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handleTimerPluginCommand(handler: any, args: string[]) {

	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const pluginId = args[3];
	const eventName = args[4];
	const references = args.slice(5);

	if (!pluginId || !eventName) return;
	const rawCmd = (args[0] ?? "").toLowerCase();
	const isNotify = rawCmd.includes("notify");
	const timerKey = `plugin:${isNotify ? "notify" : "raise"}:${pluginId}:${eventName}`;


	const existing = activeScriptTimers.get(timerKey);
	if (existing) {

	if (activeScriptTimers.has(timerKey)) {
		// biome-ignore lint/style/noNonNullAssertion: automated fix
		const existing = activeScriptTimers.get(timerKey)!;

		if (existing.type === "interval") {
			clearInterval(existing.id as NodeJS.Timeout);
		} else {
			clearTimeout(existing.id as NodeJS.Timeout);
		}
		activeScriptTimers.delete(timerKey);
	}

	if (delayMs <= 0) return;

	const h = handler as { app?: { ghostController?: Record<string, unknown> } };
	const fireEvent = async () => {
		try {
			const gc = h.app?.ghostController as Record<string, unknown> | undefined;
			if (gc?.sendPluginEvent && typeof gc.sendPluginEvent === "function") {
				await (gc.sendPluginEvent as (...args: unknown[]) => Promise<unknown>)(
					pluginId,
					eventName,
					references,
					isNotify,
				);
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

export function _getActiveScriptTimersCount(): number {
	return activeScriptTimers.size;
}
