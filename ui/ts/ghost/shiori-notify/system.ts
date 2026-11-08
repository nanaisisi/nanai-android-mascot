/**
 * @file shiori-notify/system.ts
 * @brief システム状態(サスペンド・ベースウェア更新・キャッシュ等)通知
 */

export const shioriNotifySystem = {

	async sendSysSuspend(this: unknown) {
		return await this.sendShioriNotify("OnSysSuspend", []);
	},

	async sendSysResume(this: unknown) {
		return await this.sendShioriNotify("OnSysResume", []);
	},

	async sendDestroy(this: unknown) {
		return await this.sendShioriNotify("OnDestroy", []);
	},

	async sendInitialize(this: unknown) {
		return await this.sendShioriNotify("OnInitialize", []);
	},

	async sendVirtualDesktopChanged(this: unknown, desktopId: string | number) {
		return await this.sendShioriNotify("OnVirtualDesktopChanged", [
			String(desktopId),
		]);
	},

	async sendFullScreenAppMinimize(this: unknown) {
		return await this.sendShioriNotify("OnFullScreenAppMinimize", []);
	},

	async sendFullScreenAppRestore(this: unknown) {
		return await this.sendShioriNotify("OnFullScreenAppRestore", []);
	},

	async sendBasewareUpdating(this: unknown) {
		return await this.sendShioriNotify("OnBasewareUpdating", []);
	},

	async sendBasewareUpdated(this: unknown) {
		return await this.sendShioriNotify("OnBasewareUpdated", []);
	},

	async sendCacheSuspend(this: unknown) {
		return await this.sendShioriNotify("OnCacheSuspend", []);
	},

	async sendCacheRestore(this: unknown) {
		return await this.sendShioriNotify("OnCacheRestore", []);
	},
};
