/**
 * @file sakura-play-sync.js
 * @brief さくらスクリプト再生時の独立バルーンウィンドウ同期ヘルパー
 */
import { emit, isTauriAvailable } from "../core/tauri-helper.js";

/**
 * デスクトップ環境（Tauri）における独立バルーンウィンドウへのコンテンツ同期を管理します。
 * 同一ターン内の連続更新をまとめつつ、遅延なく同期イベントを発火します。
 */
export function createBalloonSyncManager(player, app, sakuraText, keroText) {
	const syncPendingScopes = new Set();
	let syncQueued = false;

	const flushDesktopBalloon = () => {
		syncQueued = false;
		if (syncPendingScopes.size > 0 && isTauriAvailable()) {
			for (const sc of syncPendingScopes) {
				emit(`update-balloon-content-${sc}`, {
					html: (sc === 1 ? keroText : sakuraText)?.innerHTML || "",
					theme: app.currentBalloonTheme || "default",
				});
			}
			syncPendingScopes.clear();
		}
	};

	const scheduleDesktopBalloonSync = (
		immediate = false,
		targetScope = null,
	) => {
		if (!isTauriAvailable()) return;
		const sc = targetScope ?? player.currentScope;
		syncPendingScopes.add(sc);
		if (immediate) {
			flushDesktopBalloon();
			return;
		}
		if (!syncQueued) {
			syncQueued = true;
			queueMicrotask(flushDesktopBalloon);
		}
	};

	return {
		flushDesktopBalloon,
		scheduleDesktopBalloonSync,
	};
}
