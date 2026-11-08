/**
 * @file shiori-notify/ghost-lifecycle/ghost-calls.ts
 * @brief ゴースト間呼び出し・他ゴースト状態通知
 */

export const shioriNotifyGhostCalls = {
	async sendGhostCalling(this: unknown, targetGhost: string) {
		return await this.sendShioriNotify("OnGhostCalling", [targetGhost]);
	},

	async sendGhostCalled(this: unknown, callerGhost: string) {
		return await this.sendShioriNotify("OnGhostCalled", [callerGhost]);
	},

	async sendGhostCallComplete(this: unknown, targetGhost: string) {
		return await this.sendShioriNotify("OnGhostCallComplete", [targetGhost]);
	},

	async sendOtherGhostBooted(this: unknown, ghostName: string) {
		return await this.sendShioriNotify("OnOtherGhostBooted", [ghostName]);
	},

	async sendOtherGhostChanged(
		this: unknown,
		ghostName: string,
		toGhost: string = "",
	) {
		return await this.sendShioriNotify("OnOtherGhostChanged", [
			ghostName,
			toGhost,
		]);
	},

	async sendOtherGhostClosed(this: unknown, ghostName: string) {
		return await this.sendShioriNotify("OnOtherGhostClosed", [ghostName]);
	},
};
