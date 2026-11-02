/**
 * Nanai Android Mascot - 独立バルーンウィンドウ制御スクリプト
 */

import { emit, isTauriAvailable, listen } from "../core/tauri-helper.js";
import { setupWindowGestures } from "./balloon-window/gesture.js";
import { setupInteractiveElements } from "./balloon-window/interactive.js";
import { updateBalloonWindowScale } from "./balloon-window/scale.js";
import { applyBalloonDescript as applyThemeDescript } from "./balloon-window/theme.js";

const urlParams = new URLSearchParams(globalThis.location.search);
const scopeId = parseInt(urlParams.get("scope") || "0", 10);
let appliedTheme = null;
let applyingTheme = null;
let currentDpiScale = 1;
let currentUserScale = 1;
let isBalloonDontMove = false;

// 外部参照および後方互換性のためエクスポート
export {
	setupInteractiveElements,
	setupWindowGestures,
	updateBalloonWindowScale,
};

/**
 * バルーン descript.txt の定義をスタイルへ動的反映（UKADOC準拠）
 * // [descript.txt（Balloonの）]: balloon_manifest パースとスタイル適用
 * @param {string} theme
 */
export async function applyBalloonDescript(theme) {
	if (!isTauriAvailable()) return;
	if (appliedTheme === theme) return;
	if (applyingTheme === theme) return;
	applyingTheme = theme;
	try {
		const result = await applyThemeDescript({
			theme,
			scopeId,
			currentUserScale,
			onDpiScaleChange: (newDpiScale) => {
				currentDpiScale = newDpiScale;
			},
			onDontMoveChange: (dontMove) => {
				isBalloonDontMove = dontMove;
			},
		});
		if (result) {
			currentDpiScale = result.dpiScale;
			isBalloonDontMove = result.isBalloonDontMove;
			appliedTheme = theme;
		}
	} catch (_e) {
		// スキン descript 未定義（CSS テーマのみ）の場合は無視
	} finally {
		if (applyingTheme === theme) applyingTheme = null;
	}
}

export function initBalloonWindow() {
	const balloonBox = document.getElementById("balloon-box");
	const _balloonText = document.getElementById("balloon-text");

	// テーマの適用
	const savedTheme =
		urlParams.get("theme") ||
		localStorage.getItem("nanai_balloon_theme") ||
		"default";
	document.documentElement.setAttribute("data-balloon-theme", savedTheme);
	void applyBalloonDescript(savedTheme);

	if (!isTauriAvailable()) return;

	// 親ウィンドウからのバルーンコンテンツ更新イベントを受信 (listenを先に登録)
	void listen(`update-balloon-content-${scopeId}`, (event) => {
		const { html, theme } = event.payload || {};
		if (theme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
			void applyBalloonDescript(theme);
		}
		const targetText = document.getElementById("balloon-text");
		if (targetText && html !== undefined) {
			targetText.innerHTML = html;
			// クリックイベントの再バインド (選択肢・アンカー等)
			setupInteractiveElements(targetText, scopeId);
		}
	});

	// テーマ更新
	void listen("balloon-theme-changed", (event) => {
		const theme = event.payload?.theme || event.payload;
		if (theme) {
			document.documentElement.setAttribute("data-balloon-theme", theme);
			localStorage.setItem("nanai_balloon_theme", theme);
			void applyBalloonDescript(theme);
		}
	});

	// バルーン倍率更新 (手動スケール × DPI推奨スケール)
	void listen("balloon-scale-changed", (event) => {
		const userScale = Number(event.payload?.userScale);
		if (!Number.isNaN(userScale) && userScale > 0) {
			currentUserScale = userScale;
			updateBalloonWindowScale(balloonBox, currentUserScale, currentDpiScale);
		}
	});

	void emit("balloon-ready", { scopeId });

	// ジェスチャーとマウスドラッグの設定
	setupWindowGestures(balloonBox, {
		scopeId,
		getIsBalloonDontMove: () => isBalloonDontMove,
		getUserScale: () => currentUserScale,
		getDpiScale: () => currentDpiScale,
		onUserScaleChange: (newScale) => {
			currentUserScale = newScale;
		},
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initBalloonWindow);
} else {
	initBalloonWindow();
}
