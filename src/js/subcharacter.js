/**
 * Nanai Android Mascot - サブキャラクターウィンドウ制御
 */

const img = document.getElementById("subchar-img");
const root = document.getElementById("subchar-root");

// URLパラメータからスコープIDを取得 (例: subcharacter.html?scope=1)
const urlParams = new URLSearchParams(globalThis.location.search);
const scopeId = parseInt(urlParams.get("scope") || "1", 10);

if (globalThis.__TAURI__) {
	const listenFn =
		globalThis.__TAURI__.event?.listen || globalThis.__TAURI__.listen;
	const invokeFn =
		globalThis.__TAURI__.core?.invoke || globalThis.__TAURI__.invoke;

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

	// デスクトップ上でのドラッグ移動
	root?.addEventListener("mousedown", (e) => {
		if (e.button === 0 && typeof invokeFn === "function") {
			const startDraggingFn =
				globalThis.__TAURI__.window?.getCurrentWindow?.()?.startDragging;
			if (typeof startDraggingFn === "function") {
				startDraggingFn();
			}
		}
	});

	// タップ/クリックでSHIORIへクリックイベント通知（該当スコープIDを送信）
	root?.addEventListener("click", () => {
		const emitFn =
			globalThis.__TAURI__.event?.emit || globalThis.__TAURI__.emit;
		if (typeof emitFn === "function") {
			emitFn("menu-action", { action: "talk", payload: { scope: scopeId } });
		}
	});
}
