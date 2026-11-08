import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { fromRustResponse } from "./shiori-protocol.js";

export const ghostShioriMethods = {
	async initializeGhostSHIORI(
<<<<<<< HEAD
		ghost: unknown,
		readinessGatePromise: Promise<unknown> | null = null,
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		ghost: any,
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		readinessGatePromise: Promise<any> | null = null,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
<<<<<<< HEAD
				const prevGhost = (this as unknown)._previousGhostName || "";
				let bootRes: unknown = null;
				if (prevGhost && prevGhost !== ghost.name) {
					bootRes = await (this as unknown).sendShioriEvent("OnGhostChanged", [
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				const prevGhost = (this as any)._previousGhostName || "";
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				let bootRes: any = null;
				if (prevGhost && prevGhost !== ghost.name) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					bootRes = await (this as any).sendShioriEvent("OnGhostChanged", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
						ghost.name,
						"manual",
						prevGhost,
					]);
				}
				if (!bootRes || bootRes.status === 204 || !bootRes.value) {
<<<<<<< HEAD
					bootRes = await (this as unknown).sendShioriEvent("OnBoot");
				}
				(this as unknown)._previousGhostName = ghost.name;
				const scriptText = bootRes?.value || bootRes?.headers?.value;
				if (bootRes?.status === 200 && scriptText) {
					(this _as _unknown).app?.playSakuraScript?.(scriptText);
				}
				if ((this as unknown).app?.availablePlugins && isTauriAvailable()) {
					for (const _plugin _of (this _as _unknown).app.availablePlugins) {
=======
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					bootRes = await (this as any).sendShioriEvent("OnBoot");
				}
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any)._previousGhostName = ghost.name;
				const scriptText = bootRes?.value || bootRes?.headers?.value;
				if (bootRes?.status === 200 && scriptText) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(this _as _any).app?.playSakuraScript?.(scriptText);
				}
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				if ((this as any).app?.availablePlugins && isTauriAvailable()) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					for (const _plugin _of (this _as _any).app.availablePlugins) {
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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

<<<<<<< HEAD
			(this as unknown).startSecondChangeTimer();
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any).startSecondChangeTimer();
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		} catch (error) {
			console.error("❌ SHIORI初期化エラー:", error);
			if (isCurrentLoad()) {
				invoke("hide_loading_banner_window").catch(() => {});
			}
		}
	},

	startSecondChangeTimer() 
<<<<<<< HEAD
		(this as unknown).stopSecondChangeTimer();
		(this as unknown).uptimeSeconds = 0;

		(this as unknown)._secondTimerId = setInterval(async () => {
			if ((this as unknown)._secondSending) return;
			(this as unknown)._secondSending = true;
			(this as unknown).uptimeSeconds++;
			const _isSpeaking = (this as unknown).app.sakuraPlayer?.isPlaying ? 1 : 0;
=======
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
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			const isMinimized = 0;
			const cantTalk = isSpeaking;

			try {
<<<<<<< HEAD
				if ((this as unknown).uptimeSeconds % 60 === 0) {
					await (this as unknown).sendShioriEvent("OnMinuteChange", [
						Math.floor((this as unknown).uptimeSeconds / 60),
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				if ((this as any).uptimeSeconds % 60 === 0) {
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					await (this _as _any).sendShioriEvent("OnMinuteChange", [
						// biome-ignore lint/suspicious/noExplicitAny: automated fix
						Math.floor((this as any).uptimeSeconds / 60),
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
						0,
						0,
						isMinimized,
						cantTalk,
					]);
				}
<<<<<<< HEAD
				await (this as unknown).sendShioriEvent("OnSecondChange", [
					(this as unknown).uptimeSeconds,
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				await (this as any).sendShioriEvent("OnSecondChange", [
					// biome-ignore lint/suspicious/noExplicitAny: automated fix
					(this as any).uptimeSeconds,
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
					0,
					0,
					isMinimized,
					cantTalk,
				]);
			} catch (_e) {
			} finally {
<<<<<<< HEAD
				(this as unknown)._secondSending = false;
=======
				// biome-ignore lint/suspicious/noExplicitAny: automated fix
				(this as any)._secondSending = false;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
			}
		}, 1000);
	},

	stopSecondChangeTimer() {
<<<<<<< HEAD
		if ((this as unknown)._secondTimerId) {
			clearInterval((this as unknown)._secondTimerId);
			(this as unknown)._secondTimerId = null;
		}
		(this as unknown)._secondSending = false;,

	async sendShioriEvent(eventId: string, references: unknown[] = []) 
=======
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		if ((this as any)._secondTimerId) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			clearInterval((this as any)._secondTimerId);
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			(this as any)._secondTimerId = null;
		}
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		(this as any)._secondSending = false;,

	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	async sendShioriEvent(eventId: string, references: any[] = []) 
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
		if (!isTauriAvailable()) {
			return undefined;
		}
		try {
<<<<<<< HEAD
			const _ghostName = (this as unknown).currentGhost?.name || "";
			const _rawRes: unknown = null;
=======
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const ghostName = (this as any).currentGhost?.name || "";
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			let rawRes: any = null;
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
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
		},

<<<<<<< HEAD
	async sendTeachInput(this: unknown, input: string) {
		const res: unknown = await this.sendShioriEvent("OnTeach", [input]);
		if (res?.status === 200 && res?.value) {
			this.app?.playSakuraScript?.(res.value);
		} else if (res?.status === 311 || res?.status === 312) {
			const adviceRes: unknown = await this.sendShioriEvent("OnAdvice", [
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	async sendTeachInput(this: any, input: string) {
		// biome-ignore lint/suspicious/noExplicitAny: automated fix
		const res: any = await this.sendShioriEvent("OnTeach", [input]);
		if (res?.status === 200 && res?.value) {
			this.app?.playSakuraScript?.(res.value);
		} else if (res?.status === 311 || res?.status === 312) {
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			const adviceRes: any = await this.sendShioriEvent("OnAdvice", [
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				input,
				res.value || "",
			]);
			if (adviceRes?.status === 200 && adviceRes?.value) {
				this.app?.playSakuraScript?.(adviceRes.value);
			}
		}
		return res;
	},

<<<<<<< HEAD
	triggerRandomTalk(this: unknown) {
		this.sendShioriEvent("OnRandomTalk")
			.then((_res: unknown) => {
=======
	// biome-ignore lint/suspicious/noExplicitAny: automated fix
	triggerRandomTalk(this: any) 
		this.sendShioriEvent("OnRandomTalk")
			// biome-ignore lint/suspicious/noExplicitAny: automated fix
			.then((res: any) => 
>>>>>>> 9f506b10bbfe35f95183db82ba6758cd062aa2ad
				if (res?.status === 200 && res?.value) {
					this.app?.playSakuraScript?.(res.value);
				})
			.catch(() => );,
};
