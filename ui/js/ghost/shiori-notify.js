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
 * - basewareversion / uniqueid
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
	 * 起動時通知一式を送信 (SHIORI ロード後 / OnBoot 後に呼ぶ)
	 * @this {import('./ghost.js').GhostController}
	 */
	async sendBootNotifyEvents() {
		if (!isTauriAvailable()) return;
		const ghost = this.currentGhost;
		if (!ghost) return;

		console.log("🔔 起動時 NOTIFY イベント送信...");

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
