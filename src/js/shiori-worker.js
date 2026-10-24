/**
 * Nanai Android Mascot - Web Worker SHIORI サンドボックス
 * UIのメインスレッドをブロックせずに辞書スクリプトやWASM SHIORIを実行する非同期ワーカー
 */

let shioriModule = null;
let isLoaded = false;

// メインスレッドからのメッセージ待受
self.addEventListener("message", async (e) => {
  const { type, id, payload } = e.data || {};

  switch (type) {
    case "LOAD":
      try {
        // 将来的な WASM / C++ SHIORI バイナリのロード
        if (payload?.wasmUrl) {
          // const wasmResponse = await fetch(payload.wasmUrl);
          // const wasmBuffer = await wasmResponse.arrayBuffer();
          // shioriModule = await WebAssembly.instantiate(wasmBuffer, {});
        }
        isLoaded = true;
        self.postMessage({ type: "LOAD_RESULT", id, success: true });
      } catch (err) {
        self.postMessage({ type: "LOAD_RESULT", id, success: false, error: err.message });
      }
      break;

    case "REQUEST":
      try {
        if (!isLoaded) {
          self.postMessage({
            type: "REQUEST_RESULT",
            id,
            response: "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n",
          });
          return;
        }

        // WASM / JS SHIORI ハンドラによるリクエスト処理
        const requestText = payload?.request || "";
        const responseText = processShioriRequest(requestText);

        self.postMessage({
          type: "REQUEST_RESULT",
          id,
          response: responseText,
        });
      } catch (err) {
        self.postMessage({
          type: "REQUEST_RESULT",
          id,
          response: `SHIORI/3.0 500 Internal Server Error\r\nCharset: UTF-8\r\nX-Error: ${err.message}\r\n\r\n`,
        });
      }
      break;

    case "UNLOAD":
      shioriModule = null;
      isLoaded = false;
      self.postMessage({ type: "UNLOAD_RESULT", id, success: true });
      break;

    default:
      self.postMessage({ type: "ERROR", id, error: `Unknown worker action: ${type}` });
  }
});

/**
 * 簡易 SHIORI 3.0 パース & 応答生成（WASM 未初期化時の高速フォールバック）
 */
function processShioriRequest(request) {
  const idMatch = request.match(/ID:\s*([^\r\n]+)/i);
  const eventId = idMatch ? idMatch[1].trim() : "";

  // 簡易応答ディスパッチ
  if (eventId === "OnBoot") {
    return "SHIORI/3.0 200 OK\r\nCharset: UTF-8\r\nValue: \\0\\s0Worker版SHIORIコアが起動しました。\\e\r\n\r\n";
  }

  return "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n";
}
