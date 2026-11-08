/**
 * @file shiori-notify/ghost-lifecycle/terms.ts
 * @brief 利用規約ダイアログ関連通知
 */

export const shioriNotifyTerms = {

	/**
	 * 利用規約・ダイアログ通知 (UKADOC dialogbox)
	 */
	async notifyTermsDialogEvent(
		this: unknown,
		event: "OnGhostTermsAccept" | "OnGhostTermsDecline" | string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 利用条件受諾通知 (OnGhostTermsAccept) を送信 (UKADOC 規格準拠)
	 */
	async sendGhostTermsAcceptNotify(this: unknown, id: string = "") {
		return await this.sendShioriNotify("OnGhostTermsAccept", id ? [id] : []);
	},

	/**
	 * 利用条件拒否通知 (OnGhostTermsDecline) を送信 (UKADOC 規格準拠)
	 */
	async sendGhostTermsDeclineNotify(this: unknown, id: string = "") {
		return await this.sendShioriNotify("OnGhostTermsDecline", id ? [id] : []);
	},

	/**
	 * ダイアログ関連 SHIORI イベント通知 (UKADOC dialogbox spec)
	 */
	async sendGhostTermsAccept(this: unknown, ghostName: string) {
		return await this.sendShioriNotify("OnGhostTermsAccept", [ghostName]);
	},

	async sendGhostTermsDecline(this: unknown, ghostName: string) {
		return await this.sendShioriNotify("OnGhostTermsDecline", [ghostName]);
	},
};
