/**
 * @file plugin.ts
 * @brief プラグインイベントコマンド (\![raiseplugin,...], \![notifyplugin,...], etc.)
 */

import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

export async function handlePluginEvent(
	handler: import("../sakura-command-handler.js").SakuraCommandHandler,
	args: string[],
) {
	const rawCmd = (args[0] ?? "").toLowerCase();
	const isTimer = rawCmd.startsWith("timer");
	const isNotify = rawCmd.includes("notify");
	const failureEventName = isNotify
		? "OnNotifyPluginFailure"
		: "OnRaisePluginFailure";
	const pluginName = isTimer ? args[3] : args[1];
	const eventId = isTimer ? args[4] : args[2];
	const references = isTimer ? args.slice(5) : args.slice(3);

	if (!pluginName || !eventId) {
		if (handler.app?.ghostController?.sendShioriEvent) {
			void handler.app.ghostController.sendShioriEvent(failureEventName, [
				"notfound",
				pluginName || "",
				eventId || "",
				...references,
			]);
		}
		return;
	}

	if (isTauriAvailable()) {
		try {
			const res = await invoke<{ status?: number | string; success?: boolean }>(
				"execute_plugin_event",
				{
					request: {
						pluginName,
						eventId,
						references,
					},
				},
			).catch(() => null);

			if (!res && handler.app?.ghostController?.sendShioriEvent) {
				void handler.app.ghostController.sendShioriEvent(failureEventName, [
					"notfound",
					pluginName,
					eventId,
					...references,
				]);
			} else if (
				res?.status === 204 &&
				handler.app?.ghostController?.sendShioriEvent
			) {
				void handler.app.ghostController.sendShioriEvent(failureEventName, [
					"204",
					pluginName,
					eventId,
					...references,
				]);
			}
		} catch (err) {
			console.warn(`Plugin event execution failed (${pluginName}):`, err);
			if (handler.app?.ghostController?.sendShioriEvent) {
				void handler.app.ghostController.sendShioriEvent(failureEventName, [
					"disabled",
					pluginName,
					eventId,
					...references,
				]);
			}
		}
	} else if (handler.app?.ghostController?.sendShioriEvent) {
		// 非Tauri環境におけるプラグイン非存在フォールバック
		void handler.app.ghostController.sendShioriEvent(failureEventName, [
			"notfound",
			pluginName,
			eventId,
			...references,
		]);
	}
}
