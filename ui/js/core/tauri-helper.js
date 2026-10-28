/**
 * Tauri API Helper
 * `@tauri-apps/api` の公式バインディングを使用しつつ、
 * Web/ブラウザ単体プレビュー時やフォールバック環境でも動作するようにラップします。
 */
import {
	convertFileSrc as tauriConvertFileSrc,
	invoke as tauriInvoke,
} from "@tauri-apps/api/core";
import {
	emit as tauriEmit,
	listen as tauriListen,
} from "@tauri-apps/api/event";
import { getCurrentWindow, PhysicalPosition } from "@tauri-apps/api/window";

/**
 * Tauri環境で動作しているかどうかを判定
 * @returns {boolean}
 */
export function isTauriAvailable() {
	return (
		typeof globalThis !== "undefined" &&
		(!!globalThis.__TAURI__ || !!globalThis.__TAURI_INTERNALS__)
	);
}

/**
 * IPC キュー統計管理（最大キュー数・同時保留数・警告検知）
 */
export const ipcQueueStats = {
	pendingCount: 0,
	peakPendingCount: 0,
	totalCalls: 0,
	reset() {
		this.pendingCount = 0;
		this.peakPendingCount = 0;
		this.totalCalls = 0;
	},
};

/**
 * Tauri IPCコマンドの呼び出しラッパー
 * @template T
 * @param {string} cmd - 実行するTauriコマンド名
 * @param {Record<string, any>} [args] - コマンド引数
 * @returns {Promise<T>}
 */
export async function invoke(cmd, args = {}) {
	if (!isTauriAvailable()) {
		throw new Error(`Tauri is not available to invoke command: ${cmd}`);
	}

	ipcQueueStats.totalCalls++;
	ipcQueueStats.pendingCount++;
	if (ipcQueueStats.pendingCount > ipcQueueStats.peakPendingCount) {
		ipcQueueStats.peakPendingCount = ipcQueueStats.pendingCount;
		console.log(
			`📊 [IPC Queue] 最大キュー数更新: ${ipcQueueStats.peakPendingCount} (直近実行: ${cmd}, 累積呼出: ${ipcQueueStats.totalCalls})`,
		);
	}

	// 多段階の警戒域アラート（100件: 軽度滞留 / 1000件: 重度滞留 / 5000件: 危険域・Win32クォータ枯渇寸前）
	if (ipcQueueStats.pendingCount === 100) {
		console.warn(
			`⚠️ [IPC Queue Alert] キュー軽度滞留 (100件到達): 直近実行=${cmd}, 最大記録=${ipcQueueStats.peakPendingCount}`,
		);
	} else if (ipcQueueStats.pendingCount === 1000) {
		console.warn(
			`🚨 [IPC Queue Warning] キュー重度滞留 (1000件到達): 直近実行=${cmd}, 最大記録=${ipcQueueStats.peakPendingCount}`,
		);
	} else if (ipcQueueStats.pendingCount === 5000) {
		console.error(
			`🔥 [IPC Queue CRITICAL] キュー危険域 (5000件到達 - Win32上限10,000件の50%): 直近実行=${cmd}, 最大記録=${ipcQueueStats.peakPendingCount}`,
		);
	}

	try {
		return await tauriInvoke(cmd, args);
	} finally {
		ipcQueueStats.pendingCount--;
	}
}

/**
 * ローカルファイルパスをアセットURLに変換
 * @param {string} filePath - ローカルパス
 * @param {string} [protocol] - プロトコル名 (デフォルト: 'asset')
 * @returns {string}
 */
export function convertFileSrc(filePath, protocol = "asset") {
	if (!filePath) return "";
	if (isTauriAvailable()) {
		return tauriConvertFileSrc(filePath, protocol);
	}
	// 相対パスまたはWeb URLはそのまま
	if (
		filePath.startsWith("http://") ||
		filePath.startsWith("https://") ||
		filePath.startsWith("asset://") ||
		filePath.startsWith("./") ||
		filePath.startsWith("/")
	) {
		return filePath;
	}
	// Windows絶対パスなどをフォールバック形式に変換
	const normalized = filePath.replace(/\\/g, "/");
	return `asset://localhost/${encodeURI(normalized)}`;
}

/**
 * イベントリスナー登録
 * @param {string} event
 * @param {(event: any) => void} handler
 * @returns {Promise<() => void>}
 */
export async function listen(event, handler) {
	if (!isTauriAvailable()) return () => {};
	return await tauriListen(event, handler);
}

/**
 * イベント発火
 * @param {string} event
 * @param {any} [payload]
 * @returns {Promise<void>}
 */
export async function emit(event, payload) {
	if (!isTauriAvailable()) return;
	await tauriEmit(event, payload);
}

/**
 * 現在のウィンドウのドラッグ移動を開始
 * @returns {Promise<void>}
 */
export async function startDraggingWindow() {
	if (!isTauriAvailable()) return;
	try {
		await getCurrentWindow().startDragging();
	} catch (err) {
		console.warn("startDraggingWindow failed:", err);
	}
}

/**
 * 現在のウィンドウを指定量だけ移動する。
 * ネイティブドラッグが WebView のイベント経路で失われる環境向けのフォールバック。
 * @param {number} x
 * @param {number} y
 * @param {{x: number, y: number}} origin
 * @returns {Promise<void>}
 */
export async function moveCurrentWindowBy(x, y, origin) {
	if (!isTauriAvailable()) return;
	try {
		await getCurrentWindow().setPosition(
			new PhysicalPosition(Math.round(origin.x + x), Math.round(origin.y + y)),
		);
	} catch (err) {
		console.warn("moveCurrentWindowBy failed:", err);
	}
}

/**
 * @returns {Promise<{x: number, y: number} | null>}
 */
export async function getCurrentWindowPosition() {
	if (!isTauriAvailable()) return null;
	try {
		const position = await getCurrentWindow().outerPosition();
		return { x: position.x, y: position.y };
	} catch (err) {
		console.warn("getCurrentWindowPosition failed:", err);
		return null;
	}
}

// 開発・診断用グローバルアクセス
if (typeof globalThis !== "undefined") {
	globalThis.__NANAI_IPC_QUEUE_STATS__ = ipcQueueStats;
}
