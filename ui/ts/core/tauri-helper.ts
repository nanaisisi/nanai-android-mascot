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
 */
export function isTauriAvailable(): boolean {
	const g = globalThis as unknown as Record<string, any>;
	const win =
		typeof window !== "undefined" ? window : (g.window as Record<string, any>);
	return (
		!!g.__TAURI__ ||
		!!g.__TAURI_INTERNALS__ ||
		!!g.__TAURI_IPC__ ||
		!!(
			win?.location &&
			((win.location as any).protocol?.startsWith("tauri") ||
				(win.location as any).hostname === "tauri.localhost" ||
				(win.location as any).hostname === "tauri.app")
		)
	);
}

/**
 * Android / モバイル環境かどうかを判定
 */
export function isAndroidMobile(): boolean {
	if (typeof navigator === "undefined") return false;
	return /Android|Mobile|Tablet/i.test(navigator.userAgent);
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
 */
export async function invoke<T = unknown>(
	cmd: string,
	args: Record<string, unknown> = {},
): Promise<T> {
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
 */
export function convertFileSrc(
	filePath: string | null | undefined,
	protocol: string = "asset",
): string {
	if (!filePath) return "";
	if (isTauriAvailable()) {
		return tauriConvertFileSrc(filePath, protocol);
	}
	if (
		filePath.startsWith("http://") ||
		filePath.startsWith("https://") ||
		filePath.startsWith("asset://") ||
		filePath.startsWith("./") ||
		filePath.startsWith("/")
	) {
		return filePath;
	}
	const normalized = filePath.replace(/\\/g, "/");
	return `asset://localhost/${encodeURI(normalized)}`;
}

/**
 * イベントリスナー登録
 */
export async function listen(
	event: string,
	handler: (event: unknown) => void,
): Promise<() => void> {
	if (!isTauriAvailable()) return () => {};
	return await tauriListen(event, handler);
}

/**
 * イベント発火
 */
export async function emit(event: string, payload?: unknown): Promise<void> {
	if (!isTauriAvailable()) return;
	await tauriEmit(event, payload);
}

/**
 * 現在のウィンドウのドラッグ移動を開始
 */
export async function startDraggingWindow(): Promise<void> {
	if (!isTauriAvailable()) return;
	try {
		getCurrentWindow()
			.startDragging()
			.catch((err) => {
				console.warn("startDraggingWindow failed:", err);
			});
	} catch (err) {
		console.warn("startDraggingWindow failed:", err);
	}
}

/**
 * 現在のウィンドウを指定量だけ移動する。
 */
export async function moveCurrentWindowBy(
	x: number,
	y: number,
	origin: { x: number; y: number },
): Promise<void> {
	if (!isTauriAvailable()) return;
	try {
		await getCurrentWindow().setPosition(
			new PhysicalPosition(Math.round(origin.x + x), Math.round(origin.y + y)),
		);
	} catch (err) {
		console.warn("moveCurrentWindowBy failed:", err);
	}
}

export async function getCurrentWindowPosition(): Promise<{
	x: number;
	y: number;
} | null> {
	if (!isTauriAvailable()) return null;
	try {
		const position = await getCurrentWindow().outerPosition();
		return { x: position.x, y: position.y };
	} catch (err) {
		console.warn("getCurrentWindowPosition failed:", err);
		return null;
	}
}

(globalThis as unknown as Record<string, unknown>).__NANAI_IPC_QUEUE_STATS__ =
	ipcQueueStats;
