/**
 * Nanai Android Mascot - キャラクターウィンドウ制御スクリプト
 */

const urlParams = new URLSearchParams(globalThis.location.search);
const scopeId = parseInt(urlParams.get("scope") || "0", 10);
const globalWithTauri = /** @type {{ __TAURI__?: any }} */ (globalThis);

function initCharacterWindow() {
  const img = /** @type {HTMLImageElement | null} */ (
    document.getElementById("subchar-img")
  );
  /** @type {HTMLElement | null} */
  const root = document.getElementById("subchar-root");

  if (!globalWithTauri.__TAURI__) return;

  const listenFn =
    globalWithTauri.__TAURI__.event?.listen || globalWithTauri.__TAURI__.listen;
  const invokeFn =
    globalWithTauri.__TAURI__.core?.invoke || globalWithTauri.__TAURI__.invoke;
  const emitFn =
    globalWithTauri.__TAURI__.event?.emit || globalWithTauri.__TAURI__.emit;

  if (typeof listenFn === "function") {
    // スコープ固有のサーフェス画像更新を受信
    listenFn(
      `update-subchar-image-${scopeId}`,
      (/** @type {{ payload: { src: any; }; }} */ event) => {
        const src = event.payload?.src;
        if (src && img) {
          img.src = src;
          img.style.display = "block";
        } else if (img) {
          img.style.display = "none";
        }
      },
    );
  }

  // ウィンドウ読み込み完了時に親側へ現在のサーフェス画像を要求
  if (typeof emitFn === "function") {
    emitFn("request-subchar-image", { scopeId });
  }

  // デスクトップ上でのドラッグ移動
  root?.addEventListener("mousedown", async (e) => {
    if (e.button === 0) {
      // 透明ピクセルの場合はドラッグを開始しない
      if (img) {
        const rect = img.getBoundingClientRect();
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        if (x >= 0 && y >= 0 && x < img.naturalWidth && y < img.naturalHeight) {
          const canvas = document.createElement("canvas");
          canvas.width = 1;
          canvas.height = 1;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) return;
          ctx.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
          if (ctx.getImageData(0, 0, 1, 1).data[3] === 0) {
            return; // 透明ならドラッグさせない
          }
        } else {
          return;
        }
      }

      try {
        if (globalWithTauri.__TAURI__) {
          const { getCurrentWindow } = await import("@tauri-apps/api/window");
          await getCurrentWindow().startDragging();
        }
      } catch (_err) {
        // 無視
      }
    }
  });

  // タップ/クリックでSHIORIへクリックイベント通知（該当スコープIDを送信）
  root?.addEventListener("click", () => {
    if (typeof emitFn === "function") {
      emitFn("menu-action", { action: "talk", payload: { scope: scopeId } });
    }
  });

  // 右クリックでメニューを表示
  root?.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (typeof invokeFn === "function") {
      invokeFn("show_menu_window", {
        x: e.screenX,
        y: e.screenY,
        scope: scopeId,
      }).catch((/** @type {any} */ err) => {
        console.warn("Failed to open character menu:", err);
      });
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCharacterWindow);
} else {
  initCharacterWindow();
}
