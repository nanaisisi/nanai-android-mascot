/**
 * @file shiori-notify/core.ts
 * @brief SHIORI NOTIFY 送信の共通ヘルパー
 */

import { invoke, isTauriAvailable } from "../../core/tauri-helper.js";

export const shioriNotifyCore = {
	/**
	 * NOTIFY コマンドで SHIORI イベントを送信
	 * @this {unknown}
	 * @param {string} event イベントID (例: "installedghostname")
	 * @param {Array<string|number>} references Reference0..N
	 */
	async sendShioriNotify(
		this: any,
		event: string,
		references: Array<string | number>,
	) {
		if (!isTauriAvailable()) return null;
		const ghostId = this.app?.ghostId || "main";
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
};
