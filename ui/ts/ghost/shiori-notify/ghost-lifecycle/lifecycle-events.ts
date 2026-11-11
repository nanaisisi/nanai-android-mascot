/**
 * @file shiori-notify/ghost-lifecycle/lifecycle-events.ts
 * @brief ゴーストのライフサイクル・切替・終了通知
 */

export const shioriNotifyLifecycleEvents = {
	/**
	 * ゴースト・シェル切替およびライフサイクル通知 (UKADOC boot-close-change)
	 */
	async notifyGhostLifecycle(
		this: any,
		event:
			| "OnGhostChanging"
			| "OnGhostChanged"
			| "OnGhostCalling"
			| "OnGhostCalled"
			| "OnGhostCallComplete"
			| "OnOtherGhostBooted"
			| "OnOtherGhostChanged"
			| "OnOtherGhostClosed"
			| "OnShellChanging"
			| "OnShellChanged"
			| "OnCloseAll"
			| "OnInitialize"
			| "OnDestroy"
			| "OnSysSuspend"
			| "OnSysResume"
			| "OnVirtualDesktopChanged"
			| "OnBasewareUpdating"
			| "OnBasewareUpdated"
			| "OnCacheSuspend"
			| "OnCacheRestore"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 消滅・アンインストール通知 (UKADOC vanish)
	 */
	async notifyVanishEvent(
		this: any,
		event:
			| "OnVanished"
			| "OnVanishSelecting"
			| "OnVanishSelected"
			| "OnVanishCancel"
			| "OnVanishButtonHold"
			| "OnOtherGhostVanished"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * ゴースト切替・シェル切替・システムライフサイクル通知 (UKADOC boot-close-change spec)
	 */
	async sendGhostChanging(
		this: any,
		toGhost: string,
		fromGhost: string = "",
		reason: string = "manual",
	) {
		return await this.sendShioriNotify("OnGhostChanging", [
			toGhost,
			reason,
			fromGhost,
		]);
	},

	async sendGhostChanged(this: any, toGhost: string, fromGhost: string = "") {
		return await this.sendShioriNotify("OnGhostChanged", [toGhost, fromGhost]);
	},

	async sendShellChanged(this: any, toShell: string, fromShell: string = "") {
		return await this.sendShioriNotify("OnShellChanged", [toShell, fromShell]);
	},

	async sendCloseAll(this: any, reason: string = "user") {
		return await this.sendShioriNotify("OnCloseAll", [reason]);
	},
};
