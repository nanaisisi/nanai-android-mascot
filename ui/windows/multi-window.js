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
export function toggleGhostWindow() {
	const newState = !windowStates.ghost;
	updateWindowStatus("ghost", newState);

	if (newState) {
		console.log("ゴーストウィンドウを開きます...");
	} else {
		console.log("ゴーストウィンドウを閉じます...");
	}
}

export function configureGhostWindow() {
	alert(
		"ゴーストウィンドウ設定\n\n将来的な機能:\n• 透過度設定\n• フローティング位置\n• アニメーション設定\n• キャラクター選択",
	);
}

// 設定ウィンドウ制御
export function toggleSettingsWindow() {
	const newState = !windowStates.settings;
	updateWindowStatus("settings", newState);

	if (newState) {
		console.log("設定ウィンドウを開きます...");
	} else {
		console.log("設定ウィンドウを閉じます...");
	}
}

export function resetSettings() {
	if (confirm("設定をリセットしますか？")) {
		console.log("設定をリセットします...");
	}
}

// バルーンウィンドウ制御
export function testBalloonWindow() {
	console.log("バルーンテスト表示...");
	updateWindowStatus("balloon", true);

	setTimeout(() => {
		updateWindowStatus("balloon", false);
	}, 3000);

	alert(
		"バルーンテスト表示\n\n将来的な機能:\n• ゴースト連動位置\n• 自動消去タイマー\n• 音声再生連動",
	);
}

export function configureBalloon() {
	alert(
		"バルーン設定\n\n将来的な機能:\n• 表示時間設定\n• フォント・色設定\n• 位置調整\n• エフェクト設定",
	);
}

// YAYA連携制御
export function connectYAYA() {
	console.log("YAYA接続を試行します...");
	updateWindowStatus("yaya", true);

	setTimeout(() => {
		const success = Math.random() > 0.3;
		if (success) {
			alert(
				"YAYA接続成功！\n\n将来的な機能:\n• SHIORI DLL読み込み\n• リクエスト/レスポンス\n• エラーログ表示",
			);
		} else {
			updateWindowStatus("yaya", false);
			alert(
				"YAYA接続失敗\n\nデバッグ情報:\n• DLLファイルが見つかりません\n• 設定を確認してください",
			);
		}
	}, 1500);
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
