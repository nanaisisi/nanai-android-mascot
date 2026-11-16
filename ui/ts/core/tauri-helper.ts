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
	const g = globalThis as unknown as Record<string, unknown>;
	const win =
		typeof window !== "undefined"
			? window
			: (g.window as Window & { location?: Location; navigator?: Navigator });
	const loc = win?.location;
	const nav = win?.navigator;

	return (
		!!g.__TAURI__ ||
		!!g.__TAURI_INTERNALS__ ||
		!!g.__TAURI_IPC__ ||
		!!g.__TAURI_POST_MESSAGE__ ||
		typeof g.ipc === "function" ||
		typeof (g as any).rpc === "function" ||
		!!(nav?.userAgent && /Tauri/i.test(nav.userAgent)) ||
		!!(
			loc &&
			(loc.protocol?.startsWith("tauri") ||
				loc.hostname === "tauri.localhost" ||
				loc.hostname === "tauri.app")
		)
	);
}

/**
 * 静的コンパイル時確定: Windows / デスクトップ環境かどうかを判定
 */
export function isWindowsDesktop(): boolean {
	if (typeof __IS_WINDOWS__ !== "undefined") {
		return __IS_WINDOWS__;
	}
	if (typeof navigator !== "undefined" && navigator.userAgent) {
		return /Windows|Win32|Win64|x86_64|WOW64/i.test(navigator.userAgent);
	}
	return typeof process !== "undefined" && process.platform === "win32";
}

/**
 * 静的コンパイル時確定: Android / モバイル環境かどうかを判定
 */
export function isAndroidMobile(): boolean {
	if (typeof __IS_ANDROID__ !== "undefined") {
		return __IS_ANDROID__;
	}
	if (isWindowsDesktop()) return false;
	if (typeof navigator === "undefined" || !navigator.userAgent) return false;
	return /Android/i.test(navigator.userAgent);
}

/**
 * Windows ネイティブ透過マルチウィンドウ環境かどうかを判定
 */
export function isNativeMultiWindow(): boolean {
	return true;
}

/**
 * Android / Web ブラウザ仮想 Single Page UI 環境かどうかを判定
 */
export function isSinglePageUi(): boolean {
	return !isTauriAvailable() || isAndroidMobile();
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
		const { getHostBridge } = await import("./host-bridge.js");
		return await getHostBridge().invokeCommand<T>(cmd, args);
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
	if (isTauriAvailable() && typeof tauriConvertFileSrc === "function") {
		try {
			return tauriConvertFileSrc(filePath, protocol);
		} catch (_e) {}
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

/**
 * フロントエンド側のログをRustターミナル（stdout/stderr）に転送する
 */
export function frontendLog(message: string, level = "info") {
	console.log(`[Frontend Log] ${message}`);
	if (isTauriAvailable()) {
		void invoke("log_from_frontend", { message, level }).catch(() => {});
	}
}

(globalThis as unknown as Record<string, unknown>).__NANAI_IPC_QUEUE_STATS__ =
	ipcQueueStats;
