/**
 * @file system/timer/raise.ts
 * @brief 自ゴースト宛の Notify / TimerRaise / TimerNotify コマンドハンドラ
 */

import { cancelScriptTimer, scheduleScriptTimer } from "./registry.js";

export async function handleNotifyCommand(
	handler: import("../../../sakura-command-handler.js").SakuraCommandHandler,
	args: string[],
) {
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
	handler: import("../../../sakura-command-handler.js").SakuraCommandHandler,
	args: string[],
) {
	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const eventName = args[3];
	const references = args.slice(4);

	if (!eventName) return;

	const timerKey = `raise:${eventName}`;
	cancelScriptTimer(timerKey);

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

	scheduleScriptTimer(timerKey, delayMs, repeatFlag, fireEvent);
}

export async function handleTimerNotifyCommand(
	handler: import("../../../sakura-command-handler.js").SakuraCommandHandler,
	args: string[],
) {
	const delayMs = Number.parseInt(args[1] ?? "0", 10);
	const repeatFlag = Number.parseInt(args[2] ?? "1", 10);
	const eventName = args[3];
	const references = args.slice(4);

	if (!eventName) return;

	const timerKey = `notify:${eventName}`;
	cancelScriptTimer(timerKey);

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

	scheduleScriptTimer(timerKey, delayMs, repeatFlag, fireEvent);
}
