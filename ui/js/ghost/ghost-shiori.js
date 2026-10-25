import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { ShioriProtocol } from "./shiori-protocol.js";

/** SHIORI 通信関連メソッド (GhostController に mixin) */
export const ghostShioriMethods = {
  /**
   * ゴーストの SHIORI を初期化
   * @this {import('./ghost.js').GhostController}
   * @param {import('./ghost.js').GhostInfo} ghost
   */
  async initializeGhostSHIORI(ghost) {
    if (!isTauriAvailable()) return;
    try {
      console.log(`🎭 SHIORI初期化開始: ${ghost.name}`);
      await invoke("load_ghost", { ghostName: ghost.name });
      setTimeout(async () => {
        try {
          await this.sendShioriEvent("OnBoot");
        } catch (_error) {
          // OnBoot送信失敗時はスキップ
        }
        // 自律タイマー (OnSecondChange) 開始
        this.startSecondChangeTimer();
      }, 1000);
    } catch (error) {
      console.error("❌ SHIORI初期化エラー:", error);
    }
  },

  /**
   * OnSecondChange 定期イベントタイマー (毎秒送信)
   */
  startSecondChangeTimer() {
    this.stopSecondChangeTimer();
    this.uptimeSeconds = 0;

    this._secondTimerId = setInterval(async () => {
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
        await this.sendShioriEvent("OnSecondChange", [
          this.uptimeSeconds,
          0,
          0,
          isMinimized,
          cantTalk,
        ]);
      } catch (_err) {
        // タイマーエラーは無視
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
      console.log(`[Web/Mock] SHIORIイベントスキップ (Tauri未検出): ${eventName}`);
      return;
    }

    try {
      // SHIORI/3.0 標準リクエストの構築
      const requestText = ShioriProtocol.buildRequest(eventName, args);
      console.log(`📤 送信 SHIORI/3.0 リクエスト:\n${requestText}`);

      let response = "";
      const ghostId = this.app.ghostId || "main";
      try {
        response = await invoke("send_shiori_request", { request: requestText, ghostId });
      } catch (_e) {
        response = await invoke("send_shiori_event", { event: eventName, ghostId });
      }

      // 200 OK 且つスクリプトが存在する場合のみ再生
      if (response?.trim()) {
        const parsed = ShioriProtocol.parseResponse(response);
        const script = parsed.value || (parsed.status === 200 ? response : "");
        if (script?.trim()) {
          this.app.playSakuraScript(script);
        }
        return { response, script, status: parsed.status };
      }
      return null;
    } catch (error) {
      console.warn(`SHIORIイベント送信失敗 (${eventName}):`, error);
      return null;
    }
  },

  triggerRandomTalk() {
    // SHIORI の OnRandomTalk / OnSecondChange に委譲
    this.sendShioriEvent("OnRandomTalk");
  },
};
