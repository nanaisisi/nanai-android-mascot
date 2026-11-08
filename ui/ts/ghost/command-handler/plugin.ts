/**
 * @file plugin.ts
 * @brief プラグインイベントコマンド (\![raiseplugin,...], \![notifyplugin,...], etc.)
 */

import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function handlePluginEvent(_handler: any, args: string[]) {
	const rawCmd = (args[0] ?? "").toLowerCase();
	const isTimer = rawCmd.startsWith("timer");
	const pluginName = isTimer ? args[3] : args[1];
	const eventId = isTimer ? args[4] : args[2];
	const references = isTimer ? args.slice(5) : args.slice(3);
	if (pluginName && eventId && isTauriAvailable()) {
		try {
			await invoke("execute_plugin_event", {
				request: {
					pluginName,
					eventId,
					references,
				},
			});
		} catch (err) {
			console.warn(`Plugin event execution failed (${pluginName}):`, err);
		}
	}
}
