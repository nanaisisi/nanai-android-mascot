/**
 * @file shiori-notify/system.ts
 * @brief システム状態(サスペンド・ベースウェア更新・キャッシュ等)通知
 */

import type { LifecycleContext } from "./ghost-lifecycle/lifecycle-events.js";

export const shioriNotifySystem = {
	async sendSysSuspend(this: LifecycleContext) {
		return await this.sendShioriNotify("OnSysSuspend", []);
	},

	async sendSysResume(this: LifecycleContext) {
		return await this.sendShioriNotify("OnSysResume", []);
	},

	async sendDestroy(this: LifecycleContext) {
		return await this.sendShioriNotify("OnDestroy", []);
	},

	async sendInitialize(this: LifecycleContext) {
		return await this.sendShioriNotify("OnInitialize", []);
	},

	async sendVirtualDesktopChanged(
		this: LifecycleContext,
		desktopId: string | number,
	) {
		return await this.sendShioriNotify("OnVirtualDesktopChanged", [
			String(desktopId),
		]);
	},

	async sendFullScreenAppMinimize(this: LifecycleContext) {
		return await this.sendShioriNotify("OnFullScreenAppMinimize", []);
	},

	async sendFullScreenAppRestore(this: LifecycleContext) {
		return await this.sendShioriNotify("OnFullScreenAppRestore", []);
	},

	async sendBasewareUpdating(this: LifecycleContext) {
		return await this.sendShioriNotify("OnBasewareUpdating", []);
	},

	async sendBasewareUpdated(this: LifecycleContext) {
		return await this.sendShioriNotify("OnBasewareUpdated", []);
	},

	async sendCacheSuspend(this: LifecycleContext) {
		return await this.sendShioriNotify("OnCacheSuspend", []);
	},

	async sendCacheRestore(this: LifecycleContext) {
		return await this.sendShioriNotify("OnCacheRestore", []);
	},
};
