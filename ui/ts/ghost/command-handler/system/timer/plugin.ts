/**
 * @file system/timer/plugin.ts
 * @brief プラグイン宛の TimerPlugin コマンドハンドラ
 */

import { cancelScriptTimer, scheduleScriptTimer } from "./registry.js";

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

	cancelScriptTimer(timerKey);

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
					"../../../../core/tauri-helper.js"
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

	scheduleScriptTimer(timerKey, delayMs, repeatFlag, fireEvent);
}