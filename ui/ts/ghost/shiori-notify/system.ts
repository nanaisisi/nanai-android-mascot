/**
 * @file shiori-notify/system.ts
 * @brief システム状態(サスペンド・ベースウェア更新・キャッシュ等)通知
 */

export const shioriNotifySystem = {
	async sendSysSuspend(this: any) {
		return await this.sendShioriNotify("OnSysSuspend", []);
	},

	async sendSysResume(this: any) {
		return await this.sendShioriNotify("OnSysResume", []);
	},

	async sendDestroy(this: any) {
		return await this.sendShioriNotify("OnDestroy", []);
	},

	async sendInitialize(this: any) {
		return await this.sendShioriNotify("OnInitialize", []);
	},

	async sendVirtualDesktopChanged(this: any, desktopId: string | number) {
		return await this.sendShioriNotify("OnVirtualDesktopChanged", [
			String(desktopId),
		]);
	},

	async sendFullScreenAppMinimize(this: any) {
		return await this.sendShioriNotify("OnFullScreenAppMinimize", []);
	},

	async sendFullScreenAppRestore(this: any) {
		return await this.sendShioriNotify("OnFullScreenAppRestore", []);
	},

	async sendBasewareUpdating(this: any) {
		return await this.sendShioriNotify("OnBasewareUpdating", []);
	},

	async sendBasewareUpdated(this: any) {
		return await this.sendShioriNotify("OnBasewareUpdated", []);
	},

	async sendCacheSuspend(this: any) {
		return await this.sendShioriNotify("OnCacheSuspend", []);
	},

	async sendCacheRestore(this: any) {
		return await this.sendShioriNotify("OnCacheRestore", []);
	},
};
