import { getAllWindows } from "@tauri-apps/api/window";
import { invoke, isTauriAvailable } from "../js/core/tauri-helper.js";

async function findWindow(label) {
	if (!globalThis.__TAURI__ && !globalThis.__TAURI_INTERNALS__) return null;
	const windows = await getAllWindows();
	return windows.find((window) => window.label === label) ?? null;
}

async function toggleLabeledWindow(windowLabel, stateKey) {
	const window = await findWindow(windowLabel);
	if (!window) {
		console.error(`ウィンドウが見つかりません: ${windowLabel}`);
		return;
	}
	const nextState = !windowStates[stateKey];
	try {
		if (nextState) {
			await window.show();
			await window.unminimize();
			await window.setFocus();
		} else {
			await window.hide();
		}
		updateWindowStatus(stateKey, nextState);
	} catch (error) {
		console.error(`ウィンドウ操作に失敗しました: ${windowLabel}`, error);
	}
}

// ウィンドウ状態管理
export const windowStates = {
	ghost: false,
	settings: false,
	balloon: false,
	yaya: false,
};

// ウィンドウ状態の更新
export function updateWindowStatus(windowName, isActive) {
	windowStates[windowName] = isActive;

	const indicator = document.getElementById(`${windowName}-indicator`);
	const status = document.getElementById(`${windowName}-status`);
	const card = document.getElementById(`${windowName}-window-card`);

	if (isActive) {
		if (indicator) indicator.classList.add("active");
		if (status) {
			status.textContent = "実行中";
			status.classList.add("active");
		}
		if (card) card.classList.add("active");
	} else {
		if (indicator) indicator.classList.remove("active");
		if (status) {
			status.textContent = "停止";
			status.classList.remove("active");
		}
		if (card) card.classList.remove("active");
	}
}

// ゴーストウィンドウ制御
export async function toggleGhostWindow() {
	await toggleLabeledWindow("ghost-floating", "ghost");
}

export function configureGhostWindow() {
	alert(
		"ゴーストウィンドウ設定\n\n将来的な機能:\n• 透過度設定\n• フローティング位置\n• アニメーション設定\n• キャラクター選択",
	);
}

// 設定ウィンドウ制御
export async function toggleSettingsWindow() {
	await toggleLabeledWindow("desktop-features", "settings");
}

export function resetSettings() {
	if (confirm("設定をリセットしますか？")) {
		console.log("設定をリセットします...");
	}
}

// バルーンウィンドウ制御
export async function testBalloonWindow() {
	console.log("バルーンテスト表示...");
	await toggleLabeledWindow("balloon_window_0", "balloon");
	setTimeout(async () => {
		const window = await findWindow("balloon_window_0");
		if (window) {
			await window.hide();
			updateWindowStatus("balloon", false);
		}
	}, 3000);
}

export function configureBalloon() {
	alert(
		"バルーン設定\n\n将来的な機能:\n• 表示時間設定\n• フォント・色設定\n• 位置調整\n• エフェクト設定",
	);
}

// YAYA連携制御
export async function connectYAYA() {
	console.log("YAYA接続を試行します...");
	if (!isTauriAvailable()) {
		updateWindowStatus("yaya", false);
		console.error("Tauri 環境では SHIORI ステータスを取得できません");
		return;
	}
	try {
		const connected = await invoke("get_shiori_status");
		updateWindowStatus("yaya", connected);
		if (!connected) {
			console.error("SHIORI はロードされていません");
		}
	} catch (error) {
		updateWindowStatus("yaya", false);
		console.error("SHIORI ステータス取得に失敗しました:", error);
	}
}

export function debugYAYA() {
	alert(
		"YAYAデバッグ\n\n将来的な機能:\n• リアルタイムログ\n• 変数状態表示\n• エラー詳細情報\n• パフォーマンス監視",
	);
}

// グローバル制御
export function initializeAllWindows() {
	console.log("全ウィンドウを初期化します...");
	Object.keys(windowStates).forEach((window) => {
		updateWindowStatus(window, true);
	});

	setTimeout(() => {
		alert("全ウィンドウの初期化が完了しました");
	}, 1000);
}

export function minimizeAllWindows() {
	console.log("全ウィンドウを最小化します...");
}

export function restoreAllWindows() {
	console.log("全ウィンドウを復元します...");
}

export function closeAllWindows() {
	if (confirm("全てのウィンドウを閉じますか？")) {
		console.log("全ウィンドウを閉じます...");
		Object.keys(windowStates).forEach((window) => {
			updateWindowStatus(window, false);
		});
	}
}

// 設定制御
export function toggleAlwaysOnTop() {
	const checked = document.getElementById("always-on-top").checked;
	console.log(`常に最前面表示: ${checked}`);
}

export function updateOpacity() {
	const value = document.getElementById("opacity-slider").value;
	document.getElementById("opacity-value").textContent = `${value}%`;
	console.log(`透過度: ${value}%`);
}

export function toggleAutoMinimize() {
	const checked = document.getElementById("auto-minimize").checked;
	console.log(`自動最小化: ${checked}`);
}

export function toggleSystemTray() {
	const checked = document.getElementById("system-tray").checked;
	console.log(`システムトレイ表示: ${checked}`);
}

// グローバルスコープへ公開（HTMLインラインイベント対応）
globalThis.toggleGhostWindow = toggleGhostWindow;
globalThis.configureGhostWindow = configureGhostWindow;
globalThis.toggleSettingsWindow = toggleSettingsWindow;
globalThis.resetSettings = resetSettings;
globalThis.testBalloonWindow = testBalloonWindow;
globalThis.configureBalloon = configureBalloon;
globalThis.connectYAYA = connectYAYA;
globalThis.debugYAYA = debugYAYA;
globalThis.initializeAllWindows = initializeAllWindows;
globalThis.minimizeAllWindows = minimizeAllWindows;
globalThis.restoreAllWindows = restoreAllWindows;
globalThis.closeAllWindows = closeAllWindows;
globalThis.toggleAlwaysOnTop = toggleAlwaysOnTop;
globalThis.updateOpacity = updateOpacity;
globalThis.toggleAutoMinimize = toggleAutoMinimize;
globalThis.toggleSystemTray = toggleSystemTray;

document.addEventListener("DOMContentLoaded", () => {
	console.log("ウィンドウ管理センターを初期化しました");
});
