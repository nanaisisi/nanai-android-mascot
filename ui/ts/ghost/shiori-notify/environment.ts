/**
 * @file shiori-notify/environment.ts
 * @brief OS・シェル・ユーザー等の環境情報通知
 */

import type { LifecycleContext } from "./ghost-lifecycle/lifecycle-events.js";

export const shioriNotifyEnvironment = {
	/**
	 * OS情報通知 (OnNotifyOSInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyOSInfo(this: LifecycleContext, osName = "Android", osVersion = "14") {
		return await this.sendShioriNotify("OnNotifyOSInfo", [osName, osVersion]);
	},

	/**
	 * 自身（ゴースト本体）情報通知 (OnNotifySelfInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifySelfInfo(
		this: LifecycleContext,
		ghostName: string,
		shellName = "master",
		balloonName = "default",
	) {
		return await this.sendShioriNotify("OnNotifySelfInfo", [
			ghostName,
			shellName,
			balloonName,
		]);
	},

	/**
	 * バルーン構成情報通知 (OnNotifyBalloonInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyBalloonInfo(
		this: LifecycleContext,
		balloonName = "default",
		balloonPath = "",
	) {
		return await this.sendShioriNotify("OnNotifyBalloonInfo", [
			balloonName,
			balloonPath,
		]);
	},

	/**
	 * シェル構成情報通知 (OnNotifyShellInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyShellInfo(this: LifecycleContext, shellName = "master", shellPath = "") {
		return await this.sendShioriNotify("OnNotifyShellInfo", [
			shellName,
			shellPath,
		]);
	},

	/**
	 * 着せ替え構成情報通知 (OnNotifyDressupInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyDressupInfo(this: LifecycleContext, dressupItems: string[] = []) {
		return await this.sendShioriNotify("OnNotifyDressupInfo", dressupItems);
	},

	/**
	 * ユーザー設定情報通知 (OnNotifyUserInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyUserInfo(
		this: LifecycleContext,
		userName = "ユーザー",
		userBirthday = "",
		userGender = "",
	) {
		return await this.sendShioriNotify("OnNotifyUserInfo", [
			userName,
			userBirthday,
			userGender,
		]);
	},

	/**
	 * フォント設定情報通知 (OnNotifyFontInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyFontInfo(this: LifecycleContext, fontName = "sans-serif", fontSize = 12) {
		return await this.sendShioriNotify("OnNotifyFontInfo", [
			fontName,
			String(fontSize),
		]);
	},

	/**
	 * 祝日・休日情報通知 (OnNotifyHolidayInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyHolidayInfo(this: LifecycleContext, holidayName = "", holidayDate = "") {
		return await this.sendShioriNotify("OnNotifyHolidayInfo", [
			holidayName,
			holidayDate,
		]);
	},

	/**
	 * 国際化・地域設定通知 (OnNotifyInternationalInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyInternationalInfo(
		this: LifecycleContext,
		locale = "ja-JP",
		timezone = "Asia/Tokyo",
	) {
		return await this.sendShioriNotify("OnNotifyInternationalInfo", [
			locale,
			timezone,
		]);
	},

	/**
	 * バッテリー・電源状態通知
	 */
	async notifyBatteryState(
		this: LifecycleContext,
		type:
			| "notify"
			| "critical"
			| "low"
			| "charging_start"
			| "charging_stop" = "notify",
		level = 100,
		status: string | number = "1",
	) {
		const eventMap: Record<string, string> = {
			notify: "OnBatteryNotify",
			critical: "OnBatteryCritical",
			low: "OnBatteryLow",
			charging_start: "OnBatteryChargingStart",
			charging_stop: "OnBatteryChargingStop",
		};
		const event = eventMap[type] || "OnBatteryNotify";
		return await this.sendShioriNotify(event, [String(level), String(status)]);
	},

	/**
	 * OS環境・ディスプレイ・テーマ・負荷状態通知 (UKADOC os-state)
	 */
	async notifyOsEnvironment(
		this: LifecycleContext,
		event:
			| "OnDisplayChange"
			| "OnDisplayChangeEx"
			| "OnDisplayHandover"
			| "OnDisplayPowerStatus"
			| "OnDarkTheme"
			| "OnTabletMode"
			| "OnWindowModeChange"
			| "OnNetworkStatusChange"
			| "OnNetworkHeavy"
			| "OnCPULoadHigh"
			| "OnCPULoadLow"
			| "OnMemoryLoadHigh"
			| "OnMemoryLoadLow"
			| "OnRecycleBinEmpty"
			| "OnRecycleBinEmptyFromOther"
			| "OnRecycleBinStatusUpdate"
			| "OnOSUpdateInfo"
			| "OnDesktopWallpaperChange"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * スクリーンセーバー状態通知
	 */
	async notifyScreenSaver(this: LifecycleContext, isStarted: boolean) {
		const event = isStarted ? "OnScreenSaverStart" : "OnScreenSaverEnd";
		return await this.sendShioriNotify(event, []);
	},

	/**
	 * デバイス着脱通知
	 */
	async notifyDeviceChange(
		this: LifecycleContext,
		action: "arrival" | "remove",
		deviceName = "",
	) {
		const event = action === "arrival" ? "OnDeviceArrival" : "OnDeviceRemove";
		return await this.sendShioriNotify(event, [deviceName]);
	},

	/**
	 * セッション状態通知
	 */
	async notifySessionState(
		this: LifecycleContext,
		sessionState: "lock" | "unlock" | "disconnect" | "reconnect",
	) {
		const eventMap: Record<string, string> = {
			lock: "OnSessionLock",
			unlock: "OnSessionUnlock",
			disconnect: "OnSessionDisconnect",
			reconnect: "OnSessionReconnect",
		};
		const event = eventMap[sessionState] || "OnSessionLock";
		return await this.sendShioriNotify(event, []);
	},

	/**
	 * モード・負荷・ネットワーク通知
	 */
	async notifySystemStatus(
		this: LifecycleContext,
		event: string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},
};
