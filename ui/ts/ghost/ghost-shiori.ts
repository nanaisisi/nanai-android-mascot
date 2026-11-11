/**
 * @file ghost-shiori.ts
 * @brief GhostController 向け SHIORI 初期化・イベント送受信・タイマー管理ロジック
 */

import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { fromRustResponse } from "./shiori-protocol.js";

export interface GhostShioriContext {
	sendShioriEvent: (event: string, refs?: unknown[]) => Promise<unknown>;
	startSecondChangeTimer: () => void;
	stopSecondChangeTimer: () => void;
	_previousGhostName?: string;
	uptimeSeconds?: number;
	_secondTimerId?: ReturnType<typeof setInterval> | null;
	_secondSending?: boolean;
	currentGhost?: { name?: string; path?: string };
	app?: {
		playSakuraScript?: (script: string) => void;
		availablePlugins?: Array<{ name?: string }>;
		sakuraPlayer?: { isPlaying?: boolean };
		[key: string]: unknown;
	};
	[key: string]: unknown;
}

export const ghostShioriMethods = {
	async initializeGhostSHIORI(
		this: GhostShioriContext,
		ghost: { name?: string; path?: string },
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
				type ShioriResponse = {
					status?: number;
					value?: string;
					headers?: { value?: string };
				} | null;
				const prevGhost = this._previousGhostName || "";
				let bootRes: ShioriResponse = null;
				if (prevGhost && prevGhost !== ghost?.name) {
					const res = await this.sendShioriEvent("OnGhostChanged", [
						ghost?.name,
						"manual",
						prevGhost,
					]);
					bootRes = res as ShioriResponse;
				}
				if (!bootRes || bootRes.status === 204 || !bootRes.value) {
					const res = await this.sendShioriEvent("OnBoot");
					bootRes = res as ShioriResponse;
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

	startSecondChangeTimer(this: GhostShioriContext) {
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
				if ((this.uptimeSeconds || 0) % 60 === 0) {
					await this.sendShioriEvent("OnMinuteChange", [
						Math.floor((this.uptimeSeconds || 0) / 60),
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

	stopSecondChangeTimer(this: GhostShioriContext) {
		if (this._secondTimerId) {
			clearInterval(this._secondTimerId);
			this._secondTimerId = null;
		}
		this._secondSending = false;
	},

	async sendShioriEvent(
		this: GhostShioriContext,
		eventId: string,
		references: unknown[] = [],
	) {
		if (!isTauriAvailable()) {
			return undefined;
		}
		try {
			const ghostName = this.currentGhost?.name || "";
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
			return fromRustResponse(rawRes as Record<string, unknown>);
		} catch (err) {
			console.warn(`⚠️ SHIORIイベント送信失敗 (${eventId}):`, err);
			return undefined;
		}
	},

	async sendTeachInput(this: GhostShioriContext, input: string) {
		const resObj = await this.sendShioriEvent("OnTeach", [input]);
		const res = resObj as {
			status?: number;
			value?: string;
			headers?: { value?: string };
		} | null;
		if (res?.status === 200 && res?.value) {
			this.app?.playSakuraScript?.(res.value);
		} else if (res?.status === 311 || res?.status === 312) {
			const adviceResObj = await this.sendShioriEvent("OnAdvice", [
				input,
				res?.value || "",
			]);
			const adviceRes = adviceResObj as {
				status?: number;
				value?: string;
			} | null;
			if (adviceRes?.status === 200 && adviceRes?.value) {
				this.app?.playSakuraScript?.(adviceRes.value);
			}
		}
		return resObj;
	},

	triggerRandomTalk(this: GhostShioriContext) {
		this.sendShioriEvent("OnRandomTalk")
			.then((resObj: unknown) => {
				const res = resObj as {
					status?: number;
					value?: string;
				} | null;
				if (res?.status === 200 && res?.value) {
					this.app?.playSakuraScript?.(res.value);
				}
			})
			.catch(() => {});
	},
};
