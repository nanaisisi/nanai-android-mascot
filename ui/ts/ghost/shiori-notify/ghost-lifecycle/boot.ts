/**
 * @file shiori-notify/ghost-lifecycle/boot.ts
 * @brief 起動時の Capability / Boot 通知
 */

import { isTauriAvailable } from "../../../core/tauri-helper.js";

export interface BootContext {
	sendShioriNotify: (event: string, refs?: unknown[]) => Promise<unknown>;
	sendCapabilityNotify: () => Promise<unknown>;
	currentGhost?: {
		name?: string;
		path?: string;
		sakura_name?: string;
		kero_name?: string;
	};
	ghosts?: Array<{
		name?: string;
		path?: string;
		sakura_name?: string;
		kero_name?: string;
	}>;
	shells?: string[];
	balloons?: string[];
	balloonPaths?: string[];
	plugins?: string[];
	pluginPaths?: string[];
	headlines?: string[];
	headlinePaths?: string[];
	calendarPlugins?: string[];
	calendarPluginPaths?: string[];
	calendarSkins?: string[];
	calendarSkinPaths?: string[];
	app?: { debugMode?: boolean };
	[key: string]: unknown;
}

export const shioriNotifyBoot = {
	/**
	 * UKADOC capability Notify イベントを送信 (SHIORI 実行初期)
	 */
	async sendCapabilityNotify(this: BootContext) {
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
	async sendBootNotifyEvents(this: BootContext) {
		if (!isTauriAvailable()) return;
		const ghost = this.currentGhost;
		if (!ghost) return;

		console.log("🚀 起動時 NOTIFY イベント送信...");

		await this.sendCapabilityNotify();

		const ghosts =
			this.ghosts && this.ghosts.length > 0 ? this.ghosts : [ghost];

		await this.sendShioriNotify(
			"installedghostname",
			ghosts.map((g: { name?: string }) => g.name || ""),
		);
		await this.sendShioriNotify(
			"installedsakuraname",
			ghosts.map(
				(g: { name?: string; sakura_name?: string }) =>
					g.sakura_name || g.name || "",
			),
		);
		// 後方互換性フォールバック（旧コードからの呼出用）
		// Legacy alias for backward compatibility
		await this.sendShioriNotify(
			"installsakuraname",
			ghosts.map(
				(g: { name?: string; sakura_name?: string }) =>
					g.sakura_name || g.name || "",
			),
		);

		const keroNames = ghosts
			.map((g: { kero_name?: string }) => g.kero_name || "")
			.filter((n: string) => Boolean(n?.trim()));
		if (keroNames.length > 0) {
			await this.sendShioriNotify("installedkeroname", keroNames);
		}

		if (this.shells && this.shells.length > 0) {
			await this.sendShioriNotify("installedshellname", this.shells);
		}

		const ghostPaths = ghosts
			.map((g: { path?: string }) => g.path || "")
			.filter((p: string) => Boolean(p));
		if (ghostPaths.length > 0) {
			await this.sendShioriNotify("ghostpathlist", ghostPaths);
		}

		const balloonNames =
			this.balloons && this.balloons.length > 0 ? this.balloons : ["default"];
		await this.sendShioriNotify("installedballoonname", balloonNames);

		const balloonPaths =
			this.balloonPaths && this.balloonPaths.length > 0
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

		if (this.plugins && this.plugins.length > 0) {
			await this.sendShioriNotify("installedplugin", this.plugins);
			await this.sendShioriNotify(
				"pluginpathlist",
				this.pluginPaths || this.plugins.map((p: string) => `plugins/${p}`),
			);
		}

		if (this.headlines && this.headlines.length > 0) {
			await this.sendShioriNotify("installedheadlinename", this.headlines);
			await this.sendShioriNotify(
				"headlinepathlist",
				this.headlinePaths ||
					this.headlines.map((h: string) => `headlines/${h}`),
			);
		}

		if (this.calendarPlugins && this.calendarPlugins.length > 0) {
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
		if (this.calendarSkins && this.calendarSkins.length > 0) {
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

		const otherGhosts = ghosts.filter(
			(g: { name?: string }) => g.name !== ghost.name,
		);
		if (otherGhosts.length > 0) {
			await this.sendShioriNotify(
				"otherghostname",
				otherGhosts.map((g: { name?: string }) => g.name || ""),
			);
		}
		await this.sendShioriNotify("ownerghostname", [ghost.name || ""]);

		await this.sendShioriNotify("configuredbiffname", ["default"]);

		if (this.app?.debugMode) {
			await this.sendShioriNotify("enable_debug", ["1"]);
			await this.sendShioriNotify("enable_log", ["1"]);
		}
		await this.sendShioriNotify("rateofusegraph", ["1"]);

		console.log("✅ 起動時 NOTIFY イベント送信完了");
	},
};
