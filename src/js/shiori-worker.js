const _shioriModule = null;
let isLoaded = false;

// メインスレッドからのメッセージ待受
self.addEventListener("message", (e) => {
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

        // WASM / Native SHIORI ハンドラによるリクエスト処理（未ロード時は204 No Content）
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
      isLoaded = false;
      self.postMessage({ type: "UNLOAD_RESULT", id, success: true });
      break;

    default:
      self.postMessage({ type: "ERROR", id, error: `Unknown worker action: ${type}` });
  }
});

/**
 * SHIORI 3.0 リクエスト処理（エンジン未処理時は 204 No Content を返却）
 */
function processShioriRequest(_request) {
  return "SHIORI/3.0 204 No Content\r\nCharset: UTF-8\r\n\r\n";
}
