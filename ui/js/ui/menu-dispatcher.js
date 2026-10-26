/**
 * コンテキストメニューのアクション送出およびスコープ管理
 */
export class MenuDispatcher {
  constructor() {
    const urlParams = new URLSearchParams(globalThis.location.search);
    this.currentScope = parseInt(urlParams.get("scope") || "0", 10);
    this.setScope(this.currentScope);
  }

  setScope(scope) {
    this.currentScope = scope;
    if (scope > 0) {
      document.body.classList.add("subchar-mode");
    } else {
      document.body.classList.remove("subchar-mode");
    }
  }

  dispatchAction(action, payload = null) {
    if (!action) return;
    console.log(
      `Context Menu Action: ${action}`,
      payload || "",
      `Scope: ${this.currentScope}`
    );

    // アクションに scope 情報を付与（payloadがオブジェクトの場合は合成、プリミティブの場合はラップ）
    let finalPayload = payload;
    if (this.currentScope > 0) {
      if (finalPayload === null || finalPayload === undefined) {
        finalPayload = { scope: this.currentScope };
      } else if (
        typeof finalPayload === "object" &&
        !Array.isArray(finalPayload)
      ) {
        finalPayload = { ...finalPayload, scope: this.currentScope };
      }
    }

    // iframe 環境の場合
    if (globalThis.parent && globalThis.parent !== globalThis) {
      globalThis.parent.postMessage(
        {
          type: "menu-action",
          action: action,
          payload: finalPayload,
          timestamp: Date.now(),
        },
        "*"
      );
    }

    // 独立ウィンドウ（WebviewWindow）環境の場合
    if (globalThis.__TAURI__) {
      const emitFn =
        globalThis.__TAURI__.event?.emit || globalThis.__TAURI__.emit;
      const invokeFn =
        globalThis.__TAURI__.core?.invoke || globalThis.__TAURI__.invoke;
      if (typeof emitFn === "function") {
        emitFn("menu-action", { action, payload: finalPayload });
      }
      // 終了（close/exit）の場合は直接 exit_app を呼び出して確実にプロセスを落とす
      if (action === "close" || action === "exit") {
        if (typeof invokeFn === "function") {
          invokeFn("exit_app").catch(() => {});
        }
        return;
      }
      if (typeof invokeFn === "function" && action !== "request-sync") {
        invokeFn("hide_menu_window").catch(() => {});
      }
    }
  }
}
