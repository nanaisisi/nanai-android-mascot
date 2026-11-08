/**
 * @file plugin.ts
 * @brief プラグインイベントコマンド (\![raiseplugin,...], \![notifyplugin,...], etc.)
 */

import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

<<<<<<< HEAD
export async function handlePluginEvent(_handler: unknown, _args: string[]) {
=======
// biome-ignore lint/suspicious/noExplicitAny: automated fix
export async function _handlePluginEvent(_handler: any, args: string[]) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
