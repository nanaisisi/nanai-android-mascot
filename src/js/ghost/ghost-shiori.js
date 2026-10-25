import { invoke, isTauriAvailable } from "../core/tauri-helper.js";
import { ShioriProtocol } from "./shiori-protocol.js";

/** SHIORI 通信関連メソッド (GhostController に mixin) */
export const ghostShioriMethods = {
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
      }, 1000);
    } catch (error) {
      console.error("❌ SHIORI初期化エラー:", error);
    }
  },

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
      try {
        response = await invoke("send_shiori_request", { request: requestText });
      } catch (_e) {
        response = await invoke("send_shiori_event", { event: eventName });
      }

      // 200 OK 且つスクリプトが存在する場合のみ再生
      if (response?.trim()) {
        const parsed = ShioriProtocol.parseResponse(response);
        const script = parsed.value || (parsed.status === 200 ? response : "");
        if (script?.trim()) {
          this.app.playSakuraScript(script);
        }
      }
    } catch (error) {
      console.warn(`SHIORIイベント送信失敗 (${eventName}):`, error);
    }
  },

  triggerRandomTalk() {
    // SHIORI の OnRandomTalk / OnSecondChange に委譲
    this.sendShioriEvent("OnRandomTalk");
  },
};
