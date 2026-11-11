/**
 * @file system/timer/other.ts
 * @brief 他ゴースト宛の TimerRaiseOther / TimerNotifyOther コマンドハンドラ
 */

import { cancelScriptTimer, scheduleScriptTimer } from "./registry.js";

export async function handleTimerRaiseOtherCommand(
	handler: import("../../../sakura-command-handler.js").SakuraCommandHandler,
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

	cancelScriptTimer(timerKey);

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

	scheduleScriptTimer(timerKey, delayMs, repeatFlag, fireEvent);
}
