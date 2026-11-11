/**
 * @file shiori-notify/application-headline.ts
 * @brief 外部アプリ・Webサイト更新・ヘッドライン/RSS 通知
 */

import type { LifecycleContext } from "./ghost-lifecycle/lifecycle-events.js";

export const shioriNotifyApplicationHeadline = {
	/**
	 * RSS / ヘッドラインセンス通知
	 */
	async notifyHeadlineRssEvent(
		this: LifecycleContext,
		event: string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 外部アプリケーション起動通知 (OnApplicationBoot) を送信
	 */
	async notifyApplicationBoot(
		this: LifecycleContext,
		appName: string,
		appPath = "",
	) {
		return await this.sendShioriNotify("OnApplicationBoot", [appName, appPath]);
	},

	/**
	 * 外部アプリケーション終了通知 (OnApplicationClose) を送信
	 */
	async notifyApplicationClose(this: LifecycleContext, appName: string) {
		return await this.sendShioriNotify("OnApplicationClose", [appName]);
	},

	/**
	 * 外部アプリケーション存在確認 (OnApplicationExist) を送信
	 */
	async checkApplicationExist(
		this: LifecycleContext,
		appName: string,
	): Promise<boolean> {
		const res: unknown = await this.sendShioriNotify("OnApplicationExist", [
			appName,
		]);
		return res === "1" || res === "true";
	},

	/**
	 * 外部アプリケーションファイルオープン通知 (OnApplicationFileOpen) を送信
	 */
	async notifyApplicationFileOpen(
		this: LifecycleContext,
		appName: string,
		filePath = "",
	) {
		return await this.sendShioriNotify("OnApplicationFileOpen", [
			appName,
			filePath,
		]);
	},

	/**
	 * 外部アプリケーション操作完了通知 (OnApplicationOperationFinish) を送信
	 */
	async notifyApplicationOperationFinish(
		this: LifecycleContext,
		appName: string,
		operationName = "",
	) {
		return await this.sendShioriNotify("OnApplicationOperationFinish", [
			appName,
			operationName,
		]);
	},

	/**
	 * 外部アプリケーションバージョン通知 (OnApplicationVersion) を送信
	 */
	async notifyApplicationVersion(
		this: LifecycleContext,
		appName: string,
		version = "",
	) {
		return await this.sendShioriNotify("OnApplicationVersion", [
			appName,
			version,
		]);
	},

	/**
	 * Webサイト更新通知 (OnWebsiteUpdateNotify) を送信
	 */
	async notifyWebsiteUpdate(
		this: LifecycleContext,
		url: string,
		updateTime = "",
	) {
		return await this.sendShioriNotify("OnWebsiteUpdateNotify", [
			url,
			updateTime,
		]);
	},

	/**
	 * ヘッドラインセンス開始通知 (OnHeadlinesenseBegin)
	 */
	async sendHeadlineSenseBegin(
		this: LifecycleContext,
		siteName: string,
		url: string,
	) {
		return await this.sendShioriNotify("OnHeadlinesenseBegin", [siteName, url]);
	},

	/**
	 * ヘッドライン発見通知 (OnHeadlinesense.OnFind)
	 */
	async sendHeadlineSenseOnFind(
		this: LifecycleContext,
		siteName: string,
		url: string,
		phase: string,
		content: string,
	) {
		return await this.sendShioriNotify("OnHeadlinesense.OnFind", [
			siteName,
			url,
			phase,
			content,
		]);
	},

	/**
	 * ヘッドラインセンス完了通知 (OnHeadlinesenseComplete)
	 */
	async sendHeadlineSenseComplete(
		this: LifecycleContext,
		reason = "no update",
	) {
		return await this.sendShioriNotify("OnHeadlinesenseComplete", [reason]);
	},

	/**
	 * ヘッドラインセンス失敗通知 (OnHeadlinesenseFailure)
	 */
	async sendHeadlineSenseFailure(this: LifecycleContext, reason: string) {
		return await this.sendShioriNotify("OnHeadlinesenseFailure", [reason]);
	},

	/**
	 * RSSセンス開始通知 (OnRSSBegin)
	 */
	async sendRssBegin(this: LifecycleContext, siteName: string, url: string) {
		return await this.sendShioriNotify("OnRSSBegin", [siteName, url]);
	},

	/**
	 * RSSセンス完了通知 (OnRSSComplete)
	 */
	async sendRssComplete(
		this: LifecycleContext,
		siteNameOrStatus: string,
		siteUrl = "",
		entries: string[] = [],
	) {
		if (siteNameOrStatus === "no update") {
			return await this.sendShioriNotify("OnRSSComplete", ["no update"]);
		}
		return await this.sendShioriNotify("OnRSSComplete", [
			siteNameOrStatus,
			siteUrl,
			...entries,
		]);
	},

	/**
	 * RSSセンス失敗通知 (OnRSSFailure)
	 */
	async sendRssFailure(this: LifecycleContext, reason: string) {
		return await this.sendShioriNotify("OnRSSFailure", [reason]);
	},
};
