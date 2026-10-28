import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { fromRustResponse } from "./shiori-protocol.js";

/** SHIORI 通信関連メソッド (GhostController に mixin) */
export const ghostShioriMethods = {
	/**
	 * ゴーストの SHIORI を初期化
	 * @this {import('./ghost.js').GhostController}
	 * @param {import('./ghost.js').GhostInfo} ghost
	 */
	async initializeGhostSHIORI(
		ghost,
		readinessGatePromise = null,
		isCurrentLoad = () => true,
	) {
		if (!isTauriAvailable()) return;
		try {
			// SHIORI DLLのロードと、シェルの初期サーフィス/マニフェスト準備完了を並行待機
			await Promise.all([
				invoke("load_ghost", {
					ghostName: ghost.name,
					ghostPath: ghost.path,
				}),
				readinessGatePromise,
			]);
			if (!isCurrentLoad()) return;

			// 初期化完了に伴い処理中バナーを閉じる（閉じ終わるまで会話を始めない）
			try {
				await invoke("hide_loading_banner_window");
			} catch (_e) {
				// バナーウィンドウが存在しない、または非表示済みの場合は無視
			}
			if (!isCurrentLoad()) return;

			console.log(`✨ アセット・SHIORI準備完了 (ゲート通過): OnBoot発行`);
			try {
				await this.sendShioriEvent("OnBoot");
			} catch (_error) {
				// OnBoot送信失敗時はスキップ
			}

			// 自律タイマー (OnSecondChange) 開始
			this.startSecondChangeTimer();
		} catch (error) {
			console.error("❌ SHIORI初期化エラー:", error);
			if (isCurrentLoad()) {
				invoke("hide_loading_banner_window").catch(() => {});
			}
		}
	},

	/**
	 * OnSecondChange 定期イベントタイマー (毎秒送信)
	 */
	startSecondChangeTimer() {
		this.stopSecondChangeTimer();
		this.uptimeSeconds = 0;

		this._secondTimerId = setInterval(async () => {
			if (this._secondSending) return;
			this._secondSending = true;
			this.uptimeSeconds++;
			// 発話中またはウィンドウ最小化中などの判定
			const isSpeaking = this.app.sakuraPlayer?.isPlaying ? 1 : 0;
			const isMinimized = 0;
			const cantTalk = isSpeaking;

			// 毎秒 SHIORI に通知
			// Reference0: 稼働秒数
			// Reference1: 見切れ・重なり (0: 正常)
			// Reference2: 放置状態 (0: 通常)
			// Reference3: 最小化フラグ (0: 通常)
			// Reference4: 発話不可フラグ (0: 発話可能, 1: 発話中等)
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
			} catch (_err) {
				// タイマーエラーは無視
			} finally {
				this._secondSending = false;
			}
		}, 1000);
	},

	/**
	 * OnSecondChange 定期タイマー停止
	 */
	stopSecondChangeTimer() {
		if (this._secondTimerId) {
			clearInterval(this._secondTimerId);
			this._secondTimerId = null;
		}
	},

	/**
	 * SHIORI イベントを送信
	 * @this {import('./ghost.js').GhostController}
	 * @param {string} eventName
	 * @param {any[]} [args]
	 */
	async sendShioriEvent(eventName, args = []) {
		if (!isTauriAvailable()) {
			console.log(
				`[Web/Mock] SHIORIイベントスキップ (Tauri未検出): ${eventName}`,
			);
			return;
		}

		try {
			const ghostId = this.app.ghostId || "main";

			// Rust 解析済みレスポンス（ukadoc-spec 準拠 ShioriRequest/Response モデル）に一本化
			// Reference は SHIORI/3.0 プロトコル上すべて文字列のため文字列化する
			const typed = await invoke("send_shiori_event_typed", {
				event: eventName,
				args: (args ?? []).map((value) => String(value)),
				ghostId,
			});
			const parsed = fromRustResponse(typed);
			console.log(
				`📥 SHIORI レスポンス (${eventName}): status=${parsed.status}, value length=${parsed.value?.length ?? 0}`,
			);
			if (parsed.status === 200) {
				const script = parsed.value;
				if (script?.trim()) {
					this.app.playSakuraScript(script);
				}
				return {
					response: "",
					script: script ?? "",
					status: parsed.status,
				};
			}
			if (parsed.status === 311 || parsed.status === 312) {
				// Teach 追加入力要求（ukadoc: 311 Not Enough / 312 Advice）→
				// TeachBox を再オープンして OnTeach ループへ
				this.app.sakuraPlayer?.commandHandler?.openTeachBox([], {
					notifyStart: false,
				});
			}
			return { response: "", script: "", status: parsed.status };
		} catch (error) {
			console.warn(`SHIORIイベント送信失敗 (${eventName}):`, error);
			return null;
		}
	},

	triggerRandomTalk() {
		// SHIORI の OnRandomTalk / OnSecondChange に委譲
		this.sendShioriEvent("OnRandomTalk");
	},

	/**
	 * TeachBox 入力の送信（OnTeach + 311/312 再入ループ, UKADOC準拠）
	 *
	 * 200: 履歴クリア・完了 / 311 (Not Enough): 履歴保持で再オープン /
	 * 312 (Advice): 直近入力を破棄して再オープン / 400・500: 履歴クリア
	 * @param {string} value - 新規入力
	 */
	async sendTeachInput(value) {
		if (!isTauriAvailable()) return;

		/** @type {string[]} */
		const history = [...(this._teachHistory ?? []), value];
		this._teachHistory = history;

		const ghostId = this.app.ghostId || "main";
		try {
			const typed = await invoke("send_shiori_event_typed", {
				event: "OnTeach",
				args: history,
				ghostId,
			});
			const parsed = fromRustResponse(typed);
			const code = parsed?.status ?? 0;

			switch (code) {
				case 311: {
					// Not Enough: さらなる追加情報が必要 → 履歴を保持して再オープン
					this.app.sakuraPlayer?.commandHandler?.openTeachBox([], {
						notifyStart: false,
					});
					break;
				}
				case 312: {
					// Advice: 直近の入力が解釈不能 → 破棄して再オープン
					this._teachHistory = history.slice(0, -1);
					this.app.sakuraPlayer?.commandHandler?.openTeachBox([], {
						notifyStart: false,
					});
					break;
				}
				case 400:
				case 500: {
					this.clearTeachHistory();
					break;
				}
				default: {
					// 200 / 204 等: teach セッション完了
					this.clearTeachHistory();
					if (parsed?.value?.trim()) {
						this.app.playSakuraScript(parsed.value);
					}
				}
			}
			return code;
		} catch (error) {
			console.warn("OnTeach 送信失敗:", error);
			this.clearTeachHistory();
			return null;
		}
	},

	/**
	 * Teach 入力履歴のクリア（テキスト完了・キャンセル・エラー時）
	 */
	clearTeachHistory() {
		this._teachHistory = [];
	},
};
