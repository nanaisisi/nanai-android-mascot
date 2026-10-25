// 機能状態管理
export const featureStates = {
	transparency: false,
	alwaysOnTop: false,
	systemTray: false,
	hotkeys: 0,
	monitoring: false,
};

// 状態表示更新
export function updateStatusDisplay() {
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
export function toggleTransparency() {
	featureStates.transparency = !featureStates.transparency;
	console.log(`透過表示: ${featureStates.transparency}`);
	updateStatusDisplay();

	if (featureStates.transparency) {
		alert(
			"透過表示を有効にしました\n\n将来的な実装:\n• ウィンドウ透過度の制御\n• 背景の透過処理\n• 透過度のアニメーション",
		);
	} else {
		alert("透過表示を無効にしました");
	}
}

export function adjustOpacity() {
	const opacity = prompt("透過度を入力してください (30-100):", "90");
	if (opacity && opacity >= 30 && opacity <= 100) {
		console.log(`透過度を${opacity}%に設定`);
		alert(
			`透過度を${opacity}%に設定しました\n\n将来的な実装:\n• リアルタイム透過度変更\n• スライダーでの調整\n• プリセット保存`,
		);
	}
}

// Always On Top機能
export function toggleAlwaysOnTop() {
	featureStates.alwaysOnTop = !featureStates.alwaysOnTop;
	console.log(`常に最前面: ${featureStates.alwaysOnTop}`);
	updateStatusDisplay();

	alert(
		`常に最前面表示: ${
			featureStates.alwaysOnTop ? "有効" : "無効"
		}\n\n将来的な実装:\n• Tauri API連携\n• 最前面状態の管理\n• 例外アプリの設定`,
	);
}

export function configureTopmost() {
	alert(
		"最前面設定\n\n将来的な機能:\n• 例外アプリケーション設定\n• フルスクリーン時の動作\n• 一時的な最前面解除",
	);
}

// ドラッグ移動
export function enableDragMode() {
	alert(
		"ドラッグモード有効\n\n将来的な実装:\n• マウスイベントハンドリング\n• ウィンドウ位置の更新\n• 境界検証とスナップ機能",
	);
}

export function resetPosition() {
	alert(
		"位置をリセットしました\n\n将来的な実装:\n• デフォルト位置への移動\n• アニメーション付き移動\n• 位置履歴の管理",
	);
}

// システムトレイ
export function toggleSystemTray() {
	featureStates.systemTray = !featureStates.systemTray;
	console.log(`システムトレイ: ${featureStates.systemTray}`);
	updateStatusDisplay();

	alert(
		`システムトレイ: ${
			featureStates.systemTray ? "表示" : "非表示"
		}\n\n将来的な実装:\n• トレイアイコンの作成\n• 右クリックメニュー\n• 通知バルーン`,
	);
}

export function configureTray() {
	alert(
		"トレイメニュー設定\n\n将来的な機能:\n• カスタムメニュー項目\n• アイコンの変更\n• 通知設定",
	);
}

// ホットキー
export function configureHotkeys() {
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

export function testHotkeys() {
	alert(
		"ホットキーテスト\n\n将来的な実装:\n• 登録済みキーの一覧\n• テストモード\n• 競合チェック",
	);
}

// デスクトップ監視
export function enableDesktopMonitoring() {
	featureStates.monitoring = !featureStates.monitoring;
	console.log(`デスクトップ監視: ${featureStates.monitoring}`);
	updateStatusDisplay();

	alert(
		`デスクトップ監視: ${
			featureStates.monitoring ? "開始" : "停止"
		}\n\n将来的な実装:\n• 壁紙変更検出\n• ウィンドウフォーカス監視\n• 解像度変更対応`,
	);
}

export function configureMonitoring() {
	alert(
		"監視設定\n\n将来的な機能:\n• 監視対象の選択\n• イベントハンドラー設定\n• ログレベル調整",
	);
}

// 高度な設定
export function toggleStartup() {
	const checked = document.getElementById("startup-setting").checked;
	console.log(`スタートアップ登録: ${checked}`);
	alert(
		`スタートアップ: ${
			checked ? "登録" : "解除"
		}\n\n将来的な実装:\n• レジストリ操作\n• 起動遅延設定\n• 管理者権限処理`,
	);
}

export function configureMultiMonitor() {
	const value = document.getElementById("multi-monitor").value;
	console.log(`マルチモニター: ${value}`);
	alert(
		`マルチモニター設定: ${value}\n\n将来的な実装:\n• モニター情報取得\n• ウィンドウ配置制御\n• DPI対応`,
	);
}

export function setPerformanceMode() {
	const mode = document.getElementById("performance-mode").value;
	console.log(`パフォーマンスモード: ${mode}`);
	const statusElem = document.getElementById("performance-status");
	if (statusElem) {
		statusElem.textContent =
			mode === "eco" ? "エコ" : mode === "balanced" ? "バランス" : "高性能";
	}
}

export function updateInterval() {
	const value = document.getElementById("update-interval").value;
	const intervalElem = document.getElementById("interval-value");
	if (intervalElem) {
		intervalElem.textContent = `${value}ms`;
	}
	console.log(`更新間隔: ${value}ms`);
}

export function updateMemoryLimit() {
	const value = document.getElementById("memory-limit").value;
	const memoryElem = document.getElementById("memory-value");
	if (memoryElem) {
		memoryElem.textContent = `${value}MB`;
	}
	console.log(`メモリ制限: ${value}MB`);
}

// グローバルスコープへ公開（HTMLインラインイベント対応）
globalThis.toggleTransparency = toggleTransparency;
globalThis.adjustOpacity = adjustOpacity;
globalThis.toggleAlwaysOnTop = toggleAlwaysOnTop;
globalThis.configureTopmost = configureTopmost;
globalThis.enableDragMode = enableDragMode;
globalThis.resetPosition = resetPosition;
globalThis.toggleSystemTray = toggleSystemTray;
globalThis.configureTray = configureTray;
globalThis.configureHotkeys = configureHotkeys;
globalThis.testHotkeys = testHotkeys;
globalThis.enableDesktopMonitoring = enableDesktopMonitoring;
globalThis.configureMonitoring = configureMonitoring;
globalThis.toggleStartup = toggleStartup;
globalThis.configureMultiMonitor = configureMultiMonitor;
globalThis.setPerformanceMode = setPerformanceMode;
globalThis.updateInterval = updateInterval;
globalThis.updateMemoryLimit = updateMemoryLimit;

// 初期化
document.addEventListener("DOMContentLoaded", () => {
	console.log("デスクトップ機能管理画面を初期化しました");
	updateStatusDisplay();
});
