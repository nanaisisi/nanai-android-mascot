import { invoke, isTauriAvailable } from "../core/tauri-helper.js";

/**
 * UKADOC notify イベント群 (SHIORI/3.0 NOTIFY コマンド)
 *
 * 起動直後・ゴースト切替後などにベースウェア側の環境情報を SHIORI へ
 * 通知する。NOTIFY で通知したイベントへの SHIORI 応答（スクリプト）は
 * baseware が無視する規約のため、応答は保持せず fire-and-forget で送る。
 *
 * 通知内容:
 * - installedghostname / installedsakuraname / installedkeroname
 * - installedshellname (現在のゴーストに同梱のシェル名)
 * - ghostpathlist (読み込み可能なゴーストフォルダのフルパス)
 * - installedballoonname / balloonpathlist (バルーン情報一覧)
 * - installedplugin / pluginpathlist / installedheadlinename / headlinepathlist
 * - installedcalendarpluginname / calendarpluginpathlist / installedcalendarskinname / calendarskinpathlist
 * - otherghostname / ownerghostname / configuredbiffname / enable_debug / enable_log / rateofusegraph
 * - basewareversion / uniqueid / hwnd
 * - OnNotifyOSInfo, OnNotifySelfInfo, OnNotifyBalloonInfo, OnNotifyShellInfo, OnNotifyDressupInfo
 * - OnNotifyUserInfo, OnNotifyFontInfo, OnNotifyHolidayInfo, OnNotifyInternationalInfo
 * - OnBatteryNotify, OnBatteryCritical, OnBatteryLow, OnBatteryChargingStart, OnBatteryChargingStop
 * - OnDarkTheme, OnDisplayChange, OnDisplayChangeEx, OnDisplayPowerStatus, OnDisplayHandover
 * - OnScreenSaverStart, OnScreenSaverEnd, OnDeviceArrival, OnDeviceRemove
 * - OnSessionLock, OnSessionUnlock, OnSessionDisconnect, OnSessionReconnect
 * - OnTabletMode, OnWindowModeChange, OnMemoryLoadHigh, OnMemoryLoadLow
 * - OnCPULoadHigh, OnCPULoadLow, OnNetworkStatusChange, OnNetworkHeavy
 * - OnDesktopWallpaperChange, OnRecycleBinEmpty, OnRecycleBinEmptyFromOther, OnRecycleBinStatusUpdate, OnOSUpdateInfo
 * - OnVanished, OnVanishSelecting, OnVanishSelected, OnVanishCancel, OnVanishButtonHold, OnOtherGhostVanished
 * - OnURLDropped, OnURLDropping, OnURLDragDropping, OnURLDropFailure, OnURLQuery, OnXUkagakaLinkOpen
 * - OnHeadlinesenseBegin, OnHeadlinesense.OnFind, OnHeadlinesenseComplete, OnHeadlinesenseFailure
 * - OnRSSBegin, OnRSSComplete, OnRSSFailure
 * - OnBalloonBreak, OnBalloonClose, OnBalloonTimeout, OnBalloonScaling (バルーン操作イベント)
 * - OnBalloonChange, OnBasewareUpdated, OnBasewareUpdating, OnBoot, OnCacheRestore, OnCacheSuspend
 * - OnClose, OnCloseAll, OnDestroy, OnDressupChanged, OnFirstBoot, OnFullScreenAppMinimize
 * - OnFullScreenAppRestore, OnGhostCallComplete, OnGhostCalled, OnGhostCalling, OnGhostChanged, OnGhostChanging
 * - OnInitialize, OnOtherGhostBooted, OnOtherGhostChanged, OnOtherGhostClosed, OnShellChanged, OnShellChanging
 * - OnSysResume, OnSysSuspend, OnVirtualDesktopChanged, OnWindowStateMinimize, OnWindowStateRestore
 * - OnSchedule5MinutesToGo, OnSchedulepostBegin, OnSchedulepostComplete, OnScheduleRead
 * - OnSchedulesenseBegin, OnSchedulesenseComplete, OnSchedulesenseFailure, OnScheduleTodayNotify
 * - OnHeadlinesenseBegin, OnHeadlinesense.OnFind, OnHeadlinesenseComplete, OnHeadlinesenseFailure
 * - OnRSSBegin, OnRSSComplete, OnRSSFailure
 * - OnMouseEnter, OnMouseLeave, OnMouseClickEx, OnMouseDoubleClickEx, OnMouseDownEx, OnMouseUpEx
 * - OnMouseMultipleClick, OnMouseMultipleClickEx, OnMouseEnterAll, OnMouseLeaveAll, OnMouseGesture
 * - OnAnchorEnter, OnAnchorHover, OnAnchorSelect, OnAnchorSelectEx
 * - OnChoiceEnter, OnChoiceHover, OnChoiceSelect, OnChoiceSelectEx, OnChoiceTimeout
 * - OnConfigurationDialogHelp, OnGhostTermsAccept, OnGhostTermsDecline, OnSystemDialog, OnSystemDialogCancel
 * - OnNotifyOtherFailure, OnNotifyPluginFailure, OnRaiseOtherFailure, OnRaisePluginFailure
 * - OnArchiveViewerOpen, OnDirectoryDrop, OnFileDrop, OnFileDrop2, OnFileDropEx, OnFileDropped
 * - OnFileDropping, OnMediaPlayerOpen, OnNarCreated, OnNarCreating, OnOtherObjectDropped
 * - OnOtherObjectDropping, OnPictureViewerOpen, OnUpdatedataCreated, OnUpdatedataCreating, OnWallpaperChange
 * - OnApplicationBoot, OnApplicationClose, OnApplicationExist, OnApplicationFileOpen
 * - OnApplicationOperationFinish, OnApplicationVersion, OnWebsiteUpdateNotify
 * - menu.background.bitmap.filename, menu.foreground.bitmap.filename, menu.sidebar.bitmap.filename
 * - menu.background.font.color.r, menu.background.font.color.g, menu.background.font.color.b
 * - menu.foreground.font.color.r, menu.foreground.font.color.g, menu.foreground.font.color.b
 * - menu.disable.font.color.r, menu.disable.font.color.g, menu.disable.font.color.b
 * - menu.separator.color.r, menu.separator.color.g, menu.separator.color.b
 * - menu.frame.color.r, menu.frame.color.g, menu.frame.color.b
 * - menu.font.name, menu.font.height
 * - updatebutton.caption, quitbutton.caption, closebutton.caption, configurationbutton.caption, readmebutton.caption, vanishbutton.caption
 * - callsstpsendboxbutton.caption, updatefmobutton.caption, switchlocalsstpbutton.caption, switchremotesstpbutton.caption
 * - switchreloadbutton.caption, switchrootbutton.caption, historyrootbutton.caption, sntpbutton.caption, termsbutton.caption, alignrootbutton.caption
 */
export const shioriNotifyMethods = {
	/**
	 * NOTIFY コマンドで SHIORI イベントを送信
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} event イベントID (例: "installedghostname")
	 * @param {Array<string|number>} references Reference0..N
	 */
	async sendShioriNotify(event, references) {
		if (!isTauriAvailable()) return null;
		const ghostId = this.app.ghostId || "main";
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
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} osName OS名 (例: "Android", "Linux", "Windows")
	 * @param {string} osVersion バージョン
	 */
	async notifyOSInfo(osName = "Android", osVersion = "14") {
		return await this.sendShioriNotify("OnNotifyOSInfo", [osName, osVersion]);
	},

	/**
	 * 自身（ゴースト本体）情報通知 (OnNotifySelfInfo) を送信 (UKADOC 規格準拠)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} ghostName ゴースト名
	 * @param {string} [shellName] 現在のシェル名
	 * @param {string} [balloonName] 現在のバルーン名
	 */
	async notifySelfInfo(
		ghostName,
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
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} balloonName バルーン名
	 * @param {string} [balloonPath] バルーンのパス
	 */
	async notifyBalloonInfo(balloonName = "default", balloonPath = "") {
		return await this.sendShioriNotify("OnNotifyBalloonInfo", [
			balloonName,
			balloonPath,
		]);
	},

	/**
	 * シェル構成情報通知 (OnNotifyShellInfo) を送信 (UKADOC 規格準拠)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} shellName シェル名
	 * @param {string} [shellPath] シェルパス
	 */
	async notifyShellInfo(shellName = "master", shellPath = "") {
		return await this.sendShioriNotify("OnNotifyShellInfo", [
			shellName,
			shellPath,
		]);
	},

	/**
	 * 着せ替え構成情報通知 (OnNotifyDressupInfo) を送信 (UKADOC 規格準拠)
	 * @this {import('./ghost.js').GhostController}
	 * @param {Array<string>} dressupItems 着せ替えパーツ定義リスト
	 */
	async notifyDressupInfo(dressupItems = []) {
		return await this.sendShioriNotify("OnNotifyDressupInfo", dressupItems);
	},

	/**
	 * ユーザー設定情報通知 (OnNotifyUserInfo) を送信 (UKADOC 規格準拠)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} userName ユーザー名
	 * @param {string} [userBirthday] 誕生日
	 * @param {string} [userGender] 性別
	 */
	async notifyUserInfo(
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
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} fontName フォント名
	 * @param {string|number} fontSize フォントサイズ
	 */
	async notifyFontInfo(fontName = "sans-serif", fontSize = 12) {
		return await this.sendShioriNotify("OnNotifyFontInfo", [
			fontName,
			String(fontSize),
		]);
	},

	/**
	 * 祝日・休日情報通知 (OnNotifyHolidayInfo) を送信 (UKADOC 規格準拠)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} holidayName 祝日名
	 * @param {string} [holidayDate] 日付 (YYYY-MM-DD)
	 */
	async notifyHolidayInfo(holidayName = "", holidayDate = "") {
		return await this.sendShioriNotify("OnNotifyHolidayInfo", [
			holidayName,
			holidayDate,
		]);
	},

	/**
	 * 国際化・地域設定通知 (OnNotifyInternationalInfo) を送信 (UKADOC 規格準拠)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} locale ロケール (例: "ja-JP")
	 * @param {string} [timezone] タイムゾーン
	 */
	async notifyInternationalInfo(locale = "ja-JP", timezone = "Asia/Tokyo") {
		return await this.sendShioriNotify("OnNotifyInternationalInfo", [
			locale,
			timezone,
		]);
	},

	/**
	 * バッテリー・電源状態通知 (OnBatteryNotify, OnBatteryCritical, OnBatteryLow, OnBatteryChargingStart, OnBatteryChargingStop)
	 * @this {import('./ghost.js').GhostController}
	 * @param {'notify'|'critical'|'low'|'charging_start'|'charging_stop'} type 状態種別
	 * @param {number|string} level バッテリー残量 (0..100)
	 * @param {string|number} [status] 電源接続状態 (1: AC, 0: Battery)
	 */
	async notifyBatteryState(type = "notify", level = 100, status = "1") {
		const eventMap = {
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
	 * OS環境・ディスプレイ・テーマ状態通知 (OnDarkTheme, OnDisplayChange, OnDisplayChangeEx, OnDisplayPowerStatus, OnDisplayHandover)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} event イベントID
	 * @param {Array<string|number>} [references=[]]
	 */
	async notifyOsEnvironment(event, references = []) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * スクリーンセーバー状態通知 (OnScreenSaverStart, OnScreenSaverEnd)
	 * @this {import('./ghost.js').GhostController}
	 * @param {boolean} isStarted
	 */
	async notifyScreenSaver(isStarted) {
		const event = isStarted ? "OnScreenSaverStart" : "OnScreenSaverEnd";
		return await this.sendShioriNotify(event, []);
	},

	/**
	 * デバイス着脱通知 (OnDeviceArrival, OnDeviceRemove)
	 * @this {import('./ghost.js').GhostController}
	 * @param {'arrival'|'remove'} action
	 * @param {string} deviceName デバイス名
	 */
	async notifyDeviceChange(action, deviceName = "") {
		const event = action === "arrival" ? "OnDeviceArrival" : "OnDeviceRemove";
		return await this.sendShioriNotify(event, [deviceName]);
	},

	/**
	 * セッション状態通知 (OnSessionLock, OnSessionUnlock, OnSessionDisconnect, OnSessionReconnect)
	 * @this {import('./ghost.js').GhostController}
	 * @param {'lock'|'unlock'|'disconnect'|'reconnect'} sessionState
	 */
	async notifySessionState(sessionState) {
		const eventMap = {
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
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} event イベント名 (OnTabletMode, OnWindowModeChange, OnMemoryLoadHigh, OnMemoryLoadLow, OnCPULoadHigh, OnCPULoadLow, OnNetworkStatusChange, OnNetworkHeavy, OnDesktopWallpaperChange, OnRecycleBinEmpty, OnRecycleBinEmptyFromOther, OnRecycleBinStatusUpdate, OnOSUpdateInfo)
	 * @param {Array<string|number>} [references=[]]
	 */
	async notifySystemStatus(event, references = []) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 消滅・アンインストール通知 (OnVanished, OnVanishSelecting, OnVanishSelected, OnVanishCancel, OnVanishButtonHold, OnOtherGhostVanished)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} event イベント名
	 * @param {Array<string|number>} [references=[]]
	 */
	async notifyVanishEvent(event, references = []) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * URL ドロップイベント通知 (OnURLDropped, OnURLDropping, OnURLDragDropping, OnURLDropFailure, OnURLQuery, OnXUkagakaLinkOpen)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} event イベント名
	 * @param {Array<string|number>} [references=[]]
	 */
	async notifyUrlDropEvent(event, references = []) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * RSS / ヘッドラインセンス通知 (OnHeadlinesenseBegin, OnHeadlinesense.OnFind, OnHeadlinesenseComplete, OnHeadlinesenseFailure, OnRSSBegin, OnRSSComplete, OnRSSFailure)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} event イベント名
	 * @param {Array<string|number>} [references=[]]
	 */
	async notifyHeadlineRssEvent(event, references = []) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * 外部アプリケーション起動通知 (OnApplicationBoot) を送信
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} appName アプリケーション名/ID
	 * @param {string} [appPath] アプリケーションパス
	 */
	async notifyApplicationBoot(appName, appPath = "") {
		return await this.sendShioriNotify("OnApplicationBoot", [appName, appPath]);
	},

	/**
	 * 外部アプリケーション終了通知 (OnApplicationClose) を送信
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} appName アプリケーション名/ID
	 */
	async notifyApplicationClose(appName) {
		return await this.sendShioriNotify("OnApplicationClose", [appName]);
	},

	/**
	 * 外部アプリケーション存在確認 (OnApplicationExist) を送信
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} appName アプリケーション名/ID
	 * @returns {Promise<boolean>} アプリケーションが存在・起動中か
	 */
	async checkApplicationExist(appName) {
		const res = await this.sendShioriNotify("OnApplicationExist", [appName]);
		return res === "1" || res === "true";
	},

	/**
	 * 外部アプリケーションファイルオープン通知 (OnApplicationFileOpen) を送信
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} appName アプリケーション名/ID
	 * @param {string} filePath 開いたファイルのパス
	 */
	async notifyApplicationFileOpen(appName, filePath = "") {
		return await this.sendShioriNotify("OnApplicationFileOpen", [
			appName,
			filePath,
		]);
	},

	/**
	 * 外部アプリケーション操作完了通知 (OnApplicationOperationFinish) を送信
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} appName アプリケーション名/ID
	 * @param {string} [operationName] 操作名
	 */
	async notifyApplicationOperationFinish(appName, operationName = "") {
		return await this.sendShioriNotify("OnApplicationOperationFinish", [
			appName,
			operationName,
		]);
	},

	/**
	 * 外部アプリケーションバージョン通知 (OnApplicationVersion) を送信
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} appName アプリケーション名/ID
	 * @param {string} [version] バージョン文字列
	 */
	async notifyApplicationVersion(appName, version = "") {
		return await this.sendShioriNotify("OnApplicationVersion", [
			appName,
			version,
		]);
	},

	/**
	 * Webサイト更新通知 (OnWebsiteUpdateNotify) を送信
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} url 更新されたWebサイトのURL
	 * @param {string} [updateTime] 更新日時
	 */
	async notifyWebsiteUpdate(url, updateTime = "") {
		return await this.sendShioriNotify("OnWebsiteUpdateNotify", [
			url,
			updateTime,
		]);
	},

	/**
	 * バルーン倍率変更通知 (OnBalloonScaling) を送信 (UKADOC準拠)
	 * @this {import('./ghost.js').GhostController}
	 * @param {number|string} afterX 変更後の横倍率(%)
	 * @param {number|string} beforeX 変更前の横倍率(%)
	 * @param {number|string} [afterY] 変更後の縦倍率(%) (省略時はafterX)
	 * @param {number|string} [beforeY] 変更前の縦倍率(%) (省略時はbeforeX)
	 */
	async sendBalloonScalingNotify(
		afterX,
		beforeX,
		afterY = afterX,
		beforeY = beforeX,
	) {
		return await this.sendShioriNotify("OnBalloonScaling", [
			String(afterX),
			String(beforeX),
			String(afterY),
			String(beforeY),
		]);
	},

	/**
	 * マウス拡張イベント (OnMouseEnter / OnMouseLeave / OnMouseEnterAll / OnMouseLeaveAll / OnMouseClickEx / OnMouseDoubleClickEx / OnMouseDownEx / OnMouseUpEx / OnMouseMultipleClick / OnMouseMultipleClickEx / OnMouseGesture) 送信
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} eventName イベント名
	 * @param {Array<string|number>} args Reference0..N 引数
	 */
	async notifyMouseEvent(eventName, args) {
		return await this.sendShioriNotify(eventName, args);
	},

	/**
	 * ヘッドラインセンス開始通知 (OnHeadlinesenseBegin)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} siteName サイト名
	 * @param {string} url 取得URL
	 */
	async sendHeadlineSenseBegin(siteName, url) {
		return await this.sendShioriNotify("OnHeadlinesenseBegin", [siteName, url]);
	},

	/**
	 * ヘッドライン発見通知 (OnHeadlinesense.OnFind)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} siteName サイト名
	 * @param {string} url 取得URL
	 * @param {string} phase フェーズ (first/next/last)
	 * @param {string} content ヘッドライン内容
	 */
	async sendHeadlineSenseOnFind(siteName, url, phase, content) {
		return await this.sendShioriNotify("OnHeadlinesense.OnFind", [
			siteName,
			url,
			phase,
			content,
		]);
	},

	/**
	 * ヘッドラインセンス完了通知 (OnHeadlinesenseComplete)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} reason 終了理由 ("no update" 等)
	 */
	async sendHeadlineSenseComplete(reason = "no update") {
		return await this.sendShioriNotify("OnHeadlinesenseComplete", [reason]);
	},

	/**
	 * ヘッドラインセンス失敗通知 (OnHeadlinesenseFailure)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} reason 失敗理由 ("can't open", "timeout", "not headline" 等)
	 */
	async sendHeadlineSenseFailure(reason) {
		return await this.sendShioriNotify("OnHeadlinesenseFailure", [reason]);
	},

	/**
	 * RSSセンス開始通知 (OnRSSBegin)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} siteName サイト名
	 * @param {string} url 取得URL
	 */
	async sendRssBegin(siteName, url) {
		return await this.sendShioriNotify("OnRSSBegin", [siteName, url]);
	},

	/**
	 * RSSセンス完了通知 (OnRSSComplete)
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} siteNameOrStatus サイト名または "no update"
	 * @param {string} [siteUrl] サイトURL
	 * @param {string[]} [entries] 各記事エントリ
	 */
	async sendRssComplete(siteNameOrStatus, siteUrl = "", entries = []) {
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
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} reason 失敗理由
	 */
	async sendRssFailure(reason) {
		return await this.sendShioriNotify("OnRSSFailure", [reason]);
	},

	/**
	 * UKADOC capability Notify イベントを送信 (SHIORI 実行初期)
	 * @this {import('./ghost.js').GhostController}
	 */
	async sendCapabilityNotify() {
		if (!isTauriAvailable()) return null;
		// UKADOC capability 準拠の標準対応ヘッダ一覧
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
	 * @this {import('./ghost.js').GhostController}
	 */
	async sendBootNotifyEvents() {
		if (!isTauriAvailable()) return;
		const ghost = this.currentGhost;
		if (!ghost) return;

		console.log("🔔 起動時 NOTIFY イベント送信...");

		// UKADOC capability 通知 (SHIORI 実行の初期に通知される規約)
		await this.sendCapabilityNotify();

		// インストール済みゴースト情報 (Reference*: 1ゴーストにつき1つのReference)
		const ghosts = this.ghosts.length > 0 ? this.ghosts : [ghost];

		await this.sendShioriNotify(
			"installedghostname",
			ghosts.map((g) => g.name),
		);
		await this.sendShioriNotify(
			"installsakuraname",
			ghosts.map((g) => g.sakura_name || g.name),
		);

		const keroNames = ghosts
			.map((g) => g.kero_name)
			.filter((n) => Boolean(n?.trim()));
		if (keroNames.length > 0) {
			await this.sendShioriNotify("installedkeroname", keroNames);
		}

		// 現在のゴーストに同梱のシェル名一覧
		if (this.shells?.length > 0) {
			await this.sendShioriNotify("installedshellname", this.shells);
		}

		// 読み込み可能なゴーストフォルダのフルパス
		const ghostPaths = ghosts.map((g) => g.path).filter((p) => Boolean(p));
		if (ghostPaths.length > 0) {
			await this.sendShioriNotify("ghostpathlist", ghostPaths);
		}

		// インストール済みバルーン情報 (installedballoonname / balloonpathlist)
		const balloonNames =
			this.balloons?.length > 0 ? this.balloons : ["default"];
		await this.sendShioriNotify("installedballoonname", balloonNames);

		const balloonPaths =
			this.balloonPaths?.length > 0
				? this.balloonPaths
				: ["assets/balloon/default"];
		await this.sendShioriNotify("balloonpathlist", balloonPaths);

		// baseware の名前とバージョン
		await this.sendShioriNotify("basewareversion", [
			"Nanai Android Mascot 1.0.0",
		]);

		// uniqueid: ゴーストインストールディレクトリ名を自前IDとする
		const dirName = (ghost.path || "")
			.split(/[\\/]+/)
			.filter(Boolean)
			.pop();
		if (dirName) {
			await this.sendShioriNotify("uniqueid", [dirName]);
		}

		// hwnd / ウィンドウハンドル (Web/Android擬似ハンドル)
		await this.sendShioriNotify("hwnd", [1001, 1002]);

		// プラグイン・拡張情報通知 (installedplugin / pluginpathlist)
		if (this.plugins?.length > 0) {
			await this.sendShioriNotify("installedplugin", this.plugins);
			await this.sendShioriNotify(
				"pluginpathlist",
				this.pluginPaths || this.plugins.map((p) => `plugins/${p}`),
			);
		}

		// ヘッドライン情報通知 (installedheadlinename / headlinepathlist)
		if (this.headlines?.length > 0) {
			await this.sendShioriNotify("installedheadlinename", this.headlines);
			await this.sendShioriNotify(
				"headlinepathlist",
				this.headlinePaths || this.headlines.map((h) => `headlines/${h}`),
			);
		}

		// カレンダープラグイン・スキン情報通知
		if (this.calendarPlugins?.length > 0) {
			await this.sendShioriNotify(
				"installedcalendarpluginname",
				this.calendarPlugins,
			);
			await this.sendShioriNotify(
				"calendarpluginpathlist",
				this.calendarPluginPaths ||
					this.calendarPlugins.map((c) => `calendar/plugins/${c}`),
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
					this.calendarSkins.map((s) => `calendar/skins/${s}`),
			);
		}

		// 他ゴースト・オーナー情報 (otherghostname / ownerghostname)
		const otherGhosts = ghosts.filter((g) => g.name !== ghost.name);
		if (otherGhosts.length > 0) {
			await this.sendShioriNotify(
				"otherghostname",
				otherGhosts.map((g) => g.name),
			);
		}
		await this.sendShioriNotify("ownerghostname", [ghost.name]);

		// BIFF 設定情報 (configuredbiffname)
		await this.sendShioriNotify("configuredbiffname", ["default"]);

		// デバッグ・ログ・使用率情報 (enable_debug / enable_log / rateofusegraph)
		if (this.app?.debugMode) {
			await this.sendShioriNotify("enable_debug", ["1"]);
			await this.sendShioriNotify("enable_log", ["1"]);
		}
		await this.sendShioriNotify("rateofusegraph", ["1"]);

		console.log("🔔 起動時 NOTIFY イベント送信完了");
	},
};
