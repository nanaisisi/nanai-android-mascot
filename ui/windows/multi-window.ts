/**
 * @file multi-window.ts
 * @brief マルチウィンドウ管理センターモジュール
 */

import { invoke, isTauriAvailable } from "../ts/core/tauri-helper.js";

async function findWindow(label: string) {
	if (!globalThis.__TAURI__ && !globalThis.__TAURI_INTERNALS__) return null;
	try {
		const { getAllWindows } = await import("@tauri-apps/api/window");
		const windows = await getAllWindows();
		return windows.find((window) => window.label === label) ?? null;
	} catch (_err) {
		return null;
	}
}

async function toggleLabeledWindow(
	windowLabel: string,
	stateKey: keyof typeof windowStates,
): Promise<void> {
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

interface WindowStates {
	ghost: boolean;
	settings: boolean;
	balloon: boolean;
	yaya: boolean;
	[key: string]: boolean;
}

// ウィンドウ状態管理
export const windowStates: WindowStates = {
	ghost: false,
	settings: false,
	balloon: false,
	yaya: false,
};

// ウィンドウ状態の更新
export function updateWindowStatus(
	windowName: string,
	isActive: boolean,
): void {
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
export async function toggleGhostWindow(): Promise<void> {
	await toggleLabeledWindow("ghost-floating", "ghost");
}

export function configureGhostWindow(): void {
	alert(
		"ゴーストウィンドウ設定\n\n将来的な機能:\n• 透過度設定\n• フローティング位置\n• アニメーション設定\n• キャラクター選択",
	);
}

// 設定ウィンドウ制御
export async function toggleSettingsWindow(): Promise<void> {
	await toggleLabeledWindow("desktop-features", "settings");
}

export function resetSettings(): void {
	if (confirm("設定をリセットしますか？")) {
		console.log("設定をリセットします...");
	}
}

// バルーンウィンドウ制御
export async function testBalloonWindow(): Promise<void> {
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

export function configureBalloon(): void {
	alert(
		"バルーン設定\n\n将来的な機能:\n• 表示時間設定\n• フォント・色設定\n• 位置調整\n• エフェクト設定",
	);
}

// YAYA連携制御
export async function connectYAYA(): Promise<void> {
	console.log("YAYA接続を試行します...");
	if (!isTauriAvailable()) {
		updateWindowStatus("yaya", false);
		console.error("Tauri 環境では SHIORI ステータスを取得できません");
		return;
	}
	try {
		const connected = await invoke<boolean>("get_shiori_status");
		updateWindowStatus("yaya", Boolean(connected));
		if (!connected) {
			console.error("SHIORI はロードされていません");
		}
	} catch (error) {
		updateWindowStatus("yaya", false);
		console.error("SHIORI ステータス取得に失敗しました:", error);
	}
}

export function debugYAYA(): void {
	alert(
		"YAYAデバッグ\n\n将来的な機能:\n• リアルタイムログ\n• 変数状態表示\n• エラー詳細情報\n• パフォーマンス監視",
	);
}

// グローバル制御
export function initializeAllWindows(): void {
	console.log("全ウィンドウを初期化します...");
	Object.keys(windowStates).forEach((window) => {
		updateWindowStatus(window, true);
	});

	setTimeout(() => {
		alert("全ウィンドウの初期化が完了しました");
	}, 1000);
}

export function minimizeAllWindows(): void {
	console.log("全ウィンドウを最小化します...");
}

export function restoreAllWindows(): void {
	console.log("全ウィンドウを復元します...");
}

export function closeAllWindows(): void {
	if (confirm("全てのウィンドウを閉じますか？")) {
		console.log("全ウィンドウを閉じます...");
		Object.keys(windowStates).forEach((window) => {
			updateWindowStatus(window, false);
		});
	}
}

// 設定制御
export function toggleAlwaysOnTop(): void {
	const topElem = document.getElementById(
		"always-on-top",
	) as HTMLInputElement | null;
	const checked = topElem?.checked ?? false;
	console.log(`常に最前面表示: ${checked}`);
}

export function updateOpacity(): void {
	const opacitySlider = document.getElementById(
		"opacity-slider",
	) as HTMLInputElement | null;
	const value = opacitySlider?.value ?? "100";
	const opacityVal = document.getElementById("opacity-value");
	if (opacityVal) {
		opacityVal.textContent = `${value}%`;
	}
	console.log(`透過度: ${value}%`);
}

export function toggleAutoMinimize(): void {
	const autoMin = document.getElementById(
		"auto-minimize",
	) as HTMLInputElement | null;
	const checked = autoMin?.checked ?? false;
	console.log(`自動最小化: ${checked}`);
}

export function toggleSystemTray(): void {
	const sysTray = document.getElementById(
		"system-tray",
	) as HTMLInputElement | null;
	const checked = sysTray?.checked ?? false;
	console.log(`システムトレイ表示: ${checked}`);
}

// グローバルスコープへ公開（HTMLインラインイベント対応）
const g = globalThis as Record<string, unknown>;
g.toggleGhostWindow = toggleGhostWindow;
g.configureGhostWindow = configureGhostWindow;
g.toggleSettingsWindow = toggleSettingsWindow;
g.resetSettings = resetSettings;
g.testBalloonWindow = testBalloonWindow;
g.configureBalloon = configureBalloon;
g.connectYAYA = connectYAYA;
g.debugYAYA = debugYAYA;
g.initializeAllWindows = initializeAllWindows;
g.minimizeAllWindows = minimizeAllWindows;
g.restoreAllWindows = restoreAllWindows;
g.closeAllWindows = closeAllWindows;
g.toggleAlwaysOnTop = toggleAlwaysOnTop;
g.updateOpacity = updateOpacity;
g.toggleAutoMinimize = toggleAutoMinimize;
g.toggleSystemTray = toggleSystemTray;

function init(): void {
	console.log("ウィンドウ管理センターを初期化しました");
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
