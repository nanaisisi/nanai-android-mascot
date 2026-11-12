/**
 * @file desktop-features.ts
 * @brief デスクトップ環境の機能管理と状態更新モジュール
 */

import { getCurrentWindow } from "@tauri-apps/api/window";

const currentWindow = getCurrentWindow();

interface DesktopFeatureStates {
	transparency: boolean;
	alwaysOnTop: boolean;
	systemTray: boolean;
	hotkeys: number;
	monitoring: boolean;
}

// 機能状態管理
export const featureStates: DesktopFeatureStates = {
	transparency: false,
	alwaysOnTop: false,
	systemTray: false,
	hotkeys: 0,
	monitoring: false,
};

// 状態表示更新
export function updateStatusDisplay(): void {
	const trans = document.getElementById("transparency-status");
	const topmost = document.getElementById("topmost-status");
	const tray = document.getElementById("tray-status");
	const hotkey = document.getElementById("hotkey-status");
	const monitoring = document.getElementById("monitoring-status");

	if (trans) trans.textContent = featureStates.transparency ? "ON" : "OFF";
	if (topmost) topmost.textContent = featureStates.alwaysOnTop ? "ON" : "OFF";
	if (tray) tray.textContent = featureStates.systemTray ? "ON" : "OFF";
	if (hotkey) hotkey.textContent = featureStates.hotkeys.toString();
	if (monitoring)
		monitoring.textContent = featureStates.monitoring ? "ON" : "OFF";
}

// 透過機能
export function toggleTransparency(): void {
	featureStates.transparency = !featureStates.transparency;
	console.log(`透過表示: ${featureStates.transparency}`);
	updateStatusDisplay();
	adjustOpacity(featureStates.transparency ? 90 : 100);
}

export async function adjustOpacity(value?: string | number): Promise<void> {
	const input = value ?? prompt("透過度を入力してください (30-100):", "90");
	const opacity = Number(input);
	if (!Number.isFinite(opacity) || opacity < 30 || opacity > 100) return;
	console.log(`透過度を${opacity}%に設定`);
	try {
		await currentWindow.setOpacity(opacity / 100);
	} catch (error) {
		console.error("ウィンドウ透過度の変更に失敗しました:", error);
	}
}

// Always On Top機能
export async function toggleAlwaysOnTop(): Promise<void> {
	featureStates.alwaysOnTop = !featureStates.alwaysOnTop;
	console.log(`常に最前面: ${featureStates.alwaysOnTop}`);
	updateStatusDisplay();
	try {
		await currentWindow.setAlwaysOnTop(featureStates.alwaysOnTop);
	} catch (error) {
		console.error("最前面表示の変更に失敗しました:", error);
	}
}

export function configureTopmost(): void {
	alert(
		"最前面設定\n\n将来的な機能:\n• 例外アプリケーション設定\n• フルスクリーン時の動作\n• 一時的な最前面解除",
	);
}

// ドラッグ移動
export function enableDragMode(): void {
	currentWindow.startDragging().catch((error) => {
		console.error("ウィンドウのドラッグ開始に失敗しました:", error);
	});
}

export function resetPosition(): void {
	currentWindow.center().catch((error) => {
		console.error("ウィンドウ位置のリセットに失敗しました:", error);
	});
}

// システムトレイ
export function toggleSystemTray(): void {
	featureStates.systemTray = !featureStates.systemTray;
	console.log(`システムトレイ: ${featureStates.systemTray}`);
	updateStatusDisplay();

	alert(
		`システムトレイ: ${
			featureStates.systemTray ? "表示" : "非表示"
		}\n\n将来的な実装:\n• トレイアイコンの作成\n• 右クリックメニュー\n• 通知バルーン`,
	);
}

export function configureTray(): void {
	alert(
		"トレイメニュー設定\n\n将来的な機能:\n• カスタムメニュー項目\n• アイコンの変更\n• 通知設定",
	);
}

// ホットキー
export function configureHotkeys(): void {
	const key = prompt(
		"ホットキーを設定してください (例: Ctrl+Alt+M):",
		"Ctrl+Alt+M",
	);
	if (key) {
		featureStates.hotkeys++;
		updateStatusDisplay();
		alert(
			`ホットキー設定: ${key}\n\n将来的な実装:\n• グローバルキー登録\n• 重複検証\n• 動作のカスタマイズ`,
		);
	}
}

export function testHotkeys(): void {
	alert(
		"ホットキーテスト\n\n将来的な実装:\n• 登録済みキーの一覧\n• テストモード\n• 競合チェック",
	);
}

// デスクトップ監視
export function enableDesktopMonitoring(): void {
	featureStates.monitoring = !featureStates.monitoring;
	console.log(`デスクトップ監視: ${featureStates.monitoring}`);
	updateStatusDisplay();

	alert(
		`デスクトップ監視: ${
			featureStates.monitoring ? "開始" : "停止"
		}\n\n将来的な実装:\n• 壁紙変更検出\n• ウィンドウフォーカス監視\n• 解像度変更対応`,
	);
}

export function configureMonitoring(): void {
	alert(
		"監視設定\n\n将来的な機能:\n• 監視対象の選択\n• イベントハンドラー設定\n• ログレベル調整",
	);
}

// 高度な設定
export function toggleStartup(): void {
	const startupElem = document.getElementById(
		"startup-setting",
	) as HTMLInputElement | null;
	const checked = startupElem?.checked ?? false;
	console.log(`スタートアップ登録: ${checked}`);
	alert(
		`スタートアップ: ${
			checked ? "登録" : "解除"
		}\n\n将来的な実装:\n• レジストリ操作\n• 起動遅延設定\n• 管理者権限処理`,
	);
}

export function configureMultiMonitor(): void {
	const multiElem = document.getElementById(
		"multi-monitor",
	) as HTMLSelectElement | null;
	const value = multiElem?.value ?? "";
	console.log(`マルチモニター: ${value}`);
	alert(
		`マルチモニター設定: ${value}\n\n将来的な実装:\n• モニター情報取得\n• ウィンドウ配置制御\n• DPI対応`,
	);
}

export function setPerformanceMode(): void {
	const perfElem = document.getElementById(
		"performance-mode",
	) as HTMLSelectElement | null;
	const mode = perfElem?.value ?? "";
	console.log(`パフォーマンスモード: ${mode}`);
	const statusElem = document.getElementById("performance-status");
	if (statusElem) {
		statusElem.textContent =
			mode === "eco" ? "エコ" : mode === "balanced" ? "バランス" : "高性能";
	}
}

export function updateInterval(): void {
	const intervalInput = document.getElementById(
		"update-interval",
	) as HTMLInputElement | null;
	const value = intervalInput?.value ?? "";
	const intervalElem = document.getElementById("interval-value");
	if (intervalElem) {
		intervalElem.textContent = `${value}ms`;
	}
	console.log(`更新間隔: ${value}ms`);
}

export function updateMemoryLimit(): void {
	const memInput = document.getElementById(
		"memory-limit",
	) as HTMLInputElement | null;
	const value = memInput?.value ?? "";
	const memoryElem = document.getElementById("memory-value");
	if (memoryElem) {
		memoryElem.textContent = `${value}MB`;
	}
	console.log(`メモリ制限: ${value}MB`);
}

// グローバルスコープへ公開（HTMLインラインイベント対応）
const g = globalThis as Record<string, unknown>;
g.toggleTransparency = toggleTransparency;
g.adjustOpacity = adjustOpacity;
g.toggleAlwaysOnTop = toggleAlwaysOnTop;
g.configureTopmost = configureTopmost;
g.enableDragMode = enableDragMode;
g.resetPosition = resetPosition;
g.toggleSystemTray = toggleSystemTray;
g.configureTray = configureTray;
g.configureHotkeys = configureHotkeys;
g.testHotkeys = testHotkeys;
g.enableDesktopMonitoring = enableDesktopMonitoring;
g.configureMonitoring = configureMonitoring;
g.toggleStartup = toggleStartup;
g.configureMultiMonitor = configureMultiMonitor;
g.setPerformanceMode = setPerformanceMode;
g.updateInterval = updateInterval;
g.updateMemoryLimit = updateMemoryLimit;

// 初期化
document.addEventListener("DOMContentLoaded", () => {
	console.log("デスクトップ機能管理画面を初期化しました");
	updateStatusDisplay();
});
