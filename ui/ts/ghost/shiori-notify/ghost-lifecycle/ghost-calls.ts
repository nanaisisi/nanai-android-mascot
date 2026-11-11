/**
 * @file shiori-notify/ghost-lifecycle/ghost-calls.ts
 * @brief ゴースト間呼び出し・他ゴースト状態通知
 */

export interface GhostCallsContext {
	sendShioriNotify: (event: string, refs?: unknown[]) => Promise<unknown>;
	[key: string]: unknown;
}

export const shioriNotifyGhostCalls = {
	async sendGhostCalling(this: GhostCallsContext, targetGhost: string) {
		return await this.sendShioriNotify("OnGhostCalling", [targetGhost]);
	},

	async sendGhostCalled(this: GhostCallsContext, callerGhost: string) {
		return await this.sendShioriNotify("OnGhostCalled", [callerGhost]);
	},

	async sendGhostCallComplete(this: GhostCallsContext, targetGhost: string) {
		return await this.sendShioriNotify("OnGhostCallComplete", [targetGhost]);
	},

	async sendOtherGhostBooted(this: GhostCallsContext, ghostName: string) {
		return await this.sendShioriNotify("OnOtherGhostBooted", [ghostName]);
	},

	async sendOtherGhostChanged(
		this: GhostCallsContext,
		ghostName: string,
		toGhost: string = "",
	) {
		return await this.sendShioriNotify("OnOtherGhostChanged", [
			ghostName,
			toGhost,
		]);
	},

	async sendOtherGhostClosed(this: GhostCallsContext, ghostName: string) {
		return await this.sendShioriNotify("OnOtherGhostClosed", [ghostName]);
	},
};
