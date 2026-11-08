/**
 * @file shiori-notify/ghost-lifecycle.ts
 * @brief ゴースト起動・切替・呼び出し・規約ダイアログ等のライフサイクル通知
 */

import { isTauriAvailable } from "../../core/tauri-helper.js";

export const shioriNotifyGhostLifecycle = {

	/**
	 * ゴースト・シェル切替およびライフサイクル通知 (UKADOC boot-close-change)
	 */
	async notifyGhostLifecycle(
		this: unknown,
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
		this: unknown,
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
	 * 利用規約・ダイアログ通知 (UKADOC dialogbox)
	 */
	async notifyTermsDialogEvent(
		this: unknown,
		event: "OnGhostTermsAccept" | "OnGhostTermsDecline" | string,
		references: Array<string | number> = [],
	) {
		return await this.sendShioriNotify(event, references);
	},

	/**
	 * UKADOC capability Notify イベントを送信 (SHIORI 実行初期)
	 */
	async sendCapabilityNotify(this: unknown) {
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
	async sendBootNotifyEvents(this: unknown) {
		if (!isTauriAvailable()) return;
		const ghost = this.currentGhost;
		if (!ghost) return;

		console.log("🚀 起動時 NOTIFY イベント送信...");

		await this.sendCapabilityNotify();

		const ghosts = this.ghosts?.length > 0 ? this.ghosts : [ghost];

		await this.sendShioriNotify(
			"installedghostname",
			ghosts.map((g: unknown) => g.name),
		);
		await this.sendShioriNotify(
			"installedsakuraname",
			ghosts.map((g: unknown) => g.sakura_name || g.name),
		);
		// 後方互換性フォールバック（旧コードからの呼出用）
		// Legacy alias for backward compatibility
		await this.sendShioriNotify(
			"installsakuraname",
			ghosts.map((g: unknown) => g.sakura_name || g.name),
		);

		const keroNames = ghosts
			.map((g: unknown) => g.kero_name)
			.filter((n: string) => Boolean(n?.trim()));
		if (keroNames.length > 0) {
			await this.sendShioriNotify("installedkeroname", keroNames);
		}

		if (this.shells?.length > 0) {
			await this.sendShioriNotify("installedshellname", this.shells);
		}

		const ghostPaths = ghosts
			.map((g: unknown) => g.path)
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

		const otherGhosts = ghosts.filter((g: unknown) => g.name !== ghost.name);
		if (otherGhosts.length > 0) {
			await this.sendShioriNotify(
				"otherghostname",
				otherGhosts.map((g: unknown) => g.name),
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
	 * 利用条件受諾通知 (OnGhostTermsAccept) を送信 (UKADOC 規格準拠)
	 */
	async sendGhostTermsAcceptNotify(this: unknown, id: string = "") {
		return await this.sendShioriNotify("OnGhostTermsAccept", id ? [id] : []);
	},

	/**
	 * 利用条件拒否通知 (OnGhostTermsDecline) を送信 (UKADOC 規格準拠)
	 */
	async sendGhostTermsDeclineNotify(this: unknown, id: string = "") {
		return await this.sendShioriNotify("OnGhostTermsDecline", id ? [id] : []);
	},

	/**
	 * ダイアログ関連 SHIORI イベント通知 (UKADOC dialogbox spec)
	 */
	async sendGhostTermsAccept(this: unknown, ghostName: string) {
		return await this.sendShioriNotify("OnGhostTermsAccept", [ghostName]);
	},

	async sendGhostTermsDecline(this: unknown, ghostName: string) {
		return await this.sendShioriNotify("OnGhostTermsDecline", [ghostName]);
	},

	/**
	 * ゴースト切替・シェル切替・システムライフサイクル通知 (UKADOC boot-close-change spec)
	 */
	async sendGhostChanging(
		this: unknown,
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

	async sendGhostChanged(
		this: unknown,
		toGhost: string,
		fromGhost: string = "",
	) {
		return await this.sendShioriNotify("OnGhostChanged", [toGhost, fromGhost]);
	},

	async sendShellChanged(
		this: unknown,
		toShell: string,
		fromShell: string = "",
	) {
		return await this.sendShioriNotify("OnShellChanged", [toShell, fromShell]);
	},

	async sendCloseAll(this: unknown, reason: string = "user") {
		return await this.sendShioriNotify("OnCloseAll", [reason]);
	},

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
