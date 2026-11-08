/**
 * @file shiori-notify.ts
 * @brief UKADOC notify イベント群 (SHIORI/3.0 NOTIFY コマンド)
 *
 * 起動直後・ゴースト切替後などにベースウェア側の環境情報を SHIORI へ
 * 通知する。NOTIFY で通知したイベントへの SHIORI 応答（スクリプト）は
 * baseware が無視する規約のため、応答は保持せず fire-and-forget で送る。
 */

import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

export const shioriNotifyMethods = {
	/**
	 * NOTIFY コマンドで SHIORI イベントを送信
	 * @this {any}
	 * @param {string} event イベントID (例: "installedghostname")
	 * @param {Array<string|number>} references Reference0..N
	 */
	async sendShioriNotify(
		this: any,
		event: string,
		references: Array<string | number>,
	) {
		if (!isTauriAvailable()) return null;
		const ghostId = this.app?.ghostId || "main";
		try {
			return await invoke("send_shiori_notify", {
				event,
				references: references.map(String),
				ghostId,
			});
		} catch (error) {
			console.warn(`SHIORI 通知失敗 (${event}):`, error);
			return null;
		}
	},

	/**
	 * OS情報通知 (OnNotifyOSInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyOSInfo(this: any, osName = "Android", osVersion = "14") {
		return await this.sendShioriNotify("OnNotifyOSInfo", [osName, osVersion]);
	},

	/**
	 * 自身（ゴースト本体）情報通知 (OnNotifySelfInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifySelfInfo(
		this: any,
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
		this: any,
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
	async notifyShellInfo(this: any, shellName = "master", shellPath = "") {
		return await this.sendShioriNotify("OnNotifyShellInfo", [
			shellName,
			shellPath,
		]);
	},

	/**
	 * 着せ替え構成情報通知 (OnNotifyDressupInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyDressupInfo(this: any, dressupItems: string[] = []) {
		return await this.sendShioriNotify("OnNotifyDressupInfo", dressupItems);
	},

	/**
	 * ユーザー設定情報通知 (OnNotifyUserInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyUserInfo(
		this: any,
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
	async notifyFontInfo(this: any, fontName = "sans-serif", fontSize = 12) {
		return await this.sendShioriNotify("OnNotifyFontInfo", [
			fontName,
			String(fontSize),
		]);
	},

	/**
	 * 祝日・休日情報通知 (OnNotifyHolidayInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyHolidayInfo(this: any, holidayName = "", holidayDate = "") {
		return await this.sendShioriNotify("OnNotifyHolidayInfo", [
			holidayName,
			holidayDate,
		]);
	},

	/**
	 * 国際化・地域設定通知 (OnNotifyInternationalInfo) を送信 (UKADOC 規格準拠)
	 */
	async notifyInternationalInfo(
		this: any,
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
		this: any,
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
	 * URL ドロップイベント通知 (UKADOC url-drop)
	 */
	async notifyUrlDropEvent(
		this: any,
		event:
			| "OnURLDropped"
			| "OnURLDropping"
			| "OnURLDragDropping"
			| "OnURLDropFailure"
			| "OnURLQuery"
			| "OnXUkagakaLinkOpen"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * ファイルドロップイベント通知 (UKADOC file-drop)
	 */
	async notifyFileDropEvent(
		this: any,
		event:
			| "OnFileDrop"
			| "OnFileDrop2"
			| "OnFileDropEx"
			| "OnFileDropped"
			| "OnFileDropping"
			| "OnDirectoryDrop"
			| "OnArchiveViewerOpen"
			| "OnMediaPlayerOpen"
			| "OnPictureViewerOpen"
			| "OnNarCreating"
			| "OnNarCreated"
			| "OnUpdatedataCreating"
			| "OnUpdatedataCreated"
			| "OnOtherObjectDropping"
			| "OnOtherObjectDropped"
			| "OnWallpaperChange"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * OS環境・ディスプレイ・テーマ・負荷状態通知 (UKADOC os-state)
	 */
	async notifyOsEnvironment(
		this: any,
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
	 * 重なり・画面外判定通知 (UKADOC overlap)
	 */
	async notifyOverlapEvent(
		this: any,
		event:
			| "OnOffscreen"
			| "OnOtherOffscreen"
			| "OnOverlap"
			| "OnOtherOverlap"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * サーフィス・バルーン状態通知 (UKADOC surface / balloon)
	 */
	async notifySurfaceBalloonEvent(
		this: any,
		event:
			| "OnSurfaceChange"
			| "OnOtherSurfaceChange"
			| "OnBalloonClose"
			| "OnBalloonBreak"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 選択肢・アンカー拡張通知 (UKADOC choice)
	 */
	async notifyChoiceAnchorEx(
		this: any,
		event: "OnChoiceSelectEx" | "OnAnchorSelectEx" | string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 利用規約・ダイアログ通知 (UKADOC dialogbox)
	 */
	async notifyTermsDialogEvent(
		this: any,
		event: "OnGhostTermsAccept" | "OnGhostTermsDecline" | string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * イベント送信・通知失敗イベント (UKADOC event-send-failure)
	 */
	async notifyEventSendFailure(
		this: any,
		event:
			| "OnNotifyOtherFailure"
			| "OnNotifyPluginFailure"
			| "OnRaiseOtherFailure"
			| "OnRaisePluginFailure"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * ゲームパッドイベント通知 (UKADOC gamepad)
	 */
	async notifyGamepadEvent(
		this: any,
		event:
			| "OnGamepadAxisMove"
			| "OnGamepadButtonDown"
			| "OnGamepadButtonUp"
			| "OnGamepadConnected"
			| "OnGamepadDisconnected"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 矩形選択モードイベント通知 (UKADOC select-region-mode)
	 */
	async notifySelectRegionModeEvent(
		this: any,
		event:
			| "OnSelectModeBegin"
			| "OnSelectModeCancel"
			| "OnSelectModeComplete"
			| "OnSelectModeMouseDown"
			| "OnSelectModeMouseUp"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 音声認識・合成イベント通知 (UKADOC speech)
	 */
	async notifySpeechEvent(
		this: any,
		event:
			| "OnSpeechSynthesisStatus"
			| "OnVoiceRecognitionStatus"
			| "OnVoiceRecognitionWord"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * その他の各種通知 (UKADOC other)
	 */
	async notifyOtherEvent(
		this: any,
		event:
			| "OnAITalk"
			| "OnCompressArchiveComplete"
			| "OnCompressArchiveFailure"
			| "OnEmbryoExist"
			| "OnExtractArchiveComplete"
			| "OnExtractArchiveFailure"
			| "OnInternalSaoriComplete"
			| "OnInternalSaoriFailure"
			| "OnLanguageChange"
			| "OnNekodorifExist"
			| "OnOtherGhostTalk"
			| "OnRecommendsiteChoice"
			| "OnSoundSpectrum"
			| "OnTextDrop"
			| "OnVideoPlayEx"
			| string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * スクリーンセーバー状態通知
	 */
	async notifyScreenSaver(this: any, isStarted: boolean) {
		const event = isStarted ? "OnScreenSaverStart" : "OnScreenSaverEnd";
		return await this.sendShioriNotify(event, []);
	},

	/**
	 * デバイス着脱通知
	 */
	async notifyDeviceChange(
		this: any,
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
		this: any,
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
		this: any,
		event: string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * RSS / ヘッドラインセンス通知
	 */
	async notifyHeadlineRssEvent(
		this: any,
		event: string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 外部アプリケーション起動通知 (OnApplicationBoot) を送信
	 */
	async notifyApplicationBoot(this: any, appName: string, appPath = "") {
		return await this.sendShioriNotify("OnApplicationBoot", [appName, appPath]);
	},

	/**
	 * 外部アプリケーション終了通知 (OnApplicationClose) を送信
	 */
	async notifyApplicationClose(this: any, appName: string) {
		return await this.sendShioriNotify("OnApplicationClose", [appName]);
	},

	/**
	 * 外部アプリケーション存在確認 (OnApplicationExist) を送信
	 */
	async checkApplicationExist(this: any, appName: string): Promise<boolean> {
		const res: any = await this.sendShioriNotify("OnApplicationExist", [
			appName,
		]);
		return res === "1" || res === "true";
	},

	/**
	 * 外部アプリケーションファイルオープン通知 (OnApplicationFileOpen) を送信
	 */
	async notifyApplicationFileOpen(this: any, appName: string, filePath = "") {
		return await this.sendShioriNotify("OnApplicationFileOpen", [
			appName,
			filePath,
		]);
	},

	/**
	 * 外部アプリケーション操作完了通知 (OnApplicationOperationFinish) を送信
	 */
	async notifyApplicationOperationFinish(
		this: any,
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
	async notifyApplicationVersion(this: any, appName: string, version = "") {
		return await this.sendShioriNotify("OnApplicationVersion", [
			appName,
			version,
		]);
	},

	/**
	 * Webサイト更新通知 (OnWebsiteUpdateNotify) を送信
	 */
	async notifyWebsiteUpdate(this: any, url: string, updateTime = "") {
		return await this.sendShioriNotify("OnWebsiteUpdateNotify", [
			url,
			updateTime,
		]);
	},

	/**
	 * バルーン倍率変更通知 (OnBalloonScaling) を送信 (UKADOC準拠)
	 */
	async sendBalloonScalingNotify(
		this: any,
		afterX: number | string,
		beforeX: number | string,
		afterY: number | string = afterX,
		beforeY: number | string = beforeX,
	) {
		return await this.sendShioriNotify("OnBalloonScaling", [
			String(afterX),
			String(beforeX),
			String(afterY),
			String(beforeY),
		]);
	},

	/**
	 * バルーン閉じる通知 (OnBalloonClose) を送信 (UKADOC準拠)
	 * @param {string} [lastScript=""] 閉じる直前に表示されていたスクリプト
	 * @param {number|string} [scopeId=0] バルーンのスコープID
	 */
	async sendBalloonCloseNotify(
		this: any,
		lastScript: string = "",
		scopeId: number | string = 0,
	) {
		return await this.sendShioriNotify("OnBalloonClose", [
			lastScript,
			String(scopeId),
		]);
	},

	/**
	 * バルーン中断通知 (OnBalloonBreak) を送信 (UKADOC準拠)
	 * @param {string} [script=""] 中断の操作が起きたスクリプト
	 * @param {number|string} [scopeId=0] 中断の操作が起きたスコープ番号 (本体側0, 相方側1...)
	 * @param {number|string} [charPosition] 中断位置 (スクリプト先頭からの文字数)
	 */
	async sendBalloonBreakNotify(
		this: any,
		script: string = "",
		scopeId: number | string = 0,
		charPosition?: number | string,
	) {
		const refs = [script, String(scopeId)];
		if (charPosition !== undefined) {
			refs.push(String(charPosition));
		}
		return await this.sendShioriNotify("OnBalloonBreak", refs);
	},

	/**
	 * マウス拡張イベント送信
	 */
	async notifyMouseEvent(
		this: any,
		eventName: string,
		args: Array<string | number>,
	) {
		return await this.sendShioriNotify(eventName, args);
	},

	/**
	 * ヘッドラインセンス開始通知 (OnHeadlinesenseBegin)
	 */
	async sendHeadlineSenseBegin(this: any, siteName: string, url: string) {
		return await this.sendShioriNotify("OnHeadlinesenseBegin", [siteName, url]);
	},

	/**
	 * ヘッドライン発見通知 (OnHeadlinesense.OnFind)
	 */
	async sendHeadlineSenseOnFind(
		this: any,
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
	async sendHeadlineSenseComplete(this: any, reason = "no update") {
		return await this.sendShioriNotify("OnHeadlinesenseComplete", [reason]);
	},

	/**
	 * ヘッドラインセンス失敗通知 (OnHeadlinesenseFailure)
	 */
	async sendHeadlineSenseFailure(this: any, reason: string) {
		return await this.sendShioriNotify("OnHeadlinesenseFailure", [reason]);
	},

	/**
	 * RSSセンス開始通知 (OnRSSBegin)
	 */
	async sendRssBegin(this: any, siteName: string, url: string) {
		return await this.sendShioriNotify("OnRSSBegin", [siteName, url]);
	},

	/**
	 * RSSセンス完了通知 (OnRSSComplete)
	 */
	async sendRssComplete(
		this: any,
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
	async sendRssFailure(this: any, reason: string) {
		return await this.sendShioriNotify("OnRSSFailure", [reason]);
	},

	/**
	 * UKADOC capability Notify イベントを送信 (SHIORI 実行初期)
	 */
	async sendCapabilityNotify(this: any) {
		if (!isTauriAvailable()) return null;
		const capabilities = [
			"request.sender",
			"request.sendertype",
			"request.securitylevel",
			"request.securityorigin",
			"request.status",
			"request.baseid",
			"request.x-sstp-passthru",
			"response.value",
			"response.valuenotify",
			"response.marker",
			"response.markersend",
			"response.balloonoffset",
			"response.age",
			"response.errorlevel",
			"response.errordescription",
			"response.x-sstp-passthru",
		];
		return await this.sendShioriNotify("capability", capabilities);
	},

	/**
	 * 起動時通知一式を送信 (SHIORI ロード後 / OnBoot 後に呼ぶ)
	 */
	async sendBootNotifyEvents(this: any) {
		if (!isTauriAvailable()) return;
		const ghost = this.currentGhost;
		if (!ghost) return;

		console.log("🚀 起動時 NOTIFY イベント送信...");

		await this.sendCapabilityNotify();

		const ghosts = this.ghosts?.length > 0 ? this.ghosts : [ghost];

		await this.sendShioriNotify(
			"installedghostname",
			ghosts.map((g: any) => g.name),
		);
		await this.sendShioriNotify(
			"installedsakuraname",
			ghosts.map((g: any) => g.sakura_name || g.name),
		);
		// 後方互換性フォールバック（旧コードからの呼出用）
		// Legacy alias for backward compatibility
		await this.sendShioriNotify(
			"installsakuraname",
			ghosts.map((g: any) => g.sakura_name || g.name),
		);

		const keroNames = ghosts
			.map((g: any) => g.kero_name)
			.filter((n: string) => Boolean(n?.trim()));
		if (keroNames.length > 0) {
			await this.sendShioriNotify("installedkeroname", keroNames);
		}

		if (this.shells?.length > 0) {
			await this.sendShioriNotify("installedshellname", this.shells);
		}

		const ghostPaths = ghosts
			.map((g: any) => g.path)
			.filter((p: string) => Boolean(p));
		if (ghostPaths.length > 0) {
			await this.sendShioriNotify("ghostpathlist", ghostPaths);
		}

		const balloonNames =
			this.balloons?.length > 0 ? this.balloons : ["default"];
		await this.sendShioriNotify("installedballoonname", balloonNames);

		const balloonPaths =
			this.balloonPaths?.length > 0
				? this.balloonPaths
				: ["assets/balloon/default"];
		await this.sendShioriNotify("balloonpathlist", balloonPaths);

		await this.sendShioriNotify("basewareversion", [
			"Nanai Android Mascot 1.0.0",
		]);

		const dirName = (ghost.path || "")
			.split(/[\\/]+/)
			.filter(Boolean)
			.pop();
		if (dirName) {
			await this.sendShioriNotify("uniqueid", [dirName]);
		}

		await this.sendShioriNotify("hwnd", [1001, 1002]);

		if (this.plugins?.length > 0) {
			await this.sendShioriNotify("installedplugin", this.plugins);
			await this.sendShioriNotify(
				"pluginpathlist",
				this.pluginPaths || this.plugins.map((p: string) => `plugins/${p}`),
			);
		}

		if (this.headlines?.length > 0) {
			await this.sendShioriNotify("installedheadlinename", this.headlines);
			await this.sendShioriNotify(
				"headlinepathlist",
				this.headlinePaths ||
					this.headlines.map((h: string) => `headlines/${h}`),
			);
		}

		if (this.calendarPlugins?.length > 0) {
			await this.sendShioriNotify(
				"installedcalendarpluginname",
				this.calendarPlugins,
			);
			await this.sendShioriNotify(
				"calendarpluginpathlist",
				this.calendarPluginPaths ||
					this.calendarPlugins.map((c: string) => `calendar/plugins/${c}`),
			);
		}
		if (this.calendarSkins?.length > 0) {
			await this.sendShioriNotify(
				"installedcalendarskinname",
				this.calendarSkins,
			);
			await this.sendShioriNotify(
				"calendarskinpathlist",
				this.calendarSkinPaths ||
					this.calendarSkins.map((s: string) => `calendar/skins/${s}`),
			);
		}

		const otherGhosts = ghosts.filter((g: any) => g.name !== ghost.name);
		if (otherGhosts.length > 0) {
			await this.sendShioriNotify(
				"otherghostname",
				otherGhosts.map((g: any) => g.name),
			);
		}
		await this.sendShioriNotify("ownerghostname", [ghost.name]);

		await this.sendShioriNotify("configuredbiffname", ["default"]);

		if (this.app?.debugMode) {
			await this.sendShioriNotify("enable_debug", ["1"]);
			await this.sendShioriNotify("enable_log", ["1"]);
		}
		await this.sendShioriNotify("rateofusegraph", ["1"]);

		console.log("✅ 起動時 NOTIFY イベント送信完了");
	},

	/**
	 * サーフェス変更通知 (OnSurfaceChange) を送信 (UKADOC 規格準拠)
	 * @param {number} scopeId 切り替わったウインドウ・キャラID (Sakura=0, Kero=1)
	 * @param {number|string} surface0 Sakura側の現在サーフィスID
	 * @param {number|string} surface1 Kero側の現在サーフィスID
	 * @param {number} [width=0] サーフィス横幅
	 * @param {number} [height=0] サーフィス高さ
	 */
	async notifySurfaceChange(
		this: any,
		scopeId: number,
		surface0: number | string = 0,
		surface1: number | string = 10,
		width: number = 0,
		height: number = 0,
	) {
		const ref2 = `${scopeId},${scopeId === 0 ? surface0 : surface1},${width},${height}`;
		return await this.sendShioriNotify("OnSurfaceChange", [
			String(surface0),
			String(surface1),
			ref2,
		]);
	},

	/**
	 * 他ゴーストのサーフェス変更通知 (OnOtherSurfaceChange) を送信 (UKADOC 規格準拠)
	 * @param {string} ghostName ゴースト名
	 * @param {string} sakuraName Sakura名
	 * @param {number} scopeId ウインドウID (0=Sakura, 1=Kero)
	 * @param {number|string} newSurface 新サーフィスID
	 * @param {number|string} oldSurface 旧サーフィスID
	 * @param {{ left: number, top: number, right: number, bottom: number }|string} [rect="0,0,0,0"]
	 */
	async notifyOtherSurfaceChange(
		this: any,
		ghostName: string,
		sakuraName: string,
		scopeId: number,
		newSurface: number | string,
		oldSurface: number | string,
		rect:
			| { left: number; top: number; right: number; bottom: number }
			| string = "0,0,0,0",
	) {
		const rectStr =
			typeof rect === "object"
				? `${rect.left},${rect.top},${rect.right},${rect.bottom}`
				: String(rect);
		return await this.sendShioriNotify("OnOtherSurfaceChange", [
			ghostName,
			sakuraName,
			String(scopeId),
			String(newSurface),
			String(oldSurface),
			rectStr,
		]);
	},

	/**
	 * 選択肢拡張通知 (OnChoiceSelectEx) を送信 (UKADOC 規格準拠)
	 * Reference0: ラベル(text), Reference1: ID, Reference2..: 拡張引数
	 */
	async sendChoiceSelectExNotify(
		this: any,
		id: string,
		text: string,
		args: string[] = [],
	) {
		return await this.sendShioriNotify("OnChoiceSelectEx", [text, id, ...args]);
	},

	/**
	 * アンカー拡張通知 (OnAnchorSelectEx) を送信 (UKADOC 規格準拠)
	 * Reference0: テキスト, Reference1: ID, Reference2..: 拡張引数
	 */
	async sendAnchorSelectExNotify(
		this: any,
		id: string,
		text: string,
		args: string[] = [],
	) {
		return await this.sendShioriNotify("OnAnchorSelectEx", [text, id, ...args]);
	},

	/**
	 * 利用条件受諾通知 (OnGhostTermsAccept) を送信 (UKADOC 規格準拠)
	 */
	async sendGhostTermsAcceptNotify(this: any, id: string = "") {
		return await this.sendShioriNotify("OnGhostTermsAccept", id ? [id] : []);
	},

	/**
	 * 利用条件拒否通知 (OnGhostTermsDecline) を送信 (UKADOC 規格準拠)
	 */
	async sendGhostTermsDeclineNotify(this: any, id: string = "") {
		return await this.sendShioriNotify("OnGhostTermsDecline", id ? [id] : []);
	},

	/**
	 * ダイアログ関連 SHIORI イベント通知 (UKADOC dialogbox spec)
	 */
	async sendGhostTermsAccept(this: any, ghostName: string) {
		return await this.sendShioriNotify("OnGhostTermsAccept", [ghostName]);
	},

	async sendGhostTermsDecline(this: any, ghostName: string) {
		return await this.sendShioriNotify("OnGhostTermsDecline", [ghostName]);
	},

	/**
	 * バルーン関連 SHIORI イベント通知 (UKADOC balloon spec)
	 */
	async sendBalloonClose(
		this: any,
		scopeId: number | string = 0,
		reason: string = "",
	) {
		return await this.sendShioriNotify("OnBalloonClose", [
			String(scopeId),
			reason,
		]);
	},

	async sendBalloonBreak(
		this: any,
		scopeId: number | string = 0,
		reason: string = "",
	) {
		return await this.sendShioriNotify("OnBalloonBreak", [
			String(scopeId),
			reason,
		]);
	},

	/**
	 * サーフィス関連 SHIORI イベント通知 (UKADOC surface spec)
	 */
	async sendSurfaceChange(
		this: any,
		scopeId: number | string = 0,
		surfaceId: number | string = 0,
	) {
		return await this.sendShioriNotify("OnSurfaceChange", [
			String(scopeId),
			String(surfaceId),
		]);
	},

	async sendOtherSurfaceChange(
		this: any,
		ghostName: string,
		scopeId: number | string = 0,
		surfaceId: number | string = 0,
	) {
		return await this.sendShioriNotify("OnOtherSurfaceChange", [
			ghostName,
			String(scopeId),
			String(surfaceId),
		]);
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

	/**
	 * 重なり・画面外通知 (UKADOC overlap spec)
	 */
	async sendOverlap(
		this: any,
		scope0: number | string,
		scope1: number | string,
		rect: string = "",
	) {
		return await this.sendShioriNotify("OnOverlap", [
			String(scope0),
			String(scope1),
			rect,
		]);
	},

	async sendOffscreen(this: any, scope: number | string, rect: string = "") {
		return await this.sendShioriNotify("OnOffscreen", [String(scope), rect]);
	},

	async sendOtherOverlap(this: any, ghostName: string, rect: string = "") {
		return await this.sendShioriNotify("OnOtherOverlap", [ghostName, rect]);
	},

	async sendOtherOffscreen(this: any, ghostName: string, rect: string = "") {
		return await this.sendShioriNotify("OnOtherOffscreen", [ghostName, rect]);
	},

	/**
	 * 外部通信イベント通知 (UKADOC other-communication spec)
	 */
	async notifyCommunicationEvent(
		this: any,
		event:
			| "OnExecuteFileWatchChange"
			| "OnExecuteFileWatchFailure"
			| "OnExecuteHTTPComplete"
			| "OnExecuteHTTPFailure"
			| "OnExecuteHTTPProgress"
			| "OnExecuteHTTPSSLInfo"
			| "OnExecuteHTTPStreaming"
			| "OnExecuteICalComplete"
			| "OnExecuteICalFailure"
			| "OnExecuteICalProgress"
			| "OnExecuteICal_SSLInfo"
			| "OnExecuteRSSComplete"
			| "OnExecuteRSSFailure"
			| "OnExecuteRSS_SSLInfo"
			| "OnExecuteScheduleComplete"
			| "OnExecuteScheduleFailure"
			| "OnExecuteScheduleGetComplete"
			| "OnExecuteWebSocketClose"
			| "OnExecuteWebSocketFailure"
			| "OnExecuteWebSocketOpen"
			| "OnExecuteWebSocketReceive"
			| "OnExecuteWebSocketReconnect"
			| "OnExecuteWebSocket_SSLInfo"
			| "OnNSLookupComplete"
			| "OnNSLookupFailure"
			| "OnPingComplete"
			| "OnPingProgress",
		references: (string | number)[] = [],
	) {
		return await this.sendShioriNotify(
			event,
			references.map((r) => String(r)),
		);
	},
};
