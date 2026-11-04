import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { fromRustResponse } from "./shiori-protocol.js";

export const ghostShioriMethods = {
	async initializeGhostSHIORI(
		ghost: any,
		readinessGatePromise: Promise<any> | null = null,
		isCurrentLoad: () => boolean = () => true,
	) {
		if (!isTauriAvailable()) return;
		try {
			await Promise.all([
				invoke("load_ghost", {
					ghostName: ghost.name,
					ghostPath: ghost.path,
				}),
				readinessGatePromise,
			]);
			if (!isCurrentLoad()) return;

			try {
				await invoke("hide_loading_banner_window");
			} catch (_e) {}
			if (!isCurrentLoad()) return;

			try {
				await (this as any).sendShioriEvent("OnBoot");
				if ((this as any).app?.availablePlugins && isTauriAvailable()) {
					for (const plugin of (this as any).app.availablePlugins) {
						invoke("execute_plugin_event", {
							request: {
								pluginName: plugin.name,
								eventId: "OnGhostBoot",
								references: [ghost.name],
							},
						}).catch(() => {});
					}
				}
			} catch (_error) {}

			(this as any).startSecondChangeTimer();
		} catch (error) {
			console.error("❌ SHIORI初期化エラー:", error);
			if (isCurrentLoad()) {
				invoke("hide_loading_banner_window").catch(() => {});
			}
		}
	},

	startSecondChangeTimer() {
		(this as any).stopSecondChangeTimer();
		(this as any).uptimeSeconds = 0;

		(this as any)._secondTimerId = setInterval(async () => {
			if ((this as any)._secondSending) return;
			(this as any)._secondSending = true;
			(this as any).uptimeSeconds++;
			const isSpeaking = (this as any).app.sakuraPlayer?.isPlaying ? 1 : 0;
			const isMinimized = 0;
			const cantTalk = isSpeaking;

			try {
				if ((this as any).uptimeSeconds % 60 === 0) {
					await (this as any).sendShioriEvent("OnMinuteChange", [
						Math.floor((this as any).uptimeSeconds / 60),
						0,
						0,
						isMinimized,
						cantTalk,
					]);
				}
				await (this as any).sendShioriEvent("OnSecondChange", [
					(this as any).uptimeSeconds,
					0,
					0,
					isMinimized,
					cantTalk,
				]);
			} catch (_e) {} finally {
				(this as any)._secondSending = false;
			}
		}, 1000);
	},

	stopSecondChangeTimer() {
		if ((this as any)._secondTimerId) {
			clearInterval((this as any)._secondTimerId);
			(this as any)._secondTimerId = null;
		}
		(this as any)._secondSending = false;
	},

	async sendShioriEvent(eventId: string, references: any[] = []) {
		if (!isTauriAvailable()) {
			return { script: "" };
		}
		try {
			const ghostName = (this as any).currentGhost?.name || "";
			const rawRes: any = await invoke("request_shiori", {
				request: {
					id: eventId,
					sender: "NanaiAndroidMascot",
					references: references.map(String),
					securityOrigin: "Local",
					ghostName,
				},
			});
			return fromRustResponse(rawRes);
		} catch (err) {
			console.warn(`⚠️ SHIORIイベント送信失敗 (${eventId}):`, err);
			return { script: "" };
		}
	},
};
