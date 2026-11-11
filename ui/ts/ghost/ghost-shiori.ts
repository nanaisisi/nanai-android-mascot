import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { fromRustResponse } from "./shiori-protocol.js";

export const ghostShioriMethods = {
	async initializeGhostSHIORI(
		this: any,
		ghost: any,
		readinessGatePromise: Promise<unknown> | null = null,
		isCurrentLoad: () => boolean = () => true,
	) {
		if (!isTauriAvailable()) return;
		try {
			await invoke("load_ghost", {
				ghostName: ghost?.name,
				ghostPath: ghost?.path,
			});
			if (!isCurrentLoad()) return;

			try {
				await invoke("hide_loading_banner_window");
			} catch (_e) {}
			if (!isCurrentLoad()) return;

			if (readinessGatePromise) {
				await readinessGatePromise;
			}
			if (!isCurrentLoad()) return;

			try {
				const prevGhost = this._previousGhostName || "";
				let bootRes: any = null;
				if (prevGhost && prevGhost !== ghost?.name) {
					bootRes = await this.sendShioriEvent("OnGhostChanged", [
						ghost?.name,
						"manual",
						prevGhost,
					]);
				}
				if (!bootRes || bootRes.status === 204 || !bootRes.value) {
					bootRes = await this.sendShioriEvent("OnBoot");
				}
				this._previousGhostName = ghost?.name;
				const scriptText = bootRes?.value || bootRes?.headers?.value;
				if (bootRes?.status === 200 && scriptText) {
					this.app?.playSakuraScript?.(scriptText);
				}
				if (this.app?.availablePlugins && isTauriAvailable()) {
					for (const plugin of this.app.availablePlugins) {
						invoke("execute_plugin_event", {
							request: {
								pluginName: plugin.name,
								eventId: "OnGhostBoot",
								references: [ghost?.name],
							},
						}).catch(() => {});
					}
				}
			} catch (_error) {}

			this.startSecondChangeTimer();
		} catch (error) {
			console.error("❌ SHIORI初期化エラー:", error);
			if (isCurrentLoad()) {
				invoke("hide_loading_banner_window").catch(() => {});
			}
		}
	},

	startSecondChangeTimer(this: any) {
		this.stopSecondChangeTimer();
		this.uptimeSeconds = 0;

		this._secondTimerId = setInterval(async () => {
			if (this._secondSending) return;
			this._secondSending = true;
			this.uptimeSeconds = (this.uptimeSeconds || 0) + 1;
			const isSpeaking = this.app?.sakuraPlayer?.isPlaying ? 1 : 0;
			const isMinimized = 0;
			const cantTalk = isSpeaking;

			try {
				if (this.uptimeSeconds % 60 === 0) {
					await this.sendShioriEvent("OnMinuteChange", [
						Math.floor(this.uptimeSeconds / 60),
						0,
						0,
						isMinimized,
						cantTalk,
					]);
				}
				await this.sendShioriEvent("OnSecondChange", [
					this.uptimeSeconds,
					0,
					0,
					isMinimized,
					cantTalk,
				]);
			} catch (_e) {
			} finally {
				this._secondSending = false;
			}
		}, 1000);
	},

	stopSecondChangeTimer(this: any) {
		if (this._secondTimerId) {
			clearInterval(this._secondTimerId);
			this._secondTimerId = null;
		}
		this._secondSending = false;
	},

	async sendShioriEvent(
		this: any,
		eventId: string,
		references: unknown[] = [],
	) {
		if (!isTauriAvailable()) {
			return undefined;
		}
		try {
			const ghostName = this.currentGhost?.name || "";
			let rawRes: any = null;
			try {
				rawRes = await invoke("send_shiori_event_typed", {
					event: eventId,
					references: references.map(String),
					ghostName,
				});
			} catch (_e) {
				rawRes = await invoke("request_shiori", {
					request: {
						id: eventId,
						sender: "NanaiAndroidMascot",
						references: references.map(String),
						securityOrigin: "Local",
						ghostName,
					},
				});
			}
			return fromRustResponse(rawRes as Record<string, unknown>);
		} catch (err) {
			console.warn(`⚠️ SHIORIイベント送信失敗 (${eventId}):`, err);
			return undefined;
		}
	},

	async sendTeachInput(this: any, input: string) {
		const res: any = await this.sendShioriEvent("OnTeach", [input]);
		if (res?.status === 200 && res?.value) {
			this.app?.playSakuraScript?.(res.value);
		} else if (res?.status === 311 || res?.status === 312) {
			const adviceRes: any = await this.sendShioriEvent("OnAdvice", [
				input,
				res.value || "",
			]);
			if (adviceRes?.status === 200 && adviceRes?.value) {
				this.app?.playSakuraScript?.(adviceRes.value);
			}
		}
		return res;
	},

	triggerRandomTalk(this: any) {
		this.sendShioriEvent("OnRandomTalk")
			.then((res: any) => {
				if (res?.status === 200 && res?.value) {
					this.app?.playSakuraScript?.(res.value);
				}
			})
			.catch(() => {});
	},
};
