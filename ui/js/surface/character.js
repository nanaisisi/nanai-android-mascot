/**
 * Nanai Android Mascot - キャラクターウィンドウ制御スクリプト
 */

const urlParams = new URLSearchParams(globalThis.location.search);
const scopeId = parseInt(urlParams.get("scope") || "0", 10);

function initCharacterWindow() {
	const img = document.getElementById("subchar-img");
	const root = document.getElementById("subchar-root");

	if (!globalThis.__TAURI__) return;

	const listenFn =
		globalThis.__TAURI__.event?.listen || globalThis.__TAURI__.listen;
	const invokeFn =
		globalThis.__TAURI__.core?.invoke || globalThis.__TAURI__.invoke;
	const emitFn = globalThis.__TAURI__.event?.emit || globalThis.__TAURI__.emit;

	if (typeof listenFn === "function") {
		// スコープ固有のサーフェス画像更新を受信
		listenFn(`update-subchar-image-${scopeId}`, (event) => {
			const src = event.payload?.src;
			if (src && img) {
				img.src = src;
				img.style.display = "block";
			} else if (img) {
				img.style.display = "none";
			}
		});
	}

	// ウィンドウ読み込み完了時に親側へ現在のサーフェス画像を要求
	if (typeof emitFn === "function") {
		emitFn("request-subchar-image", { scopeId });
	}

	// デスクトップ上でのドラッグ移動
	root?.addEventListener("mousedown", (e) => {
		if (e.button === 0) {
			const tauriWindow =
				globalThis.__TAURI__.window?.getCurrentWindow?.() ||
				globalThis.__TAURI__.getCurrentWindow?.();
			if (tauriWindow && typeof tauriWindow.startDragging === "function") {
				try {
					tauriWindow.startDragging();
				} catch (_err) {
					// 無視
				}
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
			}).catch((err) => {
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
