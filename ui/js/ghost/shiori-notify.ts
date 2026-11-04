/**
 * @file shiori-notify.ts
 * @brief UKADOC notify イベント群 (SHIORI/3.0 NOTIFY コマンド)
 */

import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

export const shioriNotifyMethods = {
	async sendShioriNotify(this: any, event: string, references: Array<string | number>) {
		if (!isTauriAvailable()) return null;
		const ghostId = this.app.ghostId || "main";
		try {
			return await invoke("send_shiori_notify", {
				event,
				references: references.map(String),
				ghostId,
			});
		} catch (error) {
			console.warn(`SHIORI 通知失敗 (${event}):`, error);
			return null;
		}
	},

	async notifyOSInfo(this: any, osName = "Android", osVersion = "14") {
		return await this.sendShioriNotify("OnNotifyOSInfo", [osName, osVersion]);
	},

	async notifySelfInfo(this: any, ghostName: string, shellName?: string) {
		return await this.sendShioriNotify("OnNotifySelfInfo", [ghostName, shellName || "master"]);
	},
};
