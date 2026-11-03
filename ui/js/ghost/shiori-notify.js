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
 * - basewareversion / uniqueid
 * - OnNotifyOSInfo, OnNotifySelfInfo, OnNotifyBalloonInfo
 * - OnBalloonBreak, OnBalloonClose, OnBalloonTimeout (バルーン操作イベント)
 * - OnBalloonChange, OnBasewareUpdated, OnBasewareUpdating, OnBoot, OnCacheRestore, OnCacheSuspend
 * - OnClose, OnCloseAll, OnDestroy, OnDressupChanged, OnFirstBoot, OnFullScreenAppMinimize
 * - OnFullScreenAppRestore, OnGhostCallComplete, OnGhostCalled, OnGhostCalling, OnGhostChanged, OnGhostChanging
 * - OnInitialize, OnOtherGhostBooted, OnOtherGhostChanged, OnOtherGhostClosed, OnShellChanged, OnShellChanging
 * - OnSysResume, OnSysSuspend, OnVirtualDesktopChanged, OnWindowStateMinimize, OnWindowStateRestore
 * - OnSchedule5MinutesToGo, OnSchedulepostBegin, OnSchedulepostComplete, OnScheduleRead
 * - OnSchedulesenseBegin, OnSchedulesenseComplete, OnSchedulesenseFailure, OnScheduleTodayNotify
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

		console.log("🔔 起動時 NOTIFY イベント送信完了");
	},
};
