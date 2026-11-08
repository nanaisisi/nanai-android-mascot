import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { fromRustResponse } from "./shiori-protocol.js";

export const ghostShioriMethods = {
	async initializeGhostSHIORI(
		ghost: unknown,
		readinessGatePromise: Promise<unknown> | null = null,
		isCurrentLoad: () => boolean = () => true,
	) {
		if (!isTauriAvailable()) return;
		try {
			await invoke("load_ghost", {
				ghostName: ghost.name,
				ghostPath: ghost.path,
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
				const prevGhost = (this as unknown)._previousGhostName || "";
				let bootRes: unknown = null;
				if (prevGhost && prevGhost !== ghost.name) {
					bootRes = await (this as unknown).sendShioriEvent("OnGhostChanged", [
						ghost.name,
						"manual",
						prevGhost,
					]);
				}
				if (!bootRes || bootRes.status === 204 || !bootRes.value) {
					bootRes = await (this as unknown).sendShioriEvent("OnBoot");
				}
				(this as unknown)._previousGhostName = ghost.name;
				const scriptText = bootRes?.value || bootRes?.headers?.value;
				if (bootRes?.status === 200 && scriptText) {
					(this as unknown).app?.playSakuraScript?.(scriptText);
				}
				if ((this as unknown).app?.availablePlugins && isTauriAvailable()) {
					for (const plugin of (this as unknown).app.availablePlugins) {
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

			(this as unknown).startSecondChangeTimer();
		} catch (error) {
			console.error("❌ SHIORI初期化エラー:", error);
			if (isCurrentLoad()) {
				invoke("hide_loading_banner_window").catch(() => {});
			}
		}
	},

	startSecondChangeTimer() {
		(this as unknown).stopSecondChangeTimer();
		(this as unknown).uptimeSeconds = 0;

		(this as unknown)._secondTimerId = setInterval(async () => {
			if ((this as unknown)._secondSending) return;
			(this as unknown)._secondSending = true;
			(this as unknown).uptimeSeconds++;
			const isSpeaking = (this as unknown).app.sakuraPlayer?.isPlaying ? 1 : 0;
			const isMinimized = 0;
			const cantTalk = isSpeaking;

			try {
				if ((this as unknown).uptimeSeconds % 60 === 0) {
					await (this as unknown).sendShioriEvent("OnMinuteChange", [
						Math.floor((this as unknown).uptimeSeconds / 60),
						0,
						0,
						isMinimized,
						cantTalk,
					]);
				}
				await (this as unknown).sendShioriEvent("OnSecondChange", [
					(this as unknown).uptimeSeconds,
					0,
					0,
					isMinimized,
					cantTalk,
				]);
			} catch (_e) {
			} finally {
				(this as unknown)._secondSending = false;
			}
		}, 1000);
	},

	stopSecondChangeTimer() {
		if ((this as unknown)._secondTimerId) {
			clearInterval((this as unknown)._secondTimerId);
			(this as unknown)._secondTimerId = null;
		}
		(this as unknown)._secondSending = false;
	},

	async sendShioriEvent(eventId: string, references: unknown[] = []) {
		if (!isTauriAvailable()) {
			return undefined;
		}
		try {
			const ghostName = (this as unknown).currentGhost?.name || "";
			let rawRes: unknown = null;
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
			return fromRustResponse(rawRes);
		} catch (err) {
			console.warn(`⚠️ SHIORIイベント送信失敗 (${eventId}):`, err);
			return undefined;
		}
	},

	async sendTeachInput(this: unknown, input: string) {
		const res: unknown = await this.sendShioriEvent("OnTeach", [input]);
		if (res?.status === 200 && res?.value) {
			this.app?.playSakuraScript?.(res.value);
		} else if (res?.status === 311 || res?.status === 312) {
			const adviceRes: unknown = await this.sendShioriEvent("OnAdvice", [
				input,
				res.value || "",
			]);
			if (adviceRes?.status === 200 && adviceRes?.value) {
				this.app?.playSakuraScript?.(adviceRes.value);
			}
		}
		return res;
	},

	triggerRandomTalk(this: unknown) {
		this.sendShioriEvent("OnRandomTalk")
			.then((res: unknown) => {
				if (res?.status === 200 && res?.value) {
					this.app?.playSakuraScript?.(res.value);
				}
			})
			.catch(() => {});
	},
};
