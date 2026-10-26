/**
 * Nanai Android Mascot - 独立バルーンウィンドウ制御スクリプト
 */

const urlParams = new URLSearchParams(globalThis.location.search);
const scopeId = parseInt(urlParams.get("scope") || "0", 10);

const container = document.getElementById("balloon-container");
const balloonBox = document.getElementById("balloon-box");
const balloonText = document.getElementById("balloon-text");

// テーマの適用
const savedTheme = localStorage.getItem("nanai_balloon_theme") || "default";
document.documentElement.setAttribute("data-balloon-theme", savedTheme);

if (globalThis.__TAURI__) {
	const listenFn =
		globalThis.__TAURI__.event?.listen || globalThis.__TAURI__.listen;
	const emitFn =
		globalThis.__TAURI__.event?.emit || globalThis.__TAURI__.emit;

	if (typeof emitFn === "function") {
		emitFn("balloon-ready", { scopeId });
	}

	// 親ウィンドウからのバルーンコンテンツ更新イベントを受信
	if (typeof listenFn === "function") {
		listenFn(`update-balloon-content-${scopeId}`, (event) => {
			const { html, theme } = event.payload || {};
			if (theme) {
				document.documentElement.setAttribute("data-balloon-theme", theme);
			}
			if (balloonText && html !== undefined) {
				balloonText.innerHTML = html;
				// クリックイベントの再バインド (選択肢・アンカー等)
				setupInteractiveElements();
			}
		});

		// テーマ更新
		listenFn("balloon-theme-changed", (event) => {
			const theme = event.payload?.theme || event.payload;
			if (theme) {
				document.documentElement.setAttribute("data-balloon-theme", theme);
			}
		});
	}

	function setupInteractiveElements() {
		if (!balloonText) return;

		// 選択肢ボタン (\q)
		balloonText.querySelectorAll(".balloon-choice-btn").forEach((btn) => {
			btn.addEventListener("click", (e) => {
				e.stopPropagation();
				const choiceId = btn.getAttribute("data-choice-id");
				const choiceText = btn.textContent;
				if (typeof emitFn === "function") {
					emitFn("balloon-choice-selected", { scopeId, choiceId, choiceText });
				}
			});
		});

		// アンカーリンク (\_a)
		balloonText.querySelectorAll(".balloon-anchor").forEach((anchor) => {
			anchor.addEventListener("click", (e) => {
				e.stopPropagation();
				const anchorId = anchor.getAttribute("data-anchor-id");
				if (typeof emitFn === "function") {
					emitFn("balloon-anchor-selected", { scopeId, anchorId });
				}
			});
		});
	}

	// バルーン本体のクリックでスキップまたは改ページ通知
	balloonBox?.addEventListener("click", () => {
		if (typeof emitFn === "function") {
			emitFn("balloon-clicked", { scopeId });
		}
	});

	// ドラッグ移動 (Tauri v2 startDragging)
	balloonBox?.addEventListener("mousedown", (e) => {
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
}
