/**
 * Nanai Android Mascot - 独立バルーンウィンドウ制御スクリプト
 */

const urlParams = new URLSearchParams(globalThis.location.search);
const scopeId = parseInt(urlParams.get("scope") || "0", 10);

function setupInteractiveElements(balloonText, emitFn) {
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

function initBalloonWindow() {
	const balloonBox = document.getElementById("balloon-box");
	const balloonText = document.getElementById("balloon-text");

	// テーマの適用
	const savedTheme = localStorage.getItem("nanai_balloon_theme") || "default";
	document.documentElement.setAttribute("data-balloon-theme", savedTheme);

	if (!globalThis.__TAURI__) return;

	const listenFn =
		globalThis.__TAURI__.event?.listen || globalThis.__TAURI__.listen;
	const emitFn = globalThis.__TAURI__.event?.emit || globalThis.__TAURI__.emit;

	// 親ウィンドウからのバルーンコンテンツ更新イベントを受信 (listenを先に登録)
	if (typeof listenFn === "function") {
		listenFn(`update-balloon-content-${scopeId}`, (event) => {
			const { html, theme } = event.payload || {};
			if (theme) {
				document.documentElement.setAttribute("data-balloon-theme", theme);
			}
			const targetText = document.getElementById("balloon-text");
			if (targetText && html !== undefined) {
				targetText.innerHTML = html;
				// クリックイベントの再バインド (選択肢・アンカー等)
				setupInteractiveElements(targetText, emitFn);
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

	if (typeof emitFn === "function") {
		emitFn("balloon-ready", { scopeId });
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

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initBalloonWindow);
} else {
	initBalloonWindow();
}
