/**
 * @file shiori-notify/ghost-lifecycle/ghost-calls.ts
 * @brief ゴースト間呼び出し・他ゴースト状態通知
 */

export const shioriNotifyGhostCalls = {
	async sendGhostCalling(this: any, targetGhost: string) {
		return await this.sendShioriNotify("OnGhostCalling", [targetGhost]);
	},

	async sendGhostCalled(this: any, callerGhost: string) {
		return await this.sendShioriNotify("OnGhostCalled", [callerGhost]);
	},

	async sendGhostCallComplete(this: any, targetGhost: string) {
		return await this.sendShioriNotify("OnGhostCallComplete", [targetGhost]);
	},

	async sendOtherGhostBooted(this: any, ghostName: string) {
		return await this.sendShioriNotify("OnOtherGhostBooted", [ghostName]);
	},

	async sendOtherGhostChanged(
		this: any,
		ghostName: string,
		toGhost: string = "",
	) {
		return await this.sendShioriNotify("OnOtherGhostChanged", [
			ghostName,
			toGhost,
		]);
	},

	async sendOtherGhostClosed(this: any, ghostName: string) {
		return await this.sendShioriNotify("OnOtherGhostClosed", [ghostName]);
	},
};
