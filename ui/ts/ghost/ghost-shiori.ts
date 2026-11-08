import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { fromRustResponse } from "./shiori-protocol.js";

export const ghostShioriMethods = {
	async initializeGhostSHIORI(
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		ghost: any,
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		readinessGatePromise: Promise<any> | null = null,
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
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				const prevGhost = (this as any)._previousGhostName || "";
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				let bootRes: any = null;
				if (prevGhost && prevGhost !== ghost.name) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					bootRes = await (this as any).sendShioriEvent("OnGhostChanged", [
						ghost.name,
						"manual",
						prevGhost,
					]);
				}
				if (!bootRes || bootRes.status === 204 || !bootRes.value) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					bootRes = await (this as any).sendShioriEvent("OnBoot");
				}
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any)._previousGhostName = ghost.name;
				const scriptText = bootRes?.value || bootRes?.headers?.value;
				if (bootRes?.status === 200 && scriptText) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(this as any).app?.playSakuraScript?.(scriptText);
				}
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				if ((this as any).app?.availablePlugins && isTauriAvailable()) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
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

			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).startSecondChangeTimer();
		} catch (error) {
			console.error("❌ SHIORI初期化エラー:", error);
			if (isCurrentLoad()) {
				invoke("hide_loading_banner_window").catch(() => {});
			}
		}
	},

	startSecondChangeTimer() {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).stopSecondChangeTimer();
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any).uptimeSeconds = 0;

		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any)._secondTimerId = setInterval(async () => {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			if ((this as any)._secondSending) return;
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any)._secondSending = true;
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).uptimeSeconds++;
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const isSpeaking = (this as any).app.sakuraPlayer?.isPlaying ? 1 : 0;
			const isMinimized = 0;
			const cantTalk = isSpeaking;

			try {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				if ((this as any).uptimeSeconds % 60 === 0) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					await (this as any).sendShioriEvent("OnMinuteChange", [
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						Math.floor((this as any).uptimeSeconds / 60),
						0,
						0,
						isMinimized,
						cantTalk,
					]);
				}
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				await (this as any).sendShioriEvent("OnSecondChange", [
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(this as any).uptimeSeconds,
					0,
					0,
					isMinimized,
					cantTalk,
				]);
			} catch (_e) {
			} finally {
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any)._secondSending = false;
			}
		}, 1000);
	},

	stopSecondChangeTimer() {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if ((this as any)._secondTimerId) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			clearInterval((this as any)._secondTimerId);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any)._secondTimerId = null;
		}
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any)._secondSending = false;
	},

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	async sendShioriEvent(eventId: string, references: any[] = []) {
		if (!isTauriAvailable()) {
			return undefined;
		}
		try {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const ghostName = (this as any).currentGhost?.name || "";
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
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
			return fromRustResponse(rawRes);
		} catch (err) {
			console.warn(`⚠️ SHIORIイベント送信失敗 (${eventId}):`, err);
			return undefined;
		}
	},

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	async sendTeachInput(this: any, input: string) {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const res: any = await this.sendShioriEvent("OnTeach", [input]);
		if (res?.status === 200 && res?.value) {
			this.app?.playSakuraScript?.(res.value);
		} else if (res?.status === 311 || res?.status === 312) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
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

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	triggerRandomTalk(this: any) {
		this.sendShioriEvent("OnRandomTalk")
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			.then((res: any) => {
				if (res?.status === 200 && res?.value) {
					this.app?.playSakuraScript?.(res.value);
				}
			})
			.catch(() => {});
	},
};
